import React, { useState } from 'react';
import { ProcessedTicket, TicketStatus } from '../types';
import {
  X,
  Building2,
  Plane,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Mail,
  Copy,
  Code2,
  Sparkles,
  Phone,
  FileText,
  MapPin,
  Send,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: ProcessedTicket | null;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
}) => {
  if (!ticket) return null;

  const [copiedReply, setCopiedReply] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'email' | 'odoo_raw' | 'reply'>('overview');

  const copyToClipboard = (text: string, type: 'reply' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'reply') {
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const statusOptions: { id: TicketStatus; label: string; color: string }[] = [
    { id: 'NEW', label: 'New Inbound', color: 'bg-slate-800 text-slate-300' },
    { id: 'AI_PROCESSED', label: 'AI Classified', color: 'bg-indigo-950 text-indigo-300' },
    { id: 'DISPATCHED_TO_ODOO', label: 'Dispatched to Odoo', color: 'bg-teal-950 text-teal-300' },
    { id: 'IN_PROGRESS', label: 'In Progress (On-Site)', color: 'bg-amber-950 text-amber-300' },
    { id: 'RESOLVED', label: 'Resolved & Verified', color: 'bg-emerald-950 text-emerald-300' },
    { id: 'ESCALATED', label: 'Escalated to AOCC Chief', color: 'bg-rose-950 text-rose-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-blue-600">
                {ticket.odooTicketId || 'PENDING-DISPATCH'}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border ${
                  ticket.aiAnalysis.priority === 'P1_CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : ticket.aiAnalysis.priority === 'P2_HIGH'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {ticket.aiAnalysis.priorityLabel}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                {ticket.aiAnalysis.terminalLabel}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {ticket.aiAnalysis.ticketTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Lifecycle Stepper */}
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider shrink-0 mr-3">STAGE:</span>
          <div className="flex items-center gap-1.5">
            {statusOptions.map((opt) => {
              const isCurrent = ticket.status === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateStatus(ticket.id, opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="bg-white border-b border-slate-100 px-3 sm:px-5 flex space-x-2 sm:space-x-4 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Incident Overview</span>
          </button>
          <button
            onClick={() => setActiveSubTab('email')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inbound Email Content</span>
          </button>
          <button
            onClick={() => setActiveSubTab('odoo_raw')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'odoo_raw'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Odoo ERP JSON-RPC Payload</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reply')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'reply'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Auto Passenger Response</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Executive Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  AI Context Summary
                </div>
                <p className="text-slate-800 text-xs leading-relaxed font-medium">
                  {ticket.aiAnalysis.summary}
                </p>
              </div>

              {/* Department & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    RESPONSIBLE CIAL DEPARTMENT
                  </div>
                  <div className="text-slate-900 font-extrabold text-xs">
                    {ticket.aiAnalysis.departmentLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Lead: {ticket.aiAnalysis.suggestedTeamLead}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    EXACT AIRPORT LOCATION
                  </div>
                  <div className="text-slate-900 font-extrabold text-xs">
                    {ticket.aiAnalysis.specificLocation}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Terminal: {ticket.aiAnalysis.terminalLabel}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    GROUND DISPATCH ASSIGNEE
                  </div>
                  <div className="text-slate-900 font-extrabold text-xs">
                    {ticket.aiAnalysis.suggestedAssignee}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Dispatched via Odoo Field Service &amp; SMS
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    SLA TARGET WINDOW
                  </div>
                  <div className="text-slate-900 font-extrabold text-xs">
                    {ticket.aiAnalysis.slaMinutes} Minutes ({Math.round(ticket.aiAnalysis.slaMinutes / 60)} Hours)
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Severity: {ticket.aiAnalysis.priority.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Required Ground Actions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Mandated Ground Tasks (Odoo Action Checklist)
                </div>
                <div className="space-y-1.5">
                  {ticket.aiAnalysis.actionRequired.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-800 text-xs font-medium">
                      <span className="w-4 h-4 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemini AI Reasoning */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-1">
                <div className="text-blue-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  AI MODEL REASONING
                </div>
                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                  "{ticket.aiAnalysis.reasoning}"
                </p>
              </div>

              {/* Event Logs */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Audit Trail &amp; Dispatch Timeline
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {ticket.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                      <span className="text-slate-400 shrink-0 font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}:
                      </span>
                      <span className="text-slate-800 font-medium">{log.action}</span>
                      <span className="text-slate-400 text-[10px]">[{log.actor}]</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EMAIL */}
          {activeSubTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">SENDER</span>
                    <span className="text-slate-900 font-bold">{ticket.email.sender.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">EMAIL</span>
                    <span className="text-slate-700 font-mono text-[11px] font-semibold">{ticket.email.sender.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">PHONE</span>
                    <span className="text-slate-700 font-mono text-[11px] font-semibold">{ticket.email.sender.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">FLIGHT / PNR</span>
                    <span className="text-slate-700 font-mono text-[11px] font-semibold">{ticket.email.sender.flightNumber || ticket.email.sender.pnr || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">SUBJECT</span>
                  <div className="text-slate-900 font-bold text-sm">{ticket.email.subject}</div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">RAW EMAIL BODY</span>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-line text-xs font-sans leading-relaxed font-medium">
                    {ticket.email.body}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ODOO JSON-RPC PAYLOAD */}
          {activeSubTab === 'odoo_raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Odoo `helpdesk.ticket` Object Payload ready for XML-RPC / JSON-RPC execute_kw:</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(ticket.aiAnalysis.odooPayload, null, 2), 'json')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedJson ? 'Copied!' : 'Copy Payload'}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-[380px] scrollbar-thin shadow-inner">
                {JSON.stringify(ticket.aiAnalysis.odooPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 4: AUTO RESPONSE */}
          {activeSubTab === 'reply' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Draft Passenger Acknowledgement Email:</span>
                <button
                  onClick={() => copyToClipboard(ticket.aiAnalysis.draftAutoReply, 'reply')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedReply ? 'Copied!' : 'Copy Reply Text'}
                </button>
              </div>

              <div className="bg-slate-50 text-slate-800 p-5 rounded-2xl border border-slate-200 text-xs font-sans whitespace-pre-line leading-relaxed max-h-[380px] overflow-y-auto font-medium">
                {ticket.aiAnalysis.draftAutoReply}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-slate-500 text-xs font-medium">
            Logged in CIAL Operations Engine • IATA: <strong className="text-slate-900">COK</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
