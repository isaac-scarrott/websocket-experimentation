import { SSTConfig } from "sst";
import webStack from "./stacks/web";
import authStack from "./stacks/auth";

export default {
  config(_input) {
    return {
      name: "FutureInCode",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(webStack, { id: "Web" });
    app.stack(authStack, { id: "Auth" });
  },
} satisfies SSTConfig;
