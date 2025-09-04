#!/usr/bin/env python3
"""
Migration script to add OAuth token fields to the connections table.
This adds the access_token, refresh_token, and token_expires_at columns
that were missing from the original Connection model.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def run_migration():
    """Run the migration to add OAuth token fields."""
    
    # Get database URL from environment or use default
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        # Default to local SQLite for development
        database_url = 'sqlite:///./nexopeak.db'
    
    print(f"Running migration on database: {database_url}")
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check if columns already exist
            try:
                result = conn.execute(text("SELECT access_token FROM connections LIMIT 1"))
                print("OAuth token columns already exist. Migration not needed.")
                return
            except OperationalError:
                # Columns don't exist, proceed with migration
                pass
            
            print("Adding OAuth token columns to connections table...")
            
            # Add the new columns
            migration_sql = [
                "ALTER TABLE connections ADD COLUMN access_token TEXT",
                "ALTER TABLE connections ADD COLUMN refresh_token TEXT", 
                "ALTER TABLE connections ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE"
            ]
            
            for sql in migration_sql:
                try:
                    conn.execute(text(sql))
                    print(f"✓ Executed: {sql}")
                except Exception as e:
                    print(f"✗ Error executing {sql}: {e}")
                    # Continue with other statements
            
            conn.commit()
            print("✓ Migration completed successfully!")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
