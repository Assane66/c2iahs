'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCircle2, Info, AlertTriangle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">{unreadCount} non lues</Badge>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Aucune notification.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3 text-xs flex gap-3 items-start cursor-pointer hover:bg-muted/50 transition-colors ${
                  !n.read ? 'bg-emerald-50/50 font-medium' : 'opacity-70'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {n.type === 'info' && <Info className="h-4 w-4 text-sky-600" />}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="text-foreground">{n.title}</div>
                  <div className="text-muted-foreground line-clamp-2">{n.message}</div>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-emerald-600 mt-1 shrink-0" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
