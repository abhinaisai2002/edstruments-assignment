import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-2 w-12 h-12 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <LoginForm />
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <div className="mt-6 grid gap-2">
            <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background p-2 text-sm font-medium transition-colors hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              Continue with GitHub
            </button>
            <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background p-2 text-sm font-medium transition-colors hover:bg-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              Continue with Email
            </button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
          <div>
            <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}