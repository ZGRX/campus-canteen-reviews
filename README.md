# 觅食指南

个人校园食堂指南。现有资料包含凤凰厅、东岳厅、天烛厅和龙山厅的 22 个窗口。原作者的照片、点评和推荐指数来自 `docs/life/`。

## 本地运行

需要 Node.js 22.12 或更高版本。

```sh
npm ci
npm run dev
```

可以浏览目录、搜索和筛选窗口、查看个人用餐笔记，并使用随机选餐转盘。

## GitHub Pages

合并到 `main` 后，现有 GitHub Actions 流程会构建并上传 `dist/`。

```sh
npm run build
npm run preview
```

详情页使用 `?stall=窗口编号`，所以 GitHub Pages 可以直接访问和刷新详情页。新增窗口时，更新原始笔记、`src/catalogue.ts` 中的窗口编号。
