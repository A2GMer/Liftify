import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { t } from "@/lib/i18n";

export function TopNav() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const handleMyPage = () => {
    window.location.href = "/my-page";
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src="/logo-trans_white.png" 
            alt="Liftify" 
            className="h-8 w-auto" 
          />
          <span className="font-bold text-lg text-black dark:text-white">
            Liftify
          </span>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* User Menu (only when authenticated) */}
          {isAuthenticated && (
            <UserMenu language={language} onMyPage={handleMyPage} />
          )}
          
          {/* Get Started button (only when not authenticated) */}
          {!isAuthenticated && (
            <a
              href="/api/login"
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              {t("getStarted", language)}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}