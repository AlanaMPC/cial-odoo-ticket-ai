import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';

export async function generateDeploymentReportDocx(): Promise<Buffer> {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  };

  const doc = new Document({
    title: 'CIAL Autonomous Email-to-Odoo Dispatcher - Deployment & Architecture Report',
    description: 'BTech Project Technical Guide Report for Cochin International Airport Limited (CIAL)',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '2D3748',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: [
          // Header / Title
          new Paragraph({
            text: 'COCHIN INTERNATIONAL AIRPORT LIMITED (CIAL)',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'Autonomous Inbound Email-to-Odoo Helpdesk Ticket Dispatcher',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'BTech Final Year Project — Technical Architecture, Backend Engine & Deployment Report',
                italics: true,
                bold: true,
                color: '4A5568',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Divider
          new Paragraph({
            text: '-----------------------------------------------------------------------------------------------------------------',
            alignment: AlignmentType.CENTER,
            spacing: { after: 250 },
          }),

          // SECTION 1: EXECUTIVE SUMMARY
          new Paragraph({
            text: '1. Executive Summary & Purpose',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'This report details the architectural design, backend intelligence pipeline, and production deployment strategy for the Autonomous Inbound Email-to-Odoo Helpdesk Dispatcher built for Cochin International Airport Limited (CIAL). The system eliminates manual email triaging by converting incoming passenger complaints, airline operational alerts, and terminal facility requests into structured, actionable Odoo Helpdesk ERP tickets within seconds.'
              ),
            ],
            spacing: { after: 150 },
          }),

          // SECTION 2: HOW THE BACKEND WORKS
          new Paragraph({
            text: '2. Backend Engine Architecture: Step-by-Step Flow',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'The backend is structured as an event-driven Node.js / Express microservice integrated with the official Google Gemini AI SDK and Odoo XML-RPC protocols. It operates across 4 core phases:'
              ),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'A. Real-Time Inbound Mail Intake (IMAP / Webhook): ', bold: true }),
              new TextRun(
                'Connects securely via TLS to airport inboxes (e.g., grievances@cial.aero, opsdesk@cial.aero) using ImapFlow. It continuously monitors for new unseen passenger emails and normalizes MIME multipart bodies into structured text.'
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'B. Gemini AI Comprehension Engine: ', bold: true }),
              new TextRun(
                'Uses Gemini 3.6 Flash with strict responseSchema guarantees. The AI evaluates airport relevance, filters spam/casual greetings, extracts key flight entities (PNR, Flight number, contact), and maps the incident to one of CIAL’s 3 Terminals (T1 Domestic, T2 Executive, T3 International) and 10 Ground Departments (BHS, HVAC, Housekeeping, CISF Liaison, Lost & Found, etc.).'
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'C. Odoo ERP Dispatcher (XML-RPC / JSON-RPC): ', bold: true }),
              new TextRun(
                'Directly creates a record in the "helpdesk.ticket" model inside Odoo ERP. It assigns priority levels (P1 Critical 15-min SLA up to P4 Low), populates custom airport fields (x_terminal, x_zone_location), and notifies the ground shift lead.'
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'D. Passenger Auto-Reply Service: ', bold: true }),
              new TextRun(
                'Instantly drafts a warm, personalized Kerala hospitality email acknowledgement containing the Odoo tracking ID and expected resolution window, assuring the passenger of immediate airport response.'
              ),
            ],
            spacing: { after: 200 },
          }),

          // SECTION 3: CLOUD VS KUBERNETES DEPLOYMENT REPORT
          new Paragraph({
            text: '3. Deployment Strategy: Cloud vs. Kubernetes (Presentation Guide)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Crucial Distinction for Your Guide: ', bold: true }),
              new TextRun(
                'Cloud and Kubernetes are NOT competing alternatives; they solve different layers of infrastructure:\n' +
                '• "Cloud" (e.g., Google Cloud, AWS) is the physical and virtual hosting platform providing servers, network switches, and databases.\n' +
                '• "Kubernetes" (K8s) is an open-source orchestration tool that manages, monitors, and automatically heals clusters of Docker containers across servers. Kubernetes can run ON TOP of Cloud (e.g. Google Kubernetes Engine) or ON CIAL’s private on-premise physical servers.'
              ),
            ],
            spacing: { after: 150 },
          }),

          // Comparison Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: tableBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Criteria', bold: true })] })],
                  }),
                  new TableCell({
                    borders: tableBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '1. Serverless Cloud (Cloud Run)', bold: true })] })],
                  }),
                  new TableCell({
                    borders: tableBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '2. Kubernetes (K8s Cluster)', bold: true })] })],
                  }),
                  new TableCell({
                    borders: tableBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '3. Docker Compose (Single VM)', bold: true })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Setup Complexity')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Low (15 minutes)')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('High (Requires DevOps/K8s expertise)')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Very Low (1 command)')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Cost & Scaling')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Pay-per-request; scales to 0')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Fixed cluster cost; scales multi-node')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Fixed VM hosting cost')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Maintenance Overhead')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Zero (Managed by Google Cloud)')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Requires cluster monitoring & updates')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Manual container restarts & updates')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Best Suited For')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Academic Demo, Pilot & Phase 1')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('High-Security Airport Production')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Internal CIAL Intranet Sandbox')] }),
                ],
              }),
            ],
          }),

          // Recommendation Subsection
          new Paragraph({
            text: '4. Definitive Recommendation to Present to Your Guide',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Present a phased adoption strategy to your guide:\n\n' +
                '1. Phase 1 (Academic Defense & Pilot Testing): Deploy on Google Cloud Run as a containerized microservice. It provides an instant live HTTPS URL, auto-scales during flight rush hours, and costs near zero during idle hours.\n' +
                '2. Phase 2 (Airport Enterprise Integration): Transition to a Kubernetes (K8s) Cluster (using Rancher or MicroK8s) hosted within CIAL’s private on-premise data center. This ensures full compliance with airport security standards, air-gapped data protection, and zero downtime rolling upgrades alongside CIAL’s core ERP servers.'
              ),
            ],
            spacing: { after: 200 },
          }),

          // SECTION 4: NEXT STEPS & CONNECTIVITY CHECKLIST
          new Paragraph({
            text: '5. Next Steps & Connectivity Implementation Plan',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 1: Odoo Sandbox Instance Setup\n', bold: true }),
              new TextRun('Create a free 15-day trial on Odoo.com or run a local community instance via Docker (`docker run -d -p 8069:8069 --name odoo -t odoo`). Configure Helpdesk teams matching CIAL’s 10 departments.\n\n'),
              new TextRun({ text: 'Step 2: Connect Live IMAP Email Ingestion\n', bold: true }),
              new TextRun('Configure official CIAL email forwarding (or dedicated Gmail/Office365 mailbox) with a secure App Password to allow automated background polling.\n\n'),
              new TextRun({ text: 'Step 3: Ground Staff SMS & WhatsApp Webhooks\n', bold: true }),
              new TextRun('Connect Twilio / Gupshup SMS gateway to dispatch immediate P1 alerts to on-duty team leads (e.g. Baggage Belt Lead, HVAC Engineer).\n\n'),
              new TextRun({ text: 'Step 4: Continuous Performance & SLA Monitoring\n', bold: true }),
              new TextRun('Deploy Grafana / Prometheus or Odoo custom dashboard to monitor AI classification accuracy, average response times, and SLA compliance percentages.'),
            ],
            spacing: { after: 200 },
          }),

          // Conclusion & Signoff
          new Paragraph({
            text: '6. Conclusion',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 150, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'By combining the semantic intelligence of Gemini AI with the robust ERP capabilities of Odoo and modern containerized deployment (Cloud Run / Kubernetes), Cochin International Airport can achieve industry-leading passenger grievance response times, transparent ground operations, and measurable cost reductions.'
              ),
            ],
            spacing: { after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Prepared by: ', bold: true }),
              new TextRun('BTech Project Team\n'),
              new TextRun({ text: 'Target Entity: ', bold: true }),
              new TextRun('Cochin International Airport Limited (CIAL / COK)\n'),
              new TextRun({ text: 'Date of Submission: ', bold: true }),
              new TextRun(new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })),
            ],
            spacing: { before: 150 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
