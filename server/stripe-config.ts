interface StripeConfig {
  secretKey: string;
  proProductId: string;
  ultimateProductId: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}

export function getStripeConfig(): StripeConfig {
  // For now, use existing environment variables
  // Environment is determined by the secret key prefix (sk_test_ or sk_live_)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const proProductId = process.env.STRIPE_PRO_PRODUCT_ID;
  const ultimateProductId = process.env.STRIPE_ULTIMATE_PRODUCT_ID;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!secretKey) {
    throw new Error('Missing required Stripe secret key: STRIPE_SECRET_KEY');
  }
  
  if (!proProductId) {
    throw new Error('Missing required Stripe Pro product ID: STRIPE_PRO_PRODUCT_ID');
  }
  
  if (!ultimateProductId) {
    throw new Error('Missing required Stripe Ultimate product ID: STRIPE_ULTIMATE_PRODUCT_ID');
  }
  
  if (!webhookSecret) {
    throw new Error('Missing required Stripe webhook secret: STRIPE_WEBHOOK_SECRET');
  }
  
  // Determine environment from secret key prefix
  const environment = secretKey.startsWith('sk_live_') ? 'live' : 'test';
  
  return {
    secretKey,
    proProductId,
    ultimateProductId,
    webhookSecret,
    environment
  };
}

export function logStripeEnvironment(): void {
  const config = getStripeConfig();
  console.log(`[Stripe] Environment: ${config.environment.toUpperCase()} (auto-detected from key prefix)`);
  console.log(`[Stripe] Secret Key: ${config.secretKey.substring(0, 12)}...`);
  console.log(`[Stripe] Pro Product ID: ${config.proProductId}`);
  console.log(`[Stripe] Ultimate Product ID: ${config.ultimateProductId}`);
  console.log(`[Stripe] Note: Environment variables are managed through Replit Secrets`);
}