import os, sys, http.server, socketserver
os.chdir(os.path.join(os.path.dirname(os.path.abspath(sys.argv[0] if sys.argv[0] else __file__))))
port = int(os.environ.get('PORT', 8001))
with socketserver.TCPServer(('', port), http.server.SimpleHTTPRequestHandler) as s:
    print(f'Serving on port {port}')
    s.serve_forever()
