#!/usr/bin/env python3
"""
Create admin user directly in SQLite database.
"""

import sqlite3
import hashlib
import uuid
from datetime import datetime

def get_password_hash(password: str) -> str:
    """Simple password hashing for demo purposes."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_admin_user():
    """Create admin user directly in SQLite database."""
    
    # Database file path (SQLite development database)
    db_path = "nexopeak.db"
    
    # Admin user details
    admin_email = "info@benjaminr.ca"
    admin_password = "123456789"
    admin_name = "Admin User"
    org_name = "Nexopeak Admin"
    
    # Generate UUIDs
    user_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    
    # Hash password
    hashed_password = get_password_hash(admin_password)
    
    # Current timestamp
    now = datetime.utcnow().isoformat()
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if admin user already exists
        cursor.execute("SELECT id, email, role FROM users WHERE email = ?", (admin_email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"Admin user already exists!")
            print(f"User ID: {existing_user[0]}")
            print(f"Email: {existing_user[1]}")
            print(f"Role: {existing_user[2]}")
            
            # Update role to admin if not already
            if existing_user[2] != 'admin':
                cursor.execute("UPDATE users SET role = 'admin' WHERE id = ?", (existing_user[0],))
                conn.commit()
                print("✅ Updated user role to admin!")
            
            conn.close()
            return existing_user[0]
        
        # Create organization first
        cursor.execute("""
            INSERT OR IGNORE INTO orgs (id, name, domain, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (org_id, org_name, "nexopeak.com", now, now))
        
        # Create admin user
        cursor.execute("""
            INSERT INTO users (
                id, org_id, email, name, hashed_password, role, 
                is_active, is_verified, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, org_id, admin_email, admin_name, hashed_password, 
            "admin", True, True, now, now
        ))
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("✅ Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Name: {admin_name}")
        print(f"Role: admin")
        print(f"User ID: {user_id}")
        print(f"Organization: {org_name}")
        
        return user_id
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("Creating Admin User in SQLite Database...")
    print("=" * 50)
    
    result = create_admin_user()
    
    if result:
        print("=" * 50)
        print("✅ Admin user setup complete!")
        print("\nYou can now login with:")
        print("Email: info@benjaminr.ca")
        print("Password: 123456789")
    else:
        print("❌ Failed to create admin user")

if __name__ == "__main__":
    main()
