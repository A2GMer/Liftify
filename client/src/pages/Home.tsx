import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TopNav } from "@/components/TopNav";
import { WorkoutChart } from "@/components/WorkoutChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, LogOut } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { WorkoutWithSets } from "@shared/schema";
import logoWhitePath from "@assets/logo-trans_white_1752045120411.png";

interface HomeProps {
  onNewWorkout: () => void;
  onEditWorkout: (workoutId: number) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Home({ onNewWorkout, onEditWorkout, language, onLanguageChange }: HomeProps) {
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

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/analytics/user-stats'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['/api/workouts'],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
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
        <TopNav currentLanguage={language} onLanguageChange={onLanguageChange} showSignOut={true} />
      </div>
      
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logoWhitePath} alt="Liftify" className="h-10 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {t("home.welcome", language)}
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-coral hover:text-red-500 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-coral">
                  {userStats?.currentMax || 0}kg
                </div>
              )}
              <div className="text-sm text-gray-600">
                {t("home.stats.currentMax", language)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-coral">
                  {userStats?.thisWeekWorkouts || 0}
                </div>
              )}
              <div className="text-sm text-gray-600">
                {t("home.stats.thisWeek", language)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-coral">
                  +{userStats?.monthlyGain || 0}kg
                </div>
              )}
              <div className="text-sm text-gray-600">
                {t("home.stats.monthlyGain", language)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
              ) : (
                <div className="text-2xl font-bold text-coral">
                  {userStats?.estimated1RM || 0}kg
                </div>
              )}
              <div className="text-sm text-gray-600">
                想定1RM
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chart Section */}
      <section className="p-4">
        <WorkoutChart language={language} />
      </section>

      {/* Recent Workouts */}
      <section className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          {t("home.recent.title", language)}
        </h2>
        <div className="space-y-3">
          {workoutsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : workouts?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No workouts yet. Start tracking your progress!</p>
                <Button onClick={onNewWorkout} className="bg-coral hover:bg-red-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            workouts?.slice(0, 5).map((workout: WorkoutWithSets) => {
              const totalVolume = workout.sets.reduce((sum, set) => 
                sum + (parseFloat(set.weight) * set.reps), 0
              );
              const totalSets = workout.sets.length;
              const avgWeight = totalSets > 0 ? 
                workout.sets.reduce((sum, set) => sum + parseFloat(set.weight), 0) / totalSets : 0;
              const avgReps = totalSets > 0 ? 
                workout.sets.reduce((sum, set) => sum + set.reps, 0) / totalSets : 0;

              return (
                <Card key={workout.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4" onClick={() => onEditWorkout(workout.id)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {avgWeight.toFixed(1)}kg × {avgReps.toFixed(0)} × {totalSets}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(workout.date).toLocaleDateString(language, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}, {workout.time}
                        </div>
                      </div>
                      <div className="text-coral font-bold">
                        {Math.round(totalVolume)}kg
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <Button
        onClick={onNewWorkout}
        className="fixed bottom-6 right-6 bg-coral hover:bg-red-500 text-white w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-30"
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
}
