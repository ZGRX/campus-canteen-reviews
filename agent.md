# 项目交接记录

更新于 2026-11-24。后续操作前先核对当前文件、Git 状态和服务器状态。

## 沟通与本地项目

- 默认用 EL15 的方式向用户解释，清楚、直接，用户要求时再深入。
- 最新工作目录为 `/Users/ricey/Documents/study_project/campus-canteen-reviews`。
- 旧副本为 `/Users/ricey/Documents/Codex/2026-11-12/wo-xi/work/campus-canteen-reviews`。两份目录独立，修改不会自动同步。
- GitHub 为 `https://github.com/ZGRX/campus-canteen-reviews`。当前开发分支为 `campus-ratings`。部署 ECS 与 push GitHub 是独立操作，检查工作区后再提交。
- 技术栈为 React、Vite、TypeScript。使用 `npm ci` 安装依赖，`npm run dev` 本地预览，`npm run build` 检查类型并生成 `dist/`。

## 内容与功能约定

- 网站名为「觅食指南」。现有 22 个窗口、4 个食堂，均属于泰安校区。另一个校区尚无资料，不编造数据。
- 保留原有照片、站长用餐笔记和站长推荐指数。内容源在 `docs/life/`，由 `src/catalogue.ts` 整理。
- 搜索、食堂筛选和随机选餐转盘可以使用。转盘抽窗口，可按食堂限定范围，有多个候选时重转避开上次结果。
- 按用户确定的运营方式，访客仅浏览。登录、用户评分、评论提交、点赞和 Supabase 接入已移除。
- 星级由站长维护，原笔记中的四星半、区间和附注按原文展示。
- 详情页只读评论汇总写有「（根据大家发往邮箱的总结）」。目前尚无实际汇总，显示空状态；发布内容必须来自用户提供的真实资料，不生成虚构来信或分数。聚合展示是否符合备案要求需由备案审核方确认。
- 只读评论区在电脑上位于菜品图片右侧，650px 及以下屏幕位于图片下方。
- 顶部暖黄色横条进入独立「关于与联系」页，地址为 `?page=about`。
- 站长公开联系邮箱为 `whattoeatat311@163.com`。
- 详情地址采用 `?stall=窗口编号`。保留搜索、筛选、返回列表行为。
- 动画遵循系统 `prefers-reduced-motion` 设置。

## 阿里云服务器

- 云产品为杭州地域 ECS，Ubuntu 22.04，2 vCPU、2 GiB 内存。
- 公网 IP 为 `47.97.9.252`。
- 实例 ID 为 `i-bp1dg94h9bys8znnbnpp`，主机名为 `iZbp1dg94h9bys8znnbnppZ`。
- 本机连接命令为 `ssh canteen`，登录用户为 `root`。
- 本机 `~/.ssh/config` 中配置如下。私钥只保存在本机，文档和仓库中不得存放私钥、密码或云 API 密钥。

```sshconfig
Host canteen
    HostName 47.97.9.252
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

- 首次连接遇到过 `Permission denied (publickey)`，已通过 Workbench 将本机公钥加入服务器 root 用户的 `~/.ssh/authorized_keys`。之后 SSH 密钥登录验证成功。
- 网站由系统 Nginx 提供服务，发布目录为 `/var/www/campus-canteen-reviews/releases/`。
- `/var/www/campus-canteen-reviews/current` 为符号链接，指向当前发布目录；Nginx 的 root 指向此链接。
- Nginx 站点配置为 `/etc/nginx/sites-available/campus-canteen`，启用链接为 `/etc/nginx/sites-enabled/campus-canteen`。
- 初始发布为 `releases/4d25f0ffd0c9e6b9dec8c1e3bfcfbf21a80ef89d`。当前版本必须以 `readlink /var/www/campus-canteen-reviews/current` 为准。
- Nginx 已配置文本压缩、HTML 不缓存、带哈希的 assets 长期缓存。默认站点仍存在，修改配置前先读取实际内容。
- 服务器只需提供构建产物，不需要运行 Vite 开发服务器。

## 域名与 HTTPS 状态

- 用户已购买 `311eat.cn`。2026-11-24 部署前查询阿里云权威 DNS，根域名尚无 A 记录。
- 当前已确认可用入口为 `http://47.97.9.252/`。Nginx 尚未配置 HTTPS，server_name 为 IP。
- 备案完成情况尚待用户确认。不能把购买域名当成已完成备案。
- 按之前商定的流程，备案通过后配置 A 记录 `@ -> 47.97.9.252`，如需要再加 `www`；服务器配置域名、申请证书和自动续期，并确认安全组入方向 TCP 443 可用。
- 域名、DNS、证书和备案状态会变化，处理时重新核实。

## 发布与回滚

1. 在最新本地项目运行 `npm run build` 和 `git diff --check`。
2. 记录当前 current 链接，创建唯一命名的 releases 子目录。
3. 仅上传 `dist/` 内容，核对远端文件内容与本地一致后再切换。
4. 保留上一版带哈希的 assets，避免已打开页面请求旧脚本或图片时出现 404。
5. 用临时符号链接配合 `mv -Tf` 原子替换 current。通常更新静态文件无需重载 Nginx。
6. 修改 Nginx 配置时先备份并运行 `nginx -t`，通过后执行 `systemctl reload nginx`。
7. 用公网请求验证首页、`?page=about`、详情、JS、CSS 和图片；用浏览器验证搜索、转盘和手机布局。
8. 如需回滚，将 current 原子切回记录的旧目录。保留历史发布以供回滚。

仓库的 `.github/workflows/deploy.yml` 用于 GitHub Pages，不能将其执行成功当成 ECS 已更新。

## 最近一次部署

- 2026-11-24 发布目录为 `/var/www/campus-canteen-reviews/releases/20261124-639dc04b`。
- 回滚目录为 `releases/4d25f0ffd0c9e6b9dec8c1e3bfcfbf21a80ef89d`，也记录在新发布目录的 `PREVIOUS_RELEASE` 文件里。
- 发布后逐一比对了所有本地 dist 文件与公网 HTTP 返回内容，首页、详情和关于页面直达地址通过。
- Chrome 实际验证了搜索、转盘、邮箱链接、只读评论区、电脑左右布局、手机上下布局；未发现页面脚本报错。
- 这次发布包含本地尚未提交的源代码改动；发布目录名不是 Git 提交号。需要同步 GitHub 时先检查并提交源代码。
