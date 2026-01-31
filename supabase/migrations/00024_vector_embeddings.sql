-- Vector Embeddings for RAG Chatbot
-- Uses pgvector for semantic search on community content

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- CONTENT EMBEDDINGS TABLE
-- ============================================

CREATE TABLE content_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Content reference
  content_type TEXT NOT NULL, -- 'post', 'lesson', 'resource', 'comment'
  content_id UUID NOT NULL,
  
  -- Embedding data
  chunk_index INTEGER NOT NULL DEFAULT 0, -- For long content split into chunks
  chunk_text TEXT NOT NULL, -- The actual text that was embedded
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  
  -- Metadata for filtering
  metadata JSONB DEFAULT '{}', -- title, author, visibility, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(content_type, content_id, chunk_index)
);

-- Indexes for fast retrieval
CREATE INDEX idx_embeddings_community ON content_embeddings(community_id);
CREATE INDEX idx_embeddings_content ON content_embeddings(content_type, content_id);
CREATE INDEX idx_embeddings_community_type ON content_embeddings(community_id, content_type);

-- Vector similarity search index (IVFFlat for approximate NN)
CREATE INDEX idx_embeddings_vector ON content_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- CHAT HISTORY TABLE
-- ============================================

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]', -- Referenced content for citations
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_community ON chat_sessions(community_id);
CREATE INDEX idx_chat_sessions_profile ON chat_sessions(profile_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);

-- ============================================
-- VECTOR SEARCH FUNCTION
-- ============================================

-- Search for similar content using cosine similarity
CREATE OR REPLACE FUNCTION search_content_embeddings(
  query_embedding vector(1536),
  community_uuid UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  content_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id UUID,
  chunk_text TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.content_type,
    ce.content_id,
    ce.chunk_text,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) as similarity
  FROM content_embeddings ce
  WHERE ce.community_id = community_uuid
    AND (content_types IS NULL OR ce.content_type = ANY(content_types))
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Embeddings: Service role only (for indexing)
CREATE POLICY "Service role can manage embeddings"
  ON content_embeddings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Chat sessions: Users can only see their own
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE clerk_user_id = requesting_user_id()
    )
  );

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE clerk_user_id = requesting_user_id()
    )
  );

-- Chat messages: Users can see messages in their sessions
CREATE POLICY "Users can view messages in their sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE profile_id IN (
        SELECT id FROM profiles 
        WHERE clerk_user_id = requesting_user_id()
      )
    )
  );

CREATE POLICY "Users can add messages to their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE profile_id IN (
        SELECT id FROM profiles 
        WHERE clerk_user_id = requesting_user_id()
      )
    )
  );
