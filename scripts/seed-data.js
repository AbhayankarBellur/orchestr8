import { ObjectId } from "mongodb";

export const WS_ID = new ObjectId(process.env.TASKOS_WORKSPACE_ID || "6ae9977b682abdf72ef1f3b0");
export const USER_ID = new ObjectId(process.env.TASKOS_USER_ID || "6ae9977b682abdf72ef1f3af");

export const DEMO_PROJECT = {
  name: "Backend Migration",
  key: "BMIG",
  description: "Migration of legacy backend monolith to modern microservices",
  color: "#4F46E5",
  status: "active",
  taskCounter: 5,
  workspaceId: WS_ID,
  createdBy: USER_ID
};

export const DEMO_TASKS = [
  { keySuffix: 1, title: "Database Schema Migration", status: "done", priority: "high", blocked: false, reason: null },
  { keySuffix: 2, title: "Legacy User Data Export", status: "in_progress", priority: "high", blocked: false, reason: null },
  { keySuffix: 3, title: "API Gateway Rate Limiter", status: "todo", priority: "medium", blocked: false, reason: null },
  { keySuffix: 4, title: "Deprecate Legacy v1 Auth Endpoint", status: "todo", priority: "critical", blocked: true, reason: "Waiting on user export and token migration" },
  { keySuffix: 5, title: "Connection Pooling Benchmark", status: "in_review", priority: "low", blocked: false, reason: null }
];
