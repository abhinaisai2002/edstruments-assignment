'use client'

import { useRouter } from "next/navigation";
import InvoiceForm  from "@/components/invoice-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = useAuth();
  return (
    <div className="min-h-screen bg-background">
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice App</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{auth?.email}</span>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => auth?.logOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>

    {children}
  </div>
  );
}
