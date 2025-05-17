import { ThemeSwitcher } from "@/components/theme-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="absolute top-4 right-4">
            <ThemeSwitcher />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
