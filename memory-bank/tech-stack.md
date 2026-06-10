# tech-stack.md — 技术栈推荐

## 选型原则

- **简单**：单人 + AI 协作，4天完成，避免复杂配置
- **健壮**：基于成熟开源项目，生态完善，文档齐全
- **演示优先**：Chrome only，本地运行，视觉效果优先

---

## 最终推荐

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| **后端框架** | FastAPI（llm-graph-builder 内置） | Python 3.12+ | 官方项目自带，无需选择，开箱即用 |
| **数据库** | Neo4j AuraDB Free | 5.x | 免费云托管，免运维，Bolt 协议稳定 |
| **LLM 推理** | DeepSeek API（兼容 OpenAI 格式） | deepseek-chat | 云端调用，无本地资源消耗，通过 OPENAI_API_BASE 环境变量接入 |
| **嵌入模型** | all-MiniLM-L6-v2（sentence-transformer） | — | 容器内运行，384维，无需外部API |
| **前端框架** | React + TypeScript | React 18 | 官方前端已选定，生态成熟 |
| **构建工具** | Vite | 5.x | 官方前端已选定，热更新快 |
| **图谱可视化** | @neo4j-nvl/react（Neo4j 官方组件） | latest | 项目内置，支持节点样式定制和事件回调 |
| **样式方案** | CSS Variables + 少量内联覆盖 | — | 最简改法：覆盖 CSS 变量切换深色主题 |
| **容器化** | Docker Compose | — | 一键启动前后端 + 依赖服务 |
| **版本管理** | Git + GitHub | — | 代码托管 + 黑客松提交 |

---

## 关键决策说明

### 为什么不用 Ollama 本地模型？

| 因素 | Ollama 本地 | DeepSeek API |
|------|------------|------------|
| 内存要求 | llama3:8b 需 ~5GB，8GB 机器跑不动 | 零本地资源 |
| 部署复杂度 | Docker 后端 + Ollama 抢内存，OOM | 只需 API Key |
| 推理质量 | 8B 模型抽取质量一般 | DeepSeek 质量优秀 |
| 费用 | 免费 | ¥1/百万token，几乎免费 |

**结论**：8GB RAM MacBook 无法同时运行 Docker 后端(2.4GB) + Ollama(5GB)。DeepSeek API 零改动接入。

### 为什么选 DeepSeek？

- 后端 `llm.py` 的 OPENAI 分支原生支持 `ChatOpenAI`，而 `ChatOpenAI` 读取 `OPENAI_API_BASE` 环境变量
- 设置 `OPENAI_API_BASE=https://api.deepseek.com/v1` 即可零代码改动接入 DeepSeek
- 费用极低（¥1/百万 token），新账号有免费额度
- 抽取质量优于本地小模型
- **注意限制**：DeepSeek 不支持 `response_format`（structured output），但代码已有自动检测和回退逻辑

### 为什么不用 Next.js？

原始 PRD 提到 Next.js，但官方前端是 React + Vite。Fork 定制远比重写成本低。Next.js 的 SSR 能力在本地演示场景无意义。

### 为什么用 CSS Variables 而非 Tailwind/styled-components？

官方前端已有完整样式体系。引入新样式框架 = 重写所有组件。覆盖 CSS 变量是改动最小、风险最低的深色主题方案：

```css
:root {
  --background: #0a0a1a;
  --foreground: #e0e0e0;
  --primary: #00d4ff;
  --accent: #a855f7;
}
```

### 图谱可视化：为什么用官方组件而非 D3/Three.js？

| 方案 | 开发成本 | 效果 | 与后端集成 |
|------|----------|------|-----------|
| Neo4j 官方组件 | 低（已内置） | 好 | 原生支持 |
| 3d-force-graph | 中（需对接数据） | 炫酷 | 需手动转换 |
| Three.js 手写 | 高（3+ 天） | 最自由 | 全部手动 |

4 天工期，选内置方案是唯一合理选择。通过 CSS 光晕效果提升视觉冲击力。

---

## 环境要求

| 项目 | 最低要求 |
|------|----------|
| macOS | 13+ |
| RAM | 8GB（不再需要额外内存给本地模型） |
| Node.js | 18+ |
| Python | 3.12+ |
| Docker | Desktop 4.x |
| 磁盘 | 预留 10GB（Docker 镜像） |
| 网络 | 需访问 DeepSeek API + Neo4j AuraDB |

---

## 依赖清单（无需额外引入）

项目 Fork 后自带所有核心依赖，**无需额外安装第三方库**。定制工作仅涉及：

- 修改 CSS / CSS Variables
- 修改 React 组件逻辑（事件回调）
- 修改 `.env` 配置
- 修改 `docker-compose.yml` 默认值

如确实需要新依赖（概率低）：

| 场景 | 推荐库 | 用途 |
|------|--------|------|
| 节点光晕动画 | 无需库，纯 CSS `box-shadow` + `filter` | 发光效果 |
| 浏览历史栈 | React 内置 `useState` | 探索式浏览的"返回"功能 |
| 深色主题切换 | 无需库，CSS Variables | 一键切换配色 |
