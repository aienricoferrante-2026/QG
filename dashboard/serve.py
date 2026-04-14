import os, http.server, socketserver
os.chdir(os.path.dirname(os.path.abspath(__file__)))
port = int(os.environ.get('PORT', 8080))
with socketserver.TCPServer(('', port), http.server.SimpleHTTPRequestHandler) as s:
    print(f'Serving on port {port}')
    s.serve_forever()
