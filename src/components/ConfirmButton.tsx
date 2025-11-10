"use client";

import { ReactNode, useState } from "react";
import { Button } from "./ui/button";

interface ConfirmButtonProps {
  onConfirm: () => Promise<void>;
  children: ReactNode;
  variant?: "default" | "destructive" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

export function ConfirmButton({
  onConfirm,
  children,
  variant = "default",
  loading = false,
  disabled = false,
}: ConfirmButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setShowConfirm(false);
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant={variant}
        disabled={disabled || loading}
        onClick={() => setShowConfirm(true)}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        disabled={isLoading}
        onClick={handleConfirm}
      >
        {isLoading ? "Confirming..." : "Confirm"}
      </Button>
      <Button
        variant="outline"
        disabled={isLoading}
        onClick={() => setShowConfirm(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
