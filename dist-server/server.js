"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts - Next.js Standalone + Socket.IO
const socket_ts_1 = require("./src/lib/socket.ts");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = require("next");
const dev = process.env.NODE_ENV !== 'production';
const currentPort = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || '0.0.0.0';
// Custom server with Socket.IO integration
async function createCustomServer() {
    try {
        // Create Next.js app
        const nextApp = (0, next_1.default)({
            dev
        });
        await nextApp.prepare();
        const handle = nextApp.getRequestHandler();
        // Create HTTP server that will handle both Next.js and Socket.IO
        const server = (0, http_1.createServer)((req, res) => {
            var _a;
            // Skip socket.io requests from Next.js handler
            if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/api/socketio')) {
                return;
            }
            handle(req, res);
        });
        // Gracefully handle server errors like EADDRINUSE
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Error: Port ${currentPort} is already in use.`);
                console.error('Please stop the other process or change the port.');
                process.exit(1);
            }
            else {
                throw err;
            }
        });
        // Setup Socket.IO
        const io = new socket_io_1.Server(server, {
            path: '/api/socketio',
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        (0, socket_ts_1.setupSocket)(io);
        // Start the server
        server.listen(currentPort, hostname, () => {
            console.log(`> Ready on http://${hostname}:${currentPort}`);
            console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
        });
    }
    catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
}
// Start the server
createCustomServer();
