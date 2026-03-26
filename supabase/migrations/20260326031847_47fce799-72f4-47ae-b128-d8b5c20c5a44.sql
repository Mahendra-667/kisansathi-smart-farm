
-- Land listings
CREATE TABLE public.land_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  acres NUMERIC NOT NULL,
  crop_type TEXT NOT NULL,
  rent_amount NUMERIC NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read land listings" ON public.land_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own land listings" ON public.land_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own land listings" ON public.land_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Machine listings
CREATE TABLE public.machine_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  machine_type TEXT NOT NULL,
  location TEXT NOT NULL,
  available_dates TEXT NOT NULL,
  price_per_day NUMERIC NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.machine_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read machine listings" ON public.machine_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own machine listings" ON public.machine_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own machine listings" ON public.machine_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Farm jobs
CREATE TABLE public.farm_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  work_type TEXT NOT NULL,
  work_date DATE NOT NULL,
  location TEXT NOT NULL,
  workers_needed INTEGER NOT NULL,
  wage_per_day NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farm_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read farm jobs" ON public.farm_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own farm jobs" ON public.farm_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own farm jobs" ON public.farm_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Organic market listings
CREATE TABLE public.organic_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  contact TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organic_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read organic listings" ON public.organic_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own organic listings" ON public.organic_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own organic listings" ON public.organic_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
