/// <reference types="vite/client" />
/// <reference lib="dom" />

// 让 TypeScript 识别 @/xxx 模块
declare module "@/*";

interface CozeWebSDK {
    WebChatClient: new (config: any) => any;
}

declare interface Window {
    CozeWebSDK?: CozeWebSDK;
}

declare const CozeWebSDK: CozeWebSDK;

// 让 TS 识别 .vue 文件
declare module "*.vue" {
    import { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// 让 TS 识别 .md 文件（VitePress 常用）
declare module "*.md" {
    const content: string;
    export default content;
}
