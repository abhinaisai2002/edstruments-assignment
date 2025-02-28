"use client";

import { use, useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { withZodSchema } from "formik-validator-zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
});


export function LoginForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: withZodSchema(loginSchema), // Use Zod validation
    onSubmit: async (values, { setSubmitting }) => {
      try {

        await new Promise((resolve) => setTimeout(resolve, 3000));

        auth?.login(values.email);

        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please check your credentials and try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    validateOnChange: true,
    validateOnMount: true
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          className={formik.errors.email && formik.touched.email ? "border-destructive" : ""}
          {...formik.getFieldProps("email")}
        />
        {formik.errors.email && formik.touched.email && (
          <div className="text-sm text-red-600">{formik.errors.email}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={formik.errors.password && formik.touched.password ? "border-destructive" : ""}
            {...formik.getFieldProps("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formik.errors.password && formik.touched.password && (
          <div className="text-sm text-red-600">{formik.errors.password}</div>
        )}
      </div>

      <Button type="submit" className={cn("w-full !mt-10")} disabled={formik.isSubmitting || !formik.isValid}>
        {formik.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
