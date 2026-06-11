import fs from 'node:fs'

const diffPath = 'pr.diff'
const rulesPath = '.github/ai-review-rules.md'

const { OPENAI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER } = process.env

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
}

requireEnv('OPENAI_API_KEY', OPENAI_API_KEY)
requireEnv('GITHUB_TOKEN', GITHUB_TOKEN)
requireEnv('GITHUB_REPOSITORY', GITHUB_REPOSITORY)
requireEnv('PR_NUMBER', PR_NUMBER)

if (!fs.existsSync(diffPath)) {
  console.error('Missing pr.diff')
  process.exit(1)
}

if (!fs.existsSync(rulesPath)) {
  console.error('Missing .github/ai-review-rules.md')
  process.exit(1)
}

const diff = fs.readFileSync(diffPath, 'utf8')
const rules = fs.readFileSync(rulesPath, 'utf8')

const prompt = `
You are a senior AI code reviewer for a Web3D TypeScript repository.

Review the following Pull Request diff according to the project rules.

PROJECT RULES:
${rules}

PR DIFF:
${diff}

Output in this exact Markdown format:

## Risk Level
Low / Medium / High / Blocker

## Key Findings
- [Severity] File or area: issue, impact, suggestion

## Web3D-Specific Risks
- Rendering performance
- Resource lifecycle
- Interaction state
- Asset loading

## Testing Suggestions
- Suggested tests

## Human Reviewer Focus
- Items human reviewer should verify

Rules:
- Be concise.
- Focus only on practical risks.
- Do not invent issues.
- If there are no meaningful issues, say so.
- Do not comment on pure formatting unless it affects maintainability.
`

async function callAI() {
  const response = await fetch('https://aigw-gzgy2.cucloud.cn:8443/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-5.1',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const outputText = data.choices?.[0]?.message?.content

  if (!outputText) {
    console.log(JSON.stringify(data, null, 2))
    throw new Error('AI API returned empty output')
  }

  return outputText
}

async function postPrComment(body) {
  const [owner, repo] = GITHUB_REPOSITORY.split('/')

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${PR_NUMBER}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: `## AI Code Review\n\n${body}`,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub comment failed: ${response.status} ${errorText}`)
  }
}

try {
  const review = await callAI()

  console.log('===== AI REVIEW RESULT START =====')
  console.log(review)
  console.log('===== AI REVIEW RESULT END =====')

  await postPrComment(review)

  console.log('AI review comment posted successfully.')
} catch (error) {
  console.error(error)
  process.exit(1)
}
