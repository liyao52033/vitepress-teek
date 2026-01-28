import type { Component, Ref } from "vue";
import type { TkIconProps } from "../Icon";

// 定义存储键值
export const STORAGE_KEY = 'employee-auth'

/**
 * 判断当前时间是否比给定的秒级时间戳超过43200秒（12小时）
 * @param givenTimeSeconds 给定的秒级时间戳（如 Math.round(Date.now() / 1000) 的结果）
 * @param seconds 差值秒数
 * @returns 当前时间与给定时间的差值是否超过差值
 * @throws 当输入的时间戳无效时抛出错误
 */
function isMoreThanSeconds(givenTimeSeconds: number, seconds: number): boolean {
  // 验证输入的时间戳有效性
  if (isNaN(givenTimeSeconds)) {
    throw new Error(`无效的秒级时间戳: ${givenTimeSeconds}`);
  }
  
  // 获取当前时间的秒级时间戳
  const currentTimeSeconds = Math.round(Date.now() / 1000);

  // 计算时间差并判断是否超过阈值
  return currentTimeSeconds - givenTimeSeconds > seconds;
}

/**
 * 检查用户身份验证状态
 * 
 * 该函数从本地存储中获取授权数据，并验证以下条件：
 * 1. 授权数据是否存在且不为空
 * 2. 授权数据是否在有效期内
 * 3. 是否存在访问密钥
 * 
 * @returns {boolean} 如果用户已通过身份验证且授权数据有效则返回true，否则返回false
 */
export function checkAuth(): boolean {

  // 只在浏览器环境下访问 localStorage
  if (typeof window === 'undefined') {
    return false
  }
  
  // 从本地存储中获取授权数据
  const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  // 如果授权数据存在并且数据长度不为0，则授权验证通过
  if (auth && Object.keys(auth).length) {
    const { time, expire, accesskey } = auth
    return !isMoreThanSeconds(time, expire) && accesskey;
  }
  
  return false;
}

export async function verifyAuth(apiUrl: string) {
  try {
    // 1. 请求用户信息接口
    const userRes = await fetch(apiUrl + '/getUser', {
      method: 'GET',
      credentials: 'include',
    });

    if (userRes.ok) {
      const userResult = await userRes.json();

      const isUserValid = userResult.user;
      if (isUserValid) {
        return true ;
      }
    }

    // 2. 刷新Token
    const refreshRes = await fetch(apiUrl + '/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!refreshRes.ok) return false;
    const refreshResult = await refreshRes.json();

    // 3. 重试用户信息接口
    if (refreshResult && refreshResult.token) {
      const retryRes = await fetch(apiUrl + '/getUser', {
        method: 'GET',
        credentials: 'include',
      });
      const retryResult = await retryRes.json();

      return retryResult.user;
    }

  } catch (error) {
    return false;
  }
}



// 跳转到登录页时 url 可携带的参数
export const loginUrlKeyMap = {
  realm: "realm",
  toPath: "toPath",
  verifyMode: "verifyMode",
};

export type LoginForm = {
  [key in "username" | "password" | "verifyCode"]: LoginFormItem;
};

export interface LoginFormItem {
  model: string;
  focusModel: boolean;
  errorModel: boolean;
  icon: TkIconProps["icon"];
  placeholder: string;
  type: string;
  append?: Component;
  appendModel?: string | Ref<string>;
}