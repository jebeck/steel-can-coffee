#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer

try:
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    class MyTCPServer(SocketServer.TCPServer):
        allow_reuse_address = True
    server = MyTCPServer(('0.0.0.0', 8081), Handler)

    server.serve_forever()
except KeyboardInterrupt:
    pass