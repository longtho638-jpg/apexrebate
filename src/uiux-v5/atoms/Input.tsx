import clsx from "clsx";

export default function Input({ 
  placeholder, 
  value, 
  onChange, 
  className = "",
  ...props 
}: { 
  placeholder?: string; 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  className?: string; 
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={clsx(
        "w-full px-4 py-3 bg-offWhite border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent text-midnight placeholder:text-textSecondary",
        className
      )}
      {...props}
    />
  );
}