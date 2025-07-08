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
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { t, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface SetData {
  setNumber: number;
  weight: string;
  reps: string;
  powerBelt: boolean;
  buttUp: boolean;
  assistance: boolean;
  failed: boolean;
  notes: string;
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
      weight: '65',
      reps: '5',
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      notes: '',
    },
    {
      setNumber: 2,
      weight: '65',
      reps: '5',
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      notes: '',
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

    const validSets = sets.filter(set => set.weight && set.reps);
    if (validSets.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one set",
        variant: "destructive",
      });
      return;
    }

    const workoutData = {
      workout: {
        date: workoutDate,
        time: workoutTime,
        notes: workoutNotes,
      },
      sets: validSets.map(set => ({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: parseInt(set.reps),
        powerBelt: set.powerBelt,
        buttUp: set.buttUp,
        assistance: set.assistance,
        failed: set.failed,
        notes: set.notes,
      })),
    };

    saveWorkoutMutation.mutate(workoutData);
  };

  const addSet = () => {
    const newSet: SetData = {
      setNumber: sets.length + 1,
      weight: sets.length > 0 ? sets[sets.length - 1].weight : '65',
      reps: sets.length > 0 ? sets[sets.length - 1].reps : '5',
      powerBelt: false,
      buttUp: false,
      assistance: false,
      failed: false,
      notes: '',
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

  const updateSet = (index: number, field: keyof SetData, value: any) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("record.sets.title", language)}
          </h2>
          <Button
            onClick={addSet}
            variant="outline"
            size="sm"
            className="border-coral text-coral hover:bg-coral hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t("record.sets.add", language)}
          </Button>
        </div>

        <div className="space-y-4">
          {sets.map((set, index) => (
            <Card key={index} className="animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
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

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>{t("record.sets.weight", language)}</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(index, 'weight', e.target.value)}
                      className="focus:ring-coral focus:border-coral"
                    />
                  </div>
                  <div>
                    <Label>{t("record.sets.reps", language)}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={set.reps}
                      onChange={(e) => updateSet(index, 'reps', e.target.value)}
                      className="focus:ring-coral focus:border-coral"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`powerBelt-${index}`}
                      checked={set.powerBelt}
                      onCheckedChange={(checked) => updateSet(index, 'powerBelt', checked)}
                    />
                    <Label htmlFor={`powerBelt-${index}`} className="text-sm">
                      {t("record.sets.powerBelt", language)}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`buttUp-${index}`}
                      checked={set.buttUp}
                      onCheckedChange={(checked) => updateSet(index, 'buttUp', checked)}
                    />
                    <Label htmlFor={`buttUp-${index}`} className="text-sm">
                      {t("record.sets.buttUp", language)}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`assistance-${index}`}
                      checked={set.assistance}
                      onCheckedChange={(checked) => updateSet(index, 'assistance', checked)}
                    />
                    <Label htmlFor={`assistance-${index}`} className="text-sm">
                      {t("record.sets.assistance", language)}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`failed-${index}`}
                      checked={set.failed}
                      onCheckedChange={(checked) => updateSet(index, 'failed', checked)}
                    />
                    <Label htmlFor={`failed-${index}`} className="text-sm">
                      {t("record.sets.failed", language)}
                    </Label>
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor={`notes-${index}`}>
                    {t("record.sets.notes", language)}
                  </Label>
                  <Textarea
                    id={`notes-${index}`}
                    rows={2}
                    value={set.notes}
                    onChange={(e) => updateSet(index, 'notes', e.target.value)}
                    placeholder="How did this set feel?"
                    className="focus:ring-coral focus:border-coral"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
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
