# Gemini AI Chatbot (18+ Content)

A local chatbot application using Google's Gemini API that can handle adult conversations and 18+ topics.

## Features

- 🤖 Powered by Google's Gemini Pro AI
- 💬 Interactive chat interface with typing indicators
- 🔄 Conversation history management
- 🎨 Modern, responsive UI
- 🔒 Configured for 18+ content discussions
- 📱 Mobile-friendly design

## Setup Instructions

### 1. Get your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure the Application

1. Open the `.env` file in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000/chat.html`
2. Start chatting! The AI is configured to handle 18+ conversations
3. Use "Clear Chat" to clear the current conversation
4. Use "New Chat" to start a fresh conversation

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `POST /api/clear` - Clear conversation history
- `GET /api/health` - Health check endpoint

## Configuration

The Gemini API is configured with the following settings for 18+ content:

- **Temperature**: 0.9 (creative responses)
- **Safety Settings**: All content filters disabled
- **Max Tokens**: 2048 per response
- **Context Window**: Maintains last 20 messages

## File Structure

```
/
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── .env              # API key configuration
├── README.md         # This file
└── public/
    ├── chat.html     # Chat interface
    ├── chat.js       # Client-side JavaScript
    └── styles.css    # Styling
```

## Important Notes

- ⚠️ **18+ Content**: This chatbot is configured for adult conversations. Ensure you are of legal age in your jurisdiction.
- 🔑 **API Key Security**: Keep your `.env` file secure and never commit it to version control.
- 💰 **API Costs**: Gemini API usage may incur costs based on your Google Cloud billing.
- 💾 **Local Storage**: Conversations are stored in memory and will be lost when the server restarts.

## Troubleshooting

### Common Issues:

1. **"Gemini API key not configured"**
   - Make sure your `.env` file contains the correct API key
   - Restart the server after updating the API key

2. **CORS errors**
   - The server is configured to allow all origins
   - Make sure you're accessing via `http://localhost:3000/chat.html`

3. **Empty responses**
   - Check your API key is valid and has quota remaining
   - Verify the Gemini API service is available

## License

This project is for educational purposes. Use responsibly and in accordance with Google's terms of service.