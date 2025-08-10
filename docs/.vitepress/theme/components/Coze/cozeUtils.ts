import { watch } from "vue";
import { useDraggable } from "@vueuse/core";

/**
 * 为聊天容器添加拖拽功能
 * @param container 聊天容器元素
 */
export function initializeDraggable(container: HTMLElement) {
  if (container.dataset.dragInitialized === "true") return;
  container.dataset.dragInitialized = "true";

  container.style.position = "fixed";
  container.style.width = container.offsetWidth + "px";
  container.style.height = container.offsetHeight + "px";

  const style = getComputedStyle(container);
  let left = parseFloat(style.left);
  let top = parseFloat(style.top);
  if (isNaN(left)) left = 0;
  if (isNaN(top)) top = 0;

  container.style.left = `${left}px`;
  container.style.top = `${top}px`;

  // 创建拖拽条元素
  const dragHandle = document.createElement("div");
  dragHandle.style.position = "absolute";
  dragHandle.style.top = "0";
  dragHandle.style.left = "0";
  dragHandle.style.width = "100%";
  dragHandle.style.height = "30px"; // 拖拽区域高度
  dragHandle.style.cursor = "move"; // 四向箭头十字
  dragHandle.style.userSelect = "none";
  dragHandle.style.zIndex = "10000";
  dragHandle.innerHTML = '';

  container.insertBefore(dragHandle, container.firstChild);

  const iframe = container.querySelector("iframe") as HTMLElement | null;

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

  const updatePosition = () => {
    container.style.left = `${x.value}px`;
    container.style.top = `${y.value}px`;
  };

  updatePosition();

  watch([x, y], () => {
    updatePosition();
  });
}