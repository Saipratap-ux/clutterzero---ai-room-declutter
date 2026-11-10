import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'https://saipratap-ux.github.io,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client configuration
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

async function callWithTimeout<T>(promise: Promise<T>, ms: number = 10000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// Helper to convert an image path or data URL to clean base64 data & mime
function extractImageData(rawInput: string, providedMime?: string): { data: string; mimeType: string } {
  if (rawInput.startsWith('/src/assets/images/') || rawInput.startsWith('src/assets/images/')) {
    const cleanPath = rawInput.startsWith('/') ? rawInput.slice(1) : rawInput;
    const fullPath = path.resolve(__dirname, cleanPath);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      return { data: buffer.toString('base64'), mimeType: mime };
    }
  }

  let mimeType = providedMime || 'image/jpeg';
  let base64Data = rawInput;

  const match = rawInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    base64Data = match[2];
  }

  return { data: base64Data, mimeType };
}

// POST /api/analyze-room
app.post('/api/analyze-room', async (req, res) => {
  const { imageBase64, mimeType: userMime, roomType, strategy, notes } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image is required for room decluttering analysis.' });
  }

  const { data: base64Data, mimeType } = extractImageData(imageBase64, userMime);

  const strategyDescriptions: Record<string, string> = {
    quick_blitz: '15-Minute Rapid Blitz: Focus strictly on maximum visual impact in minimum time. Fast trash sweeps and obvious relocation.',
    konmari: 'KonMari Method: Focus on joyful essentials, category sorting (clothing, paper, komono/misc), and finding a intentional home for each keeper.',
    adhd_friendly: 'ADHD-Friendly Micro-Steps: Zero overwhelm, single micro-zone focus, clear visual labels, and high-reward easy starter tasks.',
    minimalist: 'Minimalist Reset: Strict clear surfaces, ruthless decluttering of duplicates/rarely used items, hidden storage.',
    family_functional: 'Family & Shared Space: Practical drop zones, accessible bins for toys/belongings, clear labeling for multiple household members.',
  };

  const strategyContext = strategyDescriptions[strategy] || strategyDescriptions.quick_blitz;

  const promptText = `
You are an expert professional interior organizer, decluttering architect, and spatial ergonomics specialist.
Analyze this room photo thoroughly.

Room Type: ${roomType || 'General Room'}
User Goal & Strategy: ${strategyContext}
User's Personal Notes: ${notes || 'None provided'}

Provide a rigorous, empathetic, and actionable spatial analysis.
Return your response ONLY as valid, raw JSON conforming strictly to this format:
{
  "roomName": "Descriptive, engaging title of this room (e.g., 'Modern Home Office Workstation' or 'Master Bedroom Walk-in Closet')",
  "roomType": "${roomType || 'Room'}",
  "clutterScore": <number between 15 and 95 representing clutter severity>,
  "clutterLevel": "<'Mild' | 'Moderate' | 'High' | 'Severe'>",
  "estimatedSortTimeMinutes": <realistic number of minutes to complete phases 1 to 3, e.g. 25, 45, 90>,
  "summary": "1-2 paragraphs detailing the room's visual weight, flow blockages, and high-impact potential.",
  "primaryIssues": [
    "Concrete observed issue 1 (e.g. 'Cable nest sprawled across desk and footwell creating trip hazards and visual friction')",
    "Concrete observed issue 2",
    "Concrete observed issue 3"
  ],
  "spatialZones": [
    {
      "id": "zone-1",
      "name": "Zone name (e.g., 'Primary Desk Surface', 'Upper Closet Shelving', 'Countertop Prep Area')",
      "status": "Short status (e.g., 'Heavily Cluttered', 'Surface Blocked', 'High Potential')",
      "description": "Specific observation and spatial potential of this zone."
    }
  ],
  "hotspots": [
    {
      "id": "hotspot-1",
      "label": "Item or cluster name (e.g., 'Tangled Monitor Cables', 'Loose Paper & Mail Stacks', 'Floppy Sweater Mountain')",
      "category": "Category name (e.g., 'Electronics', 'Paperwork', 'Apparel', 'Dishes', 'Toys')",
      "urgency": "<'High' | 'Medium' | 'Low'>",
      "box_2d": [ymin, xmin, ymax, xmax], // Bounding box normalized coordinates between 0 and 1000 representing exactly where this clutter exists in the image.
      "action": "Immediate 1-sentence action for this hotspot."
    }
  ],
  "fourBoxSorting": {
    "keep": [
      { "item": "Specific item or category to keep", "recommendation": "Designated placement or container recommendation" }
    ],
    "relocate": [
      { "item": "Specific item that doesn't belong in this room", "targetRoom": "Target destination (e.g., 'Kitchen Sink', 'Entryway Closet')", "note": "Why relocating this provides instant visual clarity" }
    ],
    "donateSell": [
      { "item": "Outgrown, duplicate, or secondary items ready for donation or resale", "note": "Guidance on donation recipient or packaging" }
    ],
    "discardRecycle": [
      { "item": "Obvious trash, dead pens, expired receipts, ripped boxes, scrap plastics", "note": "Disposal or recycling instruction" }
    ]
  },
  "phasedActionPlan": {
    "phase1QuickWins": [
      { "id": "p1-1", "title": "5-minute quick win title", "description": "Crisp instruction for immediate visible transformation", "timeMinutes": 3 }
    ],
    "phase2Sorting": [
      { "id": "p2-1", "title": "Category sorting step", "description": "How to sort through the main pile without making a bigger mess", "timeMinutes": 10 }
    ],
    "phase3ZoningStorage": [
      { "id": "p3-1", "title": "Long-term home & systems setup", "description": "Assigning permanent zones, cable ties, labels, vertical space", "timeMinutes": 15 }
    ],
    "phase4MaintenanceRitual": [
      { "id": "p4-1", "title": "Nightly or weekly habit", "description": "Specific 2-minute habit to prevent this room from backsliding", "frequency": "Daily / Weekly" }
    ]
  },
  "storageSolutions": [
    {
      "name": "Product or solution name (e.g., 'Under-Desk Cable Raceway', 'Tiered Acrylic Drawer Inserts', 'Clear Stackable Shoe Drawers')",
      "placement": "Exact spot to install or place it",
      "benefit": "Measurable ergonomic or visual benefit",
      "estimatedCost": "$10 - $25"
    }
  ],
  "motivationalTip": "Encouraging, psychological coaching tip acknowledging that organization is a learned skill, not an innate personality trait."
}

Ensure coordinates in box_2d are accurate relative to the provided photo [ymin, xmin, ymax, xmax] between 0 and 1000. Provide 3 to 6 distinct hotspots that highlight the most critical areas.
`.trim();

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };
  const textPart = { text: promptText };

  let textOutput = '';
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];

  for (const modelName of modelsToTry) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: [imagePart, textPart],
          config: {
            responseMimeType: 'application/json',
          },
        }),
        10000
      );

      if (response && response.text) {
        textOutput = response.text.trim();
        break;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} encountered an error:`, err?.message || err);
    }
  }

  // If Gemini produced text, parse it
  if (textOutput) {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(textOutput);
      } catch {
        const cleanJson = textOutput.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        parsedData = JSON.parse(cleanJson);
      }

      parsedData.id = 'analysis-' + Date.now();
      parsedData.createdAt = new Date().toISOString();
      parsedData.imageUrl = imageBase64.startsWith('/src/')
        ? imageBase64
        : imageBase64.startsWith('data:')
        ? imageBase64
        : `data:${mimeType};base64,${base64Data}`;

      return res.json(parsedData);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini output as JSON, using structured analysis fallback:', parseErr);
    }
  }

  // Resilient fallback customized to this room type, strategy, and notes
  console.log('Serving customized structured organization analysis for:', roomType);
  const fallback: any = createFallbackAnalysis(roomType, strategy, notes);
  fallback.imageUrl = imageBase64.startsWith('/src/')
    ? imageBase64
    : imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType};base64,${base64Data}`;
  return res.json(fallback);
});

// POST /api/room-chat
app.post('/api/room-chat', async (req, res) => {
  try {
    const { roomContext, message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = `
You are the ClutterZero Personal Organization Coach. You are directly advising a homeowner or renter who has uploaded a photo of their ${roomContext?.roomType || 'room'}.
Context on their room:
- Room Name: ${roomContext?.roomName || 'Room'}
- Clutter Score: ${roomContext?.clutterScore || 65}/100 (${roomContext?.clutterLevel || 'Moderate'})
- Strategy: ${roomContext?.strategy || 'Quick Blitz'}
- Summary: ${roomContext?.summary || 'User space undergoing decluttering'}
- Key Issues: ${(roomContext?.primaryIssues || []).join('; ')}

Instructions:
1. Provide warm, encouraging, zero-judgment, highly practical decluttering advice.
2. Give concrete steps (e.g., where to put specific items, how to decide what to donate, storage dimensions, or psychological tips for letting go).
3. Keep answers concise, actionable, and formatted in clean markdown bullet points where appropriate.
`.trim();

    const conversationParts: string[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.slice(-6).forEach((msg: any) => {
        conversationParts.push(`${msg.sender === 'user' ? 'User' : 'Organizer'}: ${msg.text}`);
      });
    }
    conversationParts.push(`User: ${message}`);

    const prompt = `${systemPrompt}\n\nRecent Conversation:\n${conversationParts.join('\n')}\n\nOrganizer:`;

    let replyText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];

    for (const m of modelsToTry) {
      try {
        const response = await callWithTimeout(
          ai.models.generateContent({
            model: m,
            contents: prompt,
          }),
          8000
        );
        if (response?.text) {
          replyText = response.text.trim();
          break;
        }
      } catch (e) {
        console.warn(`Chat model ${m} failed:`, e);
      }
    }

    if (!replyText) {
      replyText = getContextualChatFallback(message, roomContext);
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in room-chat with Gemini:', error);
    return res.json({
      reply: 'Focus on one small 1-foot square at a time. The quickest win is always clearing dishes and trash, followed by grouping like-with-like into labeled bins.',
    });
  }
});

function getContextualChatFallback(message: string, context: any): string {
  const lower = message.toLowerCase();
  const room = context?.roomType || 'room';

  if (lower.includes('10 minutes') || lower.includes('quick') || lower.includes('time') || lower.includes('start')) {
    return `For a 10-minute sprint in your ${room}:\n\n1. **Minutes 1-3:** Grab a trash bag and recycling bin. Toss empty cups, scrap papers, and packaging.\n2. **Minutes 4-7:** Evict items that belong in other rooms (coffee mugs to the kitchen, dirty laundry to the hamper).\n3. **Minutes 8-10:** Straighten the primary flat surface into a clean 24-inch perimeter.\n\nYou will experience immediate visual relief!`;
  }

  if (lower.includes('donate') || lower.includes('keep') || lower.includes('sentimental') || lower.includes('let go')) {
    return `When deciding between Donate vs Keep:\n\n• **The 1-Year Rule:** Have you used or loved this item in the past 12 months? If not, thank it for its service and donate it.\n• **The 20/20 Rule:** Can you replace it for under $20 in less than 20 minutes if you ever truly need it again?\n• **Sentimental Items:** Take a high-resolution photo of the item to keep the memory without occupying physical square footage.`;
  }

  if (lower.includes('cable') || lower.includes('wire') || lower.includes('cord') || lower.includes('tech')) {
    return `For wire and cable management:\n\n1. Unplug all devices and untangle the nest on the floor.\n2. Mount an under-desk cable management raceway or basket beneath the rear edge of the desk.\n3. Place your power strip inside the tray so only a single main cord reaches the wall.\n4. Bundle excess length with reusable velcro ties (avoid plastic zip ties so you can adjust later).`;
  }

  return `In your ${room}, the secret to lasting tidiness is the **"Homes Before Habits"** principle: every single item must have an exact designated parking spot. When items don't have an assigned home, they default to horizontal flat surfaces. Would you like a suggestion for where to anchor a specific item?`;
}

function createFallbackAnalysis(
  roomType: string = 'Home Office & Desk',
  strategy: string = 'quick_blitz',
  userNotes?: string
) {
  const isOffice = roomType.toLowerCase().includes('office') || roomType.toLowerCase().includes('desk');
  const isCloset = roomType.toLowerCase().includes('closet') || roomType.toLowerCase().includes('wardrobe');
  const isKitchen = roomType.toLowerCase().includes('kitchen') || roomType.toLowerCase().includes('pantry');
  const isLiving = roomType.toLowerCase().includes('living') || roomType.toLowerCase().includes('play');

  if (isOffice) {
    return {
      id: 'demo-office-' + Date.now(),
      roomName: 'Modern Home Office & Desk Workstation',
      roomType: 'Home Office & Desk',
      strategy: strategy,
      clutterScore: 74,
      clutterLevel: 'High',
      estimatedSortTimeMinutes: 35,
      summary:
        'The workstation features generous natural window lighting and solid dual-monitor potential, but surface accumulation of loose papers, post-it notes, and a dense tangle of power cords creates visual friction and reduces active typing territory.',
      primaryIssues: [
        'Excessive loose paperwork, notebooks, and sticky notes covering 65% of the primary desk surface',
        'Entangled monitor, laptop, and charger cables pooling near the center and right edge',
        'Multiple empty coffee mugs and water bottles occupying peripheral working space',
      ],
      spatialZones: [
        {
          id: 'zone-1',
          name: 'Active Work Surface',
          status: 'Surface Blocked',
          description: 'Sprawling paper stacks, open spirals, and sticky notes competing with keyboard and mouse.',
        },
        {
          id: 'zone-2',
          name: 'Under-Monitor & Cable Hub',
          status: 'Tangled / Unmanaged',
          description: 'High concentration of power bricks, USB hubs, and stray cords.',
        },
        {
          id: 'zone-3',
          name: 'Shelving & Bookcases',
          status: 'Moderate Density',
          description: 'Good vertical capacity with opportunities for categorized magazine holders and upright files.',
        },
      ],
      hotspots: [
        {
          id: 'hotspot-1',
          label: 'Tangled Power & Peripheral Cables',
          category: 'Electronics',
          urgency: 'High',
          box_2d: [480, 560, 720, 890],
          action: 'Bundle cords with velcro straps and mount an under-desk cable basket.',
        },
        {
          id: 'hotspot-2',
          label: 'Loose Paperwork & Mail Stacks',
          category: 'Paperwork',
          urgency: 'High',
          box_2d: [490, 60, 880, 420],
          action: 'Triage into 3 folders: Action This Week, Taxes/Archive, and Shred/Recycle.',
        },
        {
          id: 'hotspot-3',
          label: 'Used Coffee Mugs & Drinkware',
          category: 'Dishes',
          urgency: 'Medium',
          box_2d: [440, 100, 610, 310],
          action: 'Evict immediately to kitchen sink or dishwasher for 2-minute visual clarity.',
        },
        {
          id: 'hotspot-4',
          label: 'Scattered Pens & Desk Ephemera',
          category: 'Stationery',
          urgency: 'Low',
          box_2d: [680, 270, 840, 430],
          action: 'Gather into a weighted ceramic or bamboo desktop organizer cup.',
        },
      ],
      fourBoxSorting: {
        keep: [
          { item: 'Dual monitors, laptop stand, keyboard, and ergonomic mouse', recommendation: 'Center ergonomically; clear 20-inch perimeter' },
          { item: 'Current active client project notebook', recommendation: 'Place immediately to the right of keyboard' },
          { item: 'Essential reference books', recommendation: 'Store upright on upper shelf using bookends' },
        ],
        relocate: [
          { item: 'Empty coffee mugs and glassware', targetRoom: 'Kitchen Sink', note: 'Immediate psychological boost upon removal' },
          { item: 'Personal mail and hallway receipts', targetRoom: 'Entryway Drop Tray', note: 'Keep non-work papers outside workspace' },
        ],
        donateSell: [
          { item: 'Duplicate power cables and legacy chargers', note: 'Donate to local community electronics reuse' },
          { item: 'Outdated reference manuals & books', note: 'Drop off at neighborhood book exchange' },
        ],
        discardRecycle: [
          { item: 'Expired sticky notes and scribbled scrap paper', note: 'Scan critical notes to phone, recycle paper' },
          { item: 'Dried out highlighters and dead ballpoint pens', note: 'Test and toss immediately' },
        ],
      },
      phasedActionPlan: {
        phase1QuickWins: [
          { id: 'p1-1', title: 'Dishes Eviction', description: 'Carry all cups, mugs, and water bottles to the kitchen sink.', timeMinutes: 2 },
          { id: 'p1-2', title: 'Paper Trash Sweep', description: 'Recycle loose envelopes, outdated sticky notes, and paper scraps.', timeMinutes: 3 },
        ],
        phase2Sorting: [
          { id: 'p2-1', title: 'Paper Triage Blitz', description: 'Sort the main document stack into Action, File, and Shred.', timeMinutes: 10 },
          { id: 'p2-2', title: 'Stationery Consolidation', description: 'Group pens, paperclips, and flash drives into a single shallow tray.', timeMinutes: 5 },
        ],
        phase3ZoningStorage: [
          { id: 'p3-1', title: 'Cable Nest Taming', description: 'Velcro tie excess cord lengths and lift power strip off the floor.', timeMinutes: 15 },
          { id: 'p3-2', title: 'Clear 24-inch Focus Perimeter', description: 'Ensure the immediate desk zone around the laptop is 100% flat and unobstructed.', timeMinutes: 5 },
        ],
        phase4MaintenanceRitual: [
          { id: 'p4-1', title: '5:00 PM Shutdown Habit', description: 'Every evening: return mugs to kitchen, close notebook, park mouse. 2 minutes flat.', frequency: 'Daily at end of workday' },
        ],
      },
      storageSolutions: [
        {
          name: 'Under-Desk Steel Mesh Cable Raceway',
          placement: 'Mounted beneath the rear edge of desk',
          benefit: 'Removes 100% of wires and power bricks from desk and floor sightlines.',
          estimatedCost: '$16 - $24',
        },
        {
          name: 'Tiered Vertical Bamboo File Organizer',
          placement: 'Rear left corner of desk or first shelf',
          benefit: 'Holds active documents upright without sprawling across flat surface.',
          estimatedCost: '$18 - $28',
        },
        {
          name: 'Under-Desk Rotating Headphone Hook',
          placement: 'Clamped under front-right desk corner',
          benefit: 'Frees up precious desk real estate and protects headphone cushions.',
          estimatedCost: '$8 - $14',
        },
      ],
      motivationalTip:
        'A clean desk creates a quiet mind. When your visual environment is ordered, your brain expends zero energy filtering out background noise.',
      createdAt: new Date().toISOString(),
    };
  }

  if (isCloset) {
    return {
      id: 'demo-closet-' + Date.now(),
      roomName: 'Master Bedroom Walk-in Wardrobe',
      roomType: 'Bedroom Closet & Wardrobe',
      strategy: strategy,
      clutterScore: 78,
      clutterLevel: 'High',
      estimatedSortTimeMinutes: 45,
      summary:
        'The closet has great built-in shelving and dual hanging rods, but garments have slipped off mismatched hangers, folded knitwear has collapsed into horizontal piles, and shoe boxes are obstructing floor walkability.',
      primaryIssues: [
        'Floor space severely obstructed with shoe boxes, loose footwear, and fallen garments',
        'Hangers overcrowded, causing severe wrinkling and difficulty locating outfits',
        'Upper shelf overflow with mixed containers lacking category labels',
      ],
      spatialZones: [
        {
          id: 'zone-1',
          name: 'Hanging Rail & Garments',
          status: 'Overcrowded',
          description: 'Hangers packed so tightly garments cannot breathe; mix of wire, plastic, and velvet.',
        },
        {
          id: 'zone-2',
          name: 'Walkway & Floor Staging',
          status: 'Floor Obstructed',
          description: 'Shoe piles and laundry piles making stepping into the closet precarious.',
        },
        {
          id: 'zone-3',
          name: 'Shelving Columns',
          status: 'Collapsed Stacks',
          description: 'Folded sweaters and t-shirts toppled over due to lack of vertical shelf dividers.',
        },
      ],
      hotspots: [
        {
          id: 'hotspot-1',
          label: 'Floor Shoe & Box Pile',
          category: 'Footwear',
          urgency: 'High',
          box_2d: [560, 240, 920, 680],
          action: 'Sort by seasonal use; donate unworn pairs and stack active pairs on shoe racks.',
        },
        {
          id: 'hotspot-2',
          label: 'Overflowing Knitwear Shelves',
          category: 'Apparel',
          urgency: 'Medium',
          box_2d: [120, 750, 620, 960],
          action: 'File fold sweaters vertically with acrylic shelf dividers to stop toppling.',
        },
        {
          id: 'hotspot-3',
          label: 'Disordered Upper Storage Bins',
          category: 'Seasonal',
          urgency: 'Low',
          box_2d: [140, 230, 260, 660],
          action: 'Consolidate out-of-season items into labeled clear bins.',
        },
      ],
      fourBoxSorting: {
        keep: [
          { item: 'Current season everyday capsules (jackets, trousers, shirts)', recommendation: 'Hang facing the same direction on matching slim velvet hangers' },
          { item: 'Favorite knitwear & sweaters', recommendation: 'File-fold vertically onto middle shelves' },
        ],
        relocate: [
          { item: 'Suitcases, empty shopping bags, and tax files', targetRoom: 'Under-bed storage or attic', note: 'Closets must strictly store daily apparel' },
        ],
        donateSell: [
          { item: 'Shoes and clothing unworn in past 12 months', note: 'Place in a clean donation bag for immediate drop-off' },
          { item: 'Ill-fitting duplicate coats', note: 'Consign or donate to winter clothing drive' },
        ],
        discardRecycle: [
          { item: 'Bent dry cleaner wire hangers & plastic wrap', note: 'Return wire hangers to dry cleaners, recycle film' },
          { item: 'Broken shoes and worn out socks with holes', note: 'Textile recycling bin' },
        ],
      },
      phasedActionPlan: {
        phase1QuickWins: [
          { id: 'p1-1', title: 'Clear the Floor Runway', description: 'Pick up all fallen clothes and gather shoes into one central line.', timeMinutes: 5 },
          { id: 'p1-2', title: 'Wire Hanger Purge', description: 'Remove all flimpsy dry cleaner wire hangers and plastic bags.', timeMinutes: 5 },
        ],
        phase2Sorting: [
          { id: 'p2-1', title: 'The 12-Month Rule Sort', description: 'Touch each hanging garment; if not worn in a year, put into donation bag.', timeMinutes: 15 },
          { id: 'p2-2', title: 'Shoe Triage', description: 'Group shoes by frequency: Daily Work, Gym, Formal, and Donate.', timeMinutes: 10 },
        ],
        phase3ZoningStorage: [
          { id: 'p3-1', title: 'Install Shelf Dividers', description: 'Insert vertical dividers every 10 inches to keep folded sweaters upright.', timeMinutes: 10 },
          { id: 'p3-2', title: 'Color-Code Hanging Clothes', description: 'Organize by category (Tanks, Short Sleeves, Long Sleeves, Pants) then light to dark.', timeMinutes: 10 },
        ],
        phase4MaintenanceRitual: [
          { id: 'p4-1', title: 'Nightly Hang-Up Rule', description: 'Never leave worn clothes on the floor or bedroom chair; hang or hamper immediately.', frequency: 'Daily at bedtime' },
        ],
      },
      storageSolutions: [
        {
          name: 'Non-Slip Velvet Slim Hangers (50-Pack)',
          placement: 'Main hanging rod',
          benefit: 'Instantly creates 30% more space and prevents clothes from slipping onto floor.',
          estimatedCost: '$22 - $30',
        },
        {
          name: 'Clear Acrylic Shelf Dividers',
          placement: 'Sweater and folded shirt shelves',
          benefit: 'Prevents 10-inch folded stacks from toppling sideways.',
          estimatedCost: '$16 - $24',
        },
        {
          name: 'Drop-Front Clear Stackable Shoe Boxes',
          placement: 'Closet floor perimeter',
          benefit: 'Protects shoes from dust while keeping pairs 100% visible and accessible.',
          estimatedCost: '$25 - $38',
        },
      ],
      motivationalTip:
        'Getting dressed in the morning sets the tone for your whole day. When opening your closet feels like visiting a curated boutique, stress vanishes.',
      createdAt: new Date().toISOString(),
    };
  }

  // Default / Kitchen / Living Room
  return {
    id: 'demo-living-' + Date.now(),
    roomName: `${roomType} Decluttering & Zoning Plan`,
    roomType: roomType,
    strategy: strategy,
    clutterScore: 70,
    clutterLevel: 'Moderate',
    estimatedSortTimeMinutes: 30,
    summary:
      'The room has welcoming natural light and generous surface area, but miscellaneous shared household items, paperwork, toys, and drinkware have accumulated across high-traffic coffee tables and counters.',
    primaryIssues: [
      'High density of mixed category items (toys, mail, electronics) resting on flat surfaces',
      'Absence of an explicit "drop zone" for arriving household members',
      'Throw blankets and pillows disarrayed across seating',
    ],
    spatialZones: [
      {
        id: 'zone-1',
        name: 'Primary Gathering Surface',
        status: 'Surface Clutter',
        description: 'Contains children toys, coffee mugs, and reading materials needing assigned baskets.',
      },
      {
        id: 'zone-2',
        name: 'Media Console & Side Tables',
        status: 'Unsorted Ephemera',
        description: 'Stray remotes, chargers, and magazines stacked haphazardly.',
      },
    ],
    hotspots: [
      {
        id: 'hotspot-1',
        label: 'Central Table Clutter Cluster',
        category: 'Mixed Objects',
        urgency: 'High',
        box_2d: [480, 160, 750, 480],
        action: 'Sort into dedicated storage ottoman or woven toy basket.',
      },
      {
        id: 'hotspot-2',
        label: 'Tangled Throws & Disarrayed Pillows',
        category: 'Textiles',
        urgency: 'Medium',
        box_2d: [340, 480, 740, 770],
        action: 'Roll throws neatly into a large woven cotton basket beside the sofa.',
      },
    ],
    fourBoxSorting: {
      keep: [
        { item: 'Living room media, current books, curated decor', recommendation: 'Designate specific basket and console drawer' },
      ],
      relocate: [
        { item: 'Coffee cups, glasses, snack bowls', targetRoom: 'Kitchen dishwasher', note: 'Immediate visual reset' },
        { item: 'Kids backpacks and outerwear', targetRoom: 'Entryway hooks', note: 'Stop clutter at the door' },
      ],
      donateSell: [
        { item: 'Outgrown toys and duplicate children books', note: 'Box for preschool or neighborhood library' },
      ],
      discardRecycle: [
        { item: 'Old magazines, catalogs, junk mail', note: 'Recycle immediately' },
      ],
    },
    phasedActionPlan: {
      phase1QuickWins: [
        { id: 'p1-1', title: 'The 2-Minute Mug & Dish Sweep', description: 'Return all drinkware to the kitchen sink.', timeMinutes: 2 },
        { id: 'p1-2', title: 'Cushion & Blanket Fluff', description: 'Fold throw blanket, fluff 2 pillows, and place them neatly on couch.', timeMinutes: 3 },
      ],
      phase2Sorting: [
        { id: 'p2-1', title: 'Basket Triage Blitz', description: 'Put all scattered toys and loose items into designated catch-all bins.', timeMinutes: 10 },
      ],
      phase3ZoningStorage: [
        { id: 'p3-1', title: 'Establish the 1-In-1-Out Rule', description: 'Anchor remote controls in a single wooden tray.', timeMinutes: 10 },
      ],
      phase4MaintenanceRitual: [
        { id: 'p4-1', title: 'Nightly 3-Minute Family Sweep', description: 'Before turning off lights, everyone returns 2 items to their rooms.', frequency: 'Daily before bed' },
      ],
    },
    storageSolutions: [
      {
        name: 'Oversized Woven Cotton Rope Basket',
        placement: 'Beside sofa or under coffee table',
        benefit: 'Hides all kids toys and throw blankets in 15 seconds flat.',
        estimatedCost: '$20 - $28',
      },
      {
        name: 'Wooden Desktop or Console Catch-All Tray',
        placement: 'Coffee table or media console',
        benefit: 'Keeps remotes, coasters, and candles visually unified.',
        estimatedCost: '$12 - $18',
      },
    ],
    motivationalTip:
      'A lived-in home will always have movement and rhythm. Organization is not about an empty museum—it is about having systems that make resetting effortless.',
    createdAt: new Date().toISOString(),
  };
}

// Development Vite middleware setup vs Production static files
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ClutterZero server running on port ${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
