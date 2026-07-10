export function mount(root) {
  root.innerHTML = `
    <h2>Timestamp Converter</h2>
    <label>Unix epoch</label>
    <div style="display:flex;gap:6px">
      <input data-ts type="text" inputmode="numeric" placeholder="e.g. 1700000000" />
      <select data-unit>
        <option value="s">seconds</option>
        <option value="ms">milliseconds</option>
      </select>
    </div>
    <button data-from-ts>To date</button>
    <div class="out" data-ts-out></div>
    
    <label>Date (YYYY-MM-DD HH:MM:SS)</label>
    <input data-date type="text" placeholder="2024-01-15 12:00:00" />
    <button data-to-ts>To timestamp</button>
    <div class="out" data-date-out></div>
    
    <button data-now>Use current time</button>
  `;
  // ... logic
}
