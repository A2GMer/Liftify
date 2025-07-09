import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, TrendingUp, Activity, Heart, Zap, Shield } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import chestVideoPath from "@assets/chest_1752043528152.mp4";
import logoPath from "@assets/logo-trans_1752044551302.png";
import logoWhitePath from "@assets/logo-trans_white_1752045120411.png";

interface LandingProps {
  onGetStarted: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Landing({ onGetStarted, language, onLanguageChange }: LandingProps) {

  return (
    <div className="min-h-screen bg-white">
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logoWhitePath} alt="Liftify" className="h-12 w-auto" />
          <span className="text-white font-bold text-xl drop-shadow-lg">Liftify</span>
        </div>
        <div className="absolute top-0 right-0 p-4">
          <TopNav currentLanguage={language} onLanguageChange={onLanguageChange} showSignOut={false} />
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.6) contrast(1.1)' }}
        >
          <source src={chestVideoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {language === 'ja' ? 'ベンチプレスを' : 'Perfect Your'}
            <br />
            <span className="text-gray-200">
              {language === 'ja' ? '極める' : 'Bench Press'}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {language === 'ja' 
              ? 'タップ操作だけで記録。データで成長を可視化。科学的アプローチで限界突破。'
              : 'Track with taps. Visualize growth with data. Break limits with science.'
            }
          </p>
          
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl backdrop-blur-sm"
          >
            {language === 'ja' ? 'トレーニングを始める' : 'Start Training'}
          </Button>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {language === 'ja' 
              ? '従来の記録方法では限界がある' 
              : 'Traditional tracking holds you back'
            }
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {language === 'ja'
              ? 'ジムでスマホを取り出し、アプリを開いて、重量と回数を入力。この繰り返しが集中力を削ぎ、トレーニングの質を下げている。'
              : 'Pulling out your phone, opening apps, typing weights and reps. This constant interruption breaks focus and reduces training quality.'
            }
          </p>
        </div>
      </section>

      {/* Three Key Strengths */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            {language === 'ja' ? 'Liftifyの3つの強み' : 'Three Core Strengths'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Minimal Input */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {language === 'ja' ? '極限まで減らした入力操作' : 'Minimal Input Operations'}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {language === 'ja'
                  ? 'タップのみで重量・回数を調整。文字入力は一切不要。集中力を維持したまま、素早く記録できる。'
                  : 'Adjust weights and reps with simple taps. No typing required. Maintain focus while recording quickly.'
                }
              </p>
            </div>

            {/* Visual Progress */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {language === 'ja' ? 'ビジュアル化された記録追跡' : 'Visual Progress Tracking'}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {language === 'ja'
                  ? 'グラフで成長を一目で確認。1RM推定値の変化も可視化。モチベーション維持に最適。'
                  : 'See your growth at a glance with charts. Visualize 1RM estimates over time. Perfect for staying motivated.'
                }
              </p>
            </div>

            {/* Volume-Based Tracking */}
            <div className="text-center">
              <div className="bg-black text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {language === 'ja' ? 'ボリューム量計測による定量的記録' : 'Quantitative Volume Tracking'}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {language === 'ja'
                  ? '総ボリューム（重量×回数）を自動計算。科学的根拠に基づいた定量的なトレーニング分析。'
                  : 'Automatic volume calculation (weight × reps). Evidence-based quantitative training analysis.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            {language === 'ja' ? 'なぜ胸筋を鍛えるべきか' : 'Why Train Your Chest'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                {language === 'ja' ? '科学的に証明された効果' : 'Scientifically Proven Benefits'}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'ja' ? '心血管機能の向上' : 'Cardiovascular Health'}
                    </h4>
                    <p className="text-gray-600">
                      {language === 'ja'
                        ? 'レジスタンストレーニングは心血管疾患リスクを15-20%削減する研究結果があります。'
                        : 'Resistance training reduces cardiovascular disease risk by 15-20% according to research.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'ja' ? '基礎代謝の向上' : 'Metabolic Enhancement'}
                    </h4>
                    <p className="text-gray-600">
                      {language === 'ja'
                        ? '筋肉量1kg増加で基礎代謝は約13kcal/日向上。長期的な体重管理に効果的。'
                        : '1kg of muscle mass increases basal metabolism by ~13kcal/day. Effective for long-term weight management.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'ja' ? '骨密度の向上' : 'Bone Density'}
                    </h4>
                    <p className="text-gray-600">
                      {language === 'ja'
                        ? 'ベンチプレスなどの多関節運動は骨密度を1-3%向上させ、骨粗鬆症予防に効果的。'
                        : 'Compound movements like bench press improve bone density by 1-3%, preventing osteoporosis.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold mb-4 text-gray-900">
                {language === 'ja' ? '研究データ' : 'Research Data'}
              </h4>
              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '週2-3回の胸筋トレーニング' : 'Chest training 2-3x per week'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">+23%</p>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '上半身筋力向上' : 'Upper body strength gain'}
                  </p>
                </div>
                
                <div className="border-l-4 border-gray-400 pl-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '12週間継続後' : 'After 12 weeks'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">+15%</p>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '筋肉量増加' : 'Muscle mass increase'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'ja' ? '今すぐ始めよう' : 'Start Your Journey'}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {language === 'ja'
              ? '科学的根拠に基づいた効率的なトレーニング記録で、あなたの限界を突破しよう。'
              : 'Break through your limits with efficient, science-based training records.'
            }
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl"
          >
            {language === 'ja' ? 'Liftifyを始める' : 'Start with Liftify'}
          </Button>
        </div>
      </section>
    </div>
  );
}
