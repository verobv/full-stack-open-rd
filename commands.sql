CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title) values ('Vero Bruno', 'greatest.com', 'Greatest blog ever'); 
INSERT INTO blogs (author, url, title) values ('EvW', 'theboy.com', 'The boy'); 