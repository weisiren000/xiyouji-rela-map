import os
import sqlite3
import csv
import pandas as pd

def create_event_table():
    """创建存储西游记八十一难数据的表格"""
    # 确保data目录存在
    os.makedirs('data', exist_ok=True)
    
    # 连接到SQLite数据库
    conn = sqlite3.connect('data/events.db')
    cursor = conn.cursor()
    
    # 创建event表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS event (
        id INTEGER PRIMARY KEY,
        nanci INTEGER,
        nanming TEXT,
        zhuyaorenwu TEXT,
        didian TEXT,
        shijianmiaoshu TEXT,
        xiangzhengyi TEXT,
        wenhuaneihan TEXT
    )
    ''')
    
    # 读取CSV文件
    csv_file = 'docs/前期准备/八十一难研究计划/西游记八十一难对照表.csv'
    
    # 使用pandas读取CSV
    df = pd.read_csv(csv_file)
    
    # 将数据插入到表中
    for i, row in df.iterrows():
        cursor.execute('''
        INSERT INTO event (nanci, nanming, zhuyaorenwu, didian, shijianmiaoshu, xiangzhengyi, wenhuaneihan)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            row['难次'],
            row['难名'],
            row['主要人物'],
            row['地点'],
            row['事件描述'],
            row['象征意义'],
            row['文化内涵']
        ))
    
    # 提交更改并关闭连接
    conn.commit()
    conn.close()
    
    print("数据已成功导入到SQLite数据库中！")

if __name__ == "__main__":
    create_event_table() 