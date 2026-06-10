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

## 阶段一完成总结

**对 Fork 代码的改动**（仅 2 个文件，均为部署适配，不影响业务逻辑）：
1. `backend/Dockerfile`：workers 8→2, threads 8→4（防 8GB 内存 OOM）
2. `backend/constraints.txt`：去掉 `+cpu` 后缀（Apple Silicon 兼容）

**配置文件**（不在 git 中，通过 .env 管理）：
- `backend/.env`：Neo4j 连接 + DeepSeek API + 嵌入模型配置
