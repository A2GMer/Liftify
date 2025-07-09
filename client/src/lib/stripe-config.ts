export function getStripePublicKey(): string {
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
  if (!publicKey) {
    throw new Error('Missing required Stripe public key: VITE_STRIPE_PUBLIC_KEY');
  }
  
  return publicKey;
}

export function getStripeEnvironment(): 'test' | 'live' {
  const publicKey = getStripePublicKey();
  return publicKey.startsWith('pk_live_') ? 'live' : 'test';
}

export function isStripeTestMode(): boolean {
  return getStripeEnvironment() === 'test';
}