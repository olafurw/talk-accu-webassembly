from http.server import HTTPServer, SimpleHTTPRequestHandler

# allows streaming compilation to work
SimpleHTTPRequestHandler.extensions_map['.wasm'] = 'application/wasm'

port = 8004
httpd = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
print(f'Serving at http://localhost:{port}')
httpd.serve_forever()
