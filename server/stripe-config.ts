interface StripeConfig {
  secretKey: string;
  proProductId: string;
  ultimateProductId: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}

export function getStripeConfig(): StripeConfig {
  const environment = process.env.STRIPE_ENVIRONMENT || 'test';
  const isLive = environment === 'live';
  
  if (!['test', 'live'].includes(environment)) {
    throw new Error(`Invalid STRIPE_ENVIRONMENT: ${environment}. Must be 'test' or 'live'`);
  }
  
  // Try new environment-specific variables first, fallback to existing ones
  const secretKey = isLive 
    ? (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY)
    : (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);
    
  const proProductId = isLive 
    ? (process.env.STRIPE_LIVE_PRO_PRODUCT_ID || process.env.STRIPE_PRO_PRODUCT_ID)
    : (process.env.STRIPE_TEST_PRO_PRODUCT_ID || process.env.STRIPE_PRO_PRODUCT_ID);
    
  const ultimateProductId = isLive 
    ? (process.env.STRIPE_LIVE_ULTIMATE_PRODUCT_ID || process.env.STRIPE_ULTIMATE_PRODUCT_ID)
    : (process.env.STRIPE_TEST_ULTIMATE_PRODUCT_ID || process.env.STRIPE_ULTIMATE_PRODUCT_ID);
    
  const webhookSecret = isLive 
    ? (process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET)
    : (process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET);
  
  if (!secretKey) {
    throw new Error(`Missing required Stripe secret key for ${environment} environment. Please set either STRIPE_SECRET_KEY or ${isLive ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY'}`);
  }
  
  if (!proProductId) {
    throw new Error(`Missing required Stripe Pro product ID for ${environment} environment. Please set either STRIPE_PRO_PRODUCT_ID or ${isLive ? 'STRIPE_LIVE_PRO_PRODUCT_ID' : 'STRIPE_TEST_PRO_PRODUCT_ID'}`);
  }
  
  if (!ultimateProductId) {
    throw new Error(`Missing required Stripe Ultimate product ID for ${environment} environment. Please set either STRIPE_ULTIMATE_PRODUCT_ID or ${isLive ? 'STRIPE_LIVE_ULTIMATE_PRODUCT_ID' : 'STRIPE_TEST_ULTIMATE_PRODUCT_ID'}`);
  }
  
  if (!webhookSecret) {
    throw new Error(`Missing required Stripe webhook secret for ${environment} environment. Please set either STRIPE_WEBHOOK_SECRET or ${isLive ? 'STRIPE_LIVE_WEBHOOK_SECRET' : 'STRIPE_TEST_WEBHOOK_SECRET'}`);
  }
  
  return {
    secretKey,
    proProductId,
    ultimateProductId,
    webhookSecret,
    environment: isLive ? 'live' : 'test'
  };
}

export function logStripeEnvironment(): void {
  const config = getStripeConfig();
  console.log(`[Stripe] Environment: ${config.environment.toUpperCase()}`);
  console.log(`[Stripe] Secret Key: ${config.secretKey.substring(0, 12)}...`);
  console.log(`[Stripe] Pro Product ID: ${config.proProductId}`);
  console.log(`[Stripe] Ultimate Product ID: ${config.ultimateProductId}`);
}