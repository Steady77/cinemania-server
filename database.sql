CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(256) NOT NULL UNIQUE,
  user_password VARCHAR(256) NOT NULL
);

