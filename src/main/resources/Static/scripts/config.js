// config.js - 配置和常量

// API配置
const CONFIG = {
    // API基础URL
    API_BASE_URL: 'http://localhost:8080/api/notes',
    AI_API_URL: 'http://localhost:8080/api/ai',

    // 分页配置
    PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100,

    // 搜索配置
    SEARCH_DEBOUNCE_DELAY: 500,

    // Toast配置
    TOAST_DURATION: 3000,
    TOAST_ANIMATION_DURATION: 300,

    // 内容限制
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 10000,
    MAX_SUBJECT_LENGTH: 100,
    MAX_TAGS_COUNT: 20,
    MAX_TAG_LENGTH: 50,

    // 动画配置
    CARD_ANIMATION_DELAY: 100, // 卡片动画间隔（毫秒）
    MODAL_ANIMATION_DURATION: 400,
};

// 学科配置
const SUBJECTS = {
    options: [
        'Java',
        'Python',
        'JavaScript',
        'React',
        'Spring Boot',
        '数据库',
        '算法',
        '系统设计',
        '其他',
        "Html/CSS"
    ],

    // 学科图标映射
    icons: {
        'Java': 'fab fa-java',
        'Python': 'fab fa-python',
        'JavaScript': 'fab fa-js',
        'React': 'fab fa-react',
        'Spring Boot': 'fas fa-leaf',
        '数据库': 'fas fa-database',
        '算法': 'fas fa-code',
        '系统设计': 'fas fa-sitemap',
        'Html/CSS': 'fas fa-Html/CSS',
        '其他': 'fas fa-folder'
    }
};

// Toast类型配置
const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// 错误消息配置
const ERROR_MESSAGES = {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    SERVER_ERROR: '服务器错误，请稍后重试',
    NOT_FOUND: '请求的资源不存在',
    VALIDATION_ERROR: '数据验证失败',
    UNKNOWN_ERROR: '发生未知错误',

    // 具体操作错误
    LOAD_NOTES_FAILED: '加载笔记失败',
    SAVE_NOTE_FAILED: '保存笔记失败',
    UPDATE_NOTE_FAILED: '更新笔记失败',
    DELETE_NOTE_FAILED: '删除笔记失败',
    TOGGLE_FAVORITE_FAILED: '切换收藏状态失败',
    LOAD_STATS_FAILED: '加载统计数据失败',

    // AI相关错误
    AI_SERVICE_UNAVAILABLE: 'AI服务暂时不可用，请稍后重试',
    AI_REQUEST_FAILED: 'AI请求失败',
    AI_RESPONSE_ERROR: 'AI响应格式错误'
};

// 成功消息配置
const SUCCESS_MESSAGES = {
    NOTE_CREATED: '笔记创建成功！',
    NOTE_UPDATED: '笔记更新成功！',
    NOTE_DELETED: '笔记删除成功！',
    FAVORITE_ADDED: '已添加到收藏！',
    FAVORITE_REMOVED: '已取消收藏！'
};

// DOM选择器配置
const SELECTORS = {
    // 容器
    notesGrid: '#notesGrid',
    loading: '#loading',
    emptyState: '#emptyState',
    pagination: '#pagination',

    // 搜索和过滤
    searchInput: '#searchInput',
    filters: '#filters',

    // 统计卡片
    totalNotes: '#totalNotes',
    totalSubjects: '#totalSubjects',
    totalFavorites: '#totalFavorites',
    totalTags: '#totalTags',
    totalNotesCard: '#totalNotesCard',
    totalSubjectsCard: '#totalSubjectsCard',
    totalFavoritesCard: '#totalFavoritesCard',
    totalTagsCard: '#totalTagsCard',

    // 模态框
    noteModal: '#noteModal',
    displayModal: '#displayModal',
    subjectModal: '#subjectModal',
    tagModal: '#tagModal',

    // 表单元素
    noteForm: '#noteForm',
    modalTitle: '#modalTitle',
    noteSubject: '#noteSubject',
    noteTitle: '#noteTitle',
    noteContent: '#noteContent',
    tagsInput: '#tagsInput',

    // 显示元素
    displaySubject: '#displaySubject',
    displayTitle: '#displayTitle',
    displayContent: '#displayContent',
    displayTags: '#displayTags',
    displayDates: '#displayDates',
    displayEditBtn: '#displayEditBtn',
    displayFavoriteBtn: '#displayFavoriteBtn',
    favoriteText: '#favoriteText',

    // 主题
    themeIcon: '#themeIcon',

    // 列表
    subjectList: '#subjectList',
    tagList: '#tagList'
};

// 主题配置
const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
    STORAGE_KEY: 'theme'
};

// 本地存储键配置
const STORAGE_KEYS = {
    THEME: 'theme',
    LAST_SEARCH: 'lastSearch',
    USER_PREFERENCES: 'userPreferences'
};

// HTTP状态码
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// 动画类名配置
const ANIMATION_CLASSES = {
    FADE_IN: 'animate-fadeIn',
    FADE_IN_UP: 'animate-fadeInUp',
    SLIDE_IN_DOWN: 'animate-slideInDown',
    SLIDE_IN_UP: 'animate-slideInUp',
    SLIDE_IN_LEFT: 'animate-slideInLeft',
    SLIDE_IN_RIGHT: 'animate-slideInRight',
    BOUNCE: 'animate-bounce',
    PULSE: 'animate-pulse',
    SPIN: 'animate-spin',
    SHAKE: 'animate-shake',
    HEARTBEAT: 'animate-heartbeat'
};

// 键盘快捷键配置
const KEYBOARD_SHORTCUTS = {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    NEW_NOTE: 'n',
    SEARCH: '/',
    THEME_TOGGLE: 't'
};

// 验证规则配置
const VALIDATION_RULES = {
    subject: {
        required: true,
        maxLength: CONFIG.MAX_SUBJECT_LENGTH
    },
    title: {
        required: true,
        maxLength: CONFIG.MAX_TITLE_LENGTH
    },
    content: {
        required: true,
        maxLength: CONFIG.MAX_CONTENT_LENGTH
    },
    tags: {
        maxCount: CONFIG.MAX_TAGS_COUNT,
        maxLength: CONFIG.MAX_TAG_LENGTH
    }
};

// 工具函数：获取错误消息
function getErrorMessage(error) {
    if (error.message) return error.message;
    if (error.status) {
        switch (error.status) {
            case HTTP_STATUS.NOT_FOUND:
                return ERROR_MESSAGES.NOT_FOUND;
            case HTTP_STATUS.BAD_REQUEST:
                return ERROR_MESSAGES.VALIDATION_ERROR;
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return ERROR_MESSAGES.SERVER_ERROR;
            case HTTP_STATUS.SERVICE_UNAVAILABLE:
                return ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE;
            default:
                return ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }
    return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// 工具函数：获取学科图标
function getSubjectIcon(subject) {
    return SUBJECTS.icons[subject] || SUBJECTS.icons['其他'];
}

// 导出配置（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        SUBJECTS,
        TOAST_TYPES,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        SELECTORS,
        THEME,
        STORAGE_KEYS,
        HTTP_STATUS,
        ANIMATION_CLASSES,
        KEYBOARD_SHORTCUTS,
        VALIDATION_RULES,
        getErrorMessage,
        getSubjectIcon
    };
}