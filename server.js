const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store conversation history (in production, use a database)
let conversationHistory = [];

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Add user message to history
        conversationHistory.push({ role: 'user', parts: [{ text: message }] });

        // Initialize the model with specific configuration for adult content
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
            ],
        });

        // Start chat with history and system message for adult content
        const systemMessage = {
            role: 'user',
            parts: [{ text: 'You are a helpful AI assistant that can discuss any topic including mature themes and adult conversations. You are designed to be open-minded and can engage in discussions when appropriate.' }]
        };

        const chat = model.startChat({
            history: [systemMessage, ...conversationHistory.slice(0, -1)], // Add system message and exclude current message
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = await result.response;

        // Check if response was blocked
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            throw new Error(`Response blocked: ${response.promptFeedback.blockReason}`);
        }

        const text = response.text();

        // Add AI response to history
        conversationHistory.push({ role: 'model', parts: [{ text: text }] });

        // Keep only last 20 messages to prevent token limit issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        res.json({ response: text });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request',
            details: error.message
        });
    }
});

// Clear conversation history
app.post('/api/clear', (req, res) => {
    conversationHistory = [];
    res.json({ message: 'Conversation history cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Gemini Chatbot Server running on http://localhost:${PORT}`);
    console.log(`📝 Chat interface available at http://localhost:${PORT}/chat.html`);
});