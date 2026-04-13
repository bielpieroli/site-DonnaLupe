import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        "rounded-2xl border border-(--border) bg-(--surface) shadow-[0_14px_40px_-30px_rgba(28,25,23,0.5)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
