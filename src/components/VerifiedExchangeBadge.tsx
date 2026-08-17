import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isVerifiedExchanger } from "@/lib/business-rules";

export function VerifiedExchangeBadge({
  alquileresCompletados,
  devolucionesOk,
  compact,
}: {
  alquileresCompletados: number;
  devolucionesOk: number;
  compact?: boolean;
}) {
  if (!isVerifiedExchanger(alquileresCompletados, devolucionesOk)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-forest-800 px-2 py-0.5 text-[11px] font-bold text-white",
        compact && "text-[10px]",
      )}
      title="3+ intercambios cerrados con acta de devolución"
    >
      <BadgeCheck className="h-3 w-3" /> Intercambio verificado
    </span>
  );
}
