import clsx from "clsx";

type BadgeType = "success" | "warning" | "danger" | "info";

export default function Badge({ 
  children, 
  type = "info", 
  className = "" 
}: { 
  children: React.ReactNode; 
  type?: BadgeType; 
  className?: string; 
}) {
  const typeClasses = clsx({
    "bg-success/20 text-success": type === "success",
    "bg-warning/20 text-warning": type === "warning",
    "bg-danger/20 text-danger": type === "danger",
    "bg-info/20 text-info": type === "info",
  });
  
  return (
    <span className={clsx("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", typeClasses, className)}>
      {children}
    </span>
  );
}