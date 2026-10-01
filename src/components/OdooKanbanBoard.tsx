import React, { useState } from 'react';
import { ProcessedTicket, TicketPriority, AirportTerminal, AirportDepartment, TicketStatus } from '../types';
import {
  LayoutDashboard,
  List,
  Filter,
  Search,
  AlertTriangle,
  Building2,
  Clock,
  UserCheck,
  Plane,
  ChevronRight,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  MoreVertical,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface OdooKanbanBoardProps {
  tickets: ProcessedTicket[];
  onSelectTicket: (ticket: ProcessedTicket) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onOpenNewAnalyzer: () => void;
  onClearTickets?: () => void;
  onRestoreSampleTickets?: () => void;
}

export const OdooKanbanBoard: React.FC<OdooKanbanBoardProps> = ({
  tickets,
  onSelectTicket,
  onUpdateTicketStatus,
  onOpenNewAnalyzer,
  onClearTickets,
  onRestoreSampleTickets,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.aiAnalysis.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.odooTicketId && t.odooTicketId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.aiAnalysis.specificLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTerminal = selectedTerminal === 'ALL' || t.aiAnalysis.terminal === selectedTerminal;
    const matchesDept = selectedDepartment === 'ALL' || t.aiAnalysis.department === selectedDepartment;
    const matchesPriority = selectedPriority === 'ALL' || t.aiAnalysis.priority === selectedPriority;

    return matchesSearch && matchesTerminal && matchesDept && matchesPriority;
  });

  const stages: { id: TicketStatus; label: string; color: string; desc: string }[] = [
    { id: 'NEW', label: '1. New / Inbound', color: 'border-slate-200 bg-slate-100/70', desc: 'Raw email arrived' },
    { id: 'AI_PROCESSED', label: '2. AI Classified', color: 'border-blue-200 bg-blue-50/40', desc: 'Entities extracted' },
    { id: 'DISPATCHED_TO_ODOO', label: '3. Dispatched in Odoo', color: 'border-indigo-200 bg-indigo-50/40', desc: 'Logged into ERP' },
    { id: 'IN_PROGRESS', label: '4. Ground Team Active', color: 'border-amber-200 bg-amber-50/40', desc: 'Staff on-site' },
    { id: 'RESOLVED', label: '5. Resolved & Closed', color: 'border-emerald-200 bg-emerald-50/40', desc: 'SLA fulfilled' },
  ];

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
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

  return (
    <div className="space-y-5">
      
      {/* Odoo Styled Breadcrumb & Controls Header */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-2xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-semibold truncate">
                <span>Odoo ERP v17</span>
                <span>/</span>
                <span className="text-slate-600">Helpdesk &amp; Field Services</span>
                <span>/</span>
                <span className="text-blue-600 font-bold">CIAL Operations Desk</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Airport Tickets &amp; Task Dispatches
              </h2>
            </div>
          </div>

          {/* View Mode & New Ticket Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <a
              href="https://cial1.odoo.com/odoo/helpdesk/1/tickets"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="Open your real live Odoo Helpdesk dashboard in a new tab"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono">cial1.odoo.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
            </a>

            <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl sm:rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Kanban Board View"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {onClearTickets && (
              <button
                onClick={onClearTickets}
                disabled={tickets.length === 0}
                title="Clear all tickets on this board"
                className="px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Clear Board</span>
              </button>
            )}

            <button
              onClick={onOpenNewAnalyzer}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dispatch Inbound Email</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket#, passenger, location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Terminal Filter */}
          <div>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All CIAL Terminals (T1, T2, T3, Cargo)</option>
              <option value="T1_DOMESTIC">Terminal 1 (Domestic)</option>
              <option value="T2_EXECUTIVE">Terminal 2 (Executive/VVIP)</option>
              <option value="T3_INTERNATIONAL">Terminal 3 (International)</option>
              <option value="CARGO_TERMINAL">Cargo &amp; Logistics</option>
              <option value="AIRSIDE_APRON">Airside &amp; Apron</option>
              <option value="CITY_SIDE_PARKING">City Side &amp; Parking</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All CIAL Departments</option>
              <option value="TERMINAL_OPERATIONS">Terminal Operations</option>
              <option value="HOUSEKEEPING_FACILITY">Housekeeping &amp; Sanitation</option>
              <option value="BAGGAGE_HANDLING">Baggage Handling (BHS)</option>
              <option value="ELECTRICAL_HVAC">HVAC &amp; Electrical</option>
              <option value="IT_FIDS_TELECOM">IT &amp; Telecom</option>
              <option value="SECURITY_CISF_LIAISON">CISF &amp; Security</option>
              <option value="AIRSIDE_SAFETY">Airside Safety &amp; FOD</option>
              <option value="LOST_AND_FOUND">Lost &amp; Found</option>
              <option value="PASSENGER_SPECIAL_ASSISTANCE">PRM Special Assistance</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Priorities (P1 - P4)</option>
              <option value="P1_CRITICAL">P1 - Critical (15m SLA)</option>
              <option value="P2_HIGH">P2 - High (1h SLA)</option>
              <option value="P3_MEDIUM">P3 - Medium (4h SLA)</option>
              <option value="P4_LOW">P4 - Low (24h SLA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-slate-800 font-bold text-base">
            {tickets.length === 0 ? 'Helpdesk Board Ready — No Dispatched Tickets Yet' : 'No Tickets Match Current Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {tickets.length === 0
              ? 'Incoming passenger and staff emails received in your Inbound Mailbox Hub will be analyzed by AI and dispatched directly into this Odoo Helpdesk board with assigned departments, SLA priorities, and tracking IDs.'
              : 'Try adjusting your search query or clear selected terminal/department/priority filters.'}
          </p>
          <button
            onClick={onOpenNewAnalyzer}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/25 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Go to AI Email Dispatcher</span>
          </button>
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && filteredTickets.length > 0 && (
        <div className="flex xl:grid xl:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory touch-pan-x no-scrollbar">
          {stages.map((stage) => {
            const stageTickets = filteredTickets.filter((t) => {
              if (stage.id === 'DISPATCHED_TO_ODOO') {
                return t.status === 'DISPATCHED_TO_ODOO';
              }
              return t.status === stage.id;
            });

            return (
              <div
                key={stage.id}
                className="w-[85vw] max-w-[340px] sm:w-[300px] xl:w-auto xl:max-w-none shrink-0 xl:shrink bg-slate-100/70 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-between shadow-2xs snap-center"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-slate-200/80">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{stage.desc}</span>
                  </div>
                  <span className="w-6 h-6 rounded-xl bg-white text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                    {stageTickets.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] scrollbar-thin pr-1">
                  {stageTickets.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-2xl font-medium">
                      No tickets in this stage
                    </div>
                  ) : (
                    stageTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket)}
                        className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 shadow-sm transition cursor-pointer hover:shadow-md group space-y-2.5"
                      >
                        {/* Top: Odoo Ticket Number & Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-blue-600">
                              {ticket.odooTicketId || 'PENDING-DISPATCH'}
                            </span>
                            {(ticket.email?.sourceInbox?.includes('WhatsApp') || ticket.aiAnalysis?.odooPayload?.custom_fields?.x_source_channel === 'WHATSAPP_HELPLINE') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                                WhatsApp
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-bold border ${getPriorityColor(
                              ticket.aiAnalysis.priority
                            )}`}
                          >
                            {ticket.aiAnalysis.priority.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                          {ticket.aiAnalysis.ticketTitle}
                        </h4>

                        {/* Location Badge */}
                        <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                          <Plane className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ticket.aiAnalysis.specificLocation}</span>
                        </div>

                        {/* Department & Assignee */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="truncate max-w-[130px] font-bold text-slate-700">
                            {ticket.aiAnalysis.departmentLabel}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-slate-500 font-semibold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{ticket.aiAnalysis.slaMinutes}m</span>
                          </div>
                        </div>

                        {/* Fast Status Mover Buttons */}
                        <div
                          className="flex items-center justify-between pt-1 text-[10px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-400 font-medium">Move to:</span>
                          <div className="flex items-center gap-1">
                            {stage.id !== 'IN_PROGRESS' && stage.id !== 'RESOLVED' && (
                              <button
                                onClick={() => onUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                                className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold transition cursor-pointer"
                                title="Move to In Progress"
                              >
                                Active
                              </button>
                            )}
                            {stage.id !== 'RESOLVED' && (
                              <button
                                onClick={() => onUpdateTicketStatus(ticket.id, 'RESOLVED')}
                                className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold transition cursor-pointer"
                                title="Mark as Resolved"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST / TABLE */}
      {viewMode === 'list' && filteredTickets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-separate border-spacing-y-2">
              <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2">TICKET ID</th>
                  <th className="px-3.5 py-2">SUBJECT &amp; LOCATION</th>
                  <th className="px-3.5 py-2">SENDER</th>
                  <th className="px-3.5 py-2">DEPARTMENT</th>
                  <th className="px-3.5 py-2">PRIORITY</th>
                  <th className="px-3.5 py-2">STATUS</th>
                  <th className="px-3.5 py-2">SLA</th>
                  <th className="px-3.5 py-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200 transition cursor-pointer rounded-2xl group"
                  >
                    <td className="px-3.5 py-3 font-mono font-bold text-blue-600 rounded-l-2xl">
                      {ticket.odooTicketId || 'PENDING'}
                    </td>
                    <td className="px-3.5 py-3 max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 truncate">
                        {ticket.aiAnalysis.ticketTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5 font-medium">
                        <Plane className="w-3 h-3 text-slate-400" />
                        <span>{ticket.aiAnalysis.specificLocation} ({ticket.aiAnalysis.terminalLabel})</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="font-bold text-slate-800">{ticket.email.sender.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ticket.email.sender.email}</div>
                    </td>
                    <td className="px-3.5 py-3 text-slate-800 font-semibold">
                      {ticket.aiAnalysis.departmentLabel}
                    </td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${getPriorityColor(
                          ticket.aiAnalysis.priority
                        )}`}
                      >
                        {ticket.aiAnalysis.priority.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-700 font-bold shadow-2xs">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-600 font-semibold">
                      {ticket.aiAnalysis.slaMinutes} min
                    </td>
                    <td className="px-3.5 py-3 text-right rounded-r-2xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
