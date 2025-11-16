// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from './src/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { LocalStorage } from 'node-localstorage';
import fs from 'fs';

// Polyfill localStorage for server-side rendering
const localStoragePath = './.tmp/localStorage';
if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}
(globalThis as any).localStorage = new LocalStorage(localStoragePath);

const dev = process.env.NODE_ENV !== 'production';
const currentPort = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || '127.0.0.1';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Gracefully handle server errors like EADDRINUSE
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${currentPort} is already in use.`);
        console.error('Please stop the other process or change the port.');
        process.exit(1);
      } else {
        throw err;
      }
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
