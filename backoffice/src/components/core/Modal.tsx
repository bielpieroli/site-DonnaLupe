import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	children?: ReactNode;
	widthClassName?: string;
}

export default function Modal({ open, onClose, title, children, widthClassName = "max-w-lg" }: ModalProps) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		if (open) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className={["relative z-10 w-full", widthClassName].join(" ")}>
				<div className="rounded-2xl border border-border bg-surface p-5 shadow-lg">
					<div className="flex items-start justify-between gap-4">
						<div>
							{title && <h3 className="text-lg font-semibold text-text-h">{title}</h3>}
						</div>
						<button onClick={onClose} className="text-muted hover:text-text">
							<X className="w-5 h-5" />
						</button>
					</div>
					<div className="mt-3">{children}</div>
				</div>
			</div>
		</div>
	);
}

