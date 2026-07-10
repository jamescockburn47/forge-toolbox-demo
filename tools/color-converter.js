export function mount(root) {
  root.innerHTML = `
    <h2>Color Converter</h2>
    <label for="cc-hex">Hex</label>
    <input id="cc-hex" type="text" value="#e9d7a6" maxlength="7" spellcheck="false" />
    <label for="cc-rgb">RGB</label>
    <input id="cc-rgb" type="text" value="rgb(233, 215, 166)" spellcheck="false" />
    <div class="out" data-swatch style="height:60px;border-radius:7px;border:1px solid rgba(255,255,255,0.12);background:#e9d7a6"></div>
    <div class="out" data-status>—</div>
  `;
  
  const hexInput = root.querySelector("#cc-hex");
  const rgbInput = root.querySelector("#cc-rgb");
  const swatch = root.querySelector("[data-swatch]");
  const status = root.querySelector("[data-status]");
  
  function normalizeHex(s) {
    let h = s.trim().replace(/^#/, "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (/^[0-9a-fA-F]{6}$/.test(h)) return "#" + h.toLowerCase();
    return null;
  }
  
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  }
  
  function updateFromHex() {
    const norm = normalizeHex(hexInput.value);
    if (!norm) {
      status.textContent = "Invalid hex";
      return;
    }
    const { r, g, b } = hexToRgb(norm);
    rgbInput.value = `rgb(${r}, ${g}, ${b})`;
    swatch.style.background = norm;
    status.textContent = `${norm} • rgb(${r}, ${g}, ${b})`;
  }
  
  function updateFromRgb() {
    const m = rgbInput.value.trim().match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) {
      status.textContent = "Invalid rgb()";
      return;
    }
    const r = +m[1], g = +m[2], b = +m[3];
    if (r > 255 || g > 255 || b > 255) {
      status.textContent = "Invalid rgb()";
      return;
    }
    const hex = rgbToHex(r, g, b);
    hexInput.value = hex;
    swatch.style.background = hex;
    status.textContent = `${hex} • rgb(${r}, ${g}, ${b})`;
  }
  
  hexInput.addEventListener("input", updateFromHex);
  rgbInput.addEventListener("input", updateFromRgb);
  
  updateFromHex();
}
