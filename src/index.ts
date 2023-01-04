import {
  BatchExecuteStatementCommand,
  BatchStatementRequest,
} from '@aws-sdk/client-dynamodb'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ddbDocClient } from './libs/ddbDocClient'
import { DynamoDBResponses, StatusCodes } from './types/dataTypes'
import { extractErrorsFromDynamoDbResponses } from './utils/dynamo-db/dataStructureUtils'
import { logger } from './utils/logger/buildLogger'
import { logAndReturnError } from './utils/logger/loggerHelper'
import { hydrateEnv } from './utils/secrets/hydrateEnv'
import { validateSingleProductVariationBody } from './utils/validators/productVariationValidators'

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err)
  process.exit(1)
})

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyResultV2> => {
  logger.info(`Handler function called with event: ${JSON.stringify(event)}`)
  try {
    await hydrateEnv()
  } catch (error) {
    const { message } = error as Error
    const parsedMessage = JSON.parse(message)
    return logAndReturnError(parsedMessage.message, parsedMessage)
  }

  if (!event.body) {
    return logAndReturnError('Validation Error in provided event', {
      name: 'No arguments provided',
      message:
        'Please provide an array of products with all the required properties',
    })
  }

  if (
    event.requestContext.http.method !== 'POST' &&
    event.requestContext.http.method !== 'PATCH'
  ) {
    return logAndReturnError(`Please provide a valid http method`, {
      name: 'Only POST and PATCH are supported',
      message: `Please send a POST http request to add a new product and a PATCH http request to update existing products`,
    })
  }

  const parsedBody = JSON.parse(event.body)
  if (parsedBody.length === 0) {
    return logAndReturnError('Validation Error in provided products', {
      name: 'No new products provided',
      message:
        'Please provide an array of products with all the required properties',
    })
  }

  const Statements: BatchStatementRequest[] = []
  for (let index = 0; index < parsedBody.length; index++) {
    const validationResult = await validateSingleProductVariationBody(
      parsedBody[index],
      index.toString()
    )

    if (validationResult.statusCode !== StatusCodes.SUCCESS) {
      return validationResult
    }

    const { id, sku, permalink, price, quantity, size } = parsedBody[index]
    const currentDate = new Date().toISOString()
    if (event.requestContext.http.method === 'POST') {
      Statements.push({
        Statement: `INSERT INTO ${process.env.WORDPRESS_PRODUCT_VARIATIONS_TABLE_NAME} value {'id':?, 'sku':?, 'permalink':?, 'price':?, 'quantity':?, 'size':?, 'date_created_gmt':?, 'date_modified_gmt':?}`,
        Parameters: [
          { S: id },
          { S: sku },
          { S: permalink },
          { N: price.toString() },
          { N: quantity.toString() },
          { S: size },
          { S: currentDate },
          { S: currentDate },
        ],
      })
    }

    if (event.requestContext.http.method === 'PATCH') {
      Statements.push({
        Statement: `UPDATE ${process.env.WORDPRESS_PRODUCT_VARIATIONS_TABLE_NAME} SET "permalink"=?, "size"=?, "price"=?, "quantity"=?, "date_modified_gmt"=? WHERE "id"=? and "sku"=?`,
        Parameters: [
          { S: permalink },
          { S: size },
          { N: price.toString() },
          { N: quantity.toString() },
          { S: currentDate },
          { S: id },
          { S: sku },
        ],
      })
    }
  }

  const params = {
    Statements,
  }

  const data = await ddbDocClient.send(new BatchExecuteStatementCommand(params))
  const errors = extractErrorsFromDynamoDbResponses(
    data.Responses as DynamoDBResponses[]
  )
  if (errors.length > 0) {
    // TODO: Standardize the error response, also update logAndReturnError() function for an array of errors
    return {
      statusCode: StatusCodes.ERROR,
      body: JSON.stringify({
        errors,
      }),
    }
  }

  return {
    statusCode: StatusCodes.SUCCESS,
    body: JSON.stringify({
      data,
    }),
  }
}
