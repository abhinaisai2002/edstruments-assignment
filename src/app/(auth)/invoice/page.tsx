"use client";

import { useRouter } from "next/navigation";
import InvoiceForm from "@/components/invoice-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export default function InvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  console.log(auth);
  const handleLogout = () => {
    auth?.logOut();
  };

  return (

    <main className="container mx-auto px-4 py-8">
      <InvoiceForm />
    </main>
  );
}