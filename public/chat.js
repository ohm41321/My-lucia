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
        // Enhanced Translation Zone Elements
        translationZone: document.getElementById('translationZone'),
        toggleTranslationZone: document.getElementById('toggleTranslationZone'),
        translationInterface: document.getElementById('translationInterface'),
        detectedLang: document.getElementById('detectedLang'),
        autoTranslateToggle: document.getElementById('autoTranslateToggle'),
        langDetectBtn: document.getElementById('langDetectBtn'),
        sourceLang: document.getElementById('sourceLang'),
        targetLang: document.getElementById('targetLang'),
        swapLanguages: document.getElementById('swapLanguages'),
        sourceText: document.getElementById('sourceText'),
        clearSourceBtn: document.getElementById('clearSourceBtn'),
        sourceCharCount: document.getElementById('sourceCharCount'),
        translationOutput: document.getElementById('translationOutput'),
        translationStatus: document.getElementById('translationStatus'),
        copyTranslation: document.getElementById('copyTranslation'),
        speakTranslation: document.getElementById('speakTranslation'),
        translateBtn: document.getElementById('translateBtn'),
        addToChatBtn: document.getElementById('addToChatBtn'),
        translateChatHistory: document.getElementById('translateChatHistory'),

        // Legacy elements for backward compatibility
        translationSection: document.getElementById('translationSection'),
        toggleTranslation: document.getElementById('toggleTranslation'),
        translationInputContainer: document.getElementById('translationInputContainer'),
        thaiInput: document.getElementById('thaiInput'),
        translateToEnglishBtn: document.getElementById('translateToEnglishBtn'),
        copyTranslationBtn: document.getElementById('copyTranslationBtn'),
        englishOutput: document.getElementById('englishOutput'),
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
         autoTranslateTimeout: null,

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
                // Enhanced translation settings
                autoTranslate: false,
                sourceLanguage: 'auto',
                targetLanguage: 'th',
                translationHistory: []
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

            // Save enhanced translation settings
            this.settings.sourceLanguage = this.sourceLang?.value || 'auto';
            this.settings.targetLanguage = this.targetLang?.value || 'th';
            this.settings.autoTranslate = this.settings.autoTranslate || false;

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

            // Apply enhanced translation settings
            if (this.sourceLang) {
                this.sourceLang.value = this.settings.sourceLanguage || 'auto';
            }
            if (this.targetLang) {
                this.targetLang.value = this.settings.targetLanguage || 'th';
            }
            if (this.autoTranslateToggle && this.settings.autoTranslate) {
                this.autoTranslateToggle.classList.remove('bg-gray-600');
                this.autoTranslateToggle.classList.add('bg-purple-600');
                this.autoTranslateToggle.innerHTML = '<i class="fa-solid fa-magic text-xs"></i> แปลอัตโนมัติ (เปิด)';
            }
            this.updateTranslationSettings();
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
                this.history.forEach(msg => {
                    // Use translated content if available and in English mode
                    const contentToShow = (msg.translatedContent && this.settings.languageMode === 'en')
                        ? msg.translatedContent
                        : msg.content;
                    this.addMessage(msg.role, contentToShow);
                });
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

            // Enhanced Translation Zone Event Listeners
            if (this.toggleTranslationZone) {
                this.toggleTranslationZone.addEventListener('click', () => this.toggleTranslationZoneInterface());
            }
            if (this.langDetectBtn) {
                this.langDetectBtn.addEventListener('click', () => this.detectLanguage());
            }
            if (this.swapLanguages) {
                this.swapLanguages.addEventListener('click', () => this.swapLanguageDirection());
            }
            if (this.sourceText) {
                this.sourceText.addEventListener('input', () => this.updateSourceCharCount());
                this.sourceText.addEventListener('paste', () => setTimeout(() => this.handleSourceTextChange(), 10));
            }
            if (this.clearSourceBtn) {
                this.clearSourceBtn.addEventListener('click', () => this.clearSourceText());
            }
            if (this.translateBtn) {
                this.translateBtn.addEventListener('click', () => this.performTranslation());
            }
            if (this.copyTranslation) {
                this.copyTranslation.addEventListener('click', () => this.copyTranslatedText());
            }
            if (this.speakTranslation) {
                this.speakTranslation.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (speechSynthesis.speaking) {
                        speechSynthesis.cancel();
                    } else {
                        this.speakTranslatedText();
                    }
                });
            }
            if (this.addToChatBtn) {
                this.addToChatBtn.addEventListener('click', () => this.addTranslationToChat());
            }
            if (this.translateChatHistory) {
                this.translateChatHistory.addEventListener('click', () => this.translateChatHistoryMessages());
            }
            if (this.autoTranslateToggle) {
                this.autoTranslateToggle.addEventListener('click', () => this.toggleAutoTranslate());
            }
            if (this.sourceLang) {
                this.sourceLang.addEventListener('change', () => this.updateTranslationSettings());
            }
            if (this.targetLang) {
                this.targetLang.addEventListener('change', () => this.updateTranslationSettings());
            }

            // Legacy translation section event listeners (for backward compatibility)
            if (this.toggleTranslation) {
                this.toggleTranslation.addEventListener('click', () => this.toggleTranslationSection());
            }
            if (this.translateToEnglishBtn) {
                this.translateToEnglishBtn.addEventListener('click', () => this.handleThaiToEnglishTranslation());
            }
            if (this.copyTranslationBtn) {
                this.copyTranslationBtn.addEventListener('click', () => this.copyTranslatedText());
            }

            // Add event listener for translate buttons
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('translate-btn') || e.target.closest('.translate-btn')) {
                    const button = e.target.classList.contains('translate-btn') ? e.target : e.target.closest('.translate-btn');
                    this.handleTranslateClick(button);
                }
            });
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

        _createTranslateButtonHTML(content) {
            if (this.settings.languageMode !== 'en') return '';

            // Redesigned translate button: subtle, icon-only, at the bottom-right of the bubble.
            return `<div class="flex justify-end items-center mt-2 -mb-2 -mr-1">
                        <button title="แปลเป็นภาษาไทย" class="translate-btn text-xs hover:bg-gray-900/20 text-gray-400 hover:text-gray-100 w-8 h-8 rounded-full transition-colors flex items-center justify-center" data-content="${btoa(encodeURIComponent(content))}">
                            <i class="fa-solid fa-language text-sm"></i>
                        </button>
                     </div>`;
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

        _createTranslateButtonHTML(content) {
            if (this.settings.languageMode !== 'en') return '';

            // Redesigned translate button: subtle, icon-only, at the bottom-right of the bubble.
            return `<div class="flex justify-end items-center mt-2 -mb-2 -mr-1">
                        <button title="แปลเป็นภาษาไทย" class="translate-btn text-xs hover:bg-gray-900/20 text-gray-400 hover:text-gray-100 w-8 h-8 rounded-full transition-colors flex items-center justify-center" data-content="${btoa(encodeURIComponent(content))}">
                            <i class="fa-solid fa-language text-sm"></i>
                        </button>
                     </div>`;
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

                const translateButton = this._createTranslateButtonHTML(content);

                messageWrapper.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0" title="${aiName}">${avatarChar}</div>
                    <div class="rounded-2xl rounded-bl-none max-w-lg">
                        <div>${sanitizedContent}</div>
                        ${translateButton}
                    </div>`;
            } else if (role === 'system-welcome') {
                 messageWrapper.className = 'flex justify-start items-end gap-3';
                 messageWrapper.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">L</div>
                    <div class="rounded-2xl rounded-bl-none max-w-lg">${sanitizedContent}</div>`;
            } else { // Error
                messageWrapper.className = 'flex justify-center items-center gap-3';
                messageWrapper.innerHTML = `<div class="bg-red-500/20 text-red-400 border border-red-500/30 p-4 rounded-2xl max-w-lg">${sanitizedContent}</div>`;
            }
            this.chatMessages.appendChild(messageWrapper);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        },

        // --- Translation Functions ---

        // Core function to fetch translation from the API. No length checks here.
        async _fetchTranslation(text, fromLang, toLang) {
            // Using Google Translate API (free alternative)
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`);

            if (!response.ok) {
                throw new Error(`Translation API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Translation API response received');

            // The API returns an array of sentences. We need to join them.
            if (data && data[0] && Array.isArray(data[0])) {
                const translatedText = data[0]
                    .map(chunk => chunk[0])
                    .filter(Boolean)
                    .join('');
                
                if (translatedText) {
                    return translatedText;
                }
            }

            throw new Error('Unexpected response format or empty translation');
        },

        async translateText(text, fromLang, toLang) {
            try {
                // For text that is too long, use the chunking strategy.
                // The unofficial Google Translate API has limits on GET request length.
                // A value around 1800 is safer than 5000.
                const maxLength = 1800;
                if (text.length > maxLength) {
                    return await this.translateLongText(text, fromLang, toLang);
                }

                console.log(`Translating text of length: ${text.length}`);
                return await this.translateTextWithRetry(text, fromLang, toLang);

            } catch (error) {
                console.error('Translation error:', error);
                // If it fails, try the long text method as a fallback for medium-length text
                if (text.length > 200 && text.length <= 1800) {
                    console.log('Translation failed, falling back to long text handler.');
                    return await this.translateLongText(text, fromLang, toLang);
                }
                // Otherwise, return original text
                return text;
            }
        },

        async translateLongText(text, fromLang, toLang) {
            // This function handles very long text by splitting it into chunks.
            const chunks = [];
            // A smaller chunk size is more reliable for the free API.
            const maxChunkLength = 450;

            // Split by sentences first for better context preservation.
            const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
            let currentChunk = '';

            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > maxChunkLength) {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk) chunks.push(currentChunk);

            // If sentence splitting results in chunks that are still too large, split by character count.
            const finalChunks = [];
            for (const chunk of chunks) {
                if (chunk.length > maxChunkLength) {
                    for (let i = 0; i < chunk.length; i += maxChunkLength) {
                        finalChunks.push(chunk.slice(i, i + maxChunkLength));
                    }
                } else {
                    finalChunks.push(chunk);
                }
            }

            console.log(`Translating ${finalChunks.length} chunks for text of length ${text.length}`);

            const translatedChunks = [];
            for (const chunk of finalChunks) {
                try {
                    // Add a small delay between chunks to avoid being rate-limited.
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const translatedChunk = await this.translateTextWithRetry(chunk, fromLang, toLang, 2);
                    translatedChunks.push(translatedChunk);
                } catch (error) {
                    console.error(`Failed to translate chunk:`, error);
                    translatedChunks.push(chunk); // Use original as fallback for the failed chunk.
                }
            }

            const result = translatedChunks.join(' ');
            console.log(`Final translation length: ${result.length}`);
            return result;
        },

        async translateTextWithRetry(text, fromLang, toLang, maxRetries = 3) {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    // Call the core fetch function directly, bypassing length checks.
                    return await this._fetchTranslation(text, fromLang, toLang);
                } catch (error) {
                    console.error(`Translation attempt ${attempt} failed:`, error.message);
                    if (attempt === maxRetries) {
                        throw error; // Rethrow after final attempt
                    }
                    // Wait before retry with exponential backoff.
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        },

        async translateToThai(text) {
            return await this.translateText(text, 'en', 'th');
        },

        async translateToEnglish(text) {
            return await this.translateText(text, 'th', 'en');
        },

        toggleTranslationSection() {
            const isHidden = this.translationInputContainer.classList.contains('hidden');
            if (isHidden) {
                this.translationInputContainer.classList.remove('hidden');
                this.toggleTranslation.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
            } else {
                this.translationInputContainer.classList.add('hidden');
                this.toggleTranslation.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
            }
        },

        async handleThaiToEnglishTranslation() {
            const thaiText = this.thaiInput.value.trim();
            if (!thaiText) {
                this.showCustomAlert('กรุณาพิมพ์ข้อความที่ต้องการแปล', 'error');
                return;
            }

            try {
                // Show loading state
                this.translateToEnglishBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังแปล...';
                this.translateToEnglishBtn.disabled = true;

                // Translate text
                const translatedText = await this.translateToEnglish(thaiText);

                // Show result
                this.englishOutput.textContent = translatedText;
                this.englishOutput.classList.remove('hidden');
                this.copyTranslationBtn.classList.remove('hidden');
                this.copyTranslationBtn.setAttribute('data-text', btoa(encodeURIComponent(translatedText)));

                // Reset button
                this.translateToEnglishBtn.innerHTML = '<i class="fa-solid fa-language"></i> แปล';
                this.translateToEnglishBtn.disabled = false;

            } catch (error) {
                console.error('Translation error:', error);
                this.translateToEnglishBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> แปลไม่ได้';
                this.showCustomAlert('เกิดข้อผิดพลาดในการแปล', 'error');
            }
        },

        copyTranslatedText() {
            const textToCopy = decodeURIComponent(atob(this.copyTranslationBtn.getAttribute('data-text')));
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showCustomAlert('คัดลอกข้อความแล้ว!');
            }).catch(() => {
                this.showCustomAlert('ไม่สามารถคัดลอกได้', 'error');
            });
        },

        // === Enhanced Translation Zone Methods ===

        toggleTranslationZoneInterface() {
            const isHidden = this.translationInterface.classList.contains('hidden');
            if (isHidden) {
                this.translationInterface.classList.remove('hidden');
                this.toggleTranslationZone.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
                this.sourceText?.focus();
            } else {
                this.translationInterface.classList.add('hidden');
                this.toggleTranslationZone.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
            }
        },

        updateSourceCharCount() {
            const length = this.sourceText.value.length;
            this.sourceCharCount.textContent = `${length} ตัวอักษร`;
            if (length > 5000) {
                this.sourceCharCount.className = 'text-yellow-400';
            } else if (length > 1000) {
                this.sourceCharCount.className = 'text-blue-400';
            } else {
                this.sourceCharCount.className = 'text-gray-400';
            }
        },

        handleSourceTextChange() {
            const text = this.sourceText.value.trim();
            if (text && this.settings.autoTranslate) {
                // Debounce the translation to avoid too many API calls
                clearTimeout(this.autoTranslateTimeout);
                this.autoTranslateTimeout = setTimeout(() => {
                    this.performTranslation();
                }, 1000); // Wait 1 second after user stops typing
            }
        },

        clearSourceText() {
            this.sourceText.value = '';
            this.updateSourceCharCount();
            this.hideTranslationOutput();
        },

        hideTranslationOutput() {
            this.translationOutput.innerHTML = `
                <div class="text-center text-gray-400">
                    <i class="fa-solid fa-language text-2xl mb-2 block"></i>
                    กำลังรอข้อความที่จะแปล...
                </div>
            `;
            this.copyTranslation.classList.add('hidden');
            this.speakTranslation.classList.add('hidden');
            this.addToChatBtn.classList.add('hidden');
        },

        showTranslationOutput(translatedText, sourceText) {
            const shouldScroll = translatedText.length > 300;
            const textContainerClass = shouldScroll ? 'max-h-40 overflow-y-auto text-sm pr-2 scrollable-translation' : 'text-sm';

            this.translationOutput.innerHTML = `
                <div class="${textContainerClass}">${translatedText}</div>
            `;

            // Show action buttons
            this.copyTranslation.classList.remove('hidden');
            this.speakTranslation.classList.remove('hidden');
            this.addToChatBtn.classList.remove('hidden');

            // Store translation data for actions
            const encodedText = btoa(encodeURIComponent(translatedText));
            this.copyTranslation.setAttribute('data-text', encodedText);
            this.speakTranslation.setAttribute('data-text', encodedText);
            this.addToChatBtn.setAttribute('data-text', encodedText);

            // Also store in the translation output element for easy access
            this.translationOutput.setAttribute('data-translated-text', translatedText);
        },

        async detectLanguage() {
            const text = this.sourceText.value.trim();
            if (!text) {
                this.showCustomAlert('กรุณาพิมพ์ข้อความก่อนตรวจสอบภาษา', 'error');
                return;
            }

            try {
                this.langDetectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i> กำลังตรวจสอบ...';
                this.langDetectBtn.disabled = true;

                // Use a simple heuristic for language detection
                const detected = this.simpleLanguageDetection(text);

                // Update UI
                this.detectedLang.classList.remove('hidden');
                this.detectedLang.innerHTML = `
                    <i class="fa-solid fa-circle text-green-400 text-xs mr-1"></i>
                    ตรวจพบ: ${this.getLanguageName(detected)}
                `;

                // Auto-set source language if not set to manual
                if (this.sourceLang.value === 'auto') {
                    this.sourceLang.value = detected;
                    this.updateTranslationSettings();
                }

                this.showCustomAlert(`ตรวจพบภาษา: ${this.getLanguageName(detected)}`);

            } catch (error) {
                console.error('Language detection error:', error);
                this.showCustomAlert('ไม่สามารถตรวจสอบภาษาได้', 'error');
            } finally {
                this.langDetectBtn.innerHTML = '<i class="fa-solid fa-search text-xs"></i> ตรวจสอบภาษา';
                this.langDetectBtn.disabled = false;
            }
        },

        simpleLanguageDetection(text) {
            // Thai detection
            if (/[\u0E00-\u0E7F]/.test(text)) return 'th';

            // Chinese detection (CJK)
            if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';

            // Japanese (Hiragana, Katakana, Kanji)
            if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) return 'ja';

            // Korean (Hangul)
            if (/[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/.test(text)) return 'ko';

            // Default to English for Latin characters
            return 'en';
        },

        getLanguageName(code) {
            const languages = {
                'th': 'ไทย',
                'en': 'อังกฤษ',
                'zh': 'จีน',
                'ja': 'ญี่ปุ่น',
                'ko': 'เกาหลี',
                'auto': 'อัตโนมัติ'
            };
            return languages[code] || code;
        },

        swapLanguageDirection() {
            const sourceVal = this.sourceLang.value;
            const targetVal = this.targetLang.value;

            this.sourceLang.value = targetVal;
            this.targetLang.value = sourceVal;

            // Also swap text if both fields have content
            const sourceText = this.sourceText.value;
            const translatedText = this.translationOutput.textContent;

            if (sourceText && translatedText && translatedText !== 'กำลังรอข้อความที่จะแปล...') {
                this.sourceText.value = translatedText;
                this.showTranslationOutput(sourceText, translatedText);
                this.updateSourceCharCount();
            }

            this.updateTranslationSettings();
        },

        updateTranslationSettings() {
            const sourceLang = this.sourceLang.value;
            const targetLang = this.targetLang.value;

            // Update status
            if (sourceLang === 'auto') {
                this.translationStatus.textContent = 'พร้อมแปล (โหมดตรวจสอบอัตโนมัติ)';
            } else {
                this.translationStatus.textContent = `แปลจาก ${this.getLanguageName(sourceLang)} เป็น ${this.getLanguageName(targetLang)}`;
            }
        },

        async performTranslation() {
            const text = this.sourceText.value.trim();
            if (!text) {
                this.showCustomAlert('กรุณาพิมพ์ข้อความที่ต้องการแปล', 'error');
                return;
            }

            const sourceLang = this.sourceLang.value;
            const targetLang = this.targetLang.value;

            try {
                // Show loading state
                this.translateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังแปล...';
                this.translateBtn.disabled = true;
                this.translationStatus.textContent = 'กำลังแปล...';

                // Perform translation
                const translatedText = await this.translateText(text, sourceLang, targetLang);

                // Show result
                this.showTranslationOutput(translatedText, text);
                this.translationStatus.textContent = 'แปลเสร็จแล้ว';

                this.showCustomAlert('แปลเรียบร้อยแล้ว!');

            } catch (error) {
                console.error('Translation error:', error);
                this.translationStatus.textContent = 'เกิดข้อผิดพลาดในการแปล';
                this.showCustomAlert('เกิดข้อผิดพลาดในการแปล', 'error');
            } finally {
                this.translateBtn.innerHTML = '<i class="fa-solid fa-language"></i> แปลเลย';
                this.translateBtn.disabled = false;
            }
        },

        copyTranslatedText() {
            const translatedText = this.translationOutput.textContent.trim();
            if (translatedText && translatedText !== 'กำลังรอข้อความที่จะแปล...') {
                navigator.clipboard.writeText(translatedText).then(() => {
                    this.showCustomAlert('คัดลอกข้อความแล้ว!');
                }).catch((error) => {
                    console.error('Copy failed:', error);
                    this.showCustomAlert('ไม่สามารถคัดลอกได้', 'error');
                });
            } else {
                this.showCustomAlert('ไม่มีข้อความที่จะคัดลอก', 'error');
            }
        },

        async translateChatHistoryMessages() {
            const messages = this.history.filter(msg => msg.role === 'assistant' || msg.role === 'user');
            if (messages.length === 0) {
                this.showCustomAlert('ไม่มีประวัติสนทนาที่จะแปล', 'error');
                return;
            }

            try {
                this.translateChatHistory.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังแปล...';
                this.translateChatHistory.disabled = true;

                this.showCustomAlert(`กำลังแปล ${messages.length} ข้อความ...`, 'info');

                for (let i = 0; i < messages.length; i++) {
                    const msg = messages[i];
                    if (msg.role === 'assistant' && this.settings.languageMode === 'en') {
                        // Translate AI messages from English to Thai
                        const translatedContent = await this.translateText(msg.content, 'en', 'th');
                        msg.translatedContent = translatedContent;
                    }
                }

                this.saveHistory();
                this.showCustomAlert('แปลประวัติสนทนาเรียบร้อยแล้ว!');
                this.renderHistory(); // Re-render to show translated content

            } catch (error) {
                console.error('Chat history translation error:', error);
                this.showCustomAlert('เกิดข้อผิดพลาดในการแปลประวัติ', 'error');
            } finally {
                this.translateChatHistory.innerHTML = '<i class="fa-solid fa-history"></i> แปลประวัติสนทนา';
                this.translateChatHistory.disabled = false;
            }
        },

        addTranslationToChat() {
            const translatedText = this.translationOutput.textContent.trim();
            if (translatedText && translatedText !== 'กำลังรอข้อความที่จะแปล...') {
                this.messageInput.value = translatedText;
                this.messageInput.focus();
                // Trigger input event to update UI
                this.messageInput.dispatchEvent(new Event('input'));
                this.showCustomAlert('ข้อความถูกเพิ่มในช่องสนทนาแล้ว!');
            } else {
                this.showCustomAlert('ไม่มีข้อความที่จะส่งไปยังห้องสนทนา', 'error');
            }
        },

        speakTranslatedText() {
            const translatedText = this.translationOutput.getAttribute('data-translated-text') ||
                                 this.translationOutput.textContent.trim();

            if (translatedText && translatedText !== 'กำลังรอข้อความที่จะแปล...') {
                if ('speechSynthesis' in window) {
                    // Cancel any ongoing speech
                    speechSynthesis.cancel();

                    const utterance = new SpeechSynthesisUtterance(translatedText);
                    utterance.lang = this.getLanguageCodeForSpeech(this.targetLang.value);
                    utterance.rate = 0.8;
                    utterance.pitch = 1;

                    // Update button state during speech
                    const originalText = this.speakTranslation.innerHTML;
                    this.speakTranslation.innerHTML = '<i class="fa-solid fa-stop"></i>';
                    this.speakTranslation.classList.add('bg-red-600', 'hover:bg-red-700');

                    utterance.onend = () => {
                        this.speakTranslation.innerHTML = originalText;
                        this.speakTranslation.classList.remove('bg-red-600', 'hover:bg-red-700');
                        this.speakTranslation.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    };

                    utterance.onerror = () => {
                        this.speakTranslation.innerHTML = originalText;
                        this.speakTranslation.classList.remove('bg-red-600', 'hover:bg-red-700');
                        this.speakTranslation.classList.add('bg-blue-600', 'hover:bg-blue-700');
                        this.showCustomAlert('เกิดข้อผิดพลาดในการอ่านข้อความ', 'error');
                    };

                    speechSynthesis.speak(utterance);
                } else {
                    this.showCustomAlert('เบราว์เซอร์นี้ไม่รองรับการอ่านข้อความ', 'error');
                }
            } else {
                this.showCustomAlert('ไม่มีข้อความที่จะอ่าน', 'error');
            }
        },

        getLanguageCodeForSpeech(langCode) {
            const speechCodes = {
                'th': 'th-TH',
                'en': 'en-US',
                'zh': 'zh-CN',
                'ja': 'ja-JP',
                'ko': 'ko-KR'
            };
            return speechCodes[langCode] || 'en-US';
        },

        toggleAutoTranslate() {
            this.settings.autoTranslate = !this.settings.autoTranslate;
            const isEnabled = this.settings.autoTranslate;

            if (isEnabled) {
                this.autoTranslateToggle.classList.remove('bg-gray-600');
                this.autoTranslateToggle.classList.add('bg-purple-600');
                this.autoTranslateToggle.innerHTML = '<i class="fa-solid fa-magic text-xs"></i> แปลอัตโนมัติ (เปิด)';
                this.showCustomAlert('เปิดใช้งานการแปลอัตโนมัติแล้ว');
            } else {
                this.autoTranslateToggle.classList.remove('bg-purple-600');
                this.autoTranslateToggle.classList.add('bg-gray-600');
                this.autoTranslateToggle.innerHTML = '<i class="fa-solid fa-magic text-xs"></i> แปลอัตโนมัติ';
                this.showCustomAlert('ปิดใช้งานการแปลอัตโนมัติแล้ว');
                // Clear any pending auto-translate timeout
                if (this.autoTranslateTimeout) {
                    clearTimeout(this.autoTranslateTimeout);
                }
            }
        },

        addTranslateButtonToLastMessage(content) {
            // Find the last AI message that doesn't have a translate button yet
            const lastMessage = this.chatMessages.querySelector('.flex.justify-start.items-end.gap-3:last-child');
            if (!lastMessage) return;

            // The bubble is the second child of the wrapper
            const messageBubble = lastMessage.children[1];
            if (!messageBubble) return;

            // Check if translate button already exists
            if (messageBubble.querySelector('.translate-btn')) return;

            // Create and append the new button using the helper
            const translateButtonHTML = this._createTranslateButtonHTML(content);
            if (translateButtonHTML) {
                messageBubble.insertAdjacentHTML('beforeend', translateButtonHTML);
            }
        },

        async handleTranslateClick(button) {
            const encodedContent = button.getAttribute('data-content');
            if (!encodedContent) return;

            try {
                const originalText = decodeURIComponent(atob(encodedContent));
                console.log(`Starting translation of text length: ${originalText.length}`);

                // Show loading state
                const originalTextContent = button.textContent;
                button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>กำลังแปล...';
                button.disabled = true;

                // Translate text with timeout
                const translatedText = await Promise.race([
                    this.translateToThai(originalText),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Translation timeout')), 60000) // Increased timeout further
                    )
                ]);

                console.log(`Translation completed. Original: ${originalText.length}, Translated: ${translatedText.length}`);

                // Validate translation result more thoroughly
                if (!translatedText || translatedText.trim().length === 0) {
                    throw new Error('Empty translation result');
                }

                // Check if translation is too short compared to original (might indicate failure)
                const lengthRatio = translatedText.length / originalText.length;
                if (lengthRatio < 0.1 && originalText.length > 100) {
                    console.warn(`Translation might be incomplete. Length ratio: ${lengthRatio}`);
                    this.showCustomAlert('การแปลอาจไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง', 'warning');
                }

                // Replace button with translated text and copy button
                const translatedDiv = document.createElement('div');
                translatedDiv.className = 'mt-2 p-3 bg-gray-600/50 rounded-lg text-sm text-gray-200 border border-gray-600';

                // Handle long translated text with scrolling
                const shouldScroll = translatedText.length > 300;
                const textContainerClass = shouldScroll ? 'max-h-40 overflow-y-auto text-sm pr-2' : 'text-sm';

                translatedDiv.innerHTML = `
                    <div class="flex items-center gap-2 mb-2 text-xs text-gray-400">
                        <i class="fa-solid fa-check-circle text-green-400"></i>
                        <span>ผลการแปล:</span>
                    </div>
                    <div class="${textContainerClass}">${translatedText}</div>
                    <div class="mt-3 flex justify-between items-center">
                        <div class="text-xs text-gray-400">
                            ต้นฉบับ: ${originalText.length} → แปลแล้ว: ${translatedText.length} ตัวอักษร
                            ${lengthRatio < 0.3 ? '<span class="text-yellow-400">(อาจไม่สมบูรณ์)</span>' : ''}
                        </div>
                        <button class="copy-translated text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors" data-text="${btoa(encodeURIComponent(translatedText))}">
                            <i class="fa-solid fa-copy mr-1"></i>คัดลอก
                        </button>
                    </div>
                `;

                button.parentNode.replaceChild(translatedDiv, button);

                // Add event listener for copy button
                translatedDiv.querySelector('.copy-translated').addEventListener('click', (e) => {
                    const copyBtn = e.target;
                    const textToCopy = decodeURIComponent(atob(copyBtn.getAttribute('data-text')));
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        this.showCustomAlert('คัดลอกข้อความแล้ว!');
                    }).catch(() => {
                        this.showCustomAlert('ไม่สามารถคัดลอกได้', 'error');
                    });
                });

            } catch (error) {
                console.error('Translation error:', error);
                button.innerHTML = '<i class="fa-solid fa-exclamation-triangle mr-1"></i>แปลไม่ได้';
                button.className = 'text-xs bg-red-500 text-white px-2 py-1 rounded mt-2';

                if (error.message === 'Translation timeout') {
                    this.showCustomAlert('การแปลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง', 'error');
                } else {
                    this.showCustomAlert(`เกิดข้อผิดพลาดในการแปล: ${error.message}`, 'error');
                }
            }
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

                    // Add translate button to the completed message if in English mode
                    if (this.settings.languageMode === 'en') {
                        this.addTranslateButtonToLastMessage(fullResponse);
                    }
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
                this.statusInfo.textContent = 'My Lucia APP V1.4.0';
                this.sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                this.messageInput.focus();
            }
        },
    };

    app.init();
});