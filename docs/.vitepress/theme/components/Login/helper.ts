import type { Component, Ref } from "vue";
import type { TkIconProps } from "../Icon";

// 定义存储键值
export const STORAGE_KEY = 'employee-auth'

/**
 * 检查用户授权验证
 * @returns {boolean} 返回是否授权验证通过
 */
export function checkAuth() {
  // 从本地存储中获取授权数据
  const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  // 如果授权数据存在并且数据长度不为0，则授权验证通过
  return auth && Object.keys(auth).length;
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