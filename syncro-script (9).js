// SYNCRO AI | Onyx
const API_URL = '/api/chat';
const LOGO_URL = 'https://i.ibb.co/jkd25QLn/Picsart-26-04-23-10-12-58-459.png';

const SYSTEM_INSTRUCTION = `You are Syncro, the friendly AI assistant for Onyx — a tech platform by Raj (RJ) from Chittagong, Bangladesh. 
Be helpful, friendly and professional. Use markdown in responses.
Products: Web Templates ($49-$199), SaaS Kit ($299), AI Chat System ($199), Custom Development (custom quote).
Contact: rajplays66@gmail.com`;

let conversationHistory = [];

// Wait for page to fully load
window.onload = function() {
    init();
};

// Also try DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', function() {
    init();
});

let initialized = false;
function init() {
    if (initialized) return;
    initialized = true;

    const chatMessages    = document.getElementById('chatMessages');
    const userInput       = document.getElementById('userInput');
    const sendButton      = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearBtn        = document.getElementById('clearChatBtn');
    const scrollBtn       = document.getElementById('scrollBottomBtn');

    if (!chatMessages || !userInput || !sendButton) {
        console.error('Critical elements missing!');
        return;
    }

    // Show welcome
    setTimeout(function() {
        addMessage("Hello! I'm **Syncro**, the AI assistant for **Onyx**. 👋\n\nHow can I help you today?", 'bot');
        setTimeout(showQuickReplies, 800);
    }, 3200); // after splash ends at 2.8s

    // Send button
    sendButton.addEventListener('click', function() {
        handleSend();
    });

    // Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });

    // Clear chat
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Clear conversation?')) {
                chatMessages.innerHTML = '';
                conversationHistory = [];
                setTimeout(function() {
                    addMessage("Hello! I'm **Syncro**, the AI assistant for **Onyx**. 👋\n\nHow can I help you today?", 'bot');
                    setTimeout(showQuickReplies, 800);
                }, 200);
            }
        });
    }

    // Scroll button
    if (scrollBtn) {
        chatMessages.addEventListener('scroll', function() {
            var dist = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
            scrollBtn.style.opacity = dist > 100 ? '1' : '0';
        });
        scrollBtn.addEventListener('click', function() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ── Handle Send ──────────────────────────────────────────
    async function handleSend(text) {
        var message = text || userInput.value.trim();
        if (!message) return;

        var qr = document.getElementById('quickReplies');
        if (qr) qr.remove();

        if (!text) userInput.value = '';

        addMessage(message, 'user');

        // Show typing
        if (typingIndicator) typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Build message with history
            var contextMsg = message;
            if (conversationHistory.length > 0) {
                var hist = conversationHistory.slice(-8)
                    .map(function(m) { return (m.role === 'user' ? 'User' : 'Syncro') + ': ' + m.content; })
                    .join('\n');
                contextMsg = 'Previous:\n' + hist + '\n\nUser: ' + message;
            }

            conversationHistory.push({ role: 'user', content: message });

            var response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: contextMsg,
                    system_instruction: SYSTEM_INSTRUCTION
                })
            });

            var data = await response.json();

            var reply;
            if (!response.ok) {
                reply = '⚠️ Server error ' + response.status + ': ' + (data.error || 'Unknown error');
            } else {
                reply = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text)
                    || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
                    || data.error
                    || JSON.stringify(data);
            }

            conversationHistory.push({ role: 'assistant', content: reply });
            addMessage(reply, 'bot');

        } catch (err) {
            addMessage('😔 Connection error: ' + err.message, 'bot');
        } finally {
            if (typingIndicator) typingIndicator.style.display = 'none';
        }

        userInput.focus();
    }

    // ── Add Message ──────────────────────────────────────────
    function addMessage(text, sender) {
        var div = document.createElement('div');
        div.className = 'message ' + sender + '-message';

        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        if (sender === 'bot') {
            var img = document.createElement('img');
            img.src = LOGO_URL;
            img.alt = 'Syncro';
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:50%;';
            avatarDiv.style.cssText = 'width:42px;height:42px;min-width:42px;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 10px rgba(255,215,0,0.35);margin-right:10px;background:#1a1400;padding:2px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
            avatarDiv.appendChild(img);
        } else {
            avatarDiv.innerHTML = '👤';
            avatarDiv.style.cssText = 'width:38px;height:38px;min-width:38px;border-radius:50%;background:#1a3a6e;border:1.5px solid rgba(100,140,220,0.4);margin-left:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;';
        }

        var wrapDiv = document.createElement('div');
        wrapDiv.className = 'message-wrap';

        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = renderMarkdown(text);

        var timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        wrapDiv.appendChild(contentDiv);
        wrapDiv.appendChild(timeDiv);
        div.appendChild(avatarDiv);
        div.appendChild(wrapDiv);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ── Quick Replies ────────────────────────────────────────
    function showQuickReplies() {
        var existing = document.getElementById('quickReplies');
        if (existing) existing.remove();

        var container = document.createElement('div');
        container.id = 'quickReplies';
        container.className = 'quick-replies';

        var replies = [
            { label: '🏢 What is Onyx?',   text: 'What is Onyx?' },
            { label: '🛍️ Products',         text: 'What products does Onyx offer?' },
            { label: '✍️ Blog posts',        text: 'What are the latest blog posts?' },
            { label: '📬 Contact Raj',       text: 'How can I contact Raj?' }
        ];

        replies.forEach(function(r) {
            var btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = r.label;
            btn.onclick = function() { container.remove(); handleSend(r.text); };
            container.appendChild(btn);
        });

        chatMessages.appendChild(container);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ── Markdown ─────────────────────────────────────────────
    function renderMarkdown(text) {
        var html = text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        html = html.replace(/(https?:\/\/[^\s<>"]+)/g, function(url) {
            return '<a href="' + url + '" target="_blank" class="chat-link">' + url + '</a>';
        });

        return '<p>' + html + '</p>';
    }

    // Mobile viewport fix
    function fixVH() {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }
    window.addEventListener('resize', fixVH);
    fixVH();
}
