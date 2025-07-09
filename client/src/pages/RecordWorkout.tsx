import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, Trash2, Minus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  powerBelt: boolean;
  buttUp: boolean;
  assistance: boolean;
  failed: boolean;
  cheating: boolean;
  cheatingWeight?: number;
  cheatingReps?: number;
  notes: string;
  showNotes: boolean;
}

interface RecordWorkoutProps {
  onBack: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function RecordWorkout({ onBack, language, onLanguageChange }: RecordWorkoutProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [workoutDate, setWorkoutDate] = useState('');
  const [workoutTime, setWorkoutTime] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [sets, setSets] = useState<SetData[]>([
    {
      setNumber: 1,
      weight: 65,
      reps: 5,
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      cheating: false,
      notes: '',
      showNotes: false,
    },
    {
      setNumber: 2,
      weight: 65,
      reps: 5,
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      cheating: false,
      notes: '',
      showNotes: false,
    },
  ]);

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

  // Set current date and time
  useEffect(() => {
    const now = new Date();
    setWorkoutDate(now.toISOString().split('T')[0]);
    setWorkoutTime(now.toTimeString().slice(0, 5));
  }, []);

  // Helper functions for tap-based controls
  const updateSetWeight = (index: number, increment: boolean) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        const newWeight = increment ? set.weight + 5 : Math.max(0, set.weight - 5);
        return { ...set, weight: newWeight };
      }
      return set;
    }));
  };

  const updateSetReps = (index: number, increment: boolean) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        const newReps = increment ? set.reps + 1 : Math.max(0, set.reps - 1);
        return { ...set, reps: newReps };
      }
      return set;
    }));
  };

  const toggleSetNotes = (index: number) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        return { ...set, showNotes: !set.showNotes };
      }
      return set;
    }));
  };

  const updateSetNotes = (index: number, notes: string) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        return { ...set, notes };
      }
      return set;
    }));
  };

  const toggleSetOption = (index: number, option: keyof SetData) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        return { ...set, [option]: !set[option] };
      }
      return set;
    }));
  };

  const toggleCheating = (index: number) => {
    setSets(prev => prev.map((set, i) => {
      if (i === index) {
        if (!set.cheating) {
          // Enable cheating mode - store current weight/reps as cheating values and show notes
          return {
            ...set,
            cheating: true,
            cheatingWeight: set.weight,
            cheatingReps: set.reps,
            showNotes: true, // Automatically show notes when cheating is enabled
          };
        } else {
          // Disable cheating mode - clear cheating values
          return {
            ...set,
            cheating: false,
            cheatingWeight: undefined,
            cheatingReps: undefined,
          };
        }
      }
      return set;
    }));
  };

  const saveWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/workouts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/daily-volume'] });
      
      toast({
        title: "Success",
        description: t("success.workoutSaved", language),
      });
      onBack();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: t("error.generic", language),
        variant: "destructive",
      });
    },
  });

  const handleSaveWorkout = () => {
    if (!workoutDate || !workoutTime) {
      toast({
        title: "Error",
        description: "Please fill in date and time",
        variant: "destructive",
      });
      return;
    }

    const validSets = sets.filter(set => set.weight > 0 && set.reps > 0);
    if (validSets.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one set with weight and reps",
        variant: "destructive",
      });
      return;
    }

    // Process sets and cheating sets separately
    const allSets: any[] = [];
    
    validSets.forEach(set => {
      // Add the main set
      allSets.push({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        powerBelt: set.powerBelt,
        buttUp: set.buttUp,
        assistance: set.assistance,
        failed: set.failed,
        notes: set.notes,
      });
      
      // Add cheating set if it exists
      if (set.cheating && set.cheatingWeight && set.cheatingReps) {
        allSets.push({
          setNumber: set.setNumber,
          weight: set.cheatingWeight,
          reps: set.cheatingReps,
          powerBelt: set.powerBelt,
          buttUp: set.buttUp,
          assistance: set.assistance,
          failed: false, // cheating sets are not failed
          notes: `チーティング: ${set.notes}`,
          isCheatingSet: true,
        });
      }
    });

    const workoutData = {
      workout: {
        date: workoutDate,
        time: workoutTime,
        notes: workoutNotes,
      },
      sets: allSets,
    };

    saveWorkoutMutation.mutate(workoutData);
  };

  const addSet = () => {
    const newSet: SetData = {
      setNumber: sets.length + 1,
      weight: sets.length > 0 ? sets[sets.length - 1].weight : 65,
      reps: sets.length > 0 ? sets[sets.length - 1].reps : 5,
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      cheating: false,
      notes: '',
      showNotes: false,
    };
    setSets([...sets, newSet]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      // Renumber sets
      const renumberedSets = newSets.map((set, i) => ({
        ...set,
        setNumber: i + 1,
      }));
      setSets(renumberedSets);
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
      <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:text-coral hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">
            {t("record.title", language)}
          </h1>
          <Button
            onClick={handleSaveWorkout}
            disabled={saveWorkoutMutation.isPending}
            className="bg-coral hover:bg-red-500 px-4 py-2 text-sm font-semibold"
          >
            {saveWorkoutMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                {t("record.save", language)}
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Workout Info */}
      <section className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{t("record.date", language)}</Label>
                <Input
                  id="date"
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="focus:ring-coral focus:border-coral"
                />
              </div>
              <div>
                <Label htmlFor="time">{t("record.time", language)}</Label>
                <Input
                  id="time"
                  type="time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  className="focus:ring-coral focus:border-coral"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sets */}
      <section className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("record.sets.title", language)}
        </h2>

        <div className="space-y-4">
          {sets.map((set, index) => (
            <Card key={index} className="animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {t("record.sets.set", language)} {set.setNumber}
                  </h3>
                  {sets.length > 1 && (
                    <Button
                      onClick={() => removeSet(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Weight and Reps with tap controls */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Weight Control */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      {t("record.sets.weight", language)} (kg)
                    </Label>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3">
                      <Button
                        onClick={() => updateSetWeight(index, false)}
                        size="sm"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-coral hover:bg-coral hover:text-white active:scale-95 transition-transform"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <div className="mx-4 min-w-[60px] text-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {set.weight}
                        </span>
                        <div className="text-xs text-gray-500">-5kg / +5kg</div>
                      </div>
                      <Button
                        onClick={() => updateSetWeight(index, true)}
                        size="sm"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-coral hover:bg-coral hover:text-white active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Reps Control */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      {t("record.sets.reps", language)}
                    </Label>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3">
                      <Button
                        onClick={() => updateSetReps(index, false)}
                        size="sm"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-coral hover:bg-coral hover:text-white active:scale-95 transition-transform"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <div className="mx-4 min-w-[60px] text-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {set.reps}
                        </span>
                        <div className="text-xs text-gray-500">-1 / +1</div>
                      </div>
                      <Button
                        onClick={() => updateSetReps(index, true)}
                        size="sm"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-2 border-gray-300 hover:border-coral hover:bg-coral hover:text-white active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    onClick={() => toggleSetOption(index, 'powerBelt')}
                    variant={set.powerBelt ? "default" : "outline"}
                    size="sm"
                    className={`py-3 active:scale-95 transition-transform ${set.powerBelt ? 'bg-coral hover:bg-red-500' : 'hover:bg-coral hover:text-white'}`}
                  >
                    {t("record.sets.powerBelt", language)}
                  </Button>
                  
                  <Button
                    onClick={() => toggleSetOption(index, 'buttUp')}
                    variant={set.buttUp ? "default" : "outline"}
                    size="sm"
                    className={`py-3 active:scale-95 transition-transform ${set.buttUp ? 'bg-coral hover:bg-red-500' : 'hover:bg-coral hover:text-white'}`}
                  >
                    {t("record.sets.buttUp", language)}
                  </Button>
                  
                  <Button
                    onClick={() => toggleSetOption(index, 'assistance')}
                    variant={set.assistance ? "default" : "outline"}
                    size="sm"
                    className={`py-3 active:scale-95 transition-transform ${set.assistance ? 'bg-coral hover:bg-red-500' : 'hover:bg-coral hover:text-white'}`}
                  >
                    {t("record.sets.assistance", language)}
                  </Button>
                  
                  <Button
                    onClick={() => toggleSetOption(index, 'failed')}
                    variant={set.failed ? "default" : "outline"}
                    size="sm"
                    className={`py-3 active:scale-95 transition-transform ${set.failed ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-600 hover:text-white border-red-300'}`}
                  >
                    つぶれた
                  </Button>
                  
                  <Button
                    onClick={() => toggleCheating(index)}
                    variant={set.cheating ? "default" : "outline"}
                    size="sm"
                    className={`py-3 active:scale-95 transition-transform col-span-2 ${set.cheating ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-yellow-600 hover:text-white border-yellow-300'}`}
                  >
                    チーティング
                  </Button>
                </div>

                {/* Notes Toggle */}
                <div className="border-t pt-3">
                  <Button
                    onClick={() => toggleSetNotes(index)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 p-0"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t("record.sets.notes", language)}
                    {set.showNotes ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                  
                  {set.showNotes && (
                    <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                      {set.cheating && set.cheatingWeight && set.cheatingReps && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="text-sm font-medium text-yellow-800 mb-1">
                            チーティング詳細:
                          </div>
                          <div className="text-sm text-yellow-700">
                            実際の重量: {set.cheatingWeight}kg / 実際の回数: {set.cheatingReps}回
                          </div>
                        </div>
                      )}
                      <Textarea
                        rows={2}
                        value={set.notes}
                        onChange={(e) => updateSetNotes(index, e.target.value)}
                        placeholder="How did this set feel?"
                        className="focus:ring-coral focus:border-coral"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Set Button */}
        <div className="mt-4">
          <Button
            onClick={addSet}
            variant="outline"
            size="lg"
            className="w-full border-coral text-coral hover:bg-coral hover:text-white py-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("record.sets.add", language)}
          </Button>
        </div>
      </section>

      {/* Workout Notes */}
      <section className="p-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="workoutNotes">
              {t("record.workoutNotes", language)}
            </Label>
            <Textarea
              id="workoutNotes"
              rows={3}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Overall thoughts about today's workout..."
              className="focus:ring-coral focus:border-coral"
            />
          </CardContent>
        </Card>
      </section>

      {/* Save Button */}
      <div className="p-4 pb-8">
        <Button
          onClick={handleSaveWorkout}
          disabled={saveWorkoutMutation.isPending}
          className="w-full bg-coral hover:bg-red-500 text-white py-4 text-lg font-semibold transition-colors duration-300"
        >
          {saveWorkoutMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {t("record.saveWorkout", language)}
        </Button>
      </div>
    </div>
  );
}
