import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, Users, Zap } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

interface HeroSectionProps {
  language: Language;
  onGetStarted: () => void;
}

export function HeroSection({ language, onGetStarted }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // GSAP animations
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      
      const tl = gsap.timeline();
      
      // Hero background animation
      tl.from(heroRef.current, {
        duration: 1,
        scale: 1.1,
        opacity: 0,
        ease: "power2.out"
      });
      
      // Title animation
      tl.from(titleRef.current, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out"
      }, "-=0.5");
      
      // Subtitle animation
      tl.from(subtitleRef.current, {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out"
      }, "-=0.7");
      
      // Stats animation
      if (statsRef.current?.children) {
        tl.from(statsRef.current.children, {
          duration: 0.8,
          y: 20,
          opacity: 0,
          stagger: 0.1,
          ease: "power2.out"
        }, "-=0.5");
      }
      
      // Button animation
      tl.from(buttonRef.current, {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out"
      }, "-=0.3");

      // Floating animation for the dumbbell icon
      gsap.to(".dumbbell-icon", {
        duration: 2,
        y: -10,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    };

    loadGSAP();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="hero-animation min-h-screen flex items-center justify-center text-white relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-black opacity-20 animate-pulse"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="mb-8">
          <div className="dumbbell-icon mb-6 inline-block">
            <div className="w-20 h-20 bg-gradient-to-r from-coral to-red-500 rounded-full flex items-center justify-center mx-auto pulse-animation">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            {t("hero.title", language)}
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl mb-8 opacity-90 text-gray-200"
          >
            {t("hero.subtitle", language)}
          </p>
          
          <div ref={statsRef} className="flex justify-center mb-8 space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-coral">45kg</div>
              <div className="text-sm opacity-75 text-gray-300">
                {t("hero.stats.average", language)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-coral">156</div>
              <div className="text-sm opacity-75 text-gray-300">
                {t("hero.stats.workouts", language)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-coral">+25%</div>
              <div className="text-sm opacity-75 text-gray-300">
                {t("hero.stats.progress", language)}
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          ref={buttonRef}
          onClick={onGetStarted}
          size="lg"
          className="bg-coral hover:bg-red-500 text-white px-8 py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg rounded-full"
        >
          <Zap className="w-5 h-5 mr-2" />
          {t("cta.getStarted", language)}
        </Button>
      </div>
    </section>
  );
}
