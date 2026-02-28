// Shared route guard for beta flow.
(() => {
  const page = document.body?.dataset?.page;
  if (!page || !window.UIStore) return;

  const API_BASE = window.SB_API_BASE || "/api";

  const hydrateIdentity = async () => {
    try{
      const res = await fetch(`${API_BASE}/whoami`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.email) return;
      UIStore.activateUser?.(data.email);
      const store = UIStore.load();
      store.me = store.me || { id: data.user_id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), email: data.email };
      store.me.email = data.email;
      if (data.user_id){
        store.me.id = data.user_id;
      }
      store.orch = store.orch || { userId: data.user_id || store.me.id, caseMap: {} };
      if (data.user_id){
        store.orch.userId = data.user_id;
      }
      UIStore.save(store);
    }catch(_err){}
  };

  const hydrateRemoteState = async () => {
    try{
      const store = UIStore.load();
      const userId = store.orch?.userId || store.me?.id || null;
      const userEmail = store.me?.email || null;
      if (!userId && !userEmail) return;
      const params = new URLSearchParams();
      if (userId) params.set("user_id", userId);
      else if (userEmail) params.set("user_email", userEmail);
      const query = params.toString();
      const [u01Res, caseRes] = await Promise.all([
        fetch(`${API_BASE}/u01?${query}`, { credentials: "include" }),
        fetch(`${API_BASE}/casefiles?${query}`, { credentials: "include" })
      ]);
      const next = UIStore.load();
      if (u01Res.ok){
        const u01Data = await u01Res.json();
        if (u01Data?.u01) next.u01 = u01Data.u01;
      }
      if (caseRes.ok){
        const caseData = await caseRes.json();
        if (Array.isArray(caseData?.casefiles)) next.casefiles = caseData.casefiles;
      }
      UIStore.save(next);
    }catch(_err){}
  };

  const redirect = (target) => {
    if (!window.location.href.includes(target)) {
      window.location.href = target;
    }
  };

  const applyGuard = (store) => {
    const hasU01 = !!store.u01;
    const hasCasefiles = Array.isArray(store.casefiles) && store.casefiles.length > 0;

    if (page === "auth"){
      redirect("landing.html");
      return;
    }

    if (page === "landing"){
      return;
    }

    if (!hasU01){
      redirect("onboarding.html");
      return;
    }

    if (page === "onboarding"){
      if (!hasCasefiles) redirect("casefile_new.html");
      else redirect("app.html");
      return;
    }
  };

  const bootstrap = async () => {
    await hydrateIdentity();
    await hydrateRemoteState();
    applyGuard(UIStore.load());
  };
  bootstrap();
})();
