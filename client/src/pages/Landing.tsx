import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Shield,
} from "lucide-react";
import { t, type Language } from "@/lib/i18n";

import logoPath from "@assets/logo-trans_1752044551302.png";
import logoWhitePath from "@assets/logo-trans_white_1752045120411.png";

interface LandingProps {
  onGetStarted: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Landing({
  onGetStarted,
  language,
  onLanguageChange,
}: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logoWhitePath} alt="Liftify" className="h-12 w-auto" />
        </div>
        <div className="absolute top-0 left-0 p-4 ml-16">
          <TopNav
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient"></div>
        
        {/* Secondary Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {t("landing.heroTitle", language)}
            <br />
            <span className="text-gray-200">
              {t("landing.heroTitleSecond", language)}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {t("landing.heroSubtitle", language)}
          </p>

          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl backdrop-blur-sm"
          >
            {t("landing.startTraining", language)}
          </Button>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t("landing.problemTitle", language)}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("landing.problemDesc", language)}
          </p>
        </div>
      </section>

      {/* Three Key Strengths */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            {t("landing.strengthsTitle", language)}
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Minimal Input */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t("landing.strength1Title", language)}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t("landing.strength1Desc", language)}
              </p>
            </div>

            {/* Visual Progress */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t("landing.strength2Title", language)}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t("landing.strength2Desc", language)}
              </p>
            </div>

            {/* Volume-Based Tracking */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t("landing.strength3Title", language)}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t("landing.strength3Desc", language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            {language === "ja"
              ? "なぜ胸筋を鍛えるべきか"
              : "Why Train Your Chest"}
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                {language === "ja"
                  ? "科学的に証明された効果"
                  : "Scientifically Proven Benefits"}
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === "ja"
                        ? "心血管機能の向上"
                        : "Cardiovascular Health"}
                    </h4>
                    <p className="text-gray-600">
                      {language === "ja"
                        ? "レジスタンストレーニングは心血管疾患リスクを15-20%削減する研究結果があります。"
                        : "Resistance training reduces cardiovascular disease risk by 15-20% according to research."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === "ja"
                        ? "基礎代謝の向上"
                        : "Metabolic Enhancement"}
                    </h4>
                    <p className="text-gray-600">
                      {language === "ja"
                        ? "筋肉量1kg増加で基礎代謝は約13kcal/日向上。長期的な体重管理に効果的。"
                        : "1kg of muscle mass increases basal metabolism by ~13kcal/day. Effective for long-term weight management."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === "ja" ? "骨密度の向上" : "Bone Density"}
                    </h4>
                    <p className="text-gray-600">
                      {language === "ja"
                        ? "ベンチプレスなどの多関節運動は骨密度を1-3%向上させ、骨粗鬆症予防に効果的。"
                        : "Compound movements like bench press improve bone density by 1-3%, preventing osteoporosis."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold mb-4 text-gray-900">
                {language === "ja" ? "研究データ" : "Research Data"}
              </h4>
              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "週2-3回の胸筋トレーニング"
                      : "Chest training 2-3x per week"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">+23%</p>
                  <p className="text-sm text-gray-600">
                    {language === "ja"
                      ? "上半身筋力向上"
                      : "Upper body strength gain"}
                  </p>
                </div>

                <div className="border-l-4 border-gray-400 pl-4">
                  <p className="text-sm text-gray-600">
                    {language === "ja" ? "12週間継続後" : "After 12 weeks"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">+15%</p>
                  <p className="text-sm text-gray-600">
                    {language === "ja" ? "筋肉量増加" : "Muscle mass increase"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              {language === "ja" ? "料金プラン" : "Pricing Plans"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === "ja"
                ? "あなたのトレーニングレベルに合わせたプランをお選びください"
                : "Choose the plan that fits your training level"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === "ja" ? "Free" : "Free"}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {t("pricing.freePrice", language)}
                  </div>
                  <p className="text-gray-600">
                    {language === "ja" ? "永久無料" : "Forever free"}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "基本的な記録機能"
                        : "Basic recording features"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "最新30回分のデータ"
                        : "Last 30 workouts of data"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja" ? "基本統計表示" : "Basic statistics"}
                    </span>
                  </li>
                </ul>

                <Button
                  onClick={onGetStarted}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
                >
                  {language === "ja" ? "無料で始める" : "Start Free"}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {language === "ja" ? "人気" : "Popular"}
                </span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {t("pricing.proPrice", language)}
                  </div>
                  <p className="text-gray-600">
                    {language === "ja" ? "月額" : "per month"}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "無制限データ保存"
                        : "Unlimited data storage"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "高度な分析グラフ"
                        : "Advanced analytics charts"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja" ? "タグ付け機能" : "Tagging features"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja" ? "ダークモード" : "Dark mode"}
                    </span>
                  </li>
                </ul>

                <Button
                  onClick={() => window.open("/subscribe?plan=pro", "_blank")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                >
                  {language === "ja" ? "Proプランを選択" : "Choose Pro"}
                </Button>
              </CardContent>
            </Card>

            {/* Ultimate Plan */}
            <Card className="relative border-2 border-gray-300 opacity-75">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Ultimate
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {t("pricing.ultimatePrice", language)}
                  </div>
                  <p className="text-gray-600">
                    {language === "ja" ? "月額" : "per month"}
                  </p>
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full mt-2">
                    {language === "ja" ? "Coming Soon" : "Coming Soon"}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "Proプランの全機能"
                        : "All Pro features"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "AIによる分析"
                        : "AI-powered analysis"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "メニュー提案"
                        : "Workout suggestions"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja"
                        ? "休憩時間提案"
                        : "Rest time suggestions"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      {language === "ja" ? "データエクスポート" : "Data export"}
                    </span>
                  </li>
                </ul>

                <Button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 cursor-not-allowed"
                >
                  {language === "ja" ? "Coming Soon" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === "ja" ? "今すぐ始めよう" : "Start Your Journey"}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {language === "ja"
              ? "科学的根拠に基づいた効率的なトレーニング記録で、あなたの限界を突破しよう。"
              : "Break through your limits with efficient, science-based training records."}
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl"
          >
            {language === "ja" ? "Liftifyを始める" : "Start with Liftify"}
          </Button>
        </div>
      </section>
    </div>
  );
}
