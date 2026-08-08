'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookCopy,
  CreditCard,
  LayoutDashboard,
  Users,
  School,
  UserX,
  Calendar,
  Settings,
  Shield,
  History,
  Database,
  Megaphone,
  QrCode,
} from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { NotificationsPopover } from '@/components/notifications';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-slate-50">
        <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-100">
          <SidebarHeader className="border-b border-slate-800/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-emerald-500/30">
                <Image
                  src="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight leading-none">
                  C2IAHS ADMIN
                </span>
                <span className="text-[10px] text-emerald-400 font-medium mt-1">
                  Gestion d'Établissement
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Tableau de Bord">
                    <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                    <span>Tableau de Bord</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* GESTION SCOLAIRE */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">
                Gestion Scolaire
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/scan" passHref>
                      <SidebarMenuButton isActive={isActive('/scan')} tooltip="Scanner Carte Élève" className="bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/50">
                        <QrCode className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span>Scanner Carte QR</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/students" passHref>
                      <SidebarMenuButton isActive={isActive('/students')} tooltip="Élèves">
                        <Users className="h-4 w-4 text-emerald-400" />
                        <span>Élèves</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/classes" passHref>
                      <SidebarMenuButton isActive={isActive('/classes')} tooltip="Classes">
                        <School className="h-4 w-4 text-emerald-400" />
                        <span>Classes</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/inscriptions" passHref>
                      <SidebarMenuButton isActive={isActive('/inscriptions')} tooltip="Inscriptions">
                        <BookCopy className="h-4 w-4 text-emerald-400" />
                        <span>Inscriptions</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/payments" passHref>
                      <SidebarMenuButton isActive={isActive('/payments')} tooltip="Paiements">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span>Paiements</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/unpaid" passHref>
                      <SidebarMenuButton isActive={isActive('/unpaid')} tooltip="Impayés">
                        <UserX className="h-4 w-4 text-emerald-400" />
                        <span>Impayés</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/academic-years" passHref>
                      <SidebarMenuButton isActive={isActive('/academic-years')} tooltip="Années Scolaires">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span>Années Scolaires</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* ADMINISTRATION */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/admin" passHref>
                      <SidebarMenuButton isActive={isActive('/admin')} tooltip="Contenu du Site">
                        <Megaphone className="h-4 w-4 text-emerald-400" />
                        <span>Contenu du Site</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/admin/settings" passHref>
                      <SidebarMenuButton isActive={isActive('/admin/settings')} tooltip="Paramètres Site">
                        <Settings className="h-4 w-4 text-emerald-400" />
                        <span>Paramètres Site</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/admin/users" passHref>
                      <SidebarMenuButton isActive={isActive('/admin/users')} tooltip="Rôles & Accès">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span>Rôles & Accès</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/admin/activity-log" passHref>
                      <SidebarMenuButton isActive={isActive('/admin/activity-log')} tooltip="Historique">
                        <History className="h-4 w-4 text-emerald-400" />
                        <span>Historique (Audit)</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link href="/admin/backup" passHref>
                      <SidebarMenuButton isActive={isActive('/admin/backup')} tooltip="Sauvegarde">
                        <Database className="h-4 w-4 text-emerald-400" />
                        <span>Sauvegarde JSON</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-800 p-3 text-xs text-slate-400 text-center">
            C2IAHS v2.0
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <header className="flex h-14 items-center justify-between border-b bg-white px-4 lg:h-[60px] lg:px-6 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                Système de Gestion Établissement Scolaire
              </span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
