import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Lifeaware - Track Your Habits, Goals, and Health",
  description: "An all-in-one personal wellness application to track habits, goals, health metrics, and journal your daily activities.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Take Control of Your{" "}
          <span className="text-primary">Wellbeing</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Track your habits, set goals, monitor health metrics, and journal your daily activities in one seamless application.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg" className="px-8">
            <Link href="/sign-up">Get Started for Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">All-in-One Wellness Tracker</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lifeaware brings together all the tools you need to improve your health and achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Habit Tracker</h3>
            <p className="text-muted-foreground">
              Build consistent routines and track your progress with our comprehensive habit tracker.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M2 20h.01" />
                <path d="M7 20v-4" />
                <path d="M12 20v-8" />
                <path d="M17 20v-10" />
                <path d="M22 20V8" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Goal Tracker</h3>
            <p className="text-muted-foreground">
              Set meaningful goals, break them down into actionable steps, and track your progress over time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                <circle cx="20" cy="10" r="2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Health Metrics</h3>
            <p className="text-muted-foreground">
              Monitor vital health metrics like blood pressure, weight, and blood sugar with visualized data.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M14 4V2" />
                <path d="M14 22v-2" />
                <path d="M10 4V2" />
                <path d="M10 22v-2" />
                <path d="M14 4h-4v16h4" />
                <path d="M21 10h-3v4h3" />
                <path d="M6 10H3v4h3" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Daily Journal</h3>
            <p className="text-muted-foreground">
              Log your daily activities including meals, exercise, sleep, medications, and supplements.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-2xl p-8 text-center my-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start Your Wellness Journey Today</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who have transformed their lives with Lifeaware's comprehensive tracking tools.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/sign-up">Sign Up for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 