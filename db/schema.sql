create table if not exists moments (
  id integer primary key autoincrement,
  content text not null,
  images text not null default '[]',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists idx_moments_created_at on moments (created_at desc);
