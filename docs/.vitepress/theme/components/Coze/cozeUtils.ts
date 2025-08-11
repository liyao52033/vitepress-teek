import { watch, onBeforeUnmount } from "vue";
import { useDraggable } from "@vueuse/core";

/**
 * 拖拽容器（顶部和footer两拖拽区），带边界限制
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

  container.style.left = `${left}px`;
  container.style.top = `${top}px`;

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

    container.style.left = `${limitedX}px`;
    container.style.top = `${limitedY}px`;
  });  
}
