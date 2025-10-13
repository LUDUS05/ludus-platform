from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
import os
import uuid
import json
import redis
from datetime import datetime


class AgentBlueprintType(str, Enum):
    """Blueprint presets the generator can scaffold."""
    ui_ux = "ui_ux"
    fullstack = "fullstack"
    debugging = "debugging"
    search = "search"
    vendor = "vendor"
    booking = "booking"
    custom = "custom"


class AgentIO(BaseModel):
    """Request/response model names and endpoints to expose in the new agent."""
    request_model_name: str = Field(..., description="Name of Pydantic request model")
    response_model_name: str = Field(..., description="Name of Pydantic response model")
    endpoints: List[str] = Field(default_factory=list, description="REST endpoints to expose")


class CreateAgentSpec(BaseModel):
    """Specification for generating a new agent module."""
    agent_name: str = Field(..., min_length=3, pattern="^[a-zA-Z_][a-zA-Z0-9_]*$")
    agent_title: Optional[str] = None
    description: Optional[str] = None
    blueprint: AgentBlueprintType = AgentBlueprintType.custom
    io: Optional[AgentIO] = None
    write_to_fs: bool = True
    register_routes: bool = True

    @validator("agent_title", always=True)
    def _default_title(cls, v, values):
        return v or values["agent_name"].replace("_", " ").title()


class CreateAgentResponse(BaseModel):
    request_id: str
    file_path: str
    added_routes: List[str]
    message: str
    instructions: List[str]
    code_preview: str


class AgentsCreationAgent:
    """Meta-agent that scaffolds new specialized agents.

    It generates a minimal FastAPI router module under agents/api/{agent_name}_agent.py
    with a POST /process endpoint and a GET /requests/{request_id} endpoint.
    """

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client

    def _target_file(self, name: str) -> str:
        return os.path.join(os.path.dirname(__file__), f"{name}_agent.py")

    def _common_header(self, spec: CreateAgentSpec) -> str:
        return (
            "from fastapi import APIRouter, HTTPException\n"
            "from pydantic import BaseModel\n"
            "import os, uuid, json, redis\n"
            "from typing import Optional, Dict, Any\n"
            "from datetime import datetime\n\n"
            f"router = APIRouter(prefix=\"/{spec.agent_name}\", tags=[\"{spec.agent_title}\"])\n\n"
            "REDIS_URL = os.environ.get(\"REDIS_URL\")\n"
            "redis_client = redis.from_url(REDIS_URL) if REDIS_URL else None\n"
        )

    def _models_block(self, spec: CreateAgentSpec) -> str:
        title_compact = spec.agent_title.replace(" ", "")
        io = spec.io or AgentIO(
            request_model_name=f"{title_compact}Request",
            response_model_name=f"{title_compact}Response",
            endpoints=[f"/{spec.agent_name}/process"],
        )
        return (
            f"\nclass {io.request_model_name}(BaseModel):\n"
            "\tpayload: str\n"
            "\tlanguage: str = \"en\"\n"
            "\tmeta: Optional[Dict[str, Any]] = None\n\n"
            f"class {io.response_model_name}(BaseModel):\n"
            "\trequest_id: str\n"
            "\tstatus: str\n"
            "\tresult: Dict[str, Any]\n"
            "\tcreated_at: str\n"
        )

    def _logic_block(self, spec: CreateAgentSpec) -> str:
        title_compact = spec.agent_title.replace(" ", "")
        if spec.blueprint == AgentBlueprintType.ui_ux:
            process_line = '{"design":"Generated UI/UX blueprint","notes":"RTL/LTR,a11y,responsive"}'
        elif spec.blueprint == AgentBlueprintType.fullstack:
            process_line = '{"code":"Generated API and component stubs","tech":["react","node"]}'
        elif spec.blueprint == AgentBlueprintType.debugging:
            process_line = '{"analysis":"Root cause hypothesis","fix":"Proposed patch"}'
        elif spec.blueprint == AgentBlueprintType.search:
            process_line = '{"query_plan":"Search indexing and ranking plan"}'
        elif spec.blueprint == AgentBlueprintType.vendor:
            process_line = '{"integration":"Vendor onboarding flow"}'
        elif spec.blueprint == AgentBlueprintType.booking:
            process_line = '{"flow":"Booking availability + confirmation"}'
        else:
            process_line = '{"message":"Generic agent executed"}'

        return (
            "\n"
            "def _store(redis_client, key: str, data: Dict[str, Any]) -> None:\n"
            "\tif not redis_client:\n"
            "\t\treturn\n"
            "\tredis_client.set(key, json.dumps(data), ex=60*60*24)\n\n"
            "def _now():\n"
            "\treturn datetime.utcnow().isoformat()+\"Z\"\n\n"
            f"@router.post(\"/process\")\n"
            f"def process(req: {title_compact}Request) -> {title_compact}Response:\n"
            "\trequest_id = str(uuid.uuid4())\n"
            f"\tresult = {process_line}\n"
            "\trecord = {\n"
            "\t\t\"request_id\": request_id,\n"
            "\t\t\"status\": \"completed\",\n"
            "\t\t\"result\": result,\n"
            "\t\t\"created_at\": _now()\n"
            "\t}\n"
            f"\t_store(redis_client, f\"{spec.agent_name}:{{request_id}}\", record)\n"
            f"\treturn {title_compact}Response(**record)\n\n"
            f"@router.get(\"/requests/{{request_id}}\")\n"
            "def get_request(request_id: str):\n"
            f"\tkey = f\"{spec.agent_name}:{{request_id}}\"\n"
            "\tif not redis_client:\n"
            "\t\treturn {\"error\":\"Redis not configured\"}\n"
            "\traw = redis_client.get(key) if redis_client else None\n"
            "\tif not raw:\n"
            "\t\traise HTTPException(status_code=404, detail=\"Request not found\")\n"
            "\treturn json.loads(raw)\n"
        )

    def _compose(self, spec: CreateAgentSpec) -> str:
        return self._common_header(spec) + self._models_block(spec) + self._logic_block(spec)

    def create_agent(self, spec: CreateAgentSpec) -> CreateAgentResponse:
        code = self._compose(spec)
        target = self._target_file(spec.agent_name) if spec.write_to_fs else f"{spec.agent_name}_agent.py"
        if spec.write_to_fs:
            with open(target, "w", encoding="utf-8") as f:
                f.write(code)

        request_id = str(uuid.uuid4())
        if self.redis:
            try:
                self.redis.set(
                    f"agents_creator:{request_id}",
                    json.dumps({"spec": spec.dict(), "file": target}),
                    ex=60 * 60,
                )
            except Exception:
                pass

        instructions = [
            f"Import in main: from agents.api.{spec.agent_name}_agent import router as {spec.agent_name}_router",
            f"Include router: app.include_router({spec.agent_name}_router)",
            "Restart the API process",
        ]

        return CreateAgentResponse(
            request_id=request_id,
            file_path=target,
            added_routes=[f"/{spec.agent_name}/process", f"/{spec.agent_name}/requests/{{request_id}}"],
            message=f"Agent '{spec.agent_title}' generated",
            instructions=instructions,
            code_preview=code[:1200],
        )


