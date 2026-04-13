import type { SelectHTMLAttributes, ReactNode } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
	children?: ReactNode;
}

export default function Select({ className = "", children, ...props }: Props) {
	return (
		<select
			{...props}
			className={[
				"inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-none",
				className,
			].join(" ")}
		>
			{children}
		</select>
	);
}

