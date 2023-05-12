import { StackContext, Table, WebSocketApi } from "sst/constructs";

function webSocketStack({ stack }: StackContext) {
  const table = new Table(stack, "Connections", {
    fields: {
      id: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  const api = new WebSocketApi(stack, "Api", {
    defaults: {
      function: {
        environment: {
          TABLE_NAME: table.tableName,
        },
        permissions: [table],
      },
    },
    routes: {
      $connect: "src/functions/connect.main",
      $default: "src/functions/default.main",
      $disconnect: "src/functions/connect.main",
      sendmessage: "src/functions/connect.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

export default webSocketStack;
