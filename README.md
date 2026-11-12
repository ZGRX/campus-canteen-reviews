# 觅食指南

校园食堂窗口点评。现有资料包含凤凰厅、东岳厅、天烛厅和龙山厅的 22 个窗口。原作者的照片、点评和推荐指数来自 `docs/life/`，同学评分由 Supabase 单独统计。

## 本地运行

需要 Node.js 22.12 或更高版本。

```sh
npm ci
npm run dev
```

可以直接浏览目录、筛选窗口和查看探店笔记。要启用邮箱登录、共享评分和文字点评，请连接 Supabase。

## 连接 Supabase

1. 在 Supabase 项目的 SQL Editor 执行 [数据库迁移](supabase/migrations/202611120001_canteen_reviews.sql)。已接入 Supabase CLI 的项目也可用迁移流程应用该文件。
2. 在 Authentication 中启用 Email provider 和注册。在 Magic Link 邮件模板中放入验证码变量 `{{ .Token }}`，例如 `<p>觅食指南验证码：{{ .Token }}</p>`。面向同学使用时配置自定义 SMTP，使项目可以向普通用户发送邮件。
3. 把 `.env.example` 复制为 `.env.local`，填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`，重启开发服务器。前端只能使用 publishable key，不能使用 secret 或 service-role key。

每个账号对每个窗口可保存一条评价，并可编辑或删除。浏览者只读取汇总、分数、点评文字和时间。评论中请勿填写个人联系方式。

## GitHub Pages

在仓库 **Settings → Secrets and variables → Actions → Variables** 配置与本地相同的两个公开变量。合并到 `main` 后，现有 GitHub Actions 流程会构建并上传 `dist/`。如果稍后补配变量，可重新运行部署工作流。

```sh
npm run build
npm run preview
```

详情页使用 `?stall=窗口编号`，所以 GitHub Pages 可以直接访问和刷新详情页。新增窗口时，更新原始笔记、`src/catalogue.ts` 中的窗口编号，并用新迁移把编号加入数据库。
