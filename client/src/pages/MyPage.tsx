import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, CreditCard, Calendar, Trophy } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import logoWhitePath from "@assets/logo-trans_white_1752045120411.png";

interface MyPageProps {
  onBack: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function MyPage({ onBack, language, onLanguageChange }: MyPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cancel-subscription');
    },
    onSuccess: () => {
      toast({
        title: t("subscribe.downgradeSuccess", language),
        description: t("subscribe.downgradeSuccessDesc", language),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsLoading(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.assign("/api/login");
        }, 500);
        return;
      }
      toast({
        title: t("subscribe.downgradeError", language),
        description: t("subscribe.downgradeErrorDesc", language),
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleCancelSubscription = async () => {
    const cancelButtonText = getCancelButtonText();
    const confirmMessage = cancelButtonText === t("myPage.immediateCancel", language) 
      ? "サブスクリプションをすぐにキャンセルしますか？"
      : "サブスクリプションを期間終了時にキャンセルしますか？";
    
    if (confirm(confirmMessage)) {
      setIsLoading(true);
      cancelSubscriptionMutation.mutate();
    }
  };

  const testExpiredSubscriptions = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/test-expired-subscriptions');
    },
    onSuccess: () => {
      toast({
        title: "Test Completed",
        description: "Expired subscriptions processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setSubscriptionExpired = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/test-set-subscription-expired');
    },
    onSuccess: () => {
      toast({
        title: "Test Setup Complete",
        description: "Subscription end date set to past for testing",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Test Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    }
  }, [isAuthenticated, authLoading, toast]);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getPlanBadge = () => {
    const plan = user?.subscriptionPlan || 'free';
    switch (plan) {
      case 'pro':
        return <Badge variant="default" className="bg-blue-500">Pro</Badge>;
      case 'ultimate':
        return <Badge variant="default" className="bg-purple-500">Ultimate</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getPlanStatusMessage = () => {
    if (!user) return null;
    
    const plan = user.subscriptionPlan || 'free';
    if (plan === 'free') return null;
    
    const now = new Date();
    const subscriptionStartedAt = user.subscriptionStartedAt ? new Date(user.subscriptionStartedAt) : null;
    const subscriptionPeriodEnd = user.subscriptionPeriodEnd ? new Date(user.subscriptionPeriodEnd) : null;
    
    if (user.subscriptionCancelAtPeriodEnd && subscriptionPeriodEnd) {
      const formattedDate = subscriptionPeriodEnd.toLocaleDateString();
      return (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>{t("myPage.scheduledCancellation", language)}</strong>
          </p>
          <p className="text-sm text-yellow-700">
            {t("myPage.continueUntil", language)} {formattedDate}
          </p>
          <p className="text-sm text-yellow-700">
            {t("myPage.autoDowngrade", language)}
          </p>
        </div>
      );
    }
    
    if (subscriptionPeriodEnd) {
      const formattedDate = subscriptionPeriodEnd.toLocaleDateString();
      return (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {t("myPage.activeUntil", language)} {formattedDate}
          </p>
        </div>
      );
    }
    
    return null;
  };

  const getCancelButtonText = () => {
    if (!user) return t("myPage.immediateCancel", language);
    
    const now = new Date();
    const subscriptionStartedAt = user.subscriptionStartedAt ? new Date(user.subscriptionStartedAt) : null;
    
    if (subscriptionStartedAt) {
      const daysSinceStart = (now.getTime() - subscriptionStartedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceStart < 30) {
        return t("myPage.periodEndCancel", language);
      }
    }
    
    return t("myPage.immediateCancel", language);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading", language)}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <TopNav currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>
      
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back", language)}
            </Button>
            <img src={logoWhitePath} alt="Liftify" className="h-12 w-auto" />
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <section className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{t("userMenu.myPage", language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                <AvatarFallback className="bg-coral text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email
                  }
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">{t("myPage.currentPlan", language)}:</span>
                  {getPlanBadge()}
                </div>
                {getPlanStatusMessage()}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Account Info */}
      <section className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>{t("myPage.accountInfo", language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t("myPage.subscriptionPlan", language)}</p>
                <p className="text-sm text-gray-600">
                  {user?.subscriptionPlan === 'pro' ? 'Pro プラン - ¥500/月' : 
                   user?.subscriptionPlan === 'ultimate' ? 'Ultimate プラン - ¥980/月' : 
                   'Free プラン'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => window.location.assign("/subscribe")} variant="outline" size="sm">
                  {t("userMenu.planChange", language)}
                </Button>
                {(user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'ultimate') && 
                 !user?.subscriptionCancelAtPeriodEnd && (
                  <Button 
                    onClick={handleCancelSubscription}
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    disabled={isLoading}
                  >
                    {isLoading ? t("subscribe.processing", language) : getCancelButtonText()}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t("myPage.memberSince", language)}</p>
                <p className="text-sm text-gray-600">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString(language, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'
                  }
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Summary */}
      <section className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>{t("myPage.workoutStats", language)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-coral">-</div>
                <div className="text-sm text-gray-600">{t("myPage.totalWorkouts", language)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-coral">-</div>
                <div className="text-sm text-gray-600">{t("myPage.totalVolume", language)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Testing Section (only show if user has Pro plan scheduled for cancellation) */}
      {user?.subscriptionCancelAtPeriodEnd && (
        <section className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">🧪 Testing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>These tools are for testing the 1-month cancellation system:</p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setSubscriptionExpired.mutate()}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200"
                  disabled={setSubscriptionExpired.isPending}
                >
                  {setSubscriptionExpired.isPending ? "Setting..." : "🕐 Set Subscription to Expired (Test)"}
                </Button>
                
                <Button
                  onClick={() => testExpiredSubscriptions.mutate()}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-200"
                  disabled={testExpiredSubscriptions.isPending}
                >
                  {testExpiredSubscriptions.isPending ? "Processing..." : "⚡ Process Expired Subscriptions (Test)"}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Step 1: Click "Set Subscription to Expired" to simulate 1 month passing</p>
                <p>Step 2: Click "Process Expired Subscriptions" to trigger the automatic cancellation</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}