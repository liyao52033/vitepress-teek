import { watch } from "vue";
import { useDraggable } from "@vueuse/core";
import axios from "axios";

/**
 * 对话框拖拽容器，带边界限制
 * @param container 容器元素
 */
export function initializeDraggable(container: HTMLElement) {
    if (container.dataset.dragInitialized === "true") return;
    container.dataset.dragInitialized = "true";

    container.style.position = "fixed";
    container.style.width = container.offsetWidth + "px";
    container.style.height = container.offsetHeight + "px";

    const computedStyle = getComputedStyle(container);
    let left = parseFloat(computedStyle.left);
    let top = parseFloat(computedStyle.top);
    if (isNaN(left)) left = 0;
    if (isNaN(top)) top = 0;

    container.style.left = `${ left }px`;
    container.style.top = `${ top }px`;

    // 创建顶部拖拽条
    const dragHandle = document.createElement("div");
    dragHandle.style.position = "absolute";
    dragHandle.style.top = "0";
    dragHandle.style.left = "0";
    dragHandle.style.width = "100%";
    dragHandle.style.height = "30px";
    dragHandle.style.cursor = "move";
    dragHandle.style.userSelect = "none";
    dragHandle.style.zIndex = "10000";
    container.insertBefore(dragHandle, container.firstChild);

    const iframe = container.querySelector("iframe") as HTMLElement | null;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 使用 useDraggable
    const { x, y } = useDraggable(container, {
        handle: dragHandle,
        initialValue: { x: left, y: top },
        preventDefault: true,
        stopPropagation: true,
        onStart() {
            dragHandle.style.cursor = "move";
            container.style.transition = "none";
            if (iframe) iframe.style.pointerEvents = "none";
        },
        onEnd() {
            dragHandle.style.cursor = "move";
            container.style.transition = "";
            if (iframe) iframe.style.pointerEvents = "auto";
        },
    });

    // 监听坐标，限制边界并更新位置
    watch([x, y], ([newX, newY]) => {
        let limitedX = newX;
        let limitedY = newY;

        if (limitedX < 0) limitedX = 0;
        else if (limitedX > viewportWidth - containerWidth) limitedX = viewportWidth - containerWidth;

        if (limitedY < 0) limitedY = 0;
        else if (limitedY > viewportHeight - containerHeight) limitedY = viewportHeight - containerHeight;

        container.style.left = `${ limitedX }px`;
        container.style.top = `${ limitedY }px`;
    });
}

/**
 * 保存和读取位置的工具函数
 */
const POSITION_STORAGE_KEY = 'coze-button-position';

export const getSavedPosition = () => {
    try {
        const posStr = localStorage.getItem(POSITION_STORAGE_KEY);
        if (posStr) return JSON.parse(posStr);
    }
    catch (e) {
        console.error('读取保存的位置失败:', e);
    }
    return null;
};

export const savePosition = (pos: any) => {
    try {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
    }
    catch (e) {
        console.error('保存位置失败:', e);
    }
};

/**
 * 获取 Cookie 值的工具函数
 * @param name Cookie 名称
 * @returns Cookie 值或 null
 */
export const getCookieValue = (name: string) => {
    const value = `; ${ document.cookie }`;
    const parts = value.split(`; ${ name }=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
};


export function setCookie(token: string) {
    if (!token) return;

    // path=/ 保证和插件写的一致，覆盖即可
    const maxAge = 30 * 24 * 60 * 60; // 30天
    document.cookie = `refresh_token=${ encodeURIComponent(token) }; Path=/; max-age=${ maxAge }; SameSite=Strict; Secure; Cross-Site=Strict; Partitioned`;
}


// 创建更新 accessToken 的方法，确保能获取到异步函数的最新值
export const updateAccessToken = async (token: string) => {
    try {
        // 获取本地的access_token
        const storeToken = localStorage.getItem('coze_oauth_state');
        if (!storeToken) return null;
        const localToken = JSON.parse(storeToken);
        if (localToken && localToken?.accessToken) {
            token = localToken.accessToken
            return token;
        }
        return null

    }
    catch (error) {

        throw error;

    }
};

// 获取 refreshToken 最新的值
export const getRefreshToken = async () => {
    try {
        const cookieValue = getCookieValue('refresh_token');
        if (cookieValue) {
            return cookieValue;
        }
        return null;
    }
    catch (error) {

        return null;
    }
};

// 通过 refreshToken 刷新 accessToken
export const updateRefreshToken = async () => {
    try {
        const token = await getRefreshToken();

        const res = await axios.post(
            "/coze/refresh_token",
            {
                refresh_token: token,
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const data = res.data;

        // 严格校验：必须同时存在 access_token 和 refresh_token
        if (!data?.access_token || !data?.refresh_token) {
            window.location.href = "/coze";
            return null;
        }

        // 正常更新 token
        setCookie(data.refresh_token);
        localStorage.setItem(
            "coze_oauth_state",
            JSON.stringify({ accessToken: data.access_token })
        );

        return data.access_token;
    }
    catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("请求失败：", err.response?.status, err.response?.data);
        }
        window.location.href = "/coze";
        return null;
    }
};