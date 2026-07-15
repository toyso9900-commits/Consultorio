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
  Dumbbell,
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
    { label: (d) => d.nav.routines, href: "/profesional/dashboard/rutinas", icon: Dumbbell },
    { label: (d) => d.nav.subscription, href: "/profesional/dashboard/suscripcion", icon: CreditCard },
    { label: (d) => d.nav.appointments, href: "/profesional/dashboard/citas", icon: CalendarDays },
  ],
  PATIENT: [
    { label: (d) => d.nav.home, href: "/paciente/dashboard", icon: LayoutDashboard },
    { label: (d) => d.nav.photos, href: "/paciente/dashboard/nutricion", icon: Camera },
    { label: (d) => d.nav.experts, href: "/paciente/dashboard/expertos", icon: Search },
    { label: (d) => d.nav.appointments, href: "/paciente/dashboard/citas", icon: CalendarDays },
    { label: (d) => d.nav.messages, href: "/paciente/dashboard/mensajes", icon: MessageSquare },
    { label: (d) => d.nav.myRoutine, href: "/paciente/dashboard/rutina", icon: Dumbbell },
    { label: (d) => d.nav.mySubscriptions, href: "/paciente/dashboard/suscripcion", icon: CreditCard },
    { label: (d) => d.nav.account, href: "/paciente/dashboard/perfil", icon: UserCircle },
  ],
};

const sidebarBgByRole: Record<UserRole, string> = {
  ADMIN: "bg-sidebar dark:bg-emerald-950/40",
  PROFESSIONAL: "bg-sidebar dark:bg-emerald-900/40",
  PATIENT: "bg-[#C4D1C3] dark:bg-emerald-900/20",
};

const activeClassByRole: Record<UserRole, string> = {
  ADMIN:
    "bg-sidebar-active text-sidebar-active-foreground dark:bg-emerald-800/40 dark:text-emerald-100",
  PROFESSIONAL:
    "bg-sidebar-active text-sidebar-active-foreground dark:bg-emerald-800/40 dark:text-emerald-100",
  PATIENT:
    "bg-[#7C907E] text-white dark:bg-emerald-800/40 dark:text-emerald-100",
};

const inactiveClassByRole: Record<UserRole, string> = {
  ADMIN:
    "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100",
  PROFESSIONAL:
    "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100",
  PATIENT:
    "text-stone-700 hover:bg-[#7C907E]/25 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100",
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
      <span className="text-lg font-bold tracking-tight text-foreground">
        Consultorio
      </span>
    </div>
  );
}

function NavLink({
  item,
  role,
  isActive,
  onClick,
}: {
  item: NavItem;
  role: UserRole;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { dictionary } = useI18n();
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive ? activeClassByRole[role] : inactiveClassByRole[role]
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
  role,
  badge,
  onItemClick,
}: {
  items: NavItem[];
  role: UserRole;
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
            <NavLink
              item={item}
              role={role}
              isActive={isActive}
              onClick={onItemClick}
            />
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
        <NavItems items={topItems} role={role} badge={badge} />
      </nav>

      <div className="border-t border-stone-200/60 p-4 dark:border-stone-800/40">
        <NavItems items={bottomItems} role={role} badge={badge} />
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
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100"
            aria-label={dictionary.common.closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <NavItems items={topItems} role={role} badge={badge} onItemClick={onClose} />
        </nav>

        <div className="border-t border-stone-200/60 p-4 dark:border-stone-800/40">
          <NavItems items={bottomItems} role={role} badge={badge} onItemClick={onClose} />
        </div>
      </div>
    </>
  );
}
