<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">用户登录</h2>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input
              type="text"
              id="username"
              v-model="form.username"
              :class="{ 'is-invalid': submitted && !form.username }"
              placeholder="请输入用户名"
          >
          <div v-if="submitted && !form.username" class="error-message">
            用户名不能为空
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input
              type="password"
              id="password"
              v-model="form.password"
              :class="{ 'is-invalid': submitted && !form.password }"
              placeholder="请输入密码"
          >
          <div v-if="submitted && !form.password" class="error-message">
            密码不能为空
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button
            type="submit"
            class="login-button"
            :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner">⏳</span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="register-link">
        还没有账号？<a href="/register">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vitepress';
import axios from 'axios';

// 表单数据
const form = ref({
  username: '',
  password: ''
});

// 状态管理
const isLoading = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

// 路由实例
const router = useRouter();

// 处理登录逻辑
const handleLogin = async () => {
  // 标记表单已提交（用于触发验证）
  submitted.value = true;

  // 简单验证
  if (!form.value.username || !form.value.password) {
    return;
  }

  try {
    // 显示加载状态
    isLoading.value = true;
    errorMessage.value = '';

    // 调用登录接口
    const response = await axios.post('/coze/login', {
      username: form.value.username,
      password: form.value.password
    });

    // 登录成功处理
    if (response.data.success) {
      // 存储令牌
      localStorage.setItem('token', response.data.token);
      
      // 跳转到首页或之前的页面
      await router.go('/');
    } else {
      errorMessage.value = response.data.message || '登录失败，请重试';
    }
  } catch (err) {
    // 错误处理
    console.error('登录请求失败:', err);
    if (axios.isAxiosError(err)) {
      errorMessage.value = err.response?.data?.message || '服务器错误，请稍后再试';
    } else {
      errorMessage.value = '发生未知错误，请稍后再试';
    }
  } finally {
    // 隐藏加载状态
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

input.is-invalid {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-top: 5px;
}

.error-alert {
  background-color: #ffebee;
  color: #b71c1c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  background-color: #359e75;
}

.loading-spinner {
  margin-right: 8px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
    