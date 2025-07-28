declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 支持 @ 路径导入
declare module '@/index' {
  const value: any
  export default value
}

// 支持 @ 别名引用所有模块
declare module '@/*' {
  const value: any
  export default value
}
