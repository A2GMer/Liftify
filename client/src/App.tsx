import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import RecordWorkout from "@/pages/RecordWorkout";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'record'>('landing');

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleNewWorkout = () => {
    setCurrentView('record');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Show landing page if not authenticated or loading
  if (isLoading || !isAuthenticated) {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  // Show authenticated views
  switch (currentView) {
    case 'record':
      return <RecordWorkout onBack={handleBackToHome} />;
    case 'home':
      return <Home onNewWorkout={handleNewWorkout} />;
    default:
      return <Home onNewWorkout={handleNewWorkout} />;
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
