import { SSTConfig } from "sst";
import webStack from "./stacks/web";
import webSocketStack from "./stacks/websocket";

export default {
  config(_input) {
    return {
      name: "ApiGateway",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(webStack, { id: "Web" });
    app.stack(webSocketStack, { id: "WebSocket" });
  },
} satisfies SSTConfig;
