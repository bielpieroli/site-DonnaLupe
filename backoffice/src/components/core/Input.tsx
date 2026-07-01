import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	id?: string;
}

export default function Input({ className = "", ...props }: Props) {
	return (
		<input
			{...props}
			className={[
				"w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20",
				className,
			].join(" ")}
		/>
	);
}

