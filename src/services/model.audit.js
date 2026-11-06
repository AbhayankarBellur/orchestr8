import { recordEvent } from "./audit.service.js";

export const recordModelRequestStarted = (execId, metadata = {}) =>
  recordEvent({
    execution_id: execId,
    event_type: "MODEL_REQUEST_STARTED",
    metadata,
    status: "REQUESTED"
  });

export const recordModelResponseReceived = (execId, metadata = {}) =>
  recordEvent({
    execution_id: execId,
    event_type: "MODEL_RESPONSE_RECEIVED",
    metadata,
    status: "RECEIVED"
  });
