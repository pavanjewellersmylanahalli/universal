import sqlite3

def run_migration():
    conn = sqlite3.connect("girvi_platform.db")
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN relation_type VARCHAR")
        print("Added relation_type column to customers table.")
    except Exception as e:
        print("relation_type status:", e)

    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN monthly_income NUMERIC")
        print("Added monthly_income column to customers table.")
    except Exception as e:
        print("monthly_income status:", e)

    conn.commit()
    conn.close()
    print("Column migration successfully completed!")

if __name__ == "__main__":
    run_migration()
