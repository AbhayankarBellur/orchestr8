import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { connectTaskos, disconnectTaskos, getConnectionStatus } from "../../src/mcp/taskos.connection.js";

describe("MCP TaskOS Connection", () => {
  beforeEach(async () => { await disconnectTaskos(); });
  afterEach(async () => { await disconnectTaskos(); });

  it("successfully connects with mock client and transport", async () => {
    const mockClient = { connect: vi.fn().mockResolvedValue(undefined), close: vi.fn() };
    const mockTransport = {};
    const client = await connectTaskos(mockTransport, mockClient);
    expect(client).toBe(mockClient);
    expect(mockClient.connect).toHaveBeenCalledWith(mockTransport);

    const status = getConnectionStatus();
    expect(status.state).toBe("CONNECTED");
    expect(status.connected).toBe(true);
  });

  it("handles connection failure and sets ERROR state", async () => {
    const mockClient = { connect: vi.fn().mockRejectedValue(new Error("Net error")), close: vi.fn() };
    await expect(connectTaskos({}, mockClient)).rejects.toThrow("Net error");

    const status = getConnectionStatus();
    expect(status.state).toBe("ERROR");
    expect(status.connected).toBe(false);
  });

  it("prevents duplicate concurrent connections", async () => {
    let finishConnect;
    const pendingPromise = new Promise(resolve => { finishConnect = resolve; });
    const mockClient = { connect: vi.fn().mockReturnValue(pendingPromise), close: vi.fn() };

    const p1 = connectTaskos({}, mockClient);
    const p2 = connectTaskos({}, mockClient);
    finishConnect();
    await Promise.all([p1, p2]);
    expect(mockClient.connect).toHaveBeenCalledTimes(1);
  });

  it("disconnects gracefully and sets DISCONNECTED state", async () => {
    const mockClient = { connect: vi.fn().mockResolvedValue(undefined), close: vi.fn() };
    await connectTaskos({}, mockClient);
    await disconnectTaskos();
    expect(mockClient.close).toHaveBeenCalled();
    expect(getConnectionStatus().state).toBe("DISCONNECTED");
  });
});
