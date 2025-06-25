import sqlite3

def check_database():
    """检查SQLite数据库中的数据"""
    # 连接到SQLite数据库
    conn = sqlite3.connect('data/events.db')
    cursor = conn.cursor()
    
    # 获取记录总数
    cursor.execute('SELECT COUNT(*) FROM event')
    count = cursor.fetchone()[0]
    print(f'总记录数: {count}')
    
    # 获取前5条记录
    cursor.execute('SELECT * FROM event LIMIT 5')
    rows = cursor.fetchall()
    
    print("\n前5条记录:")
    for row in rows:
        print(row)
    
    # 关闭连接
    conn.close()

if __name__ == "__main__":
    check_database() 