<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
//@ts-ignore
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
const savePositionId = (id: string) => {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, id);
  } catch (e) {
    console.error('保存位置失败:', e);
  }
};

// 当前选择的位置ID
const currentPositionId = ref(getSavedPositionId());

// 全局变量，用于存储菜单元素和事件监听器
let menu: HTMLDivElement | null = null;
let buttonEventListeners: { [key: string]: EventListener } = {};
let menuEventListeners: { [key: string]: EventListener } = {};
let mutationObserver: MutationObserver | null = null;
let styleElement: HTMLStyleElement | null = null;

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
const getPositionStyles = (positionId: string) => {
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
    if ((window as any).CozeWebSDK && (window as any).CozeWebSDK.WebChatClient) {
      new (window as any).CozeWebSDK.WebChatClient({
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
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      
      // 应用位置并设置菜单
      applyPosition(currentPositionId.value, button);
      setupHoverMenu(button as HTMLElement);
      
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
  let debounceTimer: number | null = null;
  
  mutationObserver = new MutationObserver((mutations) => {
    // 使用防抖技术，避免短时间内多次处理
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = window.setTimeout(() => {
      // 检查按钮是否存在
      const button = document.querySelector('.ab1ac9d9bab12da47298');
      if (button) {
        // 检查按钮是否已经有我们的事件监听器
        if (!button.hasAttribute('data-position')) {
          applyPosition(currentPositionId.value, button);
          
          // 如果菜单存在，重新绑定事件
          if (menu && document.body.contains(menu)) {
            removeEventListeners();
            addEventListeners(button as HTMLElement, menu);
          } else {
            // 如果菜单不存在，重新创建
            setupHoverMenu(button as HTMLElement);
          }
        }
      } else {
        // 按钮不存在，可能被移除了，重新设置按钮观察器
        setupButtonObserver();
      }
      debounceTimer = null;
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

// 设置悬停菜单
const setupHoverMenu = (buttonElement: HTMLElement | null = null) => {
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

  // 将菜单添加到文档中
  document.body.appendChild(menu);

  // 添加事件监听器
  addEventListeners(button, menu);
};

// 添加事件监听器
const addEventListeners = (button: HTMLElement, menu: HTMLDivElement) => {
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
  
  // 按钮点击事件
  buttonEventListeners['click'] = () => {
    menu.classList.toggle('visible');
    updateMenuPosition();
  };
  button.addEventListener('click', buttonEventListeners['click']);

  // 菜单点击事件
  menuEventListeners['click'] = (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.hasAttribute('data-position')) {
      const newPositionId = target.getAttribute('data-position')!;
      currentPositionId.value = newPositionId;
      applyPosition(newPositionId, button);
      savePositionId(newPositionId);
      menu.classList.remove('visible');
    }
  };
  menu.addEventListener('click', menuEventListeners['click']);

  // 点击其他地方隐藏菜单
  document.addEventListener('click', (event) => {
    if (!button.contains(event.target as Node) && !menu.contains(event.target as Node)) {
      menu.classList.remove('visible');
    }
  });
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
      menu!.removeEventListener(event, handler);
    });
  }
  
  // 清空事件监听器对象
  buttonEventListeners = {};
  menuEventListeners = {};
};

// 应用位置
const applyPosition = (positionId: string, buttonElement: Element | null = null) => {
  // 如果没有提供按钮元素，尝试查找
  const button = (buttonElement || document.querySelector('.ab1ac9d9bab12da47298')) as HTMLElement | null;
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
};

// 在组件卸载时清理
onBeforeUnmount(() => {
  removeEventListeners();
  if (menu && document.body.contains(menu)) {
    document.body.removeChild(menu);
  }
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  if (styleElement && document.head.contains(styleElement)) {
    document.head.removeChild(styleElement);
  }
});

</script>
