"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardHeader() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setNotifications(data);
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', n.id);

      if (!error) {
        setNotifications(prev => prev.map(notif =>
          notif.id === n.id ? { ...notif, is_read: true } : notif
        ));
      }
    }
    setShowNotifications(false);
    if (n.brief_id) {
      router.push(`/brief/${n.brief_id}`);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time notifications
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`dashboard-notifications-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-3 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 shadow-md shadow-black/40">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Search bar removed as requested */}
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`text-on-surface-variant p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-surface-container-high text-on-surface' : 'hover:bg-surface-container-high/50'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/30">
                <h3 className="font-semibold text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-outline text-[40px] mb-2 opacity-50">notifications_paused</span>
                    <p className="text-sm text-on-surface-variant">No notifications right now.</p>
                    <p className="text-xs text-outline mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`group relative p-4 border-b border-outline-variant/10 flex gap-3 cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-container-highest/50'}`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${n.type === 'approval' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-tertiary/20 text-tertiary'
                          } ${n.is_read ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {n.type === 'approval' ? 'check_circle' : 'chat_bubble'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.is_read ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>{n.message}</p>
                          <p className="text-[10px] text-outline mt-1 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex flex-col items-center justify-between gap-2 shrink-0">
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(207,188,255,0.5)]"></div>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(e, n.id)}
                            className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all p-1 rounded-full hover:bg-error/10"
                            title="Remove notification"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Guide / Help */}
        <div className="relative hidden sm:block" ref={helpRef}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`text-on-surface-variant p-2 rounded-full transition-colors ${showHelp ? 'bg-surface-container-high text-on-surface' : 'hover:bg-surface-container-high/50'}`}
            title="How It Works"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {showHelp && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-outline-variant/20 bg-surface-container-highest/30">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                  How It Works
                </h3>
              </div>

              <div className="p-4 flex flex-col gap-5">
                {/* Step 1: Inputs */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">1</div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-on-surface">Supported Inputs</p>
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant" title="Text">description</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant" title="Audio">mic</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant" title="Images">image</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Upload notes, voice memos, or wireframe sketches.</p>
                  </div>
                </div>

                {/* Step 2: AI Flow */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">2</div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-on-surface">AI Generation</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Briefly AI analyzes all inputs to generate a structured, professional brief.</p>
                  </div>
                </div>

                {/* Step 3: Client Approval */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">3</div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-on-surface">Client Collaboration</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Share the live link. Clients can approve or request changes directly inline.</p>
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-outline-variant/20">
                  <button
                    onClick={() => setShowHelp(false)}
                    className="w-full py-2 bg-surface-container-highest hover:bg-primary/10 text-primary text-[11px] font-bold rounded-lg transition-colors uppercase tracking-widest"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
