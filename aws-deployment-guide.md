# Liftify AWS Deployment Guide

This guide will help you deploy Liftify to AWS using Amplify, Cognito, Lambda, and RDS.

## Prerequisites

- AWS CLI installed and configured
- Node.js 18+ installed
- AWS account with appropriate permissions

## Step 1: Set up AWS RDS (MySQL Database)

1. Create a MySQL RDS instance:
   - Engine: MySQL 8.0
   - Instance class: db.t3.micro (for development)
   - Storage: 20GB General Purpose SSD
   - Enable automated backups
   - Note down the endpoint, username, and password

2. Create the database schema:
   ```bash
   mysql -h YOUR_RDS_ENDPOINT -u YOUR_USERNAME -p < aws-lambda/database-schema.sql
   ```

## Step 2: Set up AWS Cognito User Pool

1. Go to AWS Cognito Console
2. Create a new User Pool:
   - Name: `liftify-userpool`
   - Sign-in options: Email
   - Password requirements: Minimum 8 characters
   - MFA: Optional
   - Email verification: Required
   - Attributes: email, given_name, family_name

3. Create an App Client:
   - Name: `liftify-client`
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
   - Note down the Client ID

4. Create an Identity Pool:
   - Name: `liftify-identitypool`
   - Enable access to unauthenticated identities: No
   - Authentication providers: Cognito User Pool
   - Link to your User Pool

## Step 3: Deploy Lambda Function

1. Navigate to the Lambda directory:
   ```bash
   cd aws-lambda
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Set environment variables for the Lambda function:
   - `RDS_HOSTNAME`: Your RDS endpoint
   - `RDS_USERNAME`: Your RDS username
   - `RDS_PASSWORD`: Your RDS password
   - `RDS_DB_NAME`: liftify
   - `RDS_PORT`: 3306
   - `COGNITO_USER_POOL_ID`: Your Cognito User Pool ID
   - `COGNITO_CLIENT_ID`: Your Cognito Client ID

4. Create the deployment package:
   ```bash
   chmod +x build-and-package.sh
   ./build-and-package.sh
   ```

5. Create a new Lambda function in AWS Console:
   - Runtime: Node.js 18.x
   - Handler: dist/index.handler
   - Upload the `liftify-lambda.zip` file
   - Set environment variables from step 3
   - Timeout: 30 seconds
   - Memory: 512 MB

## Step 4: Set up API Gateway

1. Create a new API Gateway (REST API):
   - Name: `liftify-api`
   - Description: Liftify backend API

2. Create resources and methods:
   - Resource: `/api`
   - Resource: `/api/auth`
   - Resource: `/api/workouts`
   - Resource: `/api/analytics`
   - Method: ANY for each resource
   - Integration: Lambda Function (your liftify function)

3. Enable CORS for all methods:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   - Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS

4. Deploy the API:
   - Stage: prod
   - Note down the API Gateway URL

## Step 5: Configure Frontend for AWS

1. Copy the frontend code to a new directory:
   ```bash
   cp -r client/* aws-amplify-frontend/
   ```

2. Install AWS Amplify dependencies:
   ```bash
   cd aws-amplify-frontend
   npm install aws-amplify @aws-amplify/ui-react
   ```

3. Update `src/aws-exports.ts` with your AWS resource values:
   - Replace `YOUR_IDENTITY_POOL_ID` with your Identity Pool ID
   - Replace `YOUR_USER_POOL_ID` with your User Pool ID
   - Replace `YOUR_CLIENT_ID` with your App Client ID
   - Replace `YOUR_API_GATEWAY_ID` with your API Gateway ID
   - Update the region if different from `us-east-1`

4. Update environment variables:
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod" > .env
   ```

5. Update the main App component to use AWS Cognito:
   - Replace `useAuth` with `useAwsAuth`
   - Update API calls to use `aws-api-client`

## Step 6: Deploy Frontend with AWS Amplify

1. Go to AWS Amplify Console
2. Connect your Git repository or upload your code
3. Build settings:
   - Use the provided `amplify.yml` configuration
   - Add environment variables if needed

4. Deploy the application
5. Note down the Amplify app URL

## Step 7: Update CORS and URLs

1. Update API Gateway CORS settings to include your Amplify URL
2. Update Cognito App Client settings:
   - Callback URLs: Add your Amplify URL
   - Sign out URLs: Add your Amplify URL

## Step 8: Test the Deployment

1. Visit your Amplify app URL
2. Test user registration and login
3. Test workout creation and viewing
4. Test analytics features

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **CORS**: Restrict to specific domains in production
3. **API Gateway**: Consider adding API keys or WAF protection
4. **RDS**: Use VPC and security groups to restrict access
5. **Lambda**: Use IAM roles with minimal permissions

## Monitoring and Maintenance

1. **CloudWatch**: Monitor Lambda function logs and metrics
2. **RDS**: Monitor database performance and storage
3. **Cognito**: Monitor user pool metrics
4. **Amplify**: Monitor build and deployment logs

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure API Gateway CORS is properly configured
2. **Authentication Errors**: Check Cognito configuration and JWT tokens
3. **Database Connection**: Verify RDS endpoint and credentials
4. **Lambda Timeout**: Increase timeout or optimize database queries
5. **Build Failures**: Check Node.js version and dependencies

### Useful Commands:

```bash
# Test Lambda function locally
npm run build && node -e "console.log(require('./dist/index.js').handler({}, {}))"

# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix /aws/apigateway/

# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/
```

## Cost Optimization

1. **RDS**: Use db.t3.micro for development
2. **Lambda**: Optimize code to reduce execution time
3. **Cognito**: Free tier covers most development needs
4. **API Gateway**: Consider REST vs HTTP API pricing
5. **Amplify**: Monitor build minutes and data transfer

## Support

For issues specific to AWS services, consult:
- AWS Documentation
- AWS Support (if you have a support plan)
- AWS Community Forums
- Stack Overflow with AWS tags