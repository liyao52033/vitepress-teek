## 1、脚手架安装

### npm
```
npm create base-teek-theme@latest my-first-blog
``` 

### yarn
```
yarn create base-teek-theme@latest my-first-blog
```

###  pnpm(推荐)
```
pnpm create base-teek-theme@latest my-first-blog
```

###  bun
```
bunx create-base-teek-theme@latest my-first-blog --bun
```

## 2、打开项目，安装依赖

### npm
```
npm install
``` 

### yarn
```
yarn install
```

###  pnpm(推荐)
```
pnpm install
```

###  bun
```
bun install
```


## 3、填写`docs/secureInfo`登录账号密码
```
export default {
    username: "",
    password: "",
}

```

## 4、把`docs/articles`下的 Markdown文章 换成自己的

  直接在`docs/articles`目录下的Markdown文章不参与侧边栏生成
  
## 5、运行项目

根据所用包管理器运行项目，推荐用`pnpm run dev`
```
 "scripts": {
    "dev": "vitepress dev docs",   //运行项目
    "build": "vitepress build docs", //打包项目
    "big:build": "node --max-old-space-size=28672 node_modules/vitepress/bin/vitepress.js build", //打包项目(单个md大于500k)
    "preview": "vitepress preview docs" //预览项目
  },
```