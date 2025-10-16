class GeminiChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
        this.updateStatus('Ready to chat');
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.clearBtn = document.getElementById('clearBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.charCount = document.getElementById('charCount');
        this.status = document.getElementById('status');
    }

    bindEvents() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input events
        this.messageInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.updateSendButton();
            this.autoResize();
        });

        // Action buttons
        this.clearBtn.addEventListener('click', () => this.clearChat());
        this.newChatBtn.addEventListener('click', () => this.newChat());

        // Initialize
        this.updateCharacterCount();
        this.updateSendButton();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateCharacterCount();
        this.updateSendButton();
        this.autoResize();

        await this.getAIResponse(message);
    }

    async getAIResponse(message) {
        this.isLoading = true;
        this.showTypingIndicator();
        this.updateStatus('AI is thinking...');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            this.hideTypingIndicator();
            this.addMessage(data.response, 'ai');
            this.updateStatus('Ready to chat');

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage(`Sorry, I encountered an error: ${error.message}`, 'ai');
            this.updateStatus('Error occurred');
        } finally {
            this.isLoading = false;
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        const icon = document.createElement('i');
        icon.className = sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';
        avatarDiv.appendChild(icon);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textP = document.createElement('p');
        textP.textContent = text;
        contentDiv.appendChild(textP);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Add timestamp
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = new Date().toLocaleTimeString();
        messageDiv.appendChild(timestampDiv);
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'block';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateCharacterCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = length;
        this.charCount.className = length > 1800 ? 'warning' : length > 1900 ? 'danger' : '';
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isLoading;
        this.sendBtn.className = `send-btn ${hasText && !this.isLoading ? 'active' : ''}`;
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    async clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatMessages.innerHTML = '';
            this.updateStatus('Chat cleared');

            try {
                await fetch('/api/clear', { method: 'POST' });
            } catch (error) {
                console.error('Error clearing server history:', error);
            }
        }
    }

    newChat() {
        this.clearChat();
        // Add welcome message back
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';

        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message ai-message';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<p>Hello! I\'m ready for a new conversation. What would you like to talk about?</p>';

        welcomeMessage.appendChild(avatarDiv);
        welcomeMessage.appendChild(contentDiv);
        welcomeDiv.appendChild(welcomeMessage);

        this.chatMessages.appendChild(welcomeDiv);
    }

    updateStatus(status) {
        this.status.textContent = status;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GeminiChat();
});