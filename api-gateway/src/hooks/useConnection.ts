import { mqtt, iot } from "aws-iot-device-sdk-v2";
import { useState, useEffect, useRef } from "react";

function useConnection() {
  // const connectionRef = useRef<mqtt.MqttClientConnection>();
  const [connection, setConnection] = useState<mqtt.MqttClientConnection>();

  return connection;
}

export default useConnection;
