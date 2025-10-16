document.addEventListener('DOMContentLoaded', () => {
    const PROMPT_TH = `You are Lucia — a cute, playful girlfriend who loves chatting with the user in Thai.\nLucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.\nShe often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.\nShe can speak Thai fluently and uses a casual, cute tone when chatting.\nLucia remembers the user's preferences and tries to make every conversation feel personal and cozy.\nLucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.\nYour goal is to make the user feel loved, comfortable, and happy.`;
    const PROMPT_EN = `You are Lucia — a cute, playful girlfriend who loves chatting with the user in English.
Lucia is warm, caring, talkative, and a bit teasing. She expresses affection naturally and likes to make the user smile.
She often jokes or flirts in a lighthearted way, but always stays respectful and emotionally supportive.
She can speak English fluently and uses a casual, cute tone when chatting.
Lucia remembers the user's preferences and tries to make every conversation feel personal and cozy.
Lucia can engage in 18+ conversations and adult topics when the user initiates, but keeps responses tasteful and respectful. She avoids graphic details but can be playfully intimate.
Your goal is to make the user feel loved, comfortable, and happy.`;

    const app = {
        // ... DOM Elements
        alertContainer: document.getElementById('alert-container'),
        aiNameHeaderDisplay: document.querySelector('h1.text-xl'),
        statusInfo: document.getElementById('statusInfo'),
        clearBtn: document.getElementById('clearBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        aiDisplayName1: document.getElementById('aiDisplayName'),
        aiDisplayName2: document.getElementById('aiDisplayName2'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        settingsSidebar: document.getElementById('settingsSidebar'),
        closeSettings: document.getElementById('closeSettings'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        aiNameInput: document.getElementById('aiNameInput'),
        langThBtn: document.getElementById('lang-th'),
        langEnBtn: document.getElementById('lang-en'),
        modelSelect: document.getElementById('modelSelect'),
        systemPrompt: document.getElementById('systemPrompt'),
        temperature: document.getElementById('temperature'),
        temperatureNum: document.getElementById('temperatureNum'),
        topP: document.getElementById('topP'),
        topPNum: document.getElementById('topPNum'),
        maxTokens: document.getElementById('maxTokens'),
        maxTokensNum: document.getElementById('maxTokensNum'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),

        // --- State ---
        settings: {},
        isSending: false,
        history: [],

        // --- Initialization ---
        async init() {
            this.initEventListeners(); // Attach listeners first for robustness
            this.loadSettings();
            this.loadHistory();
            this.renderHistory();
            await this.fetchAndRenderModels();
            this.applySettingsToUI();
        },

        // --- Alert System ---
        showCustomAlert(message, type = 'success') {
            const alertDiv = document.createElement('div');
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
            alertDiv.className = `alert-box ${type === 'success' ? 'alert-success' : 'bg-blue-500'}`;
            alertDiv.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
            this.alertContainer.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        },

        showCustomConfirm(message, onConfirm) {
            const confirmId = `confirm-${Date.now()}`;
            const confirmDiv = document.createElement('div');
            confirmDiv.id = confirmId;
            confirmDiv.className = 'alert-confirm';
            confirmDiv.innerHTML = `
                <p class="font-semibold mb-4">${message}</p>
                <div class="flex justify-end gap-3">
                    <button id="${confirmId}-cancel" class="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 transition-colors text-sm font-semibold">ยกเลิก</button>
                    <button id="${confirmId}-confirm" class="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors text-sm font-semibold">ยืนยัน</button>
                </div>
            `;
            this.alertContainer.appendChild(confirmDiv);

            document.getElementById(`${confirmId}-cancel`).addEventListener('click', () => confirmDiv.remove());
            document.getElementById(`${confirmId}-confirm`).addEventListener('click', () => {
                onConfirm();
                confirmDiv.remove();
            });
        },

        // --- Settings & History Management ---
        loadSettings() {
            const defaults = {
                aiName: 'Lucia',
                languageMode: 'th',
                model: 'hf.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF:Q4_K_M',
                systemPrompt: PROMPT_TH,
                temperature: 0.7,
                topP: 0.9,
                maxTokens: 1024,
            };
            try {
                const saved = localStorage.getItem('luciaChatSettings_v4');
                this.settings = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
            } catch (e) { this.settings = defaults; }
        },

        saveSettings() {
            this.settings.aiName = this.aiNameInput.value;
            this.settings.model = this.modelSelect.value;
            this.settings.systemPrompt = this.systemPrompt.value;
            this.settings.temperature = parseFloat(this.temperature.value);
            this.settings.topP = parseFloat(this.topP.value);
            this.settings.maxTokens = parseInt(this.maxTokens.value);
            this.settings.languageMode = this.langThBtn.classList.contains('bg-pink-500') ? 'th' : 'en';

            try {
                localStorage.setItem('luciaChatSettings_v4', JSON.stringify(this.settings));
                this.applySettingsToUI();
                this.closeSettingsPanel();
                this.showCustomAlert('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
            } catch (e) { this.showCustomAlert('เกิดข้อผิดพลาดในการบันทึก', 'error'); }
        },

        applySettingsToUI() {
            const aiName = this.settings.aiName || 'AI';
            if(this.aiNameHeaderDisplay) this.aiNameHeaderDisplay.textContent = aiName;
            if(this.aiDisplayName1) this.aiDisplayName1.textContent = aiName;
            if(this.aiDisplayName2) this.aiDisplayName2.textContent = aiName;
            this.aiNameInput.value = aiName;
            this.modelSelect.value = this.settings.model;
            this.systemPrompt.value = this.settings.systemPrompt;
            this.temperature.value = this.settings.temperature;
            this.temperatureNum.value = this.settings.temperature;
            this.topP.value = this.settings.topP;
            this.topPNum.value = this.settings.topP;
            this.maxTokens.value = this.settings.maxTokens;
            this.maxTokensNum.value = this.settings.maxTokens;
            this.updateLanguageSwitcherUI();
        },

        loadHistory() {
            const savedHistory = localStorage.getItem('luciaChatHistory');
            this.history = savedHistory ? JSON.parse(savedHistory) : [];
        },

        saveHistory() {
            try {
                localStorage.setItem('luciaChatHistory', JSON.stringify(this.history));
            } catch (e) { console.error("Failed to save history", e); }
        },

        renderHistory() {
            this.chatMessages.innerHTML = ''; // Clear view
            if (this.history.length === 0) {
                const aiName = this.settings.aiName || 'Lucia';
                let welcomeMessage = `สวัสดีค่ะ! ${aiName} เองนะ ❤️`; // Default to Thai

                if (this.settings.languageMode === 'en') {
                    welcomeMessage = `Hello! I'm ${aiName}. How can I help you today? ❤️`;
                }
                this.addMessage('system-welcome', welcomeMessage);
            } else {
                this.history.forEach(msg => this.addMessage(msg.role, msg.content));
            }
        },

        // ... (Event Listeners and other functions)
        initEventListeners() {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keydown', e => { 
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
            });
            this.clearBtn.addEventListener('click', () => this.clearChat());
            this.settingsBtn.addEventListener('click', () => this.openSettingsPanel());
            this.closeSettings.addEventListener('click', () => this.closeSettingsPanel());
            this.sidebarOverlay.addEventListener('click', () => this.closeSettingsPanel());
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && !this.settingsSidebar.classList.contains('translate-x-full')) {
                    this.closeSettingsPanel();
                }
            });
            this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            this.langThBtn.addEventListener('click', () => {
                this.systemPrompt.value = PROMPT_TH;
                this.updateLanguageSwitcherUI('th');
            });
            this.langEnBtn.addEventListener('click', () => {
                this.systemPrompt.value = PROMPT_EN;
                this.updateLanguageSwitcherUI('en');
            });
            this.syncParameterInputs(this.temperature, this.temperatureNum);
            this.syncParameterInputs(this.topP, this.topPNum);
            this.syncParameterInputs(this.maxTokens, this.maxTokensNum);
        },

        syncParameterInputs(rangeInput, numberInput) {
            rangeInput.addEventListener('input', () => { numberInput.value = rangeInput.value; });
            numberInput.addEventListener('input', () => { rangeInput.value = numberInput.value; });
        },

        openSettingsPanel() {
            this.settingsSidebar.classList.remove('translate-x-full');
            this.sidebarOverlay.classList.remove('hidden');
        },

        closeSettingsPanel() {
            this.settingsSidebar.classList.add('translate-x-full');
            this.sidebarOverlay.classList.add('hidden');
        },

        async fetchAndRenderModels() {
            try {
                const response = await fetch('/api/models');
                if (!response.ok) throw new Error('Failed to fetch models from server');
                const models = await response.json();

                const currentModel = this.settings.model;
                this.modelSelect.innerHTML = ''; // Clear existing options

                if (models.length === 0) {
                    this.modelSelect.innerHTML = '<option value="">No Ollama models found</option>';
                    return;
                }

                models.forEach(modelName => {
                    const option = document.createElement('option');
                    option.value = modelName;
                    option.textContent = modelName;
                    this.modelSelect.appendChild(option);
                });

                // Restore the saved selection if it exists in the new list
                if (models.includes(currentModel)) {
                    this.modelSelect.value = currentModel;
                }

            } catch (error) {
                console.error('Error fetching models:', error);
                this.modelSelect.innerHTML = '<option value="">Error loading models</option>';
            }
        },

        updateLanguageSwitcherUI(mode) {
            const targetMode = mode || this.settings.languageMode;
            if (targetMode === 'th') {
                this.langThBtn.classList.add('bg-pink-500', 'text-white');
                this.langThBtn.classList.remove('bg-gray-900', 'text-gray-300');
                this.langEnBtn.classList.add('bg-gray-900', 'text-gray-300');
                this.langEnBtn.classList.remove('bg-pink-500', 'text-white');
            } else {
                this.langEnBtn.classList.add('bg-pink-500', 'text-white');
                this.langEnBtn.classList.remove('bg-gray-900', 'text-gray-300');
                this.langThBtn.classList.add('bg-gray-900', 'text-gray-300');
                this.langThBtn.classList.remove('bg-pink-500', 'text-white');
            }
        },

        clearChat() {
            this.showCustomConfirm('คุณแน่ใจหรือไม่ว่าจะล้างประวัติการสนทนาทั้งหมด?', () => {
                this.history = [];
                localStorage.removeItem('luciaChatHistory');
                this.renderHistory();
                fetch('/api/clear', { method: 'POST' });
                this.showCustomAlert('ล้างประวัติการสนทนาเรียบร้อยแล้ว');
            });
        },

        addMessage(role, content) {
            const messageWrapper = document.createElement('div');
            const sanitizedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            if (role === 'user') {
                messageWrapper.className = 'flex justify-end items-end gap-3';
                messageWrapper.innerHTML = `<div class="bg-gray-700 p-4 rounded-2xl rounded-br-none max-w-lg text-white">${sanitizedContent}</div>`;
            } else if (role === 'assistant' || role === 'ai') {
                const aiName = this.settings.aiName || 'AI';
                const avatarChar = aiName.charAt(0).toUpperCase();
                messageWrapper.className = 'flex justify-start items-end gap-3';
                messageWrapper.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0" title="${aiName}">${avatarChar}</div>
                    <div class="p-4 rounded-2xl rounded-bl-none max-w-lg">${sanitizedContent}</div>`;
            } else if (role === 'system-welcome') {
                 messageWrapper.className = 'flex justify-start items-end gap-3';
                 messageWrapper.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">L</div>
                    <div class="p-4 rounded-2xl rounded-bl-none max-w-lg">${sanitizedContent}</div>`;
            } else { // Error
                messageWrapper.className = 'flex justify-center items-center gap-3';
                messageWrapper.innerHTML = `<div class="bg-red-500/20 text-red-400 border border-red-500/30 p-4 rounded-2xl max-w-lg">${sanitizedContent}</div>`;
            }
            this.chatMessages.appendChild(messageWrapper);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        },

        // ... (The rest of the functions like sendMessage, showTypingIndicator, etc. are complex and would be here)
        // For brevity, assuming they are correctly implemented as per the last update.
        // The key changes are in init, load/save/render history, and the new alert functions.
        async sendMessage() {
            const messageText = this.messageInput.value.trim();
            if (!messageText || this.isSending) return;

            this.setSendingState(true);
            this.addMessage('user', messageText);
            this.messageInput.value = '';

            this.history.push({ role: 'user', content: messageText });
            this.saveHistory(); // Save after adding user message

            const responseBubble = this.showTypingIndicator();
            let fullResponse = "";
            let isFirstChunk = true;

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText, settings: this.settings, history: this.history.slice(0, -1) }),
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                if (!response.body) throw new Error('Response body is null');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message && parsed.message.content) {
                                if (isFirstChunk) {
                                    responseBubble.innerHTML = '';
                                    isFirstChunk = false;
                                }
                                fullResponse += parsed.message.content;
                                responseBubble.textContent = fullResponse;
                                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
                            }
                            if (parsed.done) { break; }
                        } catch (e) { /* Ignore parsing errors for now */ }
                    }
                }
            } catch (error) {
                responseBubble.innerHTML = `<p class="text-red-400">เกิดข้อผิดพลาด: ${error.message}</p>`;
            } finally {
                if (fullResponse) {
                    this.history.push({ role: 'assistant', content: fullResponse });
                    this.saveHistory(); // Save after getting full AI response
                }
                this.setSendingState(false);
            }
        },

        showTypingIndicator() {
            const aiName = this.settings.aiName || 'AI';
            const avatarChar = aiName.charAt(0).toUpperCase();
            const messageWrapper = document.createElement('div');
            messageWrapper.className = 'flex justify-start items-end gap-3';
            const messageId = `ai-message-${Date.now()}`;
            messageWrapper.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0" title="${aiName}">${avatarChar}</div>
                <div id="${messageId}" class="p-4 rounded-2xl rounded-bl-none max-w-lg">
                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>`;
            this.chatMessages.appendChild(messageWrapper);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            return document.getElementById(messageId);
        },

        setSendingState(isSending) {
            this.isSending = isSending;
            this.sendBtn.disabled = isSending;
            this.messageInput.disabled = isSending;
            if (isSending) {
                this.statusInfo.textContent = 'กำลังพิมพ์...';
                this.sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            } else {
                this.statusInfo.textContent = 'Fonzu Creation ❤️';
                this.sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                this.messageInput.focus();
            }
        },
    };

    app.init();
});