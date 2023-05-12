import type { NextApiRequest, NextApiResponse } from "next";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";

type GetEndpointResponse = {
  endpointAddress: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetEndpointResponse>
) {
  if (req.method !== "GET") {
    res.status(405);

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
  const endpointAddress = result.endpointAddress!;

  res.status(200).json({ endpointAddress });
}

export default handler;

export type { GetEndpointResponse };
