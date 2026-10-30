CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(60),
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email));

CREATE TABLE user_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX user_sessions_expiration_idx ON user_sessions (expires_at);

CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE,
  slug VARCHAR(70) NOT NULL UNIQUE,
  description VARCHAR(240),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(140) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  genre VARCHAR(100) NOT NULL DEFAULT '',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  price_label VARCHAR(40),
  rating_override NUMERIC(2,1) CHECK (rating_override IS NULL OR rating_override BETWEEN 0 AND 5),
  cover_image TEXT NOT NULL DEFAULT '',
  release_date DATE,
  release_status VARCHAR(20) NOT NULL DEFAULT 'released' CHECK (release_status IN ('released', 'upcoming', 'delisted')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX games_category_idx ON games (category_id);
CREATE INDEX games_release_idx ON games (release_status, release_date DESC);
CREATE INDEX games_featured_idx ON games (is_featured, release_date DESC) WHERE is_published = TRUE;
CREATE INDEX games_name_search_idx ON games USING GIN (TO_TSVECTOR('simple', name || ' ' || description || ' ' || genre));

CREATE TABLE library_items (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(20) NOT NULL DEFAULT 'purchase' CHECK (source IN ('purchase', 'free', 'admin', 'gift')),
  PRIMARY KEY (user_id, game_id)
);
CREATE INDEX library_game_idx ON library_items (game_id);

CREATE TABLE purchases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  provider VARCHAR(40),
  provider_reference VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX purchases_user_idx ON purchases (user_id, created_at DESC);

CREATE TABLE wishlist_items (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, game_id)
);
CREATE INDEX wishlist_game_idx ON wishlist_items (game_id);

CREATE TABLE reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR(2000) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);
CREATE INDEX reviews_game_idx ON reviews (game_id, created_at DESC);

CREATE TABLE contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message VARCHAR(5000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX contact_messages_status_idx ON contact_messages (status, created_at DESC);

INSERT INTO categories (name, slug, description) VALUES
  ('Ação', 'acao', 'Jogos focados em combate, ritmo e desafio.'),
  ('Puzzle', 'puzzle', 'Jogos de lógica, estratégia e resolução de desafios.'),
  ('Aventura', 'aventura', 'Histórias e mundos para explorar.'),
  ('Relax', 'relax', 'Experiências tranquilas para jogar no seu ritmo.')
ON CONFLICT (slug) DO NOTHING;
