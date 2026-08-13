"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  businessStep1Schema,
  businessStep2Schema,
  businessStep3Schema,
  type BusinessStep1Input,
  type BusinessStep2Input,
  type BusinessStep3Input,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Gem,
  Building2,
  User,
  MapPin,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "JEWELLERY_SHOP", label: "Jewellery Shop" },
  { value: "GIRVI", label: "Pawn / Girvi Business" },
  { value: "GOLD_LOAN", label: "Gold Loan" },
  { value: "FINANCE", label: "Finance Company" },
  { value: "SILVER", label: "Silver Business" },
  { value: "PAWN", label: "Pawn Shop" },
  { value: "OTHER", label: "Other" },
] as const;

const STEPS = [
  { label: "Business", icon: Building2 },
  { label: "Owner", icon: User },
  { label: "Location", icon: MapPin },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                done
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : active
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "bg-zinc-800 text-zinc-600 border border-zinc-700"
              )}
            >
              {done ? (
                <Check className="h-3 w-3" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              {step.label}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-px w-6 ${done ? "bg-green-500/50" : "bg-zinc-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessStep1Input & BusinessStep2Input & BusinessStep3Input>>({});

  const step1Form = useForm<BusinessStep1Input>({
    resolver: zodResolver(businessStep1Schema),
    defaultValues: { type: "JEWELLERY_SHOP", ...(formData as any) },
  });

  const step2Form = useForm<BusinessStep2Input>({
    resolver: zodResolver(businessStep2Schema),
    defaultValues: formData as any,
  });

  const step3Form = useForm<BusinessStep3Input>({
    resolver: zodResolver(businessStep3Schema),
    defaultValues: { country: "IN", currency: "INR", timezone: "Asia/Kolkata", language: "en", ...formData as any },
  });

  const handleStep1 = (data: BusinessStep1Input) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  };

  const handleStep2 = (data: BusinessStep2Input) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep3 = async (data: BusinessStep3Input) => {
    setError(null);
    setIsSubmitting(true);
    const payload = { ...formData, ...data };

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      // Redirect to login
      router.push("/login?registered=true");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gold-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg glow-gold mb-3">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Register Your Business</h1>
            <p className="text-xs text-zinc-500 mt-1">Get started with GirviPro in 3 steps</p>
          </div>

          <StepIndicator current={step} />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Business */}
          {step === 0 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4" id="register-step1">
              <div className="space-y-1.5">
                <Label htmlFor="reg-business-name">Business Name</Label>
                <Input
                  id="reg-business-name"
                  placeholder="e.g. Mehta Jewellers"
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  {...step1Form.register("name")}
                />
                {step1Form.formState.errors.name && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Business Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-700 bg-zinc-800/30 cursor-pointer hover:border-zinc-600 transition-all has-[:checked]:border-gold-500/50 has-[:checked]:bg-gold-500/10"
                    >
                      <input
                        type="radio"
                        value={type.value}
                        className="sr-only"
                        {...step1Form.register("type")}
                      />
                      <span className="text-xs text-zinc-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-description">Description (optional)</Label>
                <Input
                  id="reg-description"
                  placeholder="Brief description of your business"
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  {...step1Form.register("description")}
                />
              </div>

              <Button type="submit" variant="gold" className="w-full" id="register-next-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Owner */}
          {step === 1 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4" id="register-step2">
              <div className="space-y-1.5">
                <Label htmlFor="reg-owner-name">Your Full Name</Label>
                <Input id="reg-owner-name" placeholder="Rajesh Mehta" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step2Form.register("ownerName")} />
                {step2Form.formState.errors.ownerName && <p className="text-xs text-red-400">{step2Form.formState.errors.ownerName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input id="reg-email" type="email" placeholder="owner@yourbusiness.com" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step2Form.register("email")} />
                {step2Form.formState.errors.email && <p className="text-xs text-red-400">{step2Form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone">Mobile Number</Label>
                <Input id="reg-phone" type="tel" placeholder="+91 9876543210" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step2Form.register("phone")} />
                {step2Form.formState.errors.phone && <p className="text-xs text-red-400">{step2Form.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pr-10"
                    {...step2Form.register("password")}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {step2Form.formState.errors.password && <p className="text-xs text-red-400">{step2Form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                <Input id="reg-confirm-password" type="password" placeholder="Repeat password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step2Form.register("confirmPassword")} />
                {step2Form.formState.errors.confirmPassword && <p className="text-xs text-red-400">{step2Form.formState.errors.confirmPassword.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-100" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" variant="gold" className="flex-1" id="register-next-2">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Location */}
          {step === 2 && (
            <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4" id="register-step3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-address">Business Address</Label>
                <Input id="reg-address" placeholder="Shop No. 1, Gold Market" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step3Form.register("address")} />
                {step3Form.formState.errors.address && <p className="text-xs text-red-400">{step3Form.formState.errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-city">City</Label>
                  <Input id="reg-city" placeholder="Mumbai" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step3Form.register("city")} />
                  {step3Form.formState.errors.city && <p className="text-xs text-red-400">{step3Form.formState.errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-state">State</Label>
                  <Input id="reg-state" placeholder="Maharashtra" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step3Form.register("state")} />
                  {step3Form.formState.errors.state && <p className="text-xs text-red-400">{step3Form.formState.errors.state.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-pincode">PIN Code</Label>
                  <Input id="reg-pincode" placeholder="400001" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step3Form.register("pinCode")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-gst">GST Number</Label>
                  <Input id="reg-gst" placeholder="Optional" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" {...step3Form.register("gstNumber")} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-100" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" variant="gold" className="flex-1" isLoading={isSubmitting} id="register-submit">
                  <Check className="mr-2 h-4 w-4" /> Create Business
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
