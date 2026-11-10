// File: api/chat.js  (Vercel serverless function)
// Key comes from the Vercel environment variable GROQ_API_KEY.
const MODELS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b'
];

// ===== ONYX FACTS (edit these as your shop changes) =====
const SHOP_FACTS = `
ABOUT ONYX (only state facts listed here; never invent prices, emails, phone numbers, links, guarantees or discounts):
- Onyx is a tech and digital-product website founded by Raj (RJ), based in Chittagong, Bangladesh.
- Onyx Marketplace sections: Tech Products (Microphones, Headphones, Earbuds, Graphics Cards, PCs, Consoles), SaaS Kits, and Games (still in development).
- Currently in stock: an RGB USB microphone (1 in stock) and over-ear headphones (1 in stock). It works on Windows, Mac, Android, iOS, PS4 and PS5 with one cable and no drivers (microphone).
- Stock is very limited. Once an item is sold, it is gone.
- Payment methods: bKash and Nagad.
- Prices are set by the owner and shown on the Marketplace page. If a price is not shown, tell the user to use "Ask for price" / the Order button on the Marketplace page, or the Contact page.
- Other pages: Updates, About, Contact, FAQ, Reviews, Order Tracking, Wishlist.
- If you do not know something about Onyx, say so and point the user to the Contact page.
`;

const FAQ = [
  [/\b(how (do i|to) (buy|purchase|order)|where (to|can i) buy)\b/i,
   'Open the Marketplace page, choose a product and press Buy/Order. You can pay with bKash or Nagad. If no price is shown yet, use "Ask for price".'],
  [/\b(payment|pay|bkash|nagad)\b/i,
   'Onyx accepts bKash and Nagad.'],
  [/\b(in stock|stock|available)\b/i,
   'Stock is very limited: 1 RGB USB microphone and 1 pair of over-ear headphones are available right now. When they are gone, they are gone.'],
  [/\b(contact|support|email|phone)\b/i,
   'Please use the Contact page on the Onyx website to reach the team.'],
  [/\b(who (made|built|owns|founded)|founder|about onyx|who is raj)\b/i,
   'Onyx is a tech platform founded by Raj (RJ), based in Chittagong, Bangladesh.']
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, system_instruction } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });

    // The page sends "Previous: ...\n\nUser: <latest>" - use only the latest text for FAQ matching
    const latest = String(message).split(/\n\nUser: /).pop().slice(0, 500);

    const reply = (text, meta) => res.status(200).json({
      candidates: [{ content: { parts: [{ text }] } }],
      metadata: meta || {}
    });

    for (const [re, answer] of FAQ) {
      if (re.test(latest)) {
        console.log('ANALYTICS FAQ:', new Date().toISOString(), latest.slice(0, 100));
        return reply(answer, { isFAQ: true });
      }
    }

    const system = (system_instruction || 'You are Syncro, the AI assistant for Onyx.') + '\n' + SHOP_FACTS;
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: String(message).slice(0, 6000) }
    ];

    let lastErr = 'Unknown error';
    for (const model of MODELS) {
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, max_tokens: 700, temperature: 0.7 })
        });
        const data = await r.json().catch(() => ({}));
        const text = data.choices?.[0]?.message?.content;
        if (r.ok && text) {
          console.log('ANALYTICS AI:', new Date().toISOString(), model, latest.slice(0, 100));
          return reply(text, { model });
        }
        lastErr = data.error?.message || ('HTTP ' + r.status);
        if (r.status === 401) break; // bad key: no point trying other models
      } catch (e) { lastErr = e.message; }
    }
    console.error('All models failed:', lastErr);
    return res.status(502).json({ error: 'Syncro is busy right now. Please try again in a moment.' });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
