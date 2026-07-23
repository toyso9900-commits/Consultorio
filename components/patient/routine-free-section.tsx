import { Check } from "lucide-react";

type RoutineFreeSectionProps = {
  id?: string;
  title: string;
  description: string;
  checklist: string[];
  includedLabel: string;
};

export function RoutineFreeSection({
  id,
  title,
  description,
  checklist,
  includedLabel,
}: RoutineFreeSectionProps) {
  return (
    <div
      id={id}
      className="flex h-full flex-col rounded-xl border border-[#36322e] bg-[#25221e] p-5"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {checklist.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-lg border border-[#36322e] bg-[#2c2824] p-3"
          >
            <span className="text-sm text-white/90">{item}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg border border-dashed border-[#44403c] p-3 text-center">
        <p className="text-xs text-white/40">{includedLabel}</p>
      </div>
    </div>
  );
}
