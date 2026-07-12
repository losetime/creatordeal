import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = r'C:\Users\Administrator\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cutoff_ms = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)

# User messages (non-system, non-checkpoint) - with null safety
print("--- User messages (non-system, non-checkpoint) ---")
cursor.execute("""
    SELECT json_extract(m.data, '$.content') as content, m.time_created, m.session_id
    FROM message m
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'user'
      AND m.time_created > ?
      AND s.title NOT LIKE 'checkpoint-writer%'
      AND s.title NOT LIKE 'Auto %'
      AND json_extract(m.data, '$.content') IS NOT NULL
      AND json_extract(m.data, '$.content') != ''
    ORDER BY m.time_created DESC
    LIMIT 60
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[1]/1000)
    content = (row[0] or '').replace('\n', ' ')[:150]
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[2]}: {content}")

# Group actual work sessions by project
print("\n--- Sessions by project (work sessions only) ---")
cursor.execute("""
    SELECT 
        CASE 
            WHEN title LIKE '%固件%' OR title LIKE '%Flutter%' OR title LIKE '%flutter%' OR title LIKE '%蓝牙%' OR title LIKE '%BLE%' OR title LIKE '%ble%' THEN 'pet-collar (Flutter/BLE)'
            WHEN title LIKE '%subscription%' OR title LIKE '%PayPal%' OR title LIKE '%费率%' OR title LIKE '%仪表盘%' OR title LIKE '%交易%' THEN 'creatordeal (SaaS dashboard)'
            WHEN title LIKE '%stock%' OR title LIKE '%股票%' THEN 'daily_stock_analysis'
            ELSE 'other'
        END as project,
        count(*) as n,
        GROUP_CONCAT(title, '; ') as titles
    FROM session
    WHERE time_created > ?
      AND title NOT LIKE 'checkpoint-writer%'
      AND title NOT LIKE 'Auto %'
      AND title NOT LIKE 'New session%'
    GROUP BY project
    ORDER BY n DESC
""", (cutoff_ms,))
for row in cursor.fetchall():
    print(f"\n  [{row[1]} sessions] {row[0]}")
    titles = row[2].split('; ')
    for t in titles[:8]:
        print(f"    - {t}")

# Detailed look at what the DSA deploy pattern looks like
print("\n--- DSA deploy workflow (docker save + scp + ssh deploy) ---")
cursor.execute("""
    SELECT m.session_id, substr(json_extract(p.data, '$.state.input'), 1, 300) as cmd, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
      AND json_extract(p.data, '$.state.input') LIKE '%docker%scp%'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 5
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[2]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] {row[0]}: {row[1][:200]}")

# Creatordeal specific patterns
print("\n--- Creatordeal: TypeScript check + build workflow ---")
cursor.execute("""
    SELECT m.session_id, s.title, substr(json_extract(p.data, '$.state.input'), 1, 200) as cmd, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
      AND (json_extract(p.data, '$.state.input') LIKE '%tsc%noEmit%' 
           OR json_extract(p.data, '$.state.input') LIKE '%next build%')
      AND json_extract(p.data, '$.state.input') LIKE '%creatordeal%'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 15
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[3]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] [{row[1]}] {row[2][:180]}")

# Flutter analyze pattern
print("\n--- Flutter: analyze workflow ---")
cursor.execute("""
    SELECT m.session_id, s.title, substr(json_extract(p.data, '$.state.input'), 1, 200) as cmd, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
      AND json_extract(p.data, '$.state.input') LIKE '%flutter analyze%'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 15
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[3]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] [{row[1]}] {row[2][:180]}")

# Git commit patterns
print("\n--- Git: commit workflow (add + commit + push) ---")
cursor.execute("""
    SELECT m.session_id, s.title, substr(json_extract(p.data, '$.state.input'), 1, 300) as cmd, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
      AND json_extract(p.data, '$.state.input') LIKE '%git commit%'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 15
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[3]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] [{row[1]}] {row[2][:250]}")

# webfetch patterns
print("\n--- Webfetch usage details ---")
cursor.execute("""
    SELECT m.session_id, s.title, substr(json_extract(p.data, '$.state.input'), 1, 300) as input, m.time_created
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'webfetch'
      AND m.time_created > ?
    ORDER BY m.time_created DESC
    LIMIT 15
""", (cutoff_ms,))
for row in cursor.fetchall():
    dt = datetime.fromtimestamp(row[3]/1000)
    print(f"  [{dt.strftime('%Y-%m-%d %H:%M')}] [{row[1]}] {row[2][:250]}")

conn.close()
