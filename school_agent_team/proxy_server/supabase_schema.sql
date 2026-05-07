-- Personal Learning Agent Supabase schema
-- Supabase SQL Editor에서 그대로 실행하세요.

create table if not exists topics (
  id bigint generated always as identity primary key,
  category text not null,
  name text not null,
  description text,
  goal text,
  target_level text,
  current_level text,
  duration_value text,
  duration_unit text,
  learning_style text,
  progress_percent integer default 0,
  current_stage text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agents (
  id bigint generated always as identity primary key,
  slug text unique,
  name text not null,
  role text,
  description text,
  agent_type text check (agent_type in ('response', 'background')),
  category_group text,
  is_default boolean default false
);

create table if not exists topic_agents (
  id bigint generated always as identity primary key,
  topic_id bigint references topics(id) on delete cascade,
  agent_id bigint references agents(id) on delete cascade,
  is_enabled boolean default true,
  unique(topic_id, agent_id)
);

create table if not exists lessons (
  id bigint generated always as identity primary key,
  topic_id bigint references topics(id) on delete cascade,
  title text,
  user_input text,
  ai_response text,
  summary text,
  used_agents text,
  created_at timestamptz default now()
);

create table if not exists progress_logs (
  id bigint generated always as identity primary key,
  topic_id bigint references topics(id) on delete cascade,
  lesson_id bigint references lessons(id) on delete set null,
  previous_progress integer,
  new_progress integer,
  stage text,
  progress_note text,
  created_at timestamptz default now()
);

create table if not exists archive_notes (
  id bigint generated always as identity primary key,
  topic_id bigint references topics(id) on delete cascade,
  lesson_id bigint references lessons(id) on delete set null,
  category text,
  subcategory text,
  title text,
  content text,
  file_path text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  topic_id bigint references topics(id) on delete cascade,
  name text,
  description text,
  status text,
  progress_percent integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_topics_updated_at on topics(updated_at desc);
create index if not exists idx_lessons_topic_created on lessons(topic_id, created_at desc);
create index if not exists idx_archive_topic_created on archive_notes(topic_id, created_at desc);
create index if not exists idx_progress_topic_created on progress_logs(topic_id, created_at desc);
