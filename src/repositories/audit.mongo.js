export async function appendMongoAudit(coll, valid) {
  try {
    await coll.insertOne({ ...valid });
    return { ...valid };
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error(`Duplicate sequence or event: ${valid.sequence_number}`);
      e.code = 11000;
      throw e;
    }
    throw err;
  }
}

export function findLatestMongoAudit(coll, id) {
  return coll.findOne({ execution_id: id }, { sort: { sequence_number: -1 }, projection: { _id: 0 } });
}

export function findMongoAuditEvents(coll, id, page = 1, limit = 50) {
  return coll.find({ execution_id: id }, { projection: { _id: 0 } })
    .sort({ sequence_number: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
}

export async function listMongoAuditExecutions(coll, page = 1, limit = 50) {
  const ids = await coll.distinct("execution_id");
  return ids.slice((page - 1) * limit, page * limit);
}

export function tamperMongoAudit(coll, id, idx, patch) {
  return coll.updateOne({ execution_id: id, sequence_number: idx + 1 }, { $set: patch });
}

export function removeMongoAudit(coll, id, idx) {
  return coll.deleteOne({ execution_id: id, sequence_number: idx + 1 });
}
