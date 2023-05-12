const eventTypes = {
  focus: "focus",
  blur: "blur",
  change: "change",
} as const;

function createMessageTopic(
  elementId: string,
  eventType: (typeof eventTypes)[keyof typeof eventTypes]
) {
  return `${elementId}/${eventType}`;
}

function decodeMessageTopic(topic: string) {
  const [elementId, eventType] = topic.split("/");

  return { elementId, eventType };
}

function decodeMessagePayload(payload: ArrayBuffer) {
  return JSON.parse(new TextDecoder("utf8").decode(new Uint8Array(payload)));
}

function encodeMessagePayload(payload: Record<string, any>) {
  return new TextEncoder().encode(JSON.stringify(payload));
}

function getAllTopics(elementIds: string[]) {
  return elementIds.flatMap((elementId) =>
    Object.values(eventTypes).map((eventType) =>
      createMessageTopic(elementId, eventType)
    )
  );
}

export {
  createMessageTopic,
  decodeMessageTopic,
  decodeMessagePayload,
  encodeMessagePayload,
  getAllTopics,
};
