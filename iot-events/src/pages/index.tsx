import { useEffect, useState } from "react";
import { mqtt, iot } from "aws-iot-device-sdk-v2";
import {
  decodeMessagePayload,
  createMessageTopic,
  encodeMessagePayload,
  getAllTopics,
  decodeMessageTopic,
} from "@/realtimeMessages";
import { useForm } from "react-hook-form";
import useSubscription from "@/hooks/useSubscription";

const initialFormValues = {
  name: "",
  email: "",
  message: "",
} as const;

const allTopics = getAllTopics(
  Object.keys(initialFormValues)
) as (keyof typeof initialFormValues)[];

export default function Home({ userUid }: { userUid: string }) {
  const [focusedElements, setFocusedElements] = useState<
    Partial<Record<keyof typeof initialFormValues, string[]>>
  >({});

  const form = useForm<typeof initialFormValues>({
    defaultValues: initialFormValues,
    shouldUnregister: false,
  });

  const { message, client } = useSubscription(allTopics);

  useEffect(() => {
    if (!message) {
      return;
    }

    const topic = message.topic;

    const { message: value, userUid: lastMessageUserUid } = message.message as {
      message: string;
      userUid: string;
    };

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
  }, [form, message, userUid]);

  // Extracts the elementId and eventType from the topic and calls the appropriate pub/sub handler
  function publicTopic(elementId: string, eventType: string, value: string) {
    if (
      eventType !== "blur" &&
      eventType !== "focus" &&
      eventType !== "change"
    ) {
      return;
    }

    if (!client) {
      return;
    }

    const topic = createMessageTopic(elementId, eventType);

    console.log("Sending message", { topic, value });

    client.publish(
      topic,
      encodeMessagePayload({
        message: value,
        userUid,
        timestamp: Date.now(),
      }),
      mqtt.QoS.AtLeastOnce
    );
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
