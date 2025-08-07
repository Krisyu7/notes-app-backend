// api.js - API调用模块

const API = {
    /**
     * 通用请求方法
     * @param {string} url - 请求URL
     * @param {object} options - 请求选项
     * @returns {Promise} - 响应数据
     */
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            console.log(`API Request: ${config.method || 'GET'} ${url}`);

            const response = await fetch(url, config);

            console.log(`API Response: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`HTTP ${response.status}: ${errorText}`);
                error.status = response.status;
                throw error;
            }

            // 处理无内容响应
            if (response.status === HTTP_STATUS.NO_CONTENT) {
                return null;
            }

            const data = await response.json();
            console.log('API Data:', data);

            return data;
        } catch (error) {
            console.error('API Error:', error);

            // 网络错误处理
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR);
                networkError.status = 0;
                throw networkError;
            }

            throw error;
        }
    },

    /**
     * GET请求
     */
    async get(url, params = {}) {
        const urlWithParams = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlWithParams.searchParams.append(key, params[key]);
            }
        });

        return this.request(urlWithParams.toString(), {
            method: 'GET'
        });
    },

    /**
     * POST请求
     */
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT请求
     */
    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE请求
     */
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    },

    // =================== 笔记相关API ===================

    /**
     * 获取笔记列表
     * @param {object} params - 查询参数
     */
    async getNotes(params = {}) {
        const defaultParams = {
            page: 0,
            size: CONFIG.PAGE_SIZE,
            sortBy: 'updatedAt',
            sortDir: 'desc'
        };

        const queryParams = { ...defaultParams, ...params };

        try {
            const data = await this.get(CONFIG.API_BASE_URL, queryParams);

            // 确保返回的笔记数据格式正确
            const notes = (data.content || []).map(note => ({
                ...note,
                tags: note.tags || [],
                isFavorite: note.isFavorite || false
            }));

            return {
                ...data,
                content: notes
            };
        } catch (error) {
            console.error('获取笔记列表失败:', error);
            throw new Error(ERROR_MESSAGES.LOAD_NOTES_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 搜索笔记
     * @param {object} filters - 搜索过滤条件
     * @param {object} pagination - 分页参数
     */
    async searchNotes(filters = {}, pagination = {}) {
        const params = {
            page: pagination.page || 0,
            size: pagination.size || CONFIG.PAGE_SIZE,
            ...filters
        };

        // 移除空值参数
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });

        try {
            const data = await this.get(`${CONFIG.API_BASE_URL}/search`, params);

            // 确保返回的笔记数据格式正确
            const notes = (data.content || []).map(note => ({
                ...note,
                tags: note.tags || [],
                isFavorite: note.isFavorite || false
            }));

            return {
                ...data,
                content: notes
            };
        } catch (error) {
            console.error('搜索笔记失败:', error);
            throw new Error(ERROR_MESSAGES.LOAD_NOTES_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 获取单个笔记
     * @param {number} id - 笔记ID
     */
    async getNote(id) {
        try {
            const note = await this.get(`${CONFIG.API_BASE_URL}/${id}`);

            // 确保笔记数据格式正确
            return {
                ...note,
                tags: note.tags || [],
                isFavorite: note.isFavorite || false
            };
        } catch (error) {
            console.error('获取笔记失败:', error);
            throw new Error(ERROR_MESSAGES.LOAD_NOTES_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 创建笔记
     * @param {object} noteData - 笔记数据
     */
    async createNote(noteData) {
        const data = {
            ...noteData,
            tags: noteData.tags || [],
            isFavorite: noteData.isFavorite || false
        };

        try {
            const createdNote = await this.post(CONFIG.API_BASE_URL, data);
            console.log('笔记创建成功:', createdNote);
            return createdNote;
        } catch (error) {
            console.error('创建笔记失败:', error);
            throw new Error(ERROR_MESSAGES.SAVE_NOTE_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 更新笔记
     * @param {number} id - 笔记ID
     * @param {object} noteData - 更新的笔记数据
     */
    async updateNote(id, noteData) {
        const data = {
            ...noteData,
            tags: noteData.tags || [],
            isFavorite: noteData.isFavorite || false
        };

        try {
            const updatedNote = await this.put(`${CONFIG.API_BASE_URL}/${id}`, data);
            console.log('笔记更新成功:', updatedNote);
            return updatedNote;
        } catch (error) {
            console.error('更新笔记失败:', error);
            throw new Error(ERROR_MESSAGES.UPDATE_NOTE_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 删除笔记
     * @param {number} id - 笔记ID
     */
    async deleteNote(id) {
        try {
            await this.delete(`${CONFIG.API_BASE_URL}/${id}`);
            console.log('笔记删除成功:', id);
            return true;
        } catch (error) {
            console.error('删除笔记失败:', error);
            throw new Error(ERROR_MESSAGES.DELETE_NOTE_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 切换收藏状态
     * @param {number} id - 笔记ID
     */
    async toggleFavorite(id) {
        try {
            const updatedNote = await this.put(`${CONFIG.API_BASE_URL}/${id}/favorite`);
            console.log('收藏状态切换成功:', updatedNote);

            // 确保返回数据格式正确
            return {
                ...updatedNote,
                tags: updatedNote.tags || [],
                isFavorite: updatedNote.isFavorite || false
            };
        } catch (error) {
            console.error('切换收藏状态失败:', error);
            throw new Error(ERROR_MESSAGES.TOGGLE_FAVORITE_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 获取收藏笔记
     * @param {object} pagination - 分页参数
     */
    async getFavoriteNotes(pagination = {}) {
        const params = {
            page: pagination.page || 0,
            size: pagination.size || CONFIG.PAGE_SIZE
        };

        try {
            const data = await this.get(`${CONFIG.API_BASE_URL}/favorites`, params);

            // 确保返回的笔记数据格式正确
            const notes = (data.content || []).map(note => ({
                ...note,
                tags: note.tags || [],
                isFavorite: note.isFavorite || false
            }));

            return {
                ...data,
                content: notes
            };
        } catch (error) {
            console.error('获取收藏笔记失败:', error);
            throw new Error(ERROR_MESSAGES.LOAD_NOTES_FAILED + ': ' + getErrorMessage(error));
        }
    },

    // =================== 统计数据API ===================

    /**
     * 获取所有学科
     */
    async getSubjects() {
        try {
            const subjects = await this.get(`${CONFIG.API_BASE_URL}/subjects`);
            console.log('获取学科列表成功:', subjects);
            return subjects || [];
        } catch (error) {
            console.error('获取学科列表失败:', error);
            throw new Error(ERROR_MESSAGES.LOAD_STATS_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 获取所有标签
     */
    async getTags() {
        try {
            const tags = await this.get(`${CONFIG.API_BASE_URL}/tags`);
            console.log('获取标签列表成功:', tags);
            return tags || [];
        } catch (error) {
            console.error('获取标签列表失败:', error);
            // 标签获取失败不应该阻止应用运行，返回空数组
            console.warn('标签功能暂时不可用');
            return [];
        }
    },

    // =================== AI API ===================

    /**
     * AI对话
     * @param {string} question - 用户问题
     * @param {string} noteContent - 笔记内容
     */
    async chatWithAI(question, noteContent) {
        const requestData = {
            question: question.trim(),
            noteContent: noteContent.trim()
        };

        try {
            console.log('发送AI请求:', requestData);

            const response = await this.post(`${CONFIG.AI_API_URL}/chat`, requestData);

            console.log('AI响应成功:', response);

            // 检查响应格式
            if (response && typeof response === 'object') {
                // 新的响应格式 { response: "...", success: true }
                if (response.success && response.response) {
                    return response.response;
                } else if (response.error) {
                    throw new Error(response.error);
                }
            }

            // 兼容旧的字符串响应格式
            if (typeof response === 'string') {
                return response;
            }

            throw new Error(ERROR_MESSAGES.AI_RESPONSE_ERROR);

        } catch (error) {
            console.error('AI请求失败:', error);

            if (error.status === HTTP_STATUS.SERVICE_UNAVAILABLE) {
                throw new Error(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
            }

            throw new Error(ERROR_MESSAGES.AI_REQUEST_FAILED + ': ' + getErrorMessage(error));
        }
    },

    /**
     * 测试AI服务状态
     */
    async testAIService() {
        try {
            // 直接使用fetch，因为/test端点返回纯文本，不是JSON
            const response = await fetch(`${CONFIG.AI_API_URL}/test`);
            if (response.ok) {
                const text = await response.text();
                console.log('AI服务状态正常:', text);
                return true;
            } else {
                console.error('AI服务响应异常:', response.status);
                return false;
            }
        } catch (error) {
            console.error('AI服务不可用:', error);
            return false;
        }
    }
};