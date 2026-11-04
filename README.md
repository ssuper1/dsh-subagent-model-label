# dsh-subagent-model-label

给 DeepSeek Harness 的子代理列表加一行 **`分组名 / 模型名`**。

原来点开「N 个子智能体」只能看到任务标题、状态、token 和耗时，看不出每个子代理实际跑在哪个模型、哪个供应商分组上。装上这个插件后，每条子代理记录会多显示一行，例如：

```
● 调查消息编辑界面             142K tok
  workbuddy / gpt-6.1-terra
  仅调查不修改。分析任务 · 可继续 · 当前未运行
```

鼠标悬停在这一行上，可以看到完整的 provider / 模型 / 推理强度。

## 数据来源

用的是会话摘要里已经存在的 `modelSelection` 投影，不额外发请求、不额外消耗 token、不改变任何模型调用：

- 优先显示 `lastUsed`，也就是这个子代理**实际用过**的模型；
- 还没发起过请求时，回退显示已选定的 `next`；
- 两者都没有（例如很早的历史会话）时**不显示**，不会拿父会话的默认模型去猜。

## 安装

### 方式一：应用内插件市场 / 插件页（推荐给朋友）

如果插件已被收录，直接在 **设置 → 插件** 里搜索 `dsh-subagent-model-label` 安装。

### 方式二：从 GitHub 装（未经市场收录时）

在 profile 目录里手动登记。以桌面端默认 profile 为例：

```powershell
cd C:\Users\<你>\.dsh\profiles\desktop
pnpm add github:ssuper1/dsh-subagent-model-label
```

然后编辑同目录的 `package.json`，把包名加进 `dsh.profile.bundles` 列表末尾：

```json
"dsh.profile.bundles": [
  "@deepseek-ai/dsh-base",
  "@deepseek-ai/dsh-web-app",
  "dsh-subagent-model-label"
]
```

保存后刷新页面；如果没生效，重启一次 DeepSeek Harness。

> 本包的 `dsh.bundle.patch` 指向仓库内的 `cordis.patch.yml`，它会**停用官方的 `ui-subagent` 条目并插入本插件**，两者不会打架。不要手动删掉其中任何一段。

### 方式三：本地目录（开发者）

```powershell
pnpm add link:<本仓库克隆路径>
```

并把包名加进 `dsh.profile.bundles`。

## 兼容性（重要）

这个插件是**按 DSH 自带子代理界面代码做的版本对齐移植**：它替换的是安装包 `app.asar` 里的 `@deepseek-ai/dsh-client-ui-subagent`（构建时对齐 **0.2.1-rc.5**），并没有修改安装包本身。

因此：

- DSH **升级后可能失效**（界面内部结构变了，旧移植脚本可能不再匹配），需要按新版本重新构建；
- 失效时通常表现为子代理列表整体不显示，此时按下面的「回退」卸载即可恢复官方界面；
- 仓库里的 `lib/client.js` 已经构建好，**使用者不需要编译**，只有要改代码的人才需要重新构建。

## 回退

从 `dsh.profile.bundles` 里移除 `dsh-subagent-model-label`，再移除依赖，刷新或重启。官方 `ui-subagent` 条目会自动重新生效。

## 开发

```bash
npm test        # 用真实构建产物跑 7 项组件测试
npm run preview # 生成 model-label-preview.html 预览排版
```

`tests/catalog.test.mjs` 直接在 VM 里加载 `lib/client.js` 的实际组件，覆盖：实际模型优先于待选模型、首次请求前回退、无模型数据、旧会话摘要、长模型名换行与主题变量、无障碍名称、点击仍然跳转子会话。

## 许可

MIT。`lib/` 来自 DeepSeek Harness 自带 `@deepseek-ai/dsh-client-ui-subagent`（MIT，Copyright DeepSeek）的对齐移植，本仓库只增加了模型标签这一处改动；见 `LICENSE`。本项目是非官方插件，与 DeepSeek 官方无关。

## English

Adds a `provider / model` line to each row in the DSH subagent catalog, read from the existing `modelSelection` projection (`lastUsed`, falling back to `next` before the first request). No extra model calls or tokens. Built by porting the installed `@deepseek-ai/dsh-client-ui-subagent` bundle (0.2.1-rc.5); the installation itself is untouched. It may need a rebuild after DSH upgrades — remove the package from `dsh.profile.bundles` to roll back.
