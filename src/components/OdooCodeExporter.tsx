import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Terminal,
  Server,
  Key,
  Database,
  ExternalLink,
  Code2,
  Sparkles,
  Zap
} from 'lucide-react';

export const OdooCodeExporter: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'python' | 'node' | 'curl'>('python');
  const [copied, setCopied] = useState<boolean>(false);
  const [odooHost, setOdooHost] = useState<string>('http://localhost:8069');
  const [odooDb, setOdooDb] = useState<string>('cial_helpdesk_db');
  const [odooUser, setOdooUser] = useState<string>('admin@cial.aero');
  const [odooApiKey, setOdooApiKey] = useState<string>('your_api_key_or_password');

  const pythonCode = `"""
CIAL Airport Operations - Odoo Helpdesk Dispatcher Bridge
Author: BTech Project Team for Cochin International Airport Limited (CIAL)
Dependencies: pip install google-genai requests
"""

import os
import xmlrpc.client
import json
from google import genai
from google.genai import types

# ----------------- CONFIGURATION -----------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
ODOO_URL = "${odooHost}"
ODOO_DB = "${odooDb}"
ODOO_USER = "${odooUser}"
ODOO_API_KEY = "${odooApiKey}"

# 1. Initialize Gemini Client
ai = genai.Client(api_key=GEMINI_API_KEY)

def analyze_cial_email(email_subject: str, email_body: str, sender_info: dict):
    """Uses Gemini 3.7 Flash to extract CIAL airport entities & Odoo payload"""
    
    prompt = f"""
    Analyze this CIAL Airport inbound email and return a JSON object with:
    - ticketTitle (clean actionable title)
    - terminal (T1_DOMESTIC, T2_EXECUTIVE, T3_INTERNATIONAL, CARGO_TERMINAL, AIRSIDE_APRON, CITY_SIDE_PARKING)
    - specificLocation (e.g. Gate 14, Carousel 3, Security Booth 4)
    - department (TERMINAL_OPERATIONS, HOUSEKEEPING_FACILITY, BAGGAGE_HANDLING, ELECTRICAL_HVAC, IT_FIDS_TELECOM, SECURITY_CISF_LIAISON, AIRSIDE_SAFETY, COMMERCIAL_CONCESSIONS, LOST_AND_FOUND, PASSENGER_SPECIAL_ASSISTANCE)
    - departmentLabel (Human readable department name)
    - priority (P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW)
    - slaMinutes (15, 60, 240, 1440)
    - actionRequired (list of ground tasks)
    - suggestedAssignee (staff title)
    
    Email Subject: {email_subject}
    Email Body: {email_body}
    Sender Name: {sender_info.get('name')}
    Sender Email: {sender_info.get('email')}
    """
    
    response = ai.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

def dispatch_to_odoo(ticket_data: dict, sender_info: dict, raw_body: str):
    """Dispatches the extracted ticket into Odoo ERP using official XML-RPC protocol"""
    print(f"Connecting to Odoo at {ODOO_URL}...")
    
    # Authenticate
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_API_KEY, {})
    
    if not uid:
        raise Exception("Authentication with Odoo failed! Check DB, User, or API key.")
        
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    
    # Priority mapping for Odoo (0=Low, 1=Medium, 2=High, 3=Urgent)
    p_map = {'P1_CRITICAL': '3', 'P2_HIGH': '2', 'P3_MEDIUM': '1', 'P4_LOW': '0'}
    odoo_priority = p_map.get(ticket_data.get('priority'), '1')
    
    # HTML formatted description
    actions_html = "".join([f"<li>{act}</li>" for act in ticket_data.get('actionRequired', [])])
    description_html = f"""
    <h3>CIAL Airport Incident / Task Dispatch</h3>
    <p><strong>Terminal:</strong> {ticket_data.get('terminal')} | <strong>Zone:</strong> {ticket_data.get('specificLocation')}</p>
    <p><strong>Department:</strong> {ticket_data.get('departmentLabel')}</p>
    <p><strong>SLA Target:</strong> {ticket_data.get('slaMinutes')} minutes</p>
    <p><strong>Suggested Assignee:</strong> {ticket_data.get('suggestedAssignee')}</p>
    <hr/>
    <p><strong>Raw Email:</strong></p>
    <blockquote>{raw_body.replace(chr(10), '<br/>')}</blockquote>
    <p><strong>Ground Action Checklist:</strong></p>
    <ul>{actions_html}</ul>
    """
    
    payload = {
        'name': f"[{ticket_data.get('terminal', 'T1')}] {ticket_data.get('ticketTitle')}",
        'partner_name': sender_info.get('name', 'Passenger / Staff'),
        'partner_email': sender_info.get('email', 'inbound@cial.aero'),
        'priority': odoo_priority,
        'description': description_html,
        # Custom CIAL Airport fields (if installed in Odoo custom module)
        # 'x_terminal': ticket_data.get('terminal'),
        # 'x_zone_location': ticket_data.get('specificLocation'),
    }
    
    ticket_id = models.execute_kw(
        ODOO_DB, uid, ODOO_API_KEY,
        'helpdesk.ticket', 'create',
        [payload]
    )
    
    print(f"🎉 SUCCESS! Odoo Helpdesk Ticket created with ID: {ticket_id}")
    return ticket_id

# ----------------- TEST EXECUTION -----------------
if __name__ == "__main__":
    sample_subject = "Urgent: Water leakage in Terminal 3 near Gate 14 boarding area"
    sample_body = "Water is pooling near gate 14 charging kiosk. Passengers are slipping. Please send housekeeping immediately."
    sender = {"name": "Dr. Ramesh Nambiar", "email": "ramesh@keralahealth.org"}
    
    print("1. Analyzing email with Gemini AI...")
    analysis = analyze_cial_email(sample_subject, sample_body, sender)
    print("Extracted Analysis:", json.dumps(analysis, indent=2))
    
    print("\\n2. Dispatching to Odoo ERP...")
    # Uncomment when your Odoo instance is running:
    # dispatch_to_odoo(analysis, sender, sample_body)
`;

  const nodeCode = `/**
 * CIAL Airport Operations - Node.js Odoo Dispatcher Bridge
 * Run: node cialOdooDispatcher.mjs
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const ODOO_URL = "${odooHost}";
const ODOO_DB = "${odooDb}";
const ODOO_USER = "${odooUser}";
const ODOO_API_KEY = "${odooApiKey}";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

async function processEmailAndDispatch(subject, body, sender) {
  console.log("Analyzing with Gemini 3.8 Flash...");
  
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: \`Analyze CIAL airport email: Subject: \${subject} Body: \${body}\`,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = JSON.parse(response.text);
  console.log("AI Extraction Complete:", parsed);

  // Send JSON-RPC payload to Odoo
  const odooJsonRpcEndpoint = \`\${ODOO_URL}/jsonrpc\`;
  console.log(\`Dispatching to Odoo at \${odooJsonRpcEndpoint}...\`);
  
  // Odoo Helpdesk Ticket creation payload
  const odooPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        ODOO_DB,
        2, // User ID (or authenticate first)
        ODOO_API_KEY,
        "helpdesk.ticket",
        "create",
        [{
          name: parsed.ticketTitle || subject,
          partner_name: sender.name,
          partner_email: sender.email,
          description: \`<p><strong>Location:</strong> \${parsed.specificLocation}</p><p>\${body}</p>\`
        }]
      ]
    },
    id: Date.now()
  };

  console.log("Ready to POST payload to Odoo:", JSON.stringify(odooPayload, null, 2));
}

// Test call
processEmailAndDispatch(
  "Lost iPad Pro in Black Case at Security Frisking Booth 4",
  "Left my iPad Pro at domestic T1 frisking tray this morning.",
  { name: "Kavitha Pillai", email: "kavitha@outlook.com" }
);`;

  const curlCode = `# Authenticate and Create Ticket via Odoo JSON-RPC API
curl -X POST "${odooHost}/jsonrpc" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute_kw",
      "args": [
        "${odooDb}",
        2,
        "${odooApiKey}",
        "helpdesk.ticket",
        "create",
        [{
          "name": "[T3] Urgent Water Leakage near Gate 14",
          "partner_name": "Dr. Ramesh Nambiar",
          "partner_email": "ramesh@keralahealth.org",
          "priority": "3",
          "description": "Water leaking near Gate 14 charging kiosk. Dispatched to Housekeeping & Facility Management."
        }]
      ]
    },
    "id": 1001
  }'`;

  const currentCode = selectedLang === 'python' ? pythonCode : selectedLang === 'node' ? nodeCode : curlCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-2xs">
            <FileCode2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Odoo API &amp; Python Integration Script Generator
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Copy and run these scripts in VS Code on your laptop. When you set up a free local or cloud Odoo Helpdesk instance, these scripts will automatically push the Gemini AI extracted airport tickets into Odoo!
            </p>
          </div>
        </div>
      </div>

      {/* Connection Parameter Configurator */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <Server className="w-4 h-4 text-blue-600" />
          Customize Your Odoo Target Instance Parameters:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-bold">Odoo Server URL</label>
            <input
              type="text"
              value={odooHost}
              onChange={(e) => setOdooHost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-bold">Database Name</label>
            <input
              type="text"
              value={odooDb}
              onChange={(e) => setOdooDb(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-bold">Odoo User / Email</label>
            <input
              type="text"
              value={odooUser}
              onChange={(e) => setOdooUser(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 font-bold">API Key / Password</label>
            <input
              type="text"
              value={odooApiKey}
              onChange={(e) => setOdooApiKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-0">
        
        {/* Code Header & Tab selector */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedLang('python')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedLang === 'python'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Python (xmlrpc.client) - Recommended
            </button>
            <button
              onClick={() => setSelectedLang('node')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedLang === 'node'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Node.js (Fetch &amp; JSON-RPC)
            </button>
            <button
              onClick={() => setSelectedLang('curl')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedLang === 'curl'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              cURL Command
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-5 bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-[500px] scrollbar-thin leading-relaxed shadow-inner">
          {currentCode}
        </pre>
      </div>

    </div>
  );
};
