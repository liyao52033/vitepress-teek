import { STORAGE_KEY } from "./helper";
import { LoginInfo } from "../../config/types";
import axios from "axios";

// 定义统一的登录返回类型
export type LoginResult = {
    success: boolean;
    message: string;
    token?: string;
};

// 本地登录接口实现
export const localLogin = async (
    username: string,
    password: string,
    loginInfo: LoginInfo
): Promise<LoginResult> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 验证逻辑
    if (username === loginInfo.username && password === loginInfo.password) {
        // 生成并存储登录信息
        const token = loginInfo.token || `local-token-${Date.now()}`;
        const data = JSON.stringify({
            time: Math.round(Date.now() / 1000),
            expire: 86400 * (loginInfo.expiration || 0.5) ,
            accesskey: token,
        });
        localStorage.setItem(STORAGE_KEY, data);

        return {
            success: true,
            message: "登录成功",
            token
        };
    } else {
        return {
            success: false,
            message: "账号或密码错误!"
        };
    }
};


// Node接口实现
export const nodeLogin = async (
    username: string,
    password: string,
    loginInfo: LoginInfo
): Promise<LoginResult> => {
    try {
        const response = await axios({
            url: loginInfo.apiUrl + "/login",
            method: 'POST',
            data: { username, password }, 
            headers: { 'Content-Type': 'application/json' }
        });

        // 如果后端返回格式一致，可以直接返回
        // 如果不一致，这里可以做格式转换
        const result: LoginResult = response.data;
        const token = loginInfo.token;

        // 登录成功时存储令牌（与本地登录保持一致的存储逻辑）
        if (result.success && result.token) {
            const data = JSON.stringify({
                time: Math.round(Date.now() / 1000),
                expire: 86400 * (loginInfo.expiration || 0.5),
                accesskey: token || result.token,
            });
            localStorage.setItem(STORAGE_KEY, data);
        }

        return result;
    } catch (error) {
        // 统一错误处理
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.response?.data?.message || '登录请求失败，请检查网络'
            };
        }
        return {
            success: false,
            message: '登录过程发生未知错误'
        };
    }
};

// Supabase登录接口实现
const supabaseLogin = async (
    username: string,
    password: string,
    loginInfo: LoginInfo
) => { 
    try {

        // 调用后端登录接口
        const response = await fetch(loginInfo.apiUrl + "/login",{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: username,
                password
            }),
        });

        const data = await response.json();

        // 处理响应结果
        if (response.ok && data.session) { 

            return {
                success: true,
                message: "登录成功",
                token: data.session.access_token
            };
        }

        return {
            success: false,
            message: data?.error || "登录失败，未知错误"
        };

    } catch (error) { 
        // 统一错误处理
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.message || '登录请求失败，请检查网络'
            };
        }
        return {
            success: false,
            message: '登录过程发生未知错误'
        };
    }
}



// 统一导出登录方法（方便后续扩展）
export const loginService = {
    localLogin,
    nodeLogin,
    supabaseLogin
};
