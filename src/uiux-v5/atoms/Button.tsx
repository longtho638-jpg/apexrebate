import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "",
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: ButtonVariant; 
  size?: ButtonSize;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = clsx({
    "bg-teal text-midnight hover:bg-teal/90 focus:ring-teal": variant === "primary",
    "bg-gray-200 text-midnight hover:bg-gray-300 focus:ring-gray-300": variant === "secondary",
    "bg-transparent border border-teal text-teal hover:bg-teal hover:text-midnight focus:ring-teal": variant === "outline",
    "bg-transparent text-offWhite hover:bg-white/10 focus:ring-white/10": variant === "ghost",
  });
  
  const sizeClasses = clsx({
    "px-3 py-1.5 text-sm": size === "sm",
    "px-4 py-2 text-base": size === "md",
    "px-6 py-3 text-lg": size === "lg",
  });
  
  return (
    <button 
      className={clsx(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}