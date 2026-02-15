// Shared route guard for beta flow.
(() => {
  const page = document.body?.dataset?.page;
  if (!page || !window.UIStore) return;

  const store = UIStore.load();
  const hasU01 = !!store.u01;
  const hasCasefiles = Array.isArray(store.casefiles) && store.casefiles.length > 0;

  const redirect = (target) => {
    if (!window.location.href.includes(target)) {
      window.location.href = target;
    }
  };

  if (page === "auth" || page === "landing"){
    if (!hasU01) redirect("onboarding.html");
    else redirect("app.html");
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

  if (page === "casefile_new"){
    return;
  }

  if (page === "app" || page === "settings" || page === "feedback"){
    return;
  }
})();
