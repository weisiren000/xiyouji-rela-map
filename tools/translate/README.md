下面是一个能把PDF转换为txt或者md格式的Python脚本。它可以处理包含文本的PDF文件，还能对扫描型PDF进行OCR识别。

    


使用这个脚本前，你需要安装以下依赖库：
```bash
pip install PyPDF2 pillow pytesseract pdf2image argparse
```

另外，要是你需要使用OCR功能，还得安装：
1. Tesseract OCR引擎（[下载地址](https://github.com/UB-Mannheim/tesseract/wiki)）
2. Poppler（用于PDF转图像，[Windows下载](https://blog.alivate.com.au/poppler-windows/)，Linux/Mac可通过包管理器安装）

### 使用方法
1. 直接提取文本并保存为txt格式：
```bash
python pdf2txtamd.py <file.pdf>
```

2. 保存为Markdown格式：
```bash
python pdf2txtamd.py <file.pdf> -f md
```

3. 指定输出文件名：
```bash
python pdf2txtamd.py <file.pdf> -o output.txt
```

4. 使用OCR处理扫描型PDF：
```bash
python pdf2txtamd.py <file.pdf> --ocr
```

### 功能说明
- 能够直接提取文本内容，也可以通过OCR识别图像中的文字
- 支持将结果保存为txt或者md格式
- 针对Markdown格式做了特别优化，会自动识别并添加标题标记
- 对中文的识别效果较好，不过使用OCR时可能需要指定中文语言包

### 注意事项
- 对于扫描型PDF，必须使用`--ocr`参数
- 处理大型PDF文件时可能会消耗较多内存
- 识别效果取决于PDF的质量以及OCR引擎的设置