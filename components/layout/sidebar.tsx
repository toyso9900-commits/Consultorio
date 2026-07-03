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
  FileText,
  Search,
  Briefcase,
  Camera,
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
    { label: (d) => d.nav.appointments, href: "/profesional/dashboard/citas", icon: CalendarDays },
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
    { label: (d) => d.nav.meals, href: "/paciente/dashboard/nutricion", icon: Camera },
    { label: (d) => d.nav.experts, href: "/paciente/dashboard/expertos", icon: Search },
    { label: (d) => d.nav.appointments, href: "/paciente/dashboard/citas", icon: CalendarDays },
    { label: (d) => d.nav.messages, href: "/paciente/dashboard/mensajes", icon: MessageSquare },
    { label: (d) => d.nav.documents, href: "/paciente/dashboard/documentos", icon: FileText },
    { label: (d) => d.nav.profile, href: "/paciente/dashboard/perfil", icon: UserCircle },
  ],
};

export function Sidebar({ role, badge }: SidebarProps) {
  const pathname = usePathname();
  const { dictionary } = useI18n();

  const items = navigation[role].map((item) =>
    item.badge !== undefined && badge !== undefined && badge > 0
      ? { ...item, badge }
      : item
  );

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <svg
          className="h-7 w-7 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Consultorio
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.label(dictionary)}
                  </span>
                  {item.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
