import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  LineChart, 
  Activity, 
  ListTodo, 
  Target, 
  BookText,
  TrendingUp,
  CalendarCheck,
  BarChart2,
  Heart
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      name: 'Active Habits',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: ListTodo,
      href: '/habits',
      description: 'Total active habits being tracked'
    },
    {
      name: 'Goals Progress',
      value: '68%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      href: '/goals',
      description: 'Average progress across all goals'
    },
    {
      name: 'Health Score',
      value: '82',
      change: '-3',
      trend: 'down',
      icon: Activity,
      href: '/health',
      description: 'Overall health assessment score'
    },
    {
      name: 'Recent Entries',
      value: '28',
      change: '+12',
      trend: 'up',
      icon: BookText,
      href: '/journal',
      description: 'Journal entries in the past week'
    },
  ];

  const recentActivity = [
    { 
      id: 1, 
      type: 'Habit', 
      name: 'Morning Meditation', 
      status: 'Completed', 
      date: 'Today, 7:15 AM' 
    },
    { 
      id: 2, 
      type: 'Health', 
      name: 'Blood Pressure Check', 
      status: '120/80', 
      date: 'Today, 8:30 AM' 
    },
    { 
      id: 3, 
      type: 'Goal', 
      name: 'Read 10 Pages', 
      status: 'In Progress (70%)', 
      date: 'Yesterday, 7:20 PM' 
    },
    { 
      id: 4, 
      type: 'Journal', 
      name: 'Meal Log', 
      status: 'Breakfast, Lunch', 
      date: 'Yesterday, 1:45 PM' 
    },
    { 
      id: 5, 
      type: 'Habit', 
      name: 'Evening Walk', 
      status: 'Completed', 
      date: 'Yesterday, 6:30 PM' 
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <Link href={stat.href} className="block h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  <div className={`text-xs flex items-center mt-2 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                    )}
                    {stat.change} from last week
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Habit Completion</CardTitle>
            <CardDescription>Your habit completion rate over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <BarChart2 className="h-16 w-16 mb-2 text-primary/20" />
              <p>Habit tracking data will appear here</p>
              <Link href="/habits" className="text-primary text-sm mt-2 hover:underline">
                Start tracking habits →
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Your health data trends</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <Heart className="h-16 w-16 mb-2 text-primary/20" />
              <p>Health metrics will appear here</p>
              <Link href="/health" className="text-primary text-sm mt-2 hover:underline">
                Record health data →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions across all trackers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              let Icon;
              let typeColor;
              
              switch(activity.type) {
                case 'Habit':
                  Icon = ListTodo;
                  typeColor = 'text-blue-500';
                  break;
                case 'Health':
                  Icon = Activity;
                  typeColor = 'text-red-500';
                  break;
                case 'Goal':
                  Icon = Target;
                  typeColor = 'text-green-500';
                  break;
                case 'Journal':
                  Icon = BookText;
                  typeColor = 'text-purple-500';
                  break;
                default:
                  Icon = CalendarCheck;
                  typeColor = 'text-gray-500';
              }
              
              return (
                <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
                  <div className={`p-2 rounded-full bg-muted ${typeColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.status}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${typeColor} bg-muted`}>
                      {activity.type}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {activity.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 