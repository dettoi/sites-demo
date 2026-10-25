<?php
// SQLite storage for cars, photos and bot users. Single source of truth on the server.

const BUYCARS_HOME = __DIR__ . '/..';

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;

    $dir = BUYCARS_HOME . '/data';
    if (!is_dir($dir)) mkdir($dir, 0700, true);
    $pdo = new PDO('sqlite:' . $dir . '/buycars.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
    migrate($pdo);
    return $pdo;
}

function migrate(PDO $pdo): void
{
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS cars (
        id            INTEGER PRIMARY KEY,
        slug          TEXT NOT NULL UNIQUE,
        status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','sold')),
        make          TEXT NOT NULL,
        title         TEXT NOT NULL,           -- make + model as shown on the site
        year          INTEGER NOT NULL,
        mileage_km    INTEGER NOT NULL,
        price_rub     INTEGER NOT NULL,
        volume_l      REAL,                    -- NULL for electric
        fuel          TEXT,
        power_hp      INTEGER,
        tg_post       INTEGER,                 -- channel post id, if the car came from the channel
        side_photo_id INTEGER,                 -- profile shot for the home slider; NULL means the cover
        created_by    INTEGER,                 -- telegram id
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
        published_at  TEXT,
        sold_at       TEXT
    );
    CREATE TABLE IF NOT EXISTS photos (
        id      INTEGER PRIMARY KEY,
        car_id  INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        pos     INTEGER NOT NULL,              -- 0 is the cover
        file    TEXT NOT NULL,                 -- basename without .jpg, under img/cars/<slug>/ and t/
        kind    TEXT NOT NULL DEFAULT 'ext' CHECK (kind IN ('ext','int')),
        width   INTEGER,
        height  INTEGER
    );
    CREATE INDEX IF NOT EXISTS photos_car ON photos(car_id, pos);
    CREATE TABLE IF NOT EXISTS users (
        tg_id          INTEGER PRIMARY KEY,
        name           TEXT,
        role           TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('owner','manager')),
        receives_leads INTEGER NOT NULL DEFAULT 1,
        added_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
    -- a car being assembled in a private chat: photos + text, then the «Всё верно?» card
    CREATE TABLE IF NOT EXISTS drafts (
        id          INTEGER PRIMARY KEY,
        chat_id     INTEGER NOT NULL,
        user_id     INTEGER NOT NULL,
        state       TEXT NOT NULL DEFAULT 'collecting' CHECK (state IN ('collecting','review','done','cancelled')),
        text        TEXT NOT NULL DEFAULT '',
        fields      TEXT,                     -- JSON from the parser, edited via «Исправить»
        dup_car_id  INTEGER,                  -- existing car that looks the same
        update_of   INTEGER,                  -- user chose «обновить» that car
        card_msg_id INTEGER,
        touched_at  REAL NOT NULL,            -- microtime of the last photo/text, for the debounce
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS drafts_chat ON drafts(chat_id, state);
    CREATE TABLE IF NOT EXISTS draft_photos (
        id          INTEGER PRIMARY KEY,
        draft_id    INTEGER NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
        file_id     TEXT NOT NULL,
        file_unique TEXT NOT NULL,
        msg_id      INTEGER NOT NULL,         -- album order follows message ids
        UNIQUE (draft_id, file_unique)
    );
    -- what the bot waits for from this user next: {"draft":id,"field":"price_rub"} or {"car":id,"field":"price_rub"}
    CREATE TABLE IF NOT EXISTS waits (
        user_id INTEGER PRIMARY KEY,
        data    TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
        key   TEXT PRIMARY KEY,
        value TEXT
    );
    SQL);
}

// Site needs a rebuild after any change visible on the site; cron picks this flag up.
function mark_dirty(): void
{
    db()->prepare("INSERT INTO meta(key, value) VALUES ('dirty', datetime('now'))
                   ON CONFLICT(key) DO UPDATE SET value = excluded.value")->execute();
}

function media_dir(): string
{
    return BUYCARS_HOME . '/site/img/cars';
}
