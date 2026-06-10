# architecture.md — 项目架构与文件说明

## 项目位置

代码仓库：`/Users/yangqianqian/Desktop/llm-graph-builder/`（Fork 自 neo4j-labs/llm-graph-builder）

---

## 根目录结构

```
llm-graph-builder/
├── backend/          # Python FastAPI 后端
├── frontend/         # React + TypeScript 前端
├── docker-compose.yml # 容器编排（前端 + 后端）
├── POC_Documents/    # 概念验证文档
├── POC_Experiments/  # 概念验证实验
├── data/             # 数据文件
├── docs/             # 项目文档
├── experiments/      # 实验代码
├── graph/            # 图相关工具/脚本
├── cronjob/          # 定时任务
└── LICENSE
```

---

## 后端 (`backend/`)

| 文件/目录 | 作用 |
|-----------|------|
| `src/main.py` | FastAPI 应用入口，定义所有 API 路由 |
| `src/llm.py` | LLM 调用封装（OpenAI/Gemini/Anthropic 等多模型支持） |
| `src/graphDB_dataAccess.py` | Neo4j 数据库访问层，封装 Cypher 查询 |
| `src/graph_query.py` | 图谱查询逻辑（子图、邻居节点等） |
| `src/neighbours.py` | 邻居节点查询（探索式浏览的后端支撑） |
| `src/create_chunks.py` | 文档分块逻辑 |
| `src/entities/` | 实体抽取相关模块 |
| `src/communities.py` | 社区检测算法 |
| `src/QA_integration.py` | 问答集成（GraphRAG） |
| `src/document_sources/` | 文档来源处理（本地/S3/Wiki等） |
| `src/shared/` | 共享工具函数 |
| `Dockerfile` | 后端容器镜像定义 |
| `requirements.txt` | Python 依赖 |
| `example.env` | 环境变量模板 |

### LLM 配置方式（OpenAI）

`backend/.env` 中设置：
```
LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI=gpt-4o-mini,<your-api-key>
```

格式为 `model_name,api_key`，后端 `llm.py` 的 OPENAI 分支直接解析使用，零代码改动。

---

## 前端 (`frontend/`)

| 文件/目录 | 作用 |
|-----------|------|
| `src/main.tsx` | React 应用入口 |
| `src/App.tsx` | 根组件，路由/布局 |
| `src/index.css` | 全局样式（CSS Variables 定义在此） |
| `src/App.css` | App 级别样式 |
| `src/components/Graph/` | **图谱可视化组件**（核心改造目标） |
| `src/components/ChatBot/` | **对话侧边栏组件**（核心改造目标） |
| `src/components/Layout/` | 页面布局组件 |
| `src/components/DataSources/` | 数据源管理（文件上传等） |
| `src/components/UI/` | 通用 UI 组件库 |
| `src/components/Content.tsx` | 主内容区 |
| `src/context/` | React Context（全局状态管理） |
| `src/hooks/` | 自定义 Hooks |
| `src/services/` | API 调用服务层 |
| `src/utils/` | 工具函数 |
| `src/types.ts` | TypeScript 类型定义 |
| `src/styling/` | 样式相关文件 |
| `src/API/` | API 接口定义 |
| `package.json` | 依赖管理 |
| `vite.config.ts` | Vite 构建配置 |
| `tailwind.config.js` | Tailwind CSS 配置（注意：项目实际使用 Tailwind） |
| `Dockerfile` | 前端容器镜像定义 |

---

## Docker Compose 服务

| 服务 | 端口 | 说明 |
|------|------|------|
| `backend` | 8000 | FastAPI 后端 |
| `frontend` | 8080 | React 前端，通过 nginx 提供服务 |

**关键配置**：
- `VITE_SKIP_AUTH=true` — 跳过认证，方便本地开发演示
- 前端通过 `VITE_BACKEND_API_URL` 连接后端
- LLM 通过 OpenAI API 远程调用，无需本地模型服务

---

## 重要发现

1. **前端使用 Tailwind CSS**：`tailwind.config.js` 和 `postcss.config.js` 存在，说明项目使用 Tailwind 而非纯 CSS Variables。样式改造策略需调整——可能需要修改 Tailwind 配置来实现深色主题。
2. **前端端口是 8080**（非 5173）：Docker 模式下前端通过 nginx 在 8080 端口提供服务；本地开发模式（yarn dev）才是 5173。
3. **多 LLM 支持**：后端支持 OpenAI、Gemini、Anthropic、Diffbot、Fireworks 等多模型，当前使用 OpenAI GPT-4o-mini。
4. **Graph 组件是独立目录**：`src/components/Graph/` 是图谱可视化核心，阶段三四的改造重点。
5. **ChatBot 组件是独立目录**：`src/components/ChatBot/` 是对话功能核心，阶段五的改造重点。
