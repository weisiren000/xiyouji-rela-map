/**
 * 交互功能测试脚本
 * 用于验证鼠标悬浮和信息卡片功能
 */

console.log('🧪 开始交互功能测试...')

// 等待页面加载完成
setTimeout(() => {
  console.log('🔍 检查页面元素...')
  
  // 检查Canvas元素
  const canvas = document.querySelector('canvas')
  if (canvas) {
    console.log('✅ Canvas元素存在')
    console.log('📐 Canvas尺寸:', canvas.width, 'x', canvas.height)
  } else {
    console.error('❌ Canvas元素不存在')
    return
  }
  
  // 检查是否有角色数据加载
  const checkCharacterData = () => {
    // 监听控制台输出中的角色数据加载信息
    console.log('🔄 等待角色数据加载...')
  }
  
  // 模拟鼠标移动事件
  const simulateMouseMove = (x, y) => {
    const event = new MouseEvent('mousemove', {
      clientX: x,
      clientY: y,
      bubbles: true
    })
    canvas.dispatchEvent(event)
    console.log(`🖱️ 模拟鼠标移动到 (${x}, ${y})`)
  }
  
  // 测试鼠标交互
  const testInteraction = () => {
    console.log('🎯 开始测试鼠标交互...')
    
    // 移动到画布中心
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    simulateMouseMove(centerX, centerY)
    
    // 移动到不同位置测试
    setTimeout(() => {
      simulateMouseMove(centerX + 100, centerY)
    }, 1000)
    
    setTimeout(() => {
      simulateMouseMove(centerX - 100, centerY + 100)
    }, 2000)
    
    setTimeout(() => {
      simulateMouseMove(centerX, centerY - 100)
    }, 3000)
  }
  
  // 检查信息卡片
  const checkInfoCard = () => {
    const infoCards = document.querySelectorAll('[style*="position: fixed"]')
    if (infoCards.length > 0) {
      console.log('✅ 发现信息卡片:', infoCards.length, '个')
      infoCards.forEach((card, index) => {
        console.log(`📋 卡片${index + 1}:`, card.textContent?.substring(0, 50) + '...')
      })
    } else {
      console.log('ℹ️ 当前没有显示信息卡片')
    }
  }
  
  // 开始测试
  checkCharacterData()
  
  setTimeout(() => {
    testInteraction()
  }, 2000)
  
  // 定期检查信息卡片
  setInterval(checkInfoCard, 5000)
  
  console.log('✅ 测试脚本已启动，请移动鼠标到3D场景中测试交互功能')
  
}, 3000)
