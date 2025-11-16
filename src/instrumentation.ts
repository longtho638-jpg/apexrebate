export async function register() {
  // This code runs once on the server when the app starts.
  // We only want to start the custom server in production,
  // as in development, we run it manually via `npm run dev`.
  // DEACTIVATED FOR BUILD: The custom server import is temporarily disabled.
  // Importing a Node.js server here causes Next.js to bundle server-only modules (http, crypto) for the client, failing the build.
  // The long-term solution is to run the Socket.IO server as a separate process, completely decoupled from the Next.js build pipeline.
  console.log('[instrumentation] register called. Custom server start is disabled.');
}