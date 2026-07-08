"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Crown,
  CalendarDays,
  MessageSquare,
  UserCircle,
  CreditCard,
  Search,
  Briefcase,
  Camera,
  X,
  Leaf,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/server";

export type UserRole = "ADMIN" | "PROFESSIONAL" | "PATIENT";

interface SidebarProps {
  role: UserRole;
  badge?: number;
}

interface NavItem {
  label: (dictionary: Dictionary) => string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: (d) => d.nav.home, href: "/profesional/dashboard", icon: LayoutDashboard },
    { label: (d) => d.nav.users, href: "/profesional/dashboard/usuarios", icon: Users },
    { label: (d) => d.nav.professionals, href: "/profesional/dashboard/profesionales", icon: Briefcase },
    { label: (d) => d.nav.validations, href: "/profesional/dashboard/validaciones", icon: BadgeCheck },
    { label: (d) => d.nav.subscription, href: "/profesional/dashboard/suscripciones", icon: Crown },
    { label: (d) => d.nav.reviews, href: "/profesional/dashboard/resenas", icon: MessageSquare },
  ],
  PROFESSIONAL: [
    { label: (d) => d.nav.home, href: "/profesional/dashboard", icon: LayoutDashboard },
    { label: (d) => d.nav.profile, href: "/profesional/dashboard/perfil", icon: UserCircle },
    { label: (d) => d.nav.clients, href: "/profesional/dashboard/clientes", icon: Users, badge: 0 },
    { label: (d) => d.nav.subscription, href: "/profesional/dashboard/suscripcion", icon: CreditCard },
    { label: (d) => d.nav.appointments, href: "/profesional/dashboard/citas", icon: CalendarDays },
  ],
  PATIENT: [
    { label: (d) => d.nav.home, href: "/paciente/dashboard", icon: LayoutDashboard },
    { label: (d) => d.nav.photos, href: "/paciente/dashboard/nutricion", icon: Camera },
    { label: (d) => d.nav.experts, href: "/paciente/dashboard/expertos", icon: Search },
    { label: (d) => d.nav.appointments, href: "/paciente/dashboard/citas", icon: CalendarDays },
    { label: (d) => d.nav.messages, href: "/paciente/dashboard/mensajes", icon: MessageSquare },
    { label: (d) => d.nav.account, href: "/paciente/dashboard/perfil", icon: UserCircle },
  ],
};

const sidebarBgByRole: Record<UserRole, string> = {
  ADMIN: "bg-emerald-900/10 dark:bg-emerald-950/40",
  PROFESSIONAL: "bg-emerald-100/50 dark:bg-emerald-900/40",
  PATIENT: "bg-emerald-100/50 dark:bg-emerald-900/20",
};

const homeHrefByRole: Record<UserRole, string> = {
  ADMIN: "/profesional/dashboard",
  PROFESSIONAL: "/profesional/dashboard",
  PATIENT: "/paciente/dashboard",
};

function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
        <Leaf className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold tracking-tight text-stone-800 dark:text-stone-100">
        Consultorio
      </span>
    </div>
  );
}

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { dictionary } = useI18n();
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-emerald-200/60 text-emerald-900 dark:bg-emerald-800/40 dark:text-emerald-100"
          : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100"
      }`}
    >
      <span className="flex items-center gap-3">
        <item.icon className="h-5 w-5" />
        {item.label(dictionary)}
      </span>
      {item.badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavItems({
  items,
  badge,
  onItemClick,
}: {
  items: NavItem[];
  badge?: number;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const mapped = items.map((item) =>
    item.badge !== undefined && badge !== undefined && badge > 0
      ? { ...item, badge }
      : item
  );

  return (
    <ul className="space-y-1">
      {mapped.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <NavLink item={item} isActive={isActive} onClick={onItemClick} />
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ role, badge }: SidebarProps) {
  const homeHref = homeHrefByRole[role];
  const bgClass = sidebarBgByRole[role];
  const allItems = navigation[role];
  const topItems = allItems.slice(0, -1);
  const bottomItems = allItems.slice(-1);

  return (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-stone-200/60 dark:border-stone-800/40 lg:flex ${bgClass}`}
    >
      <div className="flex h-16 items-center gap-2 px-6">
        <Link
          href={homeHref}
          className="flex items-center gap-2 transition-colors hover:opacity-80"
        >
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <NavItems items={topItems} badge={badge} />
      </nav>

      <div className="border-t border-stone-200/60 p-4 dark:border-stone-800/40">
        <NavItems items={bottomItems} badge={badge} />
      </div>
    </aside>
  );
}

interface MobileSidebarProps extends SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ role, badge, open, onClose }: MobileSidebarProps) {
  const { dictionary } = useI18n();
  const homeHref = homeHrefByRole[role];
  const bgClass = sidebarBgByRole[role];
  const allItems = navigation[role];
  const topItems = allItems.slice(0, -1);
  const bottomItems = allItems.slice(-1);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-stone-200/60 dark:border-stone-800/40 lg:hidden ${bgClass}`}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href={homeHref}
            onClick={onClose}
            className="transition-colors hover:opacity-80"
          >
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100"
            aria-label={dictionary.common.closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <NavItems items={topItems} badge={badge} onItemClick={onClose} />
        </nav>

        <div className="border-t border-stone-200/60 p-4 dark:border-stone-800/40">
          <NavItems items={bottomItems} badge={badge} onItemClick={onClose} />
        </div>
      </div>
    </>
  );
}
