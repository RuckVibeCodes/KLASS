-- Add image support to quiz questions and options

-- Add image_url to questions
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to options (for visual answer choices)
ALTER TABLE quiz_options
ADD COLUMN IF NOT EXISTS image_url TEXT;
