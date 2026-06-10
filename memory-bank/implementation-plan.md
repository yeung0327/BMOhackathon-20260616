# implementation-plan.md — 分步实施计划

> 给 AI 开发者的逐步指令。每一步小而具体，含验证标准。严禁跳步。

---

## 阶段一：后端环境部署

### Step 1.1 — 注册 Neo4j AuraDB 免费实例

**指令**：在 https://console.neo4j.io 注册账号，创建一个 Free Tier 实例。记录 Bolt URI、用户名、密码。

**验证**：在 Neo4j Browser（网页版）中连接该实例，执行 `RETURN 1` 返回结果无报错。

---

### Step 1.2 — Fork llm-graph-builder 仓库

**指令**：在 GitHub 上 Fork `neo4j-labs/llm-graph-builder` 到个人账户，然后 Clone 到本地。

**验证**：本地目录存在 `backend/`、`frontend/` 文件夹，`docker-compose.yml` 存在。

---

### Step 1.3 — 配置 LLM（OpenAI API）

**指令**：获取 OpenAI API Key（https://platform.openai.com/api-keys），选用 GPT-4o-mini 模型。

**验证**：在终端中用 curl 测试 API Key 有效：
```bash
curl https://api.openai.com/v1/models -H "Authorization: Bearer <your-key>" | head -5
```
返回 JSON 模型列表即有效。

---

### Step 1.4 — 配置后端环境变量

**指令**：在 llm-graph-builder 项目中配置 `.env` 文件：
- `backend/.env`：填入 Neo4j 连接信息 + OpenAI API 配置
  ```
  NEO4J_URI=neo4j+s://ca425266.databases.neo4j.io
  NEO4J_USERNAME=neo4j
  NEO4J_PASSWORD=<password>
  NEO4J_DATABASE=neo4j
  LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI=gpt-4o-mini,<openai-api-key>
  ```
- `frontend/.env`：配置后端地址和模型选择
  ```
  VITE_BACKEND_API_URL=http://localhost:8000
  VITE_LLM_MODELS=openai_gpt_4o_mini
  VITE_SKIP_AUTH=true
  ```

**验证**：`.env` 文件存在，包含 NEO4J_URI、LLM_MODEL_CONFIG_OPENAI_GPT_4O_MINI 且值非空。

---

### Step 1.5 — Docker Compose 启动后端

**指令**：在项目根目录执行 `docker compose up --build -d`，等待所有服务启动完成。

**验证**：访问 `http://localhost:8000/docs`，能看到 FastAPI 自动生成的 Swagger 文档页面。

---

### Step 1.6 — 验证端到端连通性

**指令**：验证三个连接均正常：
1. `/connect` 端点返回 Success（Neo4j + 嵌入模型）
2. OpenAI API 可从容器内访问
3. 通过 Swagger 调用 `/chat_bot` 端点，确认 LLM 能响应

**验证**：
- `/connect` 返回 `{"status": "Success"}`
- `/chat_bot` 返回包含 answer 的 JSON（非超时、非认证错误）

---

## 阶段二：数据灌入与验证

### Step 2.1 — 准备测试文档

**指令**：准备 6 份测试 PDF 文档，内容涉及 PaddleOCR/飞桨生态，具有因果关系（技术调研→评估→规划→执行）。

**实际文档**：
1. `PP-OCRv6端侧载体部署可行性调研.pdf`
2. `Openclaw 接入文心大模型效果初步评估.pdf`
3. `5.13深圳倍加宝公司交流纪要.pdf`
4. `【运营规划】PaddleOCR头部项目集成计划.pdf`
5. `飞桨常用词汇.pdf`
6. `专项：PaddleOCR头部项目集成计划🌟‼️.pdf`

**验证**：✅ 本地桌面有 6 份 PDF 文件，格式正确可打开。

---

### Step 2.2 — 上传文档触发实体抽取

**指令**：通过 `/upload` API 上传文档，再通过 `/extract` API 触发 LLM 实体关系抽取。

**关键参数**（必须显式传入，否则报 NoneType 错误）：
```bash
curl -X POST http://localhost:8000/extract \
  --data-urlencode "uri=bolt+s://ca425266.databases.neo4j.io" \
  --data-urlencode "userName=neo4j" \
  --data-urlencode "password=<password>" \
  --data-urlencode "database=neo4j" \
  --data-urlencode "model=openai_gpt_4o_mini" \
  --data-urlencode "source_type=local file" \
  --data-urlencode "file_name=xxx.pdf" \
  --data-urlencode "language=chinese" \
  --data-urlencode "token_chunk_size=200" \
  --data-urlencode "chunk_overlap=20" \
  --data-urlencode "chunks_to_combine=1" \
  --data-urlencode "embedding_provider=sentence-transformer" \
  --data-urlencode "embedding_model=all-MiniLM-L6-v2"
```

**验证**：✅ 6 份文档全部 Completed，Docker 日志无报错。

---

### Step 2.3 — 在 Neo4j 中验证抽取结果

**指令**：通过 `/sources_list` API 或 Neo4j Browser 验证节点和关系数量。

**验证**：✅ 节点数 137（≥ 20），关系数 295（≥ 30）。无需进入 Step 2.4。

---

### Step 2.4 — 补充演示数据（如需）

**指令**：如 Step 2.3 中抽取质量不足，通过 Cypher 语句手动插入关键演示节点和关系，确保存在至少一条 3 节点以上的因果链。

**验证**：在 Neo4j Browser 中执行路径查询，能返回一条包含 ≥3 个节点的因果链路径。

---

### Step 2.5 — 验证图谱查询 API

**指令**：通过 curl 或 Swagger 调用图谱查询 API，传入一个已存在的节点关键词。

**验证**：API 返回 JSON，包含 nodes 数组（≥1 个元素）和 edges/relationships 数组。

---

### Step 2.6 — 验证问答 API

**指令**：通过 curl 或 Swagger 调用 chat API，提问一个能从图谱中回答的问题。

**验证**：API 返回包含 answer 字段（非空字符串）和 sources 字段（包含关联节点信息）。

---

## 阶段三：前端 UI 深色宇宙风格改造

### Step 3.1 — 启动官方前端

**指令**：进入 `frontend/` 目录，安装依赖（yarn install），配置 `.env`，启动开发服务器。

**验证**：浏览器访问 `http://localhost:5173`，能看到官方前端默认界面，无控制台报错。

---

### Step 3.2 — 定位全局样式入口

**指令**：在 frontend/src 中找到全局 CSS 文件和主题相关的 CSS Variables 定义位置。

**验证**：能列出当前所有 CSS 变量的定义位置。

---

### Step 3.3 — 覆盖全局配色为深色主题

**指令**：修改 CSS Variables，背景 #0a0a1a，前景 #e0e0e0，主色 #00d4ff，强调色 #a855f7。

**验证**：刷新页面，整体深色，文字浅色，对比度正常。

---

### Step 3.4 — 改造图谱区域样式

**指令**：节点添加 CSS 发光效果，按类型赋色，连线改为半透明浅色。

**验证**：图谱区域深色背景，节点有光晕，连线清晰，有"宇宙感"。

---

### Step 3.5 — 改造侧边栏对话界面样式

**指令**：对话背景深色，气泡区分用户/AI，输入框深色边框风格。

**验证**：侧边栏风格一致，消息可区分。

---

### Step 3.6 — 替换品牌元素

**指令**：标题改为"Roots & Shoots · 知识宇宙"，移除 Neo4j 品牌。

**验证**：页面显示项目名称，无第三方 Logo。

---

## 阶段四：探索式浏览功能

### Step 4.1 — 定位节点点击事件处理
### Step 4.2 — 实现点击节点重新查询子图
### Step 4.3 — 添加浏览历史栈和返回按钮
### Step 4.4 — 添加加载状态指示

---

## 阶段五：多轮对话 + 图谱联动

### Step 5.1 — 确认对话组件的多轮能力
### Step 5.2 — 从问答响应中提取关联节点
### Step 5.3 — 在图谱中高亮关联节点
### Step 5.4 — 高亮清除逻辑
### Step 5.5 — 答案来源可点击

---

## 阶段六：演示打磨

### Step 6.1 — 添加首次加载动画
### Step 6.2 — 搜索框引导体验
### Step 6.3 — 视觉一致性检查
### Step 6.4 — 演示路径验证
### Step 6.5 — 最终构建验证

---

## Commit 规范

每完成一个 Step，立即 commit：
```
格式：阶段X Step X.X: [具体完成内容]
示例：阶段三 Step 3.3: 全局配色覆盖为深色主题
```
