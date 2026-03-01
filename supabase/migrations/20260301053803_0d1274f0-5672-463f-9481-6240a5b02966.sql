
-- User quiz questions table
CREATE TABLE public.user_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz questions" ON public.user_quiz_questions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz questions" ON public.user_quiz_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz questions" ON public.user_quiz_questions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quiz questions" ON public.user_quiz_questions
  FOR DELETE USING (auth.uid() = user_id);

-- User code snippets table
CREATE TABLE public.user_code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  code TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own code snippets" ON public.user_code_snippets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own code snippets" ON public.user_code_snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own code snippets" ON public.user_code_snippets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own code snippets" ON public.user_code_snippets
  FOR DELETE USING (auth.uid() = user_id);
