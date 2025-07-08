import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { t, type Language } from "@/lib/i18n";

interface WorkoutChartProps {
  language: Language;
}

export function WorkoutChart({ language }: WorkoutChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const { data: volumeData, isLoading } = useQuery({
    queryKey: ['/api/analytics/daily-volume'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/daily-volume?days=7');
      return response.json();
    },
  });

  useEffect(() => {
    if (!volumeData || !chartRef.current) return;

    const initChart = async () => {
      const { default: Chart } = await import('chart.js/auto');
      
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      // Format data for chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const chartData = last7Days.map(date => {
        const found = volumeData.find((item: any) => item.date === date);
        return found ? found.volume : 0;
      });

      const labels = last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString(language === 'en' ? 'en-US' : language, { weekday: 'short' });
      });

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: t("home.chart.title", language),
            data: chartData,
            borderColor: 'hsl(6, 78%, 57%)', // coral color
            backgroundColor: 'hsla(6, 78%, 57%, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'hsl(6, 78%, 57%)',
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
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: 'hsl(25, 5.3%, 44.7%)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'hsl(25, 5.3%, 44.7%)'
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
  }, [volumeData, language]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        {t("home.chart.title", language)}
      </h2>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
