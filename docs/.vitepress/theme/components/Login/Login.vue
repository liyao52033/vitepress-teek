<script setup lang="ts" name="LoginPage">
import type { LoginForm } from "./helper";
import { STORAGE_KEY } from "./helper";
import { ref, onMounted, markRaw, reactive } from "vue";
import { useData, useRouter } from "vitepress";
import { useNamespace } from "../../hooks";
import { userIcon, lockIcon, successFilledIcon, warningFilledIcon } from "../static";
import { Icon } from "../Icon";
import TkVerifyCode from "../VerifyCode/index.vue";
import { ElMessage } from "element-plus";
import currentDate from "./Date.vue";

defineOptions({ name: "LoginPage" });

const ns = useNamespace("login");
const router = useRouter()
const { theme } = useData()

const imgCode = ref("");
const redirectPath = ref<string | null>(null);

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
        // 这里的 appendModel 是为了和 TkVerifyCode 组件进行双向绑定
        type: "text",
        append: markRaw(TkVerifyCode),
        appendModel: imgCode,
    },
});

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

/**
 * 独立校验函数
 */
const checkUsername = () => {
    if (loginForm.username.model === "") {
        loginForm.username.errorModel = true;
        return false;
    }
    if (loginForm.username.model.length < 5) {
        loginForm.username.errorModel = true;
        ElMessage.error({ message: "用户名长度需大于5位", plain: true });
        return false;
    }
    loginForm.username.errorModel = false;
    return true;
};

const checkPassword = () => {
    if (loginForm.password.model === "") {
        loginForm.password.errorModel = true;
        return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(loginForm.password.model)) {
        loginForm.password.errorModel = true;
        ElMessage.error({ message: "密码需包含字母和数字, 且长度大于5位", plain: true });
        return false;
    }
    loginForm.password.errorModel = false;
    return true;
};

const checkVerifyCode = () => {
    if (loginForm.verifyCode.model === "") {
        loginForm.verifyCode.errorModel = true;
        return false;
    }
    if (loginForm.verifyCode.model !== imgCode.value) {
        loginForm.verifyCode.errorModel = true;
        ElMessage.error({ message: "验证码错误", plain: true });
        return false;
    }
    loginForm.verifyCode.errorModel = false;
    return true;
};

/**
 * 校验登录表单（整体校验）
 */
const checkLoginForm = () => {
    return checkUsername() && checkPassword() && checkVerifyCode();
};

const handleBlur = () => {
    if (!checkLoginForm()) return;
};

function login() {
    let { expiration, token, username, password } = theme.value.loginInfo
    handleBlur()

    // 优先跳转redirectPath，再次首页
    let redirect = redirectPath.value || '/';

    if (loginForm.username.model === username && loginForm.password.model === password) {
        const data = JSON.stringify({
            name: loginForm.username.model,
            time: Math.round(new Date().getTime() / 1000),
            expire: 86400 * expiration,
            accesskey: token
        })
        window.localStorage.setItem(STORAGE_KEY, data)
        router.go(redirect).then(() => {
            ElMessage.success({ message: "登录成功", plain: true });
        });
    } else {
        ElMessage.error('账号或密码错误!')
    }
}

</script>

<template>
    <div :class="ns.b()" aria-label="登录页面">
        <div :class="ns.e('wrapper')">
            <div :class="ns.e('left')">
                <img src="/img/bg-1.png" alt="login" />
            </div>

            <div :class="ns.e('right')">
                <div :class="[ns.e('right__header'), 'flx-center']">
                    <img src="/img/teek.png" alt="logo" />
                    <h2>欢迎登录</h2>
                    <currentDate />
                </div>

                <form class="login-form">
                    <div v-for="(item, key) in loginForm" :key="key">
                        <template v-if="key === 'verifyCode'">
                            <div class="verify-row login-form-item">
                                <div :class="[ns.e('right__form'), ns.is('focus', item.focusModel), ns.is('error', item.errorModel)]"
                                    style="flex:1;">
                                    <Icon :icon="item.icon" />
                                    <label :for="'input-' + key" class="sr-only">{{ item.placeholder }}</label>
                                    <input v-model="item.model" :type="item.type"
                                        :class="ns.em('right__form', 'control')" :placeholder="item.placeholder"
                                        @blur="checkVerifyCode" @keydown.enter="login" />
                                </div>
                                <div class="verify-img">
                                    <component :is="item.append" v-model="item.appendModel" />
                                </div>
                            </div>
                        </template>
                        <template v-else-if="key === 'username'">
                            <div class="flx login-form-item">
                                <div
                                    :class="[ns.e('right__form'), ns.is('focus', item.focusModel), ns.is('error', item.errorModel)]">
                                    <Icon :icon="item.icon" />
                                    <label :for="'input-' + key" class="sr-only">{{ item.placeholder }}</label>
                                    <input v-model="item.model" :type="item.type"
                                        :class="ns.em('right__form', 'control')" :placeholder="item.placeholder"
                                        @blur="checkUsername" @keydown.enter="login" />
                                </div>
                            </div>
                        </template>
                        <template v-else-if="key === 'password'">
                            <div class="flx login-form-item">
                                <div
                                    :class="[ns.e('right__form'), ns.is('focus', item.focusModel), ns.is('error', item.errorModel)]">
                                    <Icon :icon="item.icon" />
                                    <label :for="'input-' + key" class="sr-only">{{ item.placeholder }}</label>
                                    <input v-model="item.model" :type="item.type"
                                        :class="ns.em('right__form', 'control')" :placeholder="item.placeholder"
                                        @blur="checkPassword" @keydown.enter="login" />
                                </div>
                            </div>
                        </template>
                    </div>

                    <div :class="ns.e('right__form__btn')">
                        <button type="button" @click="login()" class="flx-center primary" aria-label="登录">
                            <Icon :icon="successFilledIcon" />
                            <span>登录</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>