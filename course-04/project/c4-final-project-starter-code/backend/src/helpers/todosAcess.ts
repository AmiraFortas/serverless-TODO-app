import { TodosAccess } from '../data/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../helpers/CreateTodoRequest'
import { UpdateTodoRequest } from '../helpers/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { AttachmentUtil } from '../helpers/attachmentUtils'
import { QxtraQueryParam } from '../models/ExtraQueryParam'

// BusinessLogic for todo app

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.TODOS_TABLE) {
    }

const todosAccess = new TodosAccess()
const attachmentUtil = new AttachmentUtil()

const logger = createLogger('BusinessLogic')

async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    return result.Items as TodoItem[]
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient.get({
      TableName: this.todoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        }
    }).promise()
}

async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  return todosAccess.createTodo(newTodoObj)
}

async updateTodo(todoId: string, userId: string, updatedTodo: TodoUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        },
        UpdateExpression: "set #todoName= :name, dueDate= :dueDate, done= :done",
        ExpressionAttributeValues:{
          ":name": updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done": updatedTodo.done
        },
        ExpressionAttributeNames:{
          "#todoName": "name"
        }
    }).promise()
  }
async deleteTodo(todoId: string, userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        }
    }).promise()
  }
async generateUploadUrl(todoId: string, userId: string): Promise<string> {
    const uploadUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  
    await this.docClient.update({
      TableName: this.todoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl= :attachmentUrl",
        ExpressionAttributeValues:{
          ":attachmentUrl": uploadUrl
        }
    }).promise()

    return this.getUploadUrl(todoId)
  }

  private getUploadUrl(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  await checkUserCanAccessTodo(userId, todoId)

  return attachmentUtil.getUploadUrl(userId, todoId)
}