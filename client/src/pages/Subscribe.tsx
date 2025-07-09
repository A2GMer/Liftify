import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/TopNav";
import { useLanguage } from "@/hooks/useLanguage";
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
        title: language === 'ja' ? "決済失敗" : "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: language === 'ja' ? "決済成功" : "Payment Successful",
        description: language === 'ja' ? "サブスクリプションに登録されました！" : "You are now subscribed!",
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
          ? (language === 'ja' ? '処理中...' : 'Processing...')
          : (language === 'ja' ? `${plan === 'pro' ? 'Pro' : 'Ultimate'}プランに登録` : `Subscribe to ${plan === 'pro' ? 'Pro' : 'Ultimate'}`)
        }
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState<string>("");
  const { language, changeLanguage } = useLanguage();
  
  useEffect(() => {
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
        console.error('Error creating subscription:', error);
      });
  }, []);

  const getPlanInfo = () => {
    if (plan === 'pro') {
      return {
        name: 'Pro',
        price: '¥500',
        period: language === 'ja' ? '月額' : 'per month',
        features: [
          language === 'ja' ? '無制限データ保存' : 'Unlimited data storage',
          language === 'ja' ? '高度な分析グラフ' : 'Advanced analytics charts',
          language === 'ja' ? 'タグ付け機能' : 'Tagging features',
          language === 'ja' ? 'ダークモード' : 'Dark mode',
        ]
      };
    }
    return {
      name: 'Ultimate',
      price: '¥980',
      period: language === 'ja' ? '月額' : 'per month',
      features: [
        language === 'ja' ? 'Proプランの全機能' : 'All Pro features',
        language === 'ja' ? 'AIによる分析' : 'AI-powered analysis',
        language === 'ja' ? 'メニュー提案' : 'Workout suggestions',
        language === 'ja' ? '休憩時間提案' : 'Rest time suggestions',
        language === 'ja' ? 'データエクスポート' : 'Data export',
      ]
    };
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'ja' ? '読み込み中...' : 'Loading...'}
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
            {language === 'ja' ? 'サブスクリプション登録' : 'Subscribe to Liftify'}
          </h1>
          <p className="text-gray-600">
            {language === 'ja' ? 'プランを選択して決済を完了してください' : 'Complete your subscription to unlock premium features'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {planInfo.name} {language === 'ja' ? 'プラン' : 'Plan'}
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
                {language === 'ja' ? '決済情報' : 'Payment Information'}
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
            {language === 'ja' ? '戻る' : 'Back'}
          </Button>
        </div>
      </div>
    </div>
  );
}