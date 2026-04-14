-- SBTI staging schema —— prod 数据隔离用
-- 跟 sbti schema 完全镜像，初始值 0（staging 测多少都不影响生产）

CREATE SCHEMA IF NOT EXISTS sbti_staging;
GRANT USAGE ON SCHEMA sbti_staging TO anon, authenticated;

CREATE TABLE sbti_staging.counter_global (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    value BIGINT NOT NULL
);
INSERT INTO sbti_staging.counter_global (id, value) VALUES (1, 0);

CREATE TABLE sbti_staging.counter_by_type (
    type_code TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE sbti_staging.completions (
    id BIGSERIAL PRIMARY KEY,
    type_code TEXT NOT NULL,
    global_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sbti_staging_completions_type ON sbti_staging.completions(type_code);
CREATE INDEX idx_sbti_staging_completions_created ON sbti_staging.completions(created_at);

CREATE OR REPLACE VIEW sbti_staging.total_count AS
SELECT value AS total FROM sbti_staging.counter_global WHERE id = 1;

CREATE OR REPLACE FUNCTION sbti_staging.complete(p_type_code TEXT)
RETURNS TABLE(global_id BIGINT, type_id BIGINT, type_code TEXT, date TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sbti_staging, public
AS $$
#variable_conflict use_column
DECLARE
    g BIGINT;
    t BIGINT;
BEGIN
    IF p_type_code IS NULL OR length(p_type_code) = 0 THEN
        RAISE EXCEPTION 'type_code required';
    END IF;
    UPDATE sbti_staging.counter_global SET value = value + 1 WHERE id = 1 RETURNING value INTO g;
    INSERT INTO sbti_staging.counter_by_type (type_code, value) VALUES (p_type_code, 1)
        ON CONFLICT (type_code) DO UPDATE SET value = sbti_staging.counter_by_type.value + 1
        RETURNING value INTO t;
    INSERT INTO sbti_staging.completions (type_code, global_id, type_id) VALUES (p_type_code, g, t);
    RETURN QUERY SELECT g, t, p_type_code, to_char(now() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD');
END;
$$;

ALTER TABLE sbti_staging.counter_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti_staging.counter_by_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti_staging.completions ENABLE ROW LEVEL SECURITY;

GRANT EXECUTE ON FUNCTION sbti_staging.complete(TEXT) TO anon, authenticated;
GRANT SELECT ON sbti_staging.total_count TO anon, authenticated;

COMMENT ON SCHEMA sbti_staging IS 'SBTI staging schema（隔离生产数据）';
