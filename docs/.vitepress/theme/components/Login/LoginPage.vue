<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>欢迎登录</h2>
        <currentDate />
      </div>
      <div class="form-row">
        <div class="input-group">
          <span class="input-icon">👤</span>
          <input type="text" class="form-control" v-model="LoginData.username" placeholder="请输入账号">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <span class="input-icon">🔒</span>
          <input type="password" class="form-control" v-model="LoginData.password" placeholder="请输入密码">
        </div>
      </div>
      <div class="btn-row">
        <button class="btn" @click="login">
          登录
        </button>
      </div>
    </div>

    <!-- 添加提示框组件 -->
    <transition name="alert">
      <div v-show="alertData.show" class="custom-alert" :class="alertData.type">
        <div class="alert-content">
          <span class="alert-icon">{{ alertData.type === 'success' ? '✓' : '!' }}</span>
          {{ alertData.message }}
        </div>
      </div>
    </transition>

    <!-- 添加模态框组件 -->
    <transition name="modal">
      <div v-if="modalData.show" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-content" :class="modalData.type">
            <div class="modal-icon">{{ modalData.type === 'success' ? '✓' : '!' }}</div>
            <div class="modal-message">{{ modalData.message }}</div>
            <button class="modal-button" @click="closeModal">确 定</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { STORAGE_KEY } from './helper.js'
import currentDate from "./Date.vue";
import { ref } from "vue";
import { useData, useRouter } from "vitepress";

const router = useRouter()
const { theme } = useData()

defineOptions({
	name: 'Login'
})

const LoginData = ref({
  username: '',
  password: ''
})

const alertData = ref({
	show: false,
	type: 'error',
	message: ''
})

const modalData = ref({
	show: false,
	type: 'error',
	message: ''
})

	// 显示提示框
function	showAlert(message: string, type = 'error') {
	alertData.value.message = message
	alertData.value.type = type
	alertData.value.show = true
}

  // 显示模态框
function showModal(message: string, type = 'error') {
	modalData.value.message = message
	modalData.value.type = type
	modalData.value.show = true
}

// 关闭模态框
function  closeModal() {
	modalData.value.show = false
}

  // 登录
function login() {
	let { expiration, token } = theme.value.loginInfo

	if (LoginData.value.username  && LoginData.value.password ) {
		const data = JSON.stringify({
			name: LoginData.value.username,
			time: Math.round(new Date().getTime() / 1000),
			expire: 86400 * expiration,
			accesskey: token
		})
		window.localStorage.setItem(STORAGE_KEY, data)

		showAlert('登录成功', 'success')
		setTimeout(() => {
			router.go('/')
		}, 1000);

	} else {

		showModal('账号或密码错误!')

	}
}

</script>

<style lang="stylus" scoped>

.login-container {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background: linear-gradient(rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.9)), url('../../assets/img/login-bg.svg')
  no-repeat center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 3rem 4rem;
  border-radius: 1.5rem;
  animation: fadeIn 0.6s ease-out;

  // 添加微光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
  }
}

  .login-header {
	text-align: center;
	margin-bottom: 3rem;  // 增加底部间距

	h2 {
	  color: #fff;
	  font-size: 2rem;  // 增大标题字号
	  margin-bottom: 1rem;
	}
  }

  .form-row {
	margin-bottom: 2rem;  // 增加表单行间距
	width: 100%;
  }

  .input-group {
	position: relative;
	width: 100%;
    display: flex;

	.input-icon {
		position: absolute;
		left: 0.3rem;
		top: 50%;
		transform: translateY(-50%);
		color: #60C084;
		font-size: 1.2rem;
		z-index: 1;
		pointer-events: none;
	}
  }

  // 输入框样式优化
.form-control {
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.6rem;
  color: white;
  font-size: 1.1rem;
  height: 3.2rem;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(96, 192, 132, 0.5);
    box-shadow:
      0 0 0 4px rgba(96, 192, 132, 0.1),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

  .btn-row {
	margin-top: 3rem;  // 增加按钮上方间距
	text-align: center;
  }

  // 按钮样式优化
.btn {
  width: 100%;
  height: 3.2rem;
  padding: 0.8rem 2rem;
  background: linear-gradient(45deg, #60C084, #4fa36f);
  color: white;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(96, 192, 132, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(96, 192, 132, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

  .icon-user:before {
	content: '\e7ae';
	font-family: 'iconfont',serif;
  }

  .icon-lock:before {
	content: '\e7c9';
	font-family: 'iconfont',serif;
  }

  .custom-alert {
	position: fixed;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	padding: 12px 24px;
	border-radius: 8px;
	color: white;
	font-size: 14px;
	z-index: 1000;
	display: flex;
	align-items: center;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

	&.success {
		background: linear-gradient(45deg, #60C084, #4fa36f);
	}

	&.error {
		background: linear-gradient(45deg, #ff4757, #ff6b81);
	}

	.alert-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.alert-icon {
		font-size: 16px;
		font-weight: bold;
	}
}

// 淡入淡出动画
.alert-enter-active, .alert-leave-active {
  transition: all 0.3s ease;
}
.alert-enter, .alert-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}


// 给容器添加视距
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  perspective: 1000px;  // 添加视距
}

.modal-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform-origin: center center;
  transform-style: preserve-3d;  // 保持3D效果
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  min-width: 400px;

  &.success .modal-icon {
    background: linear-gradient(45deg, #60C084, #4fa36f);
  }

  &.error .modal-icon {
    background: linear-gradient(45deg, #ff4757, #ff6b81);
  }
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.modal-message {
  color: #333;
  font-size: 16px;
  margin-bottom: 20px;
}

.modal-button {
  background: linear-gradient(45deg, #60C084, #4fa36f);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 192, 132, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

// 淡入淡出动画
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  .modal-container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  .modal-container {
    transform: translateZ(-100px) scale(0.7);  // 添加Z轴位移
  }
}

.modal-enter-to, .modal-leave {
  opacity: 1;
  .modal-container {
    transform: translateZ(0) scale(1);  // 恢复到原始位置
  }
}

  </style>





