<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useDraggable } from "@vueuse/core";
import { ElMessage } from "element-plus";

let observer: MutationObserver | null = null;

// 生成拖拽提示 DOM
// function createDragTip(): HTMLElement {
//   const tip = document.createElement('span');
//   tip.classList.add('el-message', 'el-message--success');
//   tip.style.display = 'inline-block';
//   tip.style.padding = '2px 8px';
//   tip.style.fontSize = '12px';
//   tip.style.margin = '0 auto';
//   tip.style.width = 'fit-content';
//   tip.style.userSelect = 'none';
//   tip.style.position = 'absolute';
//   tip.style.top = '2px';
//   tip.style.textAlign = 'center';

//   tip.innerHTML = `<i class="el-message__icon el-icon-success"></i>拖拽移动`;

//   return tip;
// }



const initializeDraggable = (container: HTMLElement) => {
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
  // dragHandle.appendChild(createDragTip());
  // dragHandle.style.background = "rgba(0,0,0,0.1)"; // 调试时可见

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

  ElMessage({
    message: '拖拽顶部移动对话框',
    type: 'success',
    duration: 3000,
  });

};



const setupObserver = () => {
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLElement
      ) {
        const el = mutation.target as HTMLElement;
        if (
          el.classList.contains("fa8097ff55eabaa5782b") &&
          el.style.display !== "none"
        ) {
          initializeDraggable(el);
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          break;
        }
      }
      if (mutation.type === "childList") {
        // 也可以监听新增节点中是否有目标容器
        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.classList.contains("fa8097ff55eabaa5782b") &&
            node.style.display !== "none"
          ) {
            initializeDraggable(node);
            if (observer) {
              observer.disconnect();
              observer = null;
            }
            break;
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
};

onMounted(() => {
  // 先尝试找一次，防止已经显示
  const container = document.querySelector<HTMLElement>(".fa8097ff55eabaa5782b");
  if (container && container.style.display !== "none") {
    initializeDraggable(container);
  } else {
    setupObserver();
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>

</template>

<style>
/* .fa8097ff55eabaa5782b .e4f8c2c1d9d493c0cfdb {
    position: absolute;
    right: 16px;
    top: 40px !important;
    width: 32px;
    height: 32px;
    z-index: 1000;
} */
</style>
