import { useEffect } from "react";
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
import logoWhitePath from "@assets/logo-trans_white_1752045120411.png";

interface MyPageProps {
  onBack: () => void;
  onPlanChange: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function MyPage({ onBack, onPlanChange, language, onLanguageChange }: MyPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
              <Button onClick={onPlanChange} variant="outline" size="sm">
                {t("userMenu.planChange", language)}
              </Button>
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
    </div>
  );
}