import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async (event) => {
  const params = {
    TableName: process.env.TABLE_NAME as string,
    Item: {
      id: event.requestContext.connectionId,
    },
  };

  await dynamoDb.put(params).promise();

  return { statusCode: 200, body: "Connected" };
};
