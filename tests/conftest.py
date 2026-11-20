import pytest

from fastapi.testclient import TestClient

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.base import Base
from app.api.v1.dependencies import get_db
from app.core.config import settings

from app import models


# --------------------------------
# 1. Test Database Configuration
# --------------------------------

TEST_DATABASE_URL = settings.TEST_DATABASE_URL

if not TEST_DATABASE_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL is not configured"
    )

database_name = make_url(TEST_DATABASE_URL).database

if database_name != "order_management_test":
    raise RuntimeError(
        "Tests must use order_management_test database"
    )


# --------------------------------
# 2. Test Engine
# --------------------------------

test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)


# --------------------------------
# 3. Test Session Factory
# --------------------------------

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


# --------------------------------
# 4. Database Setup
# --------------------------------

@pytest.fixture(scope="session", autouse=True)
def setup_database():

    Base.metadata.drop_all(bind=test_engine)

    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)

    test_engine.dispose()


# --------------------------------
# 5. Database Session Fixture
# --------------------------------

@pytest.fixture
def db_session():

    connection = test_engine.connect()

    transaction = connection.begin()

    session = TestingSessionLocal(
        bind=connection,
        join_transaction_mode="create_savepoint",
    )

    try:
        yield session

    finally:
        session.close()
        transaction.rollback()
        connection.close()


# --------------------------------
# 6. Test Client Fixture
# --------------------------------
"""
@pytest.fixture
def client(db_session):

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client

    finally:
        app.dependency_overrides.clear()
"""

@pytest.fixture
def client(db_session):
    original_overrides = app.dependency_overrides.copy()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(original_overrides)