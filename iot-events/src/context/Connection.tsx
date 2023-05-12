import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  createContext,
} from "react";
import { mqtt, iot } from "aws-iot-device-sdk-v2";
import { GetEndpointResponse } from "@/pages/api/endpoint";

export interface IMqttContext {
  client?: mqtt.MqttClientConnection | null;
}

export interface ConnectorProps {
  children: React.ReactNode;
}

const MqttContext = createContext<IMqttContext>({});

function Connector({ children }: ConnectorProps) {
  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [client, setClient] = useState<mqtt.MqttClientConnection | null>(null);

  useEffect(() => {
    async function createConnectionClient() {
      if (clientValid.current) {
        return;
      }

      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      const response = await fetch("/api/endpoint");
      const { endpointAddress }: GetEndpointResponse = await response.json();

      console.log(`attempting to connect to ${endpointAddress}`);

      // Create the connection configuration
      const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id("client_" + Date.now().toString())
        .with_endpoint(endpointAddress)
        .with_keep_alive_seconds(30)
        .with_custom_authorizer(
          "",
          process.env.NEXT_PUBLIC_AUTHORIZER_NAME as string,
          "",
          ""
        )
        .build();

      const client = new mqtt.MqttClient();

      // Create the connection
      const connection = client.new_connection(config);

      connection.on("connect", () => {
        console.debug("on connect");

        // For some reason setting the client as soon as we get it from connect breaks things
        setClient(connection);
      });

      connection.on("resume", () => {
        console.debug("on resume");
      });

      connection.on("error", (err) => {
        console.log(`Connection error: ${err}`);
      });

      connection.on("interrupt", () => {
        console.debug("on interrupt");
      });

      connection.on("disconnect", () => {
        console.debug("on disconnect");
      });
    }

    createConnectionClient();
  }, [client, clientValid]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      async function disconnect() {
        if (client) {
          console.log("closing mqtt client");
          await client.disconnect();
          setClient(null);
          clientValid.current = false;
        }
      }
      disconnect();
    },
    [client, clientValid]
  );

  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      client,
    }),
    [client]
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export default Connector;
export { MqttContext };
