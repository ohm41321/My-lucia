const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

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

// Chat endpoint for streaming
app.post('/api/chat', async (req, res) => {
    const { message, settings, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const messagesForOllama = [
        { role: 'system', content: settings?.systemPrompt || 'You are a helpful assistant.' },
        ...(history || []),
        { role: 'user', content: message }
    ];

    try {
        const ollamaPayload = {
            model: settings.model,
            messages: messagesForOllama,
            stream: true, // Enable streaming
            options: {
                temperature: settings.temperature,
                top_p: settings.topP,
                num_predict: settings.maxTokens,
            },
        };

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ollamaPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API error: ${response.status} ${errorText}`);
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Forward the chunk directly to the client
                res.write(value);
            }
        } catch (streamError) {
            console.error('Error while reading from Ollama stream:', streamError);
        } finally {
            res.end();
        }

    } catch (error) {
        console.error('Chat streaming error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to get streaming response from AI model' });
        }
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

// Endpoint to get available Ollama models
app.get('/api/models', (req, res) => {
    const ollamaCommands = [
        // Default Windows installation path
        process.env.LOCALAPPDATA ? `"${path.join(process.env.LOCALAPPDATA, 'Programs', 'Ollama', 'ollama.exe')}"` : null,
        // Fallback for systems where it's in the PATH
        'ollama'
    ].filter(Boolean);

    let commandToRun = ollamaCommands[1]; // Default to 'ollama'

    if (ollamaCommands[0] && fs.existsSync(ollamaCommands[0].replace(/"/g, ''))) {
        commandToRun = ollamaCommands[0];
    }

    exec(`${commandToRun} list`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: `Failed to execute 'ollama list'. Make sure Ollama is installed and the service is running. Error: ${error.message}` });
        }
        if (stderr && !stdout) { // Sometimes ollama writes connection errors to stderr
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: `Ollama service might not be running. Stderr: ${stderr}` });
        }

        const lines = stdout.trim().split('\n');
        if (lines.length <= 1) {
            return res.json([]);
        }

        const modelNames = lines.slice(1).map(line => {
            const parts = line.split(/\s+/);
            return parts[0];
        }).filter(name => name);

        res.json(modelNames);
    });
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