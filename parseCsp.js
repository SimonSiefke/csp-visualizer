const validValues = new Set([
  'default-src',
  'style-src',
  'script-src',
  'frame-src',
  'frame-ancestors',
  'font-src',
  'connect-src',
  'media-src',
  'object-src',
  'img-src',
  'base-uri',
  'block-all-mixed-content',
  'upgrade-insecure-requests',
  'report-uri',
])

const RE_KEY = /[a-zA-Z\d\-]+/
const RE_WHITESPACE = /^\s+/
const RE_VALUE = /^[^\s;]+/
const RE_COMMA = /^;/

export const parseCsp = (csp) => {
  let state = 'top'
  let next = null
  const result = Object.create(null)
  const warnings = []
  const errors = []
  let index = 0
  let key = ''
  outer: while (index < csp.length) {
    index
    switch (state) {
      case 'top':
        if ((next = csp.slice(index).match(RE_WHITESPACE))) {
          const text = next[0]
          state = 'top'
          index += text.length
          break
        }
        if ((next = csp.slice(index).match(RE_KEY))) {
          const text = next[0]
          if (result[text]) {
            warnings.push({ message: `duplicate key ${text}` })
          } else {
            result[text] = []
          }
          state = 'after-key'
          index += text.length
          key = text
          break
        }
        errors.push({
          message: 'parsing error',
          index,
          state,
          text: csp.slice(index, index + 10),
        })
        break outer
      case 'after-key':
        result
        csp.slice(index) //?
        csp.match(RE_WHITESPACE) //?
        if ((next = csp.slice(index).match(RE_COMMA))) {
          const text = next[0]
          state = 'top'
          index += text.length
          break
        }
        if ((next = csp.slice(index).match(RE_WHITESPACE))) {
          const text = next[0]
          state = 'after-whitespace'
          index += text.length
          break
        }
        errors.push({
          message: `parsing error`,
          index,
          state,
          text: csp.slice(index, index + 10),
        })
        break outer
      case 'after-whitespace':
        if ((next = csp.slice(index).match(RE_VALUE))) {
          const text = next[0]
          state = 'after-value'
          index += text.length
          result[key].push(text)
          break
        }
        errors.push({
          message: `parsing error`,
          index,
          state,
          text: csp.slice(index, index + 10),
        })
        break outer
      case 'after-value':
        if ((next = csp.slice(index).match(RE_WHITESPACE))) {
          const text = next[0]
          state = 'after-whitespace'
          index += text.length
          // result
          break
        }
        if ((next = csp.slice(index).match(RE_COMMA))) {
          const text = next[0]
          state = 'top'
          index += text.length
          break
        }
        errors.push({
          message: `parsing error`,
          index,
          state,
          text: csp.slice(index, index + 10),
        })
        break outer
      default:
        throw new Error('invalid state')
    }
  }
  return {
    result,
    warnings,
    errors,
  }
}
