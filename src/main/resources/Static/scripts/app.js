// app.js - 主应用模块

const App = {
    // 应用状态
    state: {
        notes: [],
        subjects: [],
        tags: [],
        currentPage: 0,
        totalPages: 0,
        filters: {
            keyword: '',
            subject: null,
            tag: null,
            isFavorite: null
        },
        searchTimeout: null
    },

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('🚀 启动Smart Notes应用...');

            // 初始化各个模块
            UI.init();
            await AI.init();

            // 设置事件监听器
            this.setupEventListeners();

            // 加载初始数据
            await this.loadNotes();

            console.log('✅ 应用初始化完成');
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            UI.showToast('应用初始化失败，请刷新页面重试', TOAST_TYPES.ERROR);
        }
    },

    // =================== 事件监听器设置 ===================

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.setupSearchListener();
        this.setupFilterListeners();
        this.setupStatCardListeners();
    },

    /**
     * 设置搜索监听器
     */
    setupSearchListener() {
        const searchInput = document.querySelector(SELECTORS.searchInput);
        if (searchInput) {
            searchInput.addEventListener('input', UI.debounce((e) => {
                this.state.filters.keyword = e.target.value.trim();
                this.state.currentPage = 0;
                this.loadNotes();
            }, CONFIG.SEARCH_DEBOUNCE_DELAY));
        }
    },

    /**
     * 设置过滤器监听器
     */
    setupFilterListeners() {
        const filters = document.querySelector(SELECTORS.filters);
        if (filters) {
            filters.addEventListener('click', (e) => {
                if (!e.target.classList.contains('filter-chip')) return;

                // 重置所有过滤器状态
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.classList.remove('active');
                });

                e.target.classList.add('active');

                // 重置过滤条件
                this.resetFilters();

                // 设置新的过滤条件
                if (e.target.dataset.filter === 'favorites') {
                    this.state.filters.isFavorite = true;
                } else if (e.target.dataset.subject) {
                    this.state.filters.subject = e.target.dataset.subject;
                }

                this.state.currentPage = 0;
                this.loadNotes();
            });
        }
    },

    /**
     * 设置统计卡片监听器
     */
    setupStatCardListeners() {
        const totalNotesCard = document.querySelector(SELECTORS.totalNotesCard);
        const totalFavoritesCard = document.querySelector(SELECTORS.totalFavoritesCard);
        const totalSubjectsCard = document.querySelector(SELECTORS.totalSubjectsCard);
        const totalTagsCard = document.querySelector(SELECTORS.totalTagsCard);

        if (totalNotesCard) {
            totalNotesCard.addEventListener('click', () => {
                this.resetFilters();
                this.setActiveFilter('[data-filter="all"]');
                this.state.currentPage = 0;
                this.loadNotes();
                UI.showToast('显示所有笔记', TOAST_TYPES.INFO);
            });
        }

        if (totalFavoritesCard) {
            totalFavoritesCard.addEventListener('click', () => {
                this.resetFilters();
                this.state.filters.isFavorite = true;
                this.setActiveFilter('[data-filter="favorites"]');
                this.state.currentPage = 0;
                this.loadNotes();
                UI.showToast('显示收藏笔记', TOAST_TYPES.INFO);
            });
        }

        if (totalSubjectsCard) {
            totalSubjectsCard.addEventListener('click', () => {
                this.showSubjectModal();
            });
        }

        if (totalTagsCard) {
            totalTagsCard.addEventListener('click', () => {
                this.showTagModal();
            });
        }
    },

    // =================== 数据加载 ===================

    /**
     * 加载笔记
     */
    async loadNotes() {
        UI.showLoading();

        try {
            const hasFilters = Object.values(this.state.filters).some(v => v !== null && v !== '');

            let data;
            if (hasFilters) {
                // 使用搜索API
                data = await API.searchNotes(this.state.filters, {
                    page: this.state.currentPage,
                    size: CONFIG.PAGE_SIZE
                });
            } else {
                // 使用常规获取API
                data = await API.getNotes({
                    page: this.state.currentPage,
                    size: CONFIG.PAGE_SIZE
                });
            }

            this.state.notes = data.content || [];
            this.state.totalPages = data.totalPages || 0;

            this.displayNotes();
            this.updatePagination();
            await this.updateStats();

        } catch (error) {
            console.error('加载笔记失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
            UI.showEmptyState();
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * 更新统计数据
     */
    async updateStats() {
        try {
            const [notesResponse, subjects, tags, favoritesResponse] = await Promise.all([
                API.getNotes({ size: 1 }), // 只获取第一页来得到总数
                API.getSubjects(),
                API.getTags(),
                API.getFavoriteNotes({ size: 1 })
            ]);

            // 更新统计显示
            const totalNotesEl = document.querySelector(SELECTORS.totalNotes);
            const totalSubjectsEl = document.querySelector(SELECTORS.totalSubjects);
            const totalFavoritesEl = document.querySelector(SELECTORS.totalFavorites);
            const totalTagsEl = document.querySelector(SELECTORS.totalTags);

            if (totalNotesEl) totalNotesEl.textContent = notesResponse.totalElements || 0;
            if (totalSubjectsEl) totalSubjectsEl.textContent = subjects.length;
            if (totalFavoritesEl) totalFavoritesEl.textContent = favoritesResponse.totalElements || 0;
            if (totalTagsEl) totalTagsEl.textContent = tags.length;

            // 保存到状态
            this.state.subjects = subjects;
            this.state.tags = tags;

            // 动态添加学科过滤器
            this.addSubjectFilters();

        } catch (error) {
            console.error('更新统计数据失败:', error);
            // 统计数据更新失败不应该阻止应用运行
        }
    },

    // =================== 笔记显示 ===================

    /**
     * 显示笔记
     */
    displayNotes() {
        if (this.state.notes.length === 0) {
            UI.showEmptyState();
            return;
        }

        UI.showNotesGrid();
        const notesGrid = document.querySelector(SELECTORS.notesGrid);

        if (notesGrid) {
            notesGrid.innerHTML = this.state.notes.map((note, index) =>
                this.createNoteCardHTML(note, index)
            ).join('');
        }
    },

    /**
     * 创建笔记卡片HTML
     * @param {object} note - 笔记数据
     * @param {number} index - 索引
     * @returns {string} - HTML字符串
     */
    createNoteCardHTML(note, index) {
        const createdDate = UI.formatDate(note.createdAt);
        const updatedDate = UI.formatDate(note.updatedAt);
        const isUpdated = note.createdAt !== note.updatedAt;

        // 处理标签显示
        const tagsHTML = (note.tags || []).slice(0, 3).map(tag =>
            `<span class="tag">#${tag}</span>`
        ).join('');

        const moreTagsCount = Math.max(0, (note.tags?.length || 0) - 3);
        const moreTagsHTML = moreTagsCount > 0 ?
            `<span class="tag" style="background: var(--text-secondary);">+${moreTagsCount}</span>` : '';

        // 处理内容截断和关键词高亮
        let displayContent = UI.truncateText(note.content, 150);
        if (this.state.filters.keyword) {
            displayContent = UI.highlightKeyword(displayContent, this.state.filters.keyword);
        }

        return `
            <div class="note-card" onclick="App.viewNote(${note.id})"
                 style="animation-delay: ${index * CONFIG.CARD_ANIMATION_DELAY}ms; cursor: pointer;">
                <div class="note-header">
                    <span class="note-subject">${note.subject}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${note.isFavorite ? '<i class="fas fa-heart" style="color: var(--warning);"></i>' : ''}
                    </div>
                </div>

                <h3 class="note-title">${
                    this.state.filters.keyword ?
                    UI.highlightKeyword(note.title, this.state.filters.keyword) :
                    note.title
                }</h3>

                <div class="note-tags">
                    ${tagsHTML}
                    ${moreTagsHTML}
                </div>

                <div class="note-content">${displayContent}</div>

                <div class="note-footer">
                    <div class="note-date">
                        <i class="fas fa-calendar"></i> ${createdDate}
                        ${isUpdated ? `<br><i class="fas fa-edit"></i> ${updatedDate}` : ''}
                    </div>
                    <div class="note-actions">
                        <button class="action-btn btn-favorite ${note.isFavorite ? 'active' : ''}"
                                onclick="event.stopPropagation(); App.toggleFavorite(${note.id})" title="收藏">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn btn-edit"
                                onclick="event.stopPropagation(); App.editNote(${note.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete"
                                onclick="event.stopPropagation(); App.deleteNote(${note.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // =================== 分页管理 ===================

    /**
     * 更新分页
     */
    updatePagination() {
        const pagination = document.querySelector(SELECTORS.pagination);

        if (!pagination || this.state.totalPages <= 1) {
            if (pagination) pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        let paginationHTML = '';

        // 上一页按钮
        paginationHTML += `
            <button class="page-btn" onclick="App.changePage(${this.state.currentPage - 1})"
                    ${this.state.currentPage === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 页码按钮
        const startPage = Math.max(0, this.state.currentPage - 2);
        const endPage = Math.min(this.state.totalPages - 1, this.state.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.state.currentPage ? 'active' : ''}"
                        onclick="App.changePage(${i})">
                    ${i + 1}
                </button>
            `;
        }

        // 下一页按钮
        paginationHTML += `
            <button class="page-btn" onclick="App.changePage(${this.state.currentPage + 1})"
                    ${this.state.currentPage === this.state.totalPages - 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    },

    /**
     * 切换页面
     * @param {number} page - 目标页面
     */
    changePage(page) {
        if (page < 0 || page >= this.state.totalPages) return;
        this.state.currentPage = page;
        this.loadNotes();
    },

    // =================== 笔记操作 ===================

    /**
     * 查看笔记详情
     * @param {number} id - 笔记ID
     */
    async viewNote(id) {
        try {
            UI.showLoading();
            const note = await API.getNote(id);
            this.displayNoteDetail(note);
        } catch (error) {
            console.error('获取笔记详情失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * 显示笔记详情
     * @param {object} note - 笔记数据
     */
    displayNoteDetail(note) {
        // 填充显示模态框
        document.querySelector(SELECTORS.displaySubject).textContent = note.subject;
        document.querySelector(SELECTORS.displayTitle).textContent = note.title;

        // 处理内容，让中文字符加粗
        const content = note.content;
        const processedContent = content.replace(/[\u4e00-\u9fff]/g,
            (match) => `<span class="chinese-bold">${match}</span>`);
        document.querySelector(SELECTORS.displayContent).innerHTML = processedContent;

        // 显示标签
        const tagsContainer = document.querySelector(SELECTORS.displayTags);
        tagsContainer.innerHTML = '';
        (note.tags || []).forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.style.cssText = 'background: var(--primary); color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px;';
            tagElement.textContent = `#${tag}`;
            tagsContainer.appendChild(tagElement);
        });

        // 显示日期
        const createdDate = new Date(note.createdAt).toLocaleString('zh-CN');
        const updatedDate = new Date(note.updatedAt).toLocaleString('zh-CN');
        const isUpdated = note.createdAt !== note.updatedAt;

        document.querySelector(SELECTORS.displayDates).innerHTML = `
            <div><i class="fas fa-calendar"></i> 创建：${createdDate}</div>
            ${isUpdated ? `<div><i class="fas fa-edit"></i> 更新：${updatedDate}</div>` : ''}
        `;

        // 设置按钮功能
        const editBtn = document.querySelector(SELECTORS.displayEditBtn);
        const favoriteBtn = document.querySelector(SELECTORS.displayFavoriteBtn);
        const favoriteText = document.querySelector(SELECTORS.favoriteText);

        editBtn.onclick = () => {
            UI.closeDisplayModal();
            this.editNote(note.id);
        };

        if (note.isFavorite) {
            favoriteBtn.className = 'btn btn-warning';
            favoriteText.textContent = '已收藏';
        } else {
            favoriteBtn.className = 'btn btn-outline';
            favoriteText.textContent = '收藏';
        }

        favoriteBtn.onclick = () => {
            this.toggleFavorite(note.id);
            UI.closeDisplayModal();
        };

        // 添加AI工具
        AI.addAIToolsToNote(note.id);

        // 显示模态框
        UI.showModal(SELECTORS.displayModal);
    },

    /**
     * 编辑笔记
     * @param {number} id - 笔记ID
     */
    async editNote(id) {
        try {
            const note = await API.getNote(id);

            document.querySelector(SELECTORS.modalTitle).innerHTML = '✏️ 编辑笔记';
            document.querySelector(SELECTORS.noteSubject).value = note.subject;
            document.querySelector(SELECTORS.noteTitle).value = note.title;
            document.querySelector(SELECTORS.noteContent).value = note.content;

            // 设置标签
            UI.setTags(note.tags || []);

            UI.state.currentEditId = id;
            UI.showModal(SELECTORS.noteModal);

        } catch (error) {
            console.error('加载笔记失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
        }
    },

    /**
     * 保存笔记
     */
    async saveNote() {
        UI.clearFormErrors();

        const formData = {
            subject: document.querySelector(SELECTORS.noteSubject).value,
            title: document.querySelector(SELECTORS.noteTitle).value,
            content: document.querySelector(SELECTORS.noteContent).value,
            tags: UI.getSelectedTags(),
            isFavorite: false
        };

        // 验证表单
        const validation = UI.validateForm(formData);
        if (!validation.isValid) {
            UI.showFormErrors(validation.errors);
            return;
        }

        try {
            if (UI.state.currentEditId) {
                await API.updateNote(UI.state.currentEditId, formData);
                UI.showToast(SUCCESS_MESSAGES.NOTE_UPDATED, TOAST_TYPES.SUCCESS);
            } else {
                await API.createNote(formData);
                UI.showToast(SUCCESS_MESSAGES.NOTE_CREATED, TOAST_TYPES.SUCCESS);
            }

            UI.closeModal();
            this.loadNotes();

        } catch (error) {
            console.error('保存笔记失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
        }
    },

    /**
     * 删除笔记
     * @param {number} id - 笔记ID
     */
    async deleteNote(id) {
        if (!confirm('确定要删除这个笔记吗？此操作无法撤销！')) return;

        try {
            await API.deleteNote(id);
            UI.showToast(SUCCESS_MESSAGES.NOTE_DELETED, TOAST_TYPES.SUCCESS);
            this.loadNotes();
        } catch (error) {
            console.error('删除笔记失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
        }
    },

    /**
     * 切换收藏状态
     * @param {number} id - 笔记ID
     */
    async toggleFavorite(id) {
        try {
            const updatedNote = await API.toggleFavorite(id);
            const message = updatedNote.isFavorite ?
                SUCCESS_MESSAGES.FAVORITE_ADDED :
                SUCCESS_MESSAGES.FAVORITE_REMOVED;

            UI.showToast(message, TOAST_TYPES.SUCCESS);
            this.loadNotes();
        } catch (error) {
            console.error('切换收藏状态失败:', error);
            UI.showToast(error.message, TOAST_TYPES.ERROR);
        }
    },

    // =================== 过滤器管理 ===================

    /**
     * 重置过滤条件
     */
    resetFilters() {
        this.state.filters = {
            keyword: this.state.filters.keyword, // 保留搜索关键词
            subject: null,
            tag: null,
            isFavorite: null
        };
    },

    /**
     * 设置活跃过滤器
     * @param {string} selector - 选择器
     */
    setActiveFilter(selector) {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        const activeChip = document.querySelector(selector);
        if (activeChip) {
            activeChip.classList.add('active');
        }
    },

    /**
     * 动态添加学科过滤器
     */
    addSubjectFilters() {
        const filtersContainer = document.querySelector(SELECTORS.filters);
        if (!filtersContainer) return;

        // 清除现有的学科过滤器
        const existingSubjectFilters = filtersContainer.querySelectorAll('.filter-chip[data-subject]');
        existingSubjectFilters.forEach(filter => filter.remove());

        // 为每个学科创建过滤器芯片
        this.state.subjects.forEach(subject => {
            const icon = getSubjectIcon(subject);
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.dataset.subject = subject;
            chip.innerHTML = `<i class="${icon}"></i> ${subject}`;
            filtersContainer.appendChild(chip);
        });
    },

    // =================== 模态框功能 ===================

    /**
     * 显示学科选择模态框
     */
    showSubjectModal() {
        const subjectList = document.querySelector(SELECTORS.subjectList);
        subjectList.innerHTML = '';

        this.state.subjects.forEach(subject => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.style.cssText = 'padding: 15px; border-radius: 15px; margin: 5px;';
            button.innerHTML = `<i class="${getSubjectIcon(subject)}"></i> ${subject}`;
            button.onclick = () => {
                this.resetFilters();
                this.state.filters.subject = subject;
                this.setActiveFilter(`[data-subject="${subject}"]`);
                this.state.currentPage = 0;
                this.loadNotes();
                UI.closeSubjectModal();
                UI.showToast(`显示${subject}笔记`, TOAST_TYPES.INFO);
            };
            subjectList.appendChild(button);
        });

        UI.showModal(SELECTORS.subjectModal);
    },

    /**
     * 显示标签选择模态框
     */
    showTagModal() {
        const tagList = document.querySelector(SELECTORS.tagList);
        tagList.innerHTML = '';

        if (this.state.tags.length === 0) {
            tagList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无标签</p>';
        } else {
            this.state.tags.forEach(tag => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline';
                button.style.cssText = 'padding: 8px 16px; border-radius: 20px; margin: 5px;';
                button.innerHTML = `#${tag}`;
                button.onclick = () => {
                    this.resetFilters();
                    this.state.filters.tag = tag;
                    this.state.currentPage = 0;
                    this.loadNotes();
                    UI.closeTagModal();
                    UI.showToast(`显示标签 #${tag} 的笔记`, TOAST_TYPES.INFO);
                };
                tagList.appendChild(button);
            });
        }

        UI.showModal(SELECTORS.tagModal);
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});