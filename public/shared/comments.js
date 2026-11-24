(() => {
  "use strict";
  if (customElements.get("library-notes")) return;
  const source = document.currentScript;
  const configuredPage = source?.dataset.page || "library";
  const API = "https://chica.keicodes.dev/date/api/comments";
  const STORAGE = "chica.comments.access.v1";
  const MAX = 1200;
  const SLOTS = new Set(["1010", "1111", "1212", "111", "222", "333", "444", "555"]);
  const invitation = /^#comment-key=([A-Za-z0-9_-]{43})$/.exec(location.hash)?.[1] || "";
  let currentPage = configuredPage;
  if (configuredPage === "oras" && SLOTS.has(location.hash.slice(1))) currentPage = `oras-${location.hash.slice(1)}`;
  const readKey = () => { try { return localStorage.getItem(STORAGE) || ""; } catch { return ""; } };
  const saveKey = key => { try { key ? localStorage.setItem(STORAGE, key) : localStorage.removeItem(STORAGE); } catch { /* Access still works in this tab. */ } };
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const uuid = () => crypto.randomUUID();
  const draftKey = (page, author) => `chica.comments.draft.${page}.${author}`;
  const draft = (page, author, value) => {
    try {
      const key = draftKey(page, author);
      if (value === undefined) return sessionStorage.getItem(key) || "";
      value ? sessionStorage.setItem(key, value) : sessionStorage.removeItem(key);
    } catch { /* The visible draft remains available when storage is restricted. */ }
    return "";
  };
  const pendingDraft = (scope, value) => {
    try {
      const key = `chica.comments.pending.${scope}`;
      if (value === undefined) return JSON.parse(sessionStorage.getItem(key) || "null");
      value ? sessionStorage.setItem(key, JSON.stringify(value)) : sessionStorage.removeItem(key);
    } catch { /* In-memory retry tracking still works in this tab. */ }
    return null;
  };
  const style = `
    :host{display:block;box-sizing:border-box;width:calc(100% - 36px);max-width:760px;margin:48px auto 56px;color:#121111;font:16px/1.6 "DM Sans",system-ui,sans-serif;text-transform:none;text-align:left;letter-spacing:normal;color-scheme:light}
    *,*::before,*::after{box-sizing:border-box} [hidden]{display:none!important}
    .slip{background:#fdfdfb;border:1.5px solid #121111;box-shadow:5px 5px 0 #121111;padding:26px;position:relative}
    .eyebrow,.label,.who,.tag,.actions button,.unlock button,.feed-head button,.older,time,.count{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
    .eyebrow{color:#c8102e;margin:0 0 8px}.slip h2{font-family:"Playfair Display",Georgia,serif;font-weight:900;font-style:italic;font-size:clamp(28px,5vw,36px);line-height:1.15;letter-spacing:-.025em;margin:0 0 10px}
    .context{margin:0;color:#67635d;font-size:12px;overflow-wrap:anywhere}.head{padding-bottom:20px;border-bottom:1px solid #d6d3cb}.pair{display:flex;gap:8px;margin:18px 0 14px}.tag{padding:4px 9px;border:1px solid #121111;background:#f3f3f0}.tag.red{color:#c8102e;border-color:#c8102e}
    p{margin:0}.intro,.permanence{font-size:13px;line-height:1.65;color:#56514d}.intro{margin-bottom:16px}.permanence{margin:14px 0 0}.label{display:block;margin-bottom:7px}.field{margin-top:18px}
    input,textarea,button{font:inherit;border-radius:0}input,textarea{display:block;width:100%;max-width:100%;background:#fff;color:#121111;border:1.5px solid #99928a;padding:12px;font-size:16px;line-height:1.6;box-shadow:none}textarea{min-height:132px;resize:vertical}textarea::placeholder,input::placeholder{color:#78716b;opacity:1}
    button{cursor:pointer;min-height:44px;border:1.5px solid #121111;padding:10px 15px;background:#fdfdfb;color:#121111;font-weight:700}button:hover{background:#f3f3f0}button:disabled,button[aria-disabled=true]{opacity:.6;cursor:wait}.primary{background:#c8102e;color:#fff;border-color:#c8102e;box-shadow:3px 3px 0 #121111}.primary:hover{background:#121111;border-color:#121111}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #c8102e;outline-offset:3px}
    .unlock button{margin-top:12px}.identity{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:20px}.who{color:#c8102e}.identity button{font-size:10px;letter-spacing:.08em;min-height:44px;border-color:#d6d3cb}.count{text-align:right;color:#67635d;font-size:10px;margin-top:6px}.actions{display:flex;align-items:center;gap:16px;margin-top:14px}.actions .primary{min-width:205px}
    .status,.error{font-size:13px;line-height:1.6;margin-top:16px;overflow-wrap:anywhere}.status:empty,.error:empty{display:none}.error{color:#a30b24;border-left:3px solid #c8102e;padding-left:12px}.feed-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #121111;margin-top:28px;padding-top:16px}.feed-head h3{margin:0;font-size:11px;letter-spacing:.16em}.feed-head button{font-size:10px;border-color:#d6d3cb}
    ol{padding:0;list-style:none;margin:8px 0 0}li{border-bottom:1px solid #d6d3cb;padding:18px 0}.note-head{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:5px 14px;margin-bottom:8px}strong{font-size:12px;letter-spacing:.08em;text-transform:uppercase}.chicaaa{color:#c8102e}time{font-size:10px;letter-spacing:.04em;color:#67635d}.body{font-size:15px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;text-transform:none}.empty{padding:18px 0;color:#67635d;font-size:14px;line-height:1.7}.older{margin-top:18px}.hint{font-size:12px;color:#67635d;margin-top:10px}
    @media(max-width:480px){:host{width:calc(100% - 32px);margin:32px auto 42px}.slip{padding:18px 16px;box-shadow:3px 3px 0 #121111}.actions{display:block}.actions .primary,.unlock button,.older{width:100%}.head{padding-bottom:16px}time{font-size:10px}}
  `;

  class LibraryNotes extends HTMLElement {
    static get observedAttributes() { return ["page-key"]; }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.key = invitation || readKey();
      this.viewer = null;
      this.comments = [];
      this.next = null;
      this.generation = 0;
      this.pending = new Map();
    }
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.build();
      if (this.key) this.load();
    }
    attributeChangedCallback(_name, previous, next) {
      if (!this.initialized || previous === next) return;
      this.generation++;
      this.comments = [];
      this.next = null;
      this.status.textContent = "";
      this.error.textContent = "";
      this.updateContext();
      this.textarea.value = this.viewer ? draft(next, this.viewer.author) : "";
      this.updateCount();
      if (this.key) this.load();
      else this.renderList();
    }
    get page() { return this.getAttribute("page-key") || "library"; }
    build() {
      const css = make("style"); css.textContent = style;
      const section = make("section", "slip"); section.setAttribute("aria-labelledby", "notes-title");
      const head = make("header", "head");
      head.append(make("p", "eyebrow", "TALA SA PAHINA · CHICAAA + CHICO"));
      const title = make("h2", "", "Mga tala nating dalawa"); title.id = "notes-title";
      this.context = make("p", "context");
      head.append(title, this.context);
      section.append(head);
      this.gate = make("div", "gate");
      const pair = make("div", "pair"); pair.append(make("span", "tag red", "CHICAAA"), make("span", "tag", "CHICO"));
      this.gate.append(pair, make("p", "intro", "Isang munting espasyo para sa ating dalawa. Gamitin ang sarili mong private link o access code para mabasa ang mga tala at makapagsulat."));
      const unlock = make("form", "unlock");
      const accessLabel = make("label", "label", "PRIVATE LINK O ACCESS CODE"); accessLabel.htmlFor = "notes-access";
      this.access = make("input"); this.access.id = "notes-access"; this.access.type = "password"; this.access.autocomplete = "off"; this.access.required = true; this.access.maxLength = 200; this.access.spellcheck = false;
      const unlockButton = make("button", "primary", "BUKSAN ANG MGA TALA"); unlockButton.type = "submit";
      unlock.append(accessLabel, this.access, unlockButton);
      unlock.addEventListener("submit", event => {
        event.preventDefault();
        const input = this.access.value.trim();
        const key = /^https:\/\//.test(input) ? (() => { try { return /^#comment-key=([A-Za-z0-9_-]{43})$/.exec(new URL(input).hash)?.[1] || ""; } catch { return ""; } })() : input;
        if (!/^[A-Za-z0-9_-]{43}$/.test(key)) { this.error.textContent = "Pakigamit ang private link o access code na para sa iyo."; return; }
        this.key = key; this.load();
      });
      this.gate.append(unlock, make("p", "hint", "Buksan ang private link mo nang isang beses sa bawat browser. Dito lang maaalala kung sino ang nagsusulat."));
      section.append(this.gate);
      this.content = make("div"); this.content.hidden = true;
      const identity = make("div", "identity");
      this.who = make("span", "who");
      const change = make("button", "", "IBANG ACCESS"); change.type = "button";
      change.addEventListener("click", () => this.lock());
      identity.append(this.who, change);
      this.form = make("form");
      const field = make("div", "field");
      const label = make("label", "label", "MENSAHE MO"); label.htmlFor = "notes-message";
      this.textarea = make("textarea"); this.textarea.id = "notes-message"; this.textarea.rows = 4; this.textarea.maxLength = MAX; this.textarea.required = true; this.textarea.placeholder = "Mag-iwan ng tala kung kailan mo gusto…";
      this.textarea.setAttribute("aria-describedby", "notes-permanence notes-count");
      this.counter = make("p", "count", `0 / ${MAX}`); this.counter.id = "notes-count";
      this.textarea.addEventListener("input", () => { this.updateCount(); if (this.viewer) draft(this.page, this.viewer.author, this.textarea.value); });
      field.append(label, this.textarea, this.counter);
      const actions = make("div", "actions");
      this.submit = make("button", "primary", "ILAGAY SA PAHINA"); this.submit.type = "submit";
      actions.append(this.submit);
      const permanence = make("p", "permanence", "Kapag ipinadala, mananatili ang tala sa pahinang ito. Hindi na ito mae-edit o mabubura rito."); permanence.id = "notes-permanence";
      this.form.append(field, actions, permanence);
      this.form.addEventListener("submit", event => { event.preventDefault(); this.send(); });
      const feedHead = make("div", "feed-head");
      feedHead.append(make("h3", "", "MGA NAIWANG TALA"));
      this.refresh = make("button", "", "I-REFRESH ANG MGA TALA"); this.refresh.type = "button";
      this.refresh.addEventListener("click", () => this.load());
      feedHead.append(this.refresh);
      this.list = make("ol"); this.list.setAttribute("aria-label", "Mga tala nina Chicaaa at Chico");
      this.empty = make("p", "empty", "Wala pang tala sa pahinang ito. Bukas ang espasyong ito anumang oras.");
      this.older = make("button", "older", "MGA NAUNANG TALA"); this.older.type = "button"; this.older.hidden = true;
      this.older.addEventListener("click", () => this.load(true));
      this.content.append(identity, this.form, feedHead, this.empty, this.list, this.older);
      this.status = make("p", "status"); this.status.setAttribute("role", "status"); this.status.setAttribute("aria-live", "polite");
      this.error = make("p", "error"); this.error.setAttribute("role", "alert");
      section.append(this.content, this.status, this.error);
      this.shadowRoot.append(css, section);
      this.updateContext();
    }
    updateContext() {
      const slot = this.page.startsWith("oras-") ? this.page.slice(5) : "";
      this.context.textContent = slot ? `${slot.slice(0, -2)}:${slot.slice(-2)} · Mga Oras Natin` : document.title.split(" · ")[0] || "Library ni Chico";
    }
    updateCount() { this.counter.textContent = `${this.textarea.value.length} / ${MAX}`; }
    lock() {
      this.generation++;
      saveKey(""); this.key = ""; this.viewer = null; this.comments = []; this.next = null;
      this.gate.hidden = false; this.content.hidden = true; this.access.value = ""; this.textarea.value = "";
      this.status.textContent = ""; this.error.textContent = "";
      this.refresh.disabled = false; this.older.disabled = false; this.list.removeAttribute("aria-busy");
      this.access.focus();
    }
    async request(method, page, body, before, key = this.key) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const url = new URL(API); url.searchParams.set("page", page);
        if (before) url.searchParams.set("before", before);
        const response = await fetch(url, { method, headers: { authorization: `Bearer ${key}`, ...(body ? { "content-type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store", signal: controller.signal, credentials: "omit" });
        const result = await response.json();
        if (!response.ok || !result.ok) { const error = new Error(result.error || "network"); error.status = response.status; throw error; }
        return result;
      } finally { clearTimeout(timeout); }
    }
    async load(older = false) {
      if (!this.key || (older && !this.next)) return;
      const generation = ++this.generation, page = this.page, key = this.key;
      if (this.verifiedKey && key !== this.verifiedKey) { this.viewer = null; this.content.hidden = true; this.gate.hidden = false; }
      this.status.textContent = "BINUBUKLAT ANG MGA TALA…"; this.error.textContent = "";
      this.refresh.disabled = true; this.older.disabled = true;
      this.list.setAttribute("aria-busy", "true");
      try {
        const result = await this.request("GET", page, null, older ? this.next : null, key);
        if (generation !== this.generation) return;
        this.viewer = result.viewer; this.verifiedKey = key; saveKey(key);
        this.access.value = ""; this.gate.hidden = true; this.content.hidden = false;
        this.who.textContent = `NAGSUSULAT BILANG ${result.viewer.name.toUpperCase()}`;
        this.textarea.value = draft(page, result.viewer.author);
        this.updateCount();
        this.comments = older ? [...this.comments, ...result.comments] : result.comments;
        this.next = result.next;
        this.renderList();
        this.status.textContent = "";
      } catch (error) {
        if (generation !== this.generation) return;
        this.status.textContent = "";
        if (error.status === 401) {
          this.lock(); this.error.textContent = "Hindi nakilala ang access. Pakibuksan ang private link na para sa iyo.";
        } else this.error.textContent = "Hindi muna mabuksan ang mga tala. Nakatabi pa ang draft mo. Subukan muli.";
      } finally {
        if (generation === this.generation) { this.refresh.disabled = false; this.older.disabled = false; this.list.removeAttribute("aria-busy"); }
      }
    }
    renderList() {
      this.list.replaceChildren();
      const seen = new Set();
      for (const comment of this.comments) {
        const identity = `${comment.author}:${comment.id}`;
        if (seen.has(identity)) continue;
        seen.add(identity);
        const li = make("li"), article = make("article"), head = make("header", "note-head");
        head.append(make("strong", comment.author === "chicaaa" ? "chicaaa" : "", comment.name));
        const time = make("time");
        const date = new Date(comment.createdAt);
        time.dateTime = date.toISOString();
        time.textContent = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date) + " · PH";
        head.append(time);
        article.append(head, make("p", "body", comment.text)); li.append(article); this.list.append(li);
      }
      this.empty.hidden = seen.size > 0;
      this.older.hidden = !this.next;
    }
    async send() {
      if (this.sending || !this.viewer || !this.key) return;
      const text = this.textarea.value.trim();
      if (!text || text.length > MAX) { this.error.textContent = "May gusto ka bang isulat muna?"; this.textarea.focus(); return; }
      const page = this.page, viewer = this.viewer, key = this.key, scope = `${page}:${viewer.author}`;
      let pending = this.pending.get(scope) || pendingDraft(scope);
      if (!pending || pending.text !== text || !/^[a-f0-9-]{36}$/.test(pending.id || "")) pending = { id: uuid(), text };
      this.pending.set(scope, pending); pendingDraft(scope, pending);
      this.sending = true; this.submit.setAttribute("aria-disabled", "true"); this.submit.textContent = "INILALAGAY…"; this.textarea.readOnly = true;
      this.error.textContent = ""; this.status.textContent = "Inilalagay ang tala mo…";
      try {
        const result = await this.request("POST", page, { page, ...pending }, null, key);
        this.pending.delete(scope); pendingDraft(scope, null); draft(page, viewer.author, "");
        if (page === this.page && key === this.key) {
          this.textarea.value = ""; this.updateCount();
          this.comments.unshift(result.comment); this.renderList();
          this.status.textContent = "Nailagay na ang tala mo.";
        }
      } catch (error) {
        if (page === this.page && key === this.key) {
          this.status.textContent = "";
          if (error.status === 401) { this.lock(); this.error.textContent = "Pakibuksan muli ang private link mo. Nakatabi pa ang draft mo."; }
          else this.error.textContent = "Hindi pa nakumpirma ang pag-save. Nakatabi pa ang isinulat mo; pindutin muli ang Ilagay sa pahina para subukan ulit.";
        }
      } finally {
        this.sending = false; this.submit.removeAttribute("aria-disabled"); this.submit.textContent = "ILAGAY SA PAHINA"; this.textarea.readOnly = false;
      }
    }
  }
  customElements.define("library-notes", LibraryNotes);
  document.addEventListener("chica:comment-page", event => {
    if (configuredPage !== "oras" || !/^oras(?:-(?:1010|1111|1212|111|222|333|444|555))?$/.test(event.detail?.page || "")) return;
    currentPage = event.detail.page;
    document.querySelector("library-notes")?.setAttribute("page-key", currentPage);
  });
  const boot = () => {
    if (invitation && /^#comment-key=/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    if (document.querySelector("library-notes")) return;
    const notes = document.createElement("library-notes"); notes.setAttribute("page-key", currentPage);
    document.body.append(notes);
    window.addEventListener("storage", event => {
      if (event.key !== STORAGE) return;
      if (!event.newValue) notes.lock();
      else { notes.key = event.newValue; notes.load(); }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
