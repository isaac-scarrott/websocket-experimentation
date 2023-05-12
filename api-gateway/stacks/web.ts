import { NextjsSite, StackContext } from "sst/constructs";

function webStack(ctx: StackContext) {
  console.log(ctx.app.stageName);
  const site = new NextjsSite(ctx.stack, "site", {
    environment: {
      NEXT_PUBLIC_BUCKET_NAME: ctx.stack.stage,
    },
  });

  ctx.stack.addOutputs({
    SiteUrl: site.url,
  });
}

export default webStack;
