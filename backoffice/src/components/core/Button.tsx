import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClassMap: Record<Variant, string> = {
  primary: "bg-primary text-primary-contrast hover:brightness-110",
  secondary: "bg-secondary text-secondary-contrast hover:brightness-110",
  ghost: "bg-transparent text-text hover:bg-primary/20",
  danger: "bg-red-700 text-white hover:bg-red-600",
};

const sizeClassMap: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  icon: "h-9 w-9 p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
});

export default Button;