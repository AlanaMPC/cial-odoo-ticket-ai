export type AirportTerminal = 'T1_DOMESTIC' | 'T2_EXECUTIVE' | 'T3_INTERNATIONAL' | 'CARGO_TERMINAL' | 'AIRSIDE_APRON' | 'CITY_SIDE_PARKING' | 'NONE';

export type AirportDepartment =
  | 'TERMINAL_OPERATIONS'
  | 'HOUSEKEEPING_FACILITY'
  | 'BAGGAGE_HANDLING'
  | 'ELECTRICAL_HVAC'
  | 'IT_FIDS_TELECOM'
  | 'SECURITY_CISF_LIAISON'
  | 'AIRSIDE_SAFETY'
  | 'COMMERCIAL_CONCESSIONS'
  | 'LOST_AND_FOUND'
  | 'PASSENGER_SPECIAL_ASSISTANCE'
  | 'NONE';

export type TicketPriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type EmailRelevanceCategory =
  | 'AIRPORT_OPERATIONAL'
  | 'CASUAL_GREETING'
  | 'AUTOMATED_SYSTEM_NOTICE'
  | 'SPAM_OR_IRRELEVANT'
  | 'INSUFFICIENT_INFO';

export type TicketStatus = 'NEW' | 'AI_PROCESSED' | 'DISPATCHED_TO_ODOO' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'FILTERED_SPAM';

export interface EmailSender {
  name: string;
  email: string;
  phone?: string;
  pnr?: string;
  flightNumber?: string;
  senderType: 'PASSENGER' | 'AIRLINE_STAFF' | 'GROUND_HANDLER' | 'AIRPORT_INTERNAL' | 'VENDOR';
}

export interface InboundEmail {
  id: string;
  sourceChannel?: 'EMAIL' | 'WHATSAPP';
  whatsappSessionId?: string;
  sender: EmailSender;
  subject: string;
  body: string;
  receivedAt: string;
  sourceInbox: string;
  attachmentsCount?: number;
  status?: 'UNPROCESSED' | 'DISPATCHED' | 'FILTERED';
  dispatchedTicketId?: string;
  dispatchedAt?: string;
  category?: EmailRelevanceCategory;
  rejectionReason?: string;
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fetchUnreadOnly?: boolean;
}

export interface AIExtractionResult {
  isAirportRelated: boolean;
  category: EmailRelevanceCategory;
  rejectionReason?: string;
  ticketTitle: string;
  summary: string;
  terminal: AirportTerminal;
  terminalLabel: string;
  specificLocation: string; // e.g. "Gate 14, Departure Concourse", "Carousel 3, Arrival Hall"
  department: AirportDepartment;
  departmentLabel: string;
  priority: TicketPriority;
  priorityLabel: string;
  slaMinutes: number;
  actionRequired: string[];
  suggestedAssignee: string;
  suggestedTeamLead: string;
  passengerImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number; // 0.0 - 1.0
  reasoning: string;
  extractedEntities: {
    flightNumber?: string;
    pnr?: string;
    baggageTag?: string;
    assetInvolved?: string;
    contactNumber?: string;
  };
  draftAutoReply: string;
  odooPayload: OdooTicketPayload;
}

export interface OdooTicketPayload {
  model: 'helpdesk.ticket';
  name: string;
  partner_name: string;
  partner_email: string;
  partner_phone?: string;
  team_id_name: string;
  user_id_name: string;
  priority: '0' | '1' | '2' | '3'; // Odoo standard priority ratings
  stage_id_name: string;
  tag_ids: string[];
  description: string;
  custom_fields: {
    x_airport_code: 'COK';
    x_terminal: string;
    x_zone_location: string;
    x_flight_number?: string;
    x_pnr?: string;
    x_sla_target_hours: number;
    x_source_channel: 'EMAIL_INBOUND_AI' | 'WHATSAPP_HELPLINE';
  };
}

export interface WhatsAppMessage {
  id: string;
  senderPhone: string;
  senderName?: string;
  messageText: string;
  timestamp: string;
  direction: 'INBOUND' | 'OUTBOUND';
}

export interface WhatsAppSession {
  id: string;
  passengerPhone: string;
  passengerName?: string;
  messages: WhatsAppMessage[];
  firstMessageAt: string;
  lastMessageAt: string;
  bufferExpiryAt: string; // Last message timestamp + bufferMinutes
  bufferMinutes: number; // 15 minutes
  status: 'BUFFERING' | 'DISPATCHED_TO_ODOO' | 'FILTERED_NON_AIRPORT';
  dispatchedTicketId?: string;
  odooReference?: string;
  aiDraftReply?: string;
  aiExtractedSummary?: string;
  department?: string;
  terminal?: string;
  urgency?: string;
}

export interface WhatsAppChannelConfig {
  channelName: string;
  cialHelplineNumber: string;
  isProductionReady: boolean;
  webhookUrl: string;
  verifyToken: string;
  inactivityBufferMinutes: number; // 15
  autoReplyEnabled: boolean;
}

export interface ProcessedTicket {
  id: string;
  emailId: string;
  email: InboundEmail;
  aiAnalysis: AIExtractionResult;
  status: TicketStatus;
  createdAt: string;
  odooTicketId?: string;
  assignedStaff?: string;
  resolutionNotes?: string;
  logs: Array<{
    timestamp: string;
    action: string;
    actor: string;
  }>;
}

export interface OdooConnectionConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
  isSimulated: boolean;
}
