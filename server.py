import os
import sys
import json
import mimetypes
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Custom MIME types
MIME_MAP = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".ico": "image/x-icon",
    ".ts": "text/plain; charset=utf-8",
}

class GenzHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format, *args):
        # Clean logging format
        print(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/contact":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                print(f"[CONTACT FORM] Received message from {data.get('name')} <{data.get('email')}>: {data.get('message')}")
            except Exception as e:
                print(f"[CONTACT FORM] Error parsing json: {e}")

            resp_body = json.dumps({"status": "ok", "message": "Thank you! Your inquiry has been received."}).encode("utf-8")
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
            return

        self.send_error(404, "Not Found")

    def do_GET(self):
        self.handle_request(send_body=True)

    def do_HEAD(self):
        self.handle_request(send_body=False)

    def handle_request(self, send_body=True):
        parsed = urllib.parse.urlparse(self.path)
        raw_path = urllib.parse.unquote(parsed.path)

        # Handle API routes
        if raw_path == "/api/slots":
            slots_file = os.path.join(DIRECTORY, "api", "slots.json")
            if os.path.exists(slots_file):
                with open(slots_file, "rb") as f:
                    content = f.read()
            else:
                content = json.dumps({"slots": []}).encode("utf-8")

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            if send_body:
                self.wfile.write(content)
            return

        # Map root to index.html
        if raw_path in ["", "/"]:
            local_rel = "index.html"
        else:
            local_rel = raw_path.lstrip("/")

        file_path = os.path.join(DIRECTORY, local_rel)

        # Check if file exists, if not check for index.html in dir
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, "index.html")

        # Fallback for .hevc.mp4 to standard .mp4
        if file_path.endswith('.hevc.mp4') and not os.path.exists(file_path):
            fallback_mp4 = file_path[:-9] + '.mp4'
            if os.path.exists(fallback_mp4):
                file_path = fallback_mp4

        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            self.send_response(404)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            msg = f"404 Not Found: {raw_path}".encode("utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            if send_body:
                self.wfile.write(msg)
            return

        # Determine MIME type
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        content_type = MIME_MAP.get(ext, mimetypes.guess_type(file_path)[0] or "application/octet-stream")

        file_size = os.path.getsize(file_path)
        range_header = self.headers.get("Range")

        # Range request support (crucial for video streaming/scrubbing)
        if range_header:
            range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
            if range_match:
                start = int(range_match.group(1))
                end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
                if start >= file_size or end >= file_size or start > end:
                    self.send_response(416) # Range Not Satisfiable
                    self.send_header("Content-Range", f"bytes */{file_size}")
                    self.end_headers()
                    return

                length = end - start + 1
                self.send_response(206)
                self.send_cors_headers()
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()

                if send_body:
                    with open(file_path, "rb") as f:
                        f.seek(start)
                        remaining = length
                        while remaining > 0:
                            chunk_size = min(64 * 1024, remaining)
                            buf = f.read(chunk_size)
                            if not buf:
                                break
                            self.wfile.write(buf)
                            remaining -= len(buf)
                return

        # Standard 200 response
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        if ext in [".woff2", ".ttf", ".glb", ".bin", ".webp", ".jpg", ".png", ".mp4"]:
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.end_headers()

        if send_body:
            with open(file_path, "rb") as f:
                while True:
                    buf = f.read(64 * 1024)
                    if not buf:
                        break
                    self.wfile.write(buf)

def run(port=PORT):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, GenzHandler)
    print(f"🚀 genzwebdeveloper Localhost Server running at http://localhost:{port}/ and http://0.0.0.0:{port}/")
    print(f"📁 Serving directory: {DIRECTORY}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(p)
