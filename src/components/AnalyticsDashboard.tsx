import React from 'react';
import { ProcessedTicket } from '../types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Building2,
  Zap,
  Users,
  Timer
} from 'lucide-react';

interface AnalyticsDashboardProps {
  tickets: ProcessedTicket[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tickets }) => {
  const total = tickets.length;
  const p1Count = tickets.filter((t) => t.aiAnalysis.priority === 'P1_CRITICAL').length;
  const p2Count = tickets.filter((t) => t.aiAnalysis.priority === 'P2_HIGH').length;
  const p3Count = tickets.filter((t) => t.aiAnalysis.priority === 'P3_MEDIUM').length;
  const p4Count = tickets.filter((t) => t.aiAnalysis.priority === 'P4_LOW').length;

  const t3Count = tickets.filter((t) => t.aiAnalysis.terminal === 'T3_INTERNATIONAL').length;
  const t1Count = tickets.filter((t) => t.aiAnalysis.terminal === 'T1_DOMESTIC').length;
  const t2Count = tickets.filter((t) => t.aiAnalysis.terminal === 'T2_EXECUTIVE').length;
  const otherTerminals = total - t3Count - t1Count - t2Count;

  // Department counts
  const deptCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    const label = t.aiAnalysis.departmentLabel;
    deptCounts[label] = (deptCounts[label] || 0) + 1;
  });

  return (
    <div className="space-y-6 w-full max-w-full pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-2xs shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              CIAL Airport Incident &amp; Operations Analytics
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Real-time metrics demonstrating automated email-to-ticket triage throughput, terminal complaint density, and SLA performance.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-1">
          <div className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>TOTAL EMAILS TRIAGED</span>
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[10px] sm:text-[11px] text-blue-600 flex items-center gap-1 mt-1 font-bold">
            <Zap className="w-3 h-3" />
            <span>100% Automated by AI</span>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>AVERAGE TRIAGE TIME</span>
            <Timer className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 1 Second</div>
            <div className="text-[10px] sm:text-[11px] text-blue-100 mt-1 font-medium">
              vs. 35-50 mins manual staff reading
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-1">
          <div className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>CRITICAL P1 DISPATCHES</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{p1Count}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 font-medium">
            Immediate 15m Ground SLA
          </div>
        </div>

        <div className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-1 flex flex-col justify-between">
          <div className="text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>PASSENGER AUTO-REPLY</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
            <div className="text-[10px] sm:text-[11px] text-indigo-100 mt-1 font-medium">
              Instant Kerala Hospitality SLA
            </div>
          </div>
        </div>

      </div>

      {/* 2-Column Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Terminal Density Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-600" />
              Incidents by CIAL Terminal
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Location Distribution</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Terminal 3 (International)</span>
                <span className="font-mono font-bold text-slate-900">{t3Count} ({total ? Math.round((t3Count / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total ? (t3Count / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Terminal 1 (Domestic)</span>
                <span className="font-mono font-bold text-slate-900">{t1Count} ({total ? Math.round((t1Count / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total ? (t1Count / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Terminal 2 (Executive / VVIP)</span>
                <span className="font-mono font-bold text-slate-900">{t2Count} ({total ? Math.round((t2Count / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total ? (t2Count / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Airside / Cargo / Parking</span>
                <span className="font-mono font-bold text-slate-900">{otherTerminals} ({total ? Math.round((otherTerminals / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${total ? (otherTerminals / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Priority &amp; SLA Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Urgency Index</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-1">
              <div className="text-rose-700 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                P1 - Critical (15m SLA)
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{p1Count}</div>
              <div className="text-[10px] text-slate-500 font-medium">Leaks, Belt Jams, FOD</div>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-1">
              <div className="text-amber-700 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                P2 - High (1h SLA)
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{p2Count}</div>
              <div className="text-[10px] text-slate-500 font-medium">Wheelchair PRM, AC Trips</div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-1">
              <div className="text-blue-700 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                P3 - Medium (4h SLA)
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{p3Count}</div>
              <div className="text-[10px] text-slate-500 font-medium">Lost &amp; Found, Wi-Fi OTP</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                P4 - Low (24h SLA)
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{p4Count}</div>
              <div className="text-[10px] text-slate-500 font-medium">Commercial / Retail billing</div>
            </div>
          </div>
        </div>

      </div>

      {/* Department Workload Distribution */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            CIAL Operational Department Dispatch Load
          </h3>
          <span className="text-xs text-slate-500 font-mono font-medium">10 Airport Units</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(deptCounts).map(([deptName, count]) => (
            <div key={deptName} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between">
              <span className="text-xs text-slate-800 font-bold truncate max-w-[200px]">{deptName}</span>
              <span className="px-2.5 py-1 rounded-xl bg-white font-mono text-xs font-bold text-blue-600 border border-slate-200 shadow-2xs">
                {count} {count === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
