import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Mail, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import { useMockStore } from "@/lib/mock-store";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { signIn } = useMockStore();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("identifier");
      setValue("");
      setOtp("");
      setError("");
    }
  }, [open]);

  const isEmail = EMAIL_RE.test(value);
  const isPhone = PHONE_RE.test(value.replace(/\s/g, ""));

  const continueToOtp = () => {
    if (!isEmail && !isPhone) {
      setError("Enter a valid 10-digit mobile number or email address.");
      return;
    }
    setError("");
    setStep("otp");
  };

  const verify = () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    signIn(value.trim());
    toast.success("Signed in!", { description: "Welcome to AbhiShare, Demo User." });
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <LogoMark className="size-11" />
          <DialogTitle className="text-xl font-extrabold">
            {step === "identifier" ? "Welcome back 👋" : "Verify your number"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "identifier"
              ? "Log in with your mobile number or email to continue your journey with AbhiShare."
              : `We sent a 6-digit code to ${value}. In this demo, any 6 digits work.`}
          </DialogDescription>
        </DialogHeader>

        {step === "identifier" ? (
          <div className="space-y-3">
            <div className="relative">
              {isEmail ? (
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              ) : (
                <Smartphone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                className="pl-9"
                placeholder="9876543210 or you@example.com"
                value={value}
                inputMode="text"
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && continueToOtp()}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button className="w-full rounded-xl" onClick={continueToOtp}>
              Continue <ArrowRight className="size-4" />
            </Button>
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              We'll check if you already have an account. A 6-digit code is sent for new accounts.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center py-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSeparator />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSeparator />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-center text-sm font-medium text-destructive">{error}</p>}
            <Button className="w-full rounded-xl" onClick={verify}>
              Verify & continue
            </Button>
            <button
              className="mx-auto block cursor-pointer text-sm font-semibold text-primary hover:underline"
              onClick={() => setStep("identifier")}
            >
              Change number or email
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
