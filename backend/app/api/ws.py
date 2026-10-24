from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.jwt import decode_access_token
from app.services.realtime import hub

router = APIRouter()


@router.websocket("/budget")
async def budget_socket(websocket: WebSocket, ticket: str = Query(...)):
    payload = decode_access_token(ticket)
    if not payload or payload.get("type") != "ws" or not payload.get("sub"):
        await websocket.close(code=4401)
        return
    user_id = str(payload["sub"])
    await hub.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hub.disconnect(user_id, websocket)
