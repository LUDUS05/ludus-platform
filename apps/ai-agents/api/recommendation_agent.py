from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os, uuid, json, redis
from typing import Optional, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/recommendation", tags=["Recommendation Agent"])

REDIS_URL = os.environ.get("REDIS_URL")
redis_client = redis.from_url(REDIS_URL) if REDIS_URL else None

class RecommendationRequest(BaseModel):
	payload: str
	language: str = "en"
	meta: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
	request_id: str
	status: str
	result: Dict[str, Any]
	created_at: str

def _store(redis_client, key: str, data: Dict[str, Any]) -> None:
	if not redis_client:
		return
	redis_client.set(key, json.dumps(data), ex=60*60*24)

def _now():
	return datetime.utcnow().isoformat()+"Z"

@router.post("/process")
def process(req: RecommendationRequest) -> RecommendationResponse:
	request_id = str(uuid.uuid4())
	result = {"message":"Generic agent executed"}
	record = {
		"request_id": request_id,
		"status": "completed",
		"result": result,
		"created_at": _now()
	}
	_store(redis_client, f"recommendation:{request_id}", record)
	return RecommendationResponse(**record)

@router.get("/requests/{request_id}")
def get_request(request_id: str):
	key = f"recommendation:{request_id}"
	if not redis_client:
		return {"error":"Redis not configured"}
	raw = redis_client.get(key) if redis_client else None
	if not raw:
		raise HTTPException(status_code=404, detail="Request not found")
	return json.loads(raw)
