import { SSTConfig } from "sst";
import webStack from "./stacks/web";
import authStack from "./stacks/auth";

export default {
  config(_input) {
    return {
      name: "IoTEvents",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(authStack, { id: "Auth" });
    app.stack(webStack, { id: "Web" });
  },
} satisfies SSTConfig;
