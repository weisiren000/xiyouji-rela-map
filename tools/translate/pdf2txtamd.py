import os
import argparse
import pytesseract
from pdf2image import convert_from_path
from PyPDF2 import PdfReader
from PIL import Image
import re

# 设置Tesseract OCR路径（如果需要）
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_pdf(pdf_path, use_ocr=False):
    """从PDF中提取文本，可选择使用OCR"""
    if use_ocr:
        # 使用OCR处理PDF
        print(f"正在使用OCR处理PDF: {pdf_path}")
        try:
            images = convert_from_path(pdf_path)
            full_text = ""
            for i, image in enumerate(images):
                print(f"正在处理第 {i+1}/{len(images)} 页")
                text = pytesseract.image_to_string(image)
                full_text += text + "\n\n"
            return full_text
        except Exception as e:
            print(f"OCR处理出错: {e}")
            return None
    else:
        # 直接提取文本
        print(f"正在直接提取PDF文本: {pdf_path}")
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                full_text = ""
                for i, page in enumerate(reader.pages):
                    print(f"正在提取第 {i+1}/{len(reader.pages)} 页")
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"
                return full_text
        except Exception as e:
            print(f"提取文本出错: {e}")
            return None

def enhance_text_for_md(text):
    """增强文本，使其更适合作为Markdown格式"""
    if not text:
        return text
    
    # 识别标题（假设标题是单独一行，且后面跟着空行）
    lines = text.split('\n')
    enhanced_lines = []
    
    for i, line in enumerate(lines):
        # 检查是否是标题
        if line.strip() and (i == len(lines)-1 or not lines[i+1].strip()):
            # 检查前一行是否也是标题
            if i > 0 and enhanced_lines and enhanced_lines[-1].startswith('#'):
                # 子标题
                enhanced_lines.append(f"## {line}")
            else:
                # 主标题
                enhanced_lines.append(f"# {line}")
        else:
            # 普通段落
            enhanced_lines.append(line)
    
    return '\n'.join(enhanced_lines)

def save_text(text, output_path):
    """将文本保存到文件"""
    if not text:
        print("没有文本可保存")
        return False
    
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"已保存到: {output_path}")
        return True
    except Exception as e:
        print(f"保存文件出错: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='将PDF转换为文本或Markdown文件')
    parser.add_argument('input_pdf', help='输入PDF文件路径')
    parser.add_argument('-o', '--output', help='输出文件路径，默认与输入文件同名')
    parser.add_argument('-f', '--format', choices=['txt', 'md'], default='txt', help='输出格式，可选txt或md，默认为txt')
    parser.add_argument('--ocr', action='store_true', help='使用OCR处理PDF（需要安装tesseract和pdf2image）')
    
    args = parser.parse_args()
    
    # 确定输出路径
    if not args.output:
        base_name = os.path.splitext(args.input_pdf)[0]
        output_path = f"{base_name}.{args.format}"
    else:
        output_path = args.output
    
    # 提取文本
    text = extract_text_from_pdf(args.input_pdf, use_ocr=args.ocr)
    
    # 如果是Markdown格式，增强文本
    if args.format == 'md' and text:
        text = enhance_text_for_md(text)
    
    # 保存文件
    save_text(text, output_path)

if __name__ == "__main__":
    main()    