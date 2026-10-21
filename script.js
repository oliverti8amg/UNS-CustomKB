"use strict";

/* ==========================================================================
   Configuración: cambia aquí tus datos de contacto.
   ========================================================================== */
const CONFIG = {
  whatsappNumber: "34634616603",       // con prefijo de país, sin "+" ni espacios
  whatsappDisplay: "+34 634616603",  // cómo se muestra en la web
  instagramUser: "unspeed.es",            // usuario de Instagram, sin "@"
  softwareUrl: "",                     // enlace de descarga del software (si está vacío, lleva a la sección Software)
};

const DEFAULT_WA_TEXT = "Hola UnSpeed, me gustaría información sobre vuestros teclados Custom Kb.";

function waUrl(text) {
  return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text || DEFAULT_WA_TEXT);
}
function applyWa(anchor, text) {
  anchor.href = waUrl(text);
}

document.querySelectorAll("[data-wa]").forEach((a) => applyWa(a, a.dataset.waText));
document.querySelectorAll("[data-ig]").forEach((a) => { a.href = "https://instagram.com/" + CONFIG.instagramUser; });
if (CONFIG.softwareUrl) {
  document.querySelectorAll("[data-download]").forEach((a) => {
    a.href = CONFIG.softwareUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}
document.querySelectorAll("[data-handle]").forEach((el) => { el.textContent = "@" + CONFIG.instagramUser; });
document.querySelectorAll("[data-phone]").forEach((el) => { el.textContent = CONFIG.whatsappDisplay; });

/* ==========================================================================
   Teclados
   ========================================================================== */
const key = (label, code, w = 1, accent = false) => ({ label, code, w, accent });
const letters = (s) => s.split("").map((c) => key(c, "Key" + c));

/* Distribución 60% con leyendas (hero y software). Cada fila suma 15 unidades. */
const KEYS60 = [
  [key("Esc", "Escape", 1, true), ..."1234567890".split("").map((c) => key(c, "Digit" + c)),
    key("-", "Minus"), key("=", "Equal"), key("⌫", "Backspace", 2, true)],
  [key("Tab", "Tab", 1.5), ...letters("QWERTYUIOP"),
    key("[", "BracketLeft"), key("]", "BracketRight"), key("\\", "Backslash", 1.5)],
  [key("Caps", "CapsLock", 1.75), ...letters("ASDFGHJKL"),
    key(";", "Semicolon"), key("'", "Quote"), key("Enter", "Enter", 2.25, true)],
  [key("Shift", "ShiftLeft", 2.25), ...letters("ZXCVBNM"),
    key(",", "Comma"), key(".", "Period"), key("/", "Slash"), key("Shift", "ShiftRight", 2.75)],
  [key("Ctrl", "ControlLeft", 1.25), key("Win", "MetaLeft", 1.25), key("Alt", "AltLeft", 1.25),
    key("", "Space", 6.25), key("Alt", "AltRight", 1.25), key("Fn", "", 1.25),
    key("Menu", "ContextMenu", 1.25), key("Ctrl", "ControlRight", 1.25)],
];

function buildKeyboard(host, rows, tag) {
  const kb = document.createElement("div");
  kb.className = "kb";
  kb.style.setProperty("--units", rows[0].reduce((s, k) => s + k.w, 0));
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "kb-row";
    let x = 0;
    r.forEach((k) => {
      const el = document.createElement(tag);
      el.className = "key" + (k.accent ? " key--accent" : "") + (k.label.length > 1 ? " key--long" : "");
      el.style.setProperty("--w", k.w);
      el.style.setProperty("--c", x.toFixed(2));
      x += k.w;
      if (k.code) el.dataset.code = k.code;
      el.dataset.label = k.label || "Espacio";
      if (tag === "button") {
        el.type = "button";
        el.setAttribute("aria-pressed", "false");
        el.setAttribute("aria-label", "Tecla " + (k.label || "Espacio"));
      }
      const s = document.createElement("span");
      s.textContent = k.label;
      el.appendChild(s);
      row.appendChild(el);
    });
    kb.appendChild(row);
  });
  host.replaceChildren(kb);
  return kb;
}

/* Miniaturas sin leyendas. "1a" = tecla de 1 unidad con acento. */
const ones = (n) => Array(n).fill("1");
const L60 = [
  ["1a", ...ones(12), "2a"],
  ["1.5", ...ones(12), "1.5"],
  ["1.75", ...ones(11), "2.25a"],
  ["2.25", ...ones(10), "2.75"],
  ["1.25", "1.25", "1.25", "6.25", "1.25", "1.25", "1.25", "1.25"],
];
const L65 = [
  ["1a", ...ones(12), "2a", "1"],
  ["1.5", ...ones(12), "1.5", "1"],
  ["1.75", ...ones(11), "2.25a", "1"],
  ["2.25", ...ones(10), "1.75", "1", "1"],
  ["1.25", "1.25", "1.25", "6.25", ...ones(6)],
];
const L75 = [ones(16), ...L65];
/* 80% (TKL): "s0.5" = hueco invisible de 0.5 unidades. Cada fila suma 18.25. */
const L80 = [
  ["1a", "s1", ...ones(4), "s0.5", ...ones(4), "s0.5", ...ones(4), "s0.25", ...ones(3)],
  ["1", ...ones(12), "2a", "s0.25", ...ones(3)],
  ["1.5", ...ones(12), "1.5", "s0.25", ...ones(3)],
  ["1.75", ...ones(11), "2.25a", "s3.25"],
  ["2.25", ...ones(10), "2.75", "s1.25", "1", "s1"],
  ["1.25", "1.25", "1.25", "6.25", "1.25", "1.25", "1.25", "1.25", "s0.25", ...ones(3)],
];
const LAYOUTS = { 60: L60, 65: L65, 75: L75, 80: L80 };

const tokenWidth = (t) => parseFloat(t.startsWith("s") ? t.slice(1) : t);

function buildMini(host, layout) {
  const rows = LAYOUTS[layout];
  const kb = document.createElement("div");
  kb.className = "kb";
  kb.style.setProperty("--units", rows[0].reduce((s, t) => s + tokenWidth(t), 0));
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "kb-row";
    r.forEach((t) => {
      const el = document.createElement("span");
      el.className = "key" + (t.startsWith("s") ? " key--gap" : t.endsWith("a") ? " key--accent" : "");
      el.style.setProperty("--w", tokenWidth(t));
      row.appendChild(el);
    });
    kb.appendChild(row);
  });
  host.replaceChildren(kb);
}

document.querySelectorAll(".mini[data-layout]").forEach((el) => {
  buildMini(el, el.dataset.layout);
  el.classList.add("finish-" + el.dataset.finish);
});

/* ==========================================================================
   Hero: el teclado reacciona al teclado real y al tacto
   ========================================================================== */
(function heroKeyboard() {
  const host = document.getElementById("hero-kb");
  const lastEl = document.getElementById("last-key");
  const countEl = document.getElementById("key-count");
  const kb = buildKeyboard(host, KEYS60, "div");
  const byCode = new Map();
  kb.querySelectorAll("[data-code]").forEach((el) => byCode.set(el.dataset.code, el));

  let count = 0;
  const register = (el) => {
    count += 1;
    lastEl.textContent = el.dataset.label;
    countEl.textContent = String(count);
  };

  document.addEventListener("keydown", (e) => {
    const el = byCode.get(e.code);
    if (!el) return;
    el.classList.add("is-down");
    if (!e.repeat) register(el);
  });
  document.addEventListener("keyup", (e) => {
    const el = byCode.get(e.code);
    if (el) el.classList.remove("is-down");
  });
  window.addEventListener("blur", () => {
    kb.querySelectorAll(".is-down").forEach((el) => el.classList.remove("is-down"));
  });

  let held = null;
  kb.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".key");
    if (!el) return;
    held = el;
    el.classList.add("is-down");
    register(el);
  });
  const release = () => {
    if (held) held.classList.remove("is-down");
    held = null;
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
})();

/* ==========================================================================
   Configurador "Monta el tuyo"
   ========================================================================== */
(function builder() {
  const form = document.getElementById("builder");
  const preview = document.getElementById("preview");
  const summary = document.getElementById("summary");
  const waBtn = document.getElementById("builder-wa");

  const FORMAT = { 60: "60%", 65: "65%", 75: "75%", 80: "80%" };
  const SWITCH = { lineal: "Lineales", tactil: "Táctiles", clicky: "Clicky" };
  const FINISH = { graphite: "Negro", silver: "Blanco", blue: "Azul eléctrico" };

  function render() {
    const fd = new FormData(form);
    const format = fd.get("format");
    const sw = fd.get("switches");
    const finish = fd.get("finish");

    preview.className = "mini finish-" + finish;
    buildMini(preview, format);

    const rows = [
      ["Formato", FORMAT[format]],
      ["Switches", SWITCH[sw]],
      ["Acabado", FINISH[finish]],
      
    ];
    summary.replaceChildren(...rows.map(([k, v]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = k;
      dd.textContent = v;
      row.append(dt, dd);
      return row;
    }));

    const msg = [
      "Hola UnSpeed, quiero montar un Custom Kb:",
      ...rows.map(([k, v]) => "- " + k + ": " + v),
      "¿Me ayudáis con un presupuesto?",
    ].join("\n");
    applyWa(waBtn, msg);
  }

  form.addEventListener("change", render);
  form.addEventListener("submit", (e) => e.preventDefault());
  render();
})();

/* ==========================================================================
   Software: vista previa interactiva
   ========================================================================== */
(function softwarePreview() {
  const host = document.getElementById("app-kb");
  const nameEl = document.getElementById("sel-name");
  const mapEl = document.getElementById("sel-map");
  const brightEl = document.getElementById("bright");
  const brightOut = document.getElementById("bright-out");
  const kb = buildKeyboard(host, KEYS60, "button");
  const mapped = new Map();
  let selected = null;

  function select(el) {
    if (selected) selected.setAttribute("aria-pressed", "false");
    selected = el;
    el.setAttribute("aria-pressed", "true");
    nameEl.textContent = el.dataset.label;
    mapEl.disabled = false;
    mapEl.value = mapped.get(el) || "normal";
  }

  function assign(el, value) {
    mapped.set(el, value);
    el.toggleAttribute("data-mapped", value !== "normal");
  }

  kb.addEventListener("click", (e) => {
    const el = e.target.closest(".key");
    if (el) select(el);
  });
  mapEl.addEventListener("change", () => {
    if (selected) assign(selected, mapEl.value);
  });

  document.querySelectorAll('input[name="fx"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) host.className = "app-kb fx-" + input.value;
    });
  });

  const setBright = () => {
    host.style.setProperty("--bright", String(brightEl.value / 100));
    brightOut.textContent = brightEl.value + "%";
  };
  brightEl.addEventListener("input", setBright);
  setBright();

  /* Estado inicial de ejemplo: Caps convertida en Ctrl. */
  const caps = kb.querySelector('[data-code="CapsLock"]');
  assign(caps, "ctrl");
  select(caps);
})();

/* ==========================================================================
   Copiar número
   ========================================================================== */
(function copyPhone() {
  const btn = document.getElementById("copy-phone");
  const phone = document.querySelector("[data-phone]");
  let timer = null;

  function selectText(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  btn.addEventListener("click", async () => {
    let label = "Copiado";
    try {
      await navigator.clipboard.writeText(CONFIG.whatsappDisplay);
    } catch (_) {
      selectText(phone);
      label = "Seleccionado: copia con Ctrl+C";
    }
    btn.textContent = label;
    clearTimeout(timer);
    timer = setTimeout(() => { btn.textContent = "Copiar número"; }, 2200);
  });
})();
