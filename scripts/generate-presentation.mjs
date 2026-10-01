import pptxgen from 'pptxgenjs';
import path from 'path';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'AutoPrime Platform';
pptx.company = 'Dhoot Group';
pptx.title = 'AutoPrime PDI Platform - Enterprise Overview & SOP Guide';

// Theme Colors
const C = {
  navy: '0F172A',
  slateDark: '1E293B',
  slateMid: '334155',
  slateLight: 'F8FAFC',
  blue: '2563EB',
  blueSoft: 'EFF6FF',
  teal: '0D9488',
  green: '16A34A',
  greenSoft: 'F0FDF4',
  amber: 'D97706',
  amberSoft: 'FFFBEB',
  red: 'DC2626',
  redSoft: 'FEF2F2',
  white: 'FFFFFF',
  line: 'E2E8F0',
  ink: '0F172A',
  inkSub: '475569',
  inkMuted: '64748B'
};

const addSlideHeader = (slide, title, category, slideNum) => {
  // Top category tag
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 0.4, w: 2.4, h: 0.32,
    fill: { color: C.blueSoft }, line: { color: C.blue, width: 1 },
    rectRadius: 0.08
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.4, w: 2.4, h: 0.32,
    fontSize: 9, fontFace: 'Segoe UI', bold: true, color: C.blue,
    align: 'center', valign: 'middle'
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8, y: 0.78, w: 10.5, h: 0.55,
    fontSize: 20, fontFace: 'Segoe UI', bold: true, color: C.navy,
    valign: 'middle'
  });

  // Top accent line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8, y: 1.38, w: 11.73, h: 0.03,
    fill: { color: C.line }, line: { width: 0 }
  });

  // Slide Number Footer
  slide.addText(`AutoPrime PDI Management Platform  |  Slide ${slideNum}`, {
    x: 0.8, y: 7.0, w: 11.73, h: 0.3,
    fontSize: 9, fontFace: 'Segoe UI', color: C.inkMuted
  });
};

// ============================================================================
// SLIDE 1: COVER
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };

  // Decorative Accent bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.4, h: 7.5,
    fill: { color: C.blue }, line: { width: 0 }
  });

  // System Tag Badge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2, y: 1.2, w: 3.8, h: 0.4,
    fill: { color: C.slateDark }, line: { color: C.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide.addText('ENTERPRISE AUTOMOTIVE OPERATING SYSTEM', {
    x: 1.2, y: 1.2, w: 3.8, h: 0.4,
    fontSize: 9.5, fontFace: 'Segoe UI', bold: true, color: '60A5FA',
    align: 'center', valign: 'middle'
  });

  // Main Big Title
  slide.addText('AutoPrime PDI Platform', {
    x: 1.2, y: 1.85, w: 10.5, h: 1.1,
    fontSize: 38, fontFace: 'Segoe UI', bold: true, color: C.white,
    valign: 'middle'
  });

  // Hindi + English Subtitle
  slide.addText('Pre-Delivery Inspection (PDI), Yard Fleet & Customer Bookings Management Platform\nसंपूर्ण डीलरशिप संचालन, स्टॉकयार्ड ट्रैकिंग एवं डिजिटल डिलीवरी क्लीयरेंस गाइड', {
    x: 1.2, y: 3.05, w: 10.5, h: 0.9,
    fontSize: 14, fontFace: 'Segoe UI', color: '94A3B8', lineSpacing: 22
  });

  // 3 Highlight Feature Pillars
  const pillars = [
    { title: '100% Inspection SOP', desc: 'Tata & Hyundai official 7-category checkpoints with digital defect tracking', color: C.blue },
    { title: 'Smart PBNA Allocation', desc: 'Zero dual-allocations, instant customer matching & automated VIN tagging', color: C.teal },
    { title: 'Offline-First Engine', desc: 'LAN PostgREST DB + Cloud Supabase bidirectional real-time sync', color: C.green }
  ];

  pillars.forEach((p, idx) => {
    const x = 1.2 + idx * 3.65;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 4.4, w: 3.4, h: 1.8,
      fill: { color: C.slateDark }, line: { color: C.slateMid, width: 1 },
      rectRadius: 0.12
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      x, y: 4.4, w: 0.08, h: 1.8,
      fill: { color: p.color }, line: { width: 0 }
    });
    slide.addText(p.title, {
      x: x + 0.25, y: 4.6, w: 3.0, h: 0.35,
      fontSize: 12, fontFace: 'Segoe UI', bold: true, color: C.white
    });
    slide.addText(p.desc, {
      x: x + 0.25, y: 5.0, w: 2.95, h: 1.0,
      fontSize: 10, fontFace: 'Segoe UI', color: '94A3B8', lineSpacing: 15
    });
  });

  // Metadata Footer
  slide.addText('Deployment: Tata Motors & Hyundai Passenger Vehicles  |  Dhoot Group Fleet Systems', {
    x: 1.2, y: 6.85, w: 10.5, h: 0.3,
    fontSize: 10, fontFace: 'Segoe UI', color: '64748B'
  });
}

// ============================================================================
// SLIDE 2: SYSTEM ARCHITECTURE & CORE PHILOSOPHY
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'सिस्टम परिचय एवं तकनीकी आर्किटेक्चर (System Architecture)', 'Architecture & Tech Stack', 2);

  // Left side: What is this software
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: C.slateLight }, line: { color: C.line, width: 1 },
    rectRadius: 0.12
  });
  slide.addText('यह सॉफ़्टवेयर क्या है? (Core Purpose)', {
    x: 1.1, y: 1.85, w: 5.0, h: 0.35,
    fontSize: 14, fontFace: 'Segoe UI', bold: true, color: C.navy
  });
  slide.addText(
    'AutoPrime PDI Platform एक एंटरप्राइज-ग्रेड ऑटोमोटिव ऑपरेटिंग सिस्टम है जो डीलरशिप में नई गाड़ियाँ आने (Factory Inward) से लेकर ग्राहक को चाबी सौंपने (Customer Delivery Gatepass) तक के प्रत्येक चरण को डिजिटाइज़ और ऑटोमेट करता है।\n\n' +
    '• डुअल-ब्रांड सपोर्ट: Tata Motors और Hyundai दोनों का अलग-अलग डेटा आइसोलेशन\n' +
    '• 100% पेपरलेस: डिजिटल इंस्पेक्शन, फोटो डिफ़ेक्ट एविडेंस, ई-चालान और QR सर्टिफ़िकेट\n' +
    '• नो डुप्लीकेशन: एक गाड़ी 2 ग्राहकों को कभी भी अलॉट नहीं हो सकती\n' +
    '• पूर्ण कानूनी सुरक्षा: हर गाड़ी का संपूर्ण ऑडिट ट्रेल और डिजिटल टाइमस्टैम्प',
    {
      x: 1.1, y: 2.3, w: 5.0, h: 4.2,
      fontSize: 10.5, fontFace: 'Segoe UI', color: C.inkSub, lineSpacing: 18
    }
  );

  // Right side: 3-Tier Technical Architecture Cards
  const tiers = [
    {
      title: 'Tier 1: Frontend Cockpit (React + Tailwind)',
      desc: 'हाई-स्पीड SPA (Single Page App) टोकन-बेस्ड डिज़ाइन सिस्टम, मोनोस्पेस टैब्युलर नंबर्स, और इंस्टेंट रिस्पॉन्स टाइम (<100ms)।',
      color: C.blue, bg: C.blueSoft
    },
    {
      title: 'Tier 2: Dual Database Sync (Local + Cloud)',
      desc: 'लोकल LAN पर PostgREST DB (Port 54321) + क्लाउड Supabase। इंटरनेट कटने पर भी यार्ड और वर्कशॉप में काम कभी नहीं रुकता।',
      color: C.green, bg: C.greenSoft
    },
    {
      title: 'Tier 3: Cloudflare Edge API Worker',
      desc: 'ग्लोबल CDN एज वर्कर जो लाइव स्टॉक सिंक, रोल-बेस्ड ऑथेंटिकेशन और ऑटोमैटिक डेटा बैकअप को सुरक्षित हैंडल करता है।',
      color: C.teal, bg: 'F0FDFA'
    }
  ];

  tiers.forEach((t, idx) => {
    const y = 1.6 + idx * 1.75;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y, w: 5.73, h: 1.55,
      fill: { color: t.bg }, line: { color: t.color, width: 1 },
      rectRadius: 0.1
    });
    slide.addText(t.title, {
      x: 7.05, y: y + 0.18, w: 5.2, h: 0.3,
      fontSize: 11.5, fontFace: 'Segoe UI', bold: true, color: t.color
    });
    slide.addText(t.desc, {
      x: 7.05, y: y + 0.52, w: 5.2, h: 0.9,
      fontSize: 9.8, fontFace: 'Segoe UI', color: C.inkSub, lineSpacing: 15
    });
  });
}

// ============================================================================
// SLIDE 3: COMPLETE END-TO-END WORKFLOW (SOP)
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'गाड़ी आने से डिलीवरी तक का पूरा सफ़र (End-to-End Workflow)', 'Standard Operating Procedure (SOP)', 3);

  const steps = [
    { step: '01', title: 'Carrier Unload', sub: 'ट्रांजिट रिसीविंग', desc: 'कैरियर अनलोडिंग, LR नंबर, ट्रांजिट डैमेज जांच', color: C.blue },
    { step: '02', title: 'Yard Inward', sub: 'स्टॉक इन्वेंट्री', desc: 'VIN स्कैनिंग, लोकेशन असाइनमेंट, न्यू कार स्टेटस', color: C.teal },
    { step: '03', title: 'PDI Inspection', sub: 'टेक्निकल चेक', desc: '7 केटेगरी चेकपॉइंट्स, OBD स्कैन, फोटो डिफेक्ट्स', color: C.amber },
    { step: '04', title: 'Workshop Repair', sub: 'डिफेक्ट रिपेयर', desc: 'जॉब कार्ड, डेंट/पेंट सुधार, रिप्लेसमेंट अप्रूवल', color: C.red },
    { step: '05', title: 'QA Sign-off', sub: 'क्वालिटी सर्टिफ़िकेट', desc: 'QA मैनेजर डिजिटल साइन, QR सर्टिफ़िकेट जनरेट', color: C.green },
    { step: '06', title: 'PBNA Allotment', sub: 'बुकिंग VIN मैचिंग', desc: 'ग्राहक बुकिंग से VIN मैच, फ़्री स्टॉक अलॉटमेंट', color: C.blue },
    { step: '07', title: 'Gatepass Out', sub: 'टैक्स चालान डिलीवरी', desc: 'डिलीवरी चालान, टैक्स इनवॉइस, सिक्योरिटी गेटपास', color: C.navy }
  ];

  steps.forEach((s, idx) => {
    const x = 0.8 + idx * 1.7;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.8, w: 1.55, h: 4.8,
      fill: { color: C.slateLight }, line: { color: C.line, width: 1 },
      rectRadius: 0.1
    });

    // Step Number Badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.35, y: 2.05, w: 0.85, h: 0.45,
      fill: { color: s.color }, line: { width: 0 },
      rectRadius: 0.08
    });
    slide.addText(s.step, {
      x: x + 0.35, y: 2.05, w: 0.85, h: 0.45,
      fontSize: 12, fontFace: 'Segoe UI', bold: true, color: C.white,
      align: 'center', valign: 'middle'
    });

    slide.addText(s.title, {
      x: x + 0.08, y: 2.65, w: 1.4, h: 0.45,
      fontSize: 10.5, fontFace: 'Segoe UI', bold: true, color: C.navy,
      align: 'center'
    });

    slide.addText(s.sub, {
      x: x + 0.08, y: 3.05, w: 1.4, h: 0.3,
      fontSize: 9, fontFace: 'Segoe UI', bold: true, color: s.color,
      align: 'center'
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.25, y: 3.45, w: 1.05, h: 0.02,
      fill: { color: C.line }, line: { width: 0 }
    });

    slide.addText(s.desc, {
      x: x + 0.1, y: 3.65, w: 1.35, h: 2.7,
      fontSize: 8.8, fontFace: 'Segoe UI', color: C.inkSub,
      align: 'center', lineSpacing: 14
    });
  });
}

// ============================================================================
// SLIDE 4: MODULE 1 - CARRIER RECEIVING & TRANSIT DAMAGE
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 1: कैरियर अनलोडिंग एवं ट्रांजिट डैमेज इंस्पेक्शन', 'Module 01 • Yard Receiving', 4);

  // 3 Columns: Kaha, Kese, Fayada
  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: Yard Management > Carrier Inward',
        'URL: /yard/receiving',
        'अधिकृत यूजर: Yard Supervisor / Inward Gate Officer',
        'डिवाइस: मोबाइल, टैबलेट या कंप्यूटर'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'स्टेप 1: कैरियर ट्रक नंबर व LR/Bilty नंबर दर्ज करें।',
        'स्टेप 2: अनलोड होते ही गाड़ी का VIN बारकोड स्कैन करें।',
        'स्टेप 3: बॉडी पैनल्स, ग्लास, टायर, और टूलकिट की जांच करें।',
        'स्टेप 4: यदि डैमेज मिले तो तुरंत फोटो खींचकर "Transit Damage Claim" में दर्ज करें।',
        'स्टेप 5: ड्राइवर के काउंटर-साइन लेकर रिसीविंग रसीद जनरेट करें।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        '100% क्लेम रिकवरी: अनलोडिंग के 2 घंटे के भीतर OEM या ट्रांसपोर्टर पर पेनल्टी/क्लेम क्लेम हो जाता है।',
        'डीलरशिप को शून्य नुकसान: डीलरशिप को अपने पास से रिपेयरिंग का खर्चा नहीं उठाना पड़ता।',
        'मिसिंग टूल्स की रोकथाम: जैक, स्पेयर व्हील, टूलकिट चोरी की 100% रोकथाम।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.7,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.75;
    });
  });
}

// ============================================================================
// SLIDE 5: MODULE 2 - VEHICLE STOCK & FLEET MANAGEMENT
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 2: लाइव स्टॉक इन्वेंट्री एवं एक्सेल इम्पोर्ट/डिलीट', 'Module 02 • Vehicle Stock', 5);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: Vehicle Stock Management',
        'URL: /vehicles',
        'अधिकृत यूजर: Inventory Manager, General Manager, Super Admin',
        'डेटा स्कोप: Tata Motors Stock / Hyundai Stock / All Brands'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'बल्क एक्सेल इम्पोर्ट: "Import Stock CSV" से 500+ गाड़ियां 3 सेकंड में लोड करें। ऑटो-कॉलम मैपिंग उपलब्ध है।',
        'लाइव फ़िल्टर: मॉडल, रंग, फ्यूल (EV/CNG/Petrol), एजिंग (0-30 दिन, 90+ दिन) से तुरंत खोजें।',
        'डिलीट मैनेजमेंट: सिंगल गाड़ी डिलीट (Trash बटन) या मल्टी-सेलेक्ट करके "Delete Selected" करें।',
        'फ़ैक्टरी रीसेट: "Manage Stock" से केवल कस्टम एक्सेल डेटा हटाएं या फ़ैक्टरी मास्टर रीस्टोर करें।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        'सटीक इन्वेंट्री: हर सेकंड पता रहता है कि Basni Yard या Shantinath Yard में किस मॉडल की कितनी गाड़ियाँ हैं।',
        'डेड स्टॉक रोकथाम: 60+ दिन पुरानी गाड़ियों का तुरंत अलर्ट मिलता है ताकि उन पर पहले डिस्काउंट देकर निकाला जा सके।',
        'सुरक्षित डिलीशन: डिलीटेड VINs टॉम्बस्टोन में सेव होते हैं ताकि पेज रीलोड पर दोबारा न आएं।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 6: MODULE 3 - DIGITAL PDI INSPECTION
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 3: डिजिटल प्री-डिलीवरी इंस्पेक्शन (PDI Checklist)', 'Module 03 • Digital PDI', 6);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: PDI Queue > Active PDI Session',
        'URL: /pdi एवं /pdi/session/:vin',
        'अधिकृत यूजर: Certified PDI Quality Engineer',
        'उपकरण: मोबाइल / टैबलेट (कैमरा सपोर्टेड)'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'स्टेप 1: क्यू से गाड़ी चुनें या VIN बारकोड स्कैन करके इंस्पेक्शन शुरू करें।',
        'स्टेप 2: 7 मुख्य केटेगरी के सभी चेकपॉइंट्स जांचें (Exterior, Interior, Engine Bay, Underbody, Electricals, Road Test, Docs)।',
        'स्टेप 3: हर पॉइंट पर OK या DEFECT टैग करें।',
        'स्टेप 4: डिफ़ेक्ट होने पर कैमरा से लाइव फोटो अटैच करें और सेवेरिटी (Minor/Major) चुनें।',
        'स्टेप 5: पूरा होने पर "Submit for QA Review" दबाएं।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        '0% मानवीय चूक: बिना हर चेकपॉइंट को भरे PDI सबमिट नहीं हो सकती।',
        'फोटो सबूत: हर स्क्रैच और फॉल्ट का डिजिटल रिकॉर्ड रहता है, जिससे बाद में कोई विवाद नहीं हो सकता।',
        'तेज इंस्पेक्शन: पेपर फॉर्म भरने में 45 मिनट लगते थे, डिजिटल सिस्टम में केवल 15 मिनट लगते हैं।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 7: MODULE 4 - DEFECT MANAGEMENT & REWORK
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 4: डिफ़ेक्ट ट्रैकिंग, वर्कशॉप रिपेयर एवं री-इंस्पेक्शन', 'Module 04 • Defect Rework', 7);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: Defect Management & Workshop Repairs',
        'URL: /repairs',
        'अधिकृत यूजर: Workshop Manager, Bodyshop Supervisor, Technician',
        'व्यू: कानबान बोर्ड (Pending > In Progress > Resolved)'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'स्टेप 1: PDI में फ्लैग हुआ डिफ़ेक्ट अपने आप रिपेयर बोर्ड पर आ जाता है।',
        'स्टेप 2: वर्कशॉप मैनेजर डेंटर या मैकेनिक को असाइन करता है।',
        'स्टेप 3: पार्ट रिप्लेसमेंट की आवश्यकता होने पर स्पेयर पार्ट्स रिक्वेस्ट जनरेट होती है।',
        'स्टेप 4: काम पूरा होने पर "After-Repair Photo" अपलोड की जाती है।',
        'स्टेप 5: "Send for QA Clearance" पर क्लिक किया जाता है।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        'कस्टमर डिससेटिस्फैक्शन शून्य: कोई भी डिफेक्टिव गाड़ी बिना रिपेयर हुए कभी भी डिलीवरी बे (Delivery Bay) तक नहीं जा सकती।',
        'वर्कशॉप जवाबदेही: किस टेक्नीशियन ने क्या काम किया, कितना समय लगा—सब ट्रैक होता है।',
        'वारंटी क्लेम: OEM डिफ़ेक्ट्स को अलग मार्क करके फ़ैक्टरी से वारंटी लेबर क्लेम किया जा सकता है।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 8: MODULE 5 - QA CLEARANCE & DIGITAL CERTIFICATE
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 5: QA मैनेजर क्लीयरेंस एवं डिजिटल QR सर्टिफ़िकेट', 'Module 05 • QA & Certificate', 8);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: QA Clearance Queue & Certificate Viewer',
        'URL: /qa एवं /certificate/:vin',
        'अधिकृत यूजर: Quality Assurance (QA) Manager केवल',
        'अधिकार: फाइनल डिलीवरी क्लीयरेंस अप्रूवल'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'स्टेप 1: QA मैनेजर PDI चेकलिस्ट, फोटो और रिपेयर हिस्ट्री का रिव्यू करता है।',
        'स्टेप 2: संतुष्ट होने पर अपना डिजिटल पिन/सिग्नेचर डालकर "APPROVE PDI" दबाता है।',
        'स्टेप 3: सिस्टम तुरंत आधिकारिक PDI Certificate जारी करता है।',
        'स्टेप 4: सर्टिफ़िकेट में यूनिक QR कोड, बारकोड, और संपूर्ण इंस्पेक्शन स्कोर ऑटोमैटिक प्रिंट होता है।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        'ग्राहक का अटूट विश्वास: डिलीवरी के समय ग्राहक को डिजिटल PDI सर्टिफिकेट दिया जाता है, जिसे मोबाइल से स्कैन करके पूरी रिपोर्ट देखी जा सकती है।',
        'ऑडिट रेडी: OEM ऑडिट्स (Tata Motors / Hyundai) में 100% फुल मार्क्स।',
        'लीगल प्रोटेक्शन: डिलीवरी के बाद अगर ग्राहक किसी पुराने स्क्रैच का दावा करे तो टाइमस्टैम्प फोटो प्रमाण के रूप में काम आती है।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 9: MODULE 6 - CUSTOMER BOOKINGS & PBNA ALLOCATION
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 6: कस्टमर बुकिंग लेज़र एवं स्मार्ट VIN अलॉटमेंट (PBNA)', 'Module 06 • Bookings & Allotment', 9);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: Customer Bookings Management',
        'URL: /bookings',
        'अधिकृत यूजर: Sales Consultant, Team Leader, Sales Manager',
        'फीचर: 13-कॉलम लाइव बुकिंग लेज़र + PBNA/VNA रिपोर्ट'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'बुकिंग एंट्री / इम्पोर्ट: रसीद संख्या, ग्राहक नाम, मोबाइल, मॉडल, रंग, और एडवांस राशि दर्ज करें या एक्सेल से अपलोड करें।',
        'स्मार्ट मैचिंग: सिस्टम दिखाता है: PBNA (गाड़ी स्टॉक में मौजूद है) या VNA (गाड़ी स्टॉक में नहीं है, फ़ैक्टरी ऑर्डर चाहिए)।',
        'VIN Allocation: "Allocate VIN" बटन दबाएं और स्टॉक की मैचिंग गाड़ी 1-क्लिक में असाइन करें।',
        'डिलीट / रीसेट: रसीद डिलीट (Trash) करें या मल्टी-सेलेक्ट करके हटाएं। अलॉटेड गाड़ी अपने आप Free Stock में वापस आ जाती है।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        'शून्य डुअल-अलॉटमेंट: एक गाड़ी कभी भी दो ग्राहकों को नहीं दी जा सकती। सिस्टम तुरंत लॉक कर देता है।',
        'स्टॉक का तुरंत रोटेशन: यार्ड में खड़ी गाड़ियों को तुरंत ग्राहक मिल जाता है, जिससे ब्याज (Holding Cost) बचता है।',
        'बुकिंग डिलीट होने पर सेफ्टी: बुकिंग डिलीट होते ही गाड़ी अपने आप दोबारा फ़्री स्टॉक में आ जाती है।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 10: MODULE 7 - CHALLANS, INVOICING & GATEPASS
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 7: डिलीवरी चालान, टैक्स इनवॉइस एवं सिक्योरिटी गेटपास', 'Module 07 • Challans & Gatepass', 10);

  const cols = [
    {
      title: '1. कहाँ करना होता है? (Where)',
      items: [
        'स्क्रीन: Challan, Invoicing & Delivery Gatepass',
        'URL: /challans',
        'अधिकृत यूजर: Accounts Manager, Cashier, Gate Security Officer',
        'दस्तावेज़: Tax Invoice, Delivery Challan, Security Gatepass'
      ],
      color: C.blue, bg: C.blueSoft
    },
    {
      title: '2. कैसे करना होता है? (How To Do)',
      items: [
        'स्टेप 1: अलॉटेड बुकिंग से ग्राहक चुनें—गाड़ी व ग्राहक का विवरण अपने आप भर जाता है।',
        'स्टेप 2: Ex-Showroom, RTO, Insurance, Fastag और एक्सेसरीज़ का ब्रेकअप डालें।',
        'स्टेप 3: GST और TCS का ऑटो-कैलकुलेशन होगा।',
        'स्टेप 4: चालान सेव करें और प्रिंट करें।',
        'स्टेप 5: सिक्योरिटी गेटपास जारी करें जिसमें QR कोड होता है जिसे मेन गेट पर गार्ड स्कैन करके गाड़ी बाहर निकालता है।'
      ],
      color: C.amber, bg: C.amberSoft
    },
    {
      title: '3. इसका क्या फायदा है? (Benefits)',
      items: [
        '100% चोरी व हेराफेरी रोकथाम: बिना डिजिटल गेटपास के कोई भी गाड़ी गेट से बाहर नहीं निकल सकती।',
        'कैलकुलेशन में 0 गलती: GST और टैक्स ब्रेकअप सिस्टम खुद करता है, जिससे अकाउंट्स में कोई मिसमैच नहीं होता।',
        'फास्ट डिलीवरी एक्सपीरियंस: ग्राहक को चालान और गेटपास 2 मिनट में प्रिंट होकर मिल जाता है।'
      ],
      color: C.green, bg: C.greenSoft
    }
  ];

  cols.forEach((col, idx) => {
    const x = 0.8 + idx * 3.98;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.75, h: 5.1,
      fill: { color: col.bg }, line: { color: col.color, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText(col.title, {
      x: x + 0.25, y: 1.85, w: 3.25, h: 0.45,
      fontSize: 12.5, fontFace: 'Segoe UI', bold: true, color: col.color
    });

    let currentY = 2.45;
    col.items.forEach(item => {
      slide.addText(`•  ${item}`, {
        x: x + 0.25, y: currentY, w: 3.25, h: 0.72,
        fontSize: 9.8, fontFace: 'Segoe UI', color: C.ink, lineSpacing: 15
      });
      currentY += 0.77;
    });
  });
}

// ============================================================================
// SLIDE 11: MODULE 8 - EXECUTIVE COCKPIT & ANALYTICS
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'मॉड्यूल 8: एक्जीक्यूटिव डैशबोर्ड एवं बिजनेस एनालिटिक्स', 'Module 08 • Executive Cockpit', 11);

  // Left card: KPI Highlights
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.6, w: 5.6, h: 5.1,
    fill: { color: C.slateLight }, line: { color: C.line, width: 1 },
    rectRadius: 0.12
  });
  slide.addText('रियल-टाइम लाइव मेट्रिक्स (Live KPI Dashboard)', {
    x: 1.1, y: 1.85, w: 5.0, h: 0.35,
    fontSize: 14, fontFace: 'Segoe UI', bold: true, color: C.navy
  });

  const kpis = [
    { label: 'Total Fleet Size', val: '540+ गाड़ियां', desc: 'Basni, Pune & Shantinath Yards में लाइव इन्वेंट्री' },
    { label: 'PDI Pass Rate', val: '94.8% First-Time Pass', desc: 'डिफेक्ट मुक्त गुणवत्ता का पैमाना' },
    { label: 'Avg Yard Dwell Time', val: '14.2 Days', desc: 'गाड़ी आने से कस्टमर डिलीवरी का औसत समय' },
    { label: 'Total Advance Collected', val: '₹1.85+ Crore', desc: 'बुकिंग्स पर एकत्रित अग्रिम राशि' }
  ];

  kpis.forEach((k, idx) => {
    const y = 2.4 + idx * 1.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1, y, w: 5.0, h: 0.85,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
      rectRadius: 0.08
    });
    slide.addText(k.label, {
      x: 1.25, y: y + 0.1, w: 2.8, h: 0.25,
      fontSize: 10, fontFace: 'Segoe UI', bold: true, color: C.blue
    });
    slide.addText(k.desc, {
      x: 1.25, y: y + 0.38, w: 2.8, h: 0.35,
      fontSize: 8.8, fontFace: 'Segoe UI', color: C.inkMuted
    });
    slide.addText(k.val, {
      x: 3.8, y: y + 0.18, w: 2.1, h: 0.45,
      fontSize: 12, fontFace: 'Segoe UI', bold: true, color: C.navy, align: 'right'
    });
  });

  // Right side: Decision Making Value
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.6, w: 5.73, h: 5.1,
    fill: { color: C.blueSoft }, line: { color: C.blue, width: 1.2 },
    rectRadius: 0.12
  });
  slide.addText('मैनेजमेंट को क्या लाभ मिलता है? (Strategic Value)', {
    x: 7.1, y: 1.85, w: 5.1, h: 0.35,
    fontSize: 13.5, fontFace: 'Segoe UI', bold: true, color: C.blue
  });

  const strategicPoints = [
    { title: 'डिफेक्ट पारेटो एनालिसिस (Pareto Chart)', text: 'पता चलता है कि किस मॉडल (Nexon, Harrier, Creta) में कौन सा डिफ़ेक्ट बार-बार आ रहा है, ताकि OEM को शिकायत भेजी जा सके।' },
    { title: 'यार्ड कैपेसिटी मॉनिटरिंग', text: 'हर यार्ड में कितनी गाड़ियां खड़ी हैं और कितनी जगह खाली है, इसका सटीक प्रतिशत दिखता है।' },
    { title: 'एजिंग इन्वेंट्री अलार्म (Aging Stock)', text: 'जो गाड़ियां 60 दिन से ज्यादा समय से खड़ी हैं, उन पर तुरंत एक्शन लेकर डीलरशिप के पैसों को ब्लॉक होने से बचाया जाता है।' },
    { title: '1-क्लिक एग्जीक्यूटिव PDF/Excel रिपोर्ट', text: 'डायरेक्टर्स और ऑडिटर्स के लिए सम्पूर्ण रिपोर्ट एक क्लिक में डाउनलोड हो जाती है।' }
  ];

  let sy = 2.4;
  strategicPoints.forEach(sp => {
    slide.addText(`•  ${sp.title}`, {
      x: 7.1, y: sy, w: 5.1, h: 0.3,
      fontSize: 10.5, fontFace: 'Segoe UI', bold: true, color: C.navy
    });
    slide.addText(sp.text, {
      x: 7.3, y: sy + 0.28, w: 4.9, h: 0.65,
      fontSize: 9.5, fontFace: 'Segoe UI', color: C.inkSub, lineSpacing: 14
    });
    sy += 0.95;
  });
}

// ============================================================================
// SLIDE 12: USER ROLES & GOVERNANCE
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'रोल-बेस्ड एक्सेस कंट्रोल एवं सुरक्षा (User Roles & Governance)', 'Security & Permissions', 12);

  const roles = [
    { role: 'Super Admin', person: 'Rajesh Dhoot / System Admin', scope: 'ऑल ब्रांड्स, सिस्टम कॉन्फ़िग, मास्टर डेटा डिलीट / रीसेट, यूजर मैनेजमेंट' },
    { role: 'QA Manager', person: 'Kavita Deshmukh', scope: 'PDI रिव्यू, डिफ़ेक्ट सुधार अप्रूवल, डिजिटल PDI सर्टिफ़िकेट जारी करना' },
    { role: 'PDI Engineer', person: 'Vikram Malhotra', scope: 'यार्ड में गाड़ियों का फिजिकल इंस्पेक्शन, 7 चेकलिस्ट भरना, फोटो डिफेक्ट्स लॉग करना' },
    { role: 'Yard Supervisor', person: 'Suresh Patil', scope: 'कैरियर अनलोडिंग, ट्रांजिट डैमेज रिपोर्टिंग, यार्ड बे मूवमेंट एवं गेट-इन' },
    { role: 'Sales Consultant', person: 'Anita Joshi', scope: 'कस्टमर बुकिंग एंट्री, PBNA स्टॉक मैचिंग, VIN एलोकेशन, वाउचर प्रिंटिंग' },
    { role: 'Accounts / Gate', person: 'Finance & Security', scope: 'टैक्स इनवॉइस, डिलीवरी चालान जेनरेशन, QR गेटपास वेरिफिकेशन' }
  ];

  roles.forEach((r, idx) => {
    const colIdx = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const x = 0.8 + colIdx * 5.95;
    const y = 1.6 + rowIdx * 1.7;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.75, h: 1.5,
      fill: { color: C.slateLight }, line: { color: C.line, width: 1 },
      rectRadius: 0.1
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25, y: y + 0.2, w: 1.9, h: 0.35,
      fill: { color: C.navy }, line: { width: 0 },
      rectRadius: 0.06
    });
    slide.addText(r.role, {
      x: x + 0.25, y: y + 0.2, w: 1.9, h: 0.35,
      fontSize: 10, fontFace: 'Segoe UI', bold: true, color: C.white,
      align: 'center', valign: 'middle'
    });

    slide.addText(r.person, {
      x: x + 2.3, y: y + 0.2, w: 3.2, h: 0.35,
      fontSize: 11, fontFace: 'Segoe UI', bold: true, color: C.blue, valign: 'middle'
    });

    slide.addText(r.scope, {
      x: x + 0.25, y: y + 0.65, w: 5.25, h: 0.75,
      fontSize: 9.5, fontFace: 'Segoe UI', color: C.inkSub, lineSpacing: 14
    });
  });
}

// ============================================================================
// SLIDE 13: TOP 7 BUSINESS BENEFITS
// ============================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'डीलरशिप को होने वाले शीर्ष 7 व्यापारिक फायदे (Top 7 Business Benefits)', 'Strategic ROI & Value', 13);

  const benefits = [
    { num: '01', title: '100% Transit Claim Recovery', desc: 'अनलोडिंग के समय हुआ कोई भी नुकसान ट्रांसपोर्टर/OEM से तुरंत रिकवर होता है। लाखों रुपये की सीधी बचत।' },
    { num: '02', title: 'Zero Dual-VIN Allocations', desc: 'एक गाड़ी दो ग्राहकों को कभी नहीं जा सकती। मानवीय गलतियाँ और कानूनी विवाद शून्य।' },
    { num: '03', title: '40% Faster Delivery Turnaround', desc: 'पेपरलेस चेकिंग और 1-क्लिक चालान से गाड़ी डिलीवरी का समय 4 दिन से घटकर 24 घंटे रह जाता है।' },
    { num: '04', title: 'Zero Defect Customer Deliveries', desc: 'PDI + QA + Rework प्रक्रिया से हर गाड़ी 100% सही डिलीवर होती है, जिससे कस्टमर सैटिस्फैक्शन 5-स्टार रहता है।' },
    { num: '05', title: 'Theft-Proof Digital Gatepass', desc: 'QR कोडेड सुरक्षा गेटपास के बिना कोई भी गाड़ी यार्ड से बाहर नहीं जा सकती। पूर्ण सुरक्षा।' },
    { num: '06', title: 'Holding Cost Reduction by 25%', desc: 'स्मार्ट PBNA मैचिंग से यार्ड में खड़ी गाड़ियों को तुरंत ग्राहक मिल जाता है, जिससे ब्याज खर्च घटता है।' },
    { num: '07', title: '100% Offline-Ready Resilient Architecture', desc: 'इंटरनेट बंद होने पर भी लोकल LAN DB पर बिना रुके काम चलता है। डीलरशिप का काम कभी बंद नहीं होता।' }
  ];

  benefits.forEach((b, idx) => {
    const colIdx = idx < 4 ? 0 : 1;
    const rowIdx = idx < 4 ? idx : idx - 4;
    const x = 0.8 + colIdx * 5.95;
    const y = 1.6 + rowIdx * 1.25;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.75, h: 1.15,
      fill: { color: C.slateLight }, line: { color: C.line, width: 1 },
      rectRadius: 0.1
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2, y: y + 0.2, w: 0.65, h: 0.65,
      fill: { color: C.blue }, line: { width: 0 },
      rectRadius: 0.08
    });
    slide.addText(b.num, {
      x: x + 0.2, y: y + 0.2, w: 0.65, h: 0.65,
      fontSize: 13, fontFace: 'Segoe UI', bold: true, color: C.white,
      align: 'center', valign: 'middle'
    });

    slide.addText(b.title, {
      x: x + 1.0, y: y + 0.15, w: 4.55, h: 0.3,
      fontSize: 11, fontFace: 'Segoe UI', bold: true, color: C.navy
    });
    slide.addText(b.desc, {
      x: x + 1.0, y: y + 0.45, w: 4.55, h: 0.6,
      fontSize: 9, fontFace: 'Segoe UI', color: C.inkSub, lineSpacing: 13
    });
  });
}

// ============================================================================
// SLIDE 14: SUMMARY & LIVE DEMO URLS
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 0.8, w: 3.5, h: 0.35,
    fill: { color: C.slateDark }, line: { color: C.blue, width: 1.5 },
    rectRadius: 0.08
  });
  slide.addText('DEPLOYED & PRODUCTION READY', {
    x: 0.8, y: 0.8, w: 3.5, h: 0.35,
    fontSize: 9.5, fontFace: 'Segoe UI', bold: true, color: '60A5FA',
    align: 'center', valign: 'middle'
  });

  slide.addText('AutoPrime PDI Platform: आपका संपूर्ण डीलरशिप साथी', {
    x: 0.8, y: 1.35, w: 10.5, h: 0.8,
    fontSize: 28, fontFace: 'Segoe UI', bold: true, color: C.white
  });

  slide.addText('यह सॉफ़्टवेयर आपकी डीलरशिप के समय, पैसे और प्रतिष्ठा की रक्षा करता है। नीचे दी गई लिंक्स पर जाकर तुरंत इसका उपयोग शुरू करें:', {
    x: 0.8, y: 2.15, w: 10.5, h: 0.6,
    fontSize: 12, fontFace: 'Segoe UI', color: '94A3B8'
  });

  const links = [
    { title: 'Web Cockpit (Frontend)', url: 'http://localhost:5173', role: 'मुख्य यूजर इंटरफेस (PDI, Stock, Bookings, Challans)' },
    { title: 'Local DB API Server', url: 'http://localhost:54321/rest/v1', role: 'लोकल LAN डेटाबेस (Offline-Ready Resilience)' },
    { title: 'Cloud Worker API', url: 'http://localhost:8787', role: 'क्लाउड सिंक & ऑथेंटिकेशन इंजन' },
    { title: 'GitHub Master Repository', url: 'https://github.com/Rajni933/pdisoftware.git', role: 'सुरक्षित कोडबेस एवं वर्ज़न कंट्रोल' }
  ];

  links.forEach((l, idx) => {
    const y = 2.9 + idx * 0.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y, w: 11.73, h: 0.8,
      fill: { color: C.slateDark }, line: { color: C.slateMid, width: 1 },
      rectRadius: 0.08
    });
    slide.addText(l.title, {
      x: 1.1, y: y + 0.15, w: 3.5, h: 0.25,
      fontSize: 11.5, fontFace: 'Segoe UI', bold: true, color: '60A5FA'
    });
    slide.addText(l.url, {
      x: 1.1, y: y + 0.42, w: 4.5, h: 0.25,
      fontSize: 9.5, fontFace: 'Segoe UI', color: C.white
    });
    slide.addText(l.role, {
      x: 5.8, y: y + 0.25, w: 6.5, h: 0.35,
      fontSize: 10, fontFace: 'Segoe UI', color: '94A3B8', align: 'right'
    });
  });

  slide.addText('© 2026 AutoPrime Platform  |  Dhoot Group Automotive Systems  |  All Rights Reserved', {
    x: 0.8, y: 6.85, w: 11.73, h: 0.3,
    fontSize: 9.5, fontFace: 'Segoe UI', color: '64748B', align: 'center'
  });
}

// Generate the file
const outputPath = path.resolve('AutoPrime_PDI_Platform_Presentation.pptx');
await pptx.writeFile({ fileName: outputPath });
console.log(`Presentation generated successfully at: ${outputPath}`);
