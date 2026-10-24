import asyncio
import json
from collections import defaultdict

from fastapi import WebSocket

from app.core.config import settings


class ConnectionHub:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = defaultdict(set)
        self.loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[user_id].add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        self.connections[user_id].discard(websocket)

    async def send(self, user_id: str, message: dict) -> None:
        dead = []
        for socket in list(self.connections.get(str(user_id), set())):
            try:
                await socket.send_json(message)
            except Exception:
                dead.append(socket)
        for socket in dead:
            self.disconnect(str(user_id), socket)

    def publish_local(self, user_id: str, message: dict) -> None:
        if not self.loop:
            return
        asyncio.run_coroutine_threadsafe(self.send(str(user_id), message), self.loop)


hub = ConnectionHub()


def notify_user(user_id, message: dict) -> None:
    published = False
    if settings.redis_url:
        try:
            import redis

            redis.Redis.from_url(settings.redis_url, socket_connect_timeout=0.3).publish(
                f"spendsmart:user:{user_id}",
                json.dumps(message, default=str),
            )
            published = True
        except Exception:
            published = False
    if not published:
        hub.publish_local(str(user_id), message)


async def listen_redis(stop: asyncio.Event) -> None:
    if not settings.redis_url:
        return
    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.redis_url)
        pubsub = client.pubsub()
        await pubsub.psubscribe("spendsmart:user:*")
        while not stop.is_set():
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if not message or message.get("type") not in ("pmessage", "message"):
                continue
            channel = message["channel"]
            data = message["data"]
            if isinstance(channel, bytes):
                channel = channel.decode()
            if isinstance(data, bytes):
                data = data.decode()
            user_id = channel.rsplit(":", 1)[-1]
            await hub.send(user_id, json.loads(data))
        await pubsub.close()
        await client.close()
    except Exception as exc:
        print(f"Redis listener unavailable: {exc}")
