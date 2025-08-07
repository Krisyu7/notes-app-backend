// ai.js - AI功能模块

const AI = {
    // AI服务状态
    isServiceAvailable: false,

    /**
     * 初始化AI服务
     */
    async init() {
        try {
            this.isServiceAvailable = await API.testAIService();
            console.log('AI服务状态:', this.isServiceAvailable ? '可用' : '不可用');
        } catch (error) {
            console.error('AI服务初始化失败:', error);
            this.isServiceAvailable = false;
        }
    },

    /**
     * 为笔记添加AI工具
     * @param {number} noteId - 笔记ID
     */
    addAIToolsToNote(noteId) {
        // 移除旧的AI工具区域（如果存在）
        const existingAITools = document.querySelector('.ai-tools-section');
        if (existingAITools) {
            existingAITools.remove();
        }

        // 创建新的AI工具区域
        const aiToolsHTML = this.createAIToolsHTML(noteId);

        // 在displayContent后面插入AI工具
        const displayContent = document.querySelector(SELECTORS.displayContent);
        displayContent.insertAdjacentHTML('afterend', aiToolsHTML);

        // 绑定事件监听器
        this.bindAIToolsEvents(noteId);
    },

    /**
     * 创建AI工具HTML
     * @param {number} noteId - 笔记ID
     * @returns {string} - HTML字符串
     */
    createAIToolsHTML(noteId) {
        return `
            <div class="ai-tools-section" style="margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 10px;">
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">
                    <i class="fas fa-robot"></i> AI学习助手
                    ${!this.isServiceAvailable ? '<span style="color: var(--warning); font-size: 12px; margin-left: 10px;">(服务不可用)</span>' : ''}
                </h4>

                <!-- 对话区域 -->
                <div id="aiConversation-${noteId}" class="ai-conversation" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px; display: none;">
                </div>

                <!-- 输入区域 -->
                <div class="ai-input-area">
                    <textarea id="aiQuestion-${noteId}" class="ai-question-input"
                        placeholder="${this.isServiceAvailable ? '请输入你的问题...' : 'AI服务暂时不可用'}"
                        style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid var(--border); border-radius: 6px; resize: vertical; font-family: inherit;"
                        ${!this.isServiceAvailable ? 'disabled' : ''}></textarea>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button onclick="AI.askQuestion(event, '${noteId}')" class="ai-btn"
                            ${!this.isServiceAvailable ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane"></i> 提问
                        </button>
                        <button onclick="AI.clearConversation('${noteId}')" class="ai-btn"
                            style="background: var(--danger);">
                            <i class="fas fa-trash"></i> 清空对话
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 绑定AI工具事件
     * @param {number} noteId - 笔记ID
     */
    bindAIToolsEvents(noteId) {
        const questionInput = document.getElementById(`aiQuestion-${noteId}`);

        if (questionInput && this.isServiceAvailable) {
            // 支持回车键提问
            questionInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.askQuestion(e, noteId);
                }
            });

            // 支持自动调整高度
            questionInput.addEventListener('input', () => {
                questionInput.style.height = 'auto';
                questionInput.style.height = Math.min(questionInput.scrollHeight, 200) + 'px';
            });
        }
    },

    /**
     * 提问AI
     * @param {Event} event - 事件对象
     * @param {string} noteId - 笔记ID
     */
    async askQuestion(event, noteId) {
        const questionInput = document.getElementById(`aiQuestion-${noteId}`);
        const conversationDiv = document.getElementById(`aiConversation-${noteId}`);
        const button = event.target.closest('button');

        const question = questionInput.value.trim();

        // 验证输入
        if (!question) {
            UI.showToast('请输入问题', TOAST_TYPES.WARNING);
            questionInput.focus();
            return;
        }

        if (!this.isServiceAvailable) {
            UI.showToast(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE, TOAST_TYPES.ERROR);
            return;
        }

        // 显示加载状态
        this.setButtonLoading(button, true);

        try {
            // 显示用户问题
            this.addChatMessage(conversationDiv, question, 'user');
            conversationDiv.style.display = 'block';

            // 获取笔记内容
            const noteContent = document.querySelector(SELECTORS.displayContent).textContent;

            // 显示AI思考状态
            const thinkingMessageId = this.addThinkingMessage(conversationDiv);

            // 调用AI API
            const aiResponse = await API.chatWithAI(question, noteContent);

            // 移除思考消息
            this.removeThinkingMessage(conversationDiv, thinkingMessageId);

            // 显示AI回答
            this.addChatMessage(conversationDiv, aiResponse, 'ai');

            // 清空输入框
            questionInput.value = '';
            questionInput.style.height = 'auto';

            // 滚动到最新消息
            conversationDiv.scrollTop = conversationDiv.scrollHeight;

            // 保存对话历史（可选）
            this.saveConversationHistory(noteId, question, aiResponse);

        } catch (error) {
            console.error('AI回答失败:', error);

            // 移除思考消息
            const thinkingMessage = conversationDiv.querySelector('.thinking-message');
            if (thinkingMessage) {
                thinkingMessage.remove();
            }

            // 显示错误消息
            this.addChatMessage(conversationDiv, '抱歉，我现在无法回答您的问题。请稍后再试。', 'ai', true);

            UI.showToast(error.message || ERROR_MESSAGES.AI_REQUEST_FAILED, TOAST_TYPES.ERROR);
        } finally {
            this.setButtonLoading(button, false);
            questionInput.focus();
        }
    },

    /**
     * 添加聊天消息
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('user' | 'ai')
     * @param {boolean} isError - 是否为错误消息
     */
    addChatMessage(container, message, type, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;

        if (isError) {
            messageDiv.style.background = 'var(--danger)';
            messageDiv.style.color = 'white';
        }

        const icon = type === 'user' ? 'fa-user' : 'fa-robot';
        const label = type === 'user' ? '你' : 'AI助手';

        // 处理消息内容，支持简单的markdown
        const formattedMessage = this.formatMessage(message);

        messageDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
                <i class="fas ${icon}" style="margin-top: 2px; opacity: 0.7;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                        ${label}
                    </div>
                    <div style="line-height: 1.5;">
                        ${formattedMessage}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(messageDiv);

        // 添加动画效果
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    },

    /**
     * 添加思考消息
     * @param {HTMLElement} container - 容器元素
     * @returns {string} - 消息ID
     */
    addThinkingMessage(container) {
        const messageId = 'thinking-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message ai-message thinking-message';
        messageDiv.id = messageId;

        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-robot" style="opacity: 0.7;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px; opacity: 0.8;">
                        AI助手
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="spinner" style="width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--primary); margin: 0;"></div>
                        <span>正在思考...</span>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        return messageId;
    },

    /**
     * 移除思考消息
     * @param {HTMLElement} container - 容器元素
     * @param {string} messageId - 消息ID
     */
    removeThinkingMessage(container, messageId) {
        const thinkingMessage = document.getElementById(messageId);
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
    },

    /**
     * 设置按钮加载状态
     * @param {HTMLElement} button - 按钮元素
     * @param {boolean} loading - 是否加载中
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 思考中...';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-paper-plane"></i> 提问';
            button.disabled = false;
        }
    },

    /**
     * 格式化消息内容
     * @param {string} message - 原始消息
     * @returns {string} - 格式化后的消息
     */
    formatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background: var(--bg-primary); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
    },

    /**
     * 清空对话
     * @param {string} noteId - 笔记ID
     */
    clearConversation(noteId) {
        if (!confirm('确定要清空对话记录吗？')) {
            return;
        }

        const conversationDiv = document.getElementById(`aiConversation-${noteId}`);
        if (conversationDiv) {
            conversationDiv.innerHTML = '';
            conversationDiv.style.display = 'none';
        }

        // 清除本地存储的对话历史
        this.clearConversationHistory(noteId);

        UI.showToast('对话记录已清空', TOAST_TYPES.INFO);
    },

    /**
     * 保存对话历史
     * @param {string} noteId - 笔记ID
     * @param {string} question - 问题
     * @param {string} answer - 回答
     */
    saveConversationHistory(noteId, question, answer) {
        try {
            const key = `ai_conversation_${noteId}`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');

            history.push({
                question,
                answer,
                timestamp: new Date().toISOString()
            });

            // 限制历史记录数量
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }

            localStorage.setItem(key, JSON.stringify(history));
        } catch (error) {
            console.warn('保存对话历史失败:', error);
        }
    },

    /**
     * 加载对话历史
     * @param {string} noteId - 笔记ID
     * @returns {Array} - 对话历史
     */
    loadConversationHistory(noteId) {
        try {
            const key = `ai_conversation_${noteId}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            console.warn('加载对话历史失败:', error);
            return [];
        }
    },

    /**
     * 清除对话历史
     * @param {string} noteId - 笔记ID
     */
    clearConversationHistory(noteId) {
        try {
            const key = `ai_conversation_${noteId}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('清除对话历史失败:', error);
        }
    },

    /**
     * 恢复对话历史显示
     * @param {string} noteId - 笔记ID
     */
    restoreConversationHistory(noteId) {
        const history = this.loadConversationHistory(noteId);

        if (history.length === 0) {
            return;
        }

        const conversationDiv = document.getElementById(`aiConversation-${noteId}`);
        if (!conversationDiv) {
            return;
        }

        // 显示最近的几条对话
        const recentHistory = history.slice(-5);

        recentHistory.forEach(item => {
            this.addChatMessage(conversationDiv, item.question, 'user');
            this.addChatMessage(conversationDiv, item.answer, 'ai');
        });

        if (recentHistory.length > 0) {
            conversationDiv.style.display = 'block';
            conversationDiv.scrollTop = conversationDiv.scrollHeight;
        }
    }
};