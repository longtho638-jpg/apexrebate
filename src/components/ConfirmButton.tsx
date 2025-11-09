"use client";

import { useState } from "react";

interface ConfirmButtonProps {
  label: string;
  onConfirm: () => Promise<void>;
  variant?: "default" | "danger";
}

export default function ConfirmButton({
  label,
  onConfirm,
  variant = "default",
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  const baseClass =
    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50";
  const variantClass =
    variant === "danger"
      ? "bg-red-100 text-red-700 hover:bg-red-200"
      : "bg-blue-100 text-blue-700 hover:bg-blue-200";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClass} ${variantClass}`}
    >
      {isLoading ? "..." : isConfirming ? `Confirm ${label}?` : label}
    </button>
  );
}
