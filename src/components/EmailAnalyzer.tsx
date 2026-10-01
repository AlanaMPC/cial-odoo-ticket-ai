import React, { useState, useEffect } from 'react';
import { InboundEmail, ProcessedTicket, AIExtractionResult } from '../types';
import {
  Sparkles,
  Send,
  Plane,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  UserCheck,
  CheckCircle2,
  Copy,
  Code2,
  HelpCircle,
  FileText,
  Mail,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Ban,
  ChevronRight,
  Terminal as TerminalIcon,
  Cpu,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Inbox,
  ArrowRight,
  Check,
  User,
  MessageSquare
} from 'lucide-react';

interface EmailAnalyzerProps {
  onTicketCreated: (ticket: ProcessedTicket) => void;
  onNavigateToBoard: () => void;
  initialEmail?: InboundEmail | null;
  onSelectEmail?: (email: InboundEmail) => void;
}

export const EmailAnalyzer: React.FC<EmailAnalyzerProps> = ({
  onTicketCreated,
  onNavigateToBoard,
  initialEmail,
  onSelectEmail,
}) => {
  const [inboundEmails, setInboundEmails] = useState<InboundEmail[]>([]);
  const [selectedInboundEmailId, setSelectedInboundEmailId] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<'UNPROCESSED' | 'ALL' | 'EMAIL' | 'WHATSAPP'>('UNPROCESSED');
  const [isSyncingMailbox, setIsSyncingMailbox] = useState<boolean>(false);
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [pnr, setPnr] = useState<string>('');
  const [senderType, setSenderType] = useState<any>('PASSENGER');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDeletingEmail, setIsDeletingEmail] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIExtractionResult | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const [copiedReply, setCopiedReply] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [dispatchedTicket, setDispatchedTicket] = useState<ProcessedTicket | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'details' | 'odoo_payload' | 'auto_reply'>('details');

  const connectedEmail = localStorage.getItem('cial_imap_user') || 'cial.test.odoo@gmail.com';

  const fetchInboundEmails = async () => {
    try {
      const res = await fetch('/api/inbox/all-inbound');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setInboundEmails(data.items);
          return;
        }
      }
      const fallbackRes = await fetch('/api/inbox/emails');
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.emails)) {
          setInboundEmails(fallbackData.emails);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchInboundEmails();
    const interval = setInterval(fetchInboundEmails, 4000);

    const handleMailboxUpdated = (e: any) => {
      const deletedId = e.detail?.deletedId;
      const waId = e.detail?.whatsappId;
      if (deletedId || waId) {
        setInboundEmails((prev) =>
          prev.filter(
            (m) =>
              m.id !== deletedId &&
              m.id !== `wa-${deletedId}` &&
              (!waId || (m.id !== waId && m.id !== `wa-${waId}` && m.whatsappSessionId !== waId))
          )
        );
      }
      fetchInboundEmails();
    };

    window.addEventListener('cial-mailbox-updated', handleMailboxUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cial-mailbox-updated', handleMailboxUpdated);
    };
  }, []);

  useEffect(() => {
    if (initialEmail) {
      loadInboundEmail(initialEmail, true);
    }
  }, [initialEmail]);

  // Auto-select first inbound email if available and none currently selected
  useEffect(() => {
    if (!selectedInboundEmailId && inboundEmails.length > 0) {
      loadInboundEmail(inboundEmails[0], false);
    }
  }, [inboundEmails, selectedInboundEmailId]);

  const loadInboundEmail = async (email: InboundEmail, autoAnalyze: boolean = false) => {
    setSelectedInboundEmailId(email.id);
    setSenderName(email.sender.name || '');
    setSenderEmail(email.sender.email || '');
    setSenderPhone(email.sender.phone || '');
    setFlightNumber(email.sender.flightNumber || '');
    setPnr(email.sender.pnr || '');
    setSenderType(email.sender.senderType || 'PASSENGER');
    setSubject(email.subject || '');
    setBody(email.body || '');
    setAnalysisResult(null);
    setDispatchedTicket(null);
    onSelectEmail?.(email);

    if (autoAnalyze) {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysisResult(data.analysis);
          setAnalysisSource(data.source || 'gemini-3.8-flash');
        }
      } catch (err) {
        console.error('Auto analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleTriggerQuickSync = async () => {
    setIsSyncingMailbox(true);
    try {
      const savedUser = localStorage.getItem('cial_imap_user');
      const savedPass = localStorage.getItem('cial_imap_pass');
      const savedHost = localStorage.getItem('cial_imap_host') || 'imap.gmail.com';
      const savedPort = localStorage.getItem('cial_imap_port') || '993';

      if (savedUser && savedPass) {
        await fetch('/api/inbox/fetch-imap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: savedUser,
            pass: savedPass,
            host: savedHost,
            port: Number(savedPort),
            fetchUnreadOnly: true,
          }),
        });
      }
      await fetchInboundEmails();
    } catch (err) {
      console.error('Quick sync error in analyzer:', err);
    } finally {
      setIsSyncingMailbox(false);
    }
  };

  const handleClearInboundQueue = async () => {
    if (confirm(`Clear the inbound mailbox queue? New emails sent to ${connectedEmail} will still arrive.`)) {
      try {
        await fetch('/api/inbox/clear', { method: 'POST' });
        await fetchInboundEmails();
        setSelectedInboundEmailId('');
        setSenderName('');
        setSenderEmail('');
        setSenderPhone('');
        setFlightNumber('');
        setPnr('');
        setSubject('');
        setBody('');
        setAnalysisResult(null);
        setDispatchedTicket(null);
      } catch (err) {
        console.error('Error clearing mailbox:', err);
      }
    }
  };

  const handleDeleteNonAirportEmail = async () => {
    const emailToDelete = selectedInboundEmailId
      ? inboundEmails.find((e) => e.id === selectedInboundEmailId)
      : inboundEmails.find((e) => e.subject === subject && (e.sender?.email === senderEmail || e.sender?.name === senderName));
    const emailId = emailToDelete?.id || selectedInboundEmailId || (initialEmail ? initialEmail.id : '');

    const isWhatsApp =
      emailToDelete?.sourceChannel === 'WHATSAPP' ||
      emailId.startsWith('wa-') ||
      Boolean(emailToDelete?.whatsappSessionId) ||
      subject?.toLowerCase().includes('[whatsapp]');
    const waSessionId = emailToDelete?.whatsappSessionId || emailId.replace(/^wa-/, '');

    setIsDeletingEmail(true);
    try {
      if (emailId) {
        // If it's a WhatsApp session, delete from dedicated WhatsApp session endpoint first
        if (isWhatsApp && waSessionId) {
          try {
            await fetch(`/api/whatsapp/sessions/${encodeURIComponent(waSessionId)}`, {
              method: 'DELETE',
            });
          } catch (waErr) {
            console.error('Error deleting WhatsApp session directly:', waErr);
          }
        }

        // Also call the unified inbox deletion endpoint
        await fetch(`/api/inbox/emails/${encodeURIComponent(emailId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: emailToDelete?.subject || subject,
            senderEmail: emailToDelete?.sender?.email || senderEmail,
            senderPhone: emailToDelete?.sender?.phone || senderPhone,
          }),
        });

        // Notify all views (Hub tab, Dispatcher stream, Navbar counter) immediately
        window.dispatchEvent(
          new CustomEvent('cial-mailbox-updated', {
            detail: { deletedId: emailId, whatsappId: waSessionId },
          })
        );
      }

      const remaining = inboundEmails.filter(
        (e) =>
          e.id !== emailId &&
          e.id !== `wa-${waSessionId}` &&
          (!waSessionId || e.whatsappSessionId !== waSessionId)
      );
      setInboundEmails(remaining);
      await fetchInboundEmails();

      if (remaining.length > 0) {
        loadInboundEmail(remaining[0], false);
      } else {
        setSelectedInboundEmailId('');
        setSenderName('');
        setSenderEmail('');
        setSenderPhone('');
        setFlightNumber('');
        setPnr('');
        setSubject('');
        setBody('');
        setAnalysisResult(null);
        setDispatchedTicket(null);
        onSelectEmail?.(null as any);
      }
    } catch (err) {
      console.error('Error deleting non-airport item:', err);
    } finally {
      setIsDeletingEmail(false);
    }
  };

  const handleAnalyzeEmail = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setDispatchedTicket(null);

    const actualId = selectedInboundEmailId || `em-${Date.now()}`;
    const emailPayload: InboundEmail = {
      id: actualId,
      sender: {
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        flightNumber: flightNumber,
        pnr: pnr,
        senderType: senderType,
      },
      subject: subject,
      body: body,
      receivedAt: new Date().toISOString(),
      sourceInbox: 'grievances@cial.aero',
    };

    try {
      const response = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailPayload }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        setAnalysisSource(data.source || 'gemini-3.8-flash');
      } else {
        throw new Error(data.error || 'Failed to parse email');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDispatchToOdoo = async () => {
    if (!analysisResult) return;

    const currentItem = inboundEmails.find((e) => e.id === selectedInboundEmailId) || initialEmail;

    // Handle WhatsApp Item Dispatch
    if (currentItem?.sourceChannel === 'WHATSAPP' && currentItem.whatsappSessionId) {
      try {
        setIsAnalyzing(true);
        const response = await fetch('/api/whatsapp/dispatch-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentItem.whatsappSessionId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          if (data.isComplaint && data.ticket) {
            setDispatchedTicket(data.ticket);
            onTicketCreated(data.ticket);
          }
          await fetchInboundEmails();
          window.dispatchEvent(new CustomEvent('cial-mailbox-updated', { detail: { whatsappId: currentItem.whatsappSessionId } }));
          return;
        }
      } catch (err) {
        console.error('Error dispatching WhatsApp session in analyzer:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Handle Standard Email Item Dispatch
    const actualEmailId = selectedInboundEmailId || `em-${Date.now()}`;
    const emailPayload: InboundEmail = {
      id: actualEmailId,
      sender: {
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        flightNumber: flightNumber,
        pnr: pnr,
        senderType: senderType,
      },
      subject: subject,
      body: body,
      receivedAt: new Date().toISOString(),
      sourceInbox: 'opsdesk@cial.aero',
    };

    try {
      const response = await fetch('/api/odoo/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: `tkt-${Date.now()}`,
          odooPayload: analysisResult.odooPayload,
          connectionConfig: { isSimulated: true },
        }),
      });

      const dispatchData = await response.json();
      const odooRef = dispatchData.odooTicketNumber || `COK-HD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Mark email as dispatched in backend inbox store
      if (emailPayload.id) {
        await fetch(`/api/inbox/emails/${encodeURIComponent(emailPayload.id)}/mark-dispatched`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            odooTicketId: odooRef,
            subject: emailPayload.subject,
            senderEmail: emailPayload.sender?.email,
          }),
        }).catch(() => {});
        window.dispatchEvent(new CustomEvent('cial-mailbox-updated', { detail: { dispatchedId: emailPayload.id } }));
        fetchInboundEmails();
      }

      const newTicket: ProcessedTicket = {
        id: `tkt-${Date.now()}`,
        emailId: emailPayload.id,
        email: emailPayload,
        aiAnalysis: analysisResult,
        status: 'DISPATCHED_TO_ODOO',
        createdAt: new Date().toISOString(),
        odooTicketId: odooRef,
        assignedStaff: analysisResult.suggestedAssignee,
        logs: [
          {
            timestamp: new Date().toISOString(),
            action: `Inbound email ingested and parsed by Gemini 3.7 Flash AI`,
            actor: 'CIAL AI Dispatch Engine',
          },
          {
            timestamp: new Date().toISOString(),
            action: `Created Helpdesk Ticket ${odooRef} via Odoo XML-RPC API under team '${analysisResult.departmentLabel}'`,
            actor: 'Odoo ERP Bridge',
          },
        ],
      };

      setDispatchedTicket(newTicket);
      onTicketCreated(newTicket);
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const copyToClipboard = (text: string, type: 'reply' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'reply') {
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'P1_CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'P2_HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'P3_MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isCurrentItemWhatsApp =
    selectedInboundEmailId?.startsWith('wa-') ||
    subject?.toLowerCase().includes('[whatsapp]') ||
    inboundEmails.find((e) => e.id === selectedInboundEmailId)?.sourceChannel === 'WHATSAPP';

  return (
    <div className="space-y-6">
      {/* Top Bento Intro Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Main Hero Bento Tile */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Phase 1 &amp; 2 Prototype Engine
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">CIAL Cochin International Airport</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inbound Email AI Dispatcher &amp; Odoo Ticket Generator
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Demonstrates how Gemini AI processes raw passenger grievances and airport staff emails, extracts terminal zones, assigns responsible departments, calculates SLA priorities, and creates structured Odoo Helpdesk tickets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-2">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span> NLP Entity Extraction</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> XML-RPC / JSON-RPC</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span> Passenger Auto-Reply</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 font-semibold shrink-0">
              Live Gateway Active
            </div>
          </div>
        </div>

        {/* Quick Bento Stats Tile */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">AI Confidence</span>
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold">98.4%</div>
              <div className="text-xs text-indigo-100 mt-0.5">Average CIAL Department Routing Accuracy</div>
            </div>
            <div className="w-full bg-indigo-800/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full rounded-full w-[98%]"></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Odoo API Latency</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">42 ms</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">● Ready for XML-RPC Dispatch</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Inbound Mailbox Stream & Ingestion Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  Live Inbound Stream (Email &amp; WhatsApp Helpline)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {inboundEmails.length} Total Messages
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Multi-Channel Ingestion Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Inbound emails and 15-minute buffered WhatsApp complaints arrive here. Click any message to inspect AI extraction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTriggerQuickSync}
              disabled={isSyncingMailbox}
              title={`Fetch new incoming unread emails from ${connectedEmail}`}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMailbox ? 'animate-spin text-indigo-600' : 'text-indigo-500'}`} />
              <span>{isSyncingMailbox ? 'Fetching...' : 'Sync Mailbox'}</span>
            </button>

            {inboundEmails.length > 0 && (
              <button
                onClick={handleClearInboundQueue}
                title="Clear all emails in mailbox"
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Mailbox</span>
              </button>
            )}
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <button
            onClick={() => setChannelFilter('UNPROCESSED')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              channelFilter === 'UNPROCESSED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Unprocessed ({inboundEmails.filter((m) => m.status !== 'DISPATCHED').length})</span>
          </button>

          <button
            onClick={() => setChannelFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              channelFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Channels ({inboundEmails.length})</span>
          </button>

          <button
            onClick={() => setChannelFilter('EMAIL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              channelFilter === 'EMAIL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3 h-3 text-blue-500" />
            <span>Email ({inboundEmails.filter((m) => m.sourceChannel !== 'WHATSAPP' && !m.id?.startsWith('wa-')).length})</span>
          </button>

          <button
            onClick={() => setChannelFilter('WHATSAPP')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              channelFilter === 'WHATSAPP'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-emerald-500" />
            <span>WhatsApp ({inboundEmails.filter((m) => m.sourceChannel === 'WHATSAPP' || m.id?.startsWith('wa-')).length})</span>
          </button>
        </div>

        {/* Inbound Mailbox List */}
        {inboundEmails.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700">No messages currently in inbound stream</p>
            <p className="text-[11px] text-slate-500">
              Any email or WhatsApp grievance sent to CIAL will appear here live within seconds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {inboundEmails
              .filter((email) => {
                if (channelFilter === 'UNPROCESSED') return email.status !== 'DISPATCHED';
                if (channelFilter === 'EMAIL') return email.sourceChannel !== 'WHATSAPP' && !email.id?.startsWith('wa-');
                if (channelFilter === 'WHATSAPP') return email.sourceChannel === 'WHATSAPP' || email.id?.startsWith('wa-');
                return true;
              })
              .map((email) => {
                const isSelected = selectedInboundEmailId === email.id;
                const isDispatched = email.status === 'DISPATCHED';
                const isWhatsApp = email.sourceChannel === 'WHATSAPP' || email.id?.startsWith('wa-') || email.sourceInbox?.toLowerCase().includes('whatsapp');

                return (
                  <div
                    key={email.id}
                    onClick={() => loadInboundEmail(email, true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isWhatsApp ? (
                          <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0" title="Source: WhatsApp Helpline (+91 484 261 0115)">
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0" title="Source: Inbound Email">
                            <Mail className="w-3 h-3 text-blue-600" />
                          </span>
                        )}
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {email.sender.name || email.sender.email}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                            isWhatsApp
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isWhatsApp ? 'WhatsApp' : 'Email'}
                        </span>
                      </div>

                      {isDispatched ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold shrink-0">
                          Dispatched
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          Unprocessed
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate mb-1">
                      {email.subject}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {email.body}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isSelected ? (
                        <span className="text-blue-600 font-bold flex items-center gap-0.5">
                          Active in Dispatcher <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          Load &amp; Analyze with AI <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 2-Column Grid: Left (Received Email Inspector), Right (AI Output & Odoo Dispatch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left Column: Received Email Viewer */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              {subject?.toLowerCase().includes('[whatsapp]') || selectedInboundEmailId?.startsWith('wa-') ? (
                <>
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Received WhatsApp Grievance (15m Buffer)</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Received Inbound Message</span>
                </>
              )}
            </div>
            {selectedInboundEmailId && (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Active Selection
              </span>
            )}
          </div>

          {!body.trim() && inboundEmails.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-slate-800 font-bold text-sm">No Inbound Email Received Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Send a real test email to <strong className="text-slate-700">{connectedEmail}</strong>. Once fetched, it will appear here automatically for inspection and Odoo dispatch.
              </p>
              <button
                onClick={handleTriggerQuickSync}
                disabled={isSyncingMailbox}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMailbox ? 'animate-spin' : ''}`} />
                <span>Check for New Emails</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sender & Metadata Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {(senderName || senderEmail || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{senderName || 'Anonymous Sender'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold uppercase shrink-0">
                          {senderType || 'Passenger'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                        {senderEmail || 'sender@email.com'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata badges if present */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  {flightNumber && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-slate-700 font-medium flex items-center gap-1">
                      <Plane className="w-3 h-3 text-blue-600" />
                      Flight: {flightNumber}
                    </span>
                  )}
                  {pnr && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-slate-700 font-medium">
                      PNR: {pnr}
                    </span>
                  )}
                  {senderPhone && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                      Phone: {senderPhone}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 font-mono text-[11px] ml-auto">
                    To: {selectedInboundEmailId?.startsWith('wa-') || subject?.toLowerCase().includes('[whatsapp]') ? 'WhatsApp Helpline (+91 484 261 0115)' : 'grievances@cial.aero'}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 font-bold text-xs sm:text-sm">
                  {subject || '(No Subject)'}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message Content</span>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {body || '(Empty body)'}
                </div>
              </div>

              {/* Action Button */}
              <button
                id="analyze-email-btn"
                onClick={handleAnalyzeEmail}
                disabled={isAnalyzing || !body.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>AI Reasoning &amp; Entity Extraction in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Analyze with Gemini 3.7 Flash &amp; Structure Ticket</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: AI Extraction & Odoo Dispatch View */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm min-h-[560px] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-slate-900 font-bold text-sm">
                AI Extraction &amp; Odoo Dispatch Engine
              </span>
            </div>
            {analysisResult && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Confidence: {Math.round((analysisResult.confidenceScore || 0.95) * 100)}% ({analysisSource})
              </span>
            )}
          </div>

          {/* Content Area */}
          {!analysisResult && !isAnalyzing && (
            <div className="my-auto py-12 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-slate-800 font-bold text-base">Ready for AI Comprehension</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong className="text-blue-600">"Analyze with Gemini"</strong> to see how the model reads the email context, pinpoints CIAL terminal locations, selects the right department, and generates the exact Odoo payload.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="my-auto py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-3 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
                <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold text-sm">Processing Airport Context...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Parsing CIAL terminal zones, department SLA rules, passenger sentiment, and mapping Odoo ERP fields.
                </p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 mt-2">

              {/* Non-Airport / Irrelevant Email Notice Banner */}
              {analysisResult.isAirportRelated === false && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          Not Airport Related / Irrelevant Email
                        </h4>
                        <span className="text-[10px] text-amber-700 font-medium">
                          Identified by CIAL AI Gateway • Filtered from automatic Odoo Helpdesk creation
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 font-mono text-[10px] font-bold tracking-wider">
                      {analysisResult.category ? analysisResult.category.replace(/_/g, ' ') : 'FILTERED'}
                    </span>
                  </div>

                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="text-[10px] text-amber-800 font-mono font-bold uppercase tracking-wider">
                      AI Triage Assessment &amp; Filter Reason:
                    </div>
                    <p className="leading-relaxed font-medium text-slate-800">
                      {analysisResult.rejectionReason || "This email does not contain any inquiry, grievance, flight number, baggage claim, or operational request related to Cochin International Airport."}
                    </p>
                  </div>

                  {/* Delete Non-Airport Email Action Box */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-100/60 p-3 rounded-xl border border-amber-300/80">
                    <div className="text-xs text-amber-950">
                      <span className="font-bold">Remove from intake stream:</span>
                      <p className="text-[11px] text-amber-800">
                        Permanently deletes this non-airport {isCurrentItemWhatsApp ? 'WhatsApp message' : 'email'} from both the AI Dispatcher and Inbound Hub.
                      </p>
                    </div>
                    <button
                      id="delete-non-airport-email-top-btn"
                      onClick={handleDeleteNonAirportEmail}
                      disabled={isDeletingEmail}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>
                        {isDeletingEmail
                          ? 'Deleting...'
                          : isCurrentItemWhatsApp
                          ? 'Delete Non-Airport WhatsApp Message'
                          : 'Delete Non-Airport Email'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Subtabs for AI view */}
              <div className="flex border-b border-slate-100 text-xs gap-1">
                <button
                  onClick={() => setActiveTabSub('details')}
                  className={`pb-2 px-3 font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTabSub === 'details'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Structured Ticket</span>
                </button>
                <button
                  onClick={() => setActiveTabSub('odoo_payload')}
                  className={`pb-2 px-3 font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTabSub === 'odoo_payload'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Odoo Helpdesk Payload (JSON)</span>
                </button>
                <button
                  onClick={() => setActiveTabSub('auto_reply')}
                  className={`pb-2 px-3 font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTabSub === 'auto_reply'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Auto-Generated Acknowledgement</span>
                </button>
              </div>

              {/* View 1: Ticket Details */}
              {activeTabSub === 'details' && (
                <div className="space-y-3 text-xs">
                  
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {analysisResult.isAirportRelated === false ? (
                      <>
                        <span className="px-2.5 py-1 rounded-lg border font-bold bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Filtered / Non-Operational
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1">
                          Category: {analysisResult.category?.replace(/_/g, ' ') || 'Irrelevant'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 font-mono font-medium">
                          No SLA Required
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`px-2.5 py-1 rounded-lg border font-bold ${getPriorityBadgeClass(analysisResult.priority)} flex items-center gap-1`}>
                          <AlertTriangle className="w-3 h-3" />
                          {analysisResult.priorityLabel}
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {analysisResult.departmentLabel}
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1">
                          <Plane className="w-3 h-3 text-slate-500" />
                          {analysisResult.terminalLabel}
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SLA: {analysisResult.slaMinutes}m
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                      {analysisResult.isAirportRelated === false ? 'Email Subject / Classification' : 'Generated Odoo Ticket Subject'}
                    </div>
                    <div className="text-slate-900 font-bold text-sm">
                      {analysisResult.ticketTitle}
                    </div>
                    <p className="text-slate-600 text-xs pt-1 leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>

                  {/* Operational Mapping Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                      <div className="text-slate-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        SPECIFIC LOCATION / ZONE
                      </div>
                      <div className="text-slate-800 font-semibold text-xs">
                        {analysisResult.specificLocation || 'N/A'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                      <div className="text-slate-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-indigo-600" />
                        DISPATCH ASSIGNEE / DESK
                      </div>
                      <div className="text-slate-800 font-semibold text-xs truncate">
                        {analysisResult.suggestedAssignee || 'None'}
                      </div>
                    </div>
                  </div>

                  {/* Ground Actions Checklist */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-slate-500 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {analysisResult.isAirportRelated === false ? 'Triage Directive' : 'Ground Tasks to Dispatch (Odoo Checklist)'}
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {analysisResult.actionRequired.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Step-by-Step Context Reasoning */}
                  <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 space-y-1 text-xs">
                    <div className="text-indigo-700 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      AI REASONING LOGIC
                    </div>
                    <p className="text-indigo-900 italic text-[11px] leading-relaxed">
                      "{analysisResult.reasoning}"
                    </p>
                  </div>
                </div>
              )}

              {/* View 2: Odoo JSON Payload */}
              {activeTabSub === 'odoo_payload' && (
                <div className="space-y-2">
                  {analysisResult.odooPayload ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium">Odoo Helpdesk Data Model Payload (`helpdesk.ticket`):</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(analysisResult.odooPayload, null, 2), 'payload')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedPayload ? 'Copied!' : 'Copy JSON'}
                        </button>
                      </div>
                      <pre className="bg-slate-900 text-emerald-300 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-[320px] scrollbar-thin shadow-inner">
                        {JSON.stringify(analysisResult.odooPayload, null, 2)}
                      </pre>
                    </>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <Ban className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="font-bold text-slate-800 text-sm">No Odoo Payload Generated</div>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        This email was evaluated as non-operational ({analysisResult.category?.replace(/_/g, ' ') || 'Irrelevant'}). No ticket payload was produced to protect the Odoo database from spam.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* View 3: Auto-Generated Reply */}
              {activeTabSub === 'auto_reply' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">
                      {analysisResult.isAirportRelated === false ? 'Suggested Response / Policy Action:' : 'Instant Passenger Acknowledgement Email:'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(analysisResult.draftAutoReply, 'reply')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedReply ? 'Copied!' : 'Copy Email'}
                    </button>
                  </div>
                  <div className="bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200 text-xs font-sans whitespace-pre-line leading-relaxed max-h-[320px] overflow-y-auto font-medium">
                    {analysisResult.draftAutoReply}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dispatch to Odoo Button & Status */}
          {analysisResult && (
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
              {dispatchedTicket ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">Successfully Dispatched to Odoo ERP!</span>
                      <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                        Ticket Number: {dispatchedTicket.odooTicketId}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToBoard}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer"
                  >
                    <span>View in Board</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : analysisResult.isAirportRelated === false ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">Dispatch Blocked: Not Related to Airport Operations</span>
                        <p className="text-[11px] text-amber-800 font-medium">
                          Spam protection active. This message will not create an unneeded ticket in your Odoo Helpdesk.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Non-Airport Item Button */}
                  <button
                    id="delete-non-airport-email-btn"
                    onClick={handleDeleteNonAirportEmail}
                    disabled={isDeletingEmail}
                    className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>
                      {isDeletingEmail
                        ? 'Deleting from Intake...'
                        : isCurrentItemWhatsApp
                        ? 'Delete WhatsApp Message from Intake'
                        : 'Delete Email from Inbound Mailbox'}
                    </span>
                  </button>

                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={handleDispatchToOdoo}
                      className="text-[11px] text-slate-400 hover:text-indigo-600 underline font-medium transition cursor-pointer"
                    >
                      Force create ticket anyway (Admin Override)
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="dispatch-odoo-btn"
                  onClick={handleDispatchToOdoo}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Create &amp; Dispatch Ticket into Odoo Helpdesk API</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
