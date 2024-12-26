import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from datetime import datetime

# Get the database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_PUBLIC_URL") or os.getenv("DATABASE_URL")

# Parse the URL parts
try:
    # Split into credentials and host parts
    auth, rest = DATABASE_URL.split("@")
    # Split host part into host and database
    host, db_name = rest.split("/")
    print(f"{datetime.now()} Attempting to connect to database: {db_name}")  # Remove query params
except Exception as e:
    print(f"{datetime.now()} Error parsing DATABASE_URL: {e}")

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
