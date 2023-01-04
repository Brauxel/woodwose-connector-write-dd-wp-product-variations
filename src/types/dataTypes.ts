export interface DynamoDBWordPressProductVariation {
  id: string
  sku: string
  price: number
  quantity: number
  size: string
  permalink: string
  date_created_gmt: string
  date_modified_gmt: string
}

export type EventBodyProductVariation = Omit<
  DynamoDBWordPressProductVariation,
  'date_created_gmt' | 'date_modified_gmt'
>

export enum StatusCodes {
  ERROR = 400,
  SUCCESS = 200,
}

export interface DynamoDBError {
  Code?: string
  Message: string
}

export interface DynamoDBResponses {
  TableName: string
  Error?: DynamoDBError
}
