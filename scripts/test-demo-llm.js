/**
 * 联通云大模型 API Key 连通性测试
 * 文档: https://support.cucloud.cn/document/127/591/2357.html?id=2357&arcid=7020
 *
 * 用法: node test-demo-llm.js
 */

// ========== 在此填写你的配置 ==========
const API_KEY = 'sk-sp-JwVMToHPJqBFFxaURIJpuMPzKNSoEDEp'
const BASE_URL = 'https://aigw-gzgy2.cucloud.cn:8443/v1' // 控制台「AI 服务平台」中提供的 BaseURL
const MODEL = 'glm-5.1' // 套餐支持的模型名称，如 DeepSeek-R1 / DeepSeek-V3 / glm-5.1
// =====================================

const TEST_MESSAGE = '你好，请回复「API 测试成功」四个字。'

/** glm-5.1 等推理模型会把思考过程写入 reasoning，最终答案写入 content */
function parseAssistantMessage(choice) {
  const message = choice?.message ?? {}
  return {
    content: typeof message.content === 'string' ? message.content.trim() : '',
    reasoning: typeof message.reasoning === 'string' ? message.reasoning.trim() : '',
    finishReason: choice?.finish_reason ?? '',
  }
}

function buildRequestBody() {
  const body = {
    model: MODEL,
    messages: [{ role: 'user', content: TEST_MESSAGE }],
    max_tokens: 512,
    stream: false,
  }

  // glm 推理模型：关闭思考链，连通性测试只需简短回复
  if (/^glm/i.test(MODEL)) {
    body.thinking = { type: 'disabled' }
  }

  return body
}

async function testLlmApi() {
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.error('❌ 请先在文件顶部填写 API_KEY')
    process.exit(1)
  }

  const url = `${BASE_URL.replace(/\/$/, '')}/chat/completions`
  console.log('正在测试联通云大模型 API...')
  console.log(`  接口: ${url}`)
  console.log(`  模型: ${MODEL}`)
  console.log('')

  const start = Date.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildRequestBody()),
    })

    const elapsed = Date.now() - start
    const body = await response.text()

    if (!response.ok) {
      console.error(`❌ API 请求失败 (${response.status} ${response.statusText})，耗时 ${elapsed}ms`)
      console.error('响应内容:', body)
      process.exit(1)
    }

    let data
    try {
      data = JSON.parse(body)
    } catch {
      console.error('❌ 响应不是合法 JSON:', body)
      process.exit(1)
    }

    const { content, reasoning, finishReason } = parseAssistantMessage(data.choices?.[0])

    if (!content && !reasoning) {
      console.error('❌ 请求成功但未返回有效内容:', JSON.stringify(data, null, 2))
      process.exit(1)
    }

    console.log(`✅ API Key 可用，耗时 ${elapsed}ms`)

    if (finishReason === 'length') {
      console.log('⚠️  回复因 max_tokens 上限被截断，可适当调大 max_tokens')
    }

    console.log('')

    if (content) {
      console.log('模型回复:')
      console.log(content)
    }

    if (reasoning) {
      if (content) console.log('')
      console.log('推理过程 (reasoning):')
      console.log(reasoning)
    }

    if (data.usage) {
      console.log('')
      console.log('Token 用量:', data.usage)
    }
  } catch (error) {
    console.error('❌ 网络或请求异常:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

testLlmApi()
