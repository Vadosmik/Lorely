-- === EXTENSIONS === --
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- === ROLE SYSTEM === --
CREATE TABLE role (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(50) UNIQUE NOT NULL
);

-- === USERS === --
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  avatar_path TEXT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pass_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE user_role (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- === STORY_STATUS === --
CREATE TABLE story_status (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  title_ru VARCHAR(100) NOT NULL
);

CREATE TABLE reading_status (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  title_ru VARCHAR(100) NOT NULL
);

-- === STORY === --
CREATE TABLE story (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_path VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  age_rating INT,
  status_id INT NOT NULL REFERENCES story_status(id),
  story_json_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- === READ === --
CREATE TABLE read_history (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id INT NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  status_id INT NOT NULL REFERENCES reading_status(id),
  history TEXT[] NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, story_id)
);

-- === CATEGORY === --
CREATE TABLE category (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  title_ru VARCHAR(100) NOT NULL
);

CREATE TABLE story_category (
  story_id INT NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES category(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, category_id)
);

-- === GENRE === --
CREATE TABLE genre (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title_en VARCHAR(100) NOT NULL,
  title_ru VARCHAR(100) NOT NULL
);

CREATE TABLE story_genre (
  story_id INT NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  genre_id INT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, genre_id)
);

-- === OPINION === --
CREATE TABLE opinion (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id INT NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  rating DECIMAL(3,2) NOT NULL,
  review TEXT NOT NULL,
  PRIMARY KEY (user_id, story_id)
);


-- === SEED DATA === --
INSERT INTO role (title) VALUES ('admin'), ('user'), ('moderator');
INSERT INTO story_status (slug, title_en, title_ru) VALUES 
  ('announcement', 'Announcement', 'Анонс'),
  ('finished', 'Finished', 'Завершено'),
  ('frozen', 'Frozen', 'Zamoroženo'),
  ('continues', 'Continues', 'В процессе');

INSERT INTO reading_status (slug, title_en, title_ru) VALUES 
  ('reading', 'Reading', 'Читаю'),
  ('planned', 'Planned', 'В планах'),
  ('read', 'Read', 'Прочитано'),
  ('abandoned', 'Abandoned', 'Брошено'),
  ('postponed', 'Postponed', 'Отложено');