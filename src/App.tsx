import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmailAnalyzer } from './components/EmailAnalyzer';
import { BatchProcessingQueue } from './components/BatchProcessingQueue';
import { OdooKanbanBoard } from './components/OdooKanbanBoard';
import { TicketDetailModal } from './components/TicketDetailModal';
import { ArchitectureAndRoadmap } from './components/ArchitectureAndRoadmap';
import { OdooCodeExporter } from './components/OdooCodeExporter';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WhatsAppIntakeHub } from './components/WhatsAppIntakeHub';
import { ProcessedTicket, TicketStatus, InboundEmail } from './types';
import { CIAL_SAMPLE_EMAILS } from './data/mockEmails';

// Initial tickets empty by default (no demo tickets)
const INITIAL_PROCESSED_TICKETS: ProcessedTicket[] = [];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inbox_stream');
  const [tickets, setTickets] = useState<ProcessedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('cial_processed_tickets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [selectedTicket, setSelectedTicket] = useState<ProcessedTicket | null>(null);
  const [selectedEmailForAnalysis, setSelectedEmailForAnalysis] = useState<InboundEmail | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('cial_processed_tickets', JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/inbox/emails');
      const data = await res.json();
      if (data.success && typeof data.unprocessedCount === 'number') {
        setUnreadCount(data.unprocessedCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    const handleMailboxUpdated = () => fetchUnreadCount();
    window.addEventListener('cial-mailbox-updated', handleMailboxUpdated);

    // Sync saved IMAP credentials and existing local tickets to backend store on load
    try {
      const savedUser = localStorage.getItem('cial_imap_user');
      const savedPass = localStorage.getItem('cial_imap_pass');
      const savedHost = localStorage.getItem('cial_imap_host') || 'imap.gmail.com';
      const savedPort = localStorage.getItem('cial_imap_port') || '993';
      if (savedUser && savedPass) {
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

      // Synchronize existing tickets to ensure their emails are marked DISPATCHED on backend & Gmail
      if (tickets.length > 0) {
        tickets.forEach((t) => {
          if (t.emailId || t.email?.subject) {
            fetch(`/api/inbox/emails/${encodeURIComponent(t.emailId || 'unknown')}/mark-dispatched`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                odooTicketId: t.odooTicketId,
                subject: t.email?.subject,
                senderEmail: t.email?.sender?.email,
              }),
            }).catch(() => {});
          }
        });
      }
    } catch {
      // ignore
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('cial-mailbox-updated', handleMailboxUpdated);
    };
  }, []);

  const handleTicketCreated = (newTicket: ProcessedTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    fetchUnreadCount();
  };

  const handleBatchProcessed = (newTickets: ProcessedTicket[]) => {
    setTickets((prev) => {
      // deduplicate by emailId
      const existingEmailIds = new Set(prev.map((t) => t.emailId));
      const filteredNew = newTickets.filter((t) => !existingEmailIds.has(t.emailId));
      return [...filteredNew, ...prev];
    });
    fetchUnreadCount();
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus,
            logs: [
              ...t.logs,
              {
                timestamp: new Date().toISOString(),
                action: `Status transitioned to ${newStatus}`,
                actor: 'Airport Duty Officer',
              },
            ],
          };
        }
        return t;
      })
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              logs: [
                ...prev.logs,
                {
                  timestamp: new Date().toISOString(),
                  action: `Status transitioned to ${newStatus}`,
                  actor: 'Airport Duty Officer',
                },
              ],
            }
          : null
      );
    }
  };

  const criticalCount = tickets.filter(
    (t) => t.aiAnalysis.priority === 'P1_CRITICAL' && t.status !== 'RESOLVED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={tickets.length}
        criticalCount={criticalCount}
        unreadEmailCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inbox_stream' && (
          <BatchProcessingQueue
            onBatchProcessed={handleBatchProcessed}
            onOpenTicket={(ticket) => setSelectedTicket(ticket)}
            onOpenInAnalyzer={(email) => {
              setSelectedEmailForAnalysis(email);
              setActiveTab('analyzer');
            }}
          />
        )}

        {activeTab === 'analyzer' && (
          <EmailAnalyzer
            onTicketCreated={handleTicketCreated}
            onNavigateToBoard={() => setActiveTab('odoo_board')}
            initialEmail={selectedEmailForAnalysis}
            onSelectEmail={(email) => setSelectedEmailForAnalysis(email)}
          />
        )}

        {activeTab === 'whatsapp_intake' && (
          <WhatsAppIntakeHub
            onTicketCreated={handleTicketCreated}
            onNavigateToBoard={() => setActiveTab('odoo_board')}
            onOpenInAnalyzer={(email) => {
              setSelectedEmailForAnalysis(email);
              setActiveTab('analyzer');
            }}
          />
        )}

        {activeTab === 'odoo_board' && (
          <OdooKanbanBoard
            tickets={tickets}
            onSelectTicket={(ticket) => setSelectedTicket(ticket)}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onOpenNewAnalyzer={() => setActiveTab('analyzer')}
            onClearTickets={() => setTickets([])}
            onRestoreSampleTickets={() => setTickets(INITIAL_PROCESSED_TICKETS)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard tickets={tickets} />
        )}

        {activeTab === 'api_code' && (
          <OdooCodeExporter />
        )}

        {activeTab === 'architecture_roadmap' && (
          <ArchitectureAndRoadmap />
        )}
      </main>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateTicketStatus}
        />
      )}

      {/* Airport Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Cochin International Airport Limited (CIAL)</span>
            <span>•</span>
            <span className="font-mono font-bold text-blue-600">COK / VOCI</span>
            <span>•</span>
            <span>World's First Fully Solar-Powered Airport</span>
          </div>
          <div className="text-slate-500 flex items-center gap-3">
            <span>BTech AI Project &amp; Odoo Helpdesk ERP Integration</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
