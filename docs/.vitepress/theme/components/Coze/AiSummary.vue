<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";
import secureInfo from "@/secureInfo";

const route = useRoute();

const summary = ref("");
const progress = ref(0);
const loading = ref(false);
const error = ref("");

let es: EventSource | null = null;

let buffer: string[] = [];
let typing = false;
const TYPE_DELAY = 20;
const FIRST_CHAR_PAUSE = 300;
const SSE_ERROR_DELAY = 300; // 延迟显示错误

const extractText = (data: any): string => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.summary && typeof data.summary === "string") return data.summary;
  if (data.content && typeof data.content === "string") return data.content;
  if (data.text && typeof data.text === "string") return data.text;
  return "";
};

const updateProgress = () => {
  const len = summary.value.length;
  progress.value = Math.max(progress.value, Math.min(95, Math.floor(95 * (1 - Math.exp(-len / 800)))));
};

const consumeLoop = async () => {
  if (typing) return;
  typing = true;

  while (buffer.length > 0) {
    const chunk = buffer.shift()!;
    for (let i = 0; i < chunk.length; i++) {
      if (i === 0) await new Promise(r => setTimeout(r, FIRST_CHAR_PAUSE));
      summary.value += chunk[i];
      updateProgress();
      await new Promise(r => setTimeout(r, TYPE_DELAY));
    }
  }

  typing = false;
};

const resetState = () => {
  summary.value = "";
  progress.value = 0;
  loading.value = false;
  error.value = "";
  buffer = [];
  typing = false;
};

const closeES = () => {
  if (es) {
    try { es.close(); }
    catch {}
    es = null;
  }
};

const finish = () => {
  loading.value = false;
  progress.value = 100;
  closeES();
};

const start = () => {
  if (typeof window === "undefined") return;

  closeES();
  resetState();
  loading.value = true;

  const currentUrl = new URL(route.path, secureInfo.baseURL).toString();
  es = new EventSource(`/coze/summary?url=${ encodeURIComponent(currentUrl) }`);

  let firstMessageReceived = false;

  es.onopen = () => {
    if (progress.value < 5) progress.value = 5;
  };

  es.onmessage = async (e) => {
    firstMessageReceived = true;
    if (!e.data || e.data === "[DONE]") return;

    let text = "";
    try {
      const obj = JSON.parse(e.data);
      text = extractText(obj);
    }
    catch {
      text = e.data;
    }

    if (text && text.trim().length > 0) {
      buffer.push(text);
      await consumeLoop();
    }
  };

  es.addEventListener("done", async () => {
    while (typing || buffer.length > 0) {
      await new Promise(r => setTimeout(r, 100));
    }
    error.value = "";
    finish();
  });

  es.onerror = () => {
    setTimeout(() => {
      if (!firstMessageReceived && summary.value.length === 0) {
        error.value = "摘要生成失败，请稍后再试";
        loading.value = false;
        progress.value = 0;
        closeES();
      } else if (summary.value.length > 0) {
        error.value = "";
        finish();
      }
    }, SSE_ERROR_DELAY);
  };
};


let mounted = false;
onMounted(() => {
  mounted = true;
  start();
});
watch(
    () => route.path,
    () => {
      if (mounted && route.path.startsWith("/pages/")) start()
    }
);
onBeforeUnmount(() => closeES());
</script>

<template>
  <div class="summary-card">
    <div class="header">
      <!-- 左侧标题带图标 -->
      <div class="title-container">
        <span class="title">
          <svg aria-hidden="true" class="icon">
            <use xlink:href="#icon-aijiqiren"></use>
          </svg>
        </span>
        AI摘要
      </div>

      <!-- 右侧进度条和提供者 -->
      <div class="header-right">
        <div v-if="loading" class="progress-container">
          <div class="progress-bar">
            <div class="progress-indicator"></div>
          </div>
        </div>
        <a class="provider" href="https://www.coze.com" target="_blank">
          扣子AI
          <svg aria-hidden="true" class="icon">
            <use xlink:href="#icon-arrow-right-s-line"></use>
          </svg>
        </a>
      </div>
    </div>

    <div class="content-container">
      <div class="summary-text">
        {{ summary }}
        <span v-if="loading" class="caret"></span>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>

.icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}

.summary-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 1.5rem 0;
}

.summary-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  background-color: #fafafa;
}

.title-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.title-container:hover {
  transform: translateX(2px);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-right: 6px;
}

.title-container:hover .arrow-icon {
  opacity: 1;
  transform: translateX(2px);
}

.header-right {
  display: flex;
  align-items: center;
}

.progress-container {
  width: 120px;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  width: 100%;
  height: 100%;
  position: relative;
}

.progress-indicator {
  position: absolute;
  height: 100%;
  width: 40%;
  background-color: #409EFF;
  border-radius: 2px;
  animation: progressMove 1.5s infinite ease-in-out;
}

@keyframes progressMove {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}

.provider {
  display: flex;
  align-items: center;
  margin-left: 10px;
  font-size: 12px;
  color: #888888;
  white-space: nowrap;
}

.content-container {
  padding: 20px;
}

.summary-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.7;
  letter-spacing: 0.02em;
}

.error-message {
  font-size: 14px;
  color: #f56c6c;
  line-height: 1.7;
  padding: 5px 0;
}

.caret {
  display: inline-block;
  margin-left: 6px;
  width: 10px;
  height: 10px;
  border-top: 2px solid #409EFF;
  border-right: 2px solid #409EFF;
  transform: rotate(45deg);
  animation: caretBlink 1.2s infinite;
}

@keyframes caretBlink {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>

