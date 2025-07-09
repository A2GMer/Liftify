interface StripeConfig {
  secretKey: string;
  proProductId: string;
  ultimateProductId: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}

export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Missing required Stripe secret key: STRIPE_SECRET_KEY');
  }
  
  // Determine environment from secret key prefix
  const environment = secretKey.startsWith('sk_live_') ? 'live' : 'test';
  
  // Use environment-specific variables
  let proProductId: string;
  let ultimateProductId: string;
  let webhookSecret: string;
  
  if (environment === 'live') {
    proProductId = process.env.STRIPE_PRO_PRODUCT_ID_LIVE || process.env.STRIPE_PRO_PRODUCT_ID;
    ultimateProductId = process.env.STRIPE_ULTIMATE_PRODUCT_ID_LIVE || process.env.STRIPE_ULTIMATE_PRODUCT_ID;
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  } else {
    proProductId = process.env.STRIPE_PRO_PRODUCT_ID_TEST || process.env.STRIPE_PRO_PRODUCT_ID;
    ultimateProductId = process.env.STRIPE_ULTIMATE_PRODUCT_ID_TEST || process.env.STRIPE_ULTIMATE_PRODUCT_ID;
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;
  }
  
  if (!proProductId) {
    throw new Error(`Missing required Stripe Pro product ID for ${environment} environment`);
  }
  
  if (!ultimateProductId) {
    throw new Error(`Missing required Stripe Ultimate product ID for ${environment} environment`);
  }
  
  if (!webhookSecret) {
    throw new Error(`Missing required Stripe webhook secret for ${environment} environment`);
  }
  
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
  console.log(`[Stripe] Webhook Secret: ${config.webhookSecret.substring(0, 12)}...`);
  console.log(`[Stripe] Note: Environment-specific variables are auto-selected based on key prefix`);
}