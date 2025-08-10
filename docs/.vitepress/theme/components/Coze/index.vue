<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import secureInfo from "../../../../secureInfo";
import { initializeDraggable } from "./cozeUtils";

const POSITION_STORAGE_KEY = 'coze-button-position';

// 拖拽节流阈值，单位毫秒
const DRAG_THROTTLE_MS = 16; // 约60fps
const SNAP_DISTANCE = 20;

const getSavedPosition = () => {
  try {
    const posStr = localStorage.getItem(POSITION_STORAGE_KEY);
    if (posStr) {
      return JSON.parse(posStr);
    }
  } catch (e) {
    console.error('读取保存的位置失败:', e);
  }
  return null;
};

const savePosition = (pos) => {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
  } catch (e) {
    console.error('保存位置失败:', e);
  }
};

const setupDraggable = (button) => {
  const savedPos = getSavedPosition();

  if (savedPos && typeof savedPos.left === 'number' && typeof savedPos.top === 'number') {
    button.style.position = 'fixed';
    button.style.left = `${savedPos.left}px`;
    button.style.top = `${savedPos.top}px`;
    button.style.bottom = 'auto';
    button.style.right = 'auto';
    button.style.transform = 'none';
  } else {
    // 无保存位置，默认右下角
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.top = 'auto';
    button.style.left = 'auto';
    button.style.transform = 'none';
  }

  let dragging = false;
  let moved = false; // 新增：标记是否拖动过
  let startX = 0;
  let startY = 0;
  let btnStartLeft = 0;
  let btnStartTop = 0;
  let lastDragTime = 0;

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging = true;
    moved = false; // 每次按下清空标记
    startX = e.clientX;
    startY = e.clientY;
    const rect = button.getBoundingClientRect();
    btnStartLeft = rect.left;
    btnStartTop = rect.top;
    button.style.position = 'fixed';
    button.style.transform = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const now = Date.now();
    if (now - lastDragTime < DRAG_THROTTLE_MS) return;
    lastDragTime = now;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // 判断拖动距离是否超过阈值（这里3px），避免微动也算拖动
    if (!moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      moved = true;
    }

    let newLeft = btnStartLeft + deltaX;
    let newTop = btnStartTop + deltaY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnRect = button.getBoundingClientRect();

    newLeft = Math.min(Math.max(0, newLeft), vw - btnRect.width);
    newTop = Math.min(Math.max(0, newTop), vh - btnRect.height);

    if (newLeft < SNAP_DISTANCE) newLeft = 0;
    if (vw - (newLeft + btnRect.width) < SNAP_DISTANCE) newLeft = vw - btnRect.width;
    if (newTop < SNAP_DISTANCE) newTop = 0;
    if (vh - (newTop + btnRect.height) < SNAP_DISTANCE) newTop = vh - btnRect.height;

    button.style.left = `${newLeft}px`;
    button.style.top = `${newTop}px`;
    button.style.bottom = 'auto';
    button.style.right = 'auto';
  };

  const onMouseUp = (e) => {
    if (!dragging) return;
    dragging = false;

    const rect = button.getBoundingClientRect();
    savePosition({ left: rect.left, top: rect.top });

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    // 只有在明显拖动时才阻止点击事件
    if (moved && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10)) {
      // 临时阻止一次点击事件，但使用更短的延迟
      const onClickPrevent = (clickEvent) => {
        clickEvent.stopImmediatePropagation();
        button.removeEventListener('click', onClickPrevent, true);
      };
      button.addEventListener('click', onClickPrevent, true);

      // 使用更短的延迟时间
      setTimeout(() => {
        button.removeEventListener('click', onClickPrevent, true);
      }, 100); // 从1000ms减少到100ms
    }
  };

  // 先移除旧监听，防止重复绑定
  button.removeEventListener('mousedown', onMouseDown);
  button.addEventListener('mousedown', onMouseDown);
};

// 声明为函数表达式并立即导出，这样TypeScript会认为它被使用了
let mutationObserver = null;
function setupButtonObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver(() => {
    const button = document.querySelector('.ab1ac9d9bab12da47298');
    if (button) {
      // 设置拖拽功能
      setupDraggable(button);
      // 确保按钮在视口内
      ensureButtonInViewport();
    }
  });

  // 监听DOM变化
  mutationObserver.observe(document.body, { 
    childList: true, 
    subtree: true
  });
}

const injectInitialStyles = () => {
  const style = document.createElement('style');
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
  `;
  document.head.appendChild(style);
};

// 简单的函数，确保按钮不会跑到屏幕外面
const ensureButtonInViewport = () => {
  const button = document.querySelector('.ab1ac9d9bab12da47298');
  if (!button) return;
  
  const rect = button.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // 如果按钮超出屏幕，调整位置
  if (rect.right > vw || rect.left < 0 || rect.bottom > vh || rect.top < 0) {
    // 计算新位置，确保在视口内
    const newLeft = Math.min(Math.max(0, rect.left), vw - rect.width);
    const newTop = Math.min(Math.max(0, rect.top), vh - rect.height);
    
    button.style.left = `${newLeft}px`;
    button.style.top = `${newTop}px`;
    button.style.position = 'fixed';
  }
};

onMounted(() => {
  injectInitialStyles();
  
  // 设置按钮观察器并立即调用
  setupButtonObserver();

  // 添加窗口大小变化监听，确保按钮不会跑到屏幕外面
  const handleResize = () => {
    ensureButtonInViewport();
  };
  
  window.addEventListener('resize', handleResize);
  
  // 在组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  const sdkUrl = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";
  const externalScript = document.createElement("script");
  externalScript.src = sdkUrl;
  externalScript.type = "text/javascript";

  externalScript.onload = () => {
    if (window.CozeWebSDK && window.CozeWebSDK.WebChatClient) {
      new window.CozeWebSDK.WebChatClient({
        config: {
          type: 'bot',
          bot_id: secureInfo.botId,
          isIframe: false,
        },
        auth: {
          type: "token",
          token: secureInfo.botAccessToken,
          onRefreshToken: () => secureInfo.botAccessToken,
        },
        ui:{
          chatBot: {
            title: "博客问答助手",
            uploadable: true,
        //   width: 500,
            el: undefined,
            isNeedAddNewConversation: true,
            isNeedQuote: true,
            // onHide: () => {
            //   // todo...
            // },
            onShow: () => {
              // 处理按钮拖拽
              const button = document.querySelector('.ab1ac9d9bab12da47298');
              if (button) {
                setupDraggable(button);
                ensureButtonInViewport();
              }
              
              // 处理对话框拖拽
              setTimeout(() => {
                const chatContainer = document.querySelector('.fa8097ff55eabaa5782b');
                if (chatContainer && chatContainer.style.display !== "none") {
                  initializeDraggable(chatContainer);
                }
              }, 100); // 短暂延迟确保DOM完全渲染
            },
          },
          footer: {
            isShow: true,
            expressionText: 'Powered by {{name}}  拖拽顶部移动对话框',
            linkvars: {
              name: {
                text: 'liyao52033',
                link: 'https://xiaoying.org.cn'
              }
            }
          },
        }
      });

      // 不再需要延迟初始化，将在onShow回调中处理
    } else {
      console.error("Coze SDK 未成功加载");
    }
  };

  externalScript.onerror = () => {
    console.error("Coze SDK 加载失败");
  };

  document.body.appendChild(externalScript);
});
</script>

<template></template>

<style>
.ab1ac9d9bab12da47298 {
  /* 确保按钮在所有屏幕尺寸下都可见 */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  /* 确保按钮在小屏幕上不会被其他元素覆盖 */
  z-index: 9999 !important;
}

.ab1ac9d9bab12da47298:hover::after {
  content: "拖拽移动";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-size: 12px;
  margin-bottom: 6px;
  z-index: 10000;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .ab1ac9d9bab12da47298 {
    /* 在小屏幕上调整按钮位置和大小 */
    transform: scale(0.85) !important;
    right: 10px !important;
    bottom: 10px !important;
  }
}

@media (max-width: 480px) {
  .ab1ac9d9bab12da47298 {
    /* 在更小的屏幕上进一步调整 */
    transform: scale(0.75) !important;
    right: 5px !important;
    bottom: 5px !important;
  }
}
</style>
