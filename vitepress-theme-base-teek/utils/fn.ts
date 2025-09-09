import { useRoute } from "vitepress";

/**
 * 获取当前页面路径
 * @returns {string} 当前页面的路径部分（例如：/pages/fe4521）
 */
export function getPagePath(): string {
    const route = useRoute()
    return route.path
}


/**
 * 获取对象类型的小写字符串
 * @param o 任意值
 * @returns 对象类型字符串，例如 "array"、"object"、"string"
 */
export function type(o: any): string {
    const s = Object.prototype.toString.call(o);
    const match = s.match(/\[object (.*?)]/);
    return match ? match[1].toLowerCase() : 'unknown';
}

/**
 * 修复日期时区问题，返回 UTC 格式字符串
 * @param date Date 或可解析为 Date 的值
 * @returns 格式化后的 UTC 日期字符串 "YYYY-MM-DD HH:mm:ss"
 */
export function repairDate(date: Date | string | number): string {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${zero(d.getUTCMonth() + 1)}-${zero(d.getUTCDate())} ` +
        `${zero(d.getUTCHours())}:${zero(d.getUTCMinutes())}:${zero(d.getUTCSeconds())}`;
}

/**
 * 本地日期格式化 "YYYY-MM-DD HH:mm:ss"
 * @param date Date 对象
 */
export function dateFormat(date: Date): string {
    return `${date.getFullYear()}-${zero(date.getMonth() + 1)}-${zero(date.getDate())} ` +
        `${zero(date.getHours())}:${zero(date.getMinutes())}:${zero(date.getSeconds())}`;
}

/**
 * 小于10补0
 * @param d 数字
 * @returns 补0后的字符串
 */
function zero(d: number): string {
    return d.toString().padStart(2, '0');
}
