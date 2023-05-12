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

const initialFormValues = {
  name: "",
  email: "",
  message: "",
} as const;

export default function Home({ userUid }: { userUid: string }) {
  const [focusedElements, setFocusedElements] = useState<
    Partial<Record<keyof typeof initialFormValues, string[]>>
  >({});

  const [connection, setConnection] = useState<mqtt.MqttClientConnection>();
  const form = useForm<typeof initialFormValues>({
    defaultValues: initialFormValues,
    shouldUnregister: false,
  });

  useEffect(() => {
    async function createConnectionClient() {
      if (connection) {
        return;
      }

      // Get the websocket endpoint from the API
      const response = await fetch("/api/endpoint");

      const { message: url } = await response.json();

      // Create the connection configuration
      const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id("client_" + Date.now().toString())
        .with_endpoint(url)
        .with_keep_alive_seconds(30)
        .with_custom_authorizer(
          "",
          `${process.env.NEXT_PUBLIC_BUCKET_NAME}-FutureInCode-authorizer`,
          "",
          ""
        )
        .build();

      const client = new mqtt.MqttClient();

      // Create the connection
      const _connection = client.new_connection(config);

      _connection.on("connect", async () => {
        console.log("WS connected");
      });
      _connection.on("interrupt", console.log);
      _connection.on("error", console.log);
      _connection.on("resume", console.log);

      _connection.on("disconnect", console.log);

      await _connection.connect();

      // Subscribe to the topic
      _connection.on("message", (topic, payload) => {
        const decodedTopic = decodeMessageTopic(topic);

        if (!decodedTopic) {
          return;
        }

        const decodedPayload = decodeMessagePayload(payload);

        if (!decodedPayload) {
          return;
        }

        console.log("Received message", {
          topic,
          decodedPayload,
        });

        if (decodedTopic.eventType === "focus") {
          setFocusedElements((prev) => ({
            ...prev,
            [decodedTopic.elementId]: [
              ...(prev[
                decodedTopic?.elementId as "name" | "email" | "message"
              ] || []),
              decodedPayload.userUid,
            ],
          }));
        }

        if (decodedTopic.eventType === "blur") {
          setFocusedElements((prev) => ({
            ...prev,
            [decodedTopic.elementId]: prev[
              decodedTopic?.elementId as "name" | "email" | "message"
            ]?.filter((uid) => uid !== decodedPayload.userUid),
          }));
        }

        form.setValue(decodedTopic.elementId as any, decodedPayload.message);
      });

      setConnection(_connection);

      const allTopics = getAllTopics(
        Object.keys(initialFormValues)
      ) as (keyof typeof initialFormValues)[];

      console.log("Subscribing to topics", allTopics);
      for (const topic of allTopics) {
        _connection.subscribe(topic, mqtt.QoS.AtLeastOnce);
      }

      return () => {
        async function unsubscribe() {
          if (!_connection) {
            return;
          }

          console.log("Unsubscribing from topics", allTopics);

          for (const topic of allTopics) {
            try {
              await _connection.unsubscribe(topic);
            } catch (e) {
              console.error("Failed to unsubscribe", topic, e);
            }
          }
        }

        unsubscribe();
      };
    }

    createConnectionClient();

    return () => {
      if (connection) connection.disconnect();
    };
  }, [connection, form]);

  // Extracts the elementId and eventType from the topic and calls the appropriate pub/sub handler
  function createMessageTopicHandler(
    elementId: string,
    eventType: string,
    value: string
  ) {
    if (
      eventType !== "blur" &&
      eventType !== "focus" &&
      eventType !== "change"
    ) {
      return;
    }

    if (!connection) {
      return;
    }

    const topic = createMessageTopic(elementId, eventType);

    console.log("Sending message", { topic, value });

    connection.publish(
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
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("name").onChange(e);
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
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
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("email").onChange(e);
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
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
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onFocus={(e) => {
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
          }}
          onChange={(e) => {
            form.register("message").onChange(e);
            createMessageTopicHandler(e.target.id, e.type, e.target.value);
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
