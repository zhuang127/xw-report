# Supabase 云端配置指南

## 为什么需要 Supabase？

将数据存储从本地 IndexedDB 迁移到 Supabase 云端数据库后，4个门店可以：
- ✅ 在任何网络下实时同步数据
- ✅ 管理员随时查看所有门店汇总
- ✅ 数据永久保存在云端，换设备不丢失

---

## 第一步：创建 Supabase 项目

### 1. 注册账号
访问 [supabase.com](https://supabase.com) 并注册账号（使用 GitHub 或邮箱均可）

### 2. 创建新项目
1. 点击 "New Project"
2. 填写项目信息：
   - **Organization**: 选择或创建组织
   - **Name**: `changzhou-report`（可自定义）
   - **Database Password**: 设置强密码（**请牢记**）
   - **Region**: 选择 `Northeast Asia`（日本/韩国节点）或 `Southeast Asia`（新加坡节点）
3. 点击 "Create new project"
4. 等待项目创建（约2分钟）

---

## 第二步：获取连接信息

项目创建完成后，在项目设置中获取以下信息：

### 1. 获取 API URL
1. 进入 **Settings** → **API**
2. 找到 **Project URL**，类似：
   ```
   https://xxxxx-xxxxx.supabase.co
   ```

### 2. 获取 anon/public key
1. 在同一页面（API Settings）
2. 找到 **Project API keys** → **anon public**
3. 点击复制

---

## 第三步：创建数据表

在 Supabase 的 SQL Editor 中执行以下 SQL：

```sql
-- 创建日销售数据表
CREATE TABLE daily_records (
  id TEXT PRIMARY KEY,          -- 格式：日期_门店ID，如 "2024-01-15_downtown"
  date TEXT NOT NULL,           -- 日期：YYYY-MM-DD
  store_id TEXT NOT NULL,       -- 门店ID：downtown/newzone/hutang/factory
  sales REAL DEFAULT 0,          -- 销售额
  member_sales REAL DEFAULT 0,   -- 会员消费
  order_count INTEGER DEFAULT 0, -- 订单数
  month TEXT NOT NULL,          -- 月份：YYYY-MM
  updated_at BIGINT NOT NULL    -- 更新时间戳
);

-- 创建索引，加速查询
CREATE INDEX idx_records_date ON daily_records(date);
CREATE INDEX idx_records_store ON daily_records(store_id);
CREATE INDEX idx_records_month ON daily_records(month);
CREATE INDEX idx_records_store_date ON daily_records(store_id, date);

-- 启用 Row Level Security (RLS)
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（管理员和员工都需要查看）
CREATE POLICY "Allow read all" ON daily_records
  FOR SELECT USING (true);

-- 允许所有人写入/更新（实际权限由应用逻辑控制）
CREATE POLICY "Allow upsert all" ON daily_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update all" ON daily_records
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete all" ON daily_records
  FOR DELETE USING (true);
```

**复制以上 SQL，粘贴到 Supabase SQL Editor 中执行。**

---

## 第四步：配置应用

### 方法一：直接修改代码（推荐）

打开 `index.html`，找到以下行（在文件开头附近）：

```javascript
// ===== CONFIGURATION =====
// ... 在这里添加 Supabase 配置
```

将其替换为：

```javascript
// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon-public-key';
```

### 方法二：使用环境变量

如果是部署到服务器，可以设置：

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## 第五步：数据迁移（可选）

如果本地已有旧数据需要迁移：

1. 在原应用中点击 **设置** → **导出数据**，下载 JSON 文件
2. 在 Supabase Dashboard → Table Editor → daily_records
3. 点击 **Import data from CSV/JSON**
4. 上传备份文件

或者在 SQL Editor 中执行：

```sql
-- 批量插入（根据实际数据修改）
INSERT INTO daily_records (id, date, store_id, sales, member_sales, order_count, month, updated_at)
VALUES
  ('2024-01-15_downtown', '2024-01-15', 'downtown', 15000, 8000, 45, '2024-01', 1705312800000),
  -- 添加更多记录...
ON CONFLICT (id) DO UPDATE SET
  sales = EXCLUDED.sales,
  member_sales = EXCLUDED.member_sales,
  order_count = EXCLUDED.order_count,
  updated_at = EXCLUDED.updated_at;
```

---

## 权限说明

当前配置为**开放模式**：
- 所有知道 URL 的人都可以查看所有门店数据
- 所有知道 URL 的人都可以录入数据

### 如果需要更严格的权限控制

可以添加门店验证：

```sql
-- 为每个门店创建单独的写入策略（可选）
CREATE POLICY "Allow insert downtown" ON daily_records
  FOR INSERT WITH CHECK (
    auth.role() = 'anon' AND store_id = 'downtown'
  );
```

---

## 常见问题

### Q: Supabase 免费额度够用吗？
A: 免费额度：500MB 数据库、1GB 存储、50万月活跃用户。对于4个门店的日销售数据，完全够用。

### Q: 数据安全性如何？
A: Supabase 使用银行级加密（HTTPS + 静态数据加密），中小企业使用完全没问题。

### Q: 离线还能用吗？
A: 需要网络连接才能同步数据。如果需要离线支持，可以添加 Service Worker 缓存，但目前版本暂不支持。

### Q: 可以绑定自定义域名吗？
A: 免费版不支持，需要升级到 Pro 计划（$25/月）。

---

## 技术支持

如有问题，请检查：
1. API URL 是否正确（以 `.supabase.co` 结尾）
2. anon key 是否完整（以 `eyJ...` 开头）
3. SQL 是否执行成功
4. RLS 策略是否创建

---

## 更新日志

- **v2.0.0**: 支持云端同步，门店可在不同网络下使用
