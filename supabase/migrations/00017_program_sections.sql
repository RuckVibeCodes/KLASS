-- ============================================
-- PROGRAM SECTIONS (Course Modules)
-- ============================================
-- Adds a middle layer: Program → Section → Lesson
-- Sections act as "modules" or "chapters" within a course/program

CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_sections_program ON program_sections(program_id);
CREATE INDEX idx_program_sections_order ON program_sections(program_id, order_index);

-- Add section_id to lessons (nullable for backwards compatibility)
ALTER TABLE lessons ADD COLUMN section_id UUID REFERENCES program_sections(id) ON DELETE SET NULL;
CREATE INDEX idx_lessons_section ON lessons(section_id);

-- Trigger for updated_at
CREATE TRIGGER program_sections_updated_at BEFORE UPDATE ON program_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE program_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view sections for programs they can see
CREATE POLICY "sections_select" ON program_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_sections.program_id
      AND (
        (programs.published = true AND can_view_content(programs.visibility, programs.community_id))
        OR is_community_admin(programs.community_id)
      )
    )
  );

-- Admins can manage sections
CREATE POLICY "sections_all_admin" ON program_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_sections.program_id
      AND is_community_admin(programs.community_id)
    )
  );
