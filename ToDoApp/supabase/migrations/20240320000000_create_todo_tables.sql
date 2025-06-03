-- Create todo_lists table
CREATE TABLE IF NOT EXISTS public.todo_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create todo_items table
CREATE TABLE IF NOT EXISTS public.todo_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID REFERENCES public.todo_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for todo_lists
CREATE POLICY "Lists: owner only" ON public.todo_lists
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for todo_items
CREATE POLICY "Items: owner only" ON public.todo_items
    FOR ALL
    USING (auth.uid() = (SELECT user_id FROM public.todo_lists WHERE id = list_id))
    WITH CHECK (auth.uid() = (SELECT user_id FROM public.todo_lists WHERE id = list_id)); 