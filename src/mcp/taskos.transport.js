import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

export function createTaskosTransport({ url, apiKey }) {
  if (!url) throw new Error("Transport requires valid URL");
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  return new StreamableHTTPClientTransport(url, {
    requestInit: { headers }
  });
}
