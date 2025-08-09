import { App } from 'vue';

/**
 * 自动注册宿主项目中 .vitepress/theme/components 目录下的组件
 *
 * @param app VitePress 应用实例
 */
export async function autoRegisterComponents(app: App) {
  try {

    //@ts-ignore
    // 默认注册为全局组件的目录
    const modules = import.meta.glob('../global/*.vue');

    for (const [path, module] of Object.entries(modules)) {
      const componentName = path.split('/').pop()?.replace('.vue', '');

      if (componentName) {
        try {
          const componentModule = await (module as () => Promise<any>)();
          app.component(componentName, componentModule.default || componentModule);
        } catch (importError) {
          console.debug(`组件 ${componentName} 导入失败:`, importError);
        }
      }
    }
  } catch (error) {
    console.error('自动注册组件时出错:', error);
  }
}
