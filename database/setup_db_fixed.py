import mysql.connector
from mysql.connector import Error
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv()

# DB config
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'gestion_clinique'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def execute_sql_file(connection, filename):
    """Execute SQL file with proper handling of multiple statements"""
    cursor = connection.cursor()
    
    with open(filename, 'r') as file:
        sql_content = file.read()
    
    # Split by semicolons and execute each statement
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    for statement in statements:
        if statement:
            try:
                cursor.execute(statement)
                connection.commit()
            except Error as e:
                print(f"Warning: {e}")
                # Continue with next statement
    
    cursor.close()

def setup_database():
    """Setup database with schema and sample data"""
    try:
        # Connect without database first to create it
        config_without_db = DB_CONFIG.copy()
        config_without_db.pop('database', None)
        
        connection = mysql.connector.connect(**config_without_db)
        cursor = connection.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS gestion_clinique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        connection.commit()
        cursor.close()
        connection.close()
        
        # Now connect with database
        connection = mysql.connector.connect(**DB_CONFIG)
        
        # Execute schema
        print("Executing schema...")
        execute_sql_file(connection, 'schema.sql')
        
        # Execute sample data
        print("Executing sample data...")
        execute_sql_file(connection, 'sample-data.sql')
        
        print("Database setup completed successfully!")
        
    except Error as e:
        print(f"Database setup failed: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()

if __name__ == '__main__':
    setup_database()
