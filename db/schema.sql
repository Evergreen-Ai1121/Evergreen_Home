-- ⚠️ src/lib/db.ts 里有一份等价的内联建表语句（运行时自动执行），改这里请同步改那里
create table if not exists moments (
  id integer primary key autoincrement,
  content text not null,
  images text not null default '[]',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists idx_moments_created_at on moments (created_at desc);

create table if not exists comments (
  id integer primary key autoincrement,
  slug text not null,
  parent_id integer,
  nickname text not null,
  email text,
  content text not null,
  status text not null default 'pending',
  created_at text not null default (datetime('now'))
);

create index if not exists idx_comments_slug on comments (slug, status, created_at);
