import React, { useState } from 'react';
import archDiagramImg from '../assets/images/cial_system_architecture_1790570452238.jpg';
import {
  BookOpen,
  GitBranch,
  Terminal as TerminalIcon,
  Layers,
  Database,
  Cpu,
  Mail,
  Send,
  CheckCircle2,
  Copy,
  ChevronRight,
  Code2,
  FolderTree,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe,
  Sparkles,
  FileDown
} from 'lucide-react';

export const ArchitectureAndRoadmap: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Clone or initialize your project repository
git init cial-ai-odoo-dispatcher
cd cial-ai-odoo-dispatcher

# 2. Setup standard git branches
git branch -M main

# 3. Create .gitignore
cat << 'EOF' > .gitignore
node_modules/
dist/
.env
*.log
.DS_Store
__pycache__/
EOF

# 4. Create your environment configuration file
cp .env.example .env
# Open .env in VS Code and set your GEMINI_API_KEY="YOUR_KEY"

# 5. Install dependencies and start local dev server
npm install
npm run dev

# 6. Commit your initial architecture prototype
git add .
git commit -m "feat: initial CIAL AI Email to Odoo Helpdesk Dispatcher prototype"`;

  const pythonScriptPreview = `import xmlrpc.client
import os

# --- Configuration for CIAL Odoo ERP ---
ODOO_URL = os.getenv("ODOO_URL", "http://localhost:8069")
ODOO_DB = os.getenv("ODOO_DB", "cial_db")
ODOO_USER = os.getenv("ODOO_USER", "admin")
ODOO_API_KEY = os.getenv("ODOO_API_KEY", "your_odoo_api_key_or_password")

def create_cial_odoo_ticket(ticket_data):
    # 1. Authenticate with Odoo XML-RPC
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_API_KEY, {})
    
    if not uid:
        raise Exception("Authentication with CIAL Odoo instance failed!")
        
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    # 2. Create helpdesk.ticket record
    ticket_payload = {
        'name': ticket_data['ticketTitle'],
        'partner_name': ticket_data['senderName'],
        'partner_email': ticket_data['senderEmail'],
        'priority': '3' if ticket_data['priority'] == 'P1_CRITICAL' else '2',
        'description': ticket_data['descriptionHtml'],
        # Custom CIAL Airport Fields
        'x_terminal': ticket_data['terminalLabel'],
        'x_zone_location': ticket_data['specificLocation'],
    }
    
    ticket_id = models.execute_kw(
        ODOO_DB, uid, ODOO_API_KEY,
        'helpdesk.ticket', 'create',
        [ticket_payload]
    )
    
    print(f"✅ Successfully created Odoo Helpdesk Ticket #{ticket_id}")
    return ticket_id`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                BTech Project Blueprint &amp; Execution Guide
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Cochin International Airport (CIAL)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Live Odoo Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Core Architecture, Data Schema &amp; Implementation Report
            </h1>
            <p className="text-slate-600 text-sm mt-1.5 max-w-3xl leading-relaxed font-medium">
              Comprehensive high-level system architecture, omnichannel intake pipelines (IMAP Email &amp; WhatsApp), 15-minute sliding inactivity buffer, Gemini 3.8 Flash domain reasoning engine, and live Odoo ERP Helpdesk XML-RPC integration.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0 self-start md:self-center"
            title="Download or Print this complete project architecture report as a PDF"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Download Architecture (PDF)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: END-TO-END ARCHITECTURAL DIAGRAM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900">1. End-to-End System Architecture</h2>
          </div>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            Pipeline Flow (6 Steps)
          </span>
        </div>

        {/* Visual Architecture Diagram Poster */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
          <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              CIAL End-to-End Autonomous AI-to-Odoo Pipeline Blueprint
            </span>
            <a
              href={archDiagramImg}
              download="CIAL_System_Architecture_Diagram.jpg"
              className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              Save Image File
            </a>
          </div>
          <div className="p-2 sm:p-4 bg-slate-950 flex items-center justify-center">
            <img
              src={archDiagramImg}
              alt="CIAL AI to Odoo System Architecture Diagram"
              className="w-full h-auto rounded-xl shadow-lg object-contain max-h-[500px]"
            />
          </div>
        </div>

        {/* Visual Architecture Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              Inbound Email Ingestion
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Passengers and staff email CIAL inboxes (<code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold font-mono">grievances@cial.aero</code>, <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold font-mono">opsdesk@cial.aero</code>). A listener daemon captures raw MIME messages.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              2
            </div>
            <h3 className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Gemini AI Extraction
            </h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Gemini parses natural language email context, classifying:
              <br />• <strong>Terminal:</strong> T1, T2, T3, Cargo, Airside
              <br />• <strong>Location:</strong> Gate, Carousel, Security
              <br />• <strong>Department:</strong> HVAC, Housekeeping, BHS
              <br />• <strong>Urgency:</strong> P1-Critical to P4-Low
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Validation &amp; Schema Mapping
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Normalizes extracted entities to match CIAL operational taxonomy, calculates SLA resolution deadlines, and verifies required fields before payload formatting.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              Odoo XML-RPC / REST Dispatch
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Calls Odoo API endpoint <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold font-mono">helpdesk.ticket.create()</code>, setting custom fields (<code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">x_terminal</code>, <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">x_zone_location</code>, <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">team_id</code>).
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              5
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Ground Staff Alert &amp; SLA Timer
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Odoo triggers mobile app push notification, SMS/WhatsApp alert to the assigned duty team lead (e.g. Electrical Shift Lead T3), starting the countdown timer.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              6
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-600" />
              Passenger Auto-Acknowledgement
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              An instant, personalized acknowledgement email with the Odoo tracking ID and expected resolution window is automatically emailed back to the passenger.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 2: DATA REQUIREMENTS & SCHEMAS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900">2. Core Data Requirements</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
            Input vs AI Output vs Odoo Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Input Data */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              1. Inbound Email Input
            </div>
            <ul className="space-y-1.5 text-slate-700 font-medium">
              <li>• <strong className="text-slate-900">sender_name:</strong> Passenger / Staff name</li>
              <li>• <strong className="text-slate-900">sender_email:</strong> Reply-to email address</li>
              <li>• <strong className="text-slate-900">subject:</strong> Raw email subject line</li>
              <li>• <strong className="text-slate-900">body_text / html:</strong> Message narrative</li>
              <li>• <strong className="text-slate-900">received_at:</strong> ISO timestamp</li>
              <li>• <strong className="text-slate-900">attachments:</strong> Optional photos / boarding pass</li>
            </ul>
          </div>

          {/* AI Extracted Schema */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              2. AI Extracted Entities
            </div>
            <ul className="space-y-1.5 text-slate-700 font-medium">
              <li>• <strong className="text-slate-900">terminal:</strong> T1, T2, T3, Cargo, Airside</li>
              <li>• <strong className="text-slate-900">specific_location:</strong> Gate 14, Carousel 3, etc.</li>
              <li>• <strong className="text-slate-900">department:</strong> 1 of 10 CIAL departments</li>
              <li>• <strong className="text-slate-900">priority:</strong> P1_CRITICAL to P4_LOW</li>
              <li>• <strong className="text-slate-900">sla_minutes:</strong> 15m, 60m, 240m, 1440m</li>
              <li>• <strong className="text-slate-900">flight_no &amp; pnr:</strong> If present in text</li>
              <li>• <strong className="text-slate-900">action_items:</strong> Ground task checklist</li>
            </ul>
          </div>

          {/* Odoo Target Schema */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              3. Odoo Helpdesk Schema
            </div>
            <ul className="space-y-1.5 text-slate-700 font-medium">
              <li>• <strong className="text-slate-900">name:</strong> Formatted ticket title</li>
              <li>• <strong className="text-slate-900">team_id:</strong> Mapped CIAL department</li>
              <li>• <strong className="text-slate-900">priority:</strong> Odoo rating (0 to 3)</li>
              <li>• <strong className="text-slate-900">partner_email:</strong> Passenger contact</li>
              <li>• <strong className="text-slate-900">x_terminal:</strong> Custom terminal field</li>
              <li>• <strong className="text-slate-900">x_zone_location:</strong> Custom zone field</li>
              <li>• <strong className="text-slate-900">description:</strong> HTML task briefing</li>
            </ul>
          </div>

        </div>
      </div>

      {/* SECTION 3: STEP-BY-STEP BTECH STUDENT EXECUTION ROADMAP */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900">3. Your Step-by-Step BTech Project Roadmap</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
            What to do next
          </span>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Step 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Set Up Local Development Environment (VS Code &amp; Git)</span>
              </div>
              <span className="text-[11px] text-blue-600 font-bold font-mono">Current Step</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed pl-8">
              Open VS Code, create your project directory, initialize Git, and verify Node.js (v18+) or Python (v3.10+). Download or clone this working prototype codebase so you have a complete visual and API sandbox ready to demonstrate.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Configure Gemini AI Integration (Prompting &amp; Schema)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">Implemented in Server</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed pl-8">
              We have set up the `@google/genai` TypeScript SDK with <strong className="text-slate-900">Gemini 3.7 Flash</strong> on the backend with strict JSON responseSchema enforcing CIAL airport domain mapping (Terminals T1/T2/T3, 10 Departments, P1-P4 priorities, SLA calculations).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Launch Free Odoo Sandbox Instance</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">Next Milestone</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed pl-8">
              To test real Odoo integration without waiting for CIAL's live server:
              <br />• <strong>Option A (Easiest):</strong> Create a free 15-day trial on <a href="https://www.odoo.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Odoo.com</a> with the "Helpdesk" app.
              <br />• <strong>Option B (Local):</strong> Run Odoo Community with 1 Docker command: <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">docker run -d -p 8069:8069 --name odoo --link db:db -t odoo</code>
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Connect Odoo XML-RPC / JSON-RPC Bridge</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">Scripts Ready in Tab 4</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed pl-8">
              Use our ready-to-run Python script (<code className="text-blue-700 font-mono font-bold">cial_odoo_bridge.py</code>) or Node.js connector to send the AI extracted payload directly into your Odoo instance.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <span>Deploy Email Listener (IMAP / Webhook)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">Production Stage</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed pl-8">
              When CIAL provides you the official inbox credentials or forwarding address, deploy the Python/Node email listener service that triggers the Gemini pipeline automatically on every new incoming email.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 4: GIT & VS CODE TERMINAL CHEATSHEET */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">4. VS Code &amp; Git Terminal Quick-Start Commands</h2>
          </div>
          <button
            onClick={() => copyCode(gitCommands, 'git')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedSection === 'git' ? 'Copied to Clipboard!' : 'Copy Commands'}
          </button>
        </div>

        <pre className="bg-slate-900 text-emerald-400 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
          {gitCommands}
        </pre>
      </div>

      {/* SECTION 5: PRODUCTION DEPLOYMENT & INFRASTRUCTURE REPORT */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">5. Deployment Strategy Report: Cloud vs Kubernetes</h2>
              <p className="text-xs text-slate-500 font-medium">Guide Presentation Reference for CIAL Airport IT Operations</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <a
              href="/api/download-deployment-report"
              download="CIAL_Airport_AI_Deployment_Report_BTech.docx"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Word Report (.docx)</span>
            </a>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
              Recommended: Hybrid Cloud Run / K8s
            </span>
          </div>
        </div>

        {/* Fundamental Clarification: Cloud vs Kubernetes */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
          <h3 className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            Key Concept for Your Presentation: Are "Cloud" and "Kubernetes" the same?
          </h3>
          <p className="text-slate-700 font-medium leading-relaxed">
            <strong className="text-slate-900">No, they are NOT the same thing — they work together:</strong>
            <br />
            • <strong className="text-blue-900">Cloud (Google Cloud, AWS, Azure):</strong> The <em>physical infrastructure and hosting platform</em> (virtual servers, networking, data centers, managed databases).
            <br />
            • <strong className="text-blue-900">Kubernetes (K8s):</strong> An open-source <em>container orchestration software</em> that manages, automates, and scales multiple Docker containers across physical or virtual machines. Kubernetes can run <em>on top of</em> Cloud (e.g., Google Kubernetes Engine / AWS EKS) OR on CIAL's private on-premise data center servers.
          </p>
        </div>

        {/* 3 Deployment Architectures Compared */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Option 1: Serverless Cloud Container (Recommended) */}
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-emerald-500/50 space-y-3 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] tracking-wide uppercase">
                  Best for Academic / Phase 1
                </span>
                <span className="font-mono text-emerald-600 font-bold">Tier 1</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Option A: Managed Serverless Cloud (Google Cloud Run / AWS ECS)</h4>
              <p className="text-slate-600 font-medium mt-2 leading-relaxed">
                Packaged into a single Docker container and deployed directly on Cloud Run. It scales from 0 to 100+ instances automatically during passenger flight rush hours.
              </p>
              <ul className="mt-3 space-y-1.5 text-slate-700 font-medium">
                <li>• <strong className="text-emerald-700">Pros:</strong> Zero server management, automated SSL certificates, fast continuous deployment, lowest cost (scales to zero when idle).</li>
                <li>• <strong className="text-rose-700">Cons:</strong> Requires outbound internet access for Gemini API and cloud hosting.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-200/80 mt-3 text-[11px] font-mono text-slate-500 font-semibold">
              Deployment Effort: ~15 minutes
            </div>
          </div>

          {/* Option 2: Kubernetes Cluster */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] tracking-wide uppercase">
                  Airport Enterprise Scale
                </span>
                <span className="font-mono text-blue-600 font-bold">Tier 2</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Option B: Kubernetes (GKE or MicroK8s / Rancher on CIAL On-Prem)</h4>
              <p className="text-slate-600 font-medium mt-2 leading-relaxed">
                Multiple microservices (Mailbox Listener Pod, Gemini AI Worker Pod, Odoo Sync Pod, Redis Queue Pod) orchestrated via Kubernetes manifests (<code className="font-mono text-slate-800 font-bold">k8s-deployment.yaml</code>).
              </p>
              <ul className="mt-3 space-y-1.5 text-slate-700 font-medium">
                <li>• <strong className="text-emerald-700">Pros:</strong> Extreme isolation, high availability, zero downtime rolling updates, can run on CIAL's private data center servers without cloud dependency.</li>
                <li>• <strong className="text-rose-700">Cons:</strong> Higher operational complexity, requires dedicated DevOps engineer and cluster maintenance.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-200/80 mt-3 text-[11px] font-mono text-slate-500 font-semibold">
              Deployment Effort: 2-3 Days
            </div>
          </div>

          {/* Option 3: Docker Compose */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-extrabold text-[10px] tracking-wide uppercase">
                  Local / On-Prem VM
                </span>
                <span className="font-mono text-slate-600 font-bold">Tier 3</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Option C: Docker Compose on Single CIAL Linux VM</h4>
              <p className="text-slate-600 font-medium mt-2 leading-relaxed">
                Run both the AI Gateway and an Odoo 17 Community instance together using a single <code className="font-mono text-slate-800 font-bold">docker-compose.yml</code> file on an on-premises Ubuntu server.
              </p>
              <ul className="mt-3 space-y-1.5 text-slate-700 font-medium">
                <li>• <strong className="text-emerald-700">Pros:</strong> Simple setup, all data stays strictly within CIAL LAN/intranet, reproducible with one command (<code className="font-mono text-slate-800">docker compose up -d</code>).</li>
                <li>• <strong className="text-rose-700">Cons:</strong> Single point of failure unless configured with VM failover.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-200/80 mt-3 text-[11px] font-mono text-slate-500 font-semibold">
              Deployment Effort: ~1 hour
            </div>
          </div>

        </div>

        {/* Final Recommendation for Tomorrow's Guide Presentation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            What should you tell your project guide tomorrow?
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            <em>"Sir/Ma'am, for our academic demonstration and Phase 1 CIAL trial, we recommend <strong>Serverless Cloud Containers (Google Cloud Run / Docker)</strong> because it provides instant auto-scaling, low cost, and zero server maintenance overhead. For full airport-wide production across Terminals T1, T2, and T3 alongside CIAL's on-premise Odoo ERP, we can transition to a <strong>Kubernetes (K8s) Cluster</strong> on CIAL's private cloud infrastructure to guarantee strict data sovereignty, high fault-tolerance, and zero downtime rolling upgrades."</em>
          </p>
        </div>

      </div>

    </div>
  );
};
