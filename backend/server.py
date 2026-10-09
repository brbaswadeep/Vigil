import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from data_loader import load_nomad_data
from engine import ReplayEngine
import os
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Global state
root_dir = Path(__file__).parent.parent
events = load_nomad_data(os.path.join(root_dir, 'raw-data'))
engine = ReplayEngine(events)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial status
        await websocket.send_json({"type": "status", "isPlaying": engine.is_playing, "speed": engine.speed})
        while True:
            data = await websocket.receive_json()
            if "action" in data:
                action = data["action"]
                if action == "play":
                    engine.is_playing = True
                elif action == "pause":
                    engine.is_playing = False
                elif action == "reset":
                    engine = ReplayEngine(events) # reset
                    await manager.broadcast({"type": "status", "isPlaying": False, "speed": 1.0})
                elif action == "speed":
                    engine.speed = float(data.get("value", 1.0))
                
                await manager.broadcast({"type": "status", "isPlaying": engine.is_playing, "speed": engine.speed})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def game_loop():
    global engine
    while True:
        if engine.is_playing and engine.current_index < len(engine.events):
            event = engine.events[engine.current_index]
            
            # Fast-forward simulation logic
            # Normally we wait based on clock_ts, but for a data cruncher, we can just pump events
            # Let's just process the event immediately for demonstration, scaled by speed
            
            alert = engine.process_event(event)
            
            await manager.broadcast({
                "type": "event",
                "data": event
            })
            
            if alert:
                await manager.broadcast({
                    "type": "alert",
                    "data": alert
                })
                
            engine.current_index += 1
            
            # Send clock sync every 10 events
            if engine.current_index % 10 == 0:
                await manager.broadcast({"type": "clock", "time": event['ts']})
                
            # Yield control
            await asyncio.sleep(0.01 / max(1, engine.speed))
        else:
            await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
