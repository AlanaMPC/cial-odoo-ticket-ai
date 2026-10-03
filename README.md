
# CIAL Autonomous Inbound Passenger Grievance Redressal & Live Odoo ERP Dispatcher

[![Airport](https://img.shields.io/badge/Airport-Cochin%20International%20Airport%20(COK)-0052cc.svg)](https://www.cial.aero)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%20LTS-339933.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Tailwind%20CSS-06b6d4.svg)](https://react.dev/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20Flash-8e44ad.svg)](https://ai.google.dev/)
[![ERP](https://img.shields.io/badge/ERP-Odoo%20Helpdesk%20(JSON--RPC)-714b67.svg)](https://www.odoo.com)
[![Status](https://img.shields.io/badge/Deployment-Production--Ready-success.svg)]()

---

## 📌 Executive Summary

**Cochin International Airport Limited (CIAL)** is India’s first greenfield airport built under a Public-Private Partnership (PPP) model and the world’s first fully solar-powered airport, handling over 10 million passengers annually across Domestic (Terminal 1) and International (Terminal 3) terminals.

During peak operational windows, airport duty managers receive hundreds of passenger queries, grievances, and emergency requests across uncoordinated channels—primarily **Official Inbound Emails** and **WhatsApp Helpline numbers**.

### The Operational Challenge

1. **Conversational Message Bursting on WhatsApp:** Passengers do not submit structured complaint forms. They send short, rapid text bursts (e.g., *"Hi"*, *"my bag is missing"*, *"Tag AI 582914 at T3 Belt 2"*). Traditional webhook handlers create 3 to 5 duplicate tickets for each single incident, overwhelming duty staff.
2. **Unstructured Email Clutter:** Inbound emails contain irrelevant marketing blasts, airline booking confirmations, and spam mixed with critical passenger grievances.
3. **Manual ERP Ticket Entry Bottleneck:** Airport staff previously had to manually read messages, determine the responsible department (Baggage Services, CISF Security, Terminal Operations, Ground Handlers), formulate action steps, and log them into Odoo Helpdesk.

### The Autonomous Solution

This enterprise system acts as an **autonomous multi-channel AI gateway** that:

* **Continuously monitors CIAL's Inbound Mailbox** via secure IMAP (SSL 993) and auto-filters spam using sender/domain allowlists and heuristics.
* **Buffers Inbound WhatsApp Texts with a 15-Minute Temporal Inactivity Engine**, assembling fragmented customer chat bursts into a single unified grievance record.
* **Performs Zero-Shot Operational Triage using Google Gemini AI**, extracting flight numbers, passenger names, PNRs, baggage tags, terminals (T1/T3), and carousels, while categorizing tickets into one of 12 CIAL airport operational divisions.
* **Dispatches Tickets in Real Time to CIAL's Live Odoo ERP Helpdesk** via secure JSON-RPC / XML-RPC APIs with automatic stage tracking and bi-directional synchronization.

---

## 🏗️ System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      PASSENGER INBOUND CHANNELS                        │
 └───────────────────┬────────────────────────────────┬───────────────────┘
                     │                                │
        [ CIAL Customer Email ]             [ CIAL WhatsApp Number ]
          (IMAP SSL Port 993)                 (Meta Cloud API / WABA)
                     │                                │
                     ▼                                ▼
       ┌───────────────────────────┐    ┌───────────────────────────┐
       │   IMAP Ingestion Worker   │    │  15-Min Inactivity Buffer │
       │  (TLS, MIME, MailParser)  │    │  (Temporal Aggregation)   │
       └─────────────┬─────────────┘    └─────────────┬─────────────┘
                     │                                │
                     └────────────────┬───────────────┘
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       Autonomous AI Triage Engine (Gemini)      │
             │  - Entity Extraction (PNR, Flight, Belt, Tag)   │
             │  - Priority Scoring (Urgent / High / Normal)    │
             │  - 12 CIAL Department Classifications          │
             │  - Ground Action Checklist Synthesis            │
             └────────────────────────┬────────────────────────┘
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │         Live Odoo ERP Helpdesk Gateway          │
             │     (JSON-RPC / XML-RPC Object Service)         │
             │        Target Model: 'helpdesk.ticket'          │
             └────────────────────────┬────────────────────────┘
                                      ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                       LIVE CIAL OPERATIONS SUITE                       │
 │  - Real-Time Odoo Kanban Sync                                          │
 │  - Operations Control Analytics & SLA Monitors                         │
 │  - Inbound Mailbox & Quarantine Management                             │
 │  - Interactive WhatsApp Inactivity Simulator                           │
 └────────────────────────────────────────────────────────────────────────┘

```
---

## 🚀 Key Features

* **Autonomous IMAP Sync:** Automatically connects to CIAL customer support mailboxes over IMAP SSL, parses headers and HTML/text bodies, and marks ingested items safely.
* **15-Min WhatsApp Buffer:** Prevents ticket duplication. Automatically waits for a 15-minute window of inactivity before compiling the conversation and triggering ERP ticket generation.
* **Gemini 2.5 / 3.8 Flash AI:** High-speed semantic classification into 12 CIAL departments (Baggage Handling, Security/CISF, Immigration, Ground Handling, Terminal Facilities, Lost & Found, etc.).
* **Actionable Ground Checklists:** Every ticket arrives in Odoo pre-populated with clear bullet points (e.g., *"Dispatch duty officer to T3 Carousel 2"*, *"Track tag in BHS"*).
* **Native Odoo ERP Integration:** Direct connection to Odoo Helpdesk via JSON-RPC (`execute_kw`). Reads stages, creates tickets, sets priorities, and syncs status updates bidirectionally.
* **Operational Control Center:** Built-in React 19 dashboard with live counters, sentiment breakdown, SLA breach monitors, and category analytics.

---

## 📂 Project Directory Structure

```text
cial-odoo-ticket-ai/
├── server.ts                   # Core Express backend, IMAP poller, Odoo JSON-RPC client, WhatsApp buffer
├── odoo-config.json            # Active Odoo instance connection credentials & toggle (Ignored in git)
├── imap-config.json            # Active IMAP mailbox credentials & sync interval (Ignored in git)
├── ignored-emails.json         # Spam/Quarantine sender list
├── .env.example                # Template for environment variables
├── index.html                  # Web client entrypoint
├── vite.config.ts              # Vite bundler configuration
├── tsconfig.json               # TypeScript strict compilation configuration
├── package.json                # Project dependencies and operational scripts
└── src/                        # Modern React frontend application
    ├── App.tsx                 # Main application view container and navigation
    ├── components/             # Reusable UI modules
    │   ├── MailboxHub.tsx      # Inbound email explorer & connection status
    │   ├── EmailDispatcher.tsx # AI grievance reviewer & manual dispatch interface
    │   ├── WhatsAppBuffer.tsx  # 15-minute conversational buffer & interactive simulator
    │   ├── OdooBoard.tsx       # Live Odoo Helpdesk Kanban board & ticket inspector
    │   └── Analytics.tsx       # Airport operations metrics, SLA charts, and category distribution
    └── types/                  # TypeScript data interfaces and models

```
---

## ⚙️ Prerequisites & System Requirements

Before running the application, ensure your environment meets the following specifications:

* **Node.js:** `v18.x`, `v20.x`, or `v22.x LTS` installed
* **Package Manager:** `npm` (v9+) or `bun`
* **Google Gemini API Key:** Obtain from Google AI Studio
* **Odoo ERP:** Any Odoo Community or Enterprise instance (Odoo 16, 17, or 18) with the Helpdesk module installed
* **Email Account:** An active email account supporting IMAP (e.g., Google Workspace, Microsoft 365, or CIAL Corporate Exchange)

---

## 🛠️ Step-by-Step Configuration & Setup

### 1. Installation

Clone the repository to your local machine or server and install dependencies:

```bash
git clone https://github.com/AlanaMPC/cial-odoo-ticket-ai.git
cd cial-odoo-ticket-ai
npm install

```

### 2. Environment Variables (.env)

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env

GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000

```
---

## 🔗 Connecting External Services

### A. Connecting CIAL's Official Inbound Email (IMAP)

The system automatically checks for new passenger emails and passes them to the AI triage engine.

Open or create `imap-config.json` in the project root:

```json
{
  "host": "imap.gmail.com",
  "port": 993,
  "secure": true,
  "user": "customercare@cial.aero",
  "password": "your-app-specific-password",
  "mailbox": "INBOX",
  "syncIntervalSeconds": 60,
  "isLive": true
}
```
* **Google Workspace / Gmail:** Enable 2-Step Verification, generate an App Password under Account Security, and use that 16-character password in `"password"`.
* **Microsoft 365 / Outlook:** Host: `outlook.office365.com`, Port: `993`, Secure: `true`.
* **Custom CIAL Corporate Mail Server:** Enter your corporate IMAP hostname (e.g., `mail.cial.aero`), SSL port `993`, and service account credentials.

---

### B. Connecting CIAL's Official WhatsApp Business Number

The system features an autonomous 15-minute inactivity buffer that collects multiple short messages from a passenger before creating an Odoo ticket.

#### Option 1: Meta WhatsApp Cloud API (Production)
1. In the Meta for Developers portal, register your WhatsApp Business Account (WABA).
2. Set the Webhook URL to: `https://<your-server-domain-or-ip>:3000/api/whatsapp/webhook`
3. Set the Verify Token and subscribe to `messages`.

#### Option 2: Twilio / 3rd-Party Gateway
Point incoming messages from your WhatsApp provider to send an HTTP POST request to:

```http
POST /api/whatsapp/message
Content-Type: application/json

{
  "senderPhone": "+919876543210",
  "senderName": "Passenger Name",
  "messageText": "Hi, my bag tag is AI 582914 at T3 belt 2"
}
```
---

### C. Connecting CIAL's Live Odoo ERP Helpdesk

The system connects directly to Odoo via JSON-RPC without requiring custom server plugins.

Open or create `odoo-config.json` in the project root:

```json
{
  "url": "https://your-company.odoo.com",
  "db": "your-database-name",
  "username": "admin-or-service-account@cial.aero",
  "apiKey": "your-odoo-api-key",
  "isLive": true
}
```
#### How to Generate an Odoo API Key:
1. Log in to Odoo > Click your profile in the top-right > **Preferences** (or **My Profile**).
2. Under the **Account Security** tab, find **Developer API Keys** and click **New API Key**.
3. Name it `CIAL-AI-Dispatcher` and paste the key into `odoo-config.json`.

---

## 🌐 Production Deployment Guide (AWS EC2 / Ubuntu Cloud)

### 1. Connect and Install System Packages

```bash
ssh -i "your-key.pem" ubuntu@<your-ec2-ip-or-dns>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential git
sudo npm install -g pm2
```
### 2. Clone and Build Project

```bash
git clone https://github.com/AlanaMPC/cial-odoo-ticket-ai.git
cd cial-odoo-ticket-ai
npm install
npm run build
```
### 3. Start the Service with PM2

```bash
# Start background service
pm2 start dist/server.cjs --name "cial-dispatcher"

# Enable auto-restart on reboot
pm2 startup
pm2 save
```
---

## 📡 REST API Reference

* `GET /api/odoo/tickets` — Fetches live tickets from Odoo `helpdesk.ticket` via JSON-RPC.
* `POST /api/odoo/tickets` — Dispatches an AI-triaged grievance directly into Odoo Helpdesk.
* `GET /api/odoo/config` — Retrieves the current Odoo connection status and parameters.
* `POST /api/odoo/config` — Updates Odoo URL, database name, username, or API key at runtime.
* `POST /api/whatsapp/message` — Ingests an inbound WhatsApp message into the 15-minute buffer engine.
* `GET /api/whatsapp/sessions` — Lists all active buffered WhatsApp passenger sessions with remaining time.
* `POST /api/whatsapp/flush/:id` — Forces immediate AI triage and Odoo dispatch for a buffered session.
* `DELETE /api/whatsapp/session/:id` — Permanently deletes a spam session without creating a ticket.
* `GET /api/imap/status` — Checks live IMAP connectivity.
* `POST /api/imap/sync` — Triggers an immediate mailbox fetch and processes new unread emails.

---

## 👥 Authors & Acknowledgments

* **Project Lead & Developer:** Alana Mariya P C
* **Organization:** Cochin International Airport Limited (CIAL) Project Initiative
* **Special Thanks:** IT Services Team
