import clsx from "clsx";

export default function Section({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <section className={clsx("w-full", className)}>
      {children}
    </section>
  );
}