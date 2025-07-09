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
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

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
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
    if (!isAuthenticated || authLoading) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan') || 'pro';
    setPlan(planParam);
    
    // Create subscription as soon as the page loads
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
        
        // Handle subscription-specific errors
        if (error.message.includes('400:')) {
          try {
            const errorData = JSON.parse(error.message.split('400: ')[1]);
            if (errorData.message === 'already_subscribed') {
              toast({
                title: t("subscribe.alreadySubscribed", language),
                description: t("subscribe.alreadySubscribedDesc", language).replace('{plan}', errorData.currentPlan),
                variant: "destructive",
              });
              // Redirect back to home after showing error
              setTimeout(() => {
                window.history.back();
              }, 2000);
              return;
            } else if (errorData.message === 'plan_change_required') {
              toast({
                title: t("subscribe.planChangeRequired", language),
                description: t("subscribe.planChangeRequiredDesc", language),
                variant: "destructive",
              });
              setTimeout(() => {
                window.history.back();
              }, 2000);
              return;
            }
          } catch (parseError) {
            // If parsing fails, show generic error
            console.error('Error parsing subscription error:', parseError);
          }
        }
        
        console.error('Error creating subscription:', error);
        toast({
          title: t("subscribe.error", language),
          description: t("subscribe.errorDesc", language),
          variant: "destructive",
        });
      });
  }, [isAuthenticated, authLoading, toast]);

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

  if (!clientSecret) {
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {planInfo.name} {t("subscribe.plan", language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {planInfo.price}
                </div>
                <p className="text-gray-600">{planInfo.period}</p>
              </div>
              
              <ul className="space-y-3">
                {planInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("subscribe.paymentInfo", language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm plan={plan} />
              </Elements>
            </CardContent>
          </Card>
        </div>

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