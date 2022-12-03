import { APIGatewayProxyEvent,APIGatewayProxyHandler,APIGatewayProxyResult } from 'aws-lambda'

import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
const logger = createLogger('createTodo')

export const handler = middy(


  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
   logger.info('Processing event: ', event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const newItem = await createTodo(newTodo, userId)
  logger.info('item: ', item)

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
    }
  }
)


    handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
Footer
© 2022 GitHub,





    return undefined
)

handler.use(
  cors({
    credentials: true
  })
)
