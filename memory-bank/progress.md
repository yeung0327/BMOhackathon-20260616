# progress.md — 工作进度记录

---

## 阶段一：后端环境部署

### Step 1.1 — 注册 Neo4j AuraDB 免费实例 ✅
**状态**：已完成
**完成时间**：2026-06-09
**备注**：实例名 roots-and-shoots, ID: ca425266

---

### Step 1.2 — Fork llm-graph-builder 仓库 ✅
**状态**：已完成
**完成时间**：2026-06-09
**操作**：Clone 到 `/Users/yangqianqian/Desktop/llm-graph-builder/`
**验证结果**：
- ✅ `backend/` 目录存在，含 Dockerfile、requirements.txt、src/
- ✅ `frontend/` 目录存在，含 package.json、src/、vite.config.ts
- ✅ `docker-compose.yml` 存在于项目根目录

---

### Step 1.3 — 配置 LLM（OpenAI API）✅
**状态**：已完成（方案变更）
**完成时间**：2026-06-10
**方案变更说明**：
- ❌ 原方案：Ollama 本地部署 llama3:8b
- ✅ 新方案：OpenAI GPT-4o-mini API
- **变更原因**：MacBook 8GB RAM 无法同时运行 Docker 后端(2.4GB) + Ollama(5GB)，模型加载超时
- **清理操作**：已删除 Ollama 及模型文件，释放 ~5.6GB 磁盘空间

---

### Step 1.4 — 配置后端环境变量 ✅
**状态**：已完成
**完成时间**：2026-06-09（初始）→ 2026-06-10（更新 LLM 配置）
**操作**：
1. 创建 `backend/.env` — Neo4j AuraDB 连接信息 + DeepSeek API 配置 + sentence-transformer 嵌入
2. 创建 `frontend/.env` — 后端 API 地址 + 启用 openai_gpt_4o_mini 模型 + 跳过认证
**关键配置说明**：
- Neo4j URI：`bolt+s://ca425266.databases.neo4j.io`（注意是 bolt+s 协议）
- LLM 使用 DeepSeek API：`LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI=deepseek-chat,<api-key>`
- DeepSeek 通过 `OPENAI_API_BASE=https://api.deepseek.com/v1` 环境变量接入
- 嵌入模型使用本地 `all-MiniLM-L6-v2`（容器内已下载）
- Neo4j AuraDB 实例名: roots-and-shoots, ID: ca425266

---

### Step 1.5 — Docker Compose 启动后端 ✅
**状态**：已完成
**完成时间**：2026-06-09
**操作**：
1. 安装 Docker Desktop（brew install --cask docker，版本 29.5.3）
2. 修复 `constraints.txt`：去掉 `+cpu` 后缀，改为 `torch>=2.3.1`（ARM 兼容）
3. 修复 `Dockerfile`：workers 从 8 降为 2（防 OOM）
4. `docker compose up --build -d` 构建并启动
**验证结果**：
- ✅ `curl http://localhost:8000/docs` 返回 HTTP 200
- ✅ backend 容器运行在 0.0.0.0:8000
- ✅ frontend 容器运行在 0.0.0.0:8080
**踩坑记录**：
- `torch==2.3.1+cpu` 仅适用于 x86 Linux，Apple Silicon 需去掉 `+cpu`
- 8 个 gunicorn workers 在 Docker Desktop 默认内存限制下会 OOM，2 workers 够用

---

### Step 1.6 — 验证端到端连通性 ✅
**状态**：已完成
**完成时间**：2026-06-10
**验证结果**：
- ✅ `/connect` API 返回 Success（Neo4j + 嵌入模型）
- ✅ `/chat_bot` API 返回 Success（DeepSeek LLM 调用成功，模型 deepseek-chat）
- ✅ 嵌入模型 all-MiniLM-L6-v2 容器内可用（384维）
**关键修复**：
- Neo4j URI 协议从 `neo4j+s://` 改为 `bolt+s://`（AuraDB Professional 实例需用 bolt 协议）
- LLM 使用 DeepSeek API（通过 OPENAI_API_BASE 环境变量指向 https://api.deepseek.com/v1）

---

## 阶段二：数据灌入与验证

### Step 2.1 — 准备测试文档 ✅
**状态**：已完成
**完成时间**：2026-06-10
**文档清单**（6份，均为 PDF，位于 `/Users/yangqianqian/Desktop/`）：
1. `PP-OCRv6端侧载体部署可行性调研.pdf` — 技术调研类
2. `Openclaw 接入文心大模型效果初步评估.pdf` — 技术评估类
3. `5.13深圳倍加宝公司交流纪要.pdf` — 会议纪要类
4. `【运营规划】PaddleOCR头部项目集成计划.pdf` — 运营规划类
5. `飞桨常用词汇.pdf` — 术语参考类
6. `专项：PaddleOCR头部项目集成计划🌟‼️.pdf` — 项目计划类

**备注**：
- 6份文档涵盖技术调研、效果评估、客户交流、运营规划、术语词汇、项目计划等多种类型
- 文档内容涉及 PaddleOCR、飞桨生态，具有实际因果关系（技术调研→评估→规划→执行）
- 超出原计划5份，增加至6份，内容更丰富

---

### Step 2.2 — 上传文档触发实体抽取 ✅
**状态**：已完成
**完成时间**：2026-06-10
**操作**：
1. 通过 `/upload` API 上传 6 份 PDF 文档到后端
2. 通过 `/extract` API 逐一触发实体关系抽取（使用 DeepSeek LLM）
**抽取结果**：

| 文档 | 节点数 | 关系数 | 处理时间 |
|------|--------|--------|----------|
| 飞桨常用词汇.pdf | 32 | 62 | 9.2s |
| PP-OCRv6端侧载体部署可行性调研.pdf | 8 | 14 | ~10s |
| 5.13深圳倍加宝公司交流纪要.pdf | 3 | 4 | ~8s |
| Openclaw接入文心大模型效果初步评估.pdf | 3 | 4 | ~8s |
| 【运营规划】PaddleOCR头部项目集成计划.pdf | 88 | 207 | 38.7s |
| 专项：PaddleOCR头部项目集成计划🌟‼️.pdf | 3 | 4 | ~8s |
| **合计** | **137** | **295** | — |

**踩坑记录**：
- `token_chunk_size`、`chunk_overlap`、`chunks_to_combine` 参数在 API 中默认 None，必须显式传入（200, 20, 1）
- `embedding_provider` 和 `embedding_model` 也必须显式传入 `sentence-transformer` / `all-MiniLM-L6-v2`
- `docker-compose.yml` 中 `EMBEDDING_MODEL` 和 `EMBEDDING_PROVIDER` 默认值为空字符串，已修复为实际值
- DeepSeek API 不支持 `response_format`（structured output），代码已有检测逻辑（检查 `OPENAI_API_BASE` 中是否含 `deepseek`），容器重启后生效
- 抽取过程会删除 merged_files 中的文件，失败后重试需重新 upload

**代码改动**：
- `docker-compose.yml`：设置 `EMBEDDING_MODEL`、`EMBEDDING_PROVIDER`、`MAX_TOKEN_CHUNK_SIZE` 默认值

---

### Step 2.3 — 在 Neo4j 中验证抽取结果 ✅
**状态**：已完成
**完成时间**：2026-06-10
**验证结果**：
- ✅ 节点数 137（≥ 20 要求）
- ✅ 关系数 295（≥ 30 要求）
- 通过 `/sources_list` API 确认 6 份文档状态均为 Completed

---

### Step 2.4 — 前端模型选择修复 ✅
**状态**：已完成
**完成时间**：2026-06-11
**问题**：前端聊天框模型下拉列表不含 `openai_gpt_4o_mini`，显示的是默认的 `VITE_LLM_MODELS_PROD` 列表（diffbot、gemini等）
**原因**：`docker-compose.yml` 中 `VITE_LLM_MODELS` 的 build args 默认值为空，前端构建时未注入正确模型列表
**修复**：`docker-compose.yml` 第 58 行改为 `VITE_LLM_MODELS=${VITE_LLM_MODELS-openai_gpt_4o_mini}`
**操作**：`docker compose up --build -d frontend` 重建前端容器
**验证**：JS bundle 中包含 `openai_gpt_4o_mini`，前端模型选择正常

---

### 待解决问题（讨论中，未执行）

1. **图谱重复节点**：飞桨常用词汇.pdf 多次 upload 失败重试留下重复 Chunk 节点
   - 方案：清空 Neo4j → 重新抽取（一次性解决）
   - 根因：extract 失败时未传 `retry_condition=delete_entities_and_start_from_beginning`
2. **图谱结构太扁平**：Chunk/Document 结构节点与 Entity 节点混在一起显示
   - 方案：阶段三前端改造时过滤，只展示 Entity 节点
3. **关系标签英文**：DeepSeek 默认用英文抽取关系类型
   - 方案：重抽时在 `additional_instructions` 中指定用中文命名

---

## 阶段一+二 代码改动总结

**对 Fork 代码的改动**（共 4 处，`docker-compose.yml` 中）：
1. `backend/Dockerfile`：workers 8→2, threads 8→4（防 8GB 内存 OOM）
2. `backend/constraints.txt`：去掉 `+cpu` 后缀（Apple Silicon 兼容）
3. `docker-compose.yml`：EMBEDDING_MODEL/EMBEDDING_PROVIDER/MAX_TOKEN_CHUNK_SIZE 默认值
4. `docker-compose.yml`：VITE_LLM_MODELS 默认值设为 `openai_gpt_4o_mini`

**配置文件**（不在 git 中，通过 .env 管理）：
- `backend/.env`：Neo4j 连接 + DeepSeek API + 嵌入模型配置
- `frontend/.env`：后端 API 地址 + 模型选择 + 跳过认证
