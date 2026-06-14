# progress.md — 开发进度记录

> 最后更新：2026-06-15

---

## 阶段一：后端环境部署 ✅ 已完成

- Neo4j AuraDB 免费实例已注册并连接正常
- llm-graph-builder 已 Clone 到 `~/Desktop/llm-graph-builder`
- Ollama 已安装（llama3:8b）
- 后端 `.env` 配置完成，Docker Compose 启动正常
- FastAPI 后端运行在 `http://localhost:8000`，Swagger 可访问
- `/health` 返回 `{"healthy": true}`

### 已记录的核心 API 端点

| 功能 | 方法 | 路由 |
|------|------|------|
| 健康检查 | GET | `/health` |
| 文档上传/抽取 | POST | `/extract` |
| 图谱查询 | POST | `/graph_query` |
| 问答聊天 | POST | `/chat_bot` |
| 文件列表 | POST | `/sources_list` |
| 邻居节点 | POST | `/get_neighbours` |
| Schema 可视化 | POST | `/schema_visualization` |

---

## 阶段二：数据灌入 ✅ 已完成

- 已上传文档（如 PP-OCRv6端侧载体部署可行性调研.pdf）
- 实体抽取完成：530 个实体节点，2142 条关系
- 使用 embedding 模型：all-MiniLM-L6-v2

---

## 阶段三：前端 UI 深色宇宙风格改造 ✅ 已完成

- [x] Step 3.1 — 前端启动正常（yarn dev → localhost:5173）
- [x] Step 3.2 — 定位到主题系统：NDL CSS Variables (`.ndl-theme-dark`)、ThemeWrapper.tsx
- [x] Step 3.3 — 深色主题配色覆盖（背景 #0a0a1a，主色金色 #f59e0b，强调色紫色 #c084fc）
- [x] Step 3.4 — 图谱节点霓虹色板 + 发光效果 + 深色背景 + 半透明连线
- [x] Step 3.5 — 对话界面深色气泡样式（AI 深灰底 / 用户金色半透明底 / 圆角 / 输入框深色）
- [x] Step 3.6 — 品牌替换（标题"Roots & Shoots · 知识宇宙"，移除 Neo4j Logo）
- [x] 额外 — GraphViewModal 图谱+问答并排布局
- [x] 额外 — 问答不受文件选择限制（skipFileFilter）
- [x] 额外 — 欢迎语改为项目名
- [x] 额外 — 隐藏 Neo4j connection 状态栏

---

## 阶段四：探索式浏览 ✅ 已完成

- [x] Step 4.1~4.2 — 采用方案 B（NVL 组件内实现），Bloom 不支持 iframe
- [x] Step 4.3 — 双击节点调用 `/get_neighbours` API 展开 2 跳邻居
- [x] Step 4.4 — 浏览历史栈 + 返回按钮（↩）
- [x] Step 4.5 — 加载状态指示（半透明遮罩 + spinner）

---

## 阶段五：多轮对话 + 图谱联动 ✅ 已完成

- [x] Step 5.1 — 多轮对话（后端 session_id 机制，已内置）
- [x] Step 5.2 — 从问答响应中提取 entity_ids
- [x] Step 5.3 — 图谱中高亮关联节点（activated + 放大 1.5x）
- [x] Step 5.4 — 高亮清除（双击探索时/新问答时自动清除）

---

## 阶段六：演示打磨 ✅ 已完成

- [x] Step 6.1 — 首次加载动画（splash screen fade-in/out）
- [x] Step 6.2 — 搜索框引导体验（placeholder 引导文案 + 焦点微动效）
- [x] Step 6.3 — 视觉一致性检查（修复 5 处白色/亮色残留）
- [x] Step 6.4 — 演示路径验证（7 步流程全部通过）
- [x] Step 6.5 — 最终构建验证（vite build 成功，preview 服务正常）

---

## 文档摘要功能 ✅ 已完成（2026-06-15）

- [x] 点击 Document 节点时，右侧属性面板自动调用 LLM 生成 3-5 句摘要
- [x] 使用 `fulltext` 模式调用 `/chat_bot` API（避免 graph 模式 Cypher 生成失败）
- [x] `useRef` 缓存已生成的摘要，避免重复请求
- [x] 加载动画（LoadingSpinner）+ 错误提示
- [x] 改动文件：`frontend/src/components/Graph/GraphPropertiesPanel.tsx`

---

## 已知问题

### Chat 的 vector/graph_vector 模式不可用

**错误**：`Unsupported provider/model: all-minilm-l6-v2/all-MiniLM-L6-v2`

**现状**：`mode=fulltext`（全文检索模式）问答正常工作。`mode=graph` 因 DeepSeek 生成无效 Cypher 而报错。`mode=vector` 和 `mode=graph_vector` 因 embedding provider 不匹配而报错。当前前端摘要功能使用 `fulltext` 模式。

**影响**：问答可用（fulltext 模式），演示够用。

---

## 第二轮修改：图谱质量优化 ✅ 已完成

> 完成日期：2026-06-14

### 问题描述

| # | 问题 | 现象 |
|---|------|------|
| 1 | 节点太碎 | LLM 把每个细节都拆成实体，图谱全是碎片小节点，看不出宏观知识结构 |
| 2 | 节点断链 | 同一文档内的实体互不相连，出现孤立节点，无法体现文档内容的关联性 |

### 修改内容

#### 后端：`backend/src/shared/constants.py`

- `ADDITIONAL_INSTRUCTIONS` 增加 5 条核心规则：粒度控制（15-30 实体/文档）、强制连通（0 孤立节点）、实体归一化、中文命名、层级结构
- `GRAPH_CHUNK_LIMIT` 从 50 降到 20

#### 前端：`frontend/src/utils/Constants.ts`

- 新增 `docCoreEntities` 查询模板：只展示 Document + 一跳核心实体（排除 Chunk 噪音，限制 50 路径）

### 抽取结果对比

| 文件 | 旧节点 | 新节点 | 旧关系 | 新关系 |
|------|--------|--------|--------|--------|
| PP-OCRv6端侧载体部署可行性调研.pdf | 679 | 109 | 2885 | 281 |
| 专项：PaddleOCR头部项目集成计划🌟‼️.pdf | 227 | 67 | 1486 | 150 |
| 【运营规划】PaddleOCR头部项目集成计划.pdf | 245 | 69 | 1693 | 179 |
| Openclaw 接入文心大模型效果初步评估.pdf | 163 | 52 | 919 | 114 |
| 5.13深圳倍加宝公司交流纪要.pdf | 74 | 40 | 379 | 84 |
| 飞桨常用词汇.pdf | 199 | 120 | 1067 | 222 |
| **总计** | **1587** | **457** | **8429** | **1030** |

- 节点减少 **71%**，关系减少 **88%**
- 孤立节点：**0**（全连通）
- 实体类型清晰：核心概念、技术方案、项目、组织等

