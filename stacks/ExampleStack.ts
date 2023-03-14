import { Api, StackContext, Table } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  // Create the table
  const table = new Table(stack, "Itunes", {
    fields: {
      itemId: "string",
      releaseDate: "string",
      collectionName: "string",
      collectionPrice: "number",
      queryString: "string",
    },
    primaryIndex: { partitionKey: "itemId", sortKey: "releaseDate" },
    globalIndexes: {
      GSI1: { partitionKey: "collectionName", sortKey: "collectionPrice" },
      GSI2: { partitionKey: "queryString" },
    },
  });

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        // Bind the table name to our API
        bind: [table],
      },
    },
    routes: {
      "GET /search": "packages/functions/src/search.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
