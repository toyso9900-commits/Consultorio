"use client";

interface CalorieDonutChartProps {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  totalLabel: string;
}

const PROTEIN_COLOR = "#55eb55";
const CARBS_COLOR = "#5555eb";
const FAT_COLOR = "#ebeb55";
const EMPTY_COLOR = "#3c3c3c";

export function CalorieDonutChart({
  calories,
  proteinG,
  carbsG,
  fatG,
  totalLabel,
}: CalorieDonutChartProps) {
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const proteinCal = proteinG * 4;
  const carbsCal = carbsG * 4;
  const fatCal = fatG * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  let proteinLength = 0;
  let carbsLength = 0;
  let fatLength = 0;

  if (totalMacroCal > 0) {
    proteinLength = (proteinCal / totalMacroCal) * circumference;
    carbsLength = (carbsCal / totalMacroCal) * circumference;
    fatLength = (fatCal / totalMacroCal) * circumference;
  }

  const center = radius + strokeWidth / 2;
  const size = radius * 2 + strokeWidth;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${calories} kcal ${totalLabel}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={EMPTY_COLOR}
          strokeWidth={strokeWidth}
        />

        {totalMacroCal > 0 && (
          <>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={PROTEIN_COLOR}
              strokeWidth={strokeWidth}
              strokeDasharray={`${proteinLength} ${circumference - proteinLength}`}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={CARBS_COLOR}
              strokeWidth={strokeWidth}
              strokeDasharray={`${carbsLength} ${circumference - carbsLength}`}
              strokeLinecap="butt"
              transform={`rotate(${-90 + (proteinLength / circumference) * 360} ${center} ${center})`}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={FAT_COLOR}
              strokeWidth={strokeWidth}
              strokeDasharray={`${fatLength} ${circumference - fatLength}`}
              strokeLinecap="butt"
              transform={`rotate(${-90 + ((proteinLength + carbsLength) / circumference) * 360} ${center} ${center})`}
            />
          </>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {calories}
          <span className="ml-1 text-base font-medium text-white/70">
            kcal
          </span>
        </span>
        <span className="mt-1 text-xs font-medium text-white/60">
          {totalLabel}
        </span>
      </div>
    </div>
  );
}
