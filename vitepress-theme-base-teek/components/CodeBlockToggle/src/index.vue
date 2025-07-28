<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import { useRouter } from "vitepress";
import { createOverlay } from "./createOverlay";

defineOptions({ name: "CodeBlockToggle" });

const foldClass = "fold";
const arrowClass = "arrow";

/**
 * 获取元素高度
 */
const getElementHeight = (item: HTMLElement) => {
  const parentClass = item.parentElement?.className || "";
  if (!parentClass.includes("blocks")) return item.offsetHeight;
  if (parentClass.includes("blocks") && item.className.includes("active")) return item.offsetHeight;

  item.style.display = "block";
  const height = item.offsetHeight;
  item.style.display = "";
  return height;
};

/**
 * 安全获取元素高度
 */
const getSafeElementHeight = (item: HTMLElement) => {
  const originalDisplay = item.style.display;
  const originalHeight = item.style.height;
  item.style.display = "block";
  const height = getElementHeight(item);
  item.style.display = originalDisplay;
  item.style.height = originalHeight;
  return height;
};

/**
 * 初始化代码块
 */
const initCodeBlock = () => {
  const modes = document.querySelectorAll(".vp-doc div[class*='language-']") as unknown as HTMLElement[];

  Array.from(modes).forEach(item => {
    const arrowElement = item.querySelector(`.${arrowClass}`) as HTMLElement | null;
    const modeHeight = getSafeElementHeight(item);

    if (modeHeight > 400) {
      // 默认设置为折叠状态
      item.style.maxHeight = "400px";
      item.style.overflow = "hidden";
      item.style.position = "relative";

      const overlay = createOverlay(() => {
        overlay.remove();
        item.style.maxHeight = modeHeight + "px";
        if (arrowElement) {
          arrowElement.classList.remove(foldClass);
        }
      });

      item.appendChild(overlay);
      
      // 如果有箭头元素，初始状态设为折叠
      if (arrowElement) {
        arrowElement.classList.add(foldClass); // 添加这行代码，默认为折叠状态
      }
    }

    if (arrowElement) {
      addClickEvent(arrowElement, item, modeHeight);
    }
  });
};

/**
 * 添加点击事件
 */
const addClickEvent = (arrowDom: HTMLElement, codeDom: HTMLElement, modeHeight: number) => {
  const clickEvent = () => {
    const isFold = arrowDom.classList.contains(foldClass);

    if (isFold) {
      codeDom.style.maxHeight = modeHeight + "px";
      arrowDom.classList.remove(foldClass);
      const overlay = codeDom.querySelector('.code-block-overlay');
      if (overlay) overlay.remove();
    } else {
      if (modeHeight < 400) {
        codeDom.style.maxHeight = "40px";
      } else if (modeHeight <= 700) {
        codeDom.style.maxHeight = modeHeight + "px";
      } else {
        codeDom.style.maxHeight = "400px";
      }

      arrowDom.classList.add(foldClass);

      if (modeHeight > 400) {
        let overlay = codeDom.querySelector('.code-block-overlay') as HTMLElement | null;
        if (!overlay) {
          overlay = createOverlay(() => {
            overlay?.remove();
            codeDom.style.maxHeight = modeHeight + "px";
            arrowDom.classList.remove(foldClass);
          });
          codeDom.appendChild(overlay);
        }
      }
    }
  };

  arrowDom.addEventListener("click", clickEvent);
};

const router = useRouter();

const initRoute = () => {
  const selfOnAfterRouteChange = router.onAfterRouteChange;
  router.onAfterRouteChange = (href: string) => {
    selfOnAfterRouteChange?.(href);
    initCodeBlock();
  };
};

onMounted(() => {
  nextTick(() => {
    initCodeBlock();
    initRoute();
  });
});
</script>

<template></template>
