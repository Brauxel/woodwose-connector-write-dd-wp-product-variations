import { APIGatewayProxyResult } from 'aws-lambda'
import { EventBodyProductVariation, StatusCodes } from '../../types/dataTypes'
import { logAndReturnError } from '../logger/loggerHelper'

export const validateSingleProductVariationBody = (
  variation: EventBodyProductVariation,
  key: string
): APIGatewayProxyResult => {
  if (!variation.id) {
    return logAndReturnError(`No id for the variation at index ${key}`, {
      name: 'No id provided',
      message: `Please provide an id for the variation at index ${key}`,
    })
  }

  if (!variation.sku) {
    return logAndReturnError(`No sku for the variation at index ${key}`, {
      name: 'No sku provided',
      message: `Please provide an sku for the variation at index ${key}`,
    })
  }

  if (!variation.permalink) {
    return logAndReturnError(`No permalink for the variation at index ${key}`, {
      name: 'No permalink provided',
      message: `Please provide a permalink for the variation at index ${key}`,
    })
  }

  if (!variation.price) {
    return logAndReturnError(`No price for the variation at index ${key}`, {
      name: 'No price provided',
      message: `Please provide a price for the variation at index ${key}`,
    })
  }

  if (typeof variation.quantity !== 'number') {
    return logAndReturnError(`No quantity for the variation at index ${key}`, {
      name: 'No quantity provided',
      message: `Please provide a quantity for the variation at index ${key}`,
    })
  } else if (variation.quantity < 0) {
    return logAndReturnError(
      `Quantity for the variation at index ${key} less than 0`,
      {
        name: 'Quantity less than 0',
        message: `Please provide a quantity of 0 or greater than 0 for the variation at index ${key}`,
      }
    )
  }

  if (!variation.size) {
    return logAndReturnError(`No size for the variation at index ${key}`, {
      name: 'No size provided',
      message: `Please provide a size for the variation at index ${key}`,
    })
  }

  return {
    statusCode: StatusCodes.SUCCESS,
    body: JSON.stringify({
      data: {},
    }),
  }
}
