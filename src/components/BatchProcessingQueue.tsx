import React, { useState, useEffect } from 'react';
import { InboundEmail, ProcessedTicket, ImapConfig } from '../types';
import {
  Layers,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  Plane,
  ArrowRight,
  RefreshCw,
  Send,
  Zap,
  Check,
  Mail,
  MailCheck,
  Inbox,
  Globe,
  Key,
  ShieldCheck,
  ShieldAlert,
  Ban,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  CheckCircle,
  HelpCircle,
  Users
} from 'lucide-react';

interface BatchProcessingQueueProps {
  onBatchProcessed: (newTickets: ProcessedTicket[]) => void;
  onOpenTicket: (ticket: ProcessedTicket) => void;
  onOpenInAnalyzer?: (email: InboundEmail) => void;
  onSelectEmailForAnalyzer?: (email: InboundEmail) => void;
}

export const BatchProcessingQueue: React.FC<BatchProcessingQueueProps> = ({
  onBatchProcessed,
  onOpenTicket,
  onOpenInAnalyzer,
  onSelectEmailForAnalyzer,
}) => {
  const handleOpenInAnalyzer = onOpenInAnalyzer || onSelectEmailForAnalyzer;
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'unprocessed' | 'dispatched'>('unprocessed');
  const [loading, setLoading] = useState<boolean>(true);
  const [processingStatus, setProcessingStatus] = useState<Record<string, 'idle' | 'analyzing' | 'dispatched'>>({});
  const [batchTickets, setBatchTickets] = useState<Record<string, ProcessedTicket>>({});
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  
  // Real Email (IMAP) Modal & State
  const [showImapModal, setShowImapModal] = useState<boolean>(false);
  const [imapConfig, setImapConfig] = useState<ImapConfig>({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    user: '',
    pass: '',
    fetchUnreadOnly: true,
  });
  const [hasSavedImap, setHasSavedImap] = useState<boolean>(false);
  const [isSyncingImap, setIsSyncingImap] = useState<boolean>(false);
  const [imapStatus, setImapStatus] = useState<{ loading: boolean; message?: string; error?: string; details?: string }>({ loading: false });

  // Load saved credentials on mount and enable server-side auto-sync
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cial_imap_user');
      const savedPass = localStorage.getItem('cial_imap_pass');
      const savedHost = localStorage.getItem('cial_imap_host') || 'imap.gmail.com';
      const savedPort = localStorage.getItem('cial_imap_port') || '993';
      if (savedUser && savedPass) {
        setImapConfig((prev) => ({
          ...prev,
          user: savedUser,
          pass: savedPass,
          host: savedHost,
          port: Number(savedPort),
          fetchUnreadOnly: true,
        }));
        setHasSavedImap(true);

        // Notify backend to run background auto-sync check every 10s
        fetch('/api/inbox/auto-sync-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: savedUser,
            pass: savedPass,
            host: savedHost,
            port: Number(savedPort),
            autoSync: true,
            fetchUnreadOnly: true,
          }),
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch emails from backend API
  const fetchMailbox = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      const res = await fetch('/api/inbox/emails');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.emails)) {
        setEmails(data.emails);
      }
    } catch {
      // Gracefully silent on transient fetch drops or server restarts
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMailbox(true);
    const interval = setInterval(() => fetchMailbox(false), 4000);

    const handleMailboxUpdated = (e: any) => {
      const deletedId = e.detail?.deletedId;
      if (deletedId) {
        setEmails((prev) => prev.filter((m) => m.id !== deletedId));
      }
      fetchMailbox();
    };

    window.addEventListener('cial-mailbox-updated', handleMailboxUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cial-mailbox-updated', handleMailboxUpdated);
    };
  }, []);

  const processSingleEmail = async (email: InboundEmail) => {
    setProcessingStatus((prev) => ({ ...prev, [email.id]: 'analyzing' }));

    try {
      const response = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        if (data.analysis.isAirportRelated === false) {
          setProcessingStatus((prev) => ({ ...prev, [email.id]: 'idle' }));
          // Do not dispatch non-airport email to Odoo; leave in inbox for review in AI Dispatcher
          return null;
        }

        const odooRef = `COK-HD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        // Dispatch to simulated Odoo backend
        await fetch('/api/odoo/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: email.id,
            odooPayload: data.analysis.odooPayload,
          }),
        });

        // Mark as dispatched in backend mailbox store
        await fetch(`/api/inbox/emails/${encodeURIComponent(email.id)}/mark-dispatched`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            odooTicketId: odooRef,
            subject: email.subject,
            senderEmail: email.sender?.email,
          }),
        }).catch(() => {});

        const newTicket: ProcessedTicket = {
          id: `tkt-${email.id}-${Date.now()}`,
          emailId: email.id,
          email: { ...email, status: 'DISPATCHED', dispatchedTicketId: odooRef },
          aiAnalysis: data.analysis,
          status: 'DISPATCHED_TO_ODOO',
          createdAt: new Date().toISOString(),
          odooTicketId: odooRef,
          assignedStaff: data.analysis.suggestedAssignee,
          logs: [
            {
              timestamp: new Date().toISOString(),
              action: `Inbound email ingested and parsed by Gemini 3.8 Flash AI`,
              actor: 'CIAL AI Dispatch Engine',
            },
            {
              timestamp: new Date().toISOString(),
              action: `Created Helpdesk Ticket ${odooRef} in Odoo ERP under team "${data.analysis.departmentLabel}"`,
              actor: 'Odoo XML-RPC Bridge',
            },
          ],
        };

        setBatchTickets((prev) => ({ ...prev, [email.id]: newTicket }));
        setProcessingStatus((prev) => ({ ...prev, [email.id]: 'dispatched' }));
        
        // Update local email status so it moves from Unprocessed to Dispatched
        setEmails((prev) =>
          prev.map((m) =>
            m.id === email.id
              ? { ...m, status: 'DISPATCHED', dispatchedTicketId: odooRef, dispatchedAt: new Date().toISOString() }
              : m
          )
        );

        onBatchProcessed([newTicket]);
        return newTicket;
      }
    } catch (err) {
      console.error('Error processing item in queue:', err);
      setProcessingStatus((prev) => ({ ...prev, [email.id]: 'idle' }));
    }
  };

  const processAllUnprocessed = async () => {
    setIsBatchRunning(true);
    const createdTickets: ProcessedTicket[] = [];
    const pendingEmails = emails.filter((m) => (m.status || 'UNPROCESSED') === 'UNPROCESSED');

    for (const email of pendingEmails) {
      if (processingStatus[email.id] === 'dispatched') continue;
      const tkt = await processSingleEmail(email);
      if (tkt) createdTickets.push(tkt);
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsBatchRunning(false);
  };

  // Connect to Real Email via IMAP
  const handleFetchImap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setImapStatus({ loading: true });

    try {
      const res = await fetch('/api/inbox/fetch-imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imapConfig),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        // Failed to parse JSON (e.g. server restarting or returned HTML error)
      }

      if (!data) {
        setImapStatus({
          loading: false,
          error: 'Connection temporarily timed out or the server was initializing.',
          details: 'The backend service took too long to respond or returned an HTML error. Please wait 5 seconds and click "Connect & Fetch Emails" again.',
        });
        return;
      }

      if (data.success) {
        // Persist credentials in localStorage
        try {
          localStorage.setItem('cial_imap_user', imapConfig.user);
          localStorage.setItem('cial_imap_pass', imapConfig.pass);
          localStorage.setItem('cial_imap_host', imapConfig.host);
          localStorage.setItem('cial_imap_port', String(imapConfig.port));
          setHasSavedImap(true);
        } catch {
          // ignore
        }

        setImapStatus({
          loading: false,
          message: data.message || `Successfully synced! Imported ${data.fetchedCount} emails.`,
        });
        await fetchMailbox();
        setTimeout(() => setShowImapModal(false), 2000);
      } else {
        setImapStatus({
          loading: false,
          error: data.error || 'Failed to authenticate with IMAP server.',
          details: data.details,
        });
      }
    } catch (err: any) {
      setImapStatus({
        loading: false,
        error: 'Network error connecting to email server.',
        details: err.message,
      });
    }
  };

  // Quick 1-click sync using saved credentials
  const handleQuickSync = async () => {
    if (!imapConfig.user || !imapConfig.pass) {
      setShowImapModal(true);
      return;
    }
    setIsSyncingImap(true);
    try {
      const res = await fetch('/api/inbox/fetch-imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...imapConfig,
          fetchUnreadOnly: true, // Only fetch new incoming unread emails
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMailbox();
      }
    } catch (err) {
      console.error('Quick sync error:', err);
    } finally {
      setIsSyncingImap(false);
    }
  };

  const handleDisconnectImap = async () => {
    try {
      await fetch('/api/inbox/disconnect-imap', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('cial_imap_user');
    localStorage.removeItem('cial_imap_pass');
    localStorage.removeItem('cial_imap_host');
    localStorage.removeItem('cial_imap_port');
    setHasSavedImap(false);
    setImapConfig({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      user: '',
      pass: '',
      fetchUnreadOnly: false,
    });
    setImapStatus({ loading: false, message: 'Disconnected previous account. Enter your new credentials below to connect.' });
  };

  const handleDeleteEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const emailToDelete = emails.find((m) => m.id === id);
      await fetch(`/api/inbox/emails/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailToDelete?.subject,
          senderEmail: emailToDelete?.sender?.email,
        }),
      });
      setEmails((prev) => prev.filter((m) => m.id !== id));
      window.dispatchEvent(new CustomEvent('cial-mailbox-updated', { detail: { deletedId: id } }));
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  const unprocessedEmails = emails.filter((m) => m.status !== 'DISPATCHED');
  const dispatchedEmails = emails.filter((m) => m.status === 'DISPATCHED');

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-blue-600" />
              Real-Time Inbound Mail Intake
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">CIAL Airport Operations Center (AOCC)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inbound Airport Email &amp; Mailbox Hub
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Real-time mailbox queue receiving passenger grievances and airline notices. When an email is triaged, it is dispatched to Odoo ERP and automatically transitioned to the Dispatched archive.
          </p>

          {hasSavedImap ? (
            <div className="flex flex-wrap items-center gap-2 mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold">Live Mailbox:</span>
              <span>Connected to <code className="font-mono font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded">{imapConfig.user}</code></span>
              <span className="text-emerald-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setImapStatus({ loading: false });
                  setShowImapModal(true);
                }}
                className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
              >
                Change Account
              </button>
              <button
                type="button"
                onClick={handleDisconnectImap}
                className="text-rose-600 hover:text-rose-800 font-bold ml-1 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>No live email account connected. Click <strong>Connect Real Mailbox</strong> to link your Gmail or Outlook.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasSavedImap && (
            <button
              onClick={handleQuickSync}
              disabled={isSyncingImap}
              title={`Fetch new incoming unread emails from ${imapConfig.user}`}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-500/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingImap ? 'animate-spin text-white' : 'text-indigo-200'}`} />
              <span>{isSyncingImap ? 'Checking Mailbox...' : 'Sync Mailbox (Fetch Latest)'}</span>
            </button>
          )}

          <button
            onClick={() => setShowImapModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>{hasSavedImap ? 'Mailbox Settings' : 'Connect Real Mailbox'}</span>
          </button>

          <button
            id="process-all-queue-btn"
            onClick={processAllUnprocessed}
            disabled={isBatchRunning || unprocessedEmails.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBatchRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Processing Pipeline...</span>
              </>
            ) : unprocessedEmails.length === 0 ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>All Inbound Emails Dispatched</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Auto-Triage All ({unprocessedEmails.length} Pending)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">AWAITING AI TRIAGE</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{unprocessedEmails.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Pending tickets to be created</div>
        </div>

        <div className="bg-blue-600 text-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-blue-200 text-xs font-bold uppercase tracking-wider">DISPATCHED TO ODOO</div>
            <div className="text-3xl font-extrabold mt-1">{dispatchedEmails.length}</div>
          </div>
          <div className="text-[11px] text-blue-100 mt-1 font-medium">Synced into Odoo Helpdesk ERP</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">TOTAL INGESTED</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{emails.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Grievance &amp; Ops mailboxes</div>
        </div>

        <div className="bg-indigo-600 text-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider">AUTOMATION RATE</div>
            <div className="text-3xl font-extrabold mt-1">100%</div>
          </div>
          <div className="text-[11px] text-indigo-100 mt-1 font-medium">Zero manual ticket entry</div>
        </div>
      </div>

      {/* Mailbox Sub-Tab Switcher */}
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
              <Inbox className="w-4 h-4" />
              <span>Inbound Mailbox Queue</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeSubTab === 'unprocessed' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {unprocessedEmails.length}
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
              <MailCheck className="w-4 h-4" />
              <span>Dispatched to Odoo ERP</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeSubTab === 'dispatched' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {dispatchedEmails.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMailbox}
              title="Refresh Mailbox"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Email Items List */}
        <div className="space-y-2.5 mt-4">
          
          {activeSubTab === 'unprocessed' && emails.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Mailbox Ready — Waiting for Incoming Emails</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto leading-relaxed">
                Your CIAL inbound dispatcher is connected to Gmail. Send an email to your connected inbox, or click the button below to check for new messages.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hasSavedImap ? (
                  <button
                    onClick={handleQuickSync}
                    disabled={isSyncingImap}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingImap ? 'animate-spin' : ''}`} />
                    <span>Fetch Emails from Gmail</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowImapModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Connect Gmail via IMAP</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'unprocessed' && emails.length > 0 && unprocessedEmails.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">Inbound Inbox is Clear!</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                All inbound passenger and airline emails have been triaged by Gemini AI and dispatched to Odoo Helpdesk.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {hasSavedImap && (
                  <button
                    onClick={handleQuickSync}
                    disabled={isSyncingImap}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingImap ? 'animate-spin' : ''}`} />
                    <span>Fetch Latest Emails</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSubTab('dispatched')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 transition"
                >
                  View Dispatched Odoo Tickets ({dispatchedEmails.length})
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'dispatched' && dispatchedEmails.length === 0 && (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">No Dispatched Tickets Yet</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                Open emails from the inbound mailbox queue in the AI Dispatcher to analyze and dispatch Odoo tickets.
              </p>
            </div>
          )}

          {(activeSubTab === 'unprocessed' ? unprocessedEmails : dispatchedEmails).map((email, idx) => {
            const status = processingStatus[email.id] || (email.status === 'DISPATCHED' ? 'dispatched' : 'idle');
            const ticket = batchTickets[email.id];

            return (
              <div
                key={email.id}
                className={`py-2.5 px-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                  status === 'dispatched'
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                    : status === 'analyzing'
                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                {/* Left: Email Info - Compact Sleek Layout */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{email.sender.name}</span>
                    <span className="text-slate-500 text-[11px] font-mono font-medium">({email.sender.email})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono font-semibold shrink-0">
                      {email.sourceInbox}
                    </span>
                    {email.sourceInbox === 'passengerdesk@cial.aero' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium flex items-center gap-1 shrink-0">
                        <Users className="w-2.5 h-2.5" />
                        Passenger Portal
                      </span>
                    )}
                    {email.sender.flightNumber && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold flex items-center gap-1 shrink-0">
                        <Plane className="w-2.5 h-2.5" />
                        {email.sender.flightNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 text-xs truncate">
                    <span className="text-slate-900 font-bold shrink-0">{email.subject}</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">—</span>
                    <span className="text-slate-500 text-[11px] truncate font-normal">
                      {email.body}
                    </span>
                  </div>
                </div>

                {/* Right: AI Pipeline Status / Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {status === 'idle' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenInAnalyzer?.(email)}
                        title="Open email in AI Email Dispatcher to review AI classification and draft auto-reply"
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Open in AI Dispatcher</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteEmail(email.id, e)}
                        title="Delete this email"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {status === 'analyzing' && (
                    <div className="px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Gemini AI Parsing...</span>
                    </div>
                  )}

                  {status === 'dispatched' && (
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{email.dispatchedTicketId || ticket?.odooTicketId || 'COK-HD-ODOO'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Dispatched into Odoo Helpdesk
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenInAnalyzer?.(email)}
                        title="Inspect in AI Dispatcher"
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Inspect in AI Dispatcher</span>
                      </button>

                      {ticket && (
                        <button
                          onClick={() => onOpenTicket(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
                        >
                          <span>View Ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteEmail(email.id, e)}
                        title="Delete from mailbox"
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

      {/* Real Email (IMAP) Connection Modal */}
      {showImapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Connect Real Mailbox via IMAP</h3>
                  <p className="text-xs text-slate-500 font-medium">Sync live unread passenger emails from your real email account</p>
                </div>
              </div>
              <button
                onClick={() => setShowImapModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Gmail Guidance Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>For Gmail / Google Workspace Accounts:</span>
              </div>
              <p className="text-blue-800 leading-relaxed font-medium">
                1. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700 inline-flex items-center gap-0.5">Google App Passwords <ExternalLink className="w-2.5 h-2.5" /></a> and generate a 16-letter App Password.
                <br />
                2. Enter your full email and paste the 16-letter App Password below.
              </p>
            </div>

            <form onSubmit={handleFetchImap} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address / Username</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. airport.grievance.test@gmail.com"
                  value={imapConfig.user}
                  onChange={(e) => setImapConfig({ ...imapConfig, user: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">App Password / Password</label>
                <input
                  type="password"
                  required
                  placeholder="16-character Google App Password (e.g. abcd efgh ijkl mnop)"
                  value={imapConfig.pass}
                  onChange={(e) => setImapConfig({ ...imapConfig, pass: e.target.value.replace(/\s+/g, '') })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">IMAP Host</label>
                  <input
                    type="text"
                    value={imapConfig.host}
                    onChange={(e) => setImapConfig({ ...imapConfig, host: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Port (SSL/TLS)</label>
                  <input
                    type="number"
                    value={imapConfig.port}
                    onChange={(e) => setImapConfig({ ...imapConfig, port: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Filter Mode Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="fetchUnreadOnlyToggle"
                  checked={imapConfig.fetchUnreadOnly === true}
                  onChange={(e) => setImapConfig({ ...imapConfig, fetchUnreadOnly: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="fetchUnreadOnlyToggle" className="text-xs text-slate-700 font-medium cursor-pointer">
                  <span className="font-bold text-slate-900">Fetch unread emails only</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Leave this <strong>unchecked</strong> (recommended) so all recent emails in your inbox are imported, even if you already opened or viewed them in Gmail.
                  </p>
                </label>
              </div>

              {imapStatus.error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{imapStatus.error}</span>
                  </div>
                  {imapStatus.details && (
                    <p className="text-[11px] text-rose-700/90 pl-5 leading-relaxed bg-white/60 p-2 rounded-lg border border-rose-100 font-normal">
                      {imapStatus.details}
                    </p>
                  )}
                </div>
              )}

              {imapStatus.message && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  {imapStatus.message}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-3">
                {hasSavedImap ? (
                  <button
                    type="button"
                    onClick={handleDisconnectImap}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                  >
                    Disconnect &amp; Clear Account
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImapModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={imapStatus.loading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-500/25 disabled:opacity-50"
                  >
                    {imapStatus.loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Connecting &amp; Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>Connect &amp; Fetch Emails</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
