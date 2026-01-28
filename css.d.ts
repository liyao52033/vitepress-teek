// 让 TS 识别 .css 文件
declare module "*.css" {
    const content: string;
    export default content;
}