/**
 * Coze API配置
 */
export interface CozeConfig {
    /**
     * Coze API令牌
     */
    token: string;
    /**
     * Coze API基础URL
     * @default 'https://api.coze.com'
     */
    baseURL?: string;
    /**
     * Coze应用ID
     * @default ''
     */
    appid?: string;
    /**
     * Coze工作流ID
     * @default
     */
    workflowId?: string;
    /**
     * 页面URL
     */
    url?: string;
}

/**
 * AI模型响应
 */
export interface AIModelResponse {
    /**
     * 响应文本
     */
    text: string;
    /**
     * 使用情况
     */
    usage: {
        /**
         * 提示词token数量
         */
        promptTokens: number;
        /**
         * 完成token数量
         */
        completionTokens: number;
        /**
         * 总token数量
         */
        totalTokens: number;
    };
}
