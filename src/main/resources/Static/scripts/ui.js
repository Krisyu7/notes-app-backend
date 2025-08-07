// ui.js - UI界面模块

const UI = {
    // UI状态
    state: {
        currentEditId: null,
        isModalOpen: false
    },

    /**
     * 初始化UI组件
     */
    init() {
        this.initTheme();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        console.log('UI组件初始化完成');
    },

    // =================== 主题管理 ===================

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEME.LIGHT;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK;

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        this.updateThemeIcon(newTheme);

        this.showToast(`已切换到${newTheme === THEME.DARK ? '深色' : '浅色'}模式`, TOAST_TYPES.INFO);
    },

    /**
     * 更新主题图标
     * @param {string} theme - 主题名称
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector(SELECTORS.themeIcon);
        if (icon) {
            icon.className = theme === THEME.DARK ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // =================== Toast消息 ===================

    /**
     * 显示Toast消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    showToast(message, type = TOAST_TYPES.INFO) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = 'background: none; border: none; color: inherit; margin-left: 10px; cursor: pointer; opacity: 0.7;';
        closeBtn.onclick = () => this.removeToast(toast);
        toast.appendChild(closeBtn);

        document.body.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            this.removeToast(toast);
        }, CONFIG.TOAST_DURATION);
    },

    /**
     * 移除Toast消息
     * @param {HTMLElement} toast - Toast元素
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, CONFIG.TOAST_ANIMATION_DURATION);
        }
    },

    // =================== 模态框管理 ===================

    /**
     * 打开新建笔记模态框
     */
    openModal() {
        document.querySelector(SELECTORS.modalTitle).innerHTML = '✨ 新建笔记';
        document.querySelector(SELECTORS.noteForm).reset();
        this.resetTagsInput();
        this.state.currentEditId = null;
        this.showModal(SELECTORS.noteModal);
    },

    /**
     * 关闭笔记编辑模态框
     */
    closeModal() {
        this.hideModal(SELECTORS.noteModal);
    },

    /**
     * 关闭笔记显示模态框
     */
    closeDisplayModal() {
        this.hideModal(SELECTORS.displayModal);
    },

    /**
     * 关闭学科模态框
     */
    closeSubjectModal() {
        this.hideModal(SELECTORS.subjectModal);
    },

    /**
     * 关闭标签模态框
     */
    closeTagModal() {
        this.hideModal(SELECTORS.tagModal);
    },

    /**
     * 显示模态框
     * @param {string} selector - 模态框选择器
     */
    showModal(selector) {
        const modal = document.querySelector(selector);
        if (modal) {
            modal.style.display = 'block';
            this.state.isModalOpen = true;
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        }
    },

    /**
     * 隐藏模态框
     * @param {string} selector - 模态框选择器
     */
    hideModal(selector) {
        const modal = document.querySelector(selector);
        if (modal) {
            modal.style.display = 'none';
            this.state.isModalOpen = false;
            document.body.style.overflow = ''; // 恢复背景滚动
        }
    },

    // =================== 标签输入管理 ===================

    /**
     * 设置标签输入功能
     */
    setupTagsInput() {
        const tagsInput = document.querySelector(SELECTORS.tagsInput);
        const tagInput = tagsInput?.querySelector('.tag-input');

        if (tagInput) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && tagInput.value.trim()) {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                }
            });
        }
    },

    /**
     * 添加标签
     * @param {string} tagText - 标签文本
     */
    addTag(tagText) {
        const tagsInput = document.querySelector(SELECTORS.tagsInput);
        const tagInput = tagsInput?.querySelector('.tag-input');

        if (!tagsInput || !tagInput) return;

        // 检查是否已存在
        const existingTags = this.getSelectedTags();
        if (existingTags.includes(tagText)) {
            this.showToast('标签已存在', TOAST_TYPES.WARNING);
            return;
        }

        // 检查标签数量限制
        if (existingTags.length >= CONFIG.MAX_TAGS_COUNT) {
            this.showToast(`最多只能添加${CONFIG.MAX_TAGS_COUNT}个标签`, TOAST_TYPES.WARNING);
            return;
        }

        // 检查标签长度限制
        if (tagText.length > CONFIG.MAX_TAG_LENGTH) {
            this.showToast(`标签长度不能超过${CONFIG.MAX_TAG_LENGTH}个字符`, TOAST_TYPES.WARNING);
            return;
        }

        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `${tagText} <span class="tag-remove" onclick="UI.removeTag(this)">×</span>`;

        tagsInput.insertBefore(tagElement, tagInput);
    },

    /**
     * 移除标签
     * @param {HTMLElement} element - 移除按钮元素
     */
    removeTag(element) {
        element.parentElement.remove();
    },

    /**
     * 重置标签输入
     */
    resetTagsInput() {
        const tagsInput = document.querySelector(SELECTORS.tagsInput);
        if (tagsInput) {
            const tagItems = tagsInput.querySelectorAll('.tag-item');
            tagItems.forEach(item => item.remove());
        }
    },

    /**
     * 获取选中的标签
     * @returns {Array} - 标签数组
     */
    getSelectedTags() {
        const tagsInput = document.querySelector(SELECTORS.tagsInput);
        if (!tagsInput) return [];

        const tagItems = tagsInput.querySelectorAll('.tag-item');
        return Array.from(tagItems).map(item =>
            item.textContent.replace('×', '').trim()
        );
    },

    /**
     * 设置标签
     * @param {Array} tags - 标签数组
     */
    setTags(tags) {
        this.resetTagsInput();
        if (Array.isArray(tags)) {
            tags.forEach(tag => this.addTag(tag));
        }
    },

    // =================== 加载状态管理 ===================

    /**
     * 显示加载状态
     */
    showLoading() {
        const loading = document.querySelector(SELECTORS.loading);
        const notesGrid = document.querySelector(SELECTORS.notesGrid);
        const emptyState = document.querySelector(SELECTORS.emptyState);

        if (loading) loading.style.display = 'flex';
        if (notesGrid) notesGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    },

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loading = document.querySelector(SELECTORS.loading);
        if (loading) loading.style.display = 'none';
    },

    /**
     * 显示空状态
     */
    showEmptyState() {
        const notesGrid = document.querySelector(SELECTORS.notesGrid);
        const emptyState = document.querySelector(SELECTORS.emptyState);

        if (notesGrid) notesGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    },

    /**
     * 显示笔记网格
     */
    showNotesGrid() {
        const notesGrid = document.querySelector(SELECTORS.notesGrid);
        const emptyState = document.querySelector(SELECTORS.emptyState);

        if (notesGrid) notesGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    },

    // =================== 事件监听器设置 ===================

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 模态框点击外部关闭
        this.setupModalCloseListeners();

        // 表单提交
        this.setupFormListeners();

        // 标签输入
        this.setupTagsInput();
    },

    /**
     * 设置模态框关闭监听器
     */
    setupModalCloseListeners() {
        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(`#${e.target.id}`);
            }
        });
    },

    /**
     * 设置表单监听器
     */
    setupFormListeners() {
        const noteForm = document.querySelector(SELECTORS.noteForm);
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                App.saveNote();
            });
        }
    },

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC键关闭模态框
            if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && this.state.isModalOpen) {
                this.closeModal();
                this.closeDisplayModal();
                this.closeSubjectModal();
                this.closeTagModal();
            }

            // Ctrl/Cmd + N 新建笔记
            if ((e.ctrlKey || e.metaKey) && e.key === KEYBOARD_SHORTCUTS.NEW_NOTE) {
                e.preventDefault();
                this.openModal();
            }

            // Ctrl/Cmd + / 聚焦搜索
            if ((e.ctrlKey || e.metaKey) && e.key === KEYBOARD_SHORTCUTS.SEARCH) {
                e.preventDefault();
                const searchInput = document.querySelector(SELECTORS.searchInput);
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Ctrl/Cmd + T 切换主题
            if ((e.ctrlKey || e.metaKey) && e.key === KEYBOARD_SHORTCUTS.THEME_TOGGLE) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    // =================== 工具方法 ===================

    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} - 格式化后的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return '刚刚';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}小时前`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.floor(diffInHours / 24)}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    },

    /**
     * 截断文本
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} - 截断后的文本
     */
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength) + '...';
    },

    /**
     * 高亮搜索关键词
     * @param {string} text - 原始文本
     * @param {string} keyword - 搜索关键词
     * @returns {string} - 高亮后的HTML
     */
    highlightKeyword(text, keyword) {
        if (!keyword || !text) return text;

        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning); color: var(--text-primary); padding: 1px 2px; border-radius: 2px;">$1</mark>');
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} - 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 验证表单数据
     * @param {object} data - 表单数据
     * @returns {object} - 验证结果
     */
    validateForm(data) {
        const errors = {};

        // 验证学科
        if (!data.subject || !data.subject.trim()) {
            errors.subject = '请选择学科';
        } else if (data.subject.length > VALIDATION_RULES.subject.maxLength) {
            errors.subject = `学科名称不能超过${VALIDATION_RULES.subject.maxLength}个字符`;
        }

        // 验证标题
        if (!data.title || !data.title.trim()) {
            errors.title = '请输入标题';
        } else if (data.title.length > VALIDATION_RULES.title.maxLength) {
            errors.title = `标题不能超过${VALIDATION_RULES.title.maxLength}个字符`;
        }

        // 验证内容
        if (!data.content || !data.content.trim()) {
            errors.content = '请输入内容';
        } else if (data.content.length > VALIDATION_RULES.content.maxLength) {
            errors.content = `内容不能超过${VALIDATION_RULES.content.maxLength}个字符`;
        }

        // 验证标签
        if (data.tags && data.tags.length > VALIDATION_RULES.tags.maxCount) {
            errors.tags = `最多只能添加${VALIDATION_RULES.tags.maxCount}个标签`;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * 显示表单验证错误
     * @param {object} errors - 错误信息
     */
    showFormErrors(errors) {
        Object.keys(errors).forEach(field => {
            const input = document.querySelector(`#note${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (input) {
                input.style.borderColor = 'var(--danger)';
                // 可以在这里添加错误提示显示逻辑
            }
        });

        // 显示第一个错误
        const firstError = Object.values(errors)[0];
        if (firstError) {
            this.showToast(firstError, TOAST_TYPES.ERROR);
        }
    },

    /**
     * 清除表单错误状态
     */
    clearFormErrors() {
        const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }
};