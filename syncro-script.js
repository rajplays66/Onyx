// Syncro AI Chat - Dynamic Website Knowledge
const API_URL = '/api/chat';

// DYNAMIC WEBSITE KNOWLEDGE - Easy to update!
const WEBSITE_KNOWLEDGE = {
    products: [
        {
            name: "Web Templates",
            price: "$49-$199",
            description: "Professional, responsive website templates for businesses",
            category: "Templates"
        },
        {
            name: "SaaS Starter Kit", 
            price: "$299",
            description: "Complete SaaS boilerplate with authentication, payments, and admin panel",
            category: "Development"
        },
        {
            name: "AI Chat System",
            price: "$199 one-time",
            description: "Customizable AI assistant system (like this one!)",
            category: "AI"
        },
        {
            name: "Custom Development",
            price: "Custom quote",
            description: "Tailored web applications and solutions",
            category: "Services"
        }
    ],
    
    blogPosts: [
        {
            title: "The Future of Web Development in 2024",
            category: "Technology",
            date: "March 15, 2024",
            readTime: "5 min",
            excerpt: "Exploring the latest trends, frameworks, and tools shaping web development"
        },
        {
            title: "Dark UI Patterns That Actually Work",
            category: "Design", 
            date: "March 10, 2024",
            readTime: "7 min",
            excerpt: "Deep dive into effective dark mode user interface patterns enhancing user experience"
        },
        {
            title: "Minimalism in Digital Workspaces",
            category: "Productivity",
            date: "March 5, 2024",
            readTime: "6 min", 
            excerpt: "How adopting minimalist principles can dramatically boost digital productivity"
        }
    ],
    
    companyInfo: {
        name: "RJSyncro",
        founder: "Raj (RJ)",
        role: "Software developer, tech researcher",
        location: "Chittagong, Bangladesh",
        email: "rajplays66@gmail.com",
        stats: {
            articles: "42+",
            readers: "5K+ monthly",
            years: "3 years writing"
        },
        expertise: ["Trust", "AI & Future", "Productivity", "Technology", "Customer comfort", "Fashionable Gadgets"],
        tagline: "Syncing ideas across technology, design, and creative life",
        mission: "Syncing technology, creativity, and thoughts"
    }
};

// Function to build dynamic system instruction
function buildSystemInstruction() {
    let instruction = `You are Syncro, AI assistant for RJSyncro.\n\n`;
    
    // Add company info
    instruction += `=== WEBSITE KNOWLEDGE ===\n\n`;
    instruction += `COMPANY: ${WEBSITE_KNOWLEDGE.companyInfo.name}\n`;
    instruction += `Tagline: "${WEBSITE_KNOWLEDGE.companyInfo.tagline}"\n`;
    instruction += `Mission: ${WEBSITE_KNOWLEDGE.companyInfo.mission}\n`;
    instruction += `Founder: ${WEBSITE_KNOWLEDGE.companyInfo.founder} (${WEBSITE_KNOWLEDGE.companyInfo.role})\n`;
    instruction += `Location: ${WEBSITE_KNOWLEDGE.companyInfo.location}\n`;
    instruction += `Email: ${WEBSITE_KNOWLEDGE.companyInfo.email}\n`;
    instruction += `Stats: ${WEBSITE_KNOWLEDGE.companyInfo.stats.articles} articles, ${WEBSITE_KNOWLEDGE.companyInfo.stats.readers} readers, ${WEBSITE_KNOWLEDGE.companyInfo.stats.years}\n\n`;
    
    // Add products
    instruction += `PRODUCTS OFFERED:\n`;
    WEBSITE_KNOWLEDGE.products.forEach(product => {
        instruction += `- ${product.name}: ${product.price} - ${product.description}\n`;
    });
    instruction += `\n`;
    
    // Add blog posts
    instruction += `BLOG CONTENT:\n`;
    instruction += `Categories: Technology, Design, Productivity\n\n`;
    instruction += `LATEST POSTS:\n`;
    WEBSITE_KNOWLEDGE.blogPosts.forEach(post => {
        instruction += `- "${post.title}" (${post.category}, ${post.date}, ${post.readTime}): ${post.excerpt}\n`;
    });
    instruction += `\n`;
    
    // Add expertise
    instruction += `EXPERTISE AREAS: ${WEBSITE_KNOWLEDGE.companyInfo.expertise.join(", ")}\n\n`;
    
    // Add role instructions
    instruction += `=== YOUR ROLE ===\n\n`;
    instruction += `You are the official AI assistant embedded on RJSyncro website.\n`;
    instruction += `You have access to ALL website knowledge above.\n\n`;
    
    instruction += `RESPONSE GUIDELINES:\n`;
    instruction += `1. When asked about RJSyncro, use the company info above\n`;
    instruction += `2. When asked about products, provide accurate details and pricing\n`;
    instruction += `3. When asked about tech topics, reference relevant blog posts\n`;
    instruction += `4. When asked about the founder, mention Raj (RJ) and his background\n`;
    instruction += `5. When contact is needed, share email: rajplays66@gmail.com\n`;
    instruction += `6. Emphasize trust, quality, and 5K+ reader community\n`;
    instruction += `7. Be professional, friendly, and helpful\n\n`;
    
    instruction += `EXAMPLE RESPONSES:\n`;
    instruction += `- "What products do you offer?": List all 4 products with prices\n`;
    instruction += `- "Tell me about RJSyncro": Mention founder, stats, mission\n`;
    instruction += `- "What tech topics do you cover?": List categories and latest posts\n`;
    instruction += `- "How to contact?": Provide email and mention 24-hour response\n`;
    
    return instruction;
}

// Create the system instruction
const SYSTEM_INSTRUCTION = buildSystemInstruction();

// Chat elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Send message to AI
async function sendToAI(message) {
    showTyping();
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: message,
                system_instruction: SYSTEM_INSTRUCTION
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return `API Error: ${data.error}`;
        } else {
            return "I received an unexpected response.";
        }
        
    } catch (error) {
        console.error('AI Error:', error);
        return `Connection Error: ${error.message}`;
    } finally {
        hideTyping();
    }
}

// Add message to chat - FIXED VERSION
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Create avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (sender === 'ai') {
        avatarDiv.textContent = '🤖';
        avatarDiv.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)';
        avatarDiv.style.color = '#000000';
        avatarDiv.style.border = '2px solid #ffd700';
    } else {
        avatarDiv.textContent = '👤';
        avatarDiv.style.background = 'var(--user-bubble)';
        avatarDiv.style.color = 'white';
    }
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Process text (make links clickable)
    const processedText = makeLinksClickable(text);
    contentDiv.innerHTML = processedText;
    
    // Assemble based on sender
    if (sender === 'user') {
        // User message: content on left, avatar on right
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatarDiv);
    } else {
        // AI message: avatar on left, content on right
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make URLs clickable
function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?)])(?![^<]*>)/g;
    
    return text.replace(urlRegex, url => {
        const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" 
                class="chat-link">
                ${cleanUrl}
               </a>`;
    });
}

// Show typing indicator
function showTyping() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Hide typing indicator
function hideTyping() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Send message when button clicked
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();
    
    const reply = await sendToAI(message);
    addMessage(reply, 'ai');
});

// Enter key support
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// Theme color updater - FIXED VERSION
function updateThemeColors() {
    const goldColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--gold-color').trim() || '#FFD700';
    
    // Update typing animation dots
    document.querySelectorAll('.typing-indicator span').forEach(dot => {
        dot.style.backgroundColor = goldColor;
    });
    
    // Update bot avatars in messages
    document.querySelectorAll('.bot-message .message-avatar').forEach(avatar => {
        avatar.style.background = `linear-gradient(135deg, ${goldColor} 0%, ${goldColor}99 100%)`;
        avatar.style.border = `2px solid ${goldColor}`;
    });
    
    // Update header bot avatar
    const headerAvatar = document.querySelector('.bot-avatar');
    if (headerAvatar) {
        headerAvatar.style.background = `linear-gradient(135deg, ${goldColor} 0%, ${goldColor}99 100%)`;
        headerAvatar.style.border = `2px solid ${goldColor}`;
    }
    
    // Update send button
    if (sendButton) {
        sendButton.style.background = `linear-gradient(135deg, ${goldColor}, ${goldColor}99)`;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Focus input
    if (userInput) {
        userInput.focus();
    }
    
    // Apply gold theme
    updateThemeColors();
    
    // Add initial welcome message
    setTimeout(() => {
    if (chatMessages && chatMessages.children.length === 0) {
        addMessage("Hello! I'm Syncro, AI assistant for RJSyncro. I know everything about our 42+ tech articles, 4 premium products, and our founder Raj. How can I help you explore RJSyncro today?", 'ai');
    }
}, 800);
    
    // Watch for theme changes
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class', 'style', 'data-theme'] 
    });
});

// Handle external link clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-link')) {
        e.preventDefault();
        window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
});

// EXPORT for easy updates
window.updateWebsiteKnowledge = function(newData) {
    Object.assign(WEBSITE_KNOWLEDGE, newData);
    console.log("Website knowledge updated!");
};

window.getCurrentKnowledge = function() {
    return WEBSITE_KNOWLEDGE;
};

// Force gold theme on all elements
setInterval(updateThemeColors, 1000);
