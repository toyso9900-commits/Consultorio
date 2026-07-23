import Link from "next/link";
import { ProfessionalSummary, SpecialtyIcon } from "./professional-selector";

type RoutineProfessionalSummaryCardProps = {
  professional: ProfessionalSummary;
  routineStatus: string;
  viewDetailLabel: string;
  href: string;
};

export function RoutineProfessionalSummaryCard({
  professional,
  routineStatus,
  viewDetailLabel,
  href,
}: RoutineProfessionalSummaryCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-[#2f2c28] bg-[#23201d]/90 p-5 transition-colors hover:border-emerald-500/30 hover:bg-[#2a2622]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <SpecialtyIcon specialty={professional.specialty} />
          <h3 className="truncate text-base font-semibold text-white">
            {professional.name}
          </h3>
        </div>
        <p className="mt-1 text-sm text-white/60">{routineStatus}</p>
      </div>
      <span className="shrink-0 pl-4 text-sm font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300">
        {viewDetailLabel}
      </span>
    </Link>
  );
}
