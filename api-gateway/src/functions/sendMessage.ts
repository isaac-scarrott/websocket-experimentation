import { DynamoDB, ApiGatewayManagementApi } from "aws-sdk";

import { APIGatewayProxyHandler } from "aws-lambda";

const TableName = process.env.TABLE_NAME as string;
const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async (event) => {
  const messageData = JSON.parse(event.body || "{}");

  console.log("Sending message", messageData);

  const { stage, domainName } = event.requestContext;

  // Get all the connections
  const connections = await dynamoDb
    .scan({ TableName, ProjectionExpression: "id" })
    .promise();

  const apiG = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  const postToConnection = async function ({ id }: any) {
    try {
      // Send the message to the given client
      await apiG
        .postToConnection({
          ConnectionId: id,
          Data: JSON.stringify(messageData),
        })
        .promise();
    } catch (e) {
      console.log(e);
      if ((e as any).statusCode === 410) {
        // Remove stale connections
        await dynamoDb.delete({ TableName, Key: { id } }).promise();
      }
    }
  };

  // Iterate through all the connections
  await Promise.all(connections.Items?.map(postToConnection) || []);

  return { statusCode: 200, body: "Message sent" };
};
