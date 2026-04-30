"""
Run once to add user_type, mb_status, mb_credential columns to the users table.
Usage: python migrate_users_v2.py
"""
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS user_type VARCHAR DEFAULT 'enthusiast',
        ADD COLUMN IF NOT EXISTS mb_status VARCHAR,
        ADD COLUMN IF NOT EXISTS mb_credential TEXT
    """))
    conn.commit()

print("Migration complete: user_type, mb_status, mb_credential added to users.")
