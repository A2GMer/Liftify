import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/TopNav";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { t } from "@/lib/i18n";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    // Validate payment element is complete
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast({
        title: t("subscribe.paymentInfoRequired", language),
        description: t("subscribe.paymentInfoRequiredDesc", language),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: t("subscribe.paymentFailed", language),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("subscribe.paymentSuccess", language),
        description: t("subscribe.subscribedSuccess", language),
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
      >
        {isProcessing 
          ? t("subscribe.processing", language)
          : `${t("subscribe.subscribeTo", language)} ${plan === 'pro' ? 'Pro' : 'Ultimate'}`
        }
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState<string>("");
  const [userPlan, setUserPlan] = useState<string>("free");
  const [isDowngrading, setIsDowngrading] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);
  
  useEffect(() => {
    if (!isAuthenticated || authLoading || !user) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan') || 'pro';
    setPlan(planParam);
    
    // Set user's current plan
    setUserPlan(user.subscriptionPlan || 'free');
    
    // If user is trying to subscribe to a plan they already have, show error
    if (user.subscriptionPlan === planParam && user.subscriptionStatus === 'active') {
      toast({
        title: t("subscribe.alreadySubscribed", language),
        description: t("subscribe.alreadySubscribedDesc", language),
        variant: "destructive",
      });
      return;
    }
    
    // Only create subscription for pro plan (ultimate is disabled)
    if (planParam === 'pro' && user.subscriptionPlan !== 'pro') {
      apiRequest("POST", "/api/create-subscription", { plan: planParam })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          
          console.error('Error creating subscription:', error);
          toast({
            title: "Error",
            description: "Failed to create subscription. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, authLoading, user, language, toast]);

  const handleDowngrade = async () => {
    if (userPlan === 'free') return;
    
    setIsDowngrading(true);
    
    try {
      await apiRequest("POST", "/api/cancel-subscription");
      
      toast({
        title: t("subscribe.downgradeSuccess", language),
        description: t("subscribe.downgradeSuccessDesc", language),
      });
      
      // Refresh page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error downgrading:', error);
      toast({
        title: t("subscribe.downgradeError", language),
        description: t("subscribe.downgradeErrorDesc", language),
        variant: "destructive",
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const handlePlanSelect = (selectedPlan: string) => {
    if (selectedPlan === 'pro' && userPlan !== 'pro') {
      // If payment form is already shown and user hasn't filled it
      if (plan === 'pro' && clientSecret) {
        // Scroll to payment form
        const paymentForm = document.querySelector('[data-testid="payment-form"]');
        if (paymentForm) {
          paymentForm.scrollIntoView({ behavior: 'smooth' });
          toast({
            title: t("subscribe.paymentInfoRequired", language),
            description: t("subscribe.paymentInfoRequiredDesc", language),
            variant: "destructive",
          });
          return;
        }
      }
      // Otherwise proceed with plan selection
      window.location.href = '/subscribe?plan=pro';
    }
  };

  const getPlanInfo = () => {
    if (plan === 'pro') {
      return {
        name: t("pricing.pro", language),
        price: '¥500',
        period: t("subscribe.perMonth", language),
        features: [
          t("subscribe.proFeature1", language),
          t("subscribe.proFeature2", language),
          t("subscribe.proFeature3", language),
          t("subscribe.proFeature4", language),
        ]
      };
    }
    return {
      name: t("pricing.ultimate", language),
      price: '¥980',
      period: t("subscribe.perMonth", language),
      features: [
        t("subscribe.ultimateFeature1", language),
        t("subscribe.ultimateFeature2", language),
        t("subscribe.ultimateFeature3", language),
        t("subscribe.ultimateFeature4", language),
        t("subscribe.ultimateFeature5", language),
      ]
    };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">
            {t("loading", language)}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // Don't show loading if we're not creating a subscription
  if (plan === 'pro' && userPlan !== 'pro' && !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">
            {t("loading", language)}
          </p>
        </div>
      </div>
    );
  }

  const planInfo = getPlanInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <TopNav currentLanguage={language} onLanguageChange={changeLanguage} />
      </nav>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("subscribe.title", language)}
          </h1>
          <p className="text-gray-600">
            {t("subscribe.subtitle", language)}
          </p>
        </div>

        {/* All Plans Display */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Free Plan */}
          <Card className={`${userPlan === 'free' ? 'border-green-500 bg-green-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-center">
                {t("pricing.free", language)}
                {userPlan === 'free' && <span className="text-green-600 text-sm ml-2">({t("subscribe.current", language)})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">¥0</div>
                <p className="text-gray-600">{t("subscribe.perMonth", language)}</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.freeFeature1", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.freeFeature2", language)}</span>
                </li>
              </ul>
              <Button 
                disabled={userPlan === 'free' || isDowngrading}
                className={`w-full ${userPlan === 'free' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={() => userPlan !== 'free' && handleDowngrade()}
              >
                {isDowngrading 
                  ? t("subscribe.processing", language)
                  : userPlan === 'free' 
                    ? t("subscribe.currentPlan", language) 
                    : t("subscribe.downgrade", language)
                }
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`${userPlan === 'pro' ? 'border-green-500 bg-green-50' : plan === 'pro' ? 'border-blue-500 bg-blue-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-center">
                {t("pricing.pro", language)}
                {userPlan === 'pro' && <span className="text-green-600 text-sm ml-2">({t("subscribe.current", language)})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">¥500</div>
                <p className="text-gray-600">{t("subscribe.perMonth", language)}</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.proFeature1", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.proFeature2", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.proFeature3", language)}</span>
                </li>
              </ul>
              <Button 
                disabled={userPlan === 'pro'}
                className={`w-full ${userPlan === 'pro' ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => handlePlanSelect('pro')}
              >
                {userPlan === 'pro' ? t("subscribe.currentPlan", language) : t("subscribe.selectPlan", language)}
              </Button>
            </CardContent>
          </Card>

          {/* Ultimate Plan */}
          <Card className={`${userPlan === 'ultimate' ? 'border-green-500 bg-green-50' : plan === 'ultimate' ? 'border-purple-500 bg-purple-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-center">
                {t("pricing.ultimate", language)}
                {userPlan === 'ultimate' && <span className="text-green-600 text-sm ml-2">({t("subscribe.current", language)})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">¥980</div>
                <p className="text-gray-600">{t("subscribe.perMonth", language)}</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.ultimateFeature1", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.ultimateFeature2", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.ultimateFeature3", language)}</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{t("subscribe.ultimateFeature4", language)}</span>
                </li>
              </ul>
              <Button 
                disabled={true}
                className="w-full bg-gray-500 cursor-not-allowed"
              >
                {t("subscribe.comingSoon", language)}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected Plan Payment Form */}
        {plan && plan !== 'free' && userPlan !== plan && clientSecret && (
          <Card data-testid="payment-form">
            <CardHeader>
              <CardTitle className="text-center">
                {t("subscribe.paymentInfo", language)} - {plan === 'pro' ? t("pricing.pro", language) : t("pricing.ultimate", language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm plan={plan} />
              </Elements>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mr-4"
          >
            {t("common.back", language)}
          </Button>
        </div>
      </div>
    </div>
  );
}