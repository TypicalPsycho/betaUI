// Shared local store for demo flow (no backend).
(() => {
  const STORAGE_NS = "sb.ui.v1";
  const LAST_EMAIL_KEY = `${STORAGE_NS}::last_email`;

  const normalizeEmail = (value) => (value || "").trim().toLowerCase();
  const keyFor = (email) => `${STORAGE_NS}::${email || "anon"}`;
  const getActiveEmail = () => normalizeEmail(localStorage.getItem(LAST_EMAIL_KEY) || "");

  const load = (email) => {
    try{
      const activeEmail = normalizeEmail(email) || getActiveEmail();
      const raw = localStorage.getItem(keyFor(activeEmail || "anon"));
      if (raw) return JSON.parse(raw);
    }catch(_){}
    return {
      me: null,
      auth: { isAuthed: false },
      u01: null,
      u03: {},
      casefiles: [],
      activeCaseId: null,
      messages: {},
      preferences: {},
      feedback: []
    };
  };

  const save = (store, email) => {
    try{
      const activeEmail = normalizeEmail(email)
        || normalizeEmail(store?.me?.email)
        || getActiveEmail();
      const clean = { ...store };
      delete clean.preferences;
      delete clean.feedback;
      localStorage.setItem(keyFor(activeEmail || "anon"), JSON.stringify(clean));
      if (activeEmail){
        localStorage.setItem(LAST_EMAIL_KEY, activeEmail);
      }
    }catch(_){}
  };

  const clear = (email) => {
    try{
      const activeEmail = normalizeEmail(email) || getActiveEmail();
      localStorage.removeItem(keyFor(activeEmail || "anon"));
    }catch(_){}
  };

  const activateUser = (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return;
    const currentEmail = getActiveEmail();
    if (currentEmail === normalized){
      return;
    }
    const targetKey = keyFor(normalized);
    const existing = localStorage.getItem(targetKey);
    if (!existing){
      const anonKey = keyFor(currentEmail || "anon");
      const anonRaw = localStorage.getItem(anonKey);
      if (anonRaw){
        try{
          const anonStore = JSON.parse(anonRaw);
          const anonEmail = normalizeEmail(anonStore?.me?.email);
          if (anonEmail && anonEmail === normalized){
            localStorage.setItem(targetKey, anonRaw);
          }
        }catch(_){}
      }
    }
    localStorage.setItem(LAST_EMAIL_KEY, normalized);
  };

  const seed = () => {
    const store = load();
    const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
    store.me = store.me || { id: id(), email: "demo@signalbench.ai" };
    store.auth.isAuthed = true;
    store.u01 = store.u01 || { fullName: "Brant Nieminski", nickname: "Brant" };
    store.casefiles = [
      { id: id(), role: "CFO", company: "SignalBench", stage: "screen" },
      { id: id(), role: "CFO", company: "McDonalds", stage: "validate" },
      { id: id(), role: "CFO", company: "Tractor Supply", stage: "advance" }
    ];
    store.activeCaseId = store.casefiles[0].id;
    store.messages[store.activeCaseId] = [
      { id: id(), role: "assistant", content: "Welcome back. Ready to screen this role?", createdAt: new Date().toISOString() }
    ];
    save(store);
    return store;
  };

  window.UIStore = { load, save, clear, seed, activateUser };
})();
