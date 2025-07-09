import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import RecordWorkout from "@/pages/RecordWorkout";
import Subscribe from "@/pages/Subscribe";
import MyPage from "@/pages/MyPage";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import React from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'record' | 'mypage'>('landing');
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);

  // Check for subscription success in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_intent') && urlParams.get('redirect_status') === 'succeeded') {
      // Payment was successful, show success message and clean URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      // Show success notification would go here if needed
    }
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleNewWorkout = () => {
    setEditingWorkoutId(null);
    setCurrentView('record');
  };

  const handleEditWorkout = (workoutId: number) => {
    setEditingWorkoutId(workoutId);
    setCurrentView('record');
  };

  const handleBackToHome = () => {
    setEditingWorkoutId(null);
    setCurrentView('home');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleMyPage = () => {
    setCurrentView('mypage');
  };

  const handlePlanChange = () => {
    setCurrentView('home'); // Navigate to home first, then to subscribe
    window.location.href = "/subscribe";
  };

  return (
    <Switch>
      <Route path="/subscribe">
        <Subscribe />
      </Route>
      <Route path="/">
        {/* Show landing page if not authenticated or loading */}
        {isLoading || !isAuthenticated ? (
          <Landing onGetStarted={handleGetStarted} language={language} onLanguageChange={changeLanguage} />
        ) : (
          /* Show authenticated views */
          <>
            {currentView === 'record' && (
              <RecordWorkout onBack={handleBackToHome} language={language} onLanguageChange={changeLanguage} editingWorkoutId={editingWorkoutId} />
            )}
            {currentView === 'mypage' && (
              <MyPage onBack={handleBackToHome} onPlanChange={handlePlanChange} language={language} onLanguageChange={changeLanguage} />
            )}
            {currentView === 'home' && (
              <Home onNewWorkout={handleNewWorkout} onEditWorkout={handleEditWorkout} onMyPage={handleMyPage} onPlanChange={handlePlanChange} language={language} onLanguageChange={changeLanguage} />
            )}
            {currentView === 'landing' && (
              <Home onNewWorkout={handleNewWorkout} onEditWorkout={handleEditWorkout} onMyPage={handleMyPage} onPlanChange={handlePlanChange} language={language} onLanguageChange={changeLanguage} />
            )}
          </>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
