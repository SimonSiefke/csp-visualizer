import { parseCsp } from './parseCsp.js'

const $Csp = document.getElementById('Csp')
let $Output = document.getElementById('Output')

const compress = (value) => LZString.compressToBase64(value)

const decompress = (value) => LZString.decompressFromBase64(value)

const updateUrl = () => {
  const value = $Csp.value
  const compressed = compress(value)

  const newUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    '?csp=' +
    compressed
  history.replaceState({ path: newUrl }, '', newUrl)
}

let pending = false

const updateUrlThrottled = () => {
  if (pending) {
    return
  }
  pending = true
  updateUrl()
  setTimeout(() => {
    updateUrl()
    pending = false
  }, 30)
}

const handleChange = () => {
  const csp = $Csp.value
  const parsedCsp = parseCsp(csp)
  if (parsedCsp.errors.length > 0) {
    const $NewOutput = document.createElement('pre')
    $NewOutput.textContent = JSON.stringify(parsedCsp.errors, null, 1)
    $Output.replaceWith($NewOutput)
    $Output = $NewOutput
  } else {
    let $Dl = document.createElement('dl')
    for (const [key, values] of Object.entries(parsedCsp.result)) {
      const $Dt = document.createElement('dt')
      $Dt.textContent = key
      $Dl.append($Dt)
      const sortedValues = values.slice().sort((a, b) => a.localeCompare(b))
      for (const value of sortedValues) {
        const $Dd = document.createElement('dd')
        $Dd.textContent = value
        $Dl.append($Dd)
      }
    }

    $Output.replaceWith($Dl)
    $Output = $Dl
  }

  updateUrlThrottled()
}

if ('URLSearchParams' in window) {
  const searchParams = new URLSearchParams(window.location.search)
  const csp = searchParams.get('csp')
  const decompressed = decompress(csp)
  $Csp.value = decompressed
  handleChange()
}

$Csp.oninput = handleChange
