# DESIGN.md — Roots & Shoots 知识宇宙

## References

- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md 规范参考
- [React Bits](https://github.com/topics/react-bits) — 动态背景与 UI 动效组件库
- [reactbits.dev](https://reactbits.dev) — React Bits 文档与组件预览

---

## 1. Visual Theme & Atmosphere

- **Mood**: 深邃宇宙感 — 纯黑/深蓝背景，节点像星星发光，连线像星座，整体安静深邃
- **Density**: 中等密度，留白充分，让图谱呼吸
- **Philosophy**: 科技感与探索感并存，用户在知识宇宙中漫游

---

## 2. Color Palette & Roles

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | 深蓝黑 | `#0a0a1a` | 页面主背景 |
| Surface | 深紫蓝 | `#0f0f23` | 卡片、侧栏、弹窗背景 |
| Surface Elevated | 深灰蓝 | `#1a1a3a` | 悬浮元素、输入框背景 |
| Primary | 金色 | `#f59e0b` | 按钮、链接、标题高亮、节点发光 |
| Accent | 粉紫 | `#c084fc` | 次要高亮、状态指示、节点分类色之一 |
| Text Primary | 浅白 | `#e8e8f0` | 正文文字 |
| Text Secondary | 灰白 | `#9ca3af` | 辅助文字、描述 |
| Border | 深灰 | `#2a2a4a` | 分割线、卡片边框 |
| Success | 绿色 | `#10b981` | 成功状态 |
| Danger | 红色 | `#ef4444` | 错误、删除 |
| User Bubble | 金色半透明 | `rgba(245,158,11,0.15)` | 用户消息气泡背景 |
| AI Bubble | 深灰 | `#1e1e3a` | AI 回复气泡背景 |

### Node Category Colors (图谱节点按类型着色)

| Category | Color | Glow |
|----------|-------|------|
| 默认/概念 | `#f59e0b` (金) | `0 0 12px #f59e0b` |
| 技术/工具 | `#00d4ff` (青蓝) | `0 0 12px #00d4ff` |
| 人物/组织 | `#c084fc` (粉紫) | `0 0 12px #c084fc` |
| 事件/动作 | `#10b981` (绿) | `0 0 12px #10b981` |
| 文档/来源 | `#64748b` (灰) | `0 0 8px #64748b` |

---

## 3. Typography Rules

| Level | Font | Size | Weight | Color |
|-------|------|------|--------|-------|
| H1 (品牌标题) | JetBrains Mono | 20px | 700 | `#f59e0b` |
| H2 (区域标题) | JetBrains Mono | 16px | 600 | `#e8e8f0` |
| Body | JetBrains Mono | 14px | 400 | `#e8e8f0` |
| Caption/Label | JetBrains Mono | 12px | 400 | `#9ca3af` |
| Node Label | JetBrains Mono | 11px | 500 | `#e8e8f0` |

- **Font family**: `'JetBrains Mono', 'Fira Code', 'SF Mono', monospace`
- **中文 fallback**: `'PingFang SC', 'Microsoft YaHei', sans-serif`

---

## 4. Component Stylings

### Buttons

```css
/* Primary */
background: #f59e0b;
color: #0a0a1a;
border-radius: 8px;
font-weight: 600;
/* Hover */
background: #d97706;
box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
/* Secondary/Ghost */
background: transparent;
border: 1px solid #2a2a4a;
color: #e8e8f0;
/* Secondary Hover */
border-color: #f59e0b;
color: #f59e0b;
```

### Cards & Panels

```css
background: #0f0f23;
border: 1px solid #2a2a4a;
border-radius: 8px;
/* Elevated (hover/active) */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
```

### Input Fields

```css
background: #1a1a3a;
border: 1px solid #2a2a4a;
border-radius: 8px;
color: #e8e8f0;
/* Focus */
border-color: #f59e0b;
box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
```

### Chat Bubbles

```css
/* User message */
background: rgba(245, 158, 11, 0.15);
border: 1px solid rgba(245, 158, 11, 0.3);
border-radius: 8px;
/* AI message */
background: #1e1e3a;
border: 1px solid #2a2a4a;
border-radius: 8px;
```

---

## 5. Layout Principles

- **Structure**: 三栏布局 — 左侧文档列表 | 中间图谱可视化 | 右侧对话侧栏
- **Spacing scale**: 4px 基础单位 (4, 8, 12, 16, 24, 32, 48)
- **Max content width**: 无限制（图谱全宽）
- **Sidebar width**: 左侧 64px (collapsed) / 280px (expanded)，右侧 320-400px
- **Header height**: 56px
- **Whitespace philosophy**: 宽松留白，让深色背景成为设计的一部分

---

## 6. Depth & Elevation

| Level | Usage | Shadow |
|-------|-------|--------|
| 0 | 页面背景 | none |
| 1 | 卡片、侧栏 | `0 2px 8px rgba(0,0,0,0.3)` |
| 2 | 弹窗、下拉菜单 | `0 4px 20px rgba(0,0,0,0.5)` |
| 3 | 节点发光 | `0 0 12px <node-color>` |

---

## 7. Graph Visualization

### Nodes
- **Shape**: 圆形，发光圆点
- **Size**: 默认半径 6-10px，重要节点 12-16px
- **Glow**: `box-shadow: 0 0 12px <category-color>`
- **按类型着色**: 见 Node Category Colors 表

### Edges (连线)
- **Style**: 半透明细线
- **Width**: 1px
- **Color**: `rgba(255, 255, 255, 0.2)`
- **不抢节点视觉焦点**

### Background
- **微弱星空粒子效果**: 小圆点随机分布，缓慢漂移
- **粒子颜色**: `rgba(255, 255, 255, 0.05)` 到 `rgba(255, 255, 255, 0.15)`
- **数量**: 50-80 个粒子，性能优先

---

## 8. Do's and Don'ts

### Do's ✅
- 使用深色背景让发光效果突出
- 保持文字高对比度（浅色文字在深色背景上）
- 节点发光效果克制，不刺眼
- 交互反馈用颜色变化 + 微弱发光
- 留白充分，不挤压

### Don'ts ❌
- 不要用纯白色背景或大面积亮色
- 不要让动画过于激烈或频繁
- 不要用超过 5 种节点颜色（会混乱）
- 不要让连线比节点更抢眼
- 不要使用圆角超过 12px

---

## 9. Responsive Behavior

- **Target**: Desktop only (1280px+)，黑客松演示用
- **Minimum width**: 1024px
- **不需要移动端适配**

---

## 10. Animation & Motion

### Background Particles (星空效果)
- **实现**: 纯 CSS 或轻量 canvas
- **粒子**: 50-80 个微小圆点
- **运动**: 缓慢随机漂移，速度 0.1-0.3px/frame
- **不影响性能**

### Interactions
- **Hover**: 150ms ease-out transition
- **Click feedback**: scale(0.97) → scale(1)
- **Node hover**: 光晕增强 50%

---

## 11. Agent Prompt Guide

**Quick color reference for AI agents:**
```
Background: #0a0a1a
Surface: #0f0f23
Primary (gold): #f59e0b
Accent (purple): #c084fc
Text: #e8e8f0
Border: #2a2a4a
```

**When generating UI components, follow these rules:**
1. All backgrounds must be dark (#0a0a1a to #1a1a3a range)
2. Primary actions use gold (#f59e0b)
3. Font is always JetBrains Mono / monospace
4. Border radius is 8px for all interactive elements
5. Use box-shadow glow for emphasis, not background color
6. Graph nodes glow with their category color
7. Keep animations subtle and performance-friendly
</content>
</invoke>