import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        {/* Header/App Bar */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <Link href="/" className="text-xl font-bold">
                Lifeaware
              </Link>
            </div>
            
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="w-full border-t mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Lifeaware. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Theme:</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
} 