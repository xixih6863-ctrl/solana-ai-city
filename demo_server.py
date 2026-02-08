#!/usr/bin/env python3
"""
Solana AI City - Web Demo
Can run in any browser with Python backend
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import time
import random
from urllib.parse import urlparse, parse_qs
import socketserver

# Game State
game_state = {
    "cities": {},
    "resources": {},
    "leaderboard": []
}

# Resource templates
RESOURCES = {
    "gold": {"emoji": "💰", "name": "Gold"},
    "wood": {"emoji": "🪵", "name": "Wood"},
    "stone": {"emoji": "🪨", "name": "Stone"},
    "food": {"emoji": "🍎", "name": "Food"},
    "energy": {"emoji": "⚡", "name": "Energy"},
}

BUILDINGS = {
    "house": {"emoji": "🏠", "name": "House", "cost": {"gold": 100, "wood": 50, "stone": 25}, "production": {}, "bonus": {"population": 50}},
    "farm": {"emoji": "🌾", "name": "Farm", "cost": {"gold": 50, "wood": 100, "stone": 0}, "production": {"food": 10}, "bonus": {"population": 10}},
    "mine": {"emoji": "⛏️", "name": "Mine", "cost": {"gold": 200, "wood": 50, "stone": 100}, "production": {"gold": 5, "stone": 10}, "bonus": {}},
    "lumber_mill": {"emoji": "🪚", "name": "Lumber Mill", "cost": {"gold": 100, "wood": 50, "stone": 25}, "production": {"wood": 15}, "bonus": {}},
    "power_plant": {"emoji": "⚡", "name": "Power Plant", "cost": {"gold": 300, "wood": 100, "stone": 150}, "production": {"energy": 20}, "bonus": {}},
    "factory": {"emoji": "🏭", "name": "Factory", "cost": {"gold": 500, "wood": 250, "stone": 200}, "production": {"gold": 15}, "bonus": {}},
}

class GameHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/game/state":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(game_state).encode())
            return
        
        elif self.path == "/api/resources":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(RESOURCES).encode())
            return
        
        elif self.path == "/api/buildings":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(BUILDINGS).encode())
            return
        
        elif self.path == "/api/leaderboard":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            # Sort by score
            sorted_cities = sorted(game_state["cities"].values(), key=lambda x: x["score"], reverse=True)[:10]
            self.wfile.write(json.dumps(sorted_cities).encode())
            return
        
        # Serve static files
        elif self.path == "/":
            self.path = "/index.html"
        
        return SimpleHTTPRequestHandler.do_GET(self)
    
    def do_POST(self):
        if self.path == "/api/game/create_city":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            city_id = data.get("address", f"city_{random.randint(1000,9999)}")
            
            # Create new city
            game_state["cities"][city_id] = {
                "id": city_id,
                "owner": data.get("address", "anonymous"),
                "name": data.get("name", "My City"),
                "level": 1,
                "population": 100,
                "resources": {
                    "gold": 1000,
                    "wood": 500,
                    "stone": 250,
                    "food": 1000,
                    "energy": 500,
                },
                "buildings": [],
                "score": 100,
                "ai_level": data.get("ai_level", 1),
                "strategy": data.get("strategy", "balanced"),
                "created_at": int(time.time()),
            }
            
            game_state["resources"][city_id] = game_state["cities"][city_id]["resources"]
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "city_id": city_id}).encode())
            return
        
        elif self.path == "/api/game/build":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            city_id = data.get("city_id")
            building_type = data.get("building_type")
            
            if city_id not in game_state["cities"]:
                self.send_response(404)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "City not found"}).encode())
                return
            
            city = game_state["cities"][city_id]
            cost = BUILDINGS[building_type]["cost"]
            
            # Check resources
            for resource, amount in cost.items():
                if city["resources"].get(resource, 0) < amount:
                    self.send_response(400)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Insufficient {resource}"}).encode())
                    return
            
            # Deduct resources
            for resource, amount in cost.items():
                city["resources"][resource] -= amount
            
            # Add building
            building = {
                "id": f"building_{random.randint(10000, 99999)}",
                "type": building_type,
                "level": 1,
                "emoji": BUILDINGS[building_type]["emoji"],
            }
            city["buildings"].append(building)
            
            # Update population
            bonus = BUILDINGS[building_type]["bonus"]
            city["population"] += bonus.get("population", 0)
            
            # Update score
            city["score"] += 10
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "city": city}).encode())
            return
        
        elif self.path == "/api/game/tick":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            city_id = data.get("city_id")
            
            if city_id not in game_state["cities"]:
                self.send_response(404)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "City not found"}).encode())
                return
            
            city = game_state["cities"][city_id]
            ai_bonus = 1 + (city["ai_level"] * 0.1)
            
            # Calculate production
            production = {"gold": 0, "wood": 0, "stone": 0, "food": 0, "energy": 0}
            
            for building in city["buildings"]:
                building_type = building["type"]
                if building_type in BUILDINGS:
                    for resource, amount in BUILDINGS[building_type]["production"].items():
                        production[resource] += int(amount * ai_bonus)
            
            # Update resources
            for resource, amount in production.items():
                city["resources"][resource] += amount
            
            # Population growth
            if city["resources"]["food"] > city["population"] * 2:
                growth = int(city["population"] * 0.05 * ai_bonus)
            else:
                growth = int(city["population"] * 0.02)
            
            city["population"] += growth
            
            # Update score
            city["score"] += int(city["population"] / 100)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "city": city, "production": production}).encode())
            return

def run_demo(port=8080):
    """Run the game demo server"""
    port = int(port)
    server = HTTPServer(("0.0.0.0", port), GameHandler)
    
    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║          🏙️  Solana AI City - Demo Server Started!           ║
╠══════════════════════════════════════════════════════════════════╣
║  🚀 Server running at: http://localhost:{port}                ║
║  📊 API Endpoints:                                          ║
║     - GET  /api/game/state   - Get game state               ║
║     - GET  /api/resources   - Get resources                 ║
║     - GET  /api/buildings   - Get buildings                ║
║     - GET  /api/leaderboard - Get leaderboard              ║
║     - POST /api/game/create_city - Create city              ║
║     - POST /api/game/build   - Build structure             ║
║     - POST /api/game/tick    - Process game cycle          ║
╠══════════════════════════════════════════════════════════════════╣
║  💡 Try these curl commands:                                 ║
║                                                             ║
║  # Create a city                                            ║
║  curl -X POST http://localhost:{port}/api/game/create_city   ║
║    -H "Content-Type: application/json"                     ║
║    -d '{{"name": "My City", "address": "player1"}}'       ║
║                                                             ║
║  # Build a house                                           ║
║  curl -X POST http://localhost:{port}/api/game/build        ║
║    -H "Content-Type: application/json"                     ║
║    -d '{{"city_id": "<CITY_ID>", "building_type": "house"}}'║
║                                                             ║
║  # Process game tick                                       ║
║  curl -X POST http://localhost:{port}/api/game/tick         ║
║    -H "Content-Type: application/json"                     ║
║    -d '{{"city_id": "<CITY_ID>"}}'                        ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        server.server_close()

if __name__ == "__main__":
    import sys
    port = sys.argv[1] if len(sys.argv) > 1 else "8080"
    run_demo(port)
