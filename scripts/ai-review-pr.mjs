import fs from 'node:fs'

const diffPath = 'pr.diff'
const rulesPath = '.github/ai-review-rules.md'

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

Please review the following PR diff according to the project rules.

PROJECT RULES:
${rules}

PR DIFF:
${diff}

Please output in this format:

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
`

console.log('===== AI REVIEW PROMPT START =====')
console.log(prompt)
console.log('===== AI REVIEW PROMPT END =====')
