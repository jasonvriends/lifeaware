import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus, Heart, Weight, Thermometer, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  // Sample health metrics data
  const healthMetrics = [
    {
      id: 1,
      name: 'Blood Pressure',
      lastValue: '120/80',
      unit: 'mmHg',
      date: '2023-06-10',
      icon: Activity,
      status: 'normal',
      trend: 'stable'
    },
    {
      id: 2,
      name: 'Weight',
      lastValue: '154',
      unit: 'lbs',
      date: '2023-06-09',
      icon: Weight,
      status: 'normal',
      trend: 'decreasing'
    },
    {
      id: 3,
      name: 'Heart Rate',
      lastValue: '72',
      unit: 'bpm',
      date: '2023-06-10',
      icon: Heart,
      status: 'normal',
      trend: 'stable'
    },
    {
      id: 4,
      name: 'Blood Sugar',
      lastValue: '100',
      unit: 'mg/dL',
      date: '2023-06-08',
      icon: Thermometer,
      status: 'normal',
      trend: 'stable'
    },
  ];

  const recentReadings = [
    { id: 1, metric: 'Blood Pressure', value: '120/80', date: 'Today, 7:15 AM' },
    { id: 2, metric: 'Weight', value: '154 lbs', date: 'Today, 7:20 AM' },
    { id: 3, metric: 'Heart Rate', value: '72 bpm', date: 'Today, 7:25 AM' },
    { id: 4, metric: 'Blood Sugar', value: '100 mg/dL', date: 'Yesterday, 8:15 PM' },
    { id: 5, metric: 'Blood Pressure', value: '122/82', date: 'Yesterday, 7:10 AM' },
    { id: 6, metric: 'Weight', value: '155 lbs', date: 'Yesterday, 7:15 AM' },
    { id: 7, metric: 'Heart Rate', value: '75 bpm', date: 'Yesterday, 7:20 AM' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> Add Reading
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.lastValue} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last reading on {metric.date}</p>
                <div className="flex mt-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mr-2 ${
                    metric.status === 'normal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    metric.status === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {metric.status}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    metric.trend === 'stable' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    metric.trend === 'increasing' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Health Data Visualization Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>Your health metrics over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center text-muted-foreground flex flex-col items-center">
            <BarChart2 className="h-16 w-16 mb-2 text-primary/20" />
            <p>Add more readings to see trends over time</p>
            <Button variant="outline" size="sm" className="mt-4 gap-1">
              <Plus className="h-4 w-4" /> Add New Reading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>Your last 7 health metric readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReadings.map((reading) => (
              <div key={reading.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{reading.metric}</div>
                </div>
                <div>{reading.value}</div>
                <div className="text-sm text-muted-foreground">{reading.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 