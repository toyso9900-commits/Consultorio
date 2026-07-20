"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Leaf,
  BookOpen,
  CalendarDays,
  Mail,
  Dumbbell,
  CreditCard,
  UserCircle,
  LayoutDashboard,
  Users,
  BadgeCheck,
  Crown,
  MessageSquare,
  Briefcase,
  X,
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
    { label: (d) => d.nav.home, href: "/paciente/dashboard", icon: Home },
    { label: (d) => d.nav.photos, href: "/paciente/dashboard/nutricion", icon: Leaf },
    { label: (d) => d.nav.experts, href: "/paciente/dashboard/expertos", icon: BookOpen },
    { label: (d) => d.nav.appointments, href: "/paciente/dashboard/citas", icon: CalendarDays },
    { label: (d) => d.nav.messages, href: "/paciente/dashboard/mensajes", icon: Mail },
    { label: (d) => d.nav.myRoutine, href: "/paciente/dashboard/rutina", icon: Dumbbell },
    { label: (d) => d.nav.mySubscriptions, href: "/paciente/dashboard/suscripcion", icon: CreditCard },
    { label: (d) => d.nav.account, href: "/paciente/dashboard/perfil", icon: UserCircle },
  ],
};

const homeHrefByRole: Record<UserRole, string> = {
  ADMIN: "/profesional/dashboard",
  PROFESSIONAL: "/profesional/dashboard",
  PATIENT: "/paciente/dashboard",
};

const sidebarBg = "bg-[#1a1a1a]";
const activeClass = "relative rounded-r-xl border-l-4 border-[#55eb55] bg-[#1f1f1f] text-[#55eb55] shadow-[0_0_12px_rgba(85,235,85,0.25)]";
const inactiveClass = "text-white/80 hover:bg-[#252525] hover:text-[#55eb55]";

function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#55eb55]">
        <Leaf className="h-5 w-5" strokeWidth={2} />
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
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
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#55eb55] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
        isActive ? activeClass : inactiveClass
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

function AccountLink({
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
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#55eb55] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
        N
      </span>
      {item.label(dictionary)}
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
  const allItems = navigation[role];
  const topItems = allItems.slice(0, -1);
  const bottomItem = allItems[allItems.length - 1];
  const isPatientAccount = role === "PATIENT";

  return (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col ${sidebarBg} lg:flex`}
    >
      <div className="flex h-16 items-center gap-2 px-6">
        <Link
          href={homeHref}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <NavItems items={topItems} badge={badge} />
      </nav>

      <div className="border-t border-white/10 p-4">
        {isPatientAccount ? (
          <AccountItem item={bottomItem} badge={badge} onItemClick={undefined} />
        ) : (
          <NavItems items={[bottomItem]} badge={badge} />
        )}
      </div>
    </aside>
  );
}

function AccountItem({
  item,
  badge,
  onItemClick,
}: {
  item: NavItem;
  badge?: number;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const mapped =
    item.badge !== undefined && badge !== undefined && badge > 0
      ? { ...item, badge }
      : item;
  const isActive = pathname === mapped.href;

  return (
    <AccountLink item={mapped} isActive={isActive} onClick={onItemClick} />
  );
}

interface MobileSidebarProps extends SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ role, badge, open, onClose }: MobileSidebarProps) {
  const { dictionary } = useI18n();
  const homeHref = homeHrefByRole[role];
  const allItems = navigation[role];
  const topItems = allItems.slice(0, -1);
  const bottomItem = allItems[allItems.length - 1];
  const isPatientAccount = role === "PATIENT";

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col ${sidebarBg} lg:hidden`}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href={homeHref}
            onClick={onClose}
            className="transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={dictionary.common.closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <NavItems items={topItems} badge={badge} onItemClick={onClose} />
        </nav>

        <div className="border-t border-white/10 p-4">
          {isPatientAccount ? (
            <AccountItem item={bottomItem} badge={badge} onItemClick={onClose} />
          ) : (
            <NavItems items={[bottomItem]} badge={badge} onItemClick={onClose} />
          )}
        </div>
      </div>
    </>
  );
}
