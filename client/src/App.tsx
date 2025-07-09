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
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'record'>('landing');
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);

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

  // Show landing page if not authenticated or loading
  if (isLoading || !isAuthenticated) {
    return <Landing onGetStarted={handleGetStarted} language={language} onLanguageChange={changeLanguage} />;
  }

  // Show authenticated views
  switch (currentView) {
    case 'record':
      return <RecordWorkout onBack={handleBackToHome} language={language} onLanguageChange={changeLanguage} editingWorkoutId={editingWorkoutId} />;
    case 'home':
      return <Home onNewWorkout={handleNewWorkout} onEditWorkout={handleEditWorkout} language={language} onLanguageChange={changeLanguage} />;
    default:
      return <Home onNewWorkout={handleNewWorkout} onEditWorkout={handleEditWorkout} language={language} onLanguageChange={changeLanguage} />;
  }
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
