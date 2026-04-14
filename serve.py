import http.server, socketserver, os
os.chdir('/Users/enricoferrante/Desktop/STW')
handler = http.server.SimpleHTTPRequestHandler
port = int(os.environ.get('PORT', 8002))
with socketserver.TCPServer(("", port), handler) as httpd:
    print(f'Dashboard Hub on http://localhost:{port}')
    httpd.serve_forever()
