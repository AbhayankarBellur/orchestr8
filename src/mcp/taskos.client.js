import { Client } from "@modelcontextprotocol/client";

export function createTaskosClient(info = { name: "orchestr8", version: "1.0.0" }) {
  return new Client(info, { capabilities: {} });
}
