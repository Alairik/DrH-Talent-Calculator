(function () {
  const COL_TAB_KEY = "dh_journal_col_tab_v1";
  const colTabButtons = Array.from(document.querySelectorAll(".col-tab-btn"));
  const mainFrame = document.getElementById("calcEmbedFrame");
  const creatorFrame = document.getElementById("creatorEmbedFrame");
  const auxTabContent = document.getElementById("auxTabContent");
  const auxTabTitle = document.getElementById("auxTabTitle");
  const auxTabHint = document.getElementById("auxTabHint");
  let activeTab = localStorage.getItem(COL_TAB_KEY) || "talents";
  let reloadTimer = null;
  let currentClassName = "";

  const SPELL_CLASSES = ["hraničář", "kouzelník", "klerik"];

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function classHasSpells(className) {
    const n = normalizeText(className);
    return SPELL_CLASSES.some((key) => n.includes(normalizeText(key)));
  }

  function classIsAlchemist(className) {
    const n = normalizeText(className);
    return n.includes("alchymista");
  }

  function getVisibleTabsForClass(className) {
    const tabs = new Set(["talents", "skills", "inventory"]);
    if (classHasSpells(className)) tabs.add("spells");
    if (classIsAlchemist(className)) tabs.add("recipes");
    return tabs;
  }

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
      #themeToggleBtn { display: none !important; }
      #mobileStickyHeader {
        display: block !important;
        position: static !important;
        inset: auto !important;
        background: transparent !important;
        border: 0 !important;
        padding: 8px !important;
      }
      #mobileStickyHeader .gm-journal-header-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 8px !important;
        align-items: center !important;
      }
      #mobileStickyHeader .mobile-class-select-wrap,
      #mobileStickyHeader .gm-journal-race-wrap {
        width: 100% !important;
      }
      #mobileStickyHeader .mobile-class-select-wrap select,
      #mobileStickyHeader .gm-journal-race-wrap select {
        width: 100% !important;
        appearance: none !important;
        background: #16110d !important;
        border: 1px solid #8b6a3d !important;
        color: #f3e8d1 !important;
        border-radius: 12px !important;
        min-height: 44px !important;
        padding: 0.4rem 2rem 0.4rem 0.75rem !important;
      }
      #floatingPanel .floating-row-level {
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        gap: 6px !important;
      }
      #floatingPanel .floating-row-level #quickRandomBtn,
      #floatingPanel .floating-row-level #quickResetBtn {
        width: 40px !important;
        min-width: 40px !important;
        height: 40px !important;
        padding: 0 !important;
        display: inline-grid !important;
        place-items: center !important;
      }
      #floatingPanel .floating-row-save {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 8px !important;
        align-items: center !important;
      }
      #floatingPanel #quickSaveBtn,
      #floatingPanel #quickExportBtn {
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
      #floatingPanel .floating-row-main {
        display: none !important;
      }
      #floatingPanelSlideBtn {
        display: none !important;
      }
      body {
        overflow: auto !important;
      }
    `;
  }

  function arrangeCreatorHeaderControls() {
    if (!creatorFrame || !creatorFrame.contentDocument) return;
    const doc = creatorFrame.contentDocument;
    const header = doc.getElementById("mobileStickyHeader");
    const classWrap = header ? header.querySelector(".mobile-class-select-wrap") : null;
    const raceSelect = doc.getElementById("quickRaceSelect");
    if (!header || !classWrap || !raceSelect) return;

    let row = header.querySelector(".gm-journal-header-row");
    if (!row) {
      row = doc.createElement("div");
      row.className = "gm-journal-header-row";
      header.prepend(row);
    }

    let raceWrap = row.querySelector(".gm-journal-race-wrap");
    if (!raceWrap) {
      raceWrap = doc.createElement("label");
      raceWrap.className = "gm-journal-race-wrap";
      row.appendChild(raceWrap);
    }

    if (raceSelect.parentElement !== raceWrap) raceWrap.appendChild(raceSelect);
    if (classWrap.parentElement !== row) row.appendChild(classWrap);

    const levelRow = doc.querySelector("#floatingPanel .floating-row-level");
    const randomBtn = doc.getElementById("quickRandomBtn");
    const resetBtn = doc.getElementById("quickResetBtn");
    if (levelRow && randomBtn && resetBtn) {
      if (randomBtn.parentElement !== levelRow) {
        levelRow.insertBefore(randomBtn, resetBtn);
      } else if (randomBtn.nextElementSibling !== resetBtn) {
        levelRow.insertBefore(randomBtn, resetBtn);
      }
    }

    const saveRow = doc.querySelector("#floatingPanel .floating-row-save");
    const saveBtn = doc.getElementById("quickSaveBtn");
    if (saveRow && saveBtn) {
      let exportBtn = doc.getElementById("quickExportBtn");
      if (!exportBtn) {
        exportBtn = doc.createElement("button");
        exportBtn.type = "button";
        exportBtn.id = "quickExportBtn";
        exportBtn.className = "floating-save-btn";
        exportBtn.title = "Export postavy";
        exportBtn.setAttribute("aria-label", "Export postavy");
        exportBtn.textContent = "Export postavy";
        exportBtn.addEventListener("click", () => {});
      }
      if (saveBtn.parentElement !== saveRow) saveRow.prepend(saveBtn);
      if (exportBtn.parentElement !== saveRow) saveRow.appendChild(exportBtn);
    }
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

  function getSelectedClassNameFromCreator() {
    if (!creatorFrame || !creatorFrame.contentDocument) return "";
    const doc = creatorFrame.contentDocument;
    const select = doc.getElementById("mobileClassSelect");
    if (!select) return "";
    const idx = select.selectedIndex;
    if (idx < 0 || !select.options[idx]) return "";
    return select.options[idx].textContent || "";
  }

  function updateAuxTabContent() {
    if (!auxTabContent || !auxTabTitle || !auxTabHint) return;
    const byTab = {
      spells: {
        title: "Kouzla",
        hint: "Sekce kouzel pro zvolené povolání. Obsah bude navázán na pravidla povolání."
      },
      recipes: {
        title: "Recepty",
        hint: "Sekce receptů Alchymisty. Obsah bude navázán na pravidla povolání."
      },
      inventory: {
        title: "Inventář",
        hint: "Sekce inventáře deníku. Obsah bude doplněn v dalším kroku."
      }
    };
    const data = byTab[activeTab];
    if (!data) {
      auxTabContent.hidden = true;
      return;
    }
    auxTabTitle.textContent = data.title;
    auxTabHint.textContent = data.hint;
    auxTabContent.hidden = false;
  }

  function syncTabVisibility() {
    const visibleTabs = getVisibleTabsForClass(currentClassName);
    for (const btn of colTabButtons) {
      const tab = btn.dataset.colTab || "";
      const isVisible = visibleTabs.has(tab);
      btn.hidden = !isVisible;
    }
    if (!visibleTabs.has(activeTab)) {
      activeTab = "talents";
      localStorage.setItem(COL_TAB_KEY, activeTab);
    }
  }

  function applyRightPaneMode() {
    const isCalcTab = activeTab === "talents" || activeTab === "skills";
    if (mainFrame) mainFrame.style.display = isCalcTab ? "block" : "none";
    if (isCalcTab) {
      if (auxTabContent) auxTabContent.hidden = true;
      applyMainEmbedStyle();
    } else {
      updateAuxTabContent();
    }
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
      if (isCreatorControl(t)) {
        currentClassName = getSelectedClassNameFromCreator();
        syncTabVisibility();
        applyRightPaneMode();
        scheduleMainReload();
      }
    }, true);
    doc.addEventListener("change", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) {
        currentClassName = getSelectedClassNameFromCreator();
        syncTabVisibility();
        applyRightPaneMode();
        scheduleMainReload();
      }
    }, true);
    doc.addEventListener("input", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) scheduleMainReload();
    }, true);
  }

  function applyCreatorEmbedStyle() {
    try {
      injectStyle(creatorFrame, "gm-journal-creator-embed-style", getCreatorEmbedStyleText());
      arrangeCreatorHeaderControls();
      currentClassName = getSelectedClassNameFromCreator();
      syncTabVisibility();
      applyRightPaneMode();
      hookCreatorEvents();
    } catch (err) {
      console.warn("GM journal creator iframe styling failed", err);
    }
  }

  function setActiveTab(next) {
    const nextTab = String(next || "talents");
    activeTab = nextTab;
    const visibleTabs = getVisibleTabsForClass(currentClassName);
    if (!visibleTabs.has(activeTab)) activeTab = "talents";
    localStorage.setItem(COL_TAB_KEY, activeTab);
    for (const btn of colTabButtons) {
      btn.classList.toggle("active", btn.dataset.colTab === activeTab);
    }
    applyRightPaneMode();
  }

  for (const btn of colTabButtons) {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.colTab || "talents"));
  }
  setActiveTab(activeTab);

  if (mainFrame) mainFrame.addEventListener("load", applyRightPaneMode);
  if (creatorFrame) creatorFrame.addEventListener("load", applyCreatorEmbedStyle);
})();
