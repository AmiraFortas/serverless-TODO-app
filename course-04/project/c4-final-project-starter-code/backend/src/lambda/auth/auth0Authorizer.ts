import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.JWKS_URL

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt


  const response = await Axios(jwksUrl);
  const key = response.data.keys.find(key => key.kid === jwt.header.kid);
  if (!key) {
    throw new Error(`Unable to find a signing key '${jwt.header.kid}'`);
  }
  
  return verify(token, fetchCert(key.x5c[0]), { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('there is no authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('there is no authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function fetchCert() {
  const response = await Axios.get(jwksUrl)
  const responseJson: Auth0JsonWebKeyResponse = response.data

  logger.info('[Authorizer > fetchCert] responseJson ')

  const keys = getSigningKeys(responseJson.keys)

  logger.info('[Authorizer > fetchCert] (getSigningKeys) got keys ')

  const publicKey = keys[0].publicKey
  return publicKey