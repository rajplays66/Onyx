// ============================================================
// SYNCRO AI — Full Featured Chat  |  RJSyncro
// Features: conversation memory, markdown, typewriter effect,
//           quick replies, timestamps, clear chat, scroll-to-bottom,
//           rate limiting, friendly error fallback, keyboard fix
// ============================================================

const API_URL = '/api/chat';
const LOGO_URL = 'https://i.ibb.co/JjZPmBpV/Picsart-26-04-22-09-03-55-835.jpg';

// ── Website Knowledge ────────────────────────────────────────
const WEBSITE_KNOWLEDGE = {
    products: [
        { name: "Web Templates",      price: "$49-$199",    description: "Professional, responsive website templates for businesses", category: "Templates" },
        { name: "SaaS Starter Kit",   price: "$299",        description: "Complete SaaS boilerplate with authentication, payments, and admin panel", category: "Development" },
        { name: "AI Chat System",     price: "$199 one-time", description: "Customizable AI assistant system (like this one!)", category: "AI" },
        { name: "Custom Development", price: "Custom quote", description: "Tailored web applications and solutions", category: "Services" }
    ],
    blogPosts: [
        { title: "The Future of Web Development in 2024", category: "Technology", date: "March 15, 2024", readTime: "5 min", excerpt: "Exploring the latest trends, frameworks, and tools shaping web development" },
        { title: "Dark UI Patterns That Actually Work",   category: "Design",      date: "March 10, 2024", readTime: "7 min", excerpt: "Deep dive into effective dark mode user interface patterns enhancing user experience" },
        { title: "Minimalism in Digital Workspaces",     category: "Productivity", date: "March 5, 2024",  readTime: "6 min", excerpt: "How adopting minimalist principles can dramatically boost digital productivity" }
    ],
    companyInfo: {
        name: "RJSyncro", founder: "Raj (RJ)", role: "Software developer, tech researcher",
        location: "Chittagong, Bangladesh", email: "rajplays66@gmail.com",
        stats: { articles: "42+", readers: "5K+ monthly", years: "3 years writing" },
        expertise: ["Trust", "AI & Future", "Productivity", "Technology", "Customer comfort", "Fashionable Gadgets"],
        tagline: "Syncing ideas across technology, design, and creative life",
        mission: "Syncing technology, creativity, and thoughts"
    }
};

function buildSystemInstruction() {
    const c = WEBSITE_KNOWLEDGE.companyInfo;
    let s = `You are Syncro, the friendly AI assistant for RJSyncro. Format your responses using markdown: use **bold** for emphasis, bullet points for lists, and \`code\` for technical terms.\n\n`;
    s += `=== WEBSITE KNOWLEDGE ===\n`;
    s += `COMPANY: ${c.name} | Tagline: "${c.tagline}" | Mission: ${c.mission}\n`;
    s += `Founder: ${c.founder} (${c.role}) | Location: ${c.location} | Email: ${c.email}\n`;
    s += `Stats: ${c.stats.articles} articles, ${c.stats.readers} readers, ${c.stats.years}\n`;
    s += `Expertise: ${c.expertise.join(', ')}\n\n`;
    s += `PRODUCTS:\n`;
    WEBSITE_KNOWLEDGE.products.forEach(p => s += `- ${p.name}: ${p.price} — ${p.description}\n`);
    s += `\nLATEST BLOG POSTS:\n`;
    WEBSITE_KNOWLEDGE.blogPosts.forEach(p => s += `- "${p.title}" (${p.category}, ${p.date}, ${p.readTime}): ${p.excerpt}\n`);
    s += `\n=== YOUR ROLE ===\nBe professional, friendly and helpful. Always use the knowledge above. For contact share: rajplays66@gmail.com\n`;
    return s;
}

const SYSTEM_INSTRUCTION = buildSystemInstruction();

// ── Conversation Memory ──────────────────────────────────────
let conversationHistory = [];

// ── Rate Limiting ────────────────────────────────────────────
let messageCount = 0;
let rateLimitTimer = null;
const RATE_LIMIT = 5; // max messages per window
const RATE_WINDOW = 15000; // 15 seconds

function checkRateLimit() {
    messageCount++;
    if (messageCount >= RATE_LIMIT) {
        setInputDisabled(true, '⏳ Slow down a bit...');
        clearTimeout(rateLimitTimer);
        rateLimitTimer = setTimeout(() => {
            messageCount = 0;
            setInputDisabled(false, 'Ask Syncro anything...');
        }, RATE_WINDOW);
        return false;
    }
    return true;
}

function setInputDisabled(disabled, placeholder) {
    userInput.disabled = disabled;
    sendButton.disabled = disabled;
    userInput.placeholder = placeholder;
    sendButton.style.opacity = disabled ? '0.5' : '1';
}

// ── DOM Elements ─────────────────────────────────────────────
const chatMessages  = document.getElementById('chatMessages');
const userInput     = document.getElementById('userInput');
const sendButton    = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const scrollBtn     = document.getElementById('scrollBottomBtn');
const clearBtn      = document.getElementById('clearChatBtn');

// ── Scroll-to-bottom button ──────────────────────────────────
chatMessages.addEventListener('scroll', () => {
    const distFromBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
    if (scrollBtn) scrollBtn.style.opacity = distFromBottom > 100 ? '1' : '0';
});

if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    });
}

// ── Clear Chat ───────────────────────────────────────────────
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (!confirm('Clear this conversation?')) return;
        chatMessages.innerHTML = '';
        conversationHistory = [];
        messageCount = 0;
        showWelcome();
    });
}

// ── Send to AI (with conversation history) ───────────────────
async function sendToAI(message) {
    showTyping();

    // Add user turn to history
    conversationHistory.push({ role: 'user', content: message });

    // Keep history manageable (last 20 turns)
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: conversationHistory,
                system_instruction: SYSTEM_INSTRUCTION
            })
        });

        if (!response.ok) throw new Error(`${response.status}`);

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
            || data.error
            || "I received an unexpected response.";

        // Add assistant turn to history
        conversationHistory.push({ role: 'assistant', content: reply });
        return reply;

    } catch (error) {
        console.error('AI Error:', error);
        return `😔 Oops! Something went wrong on my end. Please try again in a moment.\n\n*(Error: ${error.message})*`;
    } finally {
        hideTyping();
    }
}

// ── Markdown Renderer (lightweight) ─────────────────────────
function renderMarkdown(text) {
    let html = text
        // Escape HTML first
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Bullet lists
        .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
        // Numbered lists
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        // Line breaks (but not inside pre blocks)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Make URLs clickable
    html = html.replace(/(https?:\/\/[^\s<>"]+)/g, url =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`
    );

    return `<p>${html}</p>`;
}

// ── Typewriter Effect ────────────────────────────────────────
function typewriterEffect(contentDiv, html, onDone) {
    // Strip HTML tags to get plain chars, then re-render gradually
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.innerText;
    let i = 0;
    contentDiv.innerHTML = '';

    function tick() {
        if (i < plainText.length) {
            i += Math.floor(Math.random() * 3) + 1; // 1-3 chars per tick for speed
            const partial = plainText.slice(0, i);
            contentDiv.innerHTML = `<p>${partial.replace(/\n/g, '<br>')}</p>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            setTimeout(tick, 18);
        } else {
            // Show full rendered markdown when done
            contentDiv.innerHTML = html;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (onDone) onDone();
        }
    }
    tick();
}

// ── Timestamps ───────────────────────────────────────────────
function getTimeLabel() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Add Message ──────────────────────────────────────────────
function addMessage(text, sender, useTypewriter = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    if (sender === 'bot') {
        const avatarImg = document.createElement('img');
        avatarImg.src = LOGO_URL;
        avatarImg.alt = 'Syncro AI';
        avatarImg.className = 'ai-logo';
        avatarImg.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:50%;display:block;';
        avatarDiv.style.cssText = 'width:42px;height:42px;min-width:42px;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 10px rgba(255,215,0,0.35);margin-right:10px;background:#1a1400;padding:2px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
        avatarDiv.appendChild(avatarImg);
    } else {
        avatarDiv.innerHTML = '👤';
        avatarDiv.style.cssText = 'width:38px;height:38px;min-width:38px;border-radius:50%;background:#1a3a6e;border:1.5px solid rgba(100,140,220,0.4);margin-left:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;';
    }

    // Content wrapper (includes text + timestamp)
    const wrapDiv = document.createElement('div');
    wrapDiv.className = 'message-wrap';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getTimeLabel();

    wrapDiv.appendChild(contentDiv);
    wrapDiv.appendChild(timeDiv);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(wrapDiv);
    chatMessages.appendChild(messageDiv);

    const rendered = renderMarkdown(text);

    if (sender === 'bot' && useTypewriter) {
        typewriterEffect(contentDiv, rendered);
    } else {
        contentDiv.innerHTML = rendered;
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    return contentDiv;
}

// ── Quick Reply Buttons ──────────────────────────────────────
const QUICK_REPLIES = [
    { label: '🏢 What is RJSyncro?',    text: 'What is RJSyncro?' },
    { label: '🛍️ Your products',         text: 'What products does RJSyncro offer?' },
    { label: '✍️ Latest blog posts',      text: 'What are the latest blog posts?' },
    { label: '📬 Contact Raj',            text: 'How can I contact Raj?' },
];

function showQuickReplies() {
    const existing = document.getElementById('quickReplies');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'quickReplies';
    container.className = 'quick-replies';

    QUICK_REPLIES.forEach(({ label, text }) => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => {
            container.remove();
            handleSend(text);
        });
        container.appendChild(btn);
    });

    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Welcome Message ──────────────────────────────────────────
function showWelcome() {
    setTimeout(() => {
        if (chatMessages.children.length === 0) {
            addMessage(
                "Hello! I'm **Syncro**, the AI assistant for **RJSyncro**. 👋\n\n" +
                "I can answer questions about this tech platform, its products, blog posts, and more.\n\n" +
                "How can I help you today?",
                'bot',
                true
            );
            setTimeout(showQuickReplies, 900);
        }
    }, 500);
}

// ── Handle Send ──────────────────────────────────────────────
async function handleSend(overrideText) {
    const message = overrideText || userInput.value.trim();
    if (!message) return;

    // Remove quick replies if still visible
    const qr = document.getElementById('quickReplies');
    if (qr) qr.remove();

    if (!overrideText) userInput.value = '';

    if (!checkRateLimit()) {
        addMessage('⏳ You\'re sending messages too fast! Please wait a moment before trying again.', 'bot');
        return;
    }

    addMessage(message, 'user');
    const reply = await sendToAI(message);
    addMessage(reply, 'bot', true);
    userInput.focus();
}

sendButton.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
});

// ── Mobile Keyboard Fix ──────────────────────────────────────
function fixViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', fixViewportHeight);
window.addEventListener('orientationchange', () => setTimeout(fixViewportHeight, 200));
fixViewportHeight();

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (userInput) userInput.focus();
    showWelcome();
});

// ── External link handler ────────────────────────────────────
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-link')) {
        e.preventDefault();
        window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
});

window.updateWebsiteKnowledge = (d) => { Object.assign(WEBSITE_KNOWLEDGE, d); console.log('Knowledge updated!'); };
window.getCurrentKnowledge = () => WEBSITE_KNOWLEDGE;
