# 🌌 Roots & Shoots — 知识宇宙

> **将静态知识库转化为可交互、可探索、可对话的知识宇宙。**

百度 BMO 黑客松 2026 参赛作品 | 单人 + AI 协作开发

---

## 📖 项目介绍

**Roots & Shoots（根与芽）** 是一个基于知识图谱 + LLM 智能问答的知识探索平台。用户上传文档后，系统自动抽取实体和关系，构建可视化知识图谱。通过深色宇宙风格的交互界面，用户可以：

- 🔍 **图谱探索**：双击节点逐层展开关联知识，像漫游星系一样探索信息
- 💬 **智能问答**：多轮对话 + 图谱联动，AI 回答自动高亮相关节点
- 📝 **文档摘要**：点击文档节点，LLM 自动生成 3-5 句核心内容摘要
- 🌐 **全连通图谱**：优化后的抽取策略确保 0 孤立节点，知识脉络完整清晰

---

## 🎯 解决的问题

| 痛点 | 现状 | Roots & Shoots 方案 |
|------|------|---------------------|
| **信息孤立** | 文档之间缺乏因果/时序关联，看不清来龙去脉 | 知识图谱自动构建文档间的实体关系网络 |
| **搜索低效** | 关键词搜索只能命中单篇文档，无法发现隐性关联 | 图谱 + 全文检索 + LLM 问答三位一体 |
| **经验难复用** | 策划新活动时，难以快速对比过往成功模式 | 可视化因果链条，一目了然 |
| **学习成本高** | 新员工需要逐一阅读文档才能了解业务全貌 | 对话式探索 + 图谱导航，快速建立认知 |

---

## 💼 对百度大模型运营部的业务帮助

1. **运营策划提效**：将历史活动文档转化为知识图谱，快速看清成功活动之间的因果关联和共性模式，辅助新活动策划决策
2. **新人培训加速**：新员工通过图谱 + 对话快速了解部门业务脉络（项目关系、技术栈依赖、合作方网络），缩短上手时间
3. **技术文档导航**：PaddleOCR、飞桨生态等技术文档自动建立关联，开发人员可以通过图谱快速定位技术方案之间的依赖和演进关系
4. **客户案例管理**：客户交流纪要、合作方案自动关联，便于复用已有方案和经验
5. **知识资产盘活**：将如流知识库中沉睡的文档转化为可交互的知识网络，让信息价值最大化

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    用户浏览器                         │
│  React + TypeScript + Vite + Neo4j NVL 图谱组件      │
│  深色宇宙主题 | 双击探索 | 多轮对话 | AI摘要          │
└────────────────────────┬────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────┐
│              Python FastAPI 后端                      │
│  文档上传 | LLM 实体抽取 | GraphRAG 问答 | 邻居查询   │
└──────┬─────────────────────────────────┬────────────┘
       │                                 │
┌──────▼──────┐                 ┌────────▼────────┐
│ Neo4j AuraDB │                 │  DeepSeek API   │
│ 知识图谱存储  │                 │  (OpenAI兼容)   │
└─────────────┘                 └─────────────────┘
```

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + TypeScript + Vite | Fork 官方前端，深度定制 UI 和交互 |
| 后端 | Python + FastAPI | llm-graph-builder 开源项目 |
| 数据库 | Neo4j AuraDB | 云端图数据库，bolt+s 协议 |
| LLM | DeepSeek API (deepseek-chat) | 通过 OpenAI 兼容层零改动接入 |
| 嵌入模型 | all-MiniLM-L6-v2 | 容器内本地运行，384维向量 |
| 容器化 | Docker Compose | 一键启动前后端服务 |

---

## 📁 仓库结构与文件说明

```
BMOhackathon-20260616/
├── README.md                   ← 本文件，项目总览
├── CLAUDE.md                   ← AI 开发者指引（上下文传递）
├── PRD.md                      ← 产品需求文档
├── DESIGN.md                   ← 视觉设计规范（配色、组件、动效）
├── macPublish.command           ← Mac 一键 git 提交推送脚本
├── memory-bank/                ← 开发记忆库（AI 协作核心）
│   ├── progress.md             ← 开发进度记录（最重要）
│   ├── implementation-plan.md  ← 分步实施计划
│   ├── architecture.md         ← 项目架构与文件说明
│   ├── tech-stack.md           ← 技术选型与决策记录
│   └── design-doc.md           ← 产品功能设计文档
└── llm-graph-builder/          ← 核心代码（Fork 自 Neo4j Labs）
    ├── backend/                ← Python FastAPI 后端
    │   ├── src/                ← 核心逻辑（抽取、问答、图谱查询）
    │   ├── Dockerfile          ← 后端容器镜像
    │   ├── requirements.txt    ← Python 依赖
    │   └── example.env         ← 环境变量模板
    ├── frontend/               ← React + TypeScript 前端
    │   ├── src/components/     ← UI 组件（Graph、ChatBot 等）
    │   ├── src/services/       ← API 调用层
    │   └── src/utils/          ← 工具函数与常量
    └── docker-compose.yml      ← 一键启动编排
```

### 文件详细说明

| 文件/目录 | 用途 | 适合阅读者 |
|-----------|------|-----------|
| `README.md` | 项目总览、快速了解 | 所有人 |
| `PRD.md` | 产品需求文档：痛点分析、功能范围、成功标准 | 评委、产品经理 |
| `DESIGN.md` | 视觉设计系统：配色方案、组件样式、图谱渲染规则 | 设计师、前端开发 |
| `CLAUDE.md` | AI 开发者上下文：配置信息、技术栈、开发规范 | AI Agent（延续上下文用） |
| `macPublish.command` | Mac 双击即可执行的 git add → commit → push 脚本 | 开发者快速提交 |
| `memory-bank/progress.md` | 完整开发进度：每个阶段的完成状态和验证结果 | 评委、复盘 |
| `memory-bank/implementation-plan.md` | 逐步实施计划：每步含指令、参数、验证标准 | 复现者 |
| `memory-bank/architecture.md` | 架构详解：目录结构、API 端点、踩坑记录 | 开发者 |
| `memory-bank/tech-stack.md` | 技术选型决策：为什么选 DeepSeek、为什么不用 Three.js 等 | 技术评审 |
| `memory-bank/design-doc.md` | 产品功能设计：交互流程、功能优先级 | 产品经理 |
| `llm-graph-builder/backend/` | 后端源码：实体抽取、GraphRAG 问答、邻居查询 | 后端开发 |
| `llm-graph-builder/frontend/` | 前端源码：深色宇宙主题、图谱探索、AI 摘要 | 前端开发 |
| `llm-graph-builder/docker-compose.yml` | Docker 编排配置 | 部署者 |

---

## 🚀 快速开始

### 前置条件

- Docker Desktop 4.x+
- Node.js 18+
- 8GB+ RAM
- 网络可访问 DeepSeek API + Neo4j AuraDB

### 启动后端

```bash
cd llm-graph-builder

# 配置环境变量（参考 backend/example.env）
cp backend/example.env backend/.env
# 编辑 .env 填入 Neo4j 和 DeepSeek 配置

# Docker 一键启动
docker compose up --build -d
```

### 启动前端（开发模式）

```bash
cd llm-graph-builder/frontend
yarn install
yarn dev
# 访问 http://localhost:5173
```

### 验证

- 后端健康检查：`GET http://localhost:8000/health` → `{"healthy": true}`
- 前端页面：浏览器打开 `http://localhost:5173`

---

## 🎨 产品特色

### 深色宇宙主题
- 背景色 `#0a0a1a`，节点按类型发光（金色/青蓝/粉紫/绿色）
- 半透明连线不抢视觉焦点，整体安静深邃

### 探索式浏览
- 双击任意节点展开邻居，逐层深入知识网络
- 浏览历史栈 + 返回按钮，不迷失方向

### 智能问答联动
- 多轮对话保留上下文
- AI 回答中提及的实体在图谱中实时高亮放大

### 文档 AI 摘要
- 单击 Document 节点，自动生成核心内容摘要
- 结果缓存，不重复请求

---

## 📊 项目成果

| 指标 | 数据 |
|------|------|
| 已处理文档 | 6 份（技术调研、运营规划、交流纪要等） |
| 图谱节点 | 457 个（优化后，-71%） |
| 图谱关系 | 1,030 条（优化后，-88%） |
| 孤立节点 | 0（全连通） |
| 开发周期 | 5 天（单人 + AI 协作） |

---

## 🔗 相关仓库

| 仓库 | 说明 |
|------|------|
| [BMOhackathon-20260616](https://github.com/yeung0327/BMOhackathon-20260616) | 本仓库：文档 + 设计规范 + 完整代码 |

---

## 📝 License

本项目为百度 BMO 黑客松参赛作品，仅供学习交流使用。后端基于 [neo4j-labs/llm-graph-builder](https://github.com/neo4j-labs/llm-graph-builder) 开源项目。
