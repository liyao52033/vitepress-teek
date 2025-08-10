<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import secureInfo from '../../../../secureInfo';
import { initializeDraggable } from './cozeUtils';

const POSITION_STORAGE_KEY = 'coze-button-position';
const DRAG_THROTTLE_MS = 16;
const SNAP_DISTANCE = 20;

const getSavedPosition = () => {
  try {
    const posStr = localStorage.getItem(POSITION_STORAGE_KEY);
    if (posStr) return JSON.parse(posStr);
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
  if (savedPos?.left != null && savedPos?.top != null) {
    button.style.position = 'fixed';
    button.style.left = `${savedPos.left}px`;
    button.style.top = `${savedPos.top}px`;
    button.style.bottom = 'auto';
    button.style.right = 'auto';
    button.style.transform = 'none';
  } else {
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.top = 'auto';
    button.style.left = 'auto';
    button.style.transform = 'none';
  }

  let dragging = false;
  let moved = false;
  let startX = 0, startY = 0;
  let btnStartLeft = 0, btnStartTop = 0;
  let lastDragTime = 0;

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging = true;
    moved = false;
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

    if (moved && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10)) {
      const onClickPrevent = (clickEvent) => {
        clickEvent.stopImmediatePropagation();
        button.removeEventListener('click', onClickPrevent, true);
      };
      button.addEventListener('click', onClickPrevent, true);
      setTimeout(() => {
        button.removeEventListener('click', onClickPrevent, true);
      }, 100);
    }
  };

  button.removeEventListener('mousedown', onMouseDown);
  button.addEventListener('mousedown', onMouseDown);
};

let mutationObserver = null;
function setupButtonObserver() {
  if (mutationObserver) mutationObserver.disconnect();
  mutationObserver = new MutationObserver(() => {
    const button = document.querySelector('.ab1ac9d9bab12da47298');
    if (button) {
      setupDraggable(button);
      ensureButtonInViewport();
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
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

const ensureButtonInViewport = () => {
  const button = document.querySelector('.ab1ac9d9bab12da47298');
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (rect.right > vw || rect.left < 0 || rect.bottom > vh || rect.top < 0) {
    const newLeft = Math.min(Math.max(0, rect.left), vw - rect.width);
    const newTop = Math.min(Math.max(0, rect.top), vh - rect.height);
    button.style.left = `${newLeft}px`;
    button.style.top = `${newTop}px`;
    button.style.position = 'fixed';
  }
};

onMounted(() => {
  injectInitialStyles();
  setupButtonObserver();

  const handleResize = () => ensureButtonInViewport();
  window.addEventListener('resize', handleResize);
  onBeforeUnmount(() => window.removeEventListener('resize', handleResize));

  const sdkUrl = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js';
  const script = document.createElement('script');
  script.src = sdkUrl;
  script.type = 'text/javascript';

  script.onload = () => {
    if (window.CozeWebSDK && window.CozeWebSDK.WebChatClient) {
      new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: secureInfo.botId,
       //   isIframe: false,
        },
        auth: {
          type: 'token',
          token: secureInfo.botAccessToken,
          onRefreshToken: () => secureInfo.botAccessToken,
        },
        ui: {
           base: {
            layout: 'pc',  // 强制 PC 布局
          },
          chatBot: {
            title: '博客问答助手',
            uploadable: true,
            isNeedAddNewConversation: true,
            isNeedFunctionCallMessage: true,
            isNeedQuote: true,
            onShow: () => {
              const button = document.querySelector('.ab1ac9d9bab12da47298');
              if (button) {
                setupDraggable(button);
                ensureButtonInViewport();
              }
              setTimeout(() => {
                const chatContainer = document.querySelector('.fa8097ff55eabaa5782b');
                if (chatContainer && chatContainer.style.display !== 'none') {
                  initializeDraggable(chatContainer);
                }
              }, 100);
            },
          },
          conversations: { isNeed: true },
          footer: {
            isShow: true,
            expressionText: 'Powered by {{name}}  拖拽顶部移动对话框',
            linkvars: {
              name: { text: 'liyao52033', link: 'https://xiaoying.org.cn' },
            },
          },
        },
      });
    } else {
      console.error('Coze SDK 未成功加载');
    }
  };

  script.onerror = () => console.error('Coze SDK 加载失败');
  document.body.appendChild(script);
});
</script>

<template>
  <!-- 不需要额外容器，SDK 自己插入聊天框和按钮 -->
</template>

<style scoped>
.ab1ac9d9bab12da47298 {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 9999 !important;
  cursor: pointer !important;
  user-select: none;
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

/* 小屏幕缩放 */
@media (max-width: 768px) {
  .ab1ac9d9bab12da47298 {
    transform: scale(0.85) !important;
    right: 10px !important;
    bottom: 10px !important;
  }
}
@media (max-width: 480px) {
  .ab1ac9d9bab12da47298 {
    transform: scale(0.75) !important;
    right: 5px !important;
    bottom: 5px !important;
  }
}
</style>
