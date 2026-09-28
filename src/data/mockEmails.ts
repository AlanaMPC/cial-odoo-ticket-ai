import { InboundEmail } from '../types';

export const CIAL_SAMPLE_EMAILS: InboundEmail[] = [
  {
    id: 'em-101',
    sender: {
      name: 'Dr. Ramesh Nambiar',
      email: 'ramesh.nambiar@keralahealth.org',
      phone: '+91 94471 23456',
      pnr: '6E-4529-COK',
      flightNumber: '6E 512',
      senderType: 'PASSENGER',
    },
    subject: 'Urgent: Water leakage in Terminal 3 near Gate 14 boarding area',
    body: `Respected Airport Authority CIAL,

I am currently waiting at Terminal 3 (International Departures) for Emirates flight EK 531 to Dubai near Gate 14. 

There is a significant ceiling water leakage right next to the seating area near charging kiosk #4. Water is pooling rapidly across the polished floor, creating a severe slipping hazard for elderly passengers and children. A passenger almost slipped a few moments ago. 

Please dispatch housekeeping and maintenance immediately to cordon off the area and clean the water before someone gets hurt.

Regards,
Dr. Ramesh Nambiar
Phone: +91 94471 23456`,
    receivedAt: '2026-09-01T19:42:00Z',
    sourceInbox: 'grievances@cial.aero',
    attachmentsCount: 1,
  },
  {
    id: 'em-102',
    sender: {
      name: 'Deepa Kurian',
      email: 'deepakurian88@gmail.com',
      phone: '+91 98950 11223',
      pnr: 'AI-842231',
      flightNumber: 'AI 505',
      senderType: 'PASSENGER',
    },
    subject: 'Wheelchair assistance requested for 82yo passenger arriving on AI 505 at T1',
    body: `Hello CIAL Passenger Care,

My mother Mrs. Mary Kurian (82 years old, severely arthritic, unable to walk long distances) is arriving on Air India flight AI 505 from Delhi tomorrow at 11:30 AM at Terminal 1 Domestic Arrival.

We had requested wheelchair assistance with the airline, but their customer support advised us to also alert the airport ground team to ensure dedicated PRM (Persons with Reduced Mobility) escort from the aerobridge to the taxi pickup bay outside gate 2.

Could you please confirm PRM staff and buggy availability at the gate upon arrival?

Passenger Details:
Name: Mary Kurian
Flight: AI 505
Arrival: 11:30 AM, Terminal 1
Contact Person: Deepa Kurian (+91 98950 11223)

Thank you for your warm Kerala hospitality.`,
    receivedAt: '2026-09-01T18:15:00Z',
    sourceInbox: 'passengerdesk@cial.aero',
  },
  {
    id: 'em-103',
    sender: {
      name: 'Capt. Sunil Varghese',
      email: 's.varghese@indigoops.in',
      phone: '+91 98400 99887',
      flightNumber: '6E 214',
      senderType: 'AIRLINE_STAFF',
    },
    subject: 'Operational Notice: Baggage Conveyor Belt 3 Jammed - T3 International Arrival',
    body: `Duty Manager / Airside Ops CIAL,

During offloading of flight 6E 214 (Doha to Kochi), Carousel #3 in Terminal 3 International Arrival hall has jammed. The motor is making a high-pitched grinding noise and luggage from container AKE-7721 is piling up at the feed chute.

Over 240 passengers are crowding around belt 3 getting agitated. We have temporarily stopped conveyor feeder belt.

Action needed:
1. Immediately deploy BHS (Baggage Handling System) engineers to inspect belt 3 drive mechanism.
2. Route remaining cargo containers to standby Belt 2.
3. Announce update on FIDS screens for passenger clarity.

Regards,
Capt. Sunil Varghese
IndiGo Airport Operations Lead - COK`,
    receivedAt: '2026-09-01T19:10:00Z',
    sourceInbox: 'opsdesk@cial.aero',
  },
  {
    id: 'em-104',
    sender: {
      name: 'Kavitha S. Pillai',
      email: 'kavithaspillai@outlook.com',
      phone: '+91 97455 33445',
      pnr: 'SG-901844',
      flightNumber: 'SG 254',
      senderType: 'PASSENGER',
    },
    subject: 'LOST ITEM: Left iPad Pro in Black Case at Security Frisking Booth 4 (T1 Domestic)',
    body: `Dear Lost & Found Department CIAL,

Today morning at around 07:15 AM, while going through Security Frisking Booth #4 in Terminal 1 (Domestic Departures), I inadvertently left my Apple iPad Pro (12.9 inch, Space Grey in an ESR magnetic leather folio case) in the grey plastic security screening tray.

There is a small CIAL duty-free sticker on the back of the case and the lockscreen has a photo of a golden retriever dog.

I have already boarded my flight to Bangalore. My brother in Aluva can collect it with authorization letter if found.

Please verify with CISF Security CCTV footage and store safely in the Lost & Found locker.

Best regards,
Kavitha S. Pillai
Phone: +91 97455 33445`,
    receivedAt: '2026-09-01T08:05:00Z',
    sourceInbox: 'lostfound@cial.aero',
  },
  {
    id: 'em-105',
    sender: {
      name: 'Mohamed Asharaf',
      email: 'asharaf.gulf@gmail.com',
      phone: '+971 50 1234567',
      flightNumber: 'IX 435',
      senderType: 'PASSENGER',
    },
    subject: 'Air Conditioning malfunction in T3 Immigration Queue Area - extremely hot and suffocating',
    body: `To the CIAL Management,

I just landed from Muscat on Air India Express IX 435. The immigration arrival hall in Terminal 3 has over 600 passengers in line, and the central air conditioning units appear to be completely tripped or off. 

It is sweltering hot, infants are crying, and ventilation is minimal. Several elderly passengers are sweating profusely. 

This gives a very poor impression of our prestigious green solar airport to international tourists and NRIs. Please turn on the AC chiller banks or ventilation fans immediately.

Mohamed Asharaf`,
    receivedAt: '2026-09-01T17:50:00Z',
    sourceInbox: 'grievances@cial.aero',
  },
  {
    id: 'em-106',
    sender: {
      name: 'Ajay K. (Ground Safety Officer)',
      email: 'ajay.safety@cial.aero',
      senderType: 'AIRPORT_INTERNAL',
    },
    subject: 'Airside Safety Alert: Small FOD (Foreign Object Debris) spotted near Taxiway Charlie-2',
    body: `Airside Ops & Duty Officer,

During routine morning runway and taxiway perimeter inspection at 06:30 hrs, a piece of metallic cargo lock pin (approx 15cm) was spotted on the shoulder of Taxiway C2 (connecting Apron Bay 18 to active runway 27).

Area needs immediate magnetic sweeping vehicle dispatch before peak departure wave at 08:00 hrs to avoid jet engine ingestion risk.

Location: Taxiway C-2, 50m North of Bay 18 holding point.
Priority: Urgent Airside Safety.`,
    receivedAt: '2026-09-01T06:35:00Z',
    sourceInbox: 'airside.safety@cial.aero',
  },
  {
    id: 'em-107',
    sender: {
      name: 'Sneha Roy',
      email: 'sneharoy_travels@yahoo.com',
      phone: '+91 94970 88990',
      flightNumber: 'QR 517',
      senderType: 'PASSENGER',
    },
    subject: 'Wi-Fi OTP SMS not delivering to International Roaming numbers at T3 Departures',
    body: `Hi CIAL Tech Support,

I am an inbound passenger at T3 International Departures waiting for Qatar Airways flight QR 517. 

When trying to connect to "CIAL_Free_HighSpeed_WiFi", the SMS verification OTP is failing to deliver to overseas mobile numbers (+44 UK and +971 UAE). The page just shows a loading spinner and times out.

Because roaming data is expensive, many foreign tourists here are struggling to access online boarding passes and travel documents. Could IT look into the SMS gateway provider?

Thank you,
Sneha Roy`,
    receivedAt: '2026-09-01T15:20:00Z',
    sourceInbox: 'it.support@cial.aero',
  },
  {
    id: 'em-108',
    sender: {
      name: 'Mathews P. John',
      email: 'mathews.pjohn@gmail.com',
      phone: '+91 98470 55443',
      senderType: 'PASSENGER',
    },
    subject: 'Overcharging complaint at Domestic T1 Food Court - Tea & Snacks billing discrepancy',
    body: `Dear CIAL Commercial & Grievance Cell,

I wish to bring to your notice that outlet 'Malabar Delights' located inside T1 Domestic Security Hold area charged INR 120 for a standard packaged snack having MRP printed as INR 50, and charged INR 90 for a regular tea without providing a computerized GST tax invoice.

As per airport authority consumer guidelines, MRP violations are strictly forbidden. Kindly investigate this vendor concession and inspect billing terminals.

Receipt photo attached for your verification.

Mathews P. John
Mob: 9847055443`,
    receivedAt: '2026-09-01T12:05:00Z',
    sourceInbox: 'commercial@cial.aero',
    attachmentsCount: 1,
  }
];
