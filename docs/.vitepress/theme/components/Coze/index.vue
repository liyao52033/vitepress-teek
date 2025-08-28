<script lang="ts" setup>
//@ts-ignore
import secureInfo from "@/secureInfo";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { getState, initializeDraggable, updateAccessToken, updateRefreshToken } from "./cozeUtils";

defineOptions({ name: "Coze" });

const POSITION_STORAGE_KEY = "coze-button-position";
const accessToken = ref("123456");

// 判断是否移动端
const isMobile = window.matchMedia("(pointer: coarse)").matches;
// 根字体大小
const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

// 拖拽节流和吸附距离
const DRAG_THROTTLE_MS = isMobile ? 40 : 16;
const SNAP_DISTANCE_PX = isMobile ? 50 : 20;

// 初始底部距离 px (影响初始 top 计算)
const BOTTOM_SAFE_AREA_PX = isMobile ? 86 : 96;

// 保存 resize 处理函数的引用
let handleResize: (() => void) | null = null;

// 保存和读取的位置结构改成 leftRatio 和 topRatio
const getSavedPosition = () => {
    try {
        const posStr = localStorage.getItem(POSITION_STORAGE_KEY);
        if (posStr) return JSON.parse(posStr);
    }
    catch (e) {
        console.error("读取保存的位置失败:", e);
    }
    return null;
};

const savePosition = (pos: any) => {
    try {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
    }
    catch (e) {
        console.error("保存位置失败:", e);
    }
};

const setupDraggable = (button: HTMLElement) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 移动端固定在初始位置，不开启拖拽
    if (isMobile) {
        button.style.position = "fixed";
        button.style.left = "auto";
        button.style.top = "auto";
        button.style.right = ""; // 交由 CSS 控制（含 !important）
        button.style.bottom = ""; // 交由 CSS 控制（含 !important）
        button.style.transform = "none";
        return;
    }

    const savedPos = getSavedPosition();

    // 初始 left 和 top，优先用保存的比例算
    let leftPx = savedPos?.leftRatio != null ? savedPos.leftRatio * vw : vw - button.offsetWidth - 32;
    let topPx = savedPos?.topRatio != null ? savedPos.topRatio * vh : vh - button.offsetHeight - BOTTOM_SAFE_AREA_PX;

    // 限制范围，防止出屏幕
    leftPx = Math.min(Math.max(0, leftPx), vw - button.offsetWidth);
    topPx = Math.min(Math.max(0, topPx), vh - button.offsetHeight);

    button.style.position = "fixed";
    button.style.left = `${ leftPx / rootFontSize }rem`;
    button.style.top = `${ topPx / rootFontSize }rem`;
    button.style.right = "auto";
    button.style.bottom = "auto";
    button.style.transform = "none";

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let btnStartLeftPx = leftPx;
    let btnStartTopPx = topPx;
    let lastDragTime = 0;

    const onMouseDown = (e: any) => {
        e.preventDefault();
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = button.getBoundingClientRect();
        btnStartLeftPx = rect.left;
        btnStartTopPx = rect.top;

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: any) => {
        if (!dragging) return;
        const now = Date.now();
        if (now - lastDragTime < DRAG_THROTTLE_MS) return;
        lastDragTime = now;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (!moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
            moved = true;
        }

        let newLeft = btnStartLeftPx + deltaX;
        let newTop = btnStartTopPx + deltaY;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        newLeft = Math.min(Math.max(0, newLeft), vw - button.offsetWidth);
        newTop = Math.min(Math.max(0, newTop), vh - button.offsetHeight);

        if (newLeft < SNAP_DISTANCE_PX) newLeft = 0;
        if (vw - (newLeft + button.offsetWidth) < SNAP_DISTANCE_PX) newLeft = vw - button.offsetWidth;
        if (newTop < SNAP_DISTANCE_PX) newTop = 0;
        if (vh - (newTop + button.offsetHeight) < SNAP_DISTANCE_PX) newTop = vh - button.offsetHeight;

        button.style.left = `${ newLeft / rootFontSize }rem`;
        button.style.top = `${ newTop / rootFontSize }rem`;
    };

    const onMouseUp = (e: any) => {
        if (!dragging) return;
        dragging = false;

        const rect = button.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const leftRatio = rect.left / vw;
        const topRatio = rect.top / vh;

        savePosition({ leftRatio, topRatio });

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        if (moved && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10)) {
            const onClickPrevent = (clickEvent: any) => {
                clickEvent.stopImmediatePropagation();
                button.removeEventListener("click", onClickPrevent, true);
            };
            button.addEventListener("click", onClickPrevent, true);
            setTimeout(() => {
                button.removeEventListener("click", onClickPrevent, true);
            }, 100);
        }
    };

    button.removeEventListener("mousedown", onMouseDown);
    button.addEventListener("mousedown", onMouseDown);
};

let mutationObserver: MutationObserver | null = null;

function setupButtonObserver() {
    if (mutationObserver) {mutationObserver.disconnect();}
    mutationObserver = new MutationObserver(() => {
        const button = document.querySelector(".ab1ac9d9bab12da47298") as HTMLElement | null;
        if (button) {
            setupDraggable(button);
            ensureButtonInViewport();
        }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

const injectInitialStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
    .ab1ac9d9bab12da47298 {
      cursor: pointer !important;
      user-select: none;
      z-index: 9999;
      transition: none !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .ab1ac9d9bab12da47298 img {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      display: block;
    }
    @media (max-width: 768px) {
      .ab1ac9d9bab12da47298,
      .ab1ac9d9bab12da47298.bc81871a44ea566dd738 {
        display: none !important;
        width: 3.5rem !important;
        height: 3.5rem !important;
        right: -1.5rem !important;
        bottom: 6rem !important;
      }
    }
    @media (max-width: 480px) {
      .ab1ac9d9bab12da47298,
      .ab1ac9d9bab12da47298.bc81871a44ea566dd738 {
        display: none !important;
        width: 3.5rem !important;
        height: 3.5rem !important;
      }
    }
  `;
    document.head.appendChild(style);
};

const ensureButtonInViewport = () => {
    const button = document.querySelector(".ab1ac9d9bab12da47298") as HTMLElement | null;
    if (!button) return;
    if (isMobile) return;
    const rect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let newLeft = rect.left;
    let newTop = rect.top;

    if (rect.left < 0) newLeft = 0;
    if (rect.top < 0) newTop = 0;
    if (rect.right > vw) newLeft = vw - rect.width;
    if (rect.bottom > vh) newTop = vh - rect.height;

    button.style.left = `${ newLeft / rootFontSize }rem`;
    button.style.top = `${ newTop / rootFontSize }rem`;
    button.style.position = "fixed";
    button.style.right = "auto";
    button.style.bottom = "auto";
    button.style.transform = "none";
};


onMounted(async () => {

    await getState();

    injectInitialStyles();
    setupButtonObserver();

    handleResize = () => {
        const button = document.querySelector(".ab1ac9d9bab12da47298") as HTMLElement | null;
        if (!button) return;
        if (isMobile) {
            // 移动端保持由 CSS 控制的右下角位置
            button.style.position = "fixed";
            button.style.left = "auto";
            button.style.top = "auto";
            button.style.right = "";
            button.style.bottom = "";
            button.style.transform = "none";
            return;
        }
        const savedPos = getSavedPosition();
        if (savedPos?.leftRatio != null && savedPos?.topRatio != null) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let leftPx = savedPos.leftRatio * vw;
            let topPx = savedPos.topRatio * vh;

            leftPx = Math.min(Math.max(0, leftPx), vw - button.offsetWidth);
            topPx = Math.min(Math.max(0, topPx), vh - button.offsetHeight);

            button.style.left = `${ leftPx / rootFontSize }rem`;
            button.style.top = `${ topPx / rootFontSize }rem`;
            button.style.position = "fixed";
            button.style.right = "auto";
            button.style.bottom = "auto";
            button.style.transform = "none";
        }
    };

    window.addEventListener("resize", handleResize);

    const sdkUrl = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.type = "text/javascript";

    script.onload = () => {
        if ((window as any).CozeWebSDK?.WebChatClient) {
            // 创建一个函数来初始化 WebChatClient，确保获取最新的 token
            new (window as any).CozeWebSDK.WebChatClient({
                config: {
                    bot_id: secureInfo.botId,
                },
                auth: {
                    type: "token",
                    token: accessToken.value,
                    onRefreshToken: () => updateRefreshToken()
                },
                userInfo: {
                    url: "https://vp.teek.top/teek-logo-large.png",
                    nickname: "liyao52033",
                },
                ui: {
                    chatBot: {
                        title: "博客问答助手",
                        width: 500,
                        uploadable: true,
                        isNeedAudio: false,
                        isNeedAddNewConversation: true,
                        isNeedFunctionCallMessage: true,
                        isNeedQuote: true,
                        onBeforeShow: async () => {
                            accessToken.value = await updateAccessToken();
                        },
                        onShow: () => {
                            const button = document.querySelector(".ab1ac9d9bab12da47298") as HTMLElement | null;
                            if (button) {
                                setupDraggable(button);
                                ensureButtonInViewport();
                            }
                            setTimeout(() => {
                                const chatContainer = document.querySelector(".fa8097ff55eabaa5782b") as HTMLElement | null;
                                if (!isMobile && chatContainer && chatContainer.style.display !== "none") {
                                    initializeDraggable(chatContainer);
                                }
                            }, 100);
                        },
                    },
                    conversations: { isNeed: true },
                    footer: {
                        isShow: true,
                        expressionText: "Powered by {{name}}  拖拽顶部移动对话框",
                        linkvars: {
                            name: { text: "liyao52033", link: "https://xiaoying.org.cn" },
                        },
                    },
                },
            });
        } else {
            console.error("Coze SDK 未成功加载");
        }
    };

    script.onerror = () => console.error("Coze SDK 加载失败");
    document.body.appendChild(script);
});

onBeforeUnmount(() => {
    if (handleResize) {
        window.removeEventListener("resize", handleResize);
    }
    if (mutationObserver) {
        mutationObserver.disconnect();
    }
});
</script>

<template>
</template>