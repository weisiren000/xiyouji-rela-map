#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Character Alias Files Format Validation Script
验证所有character_alias文件的格式和数据完整性

Author: 约翰 (John)
Date: 2025-06-14
Purpose: 确保所有332个character_alias文件符合标准格式
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime

class CharacterAliasValidator:
    """Character Alias文件格式验证器"""
    
    def __init__(self, directory_path: str):
        self.directory_path = Path(directory_path)
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_files = 0
        
        # 必需字段定义
        self.required_fields = {
            'unid': str,
            'isAlias': bool,
            'basic': dict,
            'attributes': dict,
            'metadata': dict
        }
        
        # basic字段必需子字段
        self.required_basic_fields = {
            'name': str,
            'pinyin': str,
            'aliases': list,
            'type': str,
            'category': str
        }
        
        # attributes字段必需子字段
        self.required_attributes_fields = {
            'level': dict,
            'rank': int,
            'power': int,
            'influence': int,
            'morality': str
        }
        
        # level字段必需子字段
        self.required_level_fields = {
            'id': str,
            'name': str,
            'tier': int,
            'category': str
        }
        
        # metadata字段必需子字段
        self.required_metadata_fields = {
            'description': str,
            'tags': list,
            'sourceChapters': list,
            'firstAppearance': int,
            'lastUpdated': str,
            'originalCharacter': str
        }
    
    def validate_json_syntax(self, file_path: Path) -> Tuple[bool, Dict]:
        """验证JSON语法"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return True, data
        except json.JSONDecodeError as e:
            self.errors.append(f"{file_path.name}: JSON语法错误 - {str(e)}")
            return False, {}
        except Exception as e:
            self.errors.append(f"{file_path.name}: 文件读取错误 - {str(e)}")
            return False, {}
    
    def validate_required_fields(self, data: Dict, file_name: str) -> bool:
        """验证必需字段"""
        valid = True
        
        # 检查顶级必需字段
        for field, expected_type in self.required_fields.items():
            if field not in data:
                self.errors.append(f"{file_name}: 缺少必需字段 '{field}'")
                valid = False
            elif not isinstance(data[field], expected_type):
                self.errors.append(f"{file_name}: 字段 '{field}' 类型错误，期望 {expected_type.__name__}")
                valid = False
        
        if not valid:
            return False
        
        # 检查basic字段
        if 'basic' in data:
            for field, expected_type in self.required_basic_fields.items():
                if field not in data['basic']:
                    self.errors.append(f"{file_name}: basic缺少必需字段 '{field}'")
                    valid = False
                elif not isinstance(data['basic'][field], expected_type):
                    self.errors.append(f"{file_name}: basic.{field} 类型错误，期望 {expected_type.__name__}")
                    valid = False
        
        # 检查attributes字段
        if 'attributes' in data:
            for field, expected_type in self.required_attributes_fields.items():
                if field not in data['attributes']:
                    self.errors.append(f"{file_name}: attributes缺少必需字段 '{field}'")
                    valid = False
                elif not isinstance(data['attributes'][field], expected_type):
                    self.errors.append(f"{file_name}: attributes.{field} 类型错误，期望 {expected_type.__name__}")
                    valid = False
            
            # 检查level子字段
            if 'level' in data['attributes'] and isinstance(data['attributes']['level'], dict):
                for field, expected_type in self.required_level_fields.items():
                    if field not in data['attributes']['level']:
                        self.errors.append(f"{file_name}: attributes.level缺少必需字段 '{field}'")
                        valid = False
                    elif not isinstance(data['attributes']['level'][field], expected_type):
                        self.errors.append(f"{file_name}: attributes.level.{field} 类型错误，期望 {expected_type.__name__}")
                        valid = False
        
        # 检查metadata字段
        if 'metadata' in data:
            for field, expected_type in self.required_metadata_fields.items():
                if field not in data['metadata']:
                    self.errors.append(f"{file_name}: metadata缺少必需字段 '{field}'")
                    valid = False
                elif not isinstance(data['metadata'][field], expected_type):
                    self.errors.append(f"{file_name}: metadata.{field} 类型错误，期望 {expected_type.__name__}")
                    valid = False
        
        return valid
    
    def validate_data_consistency(self, data: Dict, file_name: str) -> bool:
        """验证数据一致性"""
        valid = True
        
        # 检查isAlias必须为True
        if data.get('isAlias') != True:
            self.errors.append(f"{file_name}: isAlias必须为true")
            valid = False
        
        # 检查type必须为character_alias
        if data.get('basic', {}).get('type') != 'character_alias':
            self.errors.append(f"{file_name}: basic.type必须为'character_alias'")
            valid = False
        
        # 检查category必须为alias
        if data.get('basic', {}).get('category') != 'alias':
            self.errors.append(f"{file_name}: basic.category必须为'alias'")
            valid = False
        
        # 检查unid格式 (ca0001-ca0332)
        unid = data.get('unid', '')
        if not unid.startswith('ca') or len(unid) != 6:
            self.errors.append(f"{file_name}: unid格式错误，应为ca0001-ca0332格式")
            valid = False
        
        # 检查originalCharacter格式 (c0001-c0150)
        original_char = data.get('metadata', {}).get('originalCharacter', '')
        if not original_char.startswith('c') or len(original_char) < 5:
            self.errors.append(f"{file_name}: originalCharacter格式错误，应为c0001-c0150格式")
            valid = False
        
        # 检查数值范围
        power = data.get('attributes', {}).get('power', 0)
        if not (0 <= power <= 100):
            self.warnings.append(f"{file_name}: power值 {power} 超出推荐范围 [0-100]")
        
        influence = data.get('attributes', {}).get('influence', 0)
        if not (0 <= influence <= 100):
            self.warnings.append(f"{file_name}: influence值 {influence} 超出推荐范围 [0-100]")
        
        tier = data.get('attributes', {}).get('level', {}).get('tier', 0)
        if not (1 <= tier <= 10):
            self.warnings.append(f"{file_name}: tier值 {tier} 超出推荐范围 [1-10]")
        
        return valid
    
    def validate_file(self, file_path: Path) -> bool:
        """验证单个文件"""
        file_name = file_path.name
        
        # 检查文件名格式
        if not file_name.startswith('character_alias_ca') or not file_name.endswith('.json'):
            self.errors.append(f"{file_name}: 文件名格式错误")
            return False
        
        # 验证JSON语法
        is_valid_json, data = self.validate_json_syntax(file_path)
        if not is_valid_json:
            return False
        
        # 验证必需字段
        has_required_fields = self.validate_required_fields(data, file_name)
        
        # 验证数据一致性
        is_consistent = self.validate_data_consistency(data, file_name)
        
        return has_required_fields and is_consistent
    
    def validate_all_files(self) -> Dict[str, Any]:
        """验证所有文件"""
        if not self.directory_path.exists():
            self.errors.append(f"目录不存在: {self.directory_path}")
            return self.generate_report()
        
        # 获取所有JSON文件
        json_files = list(self.directory_path.glob('character_alias_ca*.json'))
        self.total_files = len(json_files)
        
        print(f"🔍 开始验证 {self.total_files} 个character_alias文件...")
        
        # 验证每个文件
        for file_path in sorted(json_files):
            if self.validate_file(file_path):
                self.success_count += 1
                print(f"✅ {file_path.name}")
            else:
                print(f"❌ {file_path.name}")
        
        return self.generate_report()
    
    def generate_report(self) -> Dict[str, Any]:
        """生成验证报告"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_files': self.total_files,
            'success_count': self.success_count,
            'error_count': len(self.errors),
            'warning_count': len(self.warnings),
            'success_rate': (self.success_count / self.total_files * 100) if self.total_files > 0 else 0,
            'errors': self.errors,
            'warnings': self.warnings
        }
        return report
    
    def print_report(self, report: Dict[str, Any]):
        """打印验证报告"""
        print("\n" + "="*60)
        print("📊 CHARACTER ALIAS文件格式验证报告")
        print("="*60)
        print(f"验证时间: {report['timestamp']}")
        print(f"总文件数: {report['total_files']}")
        print(f"成功验证: {report['success_count']}")
        print(f"错误数量: {report['error_count']}")
        print(f"警告数量: {report['warning_count']}")
        print(f"成功率: {report['success_rate']:.1f}%")
        
        if report['errors']:
            print(f"\n❌ 错误详情 ({len(report['errors'])}个):")
            for error in report['errors']:
                print(f"  • {error}")
        
        if report['warnings']:
            print(f"\n⚠️ 警告详情 ({len(report['warnings'])}个):")
            for warning in report['warnings']:
                print(f"  • {warning}")
        
        if report['error_count'] == 0:
            print(f"\n🎉 所有 {report['total_files']} 个文件格式验证通过！")
        else:
            print(f"\n🔧 需要修复 {report['error_count']} 个错误")
        
        print("="*60)


def main():
    """主函数"""
    # 设置文件目录路径
    script_dir = Path(__file__).parent
    alias_dir = script_dir.parent / "docs" / "data" / "JSON" / "character_alias"
    
    print("🚀 Character Alias文件格式验证工具")
    print(f"📁 验证目录: {alias_dir}")
    
    # 创建验证器并执行验证
    validator = CharacterAliasValidator(str(alias_dir))
    report = validator.validate_all_files()
    
    # 打印报告
    validator.print_report(report)
    
    # 保存报告到文件
    report_file = script_dir / f"validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 详细报告已保存到: {report_file}")
    
    # 返回退出码
    return 0 if report['error_count'] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
