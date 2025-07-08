// AWS Amplify configuration
// Replace these values with your actual AWS resource values

const awsconfig = {
  aws_project_region: 'us-east-1', // Change to your region
  aws_cognito_identity_pool_id: 'us-east-1:YOUR_IDENTITY_POOL_ID',
  aws_cognito_region: 'us-east-1', // Change to your region
  aws_user_pools_id: 'us-east-1_YOUR_USER_POOL_ID',
  aws_user_pools_web_client_id: 'YOUR_CLIENT_ID',
  oauth: {
    domain: 'YOUR_DOMAIN.auth.us-east-1.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'http://localhost:3000/', // Change for production
    redirectSignOut: 'http://localhost:3000/', // Change for production
    responseType: 'code'
  },
  federationTarget: 'COGNITO_USER_POOLS',
  aws_appsync_graphqlEndpoint: 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  aws_appsync_apiKey: 'YOUR_API_KEY',
  // Custom API Gateway endpoint
  api: {
    endpoints: [
      {
        name: 'liftify-api',
        endpoint: 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    ]
  }
};

export default awsconfig;