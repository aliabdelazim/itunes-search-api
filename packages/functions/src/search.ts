import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import axios from "axios";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
//@ts-ignore
const dynamoDb = DynamoDBDocument.from(new DynamoDB());
import * as uuid from "uuid";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    /*getting the query string from the request and making a request to the itunes api*/
    const query =
      new URLSearchParams(event.queryStringParameters).toString() || "";
    const itunesSearchResult = await axios.get(
      `${process.env.ITUNES_SEARCH_URL}?${query}`
    );

    /*creating a transaction write request to write the results to the table*/
    const params = {
      TransactItems: itunesSearchResult.data.results.map((result: any) => ({
        Put: {
          TableName: Table.Notes.tableName,
          Item: {
            itemId: uuid.v4(),
            createdAt: Date.now(),
            queryString: query,
            ...result,
          },
        },
      })),
    };

    /*checking if there are items with the same query already in the table using the query as the partition key */
    const queryResult = await dynamoDb.query({
      TableName: Table.Notes.tableName,
      IndexName: "GSI2",
      KeyConditionExpression: "queryString = :queryString",
      ExpressionAttributeValues: {
        ":queryString": query,
      },
    });

    /*if there are no items with the same query in the table, write the results to the table*/
    if (itunesSearchResult.data.results && !queryResult.Items.length)
      await dynamoDb.transactWrite(params);

    /*return the results from the itunes api*/
    return {
      statusCode: 200,
      body: JSON.stringify(itunesSearchResult.data.results),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e }),
    };
  }
};
