export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      const { registerNodeMetrics } = await import("./monitoring/node-metrics")
      registerNodeMetrics()
    }
  }
  