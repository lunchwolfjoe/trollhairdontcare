-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create sample task categories if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_categories') THEN
        CREATE TABLE public.task_categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );

        -- Insert default categories
        INSERT INTO public.task_categories (name, description, festival_id)
        SELECT 'Setup', 'Tasks related to festival setup', id 
        FROM public.festivals 
        WHERE festivals.id = (SELECT id FROM public.festivals ORDER BY created_at DESC LIMIT 1);
        
        INSERT INTO public.task_categories (name, description, festival_id)
        SELECT 'Operations', 'Tasks related to festival operations', id 
        FROM public.festivals 
        WHERE festivals.id = (SELECT id FROM public.festivals ORDER BY created_at DESC LIMIT 1);
        
        INSERT INTO public.task_categories (name, description, festival_id)
        SELECT 'Cleanup', 'Tasks related to festival cleanup', id 
        FROM public.festivals 
        WHERE festivals.id = (SELECT id FROM public.festivals ORDER BY created_at DESC LIMIT 1);
    END IF;
END $$; 