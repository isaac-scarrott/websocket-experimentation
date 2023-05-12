import { useEffect, useState } from "react";

import { createMessageTopic, decodeMessageTopic } from "@/realtimeMessages";
import { useForm } from "react-hook-form";
import useWebSocket, { ReadyState } from "react-use-websocket";

const socketUrl = "wss://tb7730msk1.execute-api.eu-west-2.amazonaws.com/Local";

const initialFormValues = {
  name: "",
  email: "",
  message: "",
} as const;

export default function Home({ userUid }: { userUid: string }) {
  const [focusedElements, setFocusedElements] = useState<
    Partial<Record<keyof typeof initialFormValues, string[]>>
  >({});

  const form = useForm<typeof initialFormValues>({
    defaultValues: initialFormValues,
    shouldUnregister: false,
  });

  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const {
      topic,
      value,
      userUid: lastMessageUserUid,
    } = JSON.parse(lastMessage.data);
    debugger;
    if (userUid === lastMessageUserUid) {
      return;
    }

    const decodedTopic = decodeMessageTopic(topic);

    if (decodedTopic.eventType === "focus") {
      setFocusedElements((prev) => ({
        ...prev,
        [decodedTopic.elementId]: [
          ...(prev[decodedTopic?.elementId as "name" | "email" | "message"] ||
            []),
          lastMessageUserUid,
        ],
      }));
    }

    if (decodedTopic.eventType === "blur") {
      setFocusedElements((prev) => ({
        ...prev,
        [decodedTopic.elementId]: prev[
          decodedTopic?.elementId as "name" | "email" | "message"
        ]?.filter((uid) => uid !== lastMessageUserUid),
      }));
    }

    form.setValue(decodedTopic.elementId as any, value);
  }, [lastMessage, form, userUid]);

  // Extracts the elementId and eventType from the topic and calls the appropriate pub/sub handler
  function publicTopic(elementId: string, eventType: string, value: string) {
    if (!["blur", "focus", "change"].includes(eventType)) {
      return;
    }

    const payload = JSON.stringify({
      topic: createMessageTopic(elementId, eventType as any),
      value: value,
      userUid,
      timestamp: Date.now(),
    });

    sendMessage(payload);
  }

  return (
    <>
      <form>
        <input
          id='name'
          {...form.register("name")}
          onBlur={(e) => {
            form.register("name").onBlur(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("name").onChange(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          style={{
            backgroundColor:
              focusedElements.name &&
              focusedElements.name?.filter((uid) => uid !== userUid).length > 0
                ? `red`
                : undefined,
          }}
        />

        <input
          id='email'
          {...form.register("email")}
          onBlur={(e) => {
            form.register("email").onBlur(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("email").onChange(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          style={{
            backgroundColor:
              focusedElements.email &&
              focusedElements.email?.filter((uid) => uid !== userUid).length > 0
                ? `red`
                : undefined,
          }}
        />

        <input
          id='message'
          {...form.register("message")}
          onBlur={(e) => {
            form.register("message").onBlur(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("message").onChange(e);
            publicTopic(e.target.id, e.type, e.target.value);
          }}
          style={{
            backgroundColor:
              focusedElements.message &&
              focusedElements.message?.filter((uid) => uid !== userUid).length >
                0
                ? `red`
                : undefined,
          }}
        />
      </form>
    </>
  );
}
