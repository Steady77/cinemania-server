CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  avatar VARCHAR(256) DEFAULT '',
  created_at DATE NOT NULL
);

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  film_id VARCHAR(256) NOT NULL,
  user_id uuid REFERENCES users(id)
);

