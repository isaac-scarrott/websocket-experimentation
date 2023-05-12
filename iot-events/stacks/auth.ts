import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnAuthorizer, CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { StackContext, Function, use } from "sst/constructs";

function authStack(ctx: StackContext) {
  const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
    handler: "src/functions/iot/auth.handler",
    permissions: ["iot"],
    environment: {
      ACCOUNT: ctx.app.account,
    },
  });

  const authorizer = new CfnAuthorizer(ctx.stack, "authorizer", {
    status: "ACTIVE",
    authorizerName: ctx.app.logicalPrefixedName("authorizer"),
    authorizerFunctionArn: authorizerFn.functionArn,
    signingDisabled: true,
  });

  authorizerFn.addPermission("IOTPermission", {
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: authorizer.attrArn,
    action: "lambda:InvokeFunction",
  });

  return authorizer;
}

export default authStack;
