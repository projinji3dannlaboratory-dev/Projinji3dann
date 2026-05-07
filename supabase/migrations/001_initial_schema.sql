-- 日本上場企業 年収ランキング - 初期スキーマ
-- Supabase Postgres / Free tier (500MB)
-- 想定規模: companies ~4,000 / employee_stats ~4,000 (年1スナップショット、5年で20,000)

set search_path = public;

create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- ────────────────────────────────────────────────────────
-- マスター: 業種 (東証33業種)
-- ────────────────────────────────────────────────────────
create table industries (
    code        smallint primary key,            -- 東証33業種コード (50, 1050, 2050 等)
    name_ja     text not null,                   -- 例: 情報・通信業
    name_en     text,
    sort_order  smallint not null default 0
);

-- ────────────────────────────────────────────────────────
-- マスター: 企業
-- ────────────────────────────────────────────────────────
create table companies (
    edinet_code      char(7) primary key,            -- E + 6 digits
    sec_code         char(5) unique,                  -- 5-digit ticker (4 + check)
    ticker4          char(4) generated always as (substring(sec_code from 1 for 4)) stored,
    name_ja          text not null,
    name_en          text,
    industry_code    smallint references industries(code),
    market           text,                            -- 'プライム' | 'スタンダード' | 'グロース' | null
    headquarters     text,
    established_year smallint,
    homepage_url     text,
    last_seen_at     timestamptz not null default now(),
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index idx_companies_industry on companies(industry_code);
create index idx_companies_market on companies(market);
create index idx_companies_name_trgm on companies using gin (name_ja gin_trgm_ops);
create index idx_companies_name_en_trgm on companies using gin (name_en gin_trgm_ops);

-- ────────────────────────────────────────────────────────
-- 従業員データ (年度スナップショット)
-- 単体ベース (NonConsolidated) を採用 (有報の慣行)
-- ────────────────────────────────────────────────────────
create table employee_stats (
    id                       bigserial primary key,
    edinet_code              char(7) not null references companies(edinet_code) on delete cascade,
    fiscal_year              smallint not null,              -- 例: 2024 (2024年3月期 → 2024)
    period_end               date not null,
    avg_age_years            numeric(4,1),                   -- 例: 41.2
    avg_tenure_years         numeric(4,1),                   -- 例: 12.5
    avg_annual_salary_yen    bigint,                         -- 円単位
    employee_count           integer,
    doc_id                   text not null,                  -- EDINET docID (再取得トレース用)
    submitted_at             timestamptz,
    source_url               text,                           -- EDINET 原本リンク
    created_at               timestamptz not null default now(),
    constraint uq_company_year unique (edinet_code, fiscal_year)
);

create index idx_stats_company on employee_stats(edinet_code);
create index idx_stats_year on employee_stats(fiscal_year);
create index idx_stats_salary on employee_stats(avg_annual_salary_yen desc nulls last);

-- ────────────────────────────────────────────────────────
-- 業種 × 年度 集計 (スコア計算とフィルタの参照用)
-- バッチ後に集計クエリで再生成
-- ────────────────────────────────────────────────────────
create table industry_aggregates (
    industry_code           smallint not null references industries(code),
    fiscal_year             smallint not null,
    company_count           integer not null,
    avg_salary_yen          bigint,
    median_salary_yen       bigint,
    avg_age_years           numeric(4,1),
    median_age_years        numeric(4,1),
    salary_p25_yen          bigint,
    salary_p75_yen          bigint,
    age_p25_years           numeric(4,1),
    age_p75_years           numeric(4,1),
    salary_stddev_yen       bigint,
    age_stddev_years        numeric(4,1),
    refreshed_at            timestamptz not null default now(),
    primary key (industry_code, fiscal_year)
);

-- ────────────────────────────────────────────────────────
-- スコア (年度ごとに事前計算しておきフロントは読むだけ)
-- ────────────────────────────────────────────────────────
create table company_scores (
    edinet_code              char(7) not null references companies(edinet_code) on delete cascade,
    fiscal_year              smallint not null,
    raw_score                numeric(7,2),                   -- 独自スコア (50=業界平均)
    grade                    char(1),                        -- S/A/B/C/D
    salary_deviation         numeric(5,2),                   -- 年収偏差値 (業界内)
    age_deviation            numeric(5,2),                   -- 年齢偏差値 (業界内、若いほど高い)
    industry_correction      numeric(5,2),                   -- 業界補正係数
    rank_overall             integer,
    rank_in_industry         integer,
    rank_in_market           integer,
    refreshed_at             timestamptz not null default now(),
    primary key (edinet_code, fiscal_year)
);

create index idx_scores_year_grade on company_scores(fiscal_year, grade);
create index idx_scores_overall on company_scores(fiscal_year, rank_overall);
create index idx_scores_raw_score on company_scores(fiscal_year, raw_score desc nulls last);

-- ────────────────────────────────────────────────────────
-- バッチ実行履歴
-- ────────────────────────────────────────────────────────
create table batch_runs (
    id              bigserial primary key,
    started_at      timestamptz not null default now(),
    finished_at     timestamptz,
    status          text not null default 'running',  -- running | success | partial | failed
    target_period_start date,
    target_period_end   date,
    fetched_docs    integer default 0,
    inserted_rows   integer default 0,
    updated_rows    integer default 0,
    skipped_rows    integer default 0,
    failed_rows     integer default 0,
    error_summary   text
);

-- ────────────────────────────────────────────────────────
-- ビュー: フロントが直接読む統合ビュー
-- ────────────────────────────────────────────────────────
create view v_company_latest as
select
    c.edinet_code,
    c.sec_code,
    c.ticker4,
    c.name_ja,
    c.name_en,
    c.market,
    c.headquarters,
    c.homepage_url,
    i.code as industry_code,
    i.name_ja as industry_name,
    s.fiscal_year,
    s.period_end,
    s.avg_age_years,
    s.avg_tenure_years,
    s.avg_annual_salary_yen,
    s.employee_count,
    s.source_url,
    sc.raw_score,
    sc.grade,
    sc.salary_deviation,
    sc.age_deviation,
    sc.industry_correction,
    sc.rank_overall,
    sc.rank_in_industry,
    sc.rank_in_market
from companies c
left join industries i on c.industry_code = i.code
left join lateral (
    select * from employee_stats es
    where es.edinet_code = c.edinet_code
    order by fiscal_year desc
    limit 1
) s on true
left join company_scores sc
    on sc.edinet_code = c.edinet_code
   and sc.fiscal_year = s.fiscal_year;

-- ────────────────────────────────────────────────────────
-- updated_at 自動更新
-- ────────────────────────────────────────────────────────
create or replace function tg_set_updated_at() returns trigger
language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger trg_companies_updated_at
    before update on companies
    for each row execute function tg_set_updated_at();
