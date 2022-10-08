CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(256) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL
);

