// Base64 encode/decode tool. Handles UTF-8 correctly and shows a friendly
// message on invalid input. Self-contained — no globals, no libs, plain DOM.
export function mount(root) {
  root.innerHTML = `
    <h2>Base64</h2>
    <label for="b64-input">Input</label>
    <textarea id="b64-input" placeholder="Text or Base64 to convert…"></textarea>
    <button data-encode>Encode</button>
    <button data-decode>Decode</button>
    <div class="out" data-out></div>
  `;
  
  const input = root.querySelector("#b64-input");
  const out = root.querySelector("[data-out]");
  const encodeBtn = root.querySelector("[data-encode]");
  const decodeBtn = root.querySelector("[data-decode]");
  
  // Encode UTF-8 string to Base64
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  // Decode Base64 to UTF-8 string
  function base64ToUtf8(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  
  function show(text, isError = false) {
    out.textContent = text;
    out.style.color = isError ? "#e07f7f" : "";
  }
  
  encodeBtn.addEventListener("click", () => {
    const value = input.value;
    if (!value) {
      show("Enter some text to encode.", true);
      return;
    }
    try {
      show(utf8ToBase64(value));
    } catch (err) {
      show("Could not encode: " + err.message, true);
    }
  });
  
  decodeBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      show("Enter some Base64 to decode.", true);
      return;
    }
    try {
      show(base64ToUtf8(value));
    } catch (err) {
      show("Invalid Base64 — please check your input.", true);
    }
  });
}
