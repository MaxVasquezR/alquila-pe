import { ShieldCheck, ShieldAlert, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SecurityBadge({
  dni,
  phone,
  premium,
  compact,
}: {
  dni: boolean;
  phone?: boolean;
  premium?: boolean;
  compact?: boolean;
}) {
  if (!dni) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-[11px] font-semibold text-danger-600">
        <ShieldAlert className="h-3 w-3" /> Sin DNI verificado
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-[11px] font-semibold text-forest-700",
          compact && "text-[10px]",
        )}
      >
        <ShieldCheck className="h-3 w-3" /> DNI verificado
      </span>
      {phone ? (
        <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-forest-700 ring-1 ring-forest-100">
          WhatsApp validado
        </span>
      ) : null}
      {premium ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-200/60 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
          <Crown className="h-3 w-3" /> Premium
        </span>
      ) : null}
    </span>
  );
}
