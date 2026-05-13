create extension if not exists pgcrypto;

create table if not exists users (
	id uuid primary key default gen_random_uuid(),
	email text not null unique,
	name text,
	password_hash text not null,
	is_verified boolean not null default false,
	verification_token text,
	verification_token_expires_at timestamptz,
	reset_token text,
	reset_token_expires_at timestamptz,
	refresh_token_hash text,
	refresh_token_expires_at timestamptz,
	login_attempts integer not null default 0,
	locked_until timestamptz,
	token_version integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint users_login_attempts_nonnegative check (login_attempts >= 0),
	constraint users_token_version_nonnegative check (token_version >= 0)
);

create unique index if not exists users_email_lower_idx on users (lower(email));
create index if not exists users_verification_token_idx on users (verification_token);
create index if not exists users_reset_token_idx on users (reset_token);
create index if not exists users_refresh_token_hash_idx on users (refresh_token_hash);
create index if not exists users_locked_until_idx on users (locked_until);
create index if not exists users_created_at_idx on users (created_at desc);