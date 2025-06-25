import sqlite3
import argparse

def query_events(keyword=None, difficulty_num=None):
    """查询西游记八十一难数据库
    
    参数:
        keyword (str): 关键词，用于在难名、人物、地点或描述中搜索
        difficulty_num (int): 具体的难次编号
    """
    # 连接到SQLite数据库
    conn = sqlite3.connect('data/events.db')
    conn.row_factory = sqlite3.Row  # 使结果可以通过列名访问
    cursor = conn.cursor()
    
    if difficulty_num is not None:
        # 按难次查询
        cursor.execute('SELECT * FROM event WHERE nanci = ?', (difficulty_num,))
        rows = cursor.fetchall()
        if not rows:
            print(f"未找到第{difficulty_num}难的记录")
            return
        
        # 显示结果
        for row in rows:
            print_event(row)
    
    elif keyword is not None:
        # 按关键词搜索
        search_term = f"%{keyword}%"
        cursor.execute('''
            SELECT * FROM event 
            WHERE nanming LIKE ? 
            OR zhuyaorenwu LIKE ? 
            OR didian LIKE ? 
            OR shijianmiaoshu LIKE ?
        ''', (search_term, search_term, search_term, search_term))
        
        rows = cursor.fetchall()
        if not rows:
            print(f"未找到包含关键词 '{keyword}' 的记录")
            return
        
        print(f"找到 {len(rows)} 条包含关键词 '{keyword}' 的记录：\n")
        for row in rows:
            print_event(row)
            print("-" * 50)
    
    else:
        # 显示所有记录的简要信息
        cursor.execute('SELECT nanci, nanming FROM event ORDER BY nanci')
        rows = cursor.fetchall()
        print("西游记八十一难列表：\n")
        for row in rows:
            print(f"第{row['nanci']}难: {row['nanming']}")
    
    # 关闭连接
    conn.close()

def print_event(row):
    """打印事件详细信息"""
    print(f"第{row['nanci']}难: {row['nanming']}")
    print(f"主要人物: {row['zhuyaorenwu']}")
    print(f"地点: {row['didian']}")
    print(f"事件描述: {row['shijianmiaoshu']}")
    print(f"象征意义: {row['xiangzhengyi']}")
    print(f"文化内涵: {row['wenhuaneihan']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='查询西游记八十一难数据库')
    parser.add_argument('-k', '--keyword', help='搜索关键词')
    parser.add_argument('-n', '--number', type=int, help='难次编号(1-81)')
    
    args = parser.parse_args()
    query_events(args.keyword, args.number) 