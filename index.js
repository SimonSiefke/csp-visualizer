import { parseCsp } from "./parseCsp.js";

const $Url = document.getElementById("Url");
const $Form = document.getElementById("Form");
let $Output = document.getElementById("Output");

const compress = (value) => LZString.compressToBase64(value);

const decompress = (value) => LZString.decompressFromBase64(value);

const updateUrl = () => {
  const value = $Url.value;
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?url=" +
    encodeURIComponent(value);
  history.pushState({ path: newUrl }, "", newUrl);
};

let pending = false;

const updateUrlThrottled = () => {
  if (pending) {
    return;
  }
  pending = true;
  updateUrl();
  setTimeout(() => {
    updateUrl();
    pending = false;
  }, 30);
};

const handleChange = async (event) => {
  const $NewOutput = document.createElement("small");
  $NewOutput.textContent = "(loading)";
  $Output.replaceWith($NewOutput);
  $Output = $NewOutput;
  if (event) {
    event.preventDefault();
  }
  const url = $Url.value;
  if (!url) {
    return;
  }
  let csp = "";
  try {
    const res = await fetch(`https://cors.bridged.cc/${url}`);
    if (res.status === 404) {
      const $NewOutput = document.createElement("small");
      $NewOutput.textContent = "(not found)";
      $Output.replaceWith($NewOutput);
      $Output = $NewOutput;
      return;
    }
    const headers = res.headers;
    csp = headers.get("Content-Security-Policy") || "";
  } catch (error) {
    const $NewOutput = document.createElement("small");
    $NewOutput.textContent = `(error ${error})`;
    $Output.replaceWith($NewOutput);
    $Output = $NewOutput;
    return;
  }
  if (!csp) {
    const $NewOutput = document.createElement("small");
    $NewOutput.textContent = "(empty csp)";
    $Output.replaceWith($NewOutput);
    $Output = $NewOutput;
    return;
  }
  const parsedCsp = parseCsp(csp);
  if (parsedCsp.errors.length > 0) {
    const $NewOutput = document.createElement("pre");
    $NewOutput.textContent = JSON.stringify(parsedCsp.errors, null, 1);
    $Output.replaceWith($NewOutput);
    $Output = $NewOutput;
  } else {
    let $Dl = document.createElement("dl");
    for (const [key, values] of Object.entries(parsedCsp.result)) {
      const $Dt = document.createElement("dt");
      $Dt.textContent = key;
      $Dt.id = key;
      $Dl.append($Dt);

      const sortedValues = values.slice().sort((a, b) => a.localeCompare(b));
      for (const value of sortedValues) {
        const $Dd = document.createElement("dd");
        $Dd.textContent = value;
        $Dl.append($Dd);
      }
    }

    $Output.replaceWith($Dl);
    $Output = $Dl;
  }

  updateUrlThrottled();
};

if ("URLSearchParams" in window) {
  const searchParams = new URLSearchParams(window.location.search);
  const url = searchParams.get("url");
  if (url) {
    const decoded = decodeURIComponent(url);
    $Url.value = decoded;
    handleChange();
  }
}

$Form.onsubmit = handleChange;
// $Url.oninput = handleChange
