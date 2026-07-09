-- CreatorDeal Database Schema
-- Run this in Supabase SQL Editor

-- 用户表（扩展Supabase Auth）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 品牌表
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交易表
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'inquiry' CHECK (stage IN (
    'inquiry', 'negotiate', 'signed', 'creating', 
    'review', 'published', 'paid', 'closed'
  )),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  content_type TEXT,
  content_deadline TIMESTAMPTZ,
  payment_deadline TIMESTAMPTZ,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交付物表
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'submitted', 'approved', 'rejected'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 合同表
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  ai_summary JSONB,
  risks JSONB,
  key_terms JSONB,
  usage_rights JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 发票表
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  )),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  stripe_invoice_id TEXT,
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知表
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'deadline', 'payment', 'system', 'deal_update'
  )),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 费率历史表
CREATE TABLE rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  follower_count INTEGER,
  engagement_rate DECIMAL(5,2),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_content_deadline ON deals(content_deadline);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_rate_history_user_id ON rate_history(user_id);

-- RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Brands policies
CREATE POLICY "Users can view own brands" ON brands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brands" ON brands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brands" ON brands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brands" ON brands FOR DELETE USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view own deals" ON deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deals" ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals" ON deals FOR DELETE USING (auth.uid() = user_id);

-- Deliverables policies
CREATE POLICY "Users can view own deliverables" ON deliverables FOR SELECT 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deliverables.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can create own deliverables" ON deliverables FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM deals WHERE deals.id = deliverables.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can update own deliverables" ON deliverables FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deliverables.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can delete own deliverables" ON deliverables FOR DELETE 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deliverables.deal_id AND deals.user_id = auth.uid()));

-- Contracts policies
CREATE POLICY "Users can view own contracts" ON contracts FOR SELECT 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = contracts.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can create own contracts" ON contracts FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM deals WHERE deals.id = contracts.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can update own contracts" ON contracts FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = contracts.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can delete own contracts" ON contracts FOR DELETE 
  USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = contracts.deal_id AND deals.user_id = auth.uid()));

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Rate history policies
DROP POLICY IF EXISTS "Users can view own rate history" ON rate_history;
CREATE POLICY "Users can view own rate history" ON rate_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own rate history" ON rate_history;
CREATE POLICY "Users can create own rate history" ON rate_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rate history" ON rate_history;
CREATE POLICY "Users can update own rate history" ON rate_history FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rate history" ON rate_history;
CREATE POLICY "Users can delete own rate history" ON rate_history FOR DELETE USING (auth.uid() = user_id);

-- 触发器：自动创建用户profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
