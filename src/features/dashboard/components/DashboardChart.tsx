import React from 'react';
import { Line } from 'react-chartjs-2';
import { TimeseriesData } from '../types';

interface DashboardChartProps {
  data: TimeseriesData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Impressions',
        data: data.map(d => d.impressions),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Clicks',
        data: data.map(d => d.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Performance Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <Line data={chartData} options={options} />
    </div>
  );
}