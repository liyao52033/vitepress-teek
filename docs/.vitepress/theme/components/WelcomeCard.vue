<!-- 欢迎卡片组件 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
// 按需导入 Element Plus 组件
import { ElSkeleton, ElCard, ElDivider, ElTag, ElIcon } from "element-plus/es";
import { Calendar, Clock, Monitor, Cpu, Cellphone, Timer } from '@element-plus/icons-vue';

// ------------------ 系统信息 Hook ------------------
function useSystemInfo() {
  const systemInfo = ref({
    date: '',
    time: '',
    week: '',
    browser: '',
    os: '',
    deviceType: '',
    pageLoadTime: 0
  });
  const loading = ref(true);
  
  // 获取系统信息
  const getSystemInfo = () => {
    try {
      const now = new Date();
      const dateInfo = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        week: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]
      };
      
      // 获取浏览器信息
      const ua = navigator.userAgent;
      let browserInfo = 'Unknown Browser';
      
      if (ua.indexOf('Chrome') > -1) browserInfo = 'Chrome';
      else if (ua.indexOf('Firefox') > -1) browserInfo = 'Firefox';
      else if (ua.indexOf('Safari') > -1) browserInfo = 'Safari';
      else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browserInfo = 'Edge';
      else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browserInfo = 'Internet Explorer';
      else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browserInfo = 'Opera';
      
      // 获取操作系统信息
      let osInfo = 'Unknown OS';
      
      if (ua.indexOf('Windows') > -1) osInfo = 'Windows';
      else if (ua.indexOf('Mac') > -1) osInfo = 'macOS';
      else if (ua.indexOf('Linux') > -1) osInfo = 'Linux';
      else if (ua.indexOf('Android') > -1) osInfo = 'Android';
      else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osInfo = 'iOS';
      
      // 判断设备类型
      let deviceType = '桌面设备';
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        deviceType = width < 768 ? '手机' : '平板';
      }
      
      // 使用更现代的性能API计算页面加载时间
      let pageLoadTime = 0;
      if (window.performance) {
        if (window.performance.now) {
          // 使用 performance.now() 获取更准确的时间
          pageLoadTime = Math.round(window.performance.now() / 10) / 100;
        } else if (window.performance.timing) {
          // 兼容旧版API
          const timing = window.performance.timing;
          if (timing.loadEventEnd > 0) {
            pageLoadTime = Math.round((timing.loadEventEnd - timing.navigationStart) / 10) / 100;
          } else {
            pageLoadTime = 0.01; // 设置一个默认值，避免显示"计算中..."
          }
        }
      }
      
      systemInfo.value = {
        ...dateInfo,
        browser: browserInfo,
        os: osInfo,
        deviceType,
        pageLoadTime
      };
      
      // 设置加载完成
      loading.value = false;
    } catch (e) {
      console.error('获取系统信息失败:', e);
      loading.value = false; // 确保即使出错也会关闭加载状态
    }
  };
  
  // 更新时间的定时器
  let timeInterval: number | null = null;
  
  // 开始更新时间
  const startTimeUpdate = () => {
    // 立即更新一次
    getSystemInfo();
    
    // 每秒更新一次时间，使用 requestAnimationFrame 优化性能
    const updateTime = () => {
      const now = new Date();
      systemInfo.value.time = now.toLocaleTimeString();
      timeInterval = window.setTimeout(() => {
        window.requestAnimationFrame(updateTime);
      }, 1000);
    };
    
    window.requestAnimationFrame(updateTime);
  };
  
  // 停止更新时间
  const stopTimeUpdate = () => {
    if (timeInterval !== null) {
      clearInterval(timeInterval);
      timeInterval = null;
    }
  };
  
  onBeforeUnmount(() => {
    stopTimeUpdate();
  });
  
  return { systemInfo, loading, getSystemInfo, startTimeUpdate, stopTimeUpdate };
}

// ------------------ FPS Hook ------------------
function useFPS(enabled = true) {
  const fps = ref(0);
  let frameCount = 0;
  let lastTime = 0;
  let animationFrameId: number | null = null;
  let isActive = false;

  const updateFPS = (time: number) => {
    // 即使初始化时enabled为false，后续也可以通过isActive控制
    if (!isActive) return;

    if (lastTime === 0) {
      lastTime = time;
      animationFrameId = requestAnimationFrame(updateFPS);
      return;
    }

    const delta = time - lastTime;
    frameCount += 1;

    if (delta > 1000) {
      fps.value = Math.round((frameCount * 1000) / delta);
      frameCount = 0;
      lastTime = time;
    }

    animationFrameId = requestAnimationFrame(updateFPS);
  };

  const startFPS = () => {
    if (typeof requestAnimationFrame !== 'undefined' && !isActive) {
      isActive = true;
      lastTime = 0;
      frameCount = 0;
      // 直接启动FPS监控
      animationFrameId = requestAnimationFrame(updateFPS);
    }
  };

  const stopFPS = () => {
    isActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  onBeforeUnmount(() => {
    // 组件销毁前停止 FPS 监控
    stopFPS();
  });

  return { fps, startFPS, stopFPS };
}

// ------------------ 使用 Hook ------------------
const { systemInfo, loading, getSystemInfo, startTimeUpdate } = useSystemInfo();

// 默认显示FPS
const showFPS = ref(true);
const { fps, startFPS, stopFPS } = useFPS(showFPS.value);

// 延迟启动FPS计算，减少初始加载时的计算量
setTimeout(() => {
  startFPS();
}, 2000);

// 计算问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
});

// 获取当前主题色
const themeColor = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--vp-c-brand-1').trim() || '#3eaf7c';
});

// ------------------ 初始化 ------------------
onMounted(() => {
  // 在组件挂载后启动时间更新，但延迟启动FPS监控
  startTimeUpdate();
  
  // 使用 requestIdleCallback 在浏览器空闲时执行非关键任务
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      startFPS();
    }, { timeout: 2000 });
  } else {
    // 兼容不支持 requestIdleCallback 的浏览器
    setTimeout(() => {
      startFPS();
    }, 2000);
  }
});
</script>

<template>
  <el-card class="welcome-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="emoji-icon">👋</span>
          <span class="info-title">{{ greeting }}</span>
        </div>
        <el-tag v-if="showFPS" class="fps-tag" :color="themeColor" effect="dark">FPS: {{ fps }}</el-tag>
      </div>
    </template>

    <!-- 使用v-show代替v-if，避免重新渲染 -->
    <div v-show="loading" class="skeleton-container">
      <el-skeleton animated :rows="6" />
    </div>

    <!-- 使用v-show代替v-if，预先渲染内容 -->
    <div v-show="!loading" class="welcome-content">
      <div class="info-greeting">
        欢迎访问我的博客！今天是 <el-tag size="small" effect="plain" class="week-tag">{{ systemInfo.week }}</el-tag>
      </div>

      <el-divider content-position="center">系统信息</el-divider>

      <div class="info-stats">
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Calendar /></el-icon>
            <span>当前日期</span>
          </div>
          <div class="stat-value">{{ systemInfo.date }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Clock /></el-icon>
            <span>当前时间</span>
          </div>
          <div class="stat-value">{{ systemInfo.time }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Monitor /></el-icon>
            <span>您的浏览器</span>
          </div>
          <div class="stat-value">{{ systemInfo.browser }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Cpu /></el-icon>
            <span>您的操作系统</span>
          </div>
          <div class="stat-value">{{ systemInfo.os }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Cellphone /></el-icon>
            <span>您的设备类型</span>
          </div>
          <div class="stat-value">{{ systemInfo.deviceType }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            <el-icon><Timer /></el-icon>
            <span>页面加载时间</span>
          </div>
          <div class="stat-value">{{ systemInfo.pageLoadTime > 0 ? systemInfo.pageLoadTime + ' 秒' : '计算中...' }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.welcome-card {
  width: 100%;
  margin: 0 auto;
  font-size: 16px;
  transition: transform 0.3s ease;
  will-change: transform; /* 提示浏览器这个元素会变化 */
  
  &:hover {
    transform: translateY(-5px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.emoji-icon {
  font-size: 24px;
  margin-right: 10px;
  animation: wave 2s infinite;
  will-change: transform; /* 提示浏览器这个元素会变化 */
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

.info-title {
  font-size: 20px;
  font-weight: bold;
  background-image: linear-gradient(to right, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.fps-tag {
  font-weight: bold;
  border: none;
}

.skeleton-container {
  padding: 6px 0;
}

.info-greeting {
  font-size: 16px;
  margin: 10px 0;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
}

.week-tag {
  margin: 0 5px;
  font-weight: bold;
}

.info-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  transition: transform 0.3s ease, background-color 0.3s ease;
  will-change: transform, background-color; /* 提示浏览器这些属性会变化 */
  
  &:hover {
    background-color: var(--el-fill-color);
    transform: translateX(5px);
  }
}

.stat-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--vp-c-text-1);
  
  .el-icon {
    margin-right: 6px;
    font-size: 16px;
    color: var(--vp-c-brand-1);
  }
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .welcome-card {
    max-width: 100%;
  }
  
  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .stat-value {
    align-self: flex-end;
    width: 100%;
    text-align: right;
  }
}
</style>
