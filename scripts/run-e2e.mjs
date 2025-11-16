import net from 'node:net';
import { spawn } from 'node:child_process';

const DEV_PORT = 3000;
const DEV_HOST = process.env.HOST || '127.0.0.1';

async function waitForPort(port, host, timeout = 30000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      await new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.once('connect', () => {
          socket.destroy();
          resolve(null);
        });

        socket.once('error', (err) => {
          socket.destroy();
          reject(err);
        });

        socket.once('timeout', () => {
          socket.destroy();
          reject(new Error('timeout'));
        });

        socket.connect(port, host);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Timeout waiting for server at ${host}:${port}`);
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev:e2e'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      HOST: DEV_HOST,
      PORT: String(DEV_PORT)
    }
  });

  child.on('error', (err) => {
    console.error('[e2e] Failed to start dev server:', err);
    process.exit(1);
  });

  return child;
}

function shutdown(child) {
  if (!child) return;
  if (!child.killed) {
    child.kill('SIGINT');
  }
}

async function run() {
  if (process.env.SKIP_E2E === '1') {
    console.log('[e2e] SKIP_E2E=1 → skipping Playwright tests');
    process.exit(0);
  }

  const devServer = startDevServer();

  // Ensure dev server + test child are cleaned up on exit signals
  let testRunner;
  const cleanup = () => {
    shutdown(devServer);
    shutdown(testRunner);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  try {
    await waitForPort(DEV_PORT, DEV_HOST);
  } catch (error) {
    console.error(error);
    shutdown(devServer);
    process.exit(1);
    return;
  }

  const child = spawn('npx', ['playwright', 'test'], {
    stdio: 'inherit',
    shell: true
  });
  testRunner = child;

  child.on('close', (code) => {
    shutdown(devServer);
    process.exit(code ?? 1);
  });
}

run();
