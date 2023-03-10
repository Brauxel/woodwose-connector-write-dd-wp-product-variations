import dotenv from 'dotenv'
import fs from 'fs'
import { logAndThrowError } from '../logger/loggerHelper'

export const hydrateEnv = async () => {
  if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' })
  }

  if (!process.env.DEFAULT_REGION) {
    logAndThrowError({
      name: 'Missing env variables',
      message: 'Please provide DEFAULT_REGION in environment variables',
    })
  }

  if (!process.env.WORDPRESS_PRODUCTS_TABLE_NAME) {
    logAndThrowError({
      name: 'Missing env variables',
      message:
        'Please provide WORDPRESS_PRODUCTS_TABLE_NAME in environment variables',
    })
  }

  if (!process.env.WORDPRESS_PRODUCT_VARIATIONS_TABLE_NAME) {
    logAndThrowError({
      name: 'Missing env variables',
      message:
        'Please provide WORDPRESS_PRODUCT_VARIATIONS_TABLE_NAME in environment variables',
    })
  }
}
