// The worked example every other tool follows: export `mount(root)`, build the
// UI into `root`, keep everything self-contained (no shared state, no globals).
export function mount(root) {
  root.innerHTML = `
    <h2>Clock</h2>
    <div class="out" data-clock style="font-size:22px;color:#e9d7a6">—</div>`;
  const out = root.querySelector("[data-clock]");
  const tick = () => { out.textContent = new Date().toLocaleTimeString(); };
  tick();
  setInterval(tick, 1000);
}
