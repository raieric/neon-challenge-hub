
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User birthdays table
CREATE TABLE public.user_birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthday DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_birthdays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own birthdays" ON public.user_birthdays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birthdays" ON public.user_birthdays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own birthdays" ON public.user_birthdays
  FOR DELETE USING (auth.uid() = user_id);

-- User wheel options table
CREATE TABLE public.user_wheel_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(270, 80%, 55%)',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wheel_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wheel options" ON public.user_wheel_options
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wheel options" ON public.user_wheel_options
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wheel options" ON public.user_wheel_options
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wheel options" ON public.user_wheel_options
  FOR DELETE USING (auth.uid() = user_id);
