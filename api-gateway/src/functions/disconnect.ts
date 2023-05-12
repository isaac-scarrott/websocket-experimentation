import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async (event) => {
  const params = {
    TableName: process.env.TABLE_NAME as string,
    Key: {
      id: event.requestContext.connectionId,
    },
  };

  await dynamoDb.delete(params).promise();

  return { statusCode: 200, body: "Disconnected" };
};
