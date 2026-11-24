import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";

const key = "a".repeat(43);
const viewer = { author: "chicaaa", name: "Chicaaa" };
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
let notes;
beforeAll(() => { window.eval(readFileSync("public/shared/comments.js", "utf8")); });
beforeEach(() => {
  document.body.replaceChildren(); localStorage.clear(); sessionStorage.clear();
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("fetch", vi.fn(async () => response({ ok: true, viewer, comments: [], next: null })));
});
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });
function mount(authenticated = true) {
  if (authenticated) localStorage.setItem("chica.comments.access.v1", key);
  notes = document.createElement("library-notes"); notes.setAttribute("page-key", "ilychicaaa"); document.body.append(notes);
  return notes;
}
describe("shared two-person notes", () => {
  it("keeps the comment list and composer locked without a private key", () => {
    mount(false);
    expect(notes.content.hidden).toBe(true);
    expect(notes.gate.hidden).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses the server-verified name, safely displays text, and has no destructive actions", async () => {
    fetch.mockResolvedValue(response({ ok: true, viewer, comments: [{ id: "1", author: "chico", name: "Chico", text: '<img src=x onerror="alert(1)">\nhello', createdAt: 1795495000000 }], next: null }));
    mount();
    await waitFor(() => expect(notes.content.hidden).toBe(false));
    expect(notes.who.textContent).toContain("CHICAAA");
    expect(notes.list.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(notes.list.querySelector("img")).toBeNull();
    expect(notes.list.querySelector("button")).toBeNull();
    expect(notes.list.querySelector("time").textContent).toContain("PH");
  });
  it("keeps a failed draft and retries the same id after uncertain network delivery", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "A note for you";
    notes.textarea.dispatchEvent(new Event("input"));
    fetch.mockRejectedValueOnce(new Error("Network interrupted"));
    await notes.send();
    const first = JSON.parse(fetch.mock.calls.at(-1)[1].body);
    expect(notes.textarea.value).toBe("A note for you");
    expect(notes.error.textContent).toContain("Nakatabi");
    fetch.mockImplementationOnce(async (_url, options) => response({ ok: true, comment: { ...JSON.parse(options.body), ...viewer, createdAt: Date.now() } }, 201));
    await notes.send();
    const second = JSON.parse(fetch.mock.calls.at(-1)[1].body);
    expect(second.id).toBe(first.id);
    expect(notes.textarea.value).toBe("");
    expect(notes.list.textContent).toContain("A note for you");
  });
  it("blocks double submits and restores the composer after an error", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "Only once";
    let finish;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const sending = notes.send();
    await notes.send();
    expect(fetch.mock.calls.filter(([, options]) => options.method === "POST")).toHaveLength(1);
    expect(notes.textarea.readOnly).toBe(true);
    finish(response({ ok: false, error: "storage" }, 503)); await sending;
    expect(notes.textarea.readOnly).toBe(false);
    expect(notes.textarea.value).toBe("Only once");
  });
  it("reuses a pending id after the component is recreated", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "Uncertain delivery"; notes.textarea.dispatchEvent(new Event("input"));
    fetch.mockRejectedValueOnce(new Error("Disconnected"));
    await notes.send();
    const id = JSON.parse(fetch.mock.calls.at(-1)[1].body).id;
    notes.remove(); mount();
    await waitFor(() => expect(notes.viewer).not.toBeNull());
    expect(notes.textarea.value).toBe("Uncertain delivery");
    fetch.mockImplementationOnce(async (_url, options) => response({ ok: true, comment: { ...JSON.parse(options.body), ...viewer, createdAt: Date.now() } }));
    await notes.send();
    expect(JSON.parse(fetch.mock.calls.at(-1)[1].body).id).toBe(id);
  });
  it("rejects stale list responses when moving to another page", async () => {
    let finishFirst;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }));
    mount();
    notes.setAttribute("page-key", "oras-1212");
    await waitFor(() => expect(notes.content.hidden).toBe(false));
    finishFirst(response({ ok: true, viewer, comments: [{ id: "old", author: "chico", name: "Chico", text: "wrong page", createdAt: 1 }], next: null }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(notes.list.textContent).not.toContain("wrong page");
    expect(new URL(fetch.mock.calls[1][0]).searchParams.get("page")).toBe("oras-1212");
  });
  it("restores a separate draft for each thread", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "12:12 draft"; notes.textarea.dispatchEvent(new Event("input"));
    notes.setAttribute("page-key", "date");
    await waitFor(() => expect(notes.textarea.value).toBe(""));
    notes.setAttribute("page-key", "ilychicaaa");
    await waitFor(() => expect(notes.textarea.value).toBe("12:12 draft"));
  });
  it("does not wipe a visible draft on refresh when session storage is blocked", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "Keep the visible text";
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    await notes.load();
    expect(notes.textarea.value).toBe("Keep the visible text");
    spy.mockRestore();
  });
  it("retains a confirmed note when a refresh returns an older list", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.textarea.value = "Saved already";
    fetch.mockImplementationOnce(async (_url, options) => response({ ok: true, comment: { ...JSON.parse(options.body), ...viewer, createdAt: Date.now() } }, 201));
    await notes.send(); await notes.load();
    expect(notes.list.textContent).toContain("Saved already");
  });
  it("a wrong candidate key does not remove valid access in other tabs", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    notes.key = "x".repeat(43);
    fetch.mockResolvedValueOnce(response({ ok: false, error: "access" }, 401));
    await notes.load();
    expect(localStorage.getItem("chica.comments.access.v1")).toBe(key);
  });
  it("a late read cannot undo a newer cross-tab lock", async () => {
    mount(); await waitFor(() => expect(notes.viewer).not.toBeNull());
    let finish;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const loading = notes.load();
    localStorage.setItem("chica.comments.lock.v1", "new-lock");
    localStorage.removeItem("chica.comments.access.v1");
    finish(response({ ok: true, viewer, comments: [], next: null }));
    await loading;
    expect(localStorage.getItem("chica.comments.access.v1")).toBeNull();
    expect(notes.content.hidden).toBe(true);
  });
});
