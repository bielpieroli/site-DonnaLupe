import { isAxiosError } from "axios";

export function apiMsg(err: unknown, fallback: string): string {
  if (isAxiosError(err)) return (err.response?.data as { error?: string })?.error ?? fallback;
  return err instanceof Error ? err.message : fallback;
}

export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
