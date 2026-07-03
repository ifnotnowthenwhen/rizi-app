# 日子 — 极简生活管理 Web App 设计文档

## 概述

**日子** 是一款面向毕业求职阶段年轻人的极简生活管理 Web App。核心理念不是提高效率，而是帮助用户感受到："生活正在缓慢而稳定地向前流动。"

### 目标用户

- 刚毕业或处于人生过渡期的人
- 容易因为缺乏外部结构而陷入空虚和拖延
- 需要温和的节奏感和正反馈，而不是高压效率工具

### 设计风格

- 温暖、治愈、安静
- 日系手账、纸张、木质桌面、柔和灯光的感觉
- 避免强烈商业感和 KPI 感

## 配色方案

| 色名 | 色值 | 用途 |
|------|------|------|
| 米白 | `#F5F0E8` | 背景(主色调) |
| 暖灰 | `#E8E0D0` | 边框/分隔线 |
| 浅棕 | `#D4C5A9` | 次要元素/已完成标记 |
| 淡绿 | `#A8B5A2` | 进度条/成功状态/强调色 |
| 深棕 | `#8B7E74` | 次级文字 |
| 焦糖 | `#6B5B4F` | 主文字/标题 |

## 页面结构

### 全局导航

底部 Tab 栏，三个标签页：

| 图标 | 标签 | 路径 | 说明 |
|------|------|------|------|
| 🌱 | 一日 | `/` | 今日打卡主页 |
| 📅 | 一周 | `/weekly` | 周统计与记录回顾 |
| 👀 | 回顾 | `/today` | 今日已做/可做事项 |

### 1. 主页 (`/`)

- **日期显示**：当前日期（年.月.日 星期）
- **问候语**："熙言，你好"
- **今日流动度**：进度条 `N/4`，四个模块各占 1/4
- **模块完成规则**：每个模块当日记录任意一条操作即计为完成（得 1 分），同一模块多次操作不重复计分
- **四个模块卡片**（2×2 网格）：
  - 💼 工作
  - 📖 输入
  - 🧘 身体
  - ✨ 痕迹
- 已完成的卡片 → 降低透明度，显示"已完成"
- 未完成的卡片 → 无额外文字
- 点击未完成的模块卡片 → 弹出操作弹窗
- 每完成一个模块 → 反馈文案更新（底部常驻区域，默认显示"生活流动在当下。"，完成模块后切换为对应反馈文案）

### 2. 工作弹窗（点击 💼 工作 触发）

**Plan 模式**（每天第一次点击，或完成后的循环）：
- 标题：**"今天计划做什么？"**
- 固定选项（可多选）：
  1. 📌 收藏 5 个岗位
  2. 📬 投递 5 份简历
  3. 📝 修改简历
  4. 🎨 修改作品集
  5. + 干点别的（自定义输入）
- 点击「定下计划」保存

**Done 模式**（计划后再次点击）：
- 标题：**"实际完成了什么？"**
- 只显示计划过的选项
- 每个选项可勾选 ✓ 标记完成
- 带数字的选项支持点击编辑 ✏️（如计划"投递5份简历"，实际投了10份可改为10）
- 点击「更新完成」保存

**完成循环**：至少完成一项 → 模块计为完成。完成后仍可继续 Plan → Done 循环。

反馈文案：*"主线任务推进了一小步。"*

### 3. 输入弹窗（点击 📖 输入 触发）

**Plan 模式**：
- 标题：**"今天想学点什么？"**
- 固定选项（可多选）：
  1. 📚 阅读
  2. 💡 学习
  3. 🎬 看课程
  4. 🔍 看案例
  5. + 干点别的（自定义输入）
- 点击「定下计划」保存

**Done 模式**：
- 标题：**"今天学了什么？"**
- 只显示计划过的选项
- 每个选项可勾选 ✓ 标记完成
- 时长数字可编辑 ✏️（如计划30分钟实际读了45分钟）
- 每条可填写具体内容（如"《三体》"、"React Hooks"）
- 点击「更新完成」保存

反馈文案：*"今天的你又比昨天多看见了一点世界。"*

### 4. 身体弹窗（点击 🧘 身体 触发）

**Plan 模式**：
- 标题：**"今天想怎么动？"**
- 固定选项（可多选）：
  1. 🚶 散步
  2. 🚴 骑车
  3. 🤸 健身操
  4. + 干点别的（自定义输入）
- 点击「定下计划」保存

**Done 模式**：
- 标题：**"今天做了什么运动？"**
- 只显示计划过的选项
- 每个选项可勾选 ✓ 标记完成
- 时长数字可编辑 ✏️
- 无额外内容输入
- 点击「更新完成」保存

反馈文案：*"身体也参与了今天的生活。"*

### 5. 痕迹弹窗（点击 ✨ 痕迹 触发）

**Plan 模式**：
- 标题：**"今天想留下什么痕迹？"**
- 固定选项（可多选）：
  1. 📔 日记
  2. ✍️ 写作
  3. 🧹 家务
  4. + 干点别的（自定义输入）
- 点击「定下计划」保存

**Done 模式**：
- 标题：**"今天留下的痕迹是什么？"**
- 只显示计划过的选项
- 每个选项可勾选 ✓ 标记完成
- 每条可填写具体描述（如"今天心情很好"、"打扫了客厅和厨房"）
- 点击「更新完成」保存

反馈文案：*"世界因为你的行动发生了一点变化。"*

### 6. 一周页 (`/weekly`)

- **周标题**：第 N 周 + 日期范围
- **本周流动度**：`X / 28`（每周最多 28 次打卡：4 模块 × 7 天）
  - 大数字进度显示 + 线性渐变进度条
  - 鼓励语："每一天都在缓慢地向前流动。"
- **每日打卡概览**：周一到周日小方块，显示当天完成的模块数（0-4）
  - 有数据的日：绿/棕底色显示数字
  - 未完成的日：虚线框显示 —
- **各模块明细**（自动汇总本周已完成的所有记录）：
  - 💼 工作 → 具体做了什么（如"收藏了 3 个岗位"、"投递了 10 份简历"）
  - 📖 输入 → 具体学了什么（如"阅读《设计中的设计》30 分钟"）
  - 🧘 身体 → 具体运动记录（如"散步 20 分钟"）
  - ✨ 痕迹 → 具体痕迹描述（如"打扫了客厅和厨房"）
- 自定义输入的内容同样自动展示
- 底部提示："无论如何，我为你感到骄傲。"

### 7. 回顾页 (`/today`)

- **日期标题**
- **已完成的区块**（左侧绿色装饰条）：
  - 已完成记录列表（含时间戳）
  - 显示今日进度（如 1/4）
  - 无记录时显示空状态提示
- **还可以做区块**（左侧棕色装饰条）：
  - 按四个模块分别以白色卡片展示
  - 每个模块内：已完成选项显示灰色 ✓，未完成选项显示虚线可点击
- 底部温和提醒（斜体）：*选你想做的就好，不做完也没关系*

## 核心交互流程

### Plan → Done 循环

每个模块遵循相同的交互模式：

```
第一次点击 → Plan 模式（选今天的小目标）→ 定下计划
再次点击  → Done 模式（勾选实际完成的）→ 更新完成 → 模块 ✓
完成后继续 → 回到 Plan 模式（再加新目标）→ 无限循环
```

- 模块完成条件：至少完成一项即算完成
- 模块完成后仍可继续 Plan → Done
- 已完成模块在首页以半透明状态显示"已完成"

## 数据模型

### LocalStorage 结构

```typescript
// 根 key: "日子-app-data"
interface AppData {
  records: DayRecord[];
}

interface DayRecord {
  date: string; // "YYYY-MM-DD"
  modules: {
    job: {
      completed: boolean;
      plans: JobPlan[];     // 计划的内容
      dones: JobDone[];     // 实际完成的内容
    };
    input: {
      completed: boolean;
      plans: InputPlan[];
      dones: InputDone[];
    };
    body: {
      completed: boolean;
      plans: BodyPlan[];
      dones: BodyDone[];
    };
    trace: {
      completed: boolean;
      plans: TracePlan[];
      dones: TraceDone[];
    };
  };
}

interface JobPlan {
  type: 'collect' | 'submit' | 'resume' | 'portfolio' | 'custom';
  customText?: string;
  timestamp: string;
}

interface JobDone {
  type: 'collect' | 'submit' | 'resume' | 'portfolio' | 'custom';
  count?: number;       // 编辑后的实际数量
  customText?: string;
  timestamp: string;
}

interface InputPlan {
  type: 'read' | 'study' | 'course' | 'case' | 'custom';
  customText?: string;
  timestamp: string;
}

interface InputDone {
  type: 'read' | 'study' | 'course' | 'case' | 'custom';
  duration: number;     // 编辑后的实际分钟数
  content?: string;     // 具体内容（如"《三体》"）
  customText?: string;
  timestamp: string;
}

interface BodyPlan {
  type: 'walk' | 'bike' | 'exercise' | 'custom';
  customText?: string;
  timestamp: string;
}

interface BodyDone {
  type: 'walk' | 'bike' | 'exercise' | 'custom';
  duration: number;     // 编辑后的实际分钟数
  customText?: string;
  timestamp: string;
}

interface TracePlan {
  type: 'diary' | 'write' | 'chore' | 'custom';
  customText?: string;
  timestamp: string;
}

interface TraceDone {
  type: 'diary' | 'write' | 'chore' | 'custom';
  description?: string; // 具体描述
  customText?: string;
  timestamp: string;
}
```

## 技术方案

| 层 | 技术 | 说明 |
|---|------|------|
| 框架 | React 18+ | |
| 语言 | TypeScript | |
| 构建工具 | Vite | |
| 样式 | Tailwind CSS | |
| 路由 | 状态驱动（无需 React Router，三个 Tab 切换） | |
| 状态持久化 | LocalStorage | 封装 `useLocalStorage` hook |
| 动画 | Tailwind + 少量 CSS animation | 进度条过渡、反馈文案浮现、弹窗动效 |

### 项目结构

```
日子/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx               # 主应用 + Tab 路由
    ├── index.css             # Tailwind + 自定义全局样式
    ├── types/
    │   └── index.ts          # 数据模型类型定义
    ├── hooks/
    │   ├── useLocalStorage.ts # LocalStorage 读写封装
    │   └── useToday.ts       # 今日数据相关 hook
    ├── components/
    │   ├── BottomNav.tsx      # 底部 Tab 导航
    │   ├── ProgressBar.tsx    # 进度条组件
    │   ├── ModuleCard.tsx     # 模块卡片组件
    │   ├── FeedbackBanner.tsx # 反馈文案横幅
    │   ├── JobModal.tsx       # 工作弹窗（Plan + Done）
    │   ├── InputModal.tsx     # 输入弹窗
    │   ├── BodyModal.tsx      # 身体弹窗
    │   ├── TraceModal.tsx     # 痕迹弹窗
    │   ├── DurationPicker.tsx # 时长编辑组件
    │   └── EditableTag.tsx    # 可编辑文本标签
    ├── pages/
    │   ├── HomePage.tsx       # 一日页（首页）
    │   ├── WeeklyPage.tsx     # 一周页
    │   └── TodayPage.tsx      # 回顾页
    └── utils/
        ├── date.ts            # 日期工具函数
        └── storage.ts         # LocalStorage 数据操作
```

### 关键设计决策

1. **Plan → Done 循环**：每个模块采用"先定计划→再完成→可循环"的交互模式，鼓励用户设定小目标并记录实际成果，同时消除"未完成"的压力。

2. **弹窗代替跳转**：四个模块的操作使用 Modal 弹窗而非页面跳转，保持用户在首页的沉浸感。

3. **反馈文案常驻**：底部反馈区域始终显示，默认文案"生活流动在当下。"，完成模块后临时切换为对应反馈文案，数秒后恢复默认。

4. **无惩罚机制**：严格避免连续签到、断签惩罚、未完成警告。进度条只有正向反馈。

5. **手机优先**：使用 Tailwind 的移动优先 breakpoint。

6. **数据层抽象**：通过 `useLocalStorage` hook 和 `storage.ts` 封装所有 LocalStorage 操作，后续迁移到数据库时只需替换这一层。

## 动画与微交互

| 元素 | 动画 | 触发 |
|------|------|------|
| 进度条 | 宽度过渡 `transition-all duration-500` | 模块完成时 |
| 反馈文案切换 | 淡出 0.2s → 新文案 → 淡入 0.3s | 模块完成时 |
| 弹窗 | 蒙版渐入 + 内容上滑 0.25s | 打开/关闭时 |
| 页面切换 | 左/右滑入 0.2s | Tab 切换时 |
| 已完成卡片 | 不透明度降至 0.5 + 显示"已完成" | 完成时 |
| 选项勾选 | 复选框动画 + 文案变灰 | 勾选时 |

## 反馈文案汇总

| 模块 | 反馈文案 |
|------|----------|
| 💼 工作 | "主线任务推进了一小步。" |
| 📖 输入 | "今天的你又比昨天多看见了一点世界。" |
| 🧘 身体 | "身体也参与了今天的生活。" |
| ✨ 痕迹 | "世界因为你的行动发生了一点变化。" |
| 默认状态 | "生活流动在当下。" |
| 一周页底部 | "无论如何，我为你感到骄傲。" |
| 回顾页底部 | *选你想做的就好，不做完也没关系* |

## 未纳入范围（V1 不做）

- 用户登录/认证
- 云端同步
- 推送通知
- 自定义主题
- 数据导出
- 多语言

## 后续迁移路径

- LocalStorage → IndexedDB（更大容量）
- IndexedDB → 远程 API（配合后端）
- 可扩展的数据层在 `storage.ts` 中隔离
