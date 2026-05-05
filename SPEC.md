# 常州图文快印4门店日销售协作报表系统

## 1. Concept & Vision

一款专为常州图文快印连锁店打造的**手机端优先**日销售协作报表工具。管理员可实时查看4个门店数据，门店员工扫码填写，数据自动汇总，图表清晰直观，导出即打即用。整体风格：**专业、简洁、高效**，让管理者在手机上就能掌握全局。

## 2. Design Language

- **Aesthetic**: 企业级SaaS工具风，干净利落，数据可视化为核心
- **Color Palette**:
  - Primary: `#2563EB` (品牌蓝)
  - Secondary: `#1E40AF` (深蓝)
  - Accent: `#F59E0B` (琥珀/提醒)
  - Success: `#10B981`
  - Danger: `#EF4444`
  - Background: `#F1F5F9`
  - Card: `#FFFFFF`
  - Text Primary: `#1E293B`
  - Text Secondary: `#64748B`
  - Border: `#E2E8F0`
- **Typography**: "PingFang SC", "Helvetica Neue", Arial, sans-serif
- **Spatial System**: 8px base grid，间距8/12/16/24/32px
- **Motion**: 300ms ease transitions, slide-up panels, fade-in charts
- **Icons**: Emoji + SVG混用，保证清晰度

## 3. Layout & Structure

### 页面结构（手机端）
1. **首页/登录页** - 角色选择（管理员/员工扫码入口）
2. **管理员视角**:
   - 底部Tab导航：📊总览 | 📝录入 | 📈图表 | 🖨️导出
   - 总览页：4门店卡片 + 今日汇总 + 月度小计
   - 录入页：日期选择 + 4门店表单
   - 图表页：柱状图 + 折线图 + 月度数据表
   - 导出页：A4报表预览 + 打印/保存
3. **员工视角**:
   - 单门店表单填写（扫码进入对应门店）
   - 提交成功反馈

### 响应式策略
- 基准：375px宽度（iPhone SE/8）
- 最大宽度：480px（居中显示）
- 所有元素最小触摸目标：44px × 44px

## 4. Features & Interactions

### 核心功能

#### 4.1 门店管理
- 4个固定门店，字段不同：
  - **市区店/新区店/湖塘店**: 销售额(¥)、会员消费(¥)、订单数量
  - **工厂店**: 销售额(¥)、订单数量
- 门店颜色标识：
  - 市区店: `#2563EB`
  - 新区店: `#10B981`
  - 湖塘店: `#F59E0B`
  - 工厂店: `#8B5CF6`

#### 4.2 数据录入
- 日期选择器（默认当天，支持修改）
- 每个门店独立表单区块
- 实时计算：当日总销售额 = Σ(各店销售额)
- 自动保存到本地（IndexedDB）
- 提交后显示汇总数据

#### 4.3 数据汇总
- **日汇总**: 总销售额、总会员消费、总订单数、各店占比
- **月汇总**: 月度总销售额、月度总会员消费、各店贡献占比
- **图表**:
  - 柱状图：4门店销售额对比
  - 折线图：每日销售趋势（当月）
  - 所有图表使用Canvas绘制，适配手机清晰度

#### 4.4 报表导出
- 生成A4尺寸(210mm×297mm)报表图片
- 内容：报表标题、日期、汇总数据表、各店明细、图表
- 使用html2canvas + jsPDF方案
- 支持直接打印和保存图片

#### 4.5 权限管理
- **管理员**: 完整权限，查看所有数据，导出报表
- **员工**: 仅自己门店的录入权限，扫码进入指定门店

#### 4.6 PWA支持
- manifest.json配置
- Service Worker离线缓存
- 添加到手机桌面
- 数据通过localStorage持久化

## 5. Component Inventory

### 5.1 StoreCard（门店卡片）
- 门店名+颜色标识
- 今日数据：销售额、会员消费、订单数
- 状态：正常（白底）、今日未填（灰底虚线）、超标（红角标）

### 5.2 InputField（输入框）
- 大触摸区域(高度≥48px)
- 数字键盘触发
- 单位标签(¥/单)
- 实时校验（正数、最大值限制）

### 5.3 DatePicker（日期选择器）
- 日历视图
- 快捷按钮：今天、昨天
- 选中日期高亮

### 5.4 ChartCanvas（图表画布）
- 柱状图/折线图
- 支持触摸查看数据点
- 自动适配手机DPR（高清）

### 5.5 TabBar（底部导航）
- 4个Tab，每个44px高
- 当前Tab高亮+图标放大
- 标签文字14px

### 5.6 Modal（弹窗）
- 底部滑入
- 半透明遮罩
- 关闭按钮

### 5.7 A4ReportPreview（报表预览）
- 模拟A4纸张比例
- 缩放显示
- 打印按钮

## 6. Technical Approach

### 前端
- 纯HTML5 + CSS3 + Vanilla JS（零依赖，便于PWA）
- IndexedDB存储数据（支持大量历史记录）
- Canvas API绘制图表（高清、灵活）
- html2canvas + jsPDF生成PDF报表

### 数据模型
```javascript
// 门店数据
Store {
  id: string,        // 'downtown' | 'newzone' | 'hutang' | 'factory'
  name: string,
  hasMemberSales: boolean  // 市区/新区/湖塘有，工厂无
}

// 日销售记录
DailyRecord {
  id: string,        // YYYY-MM-DD_storeId
  date: string,      // YYYY-MM-DD
  storeId: string,
  sales: number,     // 销售额
  memberSales: number, // 会员消费（无则为0）
  orderCount: number  // 订单数
}

// 月度汇总
MonthlySummary {
  month: string,     // YYYY-MM
  totalSales: number,
  totalMemberSales: number,
  totalOrders: number,
  byStore: { [storeId]: { sales, memberSales, orders } }
}
```

### 存储方案
- IndexedDB: `changzhou_print_reports`
- 表: `daily_records`, `settings`
- 支持数据导出/导入（JSON格式备份）

### PWA配置
- manifest.json: standalone显示模式
- Service Worker: 缓存所有静态资源
- 图标: 4种尺寸PNG

## 7. 文件结构

```
changzhou-report/
├── index.html          # 主应用（完整单文件）
├── manifest.json       # PWA配置
├── sw.js               # Service Worker
├── icon-192.png        # PWA图标(192px)
├── icon-512.png        # PWA图标(512px)
└── README.md           # 使用说明
```
