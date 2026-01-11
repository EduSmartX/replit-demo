import { Loader2, CheckCircle2 } from "lucide-react";
import { UseFormRegister, FieldError, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpInputProps<T extends FieldValues = FieldValues> {
  id: string;
  label: string;
  email: string;
  register: UseFormRegister<T>;
  fieldName: string;
  error?: FieldError;
  isVerified: boolean;
  isVerifying: boolean;
  onVerify: () => void;
  testId?: string;
}

export function OtpInput({
  id,
  label,
  email,
  register,
  fieldName,
  error,
  isVerified,
  isVerifying,
  onVerify,
  testId = "otp-input",
}: OtpInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <p className="text-muted-foreground mb-1 text-xs">{email}</p>
      <Input
        id={id}
        placeholder="123456"
        className="text-center text-2xl tracking-widest"
        maxLength={6}
        {...register(fieldName)}
        data-testid={testId}
        disabled={isVerified}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
      <Button
        type="button"
        size="sm"
        variant={isVerified ? "secondary" : "default"}
        className="w-full"
        onClick={onVerify}
        disabled={isVerified || isVerifying}
        data-testid={`${testId}-verify-button`}
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
          </>
        ) : isVerified ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Verified
          </>
        ) : (
          `Verify ${label}`
        )}
      </Button>
    </div>
  );
}
