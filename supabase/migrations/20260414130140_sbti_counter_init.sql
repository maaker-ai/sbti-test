-- SBTI 海报编号 + 访客计数器
-- Schema 隔离：所有 SBTI 对象放在 sbti schema，不污染 public

CREATE SCHEMA IF NOT EXISTS sbti;
GRANT USAGE ON SCHEMA sbti TO anon, authenticated;

-- ============================================================
-- 表
-- ============================================================

-- 全局计数器（一行）
CREATE TABLE sbti.counter_global (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    value BIGINT NOT NULL
);
INSERT INTO sbti.counter_global (id, value) VALUES (1, 100);

-- 类型内计数器（按需 upsert）
CREATE TABLE sbti.counter_by_type (
    type_code TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
);

-- 完成流水（月报 + 重算用）
CREATE TABLE sbti.completions (
    id BIGSERIAL PRIMARY KEY,
    type_code TEXT NOT NULL,
    global_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sbti_completions_type ON sbti.completions(type_code);
CREATE INDEX idx_sbti_completions_created ON sbti.completions(created_at);

-- ============================================================
-- 公开 view（landing 页读总数）
-- ============================================================

CREATE OR REPLACE VIEW sbti.total_count AS
SELECT value AS total FROM sbti.counter_global WHERE id = 1;

-- ============================================================
-- 原子 RPC：完成测试 → 双编号
-- ============================================================

CREATE OR REPLACE FUNCTION sbti.complete(p_type_code TEXT)
RETURNS TABLE(global_id BIGINT, type_id BIGINT, type_code TEXT, date TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sbti, public
AS $$
#variable_conflict use_column
DECLARE
    g BIGINT;
    t BIGINT;
BEGIN
    -- 入参校验：type_code 不能空
    IF p_type_code IS NULL OR length(p_type_code) = 0 THEN
        RAISE EXCEPTION 'type_code required';
    END IF;

    -- 全局计数器 +1
    UPDATE sbti.counter_global
    SET value = value + 1
    WHERE id = 1
    RETURNING value INTO g;

    -- 类型内计数器 upsert +1
    INSERT INTO sbti.counter_by_type (type_code, value)
    VALUES (p_type_code, 1)
    ON CONFLICT (type_code) DO UPDATE SET value = sbti.counter_by_type.value + 1
    RETURNING value INTO t;

    -- 写流水
    INSERT INTO sbti.completions (type_code, global_id, type_id)
    VALUES (p_type_code, g, t);

    RETURN QUERY SELECT
        g,
        t,
        p_type_code,
        to_char(now() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD');
END;
$$;

-- ============================================================
-- 权限 + RLS
-- ============================================================

-- 启用 RLS：默认拒绝所有直接读写表
ALTER TABLE sbti.counter_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti.counter_by_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti.completions ENABLE ROW LEVEL SECURITY;
-- 不创建任何 policy = 默认全拒（service_role 例外，bypass RLS）

-- anon 只能：调 RPC + 查 view
GRANT EXECUTE ON FUNCTION sbti.complete(TEXT) TO anon, authenticated;
GRANT SELECT ON sbti.total_count TO anon, authenticated;

-- ============================================================
-- 注释
-- ============================================================
COMMENT ON SCHEMA sbti IS 'SBTI 海报编号 + 访客计数器（项目: maaker.cn/sbti）';
COMMENT ON TABLE sbti.counter_global IS '全局计数器，从 207 起算，每次 sbti.complete() +1';
COMMENT ON TABLE sbti.counter_by_type IS '类型内计数器，每次 sbti.complete() 对应类型 +1';
COMMENT ON TABLE sbti.completions IS '完成流水，月报 + 重算数据源';
COMMENT ON FUNCTION sbti.complete(TEXT) IS '原子事务：全局 +1，类型 +1，写流水，返回双编号 + 当日日期(UTC+8)';
COMMENT ON VIEW sbti.total_count IS '公开总数，landing 页用';
