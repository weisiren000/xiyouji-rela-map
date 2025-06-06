import csv
import json
import sys
import os

def csv_to_json(csv_file_path):
    """
    将CSV文件转换为同名的JSON文件
    :param csv_file_path: 输入的CSV文件路径
    """
    # 检查文件扩展名
    if not csv_file_path.lower().endswith('.csv'):
        print("错误: 输入文件必须是CSV格式 (.csv)")
        return
    
    # 生成输出JSON文件名（替换扩展名）
    json_file_path = os.path.splitext(csv_file_path)[0] + '.json'
    
    try:
        # 读取CSV文件
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            data = [row for row in csv_reader]
        
        # 写入JSON文件
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
            
        print(f"转换成功！")
        print(f"CSV输入: {csv_file_path}")
        print(f"JSON输出: {json_file_path}")
        return True
    
    except FileNotFoundError:
        print(f"错误: 文件 {csv_file_path} 不存在")
    except Exception as e:
        print(f"转换出错: {str(e)}")
    return False

if __name__ == "__main__":
    # 命令行参数处理
    if len(sys.argv) != 2:
        print("使用方法: python csv_to_json.py <输入文件.csv>")
        print("示例: python csv_to_json.py data.csv")
        print("说明: 将自动生成同名JSON文件 (如 data.json)")
        sys.exit(1)
    
    input_csv = sys.argv[1]
    csv_to_json(input_csv)
