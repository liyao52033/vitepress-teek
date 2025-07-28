<template>
  <div class="code-block-overlay" @mouseenter="onHover" @mouseleave="onLeave" @click="onClick">
    <Icon :icon="arrow" icon-type="svg" size="30" />
    <span>查看更多</span>
  </div>
</template>

<script setup lang="ts">
import { Icon, arrow } from '../../Icon';

const emit = defineEmits(['click']);

const onHover = () => {
  const el = document.querySelector('.code-block-overlay') as HTMLElement;
  if (el) {
    el.style.background = 'linear-gradient(rgba(30, 30, 30, 0), rgba(40, 40, 40, 0.95))';
  }
};

const onLeave = () => {
  const el = document.querySelector('.code-block-overlay') as HTMLElement;
  if (el) {
    el.style.background = 'linear-gradient(rgba(30, 30, 30, 0), rgba(30, 30, 30, 0.9))';
  }
};

const onClick = () => emit('click');
</script>

<style scoped>
.code-block-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(rgba(30, 30, 30, 0), rgba(30, 30, 30, 0.95)); /* 增加遮罩层的不透明度 */
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff; /* 更改文字颜色为白色，以提高对比度 */
  font-size: 30px;
  transition: background 0.3s ease;

  /* 增加左右内边距 */
  padding: 0 24px;
}
</style>
