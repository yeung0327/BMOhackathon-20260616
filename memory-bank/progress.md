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

### Step 2.4 — 后端代码优化（抽取质量+幂等性）✅
**状态**：已完成
**完成时间**：2026-06-11

#### 2.4.1 — 失败重试自动清理（防重复节点）✅
**改动位置**：`backend/src/main.py` 第 496-499 行（`processing_source` 函数内）
**逻辑**：获取文档状态后，如果 Status == Failed 且未指定 retry_condition，自动执行 `QUERY_TO_DELETE_EXISTING_ENTITIES` 清理旧实体
**代码**：
```python
if len(result) > 0 and result[0]['Status'] == 'Failed' and params.retry_condition in ["", None]:
    logging.info(f"Auto-cleanup: file {params.file_name} was Failed, deleting existing entities before retry")
    execute_graph_query(graph, QUERY_TO_DELETE_EXISTING_ENTITIES, params={"filename": params.file_name})
```

#### 2.4.2 — chunk_size 自适应文档长度（防短文档碎片化）✅
**改动位置**：`backend/src/main.py` 第 730-734 行（`get_chunkId_chunkDoc_list` 函数内）
**逻辑**：如果文档总字符数 < token_chunk_size × 4 × 3（约3个chunk的量），自动放大 token_chunk_size 使整篇作为一个 chunk
**代码**：
```python
total_text_len = sum(len(p.page_content) for p in pages)
if total_text_len < token_chunk_size * 4 * 3:
    token_chunk_size = max(token_chunk_size, total_text_len // 4 + 1)
    logging.info(f"Short document ({total_text_len} chars), adaptive token_chunk_size={token_chunk_size}")
```

#### 2.4.3 — MAX_TOKEN_CHUNK_SIZE 默认值修复 ✅
**改动位置**：`docker-compose.yml` 第 30 行
**原因**：`MAX_TOKEN_CHUNK_SIZE=200` 导致 `chunk_to_be_created = 200/200 = 1`，Non-Neo4j 用户被限制只能创建 1 个 chunk
**修复**：`MAX_TOKEN_CHUNK_SIZE` 默认值从 200 改为 10000

**验证结果**（交流纪要文档重新抽取）：
| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 节点数 | 3 | **64** |
| 关系数 | 4 | **120** |
| 实体节点 | — | **55** |
| 实体间关系 | — | **43** |
| 日志确认 | — | `Short document (1772 chars), adaptive token_chunk_size=444` |

---

### Step 2.5 — 关系标签中文化 ✅
**状态**：已完成
**完成时间**：2026-06-11
**改动位置**：`backend/src/shared/constants.py` 第 884-887 行
**改动内容**：在 `ADDITIONAL_INSTRUCTIONS` 常量末尾追加中文指令：
```
请务必使用中文命名所有关系类型（如：属于、开发了、依赖于、包含、用于、基于），绝对不要使用英文命名关系。实体名称也必须使用中文。
```
**效果**：所有后续 extract 操作的 LLM 实体抽取都会强制使用中文关系标签，无需每次手动传 `additional_instructions` 参数。
**部署方式**：`docker cp` + `docker compose restart`（因构建缓存被清导致无法 `--build`，改为手动复制文件进容器）
**注意**：`PART_OF`、`NEXT_CHUNK` 等系统内部关系是代码硬编码的结构性关系（Document→Chunk→Chunk），不受 LLM 控制，无法改为中文——这些在前端展示时可隐藏。

---

### 待解决问题

#### 问题：图谱结构扁平（星状辐射）— 待实施
**根因**：`chunks_to_combine=1`，LLM 每次只看 1 个 chunk，无法识别跨段落因果链
**解法**：extract 时设 `chunks_to_combine=5`，让 LLM 一次看更多上下文
**状态**：待清空重抽时一并解决（Step 2.6）

---

## 阶段一+二 代码改动总结

**对 Fork 代码的改动**（共 7 处）：
1. `backend/Dockerfile`：workers 8→2, threads 8→4（防 8GB 内存 OOM）
2. `backend/constraints.txt`：去掉 `+cpu` 后缀（Apple Silicon 兼容）
3. `docker-compose.yml`：EMBEDDING_MODEL/EMBEDDING_PROVIDER 默认值
4. `docker-compose.yml`：VITE_LLM_MODELS 默认值设为 `openai_gpt_4o_mini`
5. `docker-compose.yml`：MAX_TOKEN_CHUNK_SIZE 默认值从 200 改为 10000（防 Non-Neo4j 用户 chunk 数被限制为 1）
6. `backend/src/main.py`：
   - `processing_source` 函数：Failed 状态自动清理旧实体（第 496-499 行）
   - `get_chunkId_chunkDoc_list` 函数：短文档自适应 chunk_size（第 730-734 行）
7. `backend/src/shared/constants.py`：ADDITIONAL_INSTRUCTIONS 追加中文关系标签指令（第 887 行）

**配置文件**（不在 git 中，通过 .env 管理）：
- `backend/.env`：Neo4j 连接 + DeepSeek API + 嵌入模型配置
- `frontend/.env`：后端 API 地址 + 模型选择 + 跳过认证

**部署注意**：
- 构建缓存已被 `docker system prune` 清除，8GB Mac 无法从头 build（OOM）
- 当前通过 `docker cp` + `docker compose restart` 手动同步代码到容器
- 下次需要完整 build 时，需先在 Docker Desktop 临时调高内存到 6GB
