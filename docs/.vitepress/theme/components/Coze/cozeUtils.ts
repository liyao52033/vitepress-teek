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


// 获取 access_token 最新的值
export const updateAccessToken = async () => {
    try {

        const response = await axios.get("/coze/get_accessToken");
        const newAccessToken = response.data?.access_token;
        if (!newAccessToken) return null;
        return newAccessToken;
    }
    catch (error) {
        throw error; // 抛出错误，让外部捕获处理
    }
};


// 获取 refreshToken 最新的值
export const getRefreshToken = async () => {
    try {
        // 调用接口获取响应（接口返回格式：{ refresh_token: "实际令牌值" }）
        const response = await axios.get("/coze/get_refreshToken");

        // 从响应中提取 refresh_token 字段
        // 注意：如果接口未找到令牌，会返回空响应（而非 { refresh_token: null }）
        const newRefreshToken = response.data?.refresh_token;

        // 处理两种无令牌的情况：
        // 1. 接口返回空响应（response.data 不存在）
        // 2. 接口返回了数据，但 refresh_token 字段为空
        if (!newRefreshToken) return null; // 返回默认令牌

        // 返回提取到的有效令牌
        return newRefreshToken;
    }
    catch (error) {
        throw error; // 抛出错误，让外部捕获处理
    }
};

// 通过 refreshToken 刷新 accessToken
export const updateRefreshToken = async () => {
    try {
        const token = await getRefreshToken();

        const res = await axios.post(
            "/coze/refresh_token",
            { refresh_token: token, },
            {
                headers: { "Content-Type": "application/json" },
            });

        const data = res.data;

        // 严格校验：必须同时存在 access_token 和 refresh_token
        if (!data?.access_token || !data?.refresh_token) {
            window.location.href = "/coze";
            return null;
        }

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