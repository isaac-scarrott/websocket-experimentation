import type { NextApiRequest, NextApiResponse } from "next";
import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const iot = new IoTClient({
    region: "eu-west-2",
  });

  const result = await iot.send(
    new DescribeEndpointCommand({
      endpointType: "iot:Data-ATS",
    })
  );
  const url = result.endpointAddress!;

  res.status(200).json({ message: url });
}

export default handler;
