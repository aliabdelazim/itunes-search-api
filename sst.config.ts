import { SSTConfig } from "sst";
import { ExampleStack } from "./stacks/ExampleStack";
import { RemovalPolicy } from "aws-cdk-lib";
require("dotenv").config();

export default {
  config(_input) {
    return {
      name: "itunes-search-api",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(ExampleStack);

    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
} satisfies SSTConfig;
