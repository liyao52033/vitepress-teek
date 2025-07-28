import { reactive, ref, type Ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface LoginFormModel {
    username: string
    password: string
    verifyCode: string
}

export function useLoginForm(imgCode: Ref<string>) {
    const formRef = ref<FormInstance>()
    const formModel = reactive<LoginFormModel>({
        username: '',
        password: '',
        verifyCode: '',
    })

    const validateUsername = (_rule: any, value: string, callback: (err?: Error) => void) => {
        if (!value || value.length < 5) {
            callback(new Error('用户名长度需大于5位'))
        } else {
            callback()
        }
    }

    const validatePassword = (_rule: any, value: string, callback: (err?: Error) => void) => {
        if (!value) {
            callback(new Error('密码不能为空'))
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value)) {
            callback(new Error('密码需包含字母和数字，长度大于5位'))
        } else {
            callback()
        }
    }

    const validateCode = (_rule: any, value: string, callback: (err?: Error) => void) => {
        if (!value) {
            callback(new Error('验证码不能为空'))
        } else if (value !== imgCode.value) {
            callback(new Error('验证码错误'))
        } else {
            callback()
        }
    }

    const rules = reactive<FormRules<LoginFormModel>>({
        username: [{ validator: validateUsername, required: true, trigger: 'blur' }],
        password: [{ validator: validatePassword, required: true, trigger: 'blur' }],
        verifyCode: [{ validator: validateCode, required: true, trigger: 'blur' }],
    })

    function validate(callback?: (valid: boolean) => void) {
        formRef.value?.validate((valid) => {
            callback?.(valid)
        }).then(r => {})
    }

    function reset() {
        formRef.value?.resetFields()
    }

    return {
        formRef,
        formModel,
        rules,
        validate,
        reset,
    }
}
