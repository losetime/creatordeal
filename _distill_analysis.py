import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = r'C:\Users\Administrator\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 30 day cutoff (milliseconds)
cutoff_ms = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)

# Find user messages with repeated keywords
print("--- User messages with 'repeat', 'again', 'same', 'usual' keywords ---")
cursor.execute("""
    SELECT m.id, substr(json_extract(m.data, '$.content'), 1, 200) as content, m.time_created
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND (json_extract(m.data, '$.content') LIKE '%repeat%'
           OR json_extract(m.data, '$.content') LIKE '%again%'
           OR json_extract(m.data, '$.content') LIKE '%same%'
           OR json_extract(m.data, '$.content') LIKE '%usual%'
           OR json_extract(m.data, '$.content') LIKE '%像上次%'
           OR json_extract(m.data, '$.content') LIKE '%重复%'
           OR json_extract(m.data, '$.content') LIKE '%一样%')
    ORDER BY m.time_created DESC
    LIMIT 30
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[2]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[0]}: {row[1]}")

# Find repeated bash command patterns (excluding checkpoint writes)
print("\n--- Repeated bash command patterns (excluding internal) ---")
cursor.execute("""
    SELECT substr(json_extract(p.data, '$.state.input'), 1, 200) as cmd,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
      AND m.time_created > ?
      AND json_extract(p.data, '$.state.input') NOT LIKE '%checkpoint%'
      AND json_extract(p.data, '$.state.input') NOT LIKE '%memory%'
    GROUP BY cmd
    ORDER BY n DESC
    LIMIT 30
""", (cutoff_ms,))
for row in cursor.fetchall():
    if row[1] >= 2:
        print(f"  [{row[1]}x] {row[0]}")

# Find non-checkpoint session titles (actual work sessions)
print("\n--- Actual work session titles (non-checkpoint, non-system) ---")
cursor.execute("""
    SELECT id, title, time_created
    FROM session
    WHERE time_created > ?
      AND title NOT LIKE 'checkpoint-writer%'
      AND title NOT LIKE 'Auto %'
      AND title NOT LIKE 'New session%'
      AND title NOT LIKE '%checkpoint%'
    ORDER BY time_created DESC
    LIMIT 50
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[2]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[0]}: '{row[1]}'")

# Look for repeated edit patterns on the same files
print("\n--- Repeated edits to same file (non-memory) ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.state.input') as edit_input,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'edit'
      AND m.time_created > ?
    GROUP BY json_extract(p.data, '$.state.input')
    ORDER BY n DESC
    LIMIT 20
""", (cutoff_ms,))
for row in cursor.fetchall():
    if row[1] >= 3:
        try:
            edit_data = json.loads(row[0])
            file_path = edit_data.get('file_path', 'unknown')
            # skip memory files
            if 'memory' not in file_path.lower():
                print(f"  [{row[1]}x] {file_path}")
        except:
            pass

# chrome-devtools repeated sequences
print("\n--- Chrome DevTools tool usage counts ---")
cursor.execute("""
    SELECT json_extract(p.data, '$.tool') as tool,
           count(*) as n
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') LIKE 'chrome-devtools%'
      AND m.time_created > ?
    GROUP BY tool
    ORDER BY n DESC
""", (cutoff_ms,))
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Find sessions where webfetch was used
print("\n--- Sessions with webfetch usage ---")
cursor.execute("""
    SELECT DISTINCT s.id, s.title, s.time_created
    FROM session s
    JOIN message m ON m.session_id = s.id
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(p.data, '$.tool') = 'webfetch'
      AND m.time_created > ?
    ORDER BY s.time_created DESC
    LIMIT 20
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[2]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[0]}: '{row[1]}'")

# Find repeated user requests by looking at user messages (not checkpoint-writer)
print("\n--- User messages (non-system, non-checkpoint) ---")
cursor.execute("""
    SELECT substr(json_extract(m.data, '$.content'), 1, 200) as content, m.time_created, m.session_id
    FROM message m
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND s.title NOT LIKE 'checkpoint-writer%'
      AND s.title NOT LIKE 'Auto %'
    ORDER BY m.time_created DESC
    LIMIT 50
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[1]/1000)
    content = row[0].replace('\n', ' ')[:150]
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[2]}: {content}")

conn.close()
