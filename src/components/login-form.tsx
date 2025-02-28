"use client"

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: LoginValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const validate = (values: LoginValues) => {
    const errors: Partial<LoginValues> = {};

    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    return errors;
  };

  const handleSubmit = async (values: LoginValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Login values:", values);
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
      // Here you would typically redirect the user or update auth state
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              className={`${errors.email && touched.email ? "border-destructive" : ""}`}
            />
            <ErrorMessage name="email" component="div" className="text-sm text-destructive" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Field
                as={Input}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${errors.password && touched.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage name="password" component="div" className="text-sm text-destructive" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Field
              as={Checkbox}
              id="rememberMe"
              name="rememberMe"
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal">
              Remember me for 30 days
            </Label>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
}