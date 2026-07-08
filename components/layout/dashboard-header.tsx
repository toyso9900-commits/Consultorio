"use client";

import { Menu } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  onMenuClick,
}: DashboardHeaderProps) {
  const { dictionary } = useI18n();

  return (
    <header className="sticky top-16 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={dictionary.common.openMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {(title || subtitle) && (
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
