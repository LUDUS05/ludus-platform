from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
from notion_client import Client


router = APIRouter(prefix="/notion-pm", tags=["Notion Project Manager"])


class NotionConfig(BaseModel):
    token: Optional[str] = Field(default=None, description="Notion integration token")
    database_id: Optional[str] = Field(default=None, description="Target Notion database ID for tasks")


class CreateTaskRequest(BaseModel):
    title: str
    status: Optional[str] = "To Do"
    assignee: Optional[str] = None  # Notion person email (optional)
    due_date: Optional[str] = None  # ISO date
    properties: Dict[str, Any] = {}
    config: Optional[NotionConfig] = None


class UpdateTaskRequest(BaseModel):
    page_id: str
    properties: Dict[str, Any]
    config: Optional[NotionConfig] = None


class QueryTasksRequest(BaseModel):
    filter: Optional[Dict[str, Any]] = None
    sorts: Optional[List[Dict[str, Any]]] = None
    page_size: int = 10
    config: Optional[NotionConfig] = None


def get_client(cfg: Optional[NotionConfig]) -> Client:
    token = (cfg.token if cfg and cfg.token else os.environ.get("NOTION_TOKEN"))
    if not token:
        raise HTTPException(status_code=400, detail="Notion token missing. Provide in request or set NOTION_TOKEN env var.")
    return Client(auth=token)


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/tasks")
def create_task(req: CreateTaskRequest):
    database_id = req.config.database_id if req.config and req.config.database_id else os.environ.get("NOTION_TASKS_DATABASE_ID")
    if not database_id:
        raise HTTPException(status_code=400, detail="Notion database_id missing. Provide in request or set NOTION_TASKS_DATABASE_ID env var.")

    client = get_client(req.config)

    # Basic properties: adjust to your DB schema
    properties = {
        "Name": {"title": [{"text": {"content": req.title}}]},
    }
    if req.status:
        properties["Status"] = {"select": {"name": req.status}}
    if req.due_date:
        properties["Due Date"] = {"date": {"start": req.due_date}}
    # Merge custom properties
    properties.update(req.properties or {})

    try:
        page = client.pages.create(parent={"database_id": database_id}, properties=properties)
        return {"page_id": page.get("id"), "url": page.get("url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tasks/query")
def query_tasks(req: QueryTasksRequest):
    database_id = req.config.database_id if req.config and req.config.database_id else os.environ.get("NOTION_TASKS_DATABASE_ID")
    if not database_id:
        raise HTTPException(status_code=400, detail="Notion database_id missing. Provide in request or set NOTION_TASKS_DATABASE_ID env var.")

    client = get_client(req.config)
    try:
        result = client.databases.query(database_id=database_id, filter=req.filter, sorts=req.sorts, page_size=req.page_size)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/tasks")
def update_task(req: UpdateTaskRequest):
    client = get_client(req.config)
    try:
        page = client.pages.update(page_id=req.page_id, properties=req.properties)
        return {"page_id": page.get("id"), "url": page.get("url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


