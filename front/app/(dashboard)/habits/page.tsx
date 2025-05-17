import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HabitsPage() {
  // Sample habits data
  const habits = [
    { id: 1, name: 'Morning Meditation', streak: 12, frequency: 'Daily', completed: true },
    { id: 2, name: 'Exercise', streak: 5, frequency: 'Daily', completed: false },
    { id: 3, name: 'Read 10 Pages', streak: 21, frequency: 'Daily', completed: true },
    { id: 4, name: 'Evening Walk', streak: 7, frequency: 'Daily', completed: false },
    { id: 5, name: 'Take Vitamins', streak: 30, frequency: 'Daily', completed: true },
    { id: 6, name: 'Drink 8 Glasses of Water', streak: 15, frequency: 'Daily', completed: false },
    { id: 7, name: 'Practice Instrument', streak: 3, frequency: 'Weekly', completed: true },
    { id: 8, name: 'Call Parents', streak: 2, frequency: 'Weekly', completed: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> Add Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <Card key={habit.id} className={habit.completed ? "border-green-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">{habit.name}</CardTitle>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                habit.completed 
                  ? "bg-green-500/20 text-green-500" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {habit.completed && <ListTodo className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{habit.frequency}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-2xl font-bold mr-2">{habit.streak}</div>
                    <div className="text-xs text-muted-foreground">day streak</div>
                  </div>
                </div>
                <Button variant={habit.completed ? "outline" : "default"} size="sm">
                  {habit.completed ? "Done" : "Mark Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 