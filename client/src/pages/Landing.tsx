import { HeroSection } from "@/components/HeroSection";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Smartphone, Globe } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

interface LandingProps {
  onGetStarted: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Landing({ onGetStarted, language, onLanguageChange }: LandingProps) {

  return (
    <div className="min-h-screen bg-white">
      <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      <HeroSection language={language} onGetStarted={onGetStarted} />
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t("features.title", language)}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t("features.tracking.title", language)}
                </h3>
                <p className="text-gray-600">
                  {t("features.tracking.description", language)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t("features.mobile.title", language)}
                </h3>
                <p className="text-gray-600">
                  {t("features.mobile.description", language)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t("features.global.title", language)}
                </h3>
                <p className="text-gray-600">
                  {t("features.global.description", language)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {t("cta.title", language)}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t("cta.subtitle", language)}
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-coral hover:bg-red-500 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 rounded-full"
          >
            {t("cta.startNow", language)}
          </Button>
        </div>
      </section>
    </div>
  );
}
