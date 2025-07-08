import { APIGatewayProxyEvent } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoUser } from './types';

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export async function verifyToken(event: APIGatewayProxyEvent): Promise<CognitoUser | null> {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const payload = await jwtVerifier.verify(token);
    
    return {
      sub: payload.sub,
      email: String(payload.email || ''),
      given_name: payload.given_name ? String(payload.given_name) : undefined,
      family_name: payload.family_name ? String(payload.family_name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function createResponse(statusCode: number, body: any, headers: Record<string, string> = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function createErrorResponse(statusCode: number, message: string) {
  return createResponse(statusCode, { error: message });
}