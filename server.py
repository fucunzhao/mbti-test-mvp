"""
MBTI 16型人格情景测试 MVP - 后端服务
运行: python3 server.py
访问: http://localhost:8000
"""
import json, os, sqlite3, hashlib, secrets
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR", BASE / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "mbti_records.db"
PORT = int(os.environ.get("PORT", 8000))

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT DEFAULT '',
                type TEXT NOT NULL,
                ei TEXT, sn TEXT, tf TEXT, jp TEXT,
                ei_score INTEGER, sn_score INTEGER,
                tf_score INTEGER, jp_score INTEGER,
                mode TEXT DEFAULT 'quick',
                answers TEXT DEFAULT '[]',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
init_db()

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/records':
            self.send_json(self.get_records())
        elif self.path.startswith('/api/records/'):
            rid = self.path.split('/')[-1]
            self.send_json(self.get_record(rid))
        else:
            super().do_GET()

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        if self.path == '/api/records':
            self.save_record(body)
        else:
            self.send_error(404)

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

    def get_records(self):
        with sqlite3.connect(DB_PATH) as conn:
            rows = conn.execute(
                "SELECT id, name, type, mode, created_at FROM records ORDER BY id DESC LIMIT 50"
            ).fetchall()
            return [dict(r) for r in rows]

    def get_record(self, rid):
        with sqlite3.connect(DB_PATH) as conn:
            row = conn.execute("SELECT * FROM records WHERE id=?", (rid,)).fetchone()
            return dict(row) if row else {"error": "not found"}

    def save_record(self, body):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                INSERT INTO records (name, type, ei, sn, tf, jp, ei_score, sn_score, tf_score, jp_score, mode, answers)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                body.get('name',''), body.get('type',''),
                body.get('ei'), body.get('sn'), body.get('tf'), body.get('jp'),
                body.get('ei_score'), body.get('sn_score'),
                body.get('tf_score'), body.get('jp_score'),
                body.get('mode','quick'), json.dumps(body.get('answers',[]), ensure_ascii=False)
            ))
            rid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        self.send_json({"id": rid, "status": "ok"})

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f"  MBTI测试服务已启动: http://localhost:{PORT}")
    print(f"  API接口: http://localhost:{PORT}/api/records")
    print(f"  按 Ctrl+C 停止服务")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
