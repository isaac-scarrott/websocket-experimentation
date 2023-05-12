import { NextjsSite, StackContext, use } from "sst/constructs";

import authStack from "./auth";

function webStack(ctx: StackContext) {
  const authorizer = use(authStack);

  const site = new NextjsSite(ctx.stack, "site", {
    permissions: ["iot:DescribeEndpoint"],
    environment: {
      NEXT_PUBLIC_AUTHORIZER_NAME: authorizer.authorizerName as string,
    },
  });

  ctx.stack.addOutputs({
    SiteUrl: site.url,
    AuthorizerName: authorizer.authorizerName as string,
  });
}

export default webStack;
