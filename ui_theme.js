// Simple theme switcher for demo (Settings writes sb.ui.theme).
(() => {
  const themes = {
    editorial: {
      "--bg":"#f7f3ee",
      "--ink":"#1d232a",
      "--muted":"#5f6b73",
      "--line":"#c9c3bb",
      "--soft":"#e6dfd6",
      "--panel":"#fbf9f6",
      "--active":"#efe6da",
      "--accent":"#0f5f63"
    },
    graphite: {
      "--bg":"#eef0f1",
      "--ink":"#1c1f23",
      "--muted":"#5b6168",
      "--line":"#c6cbd0",
      "--soft":"#dfe4e8",
      "--panel":"#f7f8f9",
      "--active":"#e9edf0",
      "--accent":"#0f7a57"
    },
    linen: {
      "--bg":"#f8f2ea",
      "--ink":"#1e241f",
      "--muted":"#6a6f66",
      "--line":"#d2c9bc",
      "--soft":"#e6ddd0",
      "--panel":"#fcf8f3",
      "--active":"#efe2d2",
      "--accent":"#8a6c3c"
    },
    batman: {
      "--bg":"#0F1115",
      "--ink":"#E6EAF0",
      "--muted":"#A8B0BC",
      "--line":"#303845",
      "--soft":"#2B3340",
      "--panel":"#161A21",
      "--active":"#1E242D",
      "--accent":"#2F4F8F"
    }
  };

  const applyTheme = (key) => {
    const theme = themes[key] || themes.editorial;
    const root = document.documentElement;
    Object.keys(theme).forEach((k) => root.style.setProperty(k, theme[k]));
    root.dataset.theme = key;
  };

  const key = localStorage.getItem("sb.ui.theme") || "editorial";
  applyTheme(key);
  window.UITheme = { applyTheme };
})();
