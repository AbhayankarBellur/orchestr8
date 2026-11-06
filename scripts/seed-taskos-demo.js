import { connectDatabase, closeDatabase, getDatabase } from "../src/config/database.js";
import { WS_ID, USER_ID, DEMO_PROJECT, DEMO_TASKS } from "./seed-data.js";

export async function seedDemo() {
  await connectDatabase();
  const dbName = process.env.TASKOS_DB_NAME || "taskos";
  const db = getDatabase().client.db(dbName);
  let prj = await db.collection("projects").findOne({ workspaceId: WS_ID, name: DEMO_PROJECT.name });
  if (!prj) {
    const res = await db.collection("projects").insertOne({ ...DEMO_PROJECT, createdAt: new Date(), updatedAt: new Date() });
    prj = await db.collection("projects").findOne({ _id: res.insertedId });
  }

  const taskMap = new Map();
  for (const t of DEMO_TASKS) {
    const key = `${prj.key}-${t.keySuffix}`;
    await db.collection("tasks").updateOne(
      { workspaceId: WS_ID, projectId: prj._id, key },
      { $set: { title: t.title, description: `Demo task: ${t.title}`, status: t.status, priority: t.priority, assigneeId: USER_ID, reporterId: USER_ID, blocked: t.blocked, blockerReason: t.reason, dueDate: null, labels: ["backend", "migration"], archived: false, updatedAt: new Date() },
        $setOnInsert: { workspaceId: WS_ID, projectId: prj._id, key, createdAt: new Date() } },
      { upsert: true }
    );
    const task = await db.collection("tasks").findOne({ workspaceId: WS_ID, projectId: prj._id, key });
    taskMap.set(t.keySuffix, task._id);
  }

  const depPairs = [[3, 2], [4, 2]];
  for (const [dep, prereq] of depPairs) {
    const taskId = taskMap.get(dep), dependsOnTaskId = taskMap.get(prereq);
    if (taskId && dependsOnTaskId) {
      await db.collection("task_dependencies").updateOne(
        { workspaceId: WS_ID, taskId, dependsOnTaskId },
        { $setOnInsert: { workspaceId: WS_ID, taskId, dependsOnTaskId, createdAt: new Date() } },
        { upsert: true }
      );
    }
  }
  return { project: prj, tasks: Array.from(taskMap.values()) };
}

if (process.argv[1]?.endsWith("seed-taskos-demo.js")) {
  seedDemo().then(res => { console.log("Seeded successfully:", res.project._id.toString()); closeDatabase(); });
}
