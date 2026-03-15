// Shared route guard for beta flow.
(() => {
  const page = document.body?.dataset?.page;
  if (!page || !window.UIStore || !window.SBAuth) return;

  const API_BASE = window.SB_API_BASE || "/api";
  const PUBLIC_PAGES = new Set(["landing", "auth", "privacy", "terms"]);

  const redirect = (target) => {
    if (!window.location.href.includes(target)) {
      window.location.href = target;
    }
  };

  const getSession = async () => {
    try{
      return await SBAuth.getSession();
    } catch (_err){
      return null;
    }
  };

  const hydrateIdentity = async () => {
    try{
      const res = await SBAuth.fetch(`${API_BASE}/whoami`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.email) return null;
      UIStore.activateUser?.(data.email);
      const store = UIStore.load();
      store.auth = { ...(store.auth || {}), isAuthed: true, provider: "supabase" };
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
      return data;
    } catch (_err){
      return null;
    }
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
        SBAuth.fetch(`${API_BASE}/u01?${query}`),
        SBAuth.fetch(`${API_BASE}/casefiles?${query}`)
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

  const applyGuard = (store, hasSession) => {
    const hasU01 = !!store.u01;
    const hasCasefiles = Array.isArray(store.casefiles) && store.casefiles.length > 0;

    if (!hasSession){
      if (PUBLIC_PAGES.has(page)) return;
      redirect("auth.html");
      return;
    }

    if (page === "auth"){
      redirect("landing.html");
      return;
    }

    if (page === "landing"){
      if (hasU01){
        if (!hasCasefiles) redirect("casefile_new.html");
        else redirect("app.html");
      }
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
    const session = await getSession();
    const hasSession = !!session?.access_token;
    if (hasSession){
      await hydrateIdentity();
      await hydrateRemoteState();
    } else {
      const store = UIStore.load();
      store.auth = { ...(store.auth || {}), isAuthed: false };
      UIStore.save(store);
    }
    applyGuard(UIStore.load(), hasSession);
  };

  bootstrap();
})();
