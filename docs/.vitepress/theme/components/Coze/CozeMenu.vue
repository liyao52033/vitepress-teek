<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import secureInfo from "@/secureInfo";

// 存储位置信息的键名
const POSITION_STORAGE_KEY = 'coze-button-position';

// 预设位置选项
const positionOptions = [
  { id: 'bottom-right', label: '右下角', css: { bottom: '6rem', right: '30px', top: 'auto', left: 'auto' } },
  { id: 'bottom-left', label: '左下角', css: { bottom: '6rem', left: '30px', top: 'auto', right: 'auto' } },
  { id: 'top-right', label: '右上角', css: { top: '6rem', right: '30px', bottom: 'auto', left: 'auto' } },
  { id: 'top-left', label: '左上角', css: { top: '6rem', left: '30px', bottom: 'auto', right: 'auto' } },
  { id: 'center-right', label: '右侧中间', css: { top: '50%', right: '30px', bottom: 'auto', left: 'auto', transform: 'translateY(-50%)' } },
  { id: 'center-left', label: '左侧中间', css: { top: '50%', left: '30px', bottom: 'auto', right: 'auto', transform: 'translateY(-50%)' } }
];

// 获取保存的位置ID
const getSavedPositionId = () => {
  try {
    return localStorage.getItem(POSITION_STORAGE_KEY) || 'bottom-right';
  } catch (e) {
    console.error('读取保存的位置失败:', e);
    return 'bottom-right';
  }
};

// 保存位置ID到本地存储
const savePositionId = (id) => {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, id);
  } catch (e) {
    console.error('保存位置失败:', e);
  }
};

// 当前选择的位置ID
const currentPositionId = ref(getSavedPositionId());

// 全局变量，用于存储菜单元素和事件监听器
let menu = null;
let buttonEventListeners = {};
let menuEventListeners = {};
let mutationObserver = null;
let styleElement = null;

// 在DOM加载前注入初始样式，防止位置闪烁
const injectInitialStyles = () => {
  // 获取保存的位置ID
  const positionId = getSavedPositionId();
  
  // 创建样式元素
  styleElement = document.createElement('style');
  styleElement.id = 'coze-initial-style';
  
  // 为所有可能的位置添加样式，但只有bottom使用!important
  styleElement.textContent = `
    /* 预先定义所有可能的位置样式，防止闪烁 */
    .ab1ac9d9bab12da47298[data-position="bottom-right"],
    .ab1ac9d9bab12da47298:not([data-position]) {
      bottom: 6rem !important;
      right: 30px;
      top: auto;
      left: auto;
    }
    
    .ab1ac9d9bab12da47298[data-position="bottom-left"] {
      bottom: 6rem !important;
      left: 30px;
      top: auto;
      right: auto;
    }
    
    .ab1ac9d9bab12da47298[data-position="top-right"] {
      top: 6rem;
      right: 30px;
      bottom: auto;
      left: auto;
    }
    
    .ab1ac9d9bab12da47298[data-position="top-left"] {
      top: 6rem;
      left: 30px;
      bottom: auto;
      right: auto;
    }
    
    .ab1ac9d9bab12da47298[data-position="center-right"] {
      top: 50%;
      right: 30px;
      bottom: auto;
      left: auto;
      transform: translateY(-50%);
    }
    
    .ab1ac9d9bab12da47298[data-position="center-left"] {
      top: 50%;
      left: 30px;
      bottom: auto;
      right: auto;
      transform: translateY(-50%);
    }
    
    /* 为当前选中的位置添加特定样式 */
    .ab1ac9d9bab12da47298[data-position="${positionId}"],
    .ab1ac9d9bab12da47298:not([data-position]) {
      ${getPositionStyles(positionId)}
    }
  `;
  
  // 添加到文档头部
  document.head.appendChild(styleElement);
};

// 获取指定位置的CSS样式字符串
const getPositionStyles = (positionId) => {
  const position = positionOptions.find(p => p.id === positionId);
  if (!position) return '';
  
  return Object.entries(position.css).map(([key, value]) => {
    // 只对bottom属性使用!important
    return key === 'bottom' ? `${key}: ${value} !important;` : `${key}: ${value};`;
  }).join('\n');
};

// 加载Coze SDK
onMounted(() => {
  // 在DOM加载时立即注入初始样式，防止位置闪烁
  injectInitialStyles();
  
  const sdkUrl = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";

  // 创建外部脚本
  const externalScript = document.createElement("script");
  externalScript.src = sdkUrl;
  externalScript.type = "text/javascript";

  externalScript.onload = () => {
    // 确保 SDK 已挂载到 window 对象
    if (window.CozeWebSDK && window.CozeWebSDK.WebChatClient) {
      new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: secureInfo.botId,
        },
        componentProps: {
          title: "博客问答助手",
        },
        auth: {
          type: "token",
          token: secureInfo.botAccessToken,
          onRefreshToken: () => secureInfo.botAccessToken,
        },
      });

      // 设置DOM观察器，等待按钮出现
      setupButtonObserver();
      
    } else {
      console.error("Coze SDK 未成功加载");
    }
  };

  externalScript.onerror = () => {
    console.error("Coze SDK 加载失败");
  };

  document.body.appendChild(externalScript);
});

// 设置按钮观察器，等待按钮出现
const setupButtonObserver = () => {
  // 如果已经存在观察器，先断开连接
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  
  // 创建一个新的观察器实例
  mutationObserver = new MutationObserver((mutations) => {
    // 检查按钮是否已经出现
    const button = document.querySelector('.ab1ac9d9bab12da47298');
    if (button) {
      // 按钮已出现，停止观察
      mutationObserver.disconnect();
      
      // 应用位置并设置菜单
      applyPosition(currentPositionId.value, button);
      setupHoverMenu(button);
      
      // 设置按钮变化观察器
      setupButtonChangeObserver();
    }
  });
  
  // 配置观察选项
  const config = { 
    childList: true,  // 观察目标子节点的变化
    subtree: true     // 观察所有后代节点的变化
  };
  
  // 开始观察document.body
  mutationObserver.observe(document.body, config);
};

// 设置按钮变化观察器，监听按钮的变化
const setupButtonChangeObserver = () => {
  // 如果已经存在观察器，先断开连接
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  
  // 创建一个新的观察器实例，使用防抖处理以减少性能影响
  let debounceTimer = null;
  
  mutationObserver = new MutationObserver((mutations) => {
    // 使用防抖技术，避免短时间内多次处理
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      // 检查按钮是否存在
      const button = document.querySelector('.ab1ac9d9bab12da47298');
      if (button) {
        // 检查按钮是否已经有我们的事件监听器
        if (!button.hasAttribute('data-position')) {
          console.log('检测到按钮DOM变化，重新应用位置和事件');
          applyPosition(currentPositionId.value, button);
          
          // 如果菜单存在，重新绑定事件
          if (menu && document.body.contains(menu)) {
            removeEventListeners();
            addEventListeners(button, menu);
          } else {
            // 如果菜单不存在，重新创建
            setupHoverMenu(button);
          }
        }
      } else {
        // 按钮不存在，可能被移除了，重新设置按钮观察器
        setupButtonObserver();
      }
    }, 300); // 300ms防抖延迟
  });
  
  // 优化观察选项
  const config = { 
    childList: true,     // 观察目标子节点的变化
    subtree: true,       // 观察所有后代节点的变化
    attributes: true,    // 观察属性变化
    attributeFilter: ['class', 'style'] // 只观察类和样式属性的变化
  };
  
  // 开始观察document.body
  mutationObserver.observe(document.body, config);
};

// 应用位置
const applyPosition = (positionId, buttonElement = null) => {
  // 如果没有提供按钮元素，尝试查找
  const button = buttonElement || document.querySelector('.ab1ac9d9bab12da47298');
  if (!button) {
    console.error('找不到Coze按钮元素');
    return;
  }

  // 查找对应的位置配置
  const position = positionOptions.find(p => p.id === positionId);
  if (!position) return;

  // 先重置所有可能的位置属性
  button.style.top = 'auto';
  button.style.bottom = 'auto';
  button.style.left = 'auto';
  button.style.right = 'auto';
  button.style.transform = 'none';

  // 应用CSS样式，只对bottom使用!important
  Object.entries(position.css).forEach(([key, value]) => {
    if (key === 'bottom') {
      button.style.setProperty(key, value, 'important');
    } else {
      button.style[key] = value;
    }
  });
  
  // 设置data-position属性，用于CSS选择器
  button.setAttribute('data-position', positionId);
};

// 添加事件监听器
const addEventListeners = (button, menu) => {
  // 清除之前的事件监听器
  removeEventListeners();
  
  // 计算并设置菜单位置的函数
  const updateMenuPosition = () => {
    const buttonRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 默认显示在按钮左侧，紧贴按钮
    let left = buttonRect.left - menuRect.width - 5; // 添加5px间距
    let top = buttonRect.top;
    
    // 如果左侧空间不足，显示在右侧，紧贴按钮
    if (left < 10) {
      left = buttonRect.right + 5; // 添加5px间距
    }
    
    // 确保菜单不超出顶部
    if (top < 10) {
      top = 10;
    }
    
    // 确保菜单不超出底部
    if (top + menuRect.height > viewportHeight - 10) {
      top = viewportHeight - menuRect.height - 10;
    }
    
    // 设置菜单位置
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  };

  // 添加鼠标进入事件
  const handleButtonMouseEnter = () => {
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    updateMenuPosition();
  };
  button.addEventListener('mouseenter', handleButtonMouseEnter);
  buttonEventListeners.mouseenter = handleButtonMouseEnter;
  
  // 添加鼠标离开事件
  const handleButtonMouseLeave = (e) => {
    // 检查是否移动到菜单上
    const toElement = e.relatedTarget;
    if (menu.contains(toElement)) {
      return;
    }
    
    // 添加延迟，给用户一些时间移动到菜单
    setTimeout(() => {
      // 再次检查鼠标是否在菜单上
      if (menu.matches(':hover')) {
        return;
      }
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
    }, 100);
  };
  button.addEventListener('mouseleave', handleButtonMouseLeave);
  buttonEventListeners.mouseleave = handleButtonMouseLeave;
  
  // 菜单也需要鼠标离开事件
  const handleMenuMouseLeave = (e) => {
    // 检查是否移动到按钮上
    const toElement = e.relatedTarget;
    if (button.contains(toElement)) {
      return;
    }
    
    // 添加延迟，给用户一些时间移动回按钮
    setTimeout(() => {
      // 再次检查鼠标是否在按钮上
      if (button.matches(':hover')) {
        return;
      }
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
    }, 100);
  };
  menu.addEventListener('mouseleave', handleMenuMouseLeave);
  menuEventListeners.mouseleave = handleMenuMouseLeave;

  // 添加点击事件处理
  const handleMenuClick = (e) => {
    const target = e.target;
    if (target.classList.contains('menu-option')) {
      const positionId = target.dataset.position;
      if (positionId) {
        // 更新当前选中的位置
        currentPositionId.value = positionId;
        savePositionId(positionId);
        applyPosition(positionId, button);
        
        // 更新活动状态
        menu.querySelectorAll('.menu-option').forEach(option => {
          option.classList.toggle('active', option.dataset.position === positionId);
        });
        
        // 阻止事件冒泡，防止触发按钮点击
        e.stopPropagation();
      }
    }
  };
  menu.addEventListener('click', handleMenuClick);
  menuEventListeners.click = handleMenuClick;
  
  // 添加按钮点击事件，在点击后重新应用样式和事件
  const handleButtonClick = () => {
    // 使用DOM变化观察器来检测按钮变化，不需要延时
    // 按钮点击后，观察器会自动检测到变化并重新应用样式
  };
  button.addEventListener('click', handleButtonClick);
  buttonEventListeners.click = handleButtonClick;
};

// 移除事件监听器
const removeEventListeners = () => {
  const button = document.querySelector('.ab1ac9d9bab12da47298');
  
  if (button) {
    // 移除按钮事件监听器
    Object.entries(buttonEventListeners).forEach(([event, handler]) => {
      button.removeEventListener(event, handler);
    });
  }
  
  if (menu) {
    // 移除菜单事件监听器
    Object.entries(menuEventListeners).forEach(([event, handler]) => {
      menu.removeEventListener(event, handler);
    });
  }
  
  // 清空事件监听器对象
  buttonEventListeners = {};
  menuEventListeners = {};
};

// 设置悬停菜单
const setupHoverMenu = (buttonElement = null) => {
  // 如果没有提供按钮元素，尝试查找
  const button = buttonElement || document.querySelector('.ab1ac9d9bab12da47298');
  if (!button) {
    console.error('找不到Coze按钮元素');
    return;
  }

  // 如果已经存在菜单，先移除
  if (menu && document.body.contains(menu)) {
    document.body.removeChild(menu);
  }

  // 创建位置菜单
  menu = document.createElement('div');
  menu.className = 'coze-position-menu';
  menu.innerHTML = `
    <div class="menu-title">选择位置</div>
    <div class="menu-options">
      ${positionOptions.map(option => `
        <button 
          class="menu-option ${option.id === currentPositionId.value ? 'active' : ''}" 
          data-position="${option.id}"
        >
          ${option.label}
        </button>
      `).join('')}
    </div>
  `;

  // 添加菜单样式
  const styleId = 'coze-menu-style';
  let style = document.getElementById(styleId);
  
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .coze-position-menu {
        position: fixed; /* 改为fixed定位，相对于视口 */
        background-color: var(--vp-c-bg, #fff);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 10px;
        width: 120px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 1000;
      }
      
      /* 添加悬停效果 */
      .ab1ac9d9bab12da47298 {
        transition: transform 0.3s ease;
      }
      
      .ab1ac9d9bab12da47298:hover {
        transform: scale(1.1);
      }
      
      .menu-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        color: var(--vp-c-text-1, #000);
      }
      
      .menu-options {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .menu-option {
        padding: 5px;
        border: 1px solid var(--vp-c-divider, #eee);
        border-radius: 4px;
        background-color: var(--vp-c-bg-soft, #f9f9f9);
        cursor: pointer;
        font-size: 12px;
        text-align: center;
        transition: all 0.2s;
        color: var(--vp-c-text-1, #000);
      }
      
      .menu-option:hover {
        background-color: var(--vp-c-gray-light-4, #eee);
      }
      
      .menu-option.active {
        border-color: var(--vp-c-brand, #3eaf7c);
        background-color: var(--vp-c-brand-dimm, #e6f7ef);
        color: var(--vp-c-brand-dark, #2c855c);
      }
    `;
    document.head.appendChild(style);
  }

  // 添加菜单到body，而不是按钮内部
  document.body.appendChild(menu);
  
  // 添加事件监听器
  addEventListeners(button, menu);
};

onBeforeUnmount(() => {
  // 清理资源
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  
  removeEventListeners();
  
  // 移除菜单
  if (menu && document.body.contains(menu)) {
    document.body.removeChild(menu);
  }
  
  // 移除样式
  if (styleElement && document.head.contains(styleElement)) {
    document.head.removeChild(styleElement);
  }
});
</script>

<template>
  <!-- 不需要任何内容，Coze SDK 会自动创建所需的 DOM 元素 -->
</template>

<style>
/* 基本样式已经在JS中动态添加，这里只保留必要的全局样式 */
/* 只对bottom属性使用!important */
.ab1ac9d9bab12da47298[data-position="bottom-right"] {
  bottom: 6rem !important;
  right: 30px;
  top: auto;
  left: auto;
}

.ab1ac9d9bab12da47298[data-position="bottom-left"] {
  bottom: 6rem !important;
  left: 30px;
  top: auto;
  right: auto;
}

.ab1ac9d9bab12da47298[data-position="top-right"] {
  top: 6rem;
  right: 30px;
  bottom: auto;
  left: auto;
}

.ab1ac9d9bab12da47298[data-position="top-left"] {
  top: 6rem;
  left: 30px;
  bottom: auto;
  right: auto;
}

.ab1ac9d9bab12da47298[data-position="center-right"] {
  top: 50%;
  right: 30px;
  bottom: auto;
  left: auto;
  transform: translateY(-50%);
}

.ab1ac9d9bab12da47298[data-position="center-left"] {
  top: 50%;
  left: 30px;
  bottom: auto;
  right: auto;
  transform: translateY(-50%);
}
</style>
