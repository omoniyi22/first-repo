
-- Add governing_body column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN governing_body TEXT;
