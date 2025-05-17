import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookText, UtensilsCrossed, Coffee, Moon, Dumbbell, Pill, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

type EntryType = 'Meal' | 'Drink' | 'Exercise' | 'Sleep' | 'Supplement' | 'Medication' | 'Snack';

interface JournalEntry {
  id: number;
  type: EntryType;
  time: string;
  description: string;
  category: string;
  icon: any; // Using any for simplicity, ideally would be a proper Lucide icon type
}

interface DayEntry {
  id: number;
  date: string;
  entries: JournalEntry[];
}

export default function JournalPage() {
  const journalEntries: DayEntry[] = [
    {
      id: 1,
      date: 'June 12, 2023',
      entries: [
        { 
          id: 101, 
          type: 'Meal', 
          time: '8:00 AM', 
          description: 'Oatmeal with blueberries and honey', 
          category: 'Breakfast',
          icon: UtensilsCrossed
        },
        { 
          id: 102, 
          type: 'Drink', 
          time: '9:30 AM', 
          description: 'Black coffee', 
          category: 'Beverage',
          icon: Coffee
        },
        { 
          id: 103, 
          type: 'Exercise', 
          time: '6:00 PM', 
          description: '30 min run, 3 miles', 
          category: 'Cardio',
          icon: Dumbbell
        },
        { 
          id: 104, 
          type: 'Sleep', 
          time: '10:30 PM - 6:30 AM', 
          description: '8 hours, quality: good', 
          category: 'Rest',
          icon: Moon
        },
      ]
    },
    {
      id: 2,
      date: 'June 11, 2023',
      entries: [
        { 
          id: 201, 
          type: 'Meal', 
          time: '8:15 AM', 
          description: 'Scrambled eggs with toast', 
          category: 'Breakfast',
          icon: UtensilsCrossed
        },
        { 
          id: 202, 
          type: 'Supplement', 
          time: '8:30 AM', 
          description: 'Multivitamin, Vitamin D', 
          category: 'Vitamins',
          icon: Pill
        },
        { 
          id: 203, 
          type: 'Meal', 
          time: '12:30 PM', 
          description: 'Chicken salad with avocado', 
          category: 'Lunch',
          icon: UtensilsCrossed
        },
        { 
          id: 204, 
          type: 'Snack', 
          time: '3:00 PM', 
          description: 'Apple and almonds', 
          category: 'Snack',
          icon: Apple
        },
      ]
    },
  ];

  // Type categories with their colors
  const typeColors: Record<EntryType, string> = {
    'Meal': 'bg-green-500/10 text-green-500',
    'Drink': 'bg-blue-500/10 text-blue-500',
    'Exercise': 'bg-orange-500/10 text-orange-500',
    'Sleep': 'bg-purple-500/10 text-purple-500',
    'Supplement': 'bg-yellow-500/10 text-yellow-500',
    'Medication': 'bg-red-500/10 text-red-500',
    'Snack': 'bg-emerald-500/10 text-emerald-500',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Quick Entry Buttons */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(typeColors).map(([type, color]) => (
            <Button key={type} variant="outline" className={`justify-start ${color.split(' ')[1]}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add {type}
            </Button>
          ))}
        </div>

        {/* Journal Entries */}
        <div className="md:col-span-3">
          {journalEntries.map((day) => (
            <Card key={day.id} className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{day.date}</CardTitle>
                <CardDescription>{day.entries.length} entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {day.entries.map((entry) => {
                    const Icon = entry.icon;
                    const colorClass = typeColors[entry.type];
                    
                    return (
                      <div key={entry.id} className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full ${colorClass.split(' ')[0]}`}>
                          <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{entry.type}: {entry.description}</p>
                              <p className="text-sm text-muted-foreground">{entry.category}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{entry.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 