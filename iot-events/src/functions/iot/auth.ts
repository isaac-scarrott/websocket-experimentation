export async function handler() {

  return {
    isAuthenticated: true,
    principalId: Date.now().toString(),
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Publish",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:eu-west-2:${process.env.ACCOUNT}:topic/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:eu-west-2:${process.env.ACCOUNT}:topicfilter/*`,
          },
        ],
      },
    ],
  };
}
