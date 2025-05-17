import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Link href="/" className="flex flex-col items-center mb-8 hover:opacity-90 transition-opacity">
        <div className="flex items-center justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-primary"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Lifeaware</h1>
      </Link>

      <div className="bg-card border rounded-lg shadow-sm p-8 w-full max-w-md">
        <form className="flex flex-col w-full">
          <h2 className="text-2xl font-medium mb-1">Reset Password</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="you@example.com" required />
            </div>
            
            <SubmitButton 
              formAction={forgotPasswordAction}
              className="font-medium mt-2"
            >
              Reset Password
            </SubmitButton>
            
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  );
}
