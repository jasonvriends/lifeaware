import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryType = 'Personal Development' | 'Financial' | 'Health & Fitness' | 'Education' | 'Mental Health';

interface Goal {
  id: number;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  category: CategoryType;
}

export default function GoalsPage() {
  // Sample goals data
  const goals: Goal[] = [
    { 
      id: 1, 
      name: 'Read 12 Books This Year', 
      progress: 75, 
      startDate: '2023-01-01', 
      endDate: '2023-12-31', 
      category: 'Personal Development'
    },
    { 
      id: 2, 
      name: 'Save $10,000', 
      progress: 45, 
      startDate: '2023-01-01', 
      endDate: '2023-12-31', 
      category: 'Financial'
    },
    { 
      id: 3, 
      name: 'Run a Marathon', 
      progress: 30, 
      startDate: '2023-01-01', 
      endDate: '2023-11-15', 
      category: 'Health & Fitness'
    },
    { 
      id: 4, 
      name: 'Learn Spanish', 
      progress: 25, 
      startDate: '2023-02-15', 
      endDate: '2023-12-31', 
      category: 'Education'
    },
    { 
      id: 5, 
      name: 'Meditate for 200 Hours', 
      progress: 65, 
      startDate: '2023-01-01', 
      endDate: '2023-12-31', 
      category: 'Mental Health'
    },
  ];

  const categoryColors: Record<CategoryType, string> = {
    'Personal Development': 'bg-blue-500',
    'Financial': 'bg-green-500',
    'Health & Fitness': 'bg-red-500',
    'Education': 'bg-purple-500',
    'Mental Health': 'bg-yellow-500',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Goals Tracker</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">{goal.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex h-2 w-2 rounded-full ${categoryColors[goal.category]}`}
                />
                <span className="text-xs text-muted-foreground">{goal.category}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full ${categoryColors[goal.category]}`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm">{goal.startDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm">{goal.endDate}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm">Update Progress</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 