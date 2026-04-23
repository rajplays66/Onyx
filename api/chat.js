// File: api/chat.js (Business Version with ALL Enhancements)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, system_instruction } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const API_KEY = process.env.GROQ_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
        }
        
        // ===== BUSINESS PRODUCT DATABASE =====
        const PRODUCTS = {
            "web-templates": {
                name: "Premium Web Templates",
                description: "Responsive, modern website templates for businesses",
                price: "$49-$199",
                features: ["Fully responsive", "SEO optimized", "Easy customization", "Free updates"],
                bestFor: "Startups, small businesses, freelancers",
                link: "/products/templates",
                paymentLink: "https://buy.stripe.com/test_00g4jK9yN7kR8KA6op",
                buyNowText: "Buy Template (From $49)"
            },
            "saas-boilerplate": {
                name: "SaaS Starter Kit",
                description: "Complete SaaS application boilerplate with auth, payments, dashboard",
                price: "$299 (one-time)",
                features: ["User authentication", "Stripe payments", "Admin dashboard", "API ready", "Documentation"],
                bestFor: "Developers launching SaaS products",
                link: "/products/saas-kit",
                paymentLink: "https://buy.stripe.com/test_8wM5nidwv0zG1Re7st",
                buyNowText: "Get SaaS Kit ($299)"
            },
            "ai-chat-system": {
                name: "AI Chat System",
                description: "Customizable AI assistant system (exactly what you're using now)",
                price: "$199 (one-time) or $29/month",
                features: ["Multiple AI providers", "Custom knowledge base", "Admin panel", "Analytics", "Easy setup"],
                bestFor: "Businesses wanting AI customer support",
                link: "/products/ai-chat",
                paymentLink: "https://buy.stripe.com/test_7sI6mKbwB9tL2TD5qr",
                buyNowText: "Get AI Chat System ($199)"
            },
            "custom-development": {
                name: "Custom Development",
                description: "Tailored web applications and systems built to your specifications",
                price: "Custom quote (starts from $999)",
                features: ["Full customization", "Dedicated support", "Source code ownership", "3 months maintenance"],
                bestFor: "Businesses with specific, unique needs",
                link: "/contact",
                paymentLink: "https://calendly.com/onyx/consultation",
                buyNowText: "Request Custom Quote"
            }
        };
        
        // Detect relevant products
        const detectProducts = (text) => {
            text = text.toLowerCase();
            const matches = [];
            
            // Web Templates
            if (text.includes('template') || text.includes('website') || text.includes('web design') || 
                text.includes('landing page') || text.includes('portfolio site') || 
                text.includes('business website') || text.includes('ecommerce site') ||
                text.includes('wordpress') || text.includes('html template')) {
                matches.push('web-templates');
            }
            
            // SaaS Kit
            if (text.includes('saas') || text.includes('software') || text.includes('app') || 
                text.includes('application') || text.includes('dashboard') || 
                text.includes('admin panel') || text.includes('user management') ||
                text.includes('subscription') || text.includes('monthly plan')) {
                matches.push('saas-boilerplate');
            }
            
            // AI Chat System
            if (text.includes('chat') || text.includes('ai') || text.includes('assistant') || 
                text.includes('bot') || text.includes('chatbot') || text.includes('chat gpt') ||
                text.includes('customer support') || text.includes('automated reply')) {
                matches.push('ai-chat-system');
            }
            
            // Custom Development
            if (text.includes('custom') || text.includes('build') || text.includes('develop') || 
                text.includes('create') || text.includes('make me') || text.includes('hire') ||
                text.includes('contract') || text.includes('freelance')) {
                matches.push('custom-development');
            }
            
            // Pricing questions
            if (text.includes('price') || text.includes('cost') || text.includes('how much') || 
                text.includes('pricing') || text.includes('expensive') || text.includes('affordable')) {
                return Object.keys(PRODUCTS);
            }
            
            // General product questions
            if (text.includes('what do you sell') || text.includes('products') || 
                text.includes('offer') || text.includes('services')) {
                return Object.keys(PRODUCTS);
            }
            
            return matches;
        };
        
        const relevantProducts = detectProducts(message);
        
        // ===== BUSINESS FAQ DATABASE =====
        const BUSINESS_FAQ = {
            "how to buy": "You can purchase directly on our website with credit card or PayPal. Most products offer instant digital delivery.",
            "how to purchase": "Visit our website, select your product, add to cart, and checkout. You'll receive download links immediately.",
            "support": "Email us at support@onyx.com or use our contact form. We reply within 24 hours.",
            "contact": "Email: hello@onyx.com | Phone: +1 (555) 123-4567 (Mon-Fri 9AM-6PM)",
            "refund": "We offer 30-day money-back guarantee on digital products if you're not satisfied.",
            "license": "All products come with commercial license. You can use them for client projects.",
            "updates": "Products include 1 year of free updates. You'll get notifications when new versions are released.",
            "requirements": "Our products work on any modern browser. Some require basic HTML/CSS knowledge.",
            "customization": "Yes! All products are fully customizable. We provide documentation and examples.",
            "team": "We're a tech platform founded by Raj (RJ), based in Chittagong, Bangladesh.",
            "discount": "We offer 20% student discount and bulk discounts for 3+ products. Contact sales.",
            "demo": "You can book a free 30-minute demo at: https://calendly.com/onyx/demo",
            "schedule": "Book a call: https://calendly.com/onyx/consultation",
            "meeting": "Schedule meeting: https://calendly.com/onyx/meeting",
            "call": "Schedule a consultation call: https://calendly.com/onyx/consultation",
            "consultation": "Book a free consultation: https://calendly.com/onyx/consultation",
            "integration": "Our products integrate with popular tools like Stripe, Mailchimp, Google Analytics.",
            "timeline": "Digital products: Instant delivery | Custom projects: 2-8 weeks depending on scope."
        };
        
        // Helper to check FAQ
        const checkFAQ = (text) => {
            text = text.toLowerCase();
            for (const [keyword, answer] of Object.entries(BUSINESS_FAQ)) {
                if (text.includes(keyword)) {
                    return answer;
                }
            }
            return null;
        };
        
        // Check FAQ first
        const faqAnswer = checkFAQ(message);
        if (faqAnswer) {
            // ===== ANALYTICS TRACKING =====
            console.log('📊 ANALYTICS FAQ:', {
                timestamp: new Date().toISOString(),
                question: message.substring(0, 100),
                productsMentioned: relevantProducts,
                isFAQ: true
            });
            // ===== END TRACKING =====
            
            return res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{ text: faqAnswer }]
                    }
                }],
                metadata: {
                    isFAQ: true,
                    suggestedProducts: relevantProducts.map(key => PRODUCTS[key])
                }
            });
        }
        
        // ===== DEMO/MEETING DETECTION =====
        const text = message.toLowerCase();
        if (text.includes('demo') || text.includes('schedule') || 
            text.includes('meeting') || text.includes('call') ||
            text.includes('consultation') || text.includes('book a') ||
            text.includes('setup call') || text.includes('talk to sales')) {
            
            // ===== ANALYTICS TRACKING =====
            console.log('📊 ANALYTICS DEMO:', {
                timestamp: new Date().toISOString(),
                question: message.substring(0, 100),
                productsMentioned: relevantProducts,
                isDemoRequest: true
            });
            // ===== END TRACKING =====
            
            let demoMessage = "🎯 Perfect! I'd love to schedule a demo for you!\n\n";
            
            // Customize based on mentioned products
            if (relevantProducts.includes('web-templates')) {
                demoMessage += "**For Web Templates:** I'll show you our template library and customization options.\n";
            }
            if (relevantProducts.includes('saas-boilerplate')) {
                demoMessage += "**For SaaS Kit:** I'll demo the admin panel, user auth, and payment integration.\n";
            }
            if (relevantProducts.includes('ai-chat-system')) {
                demoMessage += "**For AI Chat System:** I'll show the admin dashboard and customization options.\n";
            }
            if (relevantProducts.includes('custom-development')) {
                demoMessage += "**For Custom Development:** Our team will discuss your requirements and timeline.\n";
            }
            
            demoMessage += "\n📅 **Book a 30-minute slot:** https://calendly.com/onyx/demo";
            demoMessage += "\n📧 **Or email:** sales@onyx.com";
            demoMessage += "\n\nWe respond within 2 business hours!";
            
            return res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{ text: demoMessage }]
                    }
                }],
                metadata: {
                    isDemoRequest: true,
                    suggestedProducts: relevantProducts.map(key => PRODUCTS[key])
                }
            });
        }
        // ===== END DEMO DETECTION =====
        
        // Build enhanced prompt
        let enhancedPrompt = system_instruction || "You are Syncro, AI assistant for Onyx.";
        
        if (relevantProducts.length > 0) {
            enhancedPrompt += `\n\nRELEVANT PRODUCTS FOR THIS QUERY:`;
            relevantProducts.forEach(productKey => {
                const p = PRODUCTS[productKey];
                enhancedPrompt += `\n\nPRODUCT: ${p.name}`;
                enhancedPrompt += `\nDESCRIPTION: ${p.description}`;
                enhancedPrompt += `\nPRICE: ${p.price}`;
                enhancedPrompt += `\nFEATURES: ${p.features.join(', ')}`;
                enhancedPrompt += `\nBEST FOR: ${p.bestFor}`;
                enhancedPrompt += `\nPAYMENT LINK: ${p.paymentLink}`;
            });
            enhancedPrompt += `\n\nUse this product information in your response. If appropriate, suggest the most relevant product.`;
            
            // ===== PAYMENT LINK ENHANCEMENT =====
            const wantsToBuy = text.includes('buy') || text.includes('purchase') || 
                              text.includes('order') || text.includes('get it') ||
                              text.includes('how to get') || text.includes('where to buy');
            
            const askingPrice = text.includes('price') || text.includes('cost') || 
                               text.includes('how much') || text.includes('pricing');
            
            if ((wantsToBuy || askingPrice) && relevantProducts.length > 0) {
                enhancedPrompt += `\n\nUSER WANTS TO BUY OR KNOW PRICING. Include payment links and encourage purchase:`;
                relevantProducts.forEach(productKey => {
                    const p = PRODUCTS[productKey];
                    enhancedPrompt += `\n- ${p.name}: ${p.price}. Buy now: ${p.paymentLink}`;
                });
            }
            // ===== END PAYMENT LINK =====
        }
        
        const messages = [
            {
                role: "system",
                content: enhancedPrompt
            },
            {
                role: "user",
                content: message
            }
        ];
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 400,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Groq Error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'API error' 
            });
        }
        
        const replyText = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again or contact our support.";
        
        // ===== ANALYTICS TRACKING =====
        console.log('📊 ANALYTICS AI:', {
            timestamp: new Date().toISOString(),
            question: message.substring(0, 100),
            productsMentioned: relevantProducts,
            isFAQ: false,
            isDemoRequest: false,
            userAgent: req.headers['user-agent']?.substring(0, 50)
        });
        // ===== END TRACKING =====
        
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: replyText }]
                }
            }],
            metadata: {
                suggestedProducts: relevantProducts.map(key => PRODUCTS[key]),
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
}        
