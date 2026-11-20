from sqlalchemy import text


def test_insert_temporary_record(db_session):
    db_session.execute(
        text("""
            CREATE TEMPORARY TABLE pytest_temp (
                id INTEGER PRIMARY KEY
            )
        """)
    )

    db_session.execute(
        text("INSERT INTO pytest_temp (id) VALUES (1)")
    )

    result = db_session.execute(
        text("SELECT COUNT(*) FROM pytest_temp")
    )

    assert result.scalar_one() == 1