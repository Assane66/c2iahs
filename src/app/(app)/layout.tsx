
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookCopy,
  CreditCard,
  LayoutDashboard,
  Users,
  UserCog,
  School,
  UserX,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <Sidebar className="dark">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-8 text-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              Institut islamique Imame Al Housseynou Sow
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref>
                <SidebarMenuButton
                  isActive={isActive('/dashboard')}
                  tooltip="Tableau de Bord"
                >
                  <LayoutDashboard />
                  Tableau de Bord
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/students" passHref>
                <SidebarMenuButton
                  isActive={isActive('/students')}
                  tooltip="Élèves"
                >
                  <Users />
                  Élèves
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/classes" passHref>
                <SidebarMenuButton
                  isActive={isActive('/classes')}
                  tooltip="Classes"
                >
                  <School />
                  Classes
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/payments" passHref>
                <SidebarMenuButton
                  isActive={isActive('/payments')}
                  tooltip="Paiements"
                >
                  <CreditCard />
                  Paiements
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/unpaid" passHref>
                <SidebarMenuButton
                  isActive={isActive('/unpaid')}
                  tooltip="Non Payé"
                >
                  <UserX />
                  Non Payé
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/users" passHref>
                <SidebarMenuButton
                  isActive={isActive('/users')}
                  tooltip="Utilisateurs"
                >
                  <UserCog />
                  Utilisateurs
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* You can add footer content here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or search here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
