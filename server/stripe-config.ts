interface StripeConfig {
  secretKey: string;
  proProductId: string;
  ultimateProductId: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}

interface LanguageSpecificConfig {
  secretKey: string;
  proProductIds: {
    en: string;
    ja: string;
    fr: string;
    de: string;
  };
  ultimateProductIds: {
    en: string;
    ja: string;
    fr: string;
    de: string;
  };
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

export function getLanguageSpecificStripeConfig(): LanguageSpecificConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Missing required Stripe secret key: STRIPE_SECRET_KEY');
  }
  
  // Determine environment from secret key prefix
  const environment = secretKey.startsWith('sk_live_') ? 'live' : 'test';
  
  // Get environment-specific webhook secret
  let webhookSecret: string;
  if (environment === 'live') {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || process.env.STRIPE_WEBHOOK_SECRET;
  } else {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;
  }
  
  if (!webhookSecret) {
    throw new Error(`Missing required Stripe webhook secret for ${environment} environment`);
  }
  
  // Get language-specific product IDs
  const getProductIds = (type: 'PRO' | 'ULTIMATE') => {
    const suffix = environment === 'live' ? '_LIVE' : '_TEST';
    const fallbackSuffix = '';
    
    return {
      en: process.env[`STRIPE_${type}_PRODUCT_ID_EN${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID_EN${fallbackSuffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${fallbackSuffix}`],
      ja: process.env[`STRIPE_${type}_PRODUCT_ID_JA${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID_JA${fallbackSuffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${fallbackSuffix}`],
      fr: process.env[`STRIPE_${type}_PRODUCT_ID_FR${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID_FR${fallbackSuffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${fallbackSuffix}`],
      de: process.env[`STRIPE_${type}_PRODUCT_ID_DE${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID_DE${fallbackSuffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${suffix}`] || process.env[`STRIPE_${type}_PRODUCT_ID${fallbackSuffix}`],
    };
  };
  
  const proProductIds = getProductIds('PRO');
  const ultimateProductIds = getProductIds('ULTIMATE');
  
  // Validate that at least one product ID is available for each tier
  if (!proProductIds.en && !proProductIds.ja && !proProductIds.fr && !proProductIds.de) {
    throw new Error(`Missing required Stripe Pro product IDs for ${environment} environment`);
  }
  
  if (!ultimateProductIds.en && !ultimateProductIds.ja && !ultimateProductIds.fr && !ultimateProductIds.de) {
    throw new Error(`Missing required Stripe Ultimate product IDs for ${environment} environment`);
  }
  
  return {
    secretKey,
    proProductIds,
    ultimateProductIds,
    webhookSecret,
    environment
  };
}

export function getProductIdForLanguage(tier: 'pro' | 'ultimate', language: 'en' | 'ja' | 'fr' | 'de'): string {
  const config = getLanguageSpecificStripeConfig();
  
  if (tier === 'pro') {
    const productId = config.proProductIds[language];
    if (!productId) {
      throw new Error(`Missing Pro product ID for language: ${language}`);
    }
    return productId;
  } else {
    const productId = config.ultimateProductIds[language];
    if (!productId) {
      throw new Error(`Missing Ultimate product ID for language: ${language}`);
    }
    return productId;
  }
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

export function logLanguageSpecificStripeConfig(): void {
  const config = getLanguageSpecificStripeConfig();
  console.log(`[Stripe] Language-specific configuration loaded for ${config.environment.toUpperCase()} environment`);
  console.log(`[Stripe] Pro Product IDs:`, {
    en: config.proProductIds.en ? `${config.proProductIds.en.substring(0, 12)}...` : 'not set',
    ja: config.proProductIds.ja ? `${config.proProductIds.ja.substring(0, 12)}...` : 'not set',
    fr: config.proProductIds.fr ? `${config.proProductIds.fr.substring(0, 12)}...` : 'not set',
    de: config.proProductIds.de ? `${config.proProductIds.de.substring(0, 12)}...` : 'not set',
  });
  console.log(`[Stripe] Ultimate Product IDs:`, {
    en: config.ultimateProductIds.en ? `${config.ultimateProductIds.en.substring(0, 12)}...` : 'not set',
    ja: config.ultimateProductIds.ja ? `${config.ultimateProductIds.ja.substring(0, 12)}...` : 'not set',
    fr: config.ultimateProductIds.fr ? `${config.ultimateProductIds.fr.substring(0, 12)}...` : 'not set',
    de: config.ultimateProductIds.de ? `${config.ultimateProductIds.de.substring(0, 12)}...` : 'not set',
  });
}