import { TASKOS_CONFIG, validateTaskosConfig } from "../config/taskos.config.js";
import { createTaskosTransport } from "./taskos.transport.js";
import { createTaskosClient } from "./taskos.client.js";

let state = "DISCONNECTED", client = null, lastConnectedAt = null;
let connectPromise = null, lastError = null;

export async function connectTaskos(customTransport = null, customClient = null) {
  if (state === "CONNECTED" && client) return client;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    state = "CONNECTING";
    lastError = null;
    try {
      validateTaskosConfig();
      const transport = customTransport || createTaskosTransport(TASKOS_CONFIG);
      client = customClient || createTaskosClient();
      await client.connect(transport);
      state = "CONNECTED";
      lastConnectedAt = new Date().toISOString();
      return client;
    } catch (err) {
      state = "ERROR";
      lastError = err.message || "Failed to connect to TaskOS MCP";
      client = null;
      throw err;
    } finally { connectPromise = null; }
  })();
  return connectPromise;
}

export async function disconnectTaskos() {
  if (client) { try { await client.close(); } catch {} }
  client = null;
  state = "DISCONNECTED";
  connectPromise = null;
}

export function getConnectionStatus() {
  return {
    server: "taskos", state, url: TASKOS_CONFIG.url,
    connected: state === "CONNECTED", lastConnectedAt, lastError
  };
}

export function getActiveClient() { return client; }
