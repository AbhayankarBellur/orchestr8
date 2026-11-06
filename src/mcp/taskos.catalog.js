const store = new Map();

export function registerTools(server, tools = []) {
  if (!store.has(server)) store.set(server, new Map());
  const serverMap = store.get(server);
  serverMap.clear();
  for (const t of tools) {
    serverMap.set(t.name, t);
  }
}

export function getTools(server = "taskos") {
  const serverMap = store.get(server);
  if (!serverMap) return [];
  return Array.from(serverMap.values());
}

export function getTool(server = "taskos", name) {
  const serverMap = store.get(server);
  return serverMap?.get(name) || null;
}

export function clearCatalog(server) {
  if (server) store.delete(server);
  else store.clear();
}
