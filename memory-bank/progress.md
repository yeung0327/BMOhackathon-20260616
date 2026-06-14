# progress.md — 开发进度记录

> 最后更新：2026-06-14

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

## 已知问题

### Chat 的 vector/graph_vector 模式不可用

**错误**：`Unsupported provider/model: all-minilm-l6-v2/all-MiniLM-L6-v2`

**现状**：`mode=graph`（纯图谱模式）问答正常工作，`mode=vector` 和 `mode=graph_vector` 因 embedding provider 不匹配而报错。当前前端默认使用 graph_vector_fulltext 模式。

**影响**：问答可用（graph 模式），但检索精度可能不如 vector 模式。演示够用。

---

## 第二轮修改：图谱质量优化

> 讨论日期：2026-06-14

### 问题描述

| # | 问题 | 现象 |
|---|------|------|
| 1 | 节点太碎 | LLM 把每个细节都拆成实体，图谱全是碎片小节点，看不出宏观知识结构 |
| 2 | 节点断链 | 同一文档内的实体互不相连，出现孤立节点，无法体现文档内容的关联性 |

### 修改方案

#### 问题 1 — 节点太碎

**后端**：修改 `backend/src/shared/constants.py` 的 `ADDITIONAL_INSTRUCTIONS`，减少碎片实体，提高抽取质量

**前端**：修改初始图谱展示逻辑
- 当前：打开图 → 加载全部实体（上千节点一团乱麻）
- 目标：打开图 → 只看到 6 个文档节点 + 围绕它们的核心主题 → 双击某个主题 → 展开细节子图
- 涉及文件：`GraphViewModal.tsx`，修改初始查询为只拉 Document 节点 + 一跳核心实体

#### 问题 2 — 节点断链

**只改后端 `ADDITIONAL_INSTRUCTIONS`**，让 LLM 做到：
1. 只抽核心实体（粒度控制）— 每段文本只抽取项目、产品、技术方案、组织、人物等核心概念
2. 每个实体必须与其他实体有关系（强制连通）— 找不到直接关联时通过文档主题作为桥梁
3. 同一概念统一命名（实体归一化）— 不同表述统一为一个实体名

### 复杂度评估

| 改动 | 涉及文件 | 难度 | 预计耗时 |
|------|----------|------|----------|
| 后端指令修改 | `backend/src/shared/constants.py`（1处文字） | ⭐ 极低 | 5 分钟 |
| 清空 Neo4j + 重新抽取 | 无代码，API 操作 | ⭐ 低 | 10-15 分钟 |
| 前端初始视图改为文档+核心主题 | `GraphViewModal.tsx` + `Constants.ts` | ⭐⭐⭐ 中等 | 30-60 分钟 |

### 执行顺序

1. 改后端指令 → docker cp + restart
2. 清空 Neo4j → 重新 upload + extract
3. 等待抽取期间改前端初始视图
4. 验证图谱效果

### 状态：待执行

