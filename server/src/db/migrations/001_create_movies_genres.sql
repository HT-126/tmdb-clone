CREATE TABLE movies (
  id INT UNSIGNED NOT NULL PRIMARY KEY,
  imdb_id VARCHAR(20) NULL,
  title VARCHAR(500) NOT NULL,
  original_title VARCHAR(500) NULL,
  overview TEXT NULL,
  tagline TEXT NULL,
  release_date DATE NULL,
  runtime INT UNSIGNED NULL,
  vote_average DECIMAL(4,2) NOT NULL DEFAULT 0,
  vote_count INT UNSIGNED NOT NULL DEFAULT 0,
  popularity DECIMAL(12,4) NOT NULL DEFAULT 0,
  original_language VARCHAR(10) NULL,
  status VARCHAR(50) NULL,
  poster_path VARCHAR(255) NULL,
  backdrop_path VARCHAR(255) NULL,
  INDEX idx_movies_popularity (popularity),
  INDEX idx_movies_vote_average (vote_average),
  INDEX idx_movies_vote_count (vote_count),
  INDEX idx_movies_release_date (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE genres (
  id INT UNSIGNED NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movie_genres (
  movie_id INT UNSIGNED NOT NULL,
  genre_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (movie_id, genre_id),
  INDEX idx_movie_genres_genre (genre_id),
  CONSTRAINT fk_movie_genres_movie FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
  CONSTRAINT fk_movie_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
