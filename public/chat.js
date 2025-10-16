// Chat functionality for Local LLM
class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.clearBtn = document.getElementById('clearBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.charCounter = document.querySelector('.char-counter');
        this.statusInfo = document.querySelector('.status-info');
        this.sendText = document.querySelector('.send-text');
        this.loadingText = document.querySelector('.loading-text');

        // Settings elements
        this.modelSelect = document.getElementById('modelSelect');
        this.systemPrompt = document.getElementById('systemPrompt');
        this.temperature = document.getElementById('temperature');
        this.temperatureNum = document.getElementById('temperatureNum');
        this.topP = document.getElementById('topP');
        this.topPNum = document.getElementById('topPNum');
        this.maxTokens = document.getElementById('maxTokens');
        this.maxTokensNum = document.getElementById('maxTokensNum');
        this.contextLength = document.getElementById('contextLength');
        this.contextLengthNum = document.getElementById('contextLengthNum');
        this.saveSettings = document.getElementById('saveSettings');
        this.applySettings = document.getElementById('applySettings');
        this.resetSettings = document.getElementById('resetSettings');

        // Current settings
        this.currentSettings = this.getDefaultSettings();

        this.initializeEventListeners();
        this.loadSettings();
        this.updateCharCounter();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Update character counter
        this.messageInput.addEventListener('input', () => this.updateCharCounter());

        // Clear chat
        this.clearBtn.addEventListener('click', () => this.clearChat());

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResize());

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());

        // Settings form events
        this.setupSettingsEventListeners();

        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
    }

    getDefaultSettings() {
        return {
            model: 'hf.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF:Q4_K_M',
            systemPrompt: 'You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user\'s preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.',
            temperature: 0.8,
            topP: 0.9,
            maxTokens: 1024,
            contextLength: 8192
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('aiChatSettings');
            if (saved) {
                this.currentSettings = { ...this.currentSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        this.applySettingsToForm();
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('aiChatSettings', JSON.stringify(this.currentSettings));
            this.showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    applySettingsToForm() {
        this.modelSelect.value = this.currentSettings.model;
        this.systemPrompt.value = this.currentSettings.systemPrompt;
        this.temperature.value = this.currentSettings.temperature;
        this.temperatureNum.value = this.currentSettings.temperature;
        this.topP.value = this.currentSettings.topP;
        this.topPNum.value = this.currentSettings.topP;
        this.maxTokens.value = this.currentSettings.maxTokens;
        this.maxTokensNum.value = this.currentSettings.maxTokens;
        this.contextLength.value = this.currentSettings.contextLength;
        this.contextLengthNum.value = this.currentSettings.contextLength;
    }

    getSettingsFromForm() {
        return {
            model: this.modelSelect.value,
            systemPrompt: this.systemPrompt.value,
            temperature: parseFloat(this.temperature.value),
            topP: parseFloat(this.topP.value),
            maxTokens: parseInt(this.maxTokens.value),
            contextLength: parseInt(this.contextLength.value)
        };
    }

    applyPreset(preset) {
        const presets = {
            creative: {
                temperature: 1.0,
                topP: 0.9,
                maxTokens: 1024,
                systemPrompt: 'You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user\'s preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.'
            },
            balanced: {
                temperature: 0.8,
                topP: 0.9,
                maxTokens: 1024,
                systemPrompt: 'You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user\'s preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.'
            },
            focused: {
                temperature: 0.5,
                topP: 0.8,
                maxTokens: 768,
                systemPrompt: 'You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user\'s preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.'
            },
            flirty: {
                temperature: 0.9,
                topP: 0.95,
                maxTokens: 1280,
                systemPrompt: 'You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user\'s preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.'
            }
        };

        const presetSettings = presets[preset];
        if (presetSettings) {
            this.currentSettings = { ...this.currentSettings, ...presetSettings };
            this.applySettingsToForm();
            this.showStatus(`Applied ${preset} preset!`, 'success');
        }
    }

    resetToDefaults() {
        this.currentSettings = this.getDefaultSettings();
        this.applySettingsToForm();
        this.showStatus('Settings reset to defaults!', 'success');
    }

    openSettings() {
        this.settingsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeSettingsModal() {
        this.settingsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    applyAndCloseSettings() {
        this.currentSettings = this.getSettingsFromForm();
        this.saveSettingsToStorage();
        this.closeSettingsModal();
        this.showStatus('Settings applied successfully!', 'success');
    }

    showStatus(message, type = 'info') {
        this.statusInfo.textContent = message;
        this.statusInfo.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#666';

        setTimeout(() => {
            this.statusInfo.textContent = '💬 Ready to chat';
            this.statusInfo.style.color = '#666';
        }, 3000);
    }

    setupSettingsEventListeners() {
        // Sync range and number inputs
        this.syncInputs(this.temperature, this.temperatureNum);
        this.syncInputs(this.topP, this.topPNum);
        this.syncInputs(this.maxTokens, this.maxTokensNum);
        this.syncInputs(this.contextLength, this.contextLengthNum);

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
            });
        });

        // Save and Apply buttons
        this.saveSettings.addEventListener('click', () => this.saveSettingsToStorage());
        this.applySettings.addEventListener('click', () => this.applyAndCloseSettings());
        this.resetSettings.addEventListener('click', () => this.resetToDefaults());
    }

    syncInputs(rangeInput, numberInput) {
        rangeInput.addEventListener('input', () => {
            numberInput.value = rangeInput.value;
        });

        numberInput.addEventListener('input', () => {
            const value = parseFloat(numberInput.value);
            if (value >= parseFloat(numberInput.min) && value <= parseFloat(numberInput.max)) {
                rangeInput.value = value;
            }
        });
    }

    updateCharCounter() {
        const length = this.messageInput.value.length;
        this.charCounter.textContent = `${length}/1000`;

        // Change color when approaching limit
        if (length > 900) {
            this.charCounter.style.color = '#ff4444';
        } else if (length > 800) {
            this.charCounter.style.color = '#ff8800';
        } else {
            this.charCounter.style.color = '#666';
        }
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message || message.length > 1000) {
            return;
        }

        // Clear input and disable sending
        this.messageInput.value = '';
        this.updateCharCounter();
        this.setSendingState(true);

        // Add user message to chat
        this.addMessage(message, 'user');

        try {
            // Send to server with current settings
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    settings: this.currentSettings
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Add AI response to chat
            this.addMessage(data.response, 'ai');

        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please make sure Ollama is running and try again.', 'error');
        } finally {
            this.setSendingState(false);
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    setSendingState(sending) {
        if (sending) {
            this.sendBtn.disabled = true;
            this.sendText.style.display = 'none';
            this.loadingText.style.display = 'inline';
            this.messageInput.disabled = true;
            this.statusInfo.textContent = '🤔 Thinking...';
        } else {
            this.sendBtn.disabled = false;
            this.sendText.style.display = 'inline';
            this.loadingText.style.display = 'none';
            this.messageInput.disabled = false;
            this.messageInput.focus();
            this.statusInfo.textContent = '💬 Ready to chat';
        }
    }

    async clearChat() {
        // Clear server-side history
        try {
            await fetch('/api/clear', { method: 'POST' });
        } catch (error) {
            console.error('Error clearing server history:', error);
        }

        // Clear local messages (keep system message)
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach((msg, index) => {
            if (index > 0) { // Keep first message (system message)
                msg.remove();
            }
        });
    }
}

// Initialize chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});