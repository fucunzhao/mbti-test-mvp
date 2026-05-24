-- =============================================
-- MBTI 故事测 - Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中粘贴执行
-- =============================================

-- 1. 用户表（微信小程序登录）
CREATE TABLE public.users (
    id BIGSERIAL PRIMARY KEY,
    openid TEXT UNIQUE NOT NULL,
    nick_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.users IS '微信小程序用户';

-- 2. 答题记录表
CREATE TABLE public.answers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('quick', 'full')),
    answers JSONB NOT NULL DEFAULT '[]',
    result_type TEXT NOT NULL,
    ei TEXT NOT NULL,
    sn TEXT NOT NULL,
    tf TEXT NOT NULL,
    jp TEXT NOT NULL,
    ei_score INTEGER NOT NULL,
    sn_score INTEGER NOT NULL,
    tf_score INTEGER NOT NULL,
    jp_score INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.answers IS '答题记录（含结果）';
CREATE INDEX idx_answers_user_id ON public.answers(user_id);

-- 3. 订单表
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    answer_id BIGINT REFERENCES public.answers(id) ON DELETE CASCADE,
    out_trade_no TEXT UNIQUE NOT NULL,      -- 商户订单号
    transaction_id TEXT DEFAULT '',          -- 微信支付订单号
    amount INTEGER NOT NULL DEFAULT 99,     -- 金额：分（0.99元 = 99）
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'refunded', 'closed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.orders IS '支付订单';
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_out_trade_no ON public.orders(out_trade_no);

-- 4. 结果解锁记录
CREATE TABLE public.unlocks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    answer_id BIGINT REFERENCES public.answers(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.unlocks IS '解锁记录';
CREATE INDEX idx_unlocks_user_id ON public.unlocks(user_id);

-- 5. Row Level Security（行级安全）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的数据
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (id = current_user_id());

CREATE POLICY "answers_select_own" ON public.answers
    FOR SELECT USING (user_id = current_user_id());
CREATE POLICY "answers_insert_own" ON public.answers
    FOR INSERT WITH CHECK (user_id = current_user_id());

CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (user_id = current_user_id());
CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT WITH CHECK (user_id = current_user_id());

-- 注意：以上RLS策略依赖 current_user_id() 函数，
-- 需要在 Supabase 中设置自定义声明或改用 auth.uid()
-- 参考：https://supabase.com/docs/guides/auth/row-level-security
