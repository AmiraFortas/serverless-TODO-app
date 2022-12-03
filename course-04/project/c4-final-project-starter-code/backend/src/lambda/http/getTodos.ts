import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
const logger = createLogger('getTodos')  
// TODO: Get all TODO items for a current user

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)
    // Write your code here
    const todos = await getTodos(userId)
    const userId = getUserId(event)

    return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
}

