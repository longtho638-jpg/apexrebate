/**
 * Cloudflare Worker Agentic
 * Edge computing with Kimi K2 agent integration
 */

export interface Env {
  KV: KVNamespace;
  KIMI_API_KEY: string;
  ENVIRONMENT: string;
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Route: GET /
    if (pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          message: "🚀 Welcome to {{PROJECT_NAME}}",
          description: "Cloudflare Worker Agentic from Relay Factory",
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Route: GET /api/health
    if (pathname === "/api/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          region: request.cf?.colo || "unknown",
          timestamp: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Route: POST /api/analyze
    if (pathname === "/api/analyze" && request.method === "POST") {
      const body = await request.json<{ text: string }>();

      // Here you would call Kimi K2 agent
      // const analysis = await callKimiAgent(body.text, env.KIMI_API_KEY);

      return new Response(
        JSON.stringify({
          input: body.text,
          analysis: "Analysis would happen via Kimi K2 agent",
          cached: false,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Route: Serve from KV Storage
    if (pathname.startsWith("/cache/")) {
      const key = pathname.replace("/cache/", "");
      const value = await env.KV.get(key);

      if (value) {
        return new Response(value, {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not found", { status: 404 });
    }

    // 404
    return new Response(
      JSON.stringify({
        error: "Not found",
        path: pathname,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  },

  /**
   * Scheduled handler (cron)
   */
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    console.log(`[${new Date().toISOString()}] Scheduled task running...`);

    // Example: Sync data via K2 agent
    // await syncDataViaAgent(env);
  },
};

/**
 * Example: Call Kimi K2 Agent
 */
async function callKimiAgent(
  text: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.kimi.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "kimi-9b",
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content || "No response";
}
