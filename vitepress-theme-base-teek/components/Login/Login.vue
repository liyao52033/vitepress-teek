<script setup lang="ts">
import type { LoginForm } from "./helper";
import { markRaw, onMounted, reactive, ref } from "vue";
import { useNamespace, useLoginForm } from "../../hooks";
import { useRouter } from "vitepress";
import { lockIcon, userIcon, warningFilledIcon, successFilledIcon } from "../static";
import TkVerifyCode from "../VerifyCode/index.vue";
import { ElMessage, ElInput, ElButton, ElForm, ElFormItem  } from "element-plus";
import currentDate from "./Date.vue";
import { LoginInfo } from "../../config/types"
import { useUnrefData } from "../configProvider"
import Icon from "../Icon";
// 导入拆分的登录服务
import { loginService } from "./loginService";

defineOptions({ name: "LoginPage" });

const router = useRouter()
const ns = useNamespace("login");
const imgCode = ref("");
const redirectPath = ref<string | null>(null);
const { frontmatter, theme } = useUnrefData();

const {
  formRef,
  formModel,
  rules,
} = useLoginForm(imgCode)


const {
  username = "",
  password =  "",
  token = "",
  expiration = 0.5,
  type = "local"
}: LoginInfo = { ...theme.loginInfo, ...frontmatter?.loginInfo };

const loginForm = reactive<LoginForm>({
  username: {
    model: "",
    focusModel: false,
    errorModel: false,
    icon: userIcon,
    placeholder: "请输入用户名",
    type: "text",
  },
  password: {
    model: "",
    focusModel: false,
    errorModel: false,
    icon: lockIcon,
    placeholder: "请输入密码",
    type: "password",
  },
  verifyCode: {
    model: "",
    focusModel: false,
    errorModel: false,
    icon: warningFilledIcon,
    placeholder: "请输入验证码",
    type: "text",
    append: markRaw(TkVerifyCode),
    appendModel: imgCode,
  },
});

// 修改登录方法，调用拆分的服务
async function login() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      const redirect = redirectPath.value || "/";
      try {
        const loginMethod = type === 'node' ? loginService.nodeLogin : loginService.localLogin;
        const result = await loginMethod(
            formModel.username,
            formModel.password,
            { username, password, token, expiration}
        );

        if (result.success) {
          ElMessage.success(result.message);
          // 确保路径是有效的，并且不是登录页面本身
          const targetPath = redirect === '/login' ? '/' : redirect;
          await router.go(targetPath);
        } else {
          ElMessage.error(result.message);
        }
      } catch (error) {
        console.error("登录失败:", error);
        ElMessage.error("登录过程出错，请重试");
      }
    } else {
      ElMessage.error("请完善表单内容！");
    }
  });
}

onMounted(() => {
  // 记录来源路由，只记录一次
  const url = new URL(window.location.href);
  const redirect = url.searchParams.get('redirect');
  if (redirect) {
    redirectPath.value = decodeURIComponent(redirect);
  } else if (document.referrer && !document.referrer.includes('/login')) {
    try {
      const refUrl = new URL(document.referrer);
      redirectPath.value = refUrl.pathname + refUrl.search + refUrl.hash;
    } catch { }
  }
});
</script>


<template>
  <div :class="ns.b()" aria-label="登录页面">
    <div :class="ns.e('wrapper')">
      <div :class="ns.e('left')">
        <img src="./assets/bg-1.png" alt="login" />
      </div>

      <div :class="ns.e('right')">
        <div :class="[ns.e('right__header'), 'flx-center']">
          <img src="./assets/teek.png" alt="logo" />
          <h2>欢迎登录</h2>
          <currentDate />
        </div>

        <el-form :model="formModel" :rules="rules" ref="formRef" label-position="right"
                 label-width="auto" class="login-form">
          <el-form-item prop="username" label="用户名">
            <el-input
                v-model="formModel.username"
                :placeholder="loginForm.username.placeholder"
                :type="loginForm.username.type"
                style="height: 40px"
                clearable
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
                v-model="formModel.password"
                :placeholder="loginForm.password.placeholder"
                :type="loginForm.password.type"
                style="height: 40px"
                clearable
                show-password
            />
          </el-form-item>

          <el-form-item prop="verifyCode" label="验证码" class="verify-row login-form-item">
             <div :class="[ns.e('right__form')]">
               <el-input
                   v-model="formModel.verifyCode"
                   :placeholder="loginForm.verifyCode.placeholder"
                   :type="loginForm.verifyCode.type"
                   style="height: 40px"
                   clearable
               />
               <div class="verify-img" >
                   <component :is="loginForm.verifyCode.append" v-model="loginForm.verifyCode.appendModel" />
               </div>
            </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item :class="ns.e('right__form__btn')">
            <el-button
                type="primary"
                @click="login"
                class="flx-center primary"
                aria-label="登录"
                style="width: 100%"
            >
             <Icon :icon="successFilledIcon" />
              <span>登录</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>



