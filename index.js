import { parseCsp } from './parseCsp.js'

const $Csp = document.getElementById('Csp')
const $Output = document.getElementById('Output')

const handleChange = () => {
  const csp = $Csp.value
  const parsedCsp = parseCsp(csp)

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
}

$Csp.oninput = handleChange
