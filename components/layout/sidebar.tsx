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
} from "lucide-react";

export type UserRole = "ADMIN" | "PROFESSIONAL" | "PATIENT";

interface SidebarProps {
  role: UserRole;
  badge?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: "Inicio", href: "/profesional/dashboard", icon: LayoutDashboard },
    {
      label: "Usuarios",
      href: "/profesional/dashboard/usuarios",
      icon: Users,
    },
    {
      label: "Profesionales registrados",
      href: "/profesional/dashboard/profesionales",
      icon: Briefcase,
    },
    {
      label: "Validaciones pendientes",
      href: "/profesional/dashboard/validaciones",
      icon: BadgeCheck,
    },
    { label: "Suscripciones", href: "/profesional/dashboard/suscripciones", icon: Crown },
    { label: "Citas", href: "/profesional/dashboard/citas", icon: CalendarDays },
    {
      label: "Reseñas",
      href: "/profesional/dashboard/resenas",
      icon: MessageSquare,
    },
  ],
  PROFESSIONAL: [
    { label: "Inicio", href: "/profesional/dashboard", icon: LayoutDashboard },
    { label: "Mi perfil", href: "/profesional/dashboard/perfil", icon: UserCircle },
    { label: "Clientes", href: "/profesional/dashboard/clientes", icon: Users, badge: 0 },
    {
      label: "Suscripción",
      href: "/profesional/dashboard/suscripcion",
      icon: CreditCard,
    },
    { label: "Citas", href: "/profesional/dashboard/citas", icon: CalendarDays },
    { label: "Mensajes", href: "/profesional/dashboard/mensajes", icon: MessageSquare },
  ],
  PATIENT: [
    { label: "Inicio", href: "/paciente/dashboard", icon: LayoutDashboard },
    {
      label: "Guía de Expertos",
      href: "/paciente/dashboard/expertos",
      icon: Search,
    },
    { label: "Citas", href: "/paciente/dashboard/citas", icon: CalendarDays },
    { label: "Mensajes", href: "/paciente/dashboard/mensajes", icon: MessageSquare },
    { label: "Documentos", href: "/paciente/dashboard/documentos", icon: FileText },
    { label: "Mi perfil", href: "/paciente/dashboard/perfil", icon: UserCircle },
  ],
};

export function Sidebar({ role, badge }: SidebarProps) {
  const pathname = usePathname();
  const items = navigation[role].map((item) =>
    item.badge !== undefined && badge !== undefined && badge > 0
      ? { ...item, badge }
      : item
  );

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
        <svg
          className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
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
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
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
