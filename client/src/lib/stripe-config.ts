export function getStripePublicKey(): string {
  const environment = import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test';
  const isLive = environment === 'live';
  
  if (!['test', 'live'].includes(environment)) {
    throw new Error(`Invalid VITE_STRIPE_ENVIRONMENT: ${environment}. Must be 'test' or 'live'`);
  }
  
  // Try new environment-specific variables first, fallback to existing ones
  const publicKey = isLive 
    ? (import.meta.env.VITE_STRIPE_LIVE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    : (import.meta.env.VITE_STRIPE_TEST_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    
  if (!publicKey) {
    throw new Error(`Missing Stripe public key for ${environment} environment. Please set either VITE_STRIPE_PUBLIC_KEY or ${isLive ? 'VITE_STRIPE_LIVE_PUBLIC_KEY' : 'VITE_STRIPE_TEST_PUBLIC_KEY'}`);
  }
  
  return publicKey;
}

export function getStripeEnvironment(): 'test' | 'live' {
  const environment = import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test';
  return environment as 'test' | 'live';
}

export function isStripeTestMode(): boolean {
  return getStripeEnvironment() === 'test';
}