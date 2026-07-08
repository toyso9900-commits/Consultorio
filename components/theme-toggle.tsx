"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n/client";

const options: { value: Theme; icon: React.ElementType }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { dictionary } = useI18n();

  return (
    <div className="flex items-center gap-2" role="group" aria-label={dictionary.settings.appearance}>
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            theme === value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{dictionary.settings.theme[value]}</span>
        </button>
      ))}
    </div>
  );
}
