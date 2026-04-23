// ============================================================
// SYNCRO AI — Full Featured Chat  |  Onyx
// ============================================================

const API_URL = '/api/chat';
const LOGO_URL = 'https://i.ibb.co/jkd25QLn/Picsart-26-04-23-10-12-58-459.png';

// ── Website Knowledge ────────────────────────────────────────
const WEBSITE_KNOWLEDGE = {
    products: [
        { name: "Web Templates",      price: "$49-$199",      description: "Professional, responsive website templates for businesses" },
        { name: "SaaS Starter Kit",   price: "$299",          description: "Complete SaaS boilerplate with authentication, payments, and admin panel" },
        { name: "AI Chat System",     price: "$199 one-time", description: "Customizable AI assistant system (like this one!)" },
        { name: "Custom Development", price: "Custom quote",  description: "Tailored web applications and solutions" }
    ],
    blogPosts: [
        { title: "The Future of Web Development in 2024", category: "Technology", date: "March 15, 2024", readTime: "5 min" },
        { title: "Dark UI Patterns That Actually Work",   category: "Design",      date: "March 10, 2024", readTime: "7 min" },
        { title: "Minimalism in Digital Workspaces",     category: "Productivity", date: "March 5, 2024",  readTime: "6 min" }
    ],
    companyInfo: {
        name: "Onyx",
        founder: "Raj (RJ)",
        role: "Software developer, tech researcher",
        location: "Chittagong, Bangladesh",
        email: "rajplays66@gmail.com",
        expertise: ["Trust", "AI & Future", "Productivity", "Technology", "Customer comfort", "Fashionable Gadgets"],
        tagline: "Syncing ideas across technology, design, and creative life"
    }
};

function buildSystemInstruction() {
    const c = WEBSITE_KNOWLEDGE.companyInfo;
    let s = `You are Syncro, the friendly AI assistant for Onyx. Use markdown in responses: **bold**, bullet points, \`code\`.\n\n`;
    s += `COMPANY: ${c.name} | Founder: ${c.founder} (${c.role}) | Location: ${c.location} | Email: ${c.email}\n`;
    s += `Tagline: "${c.tagline}"\n`;
    s += `Expertise: ${c.expertise.join(', ')}\n\nPRODUCTS:\n`;
    WEBSITE_KNOWLEDGE.products.forEach(p => s += `- ${p.name}: ${p.price} — ${p.description}\n`);
    s += `\nBLOG POSTS:\n`;
    WEBSITE_KNOWLEDGE.blogPosts.forEach(p => s += `- "${p.title}" (${p.category}, ${p.date}, ${p.readTime})\n`);
    s += `\nBe professional, friendly and helpful. For contact: rajplays66@gmail.com\n`;
    return s;
}

const SYSTEM_INSTRUCTION = buildSystemInstruction();
let conversationHistory = [];
let messageCount = 0;
let rateLimitTimer = null;

// ── Everything runs after DOM is ready ───────────────────────
document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const chatMessages    = document.getElementById('chatMessages');
    const userInput       = document.getElementById('userInput');
    const sendButton      = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const scrollBtn       = document.getElementById('scrollBottomBtn');
    const clearBtn        = document.getElementById('clearChatBtn');

    // ── Rate Limiting ────────────────────────────────────────
    function checkRateLimit() {
        messageCount++;
        if (messageCount >= 5) {
            setInputDisabled(true, '⏳ Slow down a bit...');
            clearTimeout(rateLimitTimer);
            rateLimitTimer = setTimeout(() => {
                messageCount = 0;
                setInputDisabled(false, 'Ask Syncro anything...');
            }, 15000);
            return false;
        }
        return true;
    }

    function setInputDisabled(disabled, placeholder) {
        if (userInput)  { userInput.disabled = disabled; userInput.placeholder = placeholder; }
        if (sendButton) { sendButton.disabled = disabled; sendButton.style.opacity = disabled ? '0.5' : '1'; }
    }

    // ── Scroll to bottom button ──────────────────────────────
    if (chatMessages && scrollBtn) {
        chatMessages.addEventListener('scroll', () => {
            const dist = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
            scrollBtn.style.opacity = dist > 100 ? '1' : '0';
        });
        scrollBtn.addEventListener('click', () => {
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        });
    }

    // ── Clear Chat ───────────────────────────────────────────
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Clear this conversation?')) return;
            if (chatMessages) chatMessages.innerHTML = '';
            conversationHistory = [];
            messageCount = 0;
            showWelcome();
        });
    }

    // ── Send to AI ───────────────────────────────────────────
    async function sendToAI(message) {
        showTyping();

        // Bake history into message for context
        let contextMessage = message;
        if (conversationHistory.length > 0) {
            const historyText = conversationHistory
                .slice(-10)
                .map(m => `${m.role === 'user' ? 'User' : 'Syncro'}: ${m.content}`)
                .join('\n');
            contextMessage = `Previous conversation:\n${historyText}\n\nUser: ${message}`;
        }

        conversationHistory.push({ role: 'user', content: message });
        if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: contextMessage,
                    system_instruction: SYSTEM_INSTRUCTION
                })
            });

            if (!response.ok) throw new Error(`Server error ${response.status}`);

            const data = await response.json();

            // chat.js returns candidates format
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
                || data.choices?.[0]?.message?.content
                || (data.error ? `⚠️ ${data.error}` : null)
                || "I received an unexpected response. Please try again.";

            conversationHistory.push({ role: 'assistant', content: reply });
            return reply;

        } catch (error) {
            console.error('Syncro AI Error:', error);
            return `😔 Oops! Couldn't connect right now. Please try again.\n\n*(${error.message})*`;
        } finally {
            hideTyping();
        }
    }

    // ── Typing indicator ─────────────────────────────────────
    function showTyping() {
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    function hideTyping() {
        if (typingIndicator) typingIndicator.style.display = 'none';
    }

    // ── Markdown Renderer ────────────────────────────────────
    function renderMarkdown(text) {
        let html = text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>');

        html = html.replace(/(https?:\/\/[^\s<>"]+)/g, url =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`
        );
        return `<p>${html}</p>`;
    }

    // ── Typewriter Effect ────────────────────────────────────
    function typewriterEffect(contentDiv, html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const plainText = tempDiv.innerText;
        let i = 0;
        contentDiv.innerHTML = '';
        function tick() {
            if (i < plainText.length) {
                i += Math.floor(Math.random() * 3) + 1;
                contentDiv.innerHTML = `<p>${plainText.slice(0, i).replace(/\n/g, '<br>')}</p>`;
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(tick, 18);
            } else {
                contentDiv.innerHTML = html;
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        tick();
    }

    // ── Timestamps ───────────────────────────────────────────
    function getTimeLabel() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ── Add Message ──────────────────────────────────────────
    function addMessage(text, sender, useTypewriter) {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        if (sender === 'bot') {
            const img = document.createElement('img');
            img.src = LOGO_URL;
            img.alt = 'Syncro AI';
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:50%;display:block;';
            avatarDiv.style.cssText = 'width:42px;height:42px;min-width:42px;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 10px rgba(255,215,0,0.35);margin-right:10px;background:#1a1400;padding:2px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
            avatarDiv.appendChild(img);
        } else {
            avatarDiv.innerHTML = '👤';
            avatarDiv.style.cssText = 'width:38px;height:38px;min-width:38px;border-radius:50%;background:#1a3a6e;border:1.5px solid rgba(100,140,220,0.4);margin-left:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;';
        }

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
    }

    // ── Quick Replies ─────────────────────────────────────────
    const QUICK_REPLIES = [
        { label: '🏢 What is Onyx?',        text: 'What is Onyx?' },
        { label: '🛍️ Your products',         text: 'What products does Onyx offer?' },
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
            btn.addEventListener('click', () => { container.remove(); handleSend(text); });
            container.appendChild(btn);
        });
        if (chatMessages) {
            chatMessages.appendChild(container);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // ── Welcome Message ──────────────────────────────────────
    function showWelcome() {
        setTimeout(() => {
            if (chatMessages && chatMessages.children.length === 0) {
                addMessage(
                    "Hello! I'm **Syncro**, the AI assistant for **Onyx**. 👋\n\n" +
                    "I can answer questions about this tech platform, its products, blog posts, and more.\n\n" +
                    "How can I help you today?",
                    'bot', true
                );
                setTimeout(showQuickReplies, 1000);
            }
        }, 500);
    }

    // ── Handle Send ──────────────────────────────────────────
    async function handleSend(overrideText) {
        const message = overrideText || (userInput ? userInput.value.trim() : '');
        if (!message) return;

        const qr = document.getElementById('quickReplies');
        if (qr) qr.remove();

        if (!overrideText && userInput) userInput.value = '';

        if (!checkRateLimit()) {
            addMessage('⏳ You\'re sending too fast! Please wait a moment.', 'bot');
            return;
        }

        addMessage(message, 'user');
        const reply = await sendToAI(message);
        addMessage(reply, 'bot', true);
        if (userInput) userInput.focus();
    }

    // ── Event Listeners ──────────────────────────────────────
    if (sendButton) sendButton.addEventListener('click', () => handleSend());
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        });
        userInput.focus();
    }

    // ── External links ───────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('chat-link')) {
            e.preventDefault();
            window.open(e.target.href, '_blank', 'noopener,noreferrer');
        }
    });

    // ── Mobile viewport fix ──────────────────────────────────
    function fixVH() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    window.addEventListener('resize', fixVH);
    window.addEventListener('orientationchange', () => setTimeout(fixVH, 200));
    fixVH();

    // ── Init ─────────────────────────────────────────────────
    showWelcome();
    console.log('Onyx website loaded successfully!');
});

window.updateWebsiteKnowledge = (d) => { Object.assign(WEBSITE_KNOWLEDGE, d); };
window.getCurrentKnowledge = () => WEBSITE_KNOWLEDGE;
