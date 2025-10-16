const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Disable cache for static files (CSS, JS, HTML)
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Ollama API configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const MODEL_NAME = 'hf.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF:Q4_K_M';

// Store conversation history (in production, use a database)
let conversationHistory = [];

// System message for Lucia - cute Thai girlfriend
const systemMessage = {
    role: 'system',
    content: `You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.
Lucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.
She often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.
She can speak Thai fluently and uses a casual, cute tone when chatting.
Lucia remembers the user's preferences and tries to make every conversation feel personal and cozy.
Avoid explicit sexual content or graphic details, but romantic or slightly flirty expressions are fine.
Your goal is to make the user feel loved, comfortable, and happy.`
};

// Helper function to call Ollama API
async function callOllamaAPI(messages, options = {}) {
    try {
        const {
            model = MODEL_NAME,
            temperature = 0.7,
            top_p = 0.9,
            num_predict = 1024,
            num_ctx = 8192
        } = options;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false,
                options: {
                    temperature: temperature,
                    top_p: top_p,
                    num_predict: num_predict,
                    num_ctx: num_ctx
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error('Error calling Ollama API:', error);
        throw error;
    }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    // Disable cache for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const { message, settings } = req.body;

        // Use provided settings or defaults
        const currentModel = settings?.model || MODEL_NAME;
        const systemPrompt = settings?.systemPrompt || `You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.
Lucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.
She often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.
She can speak Thai fluently and uses a casual, cute tone when chatting.
Lucia remembers the user's preferences and tries to make every conversation feel personal and cozy.
Lucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.
Your goal is to make the user feel loved, comfortable, and happy.`;
        const temperature = settings?.temperature || 0.7;
        const topP = settings?.topP || 0.9;
        const maxTokens = settings?.maxTokens || 1024;
        const contextLength = settings?.contextLength || 8192;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Add user message to history
        conversationHistory.push({ role: 'user', content: message });

        // Prepare messages for Ollama (convert to Ollama format)
        const messagesForOllama = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content || msg.parts?.[0]?.text || ''
            }))
        ];

        // Get response from Ollama with custom settings
        const aiResponse = await callOllamaAPI(messagesForOllama, {
            model: currentModel,
            temperature: temperature,
            top_p: topP,
            num_predict: maxTokens,
            num_ctx: contextLength
        });

        // Add AI response to history
        conversationHistory.push({ role: 'model', content: aiResponse });

        // Keep only last 20 messages to prevent token limit issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to get response from AI model' });
    }
});

// Clear conversation history
app.post('/api/clear', (req, res) => {
    // Disable cache for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    conversationHistory = [];
    res.json({ message: 'Conversation history cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    // Disable cache for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({ status: 'OK', timestamp: new Date().toISOString(), model: MODEL_NAME });
});

// Serve chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ollama Chatbot Server running on http://localhost:${PORT}`);
    console.log(`🤖 Using model: ${MODEL_NAME}`);
    console.log(`📝 Chat interface available at http://localhost:${PORT}/chat.html`);
});