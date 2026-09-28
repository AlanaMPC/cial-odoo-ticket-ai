import React, { useState, useEffect } from 'react';
import {
  Plane,
  Cpu,
  LayoutDashboard,
  FileCode2,
  BookOpen,
  BarChart3,
  Sparkles,
  Inbox,
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ticketCount: number;
  criticalCount: number;
  unreadEmailCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  ticketCount,
  criticalCount,
  unreadEmailCount,
}) => {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setIstTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'inbox_stream', label: 'Inbound Mailbox Hub', icon: Inbox, badge: unreadEmailCount !== undefined ? `${unreadEmailCount} Unread` : 'Live' },
    { id: 'analyzer', label: 'AI Email Dispatcher', icon: Sparkles, badge: null },
    { id: 'whatsapp_intake', label: 'WhatsApp Helpline (15m Buffer)', icon: MessageSquare, badge: 'New' },
    { id: 'odoo_board', label: 'Odoo Helpdesk Board', icon: LayoutDashboard, badge: ticketCount },
    { id: 'analytics', label: 'Airport Ops Analytics', icon: BarChart3, badge: null },
    { id: 'api_code', label: 'Odoo API & Python Bridge', icon: FileCode2, badge: null },
    { id: 'architecture_roadmap', label: 'Architecture & Project Plan', icon: BookOpen, badge: 'BTech Guide' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      {/* Top Bento Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-0 sm:h-18 gap-2.5">
          
          {/* Logo & Airport Identifier */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  CIAL <span className="text-blue-600 font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 font-bold">COK</span>
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ODOO V17 ERP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Autonomous Inbound Email-to-Odoo Ticket Dispatch System
              </p>
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{criticalCount} Critical</span>
              </div>
            )}

            {/* Airport IST Time */}
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] sm:text-xs font-mono text-slate-700">
              <span className="text-slate-400 font-sans font-medium">IST:</span>
              <span className="text-blue-600 font-bold">{istTime || '08:30:00'}</span>
            </div>

            {/* Model Tag */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] sm:text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Gemini 3.6 Flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Navigation Tabs Bar */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
