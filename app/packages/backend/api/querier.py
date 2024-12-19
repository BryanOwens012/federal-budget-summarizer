import os
from contextlib import contextmanager
from sqlalchemy import create_engine

# Get the database URL from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")
print(f"Connecting to database with URL: {DATABASE_URL.split('@')[1]}")  # Safely print URL without credentials

# Create the SQLAlchemy engine - this is our connection pool manager
engine = create_engine(
    DATABASE_URL,
    # These settings help manage the connection pool effectively
    pool_pre_ping=True,  # Checks if connections are alive
    pool_size=5,        # Maintain 5 connections in the pool
    max_overflow=10     # Allow up to 10 additional connections when busy
)

# Create a context manager for database connections
@contextmanager
def get_conn():
    """
    Creates a context manager that provides a database connection.
    Using a context manager ensures the connection is always returned to the pool.
    """
    # Get a connection from the pool
    with engine.connect() as conn:
        # Start a transaction
        with conn.begin():
            yield conn
