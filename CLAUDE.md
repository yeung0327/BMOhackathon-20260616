# CLAUDE.md — AI 开发者指引

> 本文件为 AI 辅助开发提供项目上下文，确保每次对话延续进度。

---

## 项目概述

**项目名**：Roots & Shoots（根与芽）— 知识宇宙
**性质**：百度 BMO 黑客松参赛作品（截止日期：2026-06-16）
**参赛者**：单人 + AI 协作

**一句话定位**：将静态知识库转化为可交互、可探索、可对话的知识宇宙。

---

## 仓库结构

| 仓库 | 地址 | 用途 |
|------|------|------|
| 总仓库 | https://github.com/yeung0327/BMOhackathon-20260616 | 文档 + 前端定制 |
| 后端仓库 | https://github.com/yeung0327/llm-graph-builder | Fork 的后端 |

**本地路径**：
- 总仓库：`/Users/yangqianqian/Desktop/BMOhackathon-20260616/`
- 后端仓库：`/Users/yangqianqian/Desktop/llm-graph-builder/`

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Vite（Fork 官方前端） |
| 后端 | Python + FastAPI（llm-graph-builder） |
| 数据库 | Neo4j AuraDB Professional（实例 ID: ca425266, bolt+s 协议） |
| LLM | **DeepSeek API**（deepseek-chat，通过 OpenAI 兼容层接入） |
| 嵌入 | all-MiniLM-L6-v2（容器内本地） |
| 容器化 | Docker Compose |

---

## 关键配置

### 后端 `.env`（backend/.env）
```
NEO4J_URI=bolt+s://ca425266.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<see env file>
NEO4J_DATABASE=neo4j
LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI=deepseek-chat,<deepseek-api-key>
OPENAI_API_BASE=https://api.deepseek.com/v1
EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_PROVIDER=sentence-transformer
```

### 前端 `.env`（frontend/.env）
```
VITE_BACKEND_API_URL=http://localhost:8000
VITE_LLM_MODELS=openai_gpt_4o_mini
VITE_SKIP_AUTH=true
```

### Docker 服务
- backend: `http://localhost:8000`
- frontend: `http://localhost:8080`（Docker）/ `http://localhost:5173`（dev）

---

## 当前进度

**已完成**：阶段一全部（Step 1.1 ~ 1.6）✅
**下一步**：阶段二 Step 2.1（准备测试文档）

详细进度见：`memory-bank/progress.md`

---

## 重要决策记录

1. **放弃 Ollama 本地部署**（2026-06-10）：8GB RAM 不足以同时跑 Docker 后端 + LLM 模型
2. **选用 DeepSeek API**（通过 OpenAI 兼容层）：设置 `OPENAI_API_BASE` 环境变量即可，零代码改动
3. **Neo4j URI 用 `bolt+s://`**：AuraDB Professional 实例的路由协议问题，`neo4j+s://` 无法获取路由信息
4. **使用官方前端 Fork 定制**（非 Next.js 重写）：工期有限，Fork 改 CSS + 逻辑最高效
5. **图谱用 Neo4j 官方组件**（非 Three.js）：已内置，4 天工期唯一合理选择

---

## 开发规范

- 每完成一个 Step，立即 commit：`阶段X Step X.X: [内容]`
- 每天结束前 push 到 GitHub
- 严格按 `memory-bank/implementation-plan.md` 的步骤顺序执行
- 每步验证通过后才进入下一步
- 更新 `memory-bank/progress.md` 记录进度

---

## Memory Bank 文件索引

| 文件 | 内容 |
|------|------|
| `memory-bank/progress.md` | 工作进度（最重要，每次先读） |
| `memory-bank/implementation-plan.md` | 分步实施计划 |
| `memory-bank/architecture.md` | 项目架构与文件说明 |
| `memory-bank/tech-stack.md` | 技术栈选型与决策 |
| `memory-bank/design-doc.md` | 产品设计文档 |
