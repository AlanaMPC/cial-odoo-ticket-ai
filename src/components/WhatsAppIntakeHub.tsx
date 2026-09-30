import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Settings,
  ArrowRight,
  Copy,
  Check,
  Play,
  Trash2,
  Phone,
  CheckCircle,
  Radio,
  Sliders,
  ShieldCheck,
  Info
} from 'lucide-react';
import { WhatsAppSession, ProcessedTicket, InboundEmail } from '../types';

interface WhatsAppIntakeHubProps {
  onTicketCreated: (ticket: ProcessedTicket) => void;
  onNavigateToBoard: () => void;
  onOpenInAnalyzer?: (item: InboundEmail) => void;
}

export const WhatsAppIntakeHub: React.FC<WhatsAppIntakeHubProps> = ({
  onTicketCreated,
  onNavigateToBoard,
  onOpenInAnalyzer,
}) => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [config, setConfig] = useState<any>({
    channelName: 'CIAL Official Passenger WhatsApp Grievance Helpline',
    cialHelplineNumber: '+91 484 261 0115',
    inactivityBufferMinutes: 15,
    isProductionReady: true,
    webhookUrl: '/api/whatsapp/webhook',
    verifyToken: 'cial_whatsapp_token_2026',
  });
  const [activeSubTab, setActiveSubTab] = useState<'unprocessed' | 'dispatched'>('unprocessed');
  const [loading, setLoading] = useState<boolean>(true);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<Record<string, 'idle' | 'analyzing' | 'dispatched'>>({});

  // Real Number & Webhook Settings Modal
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [editPhone, setEditPhone] = useState<string>('+91 484 261 0115');
  const [editBufferMinutes, setEditBufferMinutes] = useState<number>(15);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Fetch WhatsApp sessions from server
  const fetchSessions = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      const res = await fetch('/api/whatsapp/sessions');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        if (data.config) {
          setConfig(data.config);
          setEditPhone(data.config.cialHelplineNumber || '+91 484 261 0115');
          setEditBufferMinutes(data.config.inactivityBufferMinutes || 15);
        }
      }
    } catch {
      // Gracefully ignore transient background poll hiccups
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSessions(true);
    const interval = setInterval(() => fetchSessions(false), 5000);
    const handleFocus = () => fetchSessions(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Convert a WhatsAppSession to an InboundEmail format for the AI Dispatcher
  const convertSessionToInboundEmail = (session: WhatsAppSession): InboundEmail => {
    const inboundMsgs = (session.messages || []).filter((m) => m.direction === 'INBOUND');
    const combinedTranscript = inboundMsgs.map((m) => m.messageText).join('\n');
    const cleanPhone = (session.passengerPhone || '').replace(/[^0-9]/g, '');

    return {
      id: `wa-${session.id}`,
      sourceChannel: 'WHATSAPP',
      whatsappSessionId: session.id,
      sender: {
        name: session.passengerName || 'Passenger',
        email: `${cleanPhone}@whatsapp.cial.aero`,
        phone: session.passengerPhone,
        senderType: 'PASSENGER',
      },
      subject: `[WhatsApp] ${session.passengerName || 'Passenger'} (${inboundMsgs.length} messages buffered)`,
      body: combinedTranscript,
      receivedAt: session.firstMessageAt || session.lastMessageAt || new Date().toISOString(),
      sourceInbox: `WhatsApp Helpline (${config.cialHelplineNumber || '+91 484 261 0115'})`,
      status: session.status === 'DISPATCHED_TO_ODOO' ? 'DISPATCHED' : (session.status === 'FILTERED_NON_AIRPORT' ? 'FILTERED' : 'UNPROCESSED'),
      dispatchedTicketId: session.odooReference,
      dispatchedAt: session.status === 'DISPATCHED_TO_ODOO' ? session.lastMessageAt : undefined,
    };
  };

  // Dispatch a single session to Odoo
  const handleDispatchSingleSession = async (session: WhatsAppSession) => {
    setProcessingStatus((prev) => ({ ...prev, [session.id]: 'analyzing' }));
    try {
      const res = await fetch('/api/whatsapp/dispatch-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.isComplaint && data.ticket) {
          onTicketCreated(data.ticket);
        }
        setProcessingStatus((prev) => ({ ...prev, [session.id]: 'dispatched' }));
        await fetchSessions();
        window.dispatchEvent(new CustomEvent('cial-mailbox-updated', { detail: { whatsappId: session.id } }));
      }
    } catch (err) {
      console.error('Error dispatching WhatsApp session:', err);
      setProcessingStatus((prev) => ({ ...prev, [session.id]: 'idle' }));
    }
  };

  // Auto-Triage all pending WhatsApp sessions
  const handleAutoTriageAll = async () => {
    setIsBatchRunning(true);
    try {
      const res = await fetch('/api/whatsapp/auto-triage-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.createdTickets)) {
        data.createdTickets.forEach((t: ProcessedTicket) => onTicketCreated(t));
      }
      await fetchSessions();
      window.dispatchEvent(new CustomEvent('cial-mailbox-updated'));
    } catch (err) {
      console.error('Auto triage error:', err);
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Delete a single WhatsApp session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this WhatsApp conversation from the helpline queue?')) {
      try {
        await fetch(`/api/whatsapp/sessions/${encodeURIComponent(sessionId)}`, {
          method: 'DELETE',
        });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        window.dispatchEvent(new CustomEvent('cial-mailbox-updated'));
      } catch (err) {
        console.error('Error deleting session:', err);
      }
    }
  };

  // Clear all WhatsApp sessions (for fresh start with real number)
  const handleClearAllSessions = async () => {
    if (confirm('Clear all messages from the queue to start completely fresh for your real WhatsApp number?')) {
      try {
        await fetch('/api/whatsapp/clear', { method: 'POST' });
        setSessions([]);
        window.dispatchEvent(new CustomEvent('cial-mailbox-updated'));
      } catch (err) {
        console.error('Error clearing sessions:', err);
      }
    }
  };

  // Save Config / Set Real CIAL WhatsApp Number
  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cialHelplineNumber: editPhone.trim(),
          inactivityBufferMinutes: Number(editBufferMinutes) || 15,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setShowConfigModal(false);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to save WhatsApp config:', err);
    }
  };

  const unprocessedSessions = sessions.filter((s) => s.status === 'BUFFERING');
  const dispatchedSessions = sessions.filter((s) => s.status === 'DISPATCHED_TO_ODOO');

  // Helper to compute seconds left in 15-minute buffer
  const getSecondsLeft = (expiryIso: string) => {
    const diff = Math.floor((new Date(expiryIso).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const formatTimer = (expiryIso: string) => {
    const sec = getSecondsLeft(expiryIso);
    if (sec <= 0) return 'Ready for AI Triage';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const webhookFullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/whatsapp/webhook`
    : '/api/whatsapp/webhook';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              Live WhatsApp Grievance Intake
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">15-Min Inactivity Aggregation Buffer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CIAL Airport WhatsApp Grievance Hub
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Real passenger helpline. Receives real-time inbound WhatsApp messages, buffers sentence-by-sentence streams over a 15-minute window into unified complaints, and dispatches them to Odoo Helpdesk.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold">Real Number Connected:</span>
            <code className="font-mono font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded">{config.cialHelplineNumber || '+91 484 261 0115'}</code>
            <span className="text-emerald-300">|</span>
            <span className="font-semibold text-emerald-700">{config.inactivityBufferMinutes || 15}m Buffer</span>
            <span className="text-emerald-300">|</span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
            >
              Configure Number / Webhook
            </button>
            {sessions.length > 0 && (
              <>
                <span className="text-emerald-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAllSessions}
                  className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer text-[11px]"
                  title="Clear all messages in the queue to start fresh"
                >
                  Clear Queue
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/25"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Connect Real WhatsApp Number</span>
          </button>

          <button
            id="process-all-whatsapp-btn"
            onClick={handleAutoTriageAll}
            disabled={isBatchRunning || unprocessedSessions.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBatchRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Triaging Pipeline...</span>
              </>
            ) : unprocessedSessions.length === 0 ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>All Grievances Dispatched</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Auto-Triage All ({unprocessedSessions.length} Pending)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">AWAITING AI TRIAGE</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{unprocessedSessions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Pending 15m buffer or dispatch</div>
        </div>

        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-emerald-200 text-xs font-bold uppercase tracking-wider">DISPATCHED TO ODOO</div>
            <div className="text-3xl font-extrabold mt-1">{dispatchedSessions.length}</div>
          </div>
          <div className="text-[11px] text-emerald-100 mt-1 font-medium">Aggregated tickets created in Odoo</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">TOTAL INGESTED SESSIONS</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{sessions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Helpline passenger conversations</div>
        </div>

        <div className="bg-indigo-600 text-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider">15-MIN BUFFER RATE</div>
            <div className="text-3xl font-extrabold mt-1">100%</div>
          </div>
          <div className="text-[11px] text-indigo-100 mt-1 font-medium">Zero duplicate sentence tickets</div>
        </div>
      </div>

      {/* WhatsApp Sub-Tab Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('unprocessed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeSubTab === 'unprocessed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inbound WhatsApp Queue</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeSubTab === 'unprocessed' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {unprocessedSessions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('dispatched')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeSubTab === 'dispatched'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Dispatched to Odoo ERP</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeSubTab === 'dispatched' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {dispatchedSessions.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessions}
              title="Refresh WhatsApp Sessions"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-2.5 mt-4">
          {activeSubTab === 'unprocessed' && sessions.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Radio className="w-7 h-7 text-emerald-600 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Helpline Active — Listening for Inbound WhatsApp Messages</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto leading-relaxed">
                The CIAL WhatsApp Helpline is online at <strong className="text-slate-700">{config.cialHelplineNumber}</strong>. Inbound messages sent by passengers to your connected number automatically stream into this queue and aggregate during the 15-minute inactivity window.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Configure Real Number &amp; Webhook</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'unprocessed' && sessions.length > 0 && unprocessedSessions.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">Inbound WhatsApp Queue is Clear!</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                All inbound passenger messages have been triaged by Gemini AI and dispatched to Odoo Helpdesk.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => setActiveSubTab('dispatched')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-500 transition shadow-sm"
                >
                  View Dispatched Odoo Tickets ({dispatchedSessions.length})
                </button>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 transition"
                >
                  Helpline Settings
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'dispatched' && dispatchedSessions.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">No Dispatched Tickets Yet</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                Incoming messages will appear in the inbound queue and dispatch to Odoo Helpdesk.
              </p>
            </div>
          )}

          {(activeSubTab === 'unprocessed' ? unprocessedSessions : dispatchedSessions).map((session, idx) => {
            const inboundMsgs = (session.messages || []).filter((m) => m.direction === 'INBOUND');
            const combinedPreview = inboundMsgs.map((m) => m.messageText).join('  •  ');
            const isBuffering = session.status === 'BUFFERING';
            const status = processingStatus[session.id] || (session.status === 'DISPATCHED_TO_ODOO' ? 'dispatched' : 'idle');
            const secLeft = isBuffering ? getSecondsLeft(session.bufferExpiryAt) : 0;
            const timerLabel = formatTimer(session.bufferExpiryAt);

            return (
              <div
                key={session.id}
                className={`py-2.5 px-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                  status === 'dispatched'
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                    : status === 'analyzing'
                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                {/* Left: Passenger Info & Combined Sentence Preview */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{session.passengerName || 'Passenger'}</span>
                    <span className="text-slate-500 text-[11px] font-mono font-medium">({session.passengerPhone})</span>

                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold flex items-center gap-1 shrink-0">
                      <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                      WhatsApp Helpline
                    </span>

                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium shrink-0">
                      {inboundMsgs.length} {inboundMsgs.length === 1 ? 'message' : 'messages'} buffered
                    </span>

                    {isBuffering && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 shrink-0 ${
                          secLeft > 0
                            ? 'bg-amber-50 border border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{secLeft > 0 ? `15m Buffer: ${timerLabel}` : 'Buffer Complete'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 text-xs truncate">
                    <span className="text-slate-900 font-bold shrink-0">Combined Grievance:</span>
                    <span className="text-slate-500 text-[11px] truncate font-normal">
                      {combinedPreview || '(No messages recorded)'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {status === 'idle' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const item = convertSessionToInboundEmail(session);
                          onOpenInAnalyzer?.(item);
                        }}
                        title="Open combined grievance in AI Dispatcher to review AI classification and draft auto-reply"
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Open in AI Dispatcher</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete this WhatsApp session"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {status === 'analyzing' && (
                    <div className="px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Gemini AI Triaging...</span>
                    </div>
                  )}

                  {status === 'dispatched' && (
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{session.odooReference || 'COK-HD-ODOO'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Dispatched into Odoo Helpdesk
                        </div>
                      </div>

                      <button
                        onClick={onNavigateToBoard}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                      >
                        <span>View Board</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete this WhatsApp session"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CIAL Helpline Real Number & Webhook Connection Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Real WhatsApp Number &amp; Webhook Setup</h3>
                  <p className="text-xs text-slate-500">Connect your live Meta WhatsApp Business number to CIAL</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official CIAL WhatsApp Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 484 261 0115"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter the real phone number dedicated to your CIAL WhatsApp passenger grievance helpline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inactivity Buffer Window (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editBufferMinutes}
                  onChange={(e) => setEditBufferMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Aggregates multiple sentences sent by a passenger within this inactivity window into a single comprehensive ticket.
                </p>
              </div>

              {/* Webhook Connection Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-xs">Meta WhatsApp Cloud API Webhook Integration</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600">Callback URL (Webhook URL):</span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 mt-0.5">
                      <span className="truncate select-all">{webhookFullUrl}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(webhookFullUrl);
                          setCopiedWebhook(true);
                          setTimeout(() => setCopiedWebhook(false), 2000);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedWebhook ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600">Verify Token:</span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 mt-0.5">
                      <span className="truncate select-all">cial_whatsapp_token_2026</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('cial_whatsapp_token_2026');
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 2000);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedToken ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-600" />
                    How real messages connect:
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-500 pl-1">
                    <li>Copy the Callback URL and Verify Token above into your Meta WhatsApp App dashboard.</li>
                    <li>Subscribe to the <code className="font-mono text-slate-700 font-bold">messages</code> event.</li>
                    <li>Any real passenger who texts your official WhatsApp number will immediately appear here.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearAllSessions}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
              >
                Clear all old messages
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
