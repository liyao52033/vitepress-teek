import type { Component, Ref } from "vue";
import type { TkIconProps } from "../Icon";
import { LoginInfo } from "../../config/types";

// 定义存储键值
export const STORAGE_KEY = 'employee-auth'

/**
 * 判断当前时间是否比给定时间超过指定秒数
 * @param givenTime 给定时间（支持Date对象、时间字符串或时间戳）
 * @param seconds 要判断的秒数（必须为正数）
 * @returns 是否超过指定秒数
 * @throws 当输入无效时间或秒数为非正数时抛出错误
 */
function isMoreThanSeconds(givenTime: Date | string | number, seconds: number): boolean {
  // 验证秒数有效性
  if (seconds <= 0 || isNaN(seconds)) {
    throw new Error(`无效的秒数: ${seconds}（必须是正数）`);
  }

  // 尝试将输入转换为Date对象
  const targetTime = new Date(givenTime);

  // 验证时间有效性
  if (isNaN(targetTime.getTime())) {
    throw new Error(`无效的时间格式: ${givenTime}`);
  }

  // 获取当前时间和目标时间的时间戳（毫秒）
  const currentTimeMs = Date.now();
  const targetTimeMs = targetTime.getTime();

  // 计算时间差（毫秒）并转换为秒
  const timeDiffSeconds = (currentTimeMs - targetTimeMs) / 1000;

  // 返回是否超过指定秒数
  return timeDiffSeconds > seconds;
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
export function checkAuth(loginInfo: LoginInfo): boolean {
  // 从本地存储中获取授权数据
  const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  // 如果授权数据存在并且数据长度不为0，则授权验证通过
  if (auth && Object.keys(auth).length) {
    const { time, expire, accesskey } = auth
    return !isMoreThanSeconds(time, expire) && (accesskey === loginInfo.token);
  }
  
  
  return false;
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