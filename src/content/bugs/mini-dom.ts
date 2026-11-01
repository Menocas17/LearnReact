/**
 * Mini DOM para los bugs del módulo 4. Los tests corren en un Web Worker (y en Node en CI),
 * donde no hay document: este archivo se añade a los tests como "/mini-dom.js".
 * Implementa lo justo: árbol, selectores simples, eventos con captura y burbujeo.
 */
export const miniDom = `// Mini DOM de pruebas: árbol de nodos y eventos con captura y burbujeo.
function matchesOne(node, sel) {
  if (sel.startsWith("#")) return node.id === sel.slice(1);
  if (sel.startsWith(".")) return node.classList.contains(sel.slice(1));
  const attr = sel.match(/^\\[data-([\\w-]+)\\]$/);
  if (attr) return attr[1].replace(/-(\\w)/g, (_, c) => c.toUpperCase()) in node.dataset;
  return node.tagName === sel.toUpperCase();
}

class ClassList {
  constructor() { this.set = new Set(); }
  add(...c) { c.forEach((x) => this.set.add(x)); }
  remove(...c) { c.forEach((x) => this.set.delete(x)); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const on = force ?? !this.set.has(c);
    on ? this.set.add(c) : this.set.delete(c);
    return on;
  }
  toString() { return [...this.set].join(" "); }
}

export class Element {
  constructor(tag, { id = "", className = "", dataset = {}, text = "", value = "" } = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new ClassList();
    if (className) this.classList.add(...className.split(" "));
    this.dataset = { ...dataset };
    this.children = [];
    this.parentNode = null;
    this.listeners = [];
    this.value = value;
    this._text = text;
    this._html = null;
  }
  get className() { return this.classList.toString(); }
  append(...nodes) {
    for (const n of nodes) {
      n.remove();
      n.parentNode = this;
      this.children.push(n);
    }
    return this;
  }
  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((c) => c !== this);
    this.parentNode = null;
  }
  get textContent() { return this._html ?? this._text + this.children.map((c) => c.textContent).join(""); }
  set textContent(v) { this.children.forEach((c) => (c.parentNode = null)); this.children = []; this._html = null; this._text = String(v); }
  /** innerHTML guarda el HTML tal cual: interpretaría etiquetas (y scripts) del texto. */
  get innerHTML() { return this._html ?? this.textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  set innerHTML(v) { this.textContent = ""; this._html = String(v); }
  matches(sel) { return matchesOne(this, sel); }
  closest(sel) {
    for (let n = this; n; n = n.parentNode) if (n.matches(sel)) return n;
    return null;
  }
  querySelectorAll(sel) {
    const out = [];
    const walk = (n) => n.children.forEach((c) => { if (c.matches(sel)) out.push(c); walk(c); });
    walk(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
  addEventListener(type, fn, options = false) {
    const capture = typeof options === "boolean" ? options : !!options.capture;
    const once = typeof options === "object" && !!options.once;
    if (this.listeners.some((l) => l.type === type && l.fn === fn && l.capture === capture)) return;
    this.listeners.push({ type, fn, capture, once });
  }
  removeEventListener(type, fn, options = false) {
    const capture = typeof options === "boolean" ? options : !!options.capture;
    this.listeners = this.listeners.filter((l) => !(l.type === type && l.fn === fn && l.capture === capture));
  }
  dispatchEvent(event) {
    const path = [];
    for (let n = this; n; n = n.parentNode) path.unshift(n);
    event.target = this;
    const run = (node, phase) => {
      if (event._stopped) return;
      event.currentTarget = node;
      event.eventPhase = phase;
      for (const l of [...node.listeners]) {
        if (l.type !== event.type) continue;
        if (phase === 1 && !l.capture) continue;
        if (phase === 3 && l.capture) continue;
        if (l.once) node.removeEventListener(l.type, l.fn, l.capture);
        l.fn.call(node, event);
        if (event._immediate) return;
      }
    };
    for (const n of path.slice(0, -1)) run(n, 1);
    run(this, 2);
    if (event.bubbles) for (const n of path.slice(0, -1).reverse()) run(n, 3);
    event.currentTarget = null;
    return !event.defaultPrevented;
  }
}

export class Event {
  constructor(type, { bubbles = true, cancelable = true } = {}) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = 0;
  }
  preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
  stopPropagation() { this._stopped = true; }
  stopImmediatePropagation() { this._stopped = true; this._immediate = true; }
}

export const h = (tag, props, ...children) => new Element(tag, props).append(...children);
`;
