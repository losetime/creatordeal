import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = r'C:\Users\Administrator\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get schema
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print("Tables:", tables)

# 30 day cutoff (milliseconds)
cutoff_ms = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)
print(f"\nCutoff timestamp (ms): {cutoff_ms}")

# Recent sessions for this project
cursor.execute("SELECT id, title, time_created FROM session WHERE time_created > ? ORDER BY time_created DESC", (cutoff_ms,))
sessions = cursor.fetchall()
print(f"\nRecent sessions (last 30 days): {len(sessions)}")
for s in sessions:
    dt = datetime.fromtimestamp(s[2]/1000)
    print(f"  {s[0]}: '{s[1]}' ({dt.strftime('%Y-%m-%d %H:%M')})")

# Most used tools by assistant in recent sessions
print("\n--- Most used tools (assistant turns, last 30 days) ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND m.time_created > ?
    GROUP BY tool
    ORDER BY n DESC
    LIMIT 20
""", (cutoff_ms,))
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Repeated tool inputs (top 30 patterns)
print("\n--- Repeated tool input patterns (last 30 days) ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           substr(json_extract(p.data, '$.state.input'), 1, 150) as input_preview,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND m.time_created > ?
    GROUP BY tool, input_preview
    ORDER BY n DESC
    LIMIT 30
""", (cutoff_ms,))
for row in cursor.fetchall():
    if row[2] >= 2:
        print(f"  [{row[2]}x] {row[0]}: {row[1]}")

conn.close()
