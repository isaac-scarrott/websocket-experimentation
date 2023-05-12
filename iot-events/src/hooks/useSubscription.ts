import { useContext, useEffect, useCallback, useState } from "react";

import { MqttContext } from "@/context/Connection";
import { mqtt } from "aws-iot-device-sdk-v2";
import { decodeMessagePayload } from "@/realtimeMessages";

export interface IUseSubscription {
  topic: string | string[];
  client?: mqtt.MqttClientConnection | null;
  message?: {
    topic: string;
    message?: string | Record<string, unknown>;
  };
}

export default function useSubscription(
  topic: string | string[]
): IUseSubscription {
  const { client } = useContext(MqttContext);

  const [message, setMessage] = useState<
    IUseSubscription["message"] | undefined
  >(undefined);

  const subscribe = useCallback(async () => {
    for (const singleTopic of [topic].flat()) {
      await client?.subscribe(singleTopic, mqtt.QoS.AtLeastOnce);
    }
  }, [client, topic]);

  const callback = useCallback(
    (receivedTopic: string, receivedMessage: any) => {
      if ([topic].flat().some((rTopic) => rTopic === receivedTopic)) {
        setMessage({
          topic: receivedTopic,
          message: decodeMessagePayload(receivedMessage),
        });
      }
    },
    [topic]
  );

  useEffect(() => {
    if (client) {
      subscribe();

      client.on("message", callback);
    }
    return () => {
      client?.off("message", callback);
    };
  }, [callback, client, subscribe]);

  return {
    client,
    topic,
    message,
  };
}
