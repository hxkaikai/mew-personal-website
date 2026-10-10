# Mew · 胡轩恺的个人网站

使用原生 HTML、CSS 和 JavaScript 构建，无需安装依赖或执行构建命令。`dist/` 同时包含可编辑的完整前端源码和运行网站所需的图片、视频。

网站包含互动肖像首页、个人信息与教育经历、四段实习经历，以及运动、音乐、服装设计、游戏和模型收藏五类兴趣内容。支持桌面和移动端、横向滑动卡片、图片与视频详情，以及系统「减少动态效果」偏好。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 <http://127.0.0.1:4173>。按 `Ctrl+C` 结束服务。

## 文件说明

| 路径 | 用途 |
| --- | --- |
| `dist/index.html` | 页面结构、个人信息及无 JavaScript 时的静态内容 |
| `dist/content.js` | 个人资料、教育和实习经历、兴趣素材配置；联系方式当前为空 |
| `dist/styles.css` | 页面布局、响应式样式与动画 |
| `dist/app.js` | 内容渲染、导航、详情弹窗等交互 |
| `dist/hero-video.js`、`dist/hero-video.css` | 首屏肖像随鼠标方向变化的交互与样式 |
| `dist/fitness-video.js` | 运动标签、相册和视频播放控制 |
| `dist/portfolio-media.js` | 服装、模型、游戏与音乐媒体交互 |
| `dist/interests-carousel.js` | 兴趣卡片横向浏览与键盘操作 |
| `dist/assets/` | 网站使用的图片、视频、封面和标识 |

更新经历或素材时，请同步修改 `dist/content.js` 和 `dist/index.html` 中对应的静态内容。静态托管服务的发布目录应设置为 `dist/`。

## GitHub Pages 发布

仓库包含 `.github/workflows/pages.yml`，按 [GitHub 官方流程](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)使用 GitHub Actions 发布 `dist/`。首次发布前，在仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

推送到 `main` 分支后会自动发布；也可以在 **Actions** 中手动运行该工作流。请以部署任务成功后返回的地址为准，配置文件存在不代表网站已经上线。

## 内容与素材

仓库包含个人照片、视频、设计手稿和经历资料，不包含原始简历。学校标识分别来自[厦门大学学校标识页](https://www.xmu.edu.cn/sdgl/xxbs.htm)和[国际关系学院官网](https://www.uir.edu.cn/)，用于展示个人教育经历。

本仓库未附开源许可证；上传 GitHub 不代表授予开源授权。个人素材及第三方标识的权利归各自权利人所有。
