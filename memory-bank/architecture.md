# architecture.md — 项目架构与文件说明

## 项目位置

代码仓库：`/Users/yangqianqian/Desktop/llm-graph-builder/`（Fork 自 neo4j-labs/llm-graph-builder）
memory-bank：`/Users/yangqianqian/Desktop/BMOhackathon-20260616/memory-bank/`

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
| `src/make_relationships.py` | 创建 chunk embeddings 和关系 |
| `src/entities/` | 实体抽取相关模块 |
| `src/entities/source_extract_params.py` | 抽取参数定义（含默认值问题） |
| `src/communities.py` | 社区检测算法 |
| `src/QA_integration.py` | 问答集成（GraphRAG） |
| `src/document_sources/` | 文档来源处理（本地/S3/Wiki等） |
| `src/shared/` | 共享工具函数 |
| `src/shared/common_fn.py` | 通用函数（load_embedding_model、formatted_time 等） |
| `score.py` | FastAPI 应用主文件（路由定义在此） |
| `Dockerfile` | 后端容器镜像定义 |
| `requirements.txt` | Python 依赖 |
| `constraints.txt` | 依赖约束（已修改去掉 +cpu） |
| `example.env` | 环境变量模板 |

### 关键 API 端点

| 端点 | 方法 | 作用 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/connect` | POST | 验证 Neo4j + 嵌入模型连接 |
| `/upload` | POST | 上传文档（multipart/form-data） |
| `/extract` | POST | 触发实体关系抽取（form-urlencoded） |
| `/sources_list` | POST | 获取已上传文档列表及状态 |
| `/chat_bot` | POST | 智能问答（GraphRAG） |
| `/graph_query` | POST | 图谱查询 |
| `/get_neighbours` | POST | 获取邻居节点 |
| `/delete_document_and_entities` | POST | 删除文档及关联实体 |

### `/extract` 必传参数（踩坑总结）

```
uri, userName, password, database    # Neo4j 连接
model=openai_gpt_4o_mini             # LLM 模型
source_type=local file               # 来源类型
file_name=xxx.pdf                    # 文件名
token_chunk_size=200                 # ⚠️ 默认None会报错
chunk_overlap=20                     # ⚠️ 默认None会报错
chunks_to_combine=1                  # ⚠️ 默认None会报错
embedding_provider=sentence-transformer  # ⚠️ 默认None会报错
embedding_model=all-MiniLM-L6-v2        # ⚠️ 默认None会报错
```

### LLM 配置方式（DeepSeek via OpenAI 兼容层）

`backend/.env` 中设置：
```
LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI=deepseek-chat,<your-deepseek-api-key>
OPENAI_API_BASE=https://api.deepseek.com/v1
```

原理：`ChatOpenAI` 类自动读取 `OPENAI_API_BASE` 环境变量作为请求地址。DeepSeek API 与 OpenAI 格式完全兼容，零代码改动。

**注意**：DeepSeek 不支持 `response_format`（structured output），代码在 `src/llm.py:205` 有检测逻辑：
```python
if supports_structured_output and not isinstance(llm, ChatGroq) and "deepseek" not in os.environ.get("OPENAI_API_BASE","").lower():
```
检测到 DeepSeek 时自动设置 `ignore_tool_usage=True`。

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
- LLM 通过 DeepSeek API 远程调用（OpenAI 兼容格式），无需本地模型服务
- Neo4j 连接使用 `bolt+s://` 协议（AuraDB Professional 实例）

**docker-compose.yml 已修改的默认值**：
```yaml
# backend environment
- EMBEDDING_MODEL=${EMBEDDING_MODEL-all-MiniLM-L6-v2}
- EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER-sentence-transformer}
- MAX_TOKEN_CHUNK_SIZE=${MAX_TOKEN_CHUNK_SIZE-10000}
# frontend build args
- VITE_LLM_MODELS=${VITE_LLM_MODELS-openai_gpt_4o_mini}
```

**backend/src/main.py 改动**：
1. `processing_source` 函数（第496-499行）：Failed 状态自动清理旧实体，防重复节点
2. `get_chunkId_chunkDoc_list` 函数（第730-734行）：短文档自适应 chunk_size，防碎片化抽取

**backend/src/shared/constants.py 改动**：
- `ADDITIONAL_INSTRUCTIONS`（第884-887行）：追加中文指令，强制 LLM 用中文命名关系类型和实体
- 注意：`PART_OF`、`NEXT_CHUNK`、`FIRST_CHUNK`、`HAS_ENTITY` 等是代码硬编码的结构性关系，不受此指令影响

---

## 重要发现

1. **前端使用 Tailwind CSS**：`tailwind.config.js` 和 `postcss.config.js` 存在，说明项目使用 Tailwind 而非纯 CSS Variables。样式改造策略需调整——可能需要修改 Tailwind 配置来实现深色主题。
2. **前端端口是 8080**（非 5173）：Docker 模式下前端通过 nginx 在 8080 端口提供服务；本地开发模式（yarn dev）才是 5173。
3. **多 LLM 支持**：后端支持 OpenAI、Gemini、Anthropic、Diffbot、Fireworks 等多模型，当前通过 OPENAI_API_BASE 指向 DeepSeek。
4. **Graph 组件是独立目录**：`src/components/Graph/` 是图谱可视化核心，阶段三四的改造重点。
5. **ChatBot 组件是独立目录**：`src/components/ChatBot/` 是对话功能核心，阶段五的改造重点。
6. **抽取参数坑多**：`/extract` API 的多个参数默认 None，前端调用时已内置默认值，但 API 直接调用必须显式传入。
7. **抽取流程会删除源文件**：成功或失败后 `merged_files/` 中的文件会被删除，重试需重新 upload。
8. **前端模型列表是 build-time 注入**：`VITE_LLM_MODELS` 通过 docker-compose build args 在构建时写入 JS bundle，修改后需 `docker compose up --build -d frontend` 重建。
9. **重复 Chunk 问题**：extract 失败重试时若不传 `retry_condition`，会创建重复 Chunk 节点。解法：传 `retry_condition=delete_entities_and_start_from_beginning`。
