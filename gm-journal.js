(function () {
  const COL_TAB_KEY = "dh_journal_col_tab_v1";
  const colTabButtons = Array.from(document.querySelectorAll(".col-tab-btn"));
  const mainFrame = document.getElementById("calcEmbedFrame");
  const creatorFrame = document.getElementById("creatorEmbedFrame");
  let activeTab = localStorage.getItem(COL_TAB_KEY) || "talents";
  let reloadTimer = null;

  function getMainEmbedStyleText() {
    const showTalents = activeTab === "talents";
    return `
      html, body { height: 100% !important; min-height: 0 !important; }
      .column-controls { display: none !important; }
      .gap-icons-panel, .plan-panel, #mobileStickyHeader, #mobileSectionNav, #mobileLevelPill { display: none !important; }
      .layout {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 12px !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        padding: 10px !important;
      }
      .talents-panel {
        display: ${showTalents ? "block" : "none"} !important;
        height: 100% !important;
        min-height: 0 !important;
        overflow: auto !important;
      }
      .skills-panel {
        display: ${showTalents ? "none" : "block"} !important;
        height: 100% !important;
        min-height: 0 !important;
        overflow: auto !important;
      }

      ${showTalents ? `
      .talents-panel {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        grid-template-areas:
          "base ext"
          "spec spec"
          "adv adv" !important;
        align-content: start !important;
        gap: 8px !important;
      }
      .talents-panel > #panelClassControls {
        display: none !important;
      }
      .talents-panel > .general-branch {
        grid-area: base !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }
      .talents-panel > #generalBranchL6 {
        grid-area: ext !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }
      .talents-panel > .spec-picker {
        grid-area: spec !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
        align-self: stretch !important;
      }
      .talents-panel > .branch-grid {
        grid-area: adv !important;
        width: 100% !important;
        margin: 0 !important;
        gap: 8px !important;
      }
      .talents-panel > .branch-grid > .branch {
        max-width: none !important;
        width: 100% !important;
      }
      .talents-panel > .branch-grid > .branch > h3 {
        margin-bottom: 4px !important;
      }
      .talents-panel > .branch-grid > .branch > .branch-nodes {
        grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
        gap: 6px !important;
      }
      ` : ``}
    `;
  }

  function getCreatorEmbedStyleText() {
    return `
      .column-controls, .layout, .gap-icons-panel, .plan-panel, #mobileSectionNav, #mobileLevelPill, #saveCharacterModal { display: none !important; }
      #mobileStickyHeader {
        display: block !important;
        position: static !important;
        inset: auto !important;
        background: transparent !important;
        border: 0 !important;
        padding: 8px !important;
      }
      #mobileStickyHeader .mobile-class-select-wrap {
        width: 100% !important;
      }
      #mobileStickyHeader select {
        width: 100% !important;
      }
      #floatingPanel {
        display: block !important;
        position: static !important;
        inset: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        margin: 8px !important;
        width: auto !important;
        max-width: none !important;
        transform: none !important;
      }
      #floatingPanel.collapsed {
        transform: none !important;
      }
      #floatingPanelSlideBtn {
        display: none !important;
      }
      body {
        overflow: auto !important;
      }
    `;
  }

  function injectStyle(frame, id, cssText) {
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    const style = doc.createElement("style");
    style.id = id;
    style.textContent = cssText;
    const old = doc.getElementById(id);
    if (old) old.remove();
    (doc.head || doc.documentElement).appendChild(style);
  }

  function applyMainEmbedStyle() {
    try {
      injectStyle(mainFrame, "gm-journal-main-embed-style", getMainEmbedStyleText());
    } catch (err) {
      console.warn("GM journal main iframe styling failed", err);
    }
  }

  function scheduleMainReload() {
    if (!mainFrame) return;
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      try {
        if (mainFrame.contentWindow) mainFrame.contentWindow.location.reload();
      } catch (err) {
        console.warn("Main preview reload failed", err);
      }
    }, 180);
  }

  function hookCreatorEvents() {
    if (!creatorFrame || !creatorFrame.contentDocument) return;
    const doc = creatorFrame.contentDocument;
    const isCreatorControl = (el) => {
      if (!el || !el.id) return false;
      if (el.id === "mobileClassSelect" || el.id === "quickRaceSelect") return true;
      if (el.id === "quickLevelMinus" || el.id === "quickLevelPlus" || el.id === "quickResetBtn" || el.id === "quickRandomBtn") return true;
      if (el.id === "quickSaveBtn") return true;
      if (/^attr(Sil|Obr|Odo|Int|Cha)(Base|Mod|Plus|Minus)$/.test(el.id)) return true;
      return false;
    };
    doc.addEventListener("click", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) scheduleMainReload();
    }, true);
    doc.addEventListener("change", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) scheduleMainReload();
    }, true);
    doc.addEventListener("input", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) scheduleMainReload();
    }, true);
  }

  function applyCreatorEmbedStyle() {
    try {
      injectStyle(creatorFrame, "gm-journal-creator-embed-style", getCreatorEmbedStyleText());
      hookCreatorEvents();
    } catch (err) {
      console.warn("GM journal creator iframe styling failed", err);
    }
  }

  function setActiveTab(next) {
    activeTab = next === "skills" ? "skills" : "talents";
    localStorage.setItem(COL_TAB_KEY, activeTab);
    for (const btn of colTabButtons) {
      btn.classList.toggle("active", btn.dataset.colTab === activeTab);
    }
    applyMainEmbedStyle();
  }

  for (const btn of colTabButtons) {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.colTab || "talents"));
  }
  setActiveTab(activeTab);

  if (mainFrame) mainFrame.addEventListener("load", applyMainEmbedStyle);
  if (creatorFrame) creatorFrame.addEventListener("load", applyCreatorEmbedStyle);
})();
