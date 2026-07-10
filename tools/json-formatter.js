// JSON Formatter: paste raw JSON, pretty-print it (2-space indent), or see a
// clear parse error. Self-contained — no globals, no libraries.
export function mount(root) {
  root.innerHTML = `
    <h2>JSON Formatter</h2>
    <label for="jf-input">Raw JSON</label>
    <textarea id="jf-input" placeholder='Paste JSON here, e.g. {"hello":"world"}' spellcheck="false"></textarea>
    <button type="button" data-jf-format>Format</button>
    <div class="out" data-jf-out>—</div>`;

  const input = root.querySelector("#jf-input");
  const out = root.querySelector("[data-jf-out]");
  const btn = root.querySelector("[data-jf-format]");

  const format = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      out.textContent = "—";
      out.style.color = "";
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      out.textContent = JSON.stringify(parsed, null, 2);
      out.style.color = "";
    } catch (err) {
      out.textContent = `Parse error: ${err.message}`;
      out.style.color = "#e07a7a";
    }
  };

  btn.addEventListener("click", format);
  input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      format();
    }
  });
}
