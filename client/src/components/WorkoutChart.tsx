import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { t, type Language } from "@/lib/i18n";

interface WorkoutChartProps {
  language: Language;
}

export function WorkoutChart({ language }: WorkoutChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [selectedChart, setSelectedChart] = useState<'volume' | '1rm'>('volume');

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['/api/analytics/daily-volume'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/daily-volume?days=7');
      return response.json();
    },
  });

  const { data: oneRMData, isLoading: oneRMLoading } = useQuery({
    queryKey: ['/api/analytics/1rm-history'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/1rm-history?days=30');
      return response.json();
    },
  });

  useEffect(() => {
    if (!chartRef.current) return;

    const currentData = selectedChart === 'volume' ? volumeData : oneRMData;
    if (!currentData) return;

    const initChart = async () => {
      const { default: Chart } = await import('chart.js/auto');
      
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      let chartData, labels;
      
      if (selectedChart === 'volume') {
        // Format volume data for chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        chartData = last7Days.map(date => {
          const found = volumeData.find((item: any) => item.date === date);
          return found ? found.volume : 0;
        });

        labels = last7Days.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString(language === 'en' ? 'en-US' : language, { weekday: 'short' });
        });
      } else {
        // Format 1RM data for chart
        chartData = oneRMData.map((item: any) => item.max1rm);
        labels = oneRMData.map((item: any) => {
          const d = new Date(item.date);
          return d.toLocaleDateString(language === 'en' ? 'en-US' : language, { month: 'short', day: 'numeric' });
        });
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: selectedChart === 'volume' ? t("home.chart.title", language) : '推定1RM (kg)',
            data: chartData,
            borderColor: selectedChart === 'volume' ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 30%)', // black for volume, dark gray for 1RM
            backgroundColor: selectedChart === 'volume' ? 'hsla(0, 0%, 0%, 0.1)' : 'hsla(0, 0%, 30%, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: selectedChart === 'volume' ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 30%)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: selectedChart === 'volume',
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: 'hsl(0, 0%, 50%)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'hsl(0, 0%, 50%)'
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    };

    initChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [volumeData, oneRMData, selectedChart, language]);

  if (volumeLoading || oneRMLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedChart === 'volume' ? t("home.chart.title", language) : t("home.chart.1rmHistory", language)}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={selectedChart === 'volume' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('volume')}
          >
            {t("home.chart.volumeBtn", language)}
          </Button>
          <Button
            variant={selectedChart === '1rm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('1rm')}
          >
            {t("home.chart.1rmBtn", language)}
          </Button>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
