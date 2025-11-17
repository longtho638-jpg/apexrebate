import clsx from "clsx";

export default function Divider({ className = "" }: { className?: string }) {
  return (
    <hr className={clsx("border-t border-white/10 my-4", className)} />
  );
}