// Syncro AI Chat - Dynamic Website Knowledge
const API_URL = '/api/chat';

// WEBSITE KNOWLEDGE - Easy to update!
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

// Build system instruction
function buildSystemInstruction() {
    let instruction = `You are Syncro, AI assistant for RJSyncro.\n\n`;
    
    // Company info
    instruction += `=== WEBSITE KNOWLEDGE ===\n\n`;
    instruction += `COMPANY: ${WEBSITE_KNOWLEDGE.companyInfo.name}\n`;
    instruction += `Tagline: "${WEBSITE_KNOWLEDGE.companyInfo.tagline}"\n`;
    instruction += `Mission: ${WEBSITE_KNOWLEDGE.companyInfo.mission}\n`;
    instruction += `Founder: ${WEBSITE_KNOWLEDGE.companyInfo.founder} (${WEBSITE_KNOWLEDGE.companyInfo.role})\n`;
    instruction += `Location: ${WEBSITE_KNOWLEDGE.companyInfo.location}\n`;
    instruction += `Email: ${WEBSITE_KNOWLEDGE.companyInfo.email}\n`;
    instruction += `Stats: ${WEBSITE_KNOWLEDGE.companyInfo.stats.articles} articles, ${WEBSITE_KNOWLEDGE.companyInfo.stats.readers} readers, ${WEBSITE_KNOWLEDGE.companyInfo.stats.years}\n\n`;
    
    // Products
    instruction += `PRODUCTS OFFERED:\n`;
    WEBSITE_KNOWLEDGE.products.forEach(product => {
        instruction += `- ${product.name}: ${product.price} - ${product.description}\n`;
    });
    instruction += `\n`;
    
    // Blog posts
    instruction += `BLOG CONTENT:\n`;
    instruction += `Categories: Technology, Design, Productivity\n\n`;
    instruction += `LATEST POSTS:\n`;
    WEBSITE_KNOWLEDGE.blogPosts.forEach(post => {
        instruction += `- "${post.title}" (${post.category}, ${post.date}, ${post.readTime}): ${post.excerpt}\n`;
    });
    instruction += `\n`;
    
    // Expertise
    instruction += `EXPERTISE AREAS: ${WEBSITE_KNOWLEDGE.companyInfo.expertise.join(", ")}\n\n`;
    
    // Role instructions
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
    instruction += `7. Be professional, friendly, and helpful\n`;
    
    return instruction;
}

const SYSTEM_INSTRUCTION = buildSystemInstruction();

// DOM Elements
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
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
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
    
    // Create avatar container
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (sender === 'ai') {
        // Bot avatar with logo
        const avatarImg = document.createElement('img');
        avatarImg.src = 'https://i.ibb.co/JjZPmBpV/Picsart-26-04-22-09-03-55-835.jpg';
        avatarImg.alt = 'Syncro AI';
        avatarImg.className = 'ai-logo';
        avatarDiv.appendChild(avatarImg);
    } else {
        // User avatar with emoji
        avatarDiv.textContent = '👤';
    }
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Make links clickable
    const processedText = makeLinksClickable(text);
    
    // Create paragraph for text
    const textParagraph = document.createElement('p');
    textParagraph.innerHTML = processedText;
    contentDiv.appendChild(textParagraph);
    
    // Assemble message - FIXED ORDER
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make URLs clickable
function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?)])(?![^<]*>)/g;
    
    return text.replace(urlRegex, url => {
        const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${cleanUrl}</a>`;
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

// Send message handler
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Clear input immediately
    userInput.value = '';
    
    // Add user message
    addMessage(message, 'user');
    
    // Get AI response
    const reply = await sendToAI(message);
    
    // Add AI message
    addMessage(reply, 'ai');
    
    // Refocus input
    userInput.focus();
});

// Enter key support
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Focus input
    if (userInput) {
        userInput.focus();
    }
    
    // Add welcome message if chat is empty
    setTimeout(() => {
        if (chatMessages && chatMessages.children.length === 0) {
            addMessage(
                "Hello! I'm Syncro, the AI assistant for RJSyncro. 👋\n\n" +
                "You can ask me general questions, or ask about this tech web, its topics, " +
                "products, sales, creator and more. How can I help you today?",
                'ai'
            );
        }
    }, 500);
});

// Handle external link clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-link')) {
        e.preventDefault();
        window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
});

// Export for updates
window.updateWebsiteKnowledge = function(newData) {
    Object.assign(WEBSITE_KNOWLEDGE, newData);
    console.log("Website knowledge updated!");
};

window.getCurrentKnowledge = function() {
    return WEBSITE_KNOWLEDGE;
};
