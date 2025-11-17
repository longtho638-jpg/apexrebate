import clsx from "clsx";

export default function Card({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={clsx("bg-offWhite rounded-xl p-6 shadow-sm border border-white/10", className)}>
      {children}
    </div>
  );
}