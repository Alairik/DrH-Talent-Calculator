(function () {
  const NOTES_KEY = "dh_journal_notes_v1";
  const CHECKLIST_KEY = "dh_journal_checklist_v1";
  const COL_TAB_KEY = "dh_journal_col_tab_v1";

  const notesEl = document.getElementById("journalNotes");
  const checklistEl = document.getElementById("journalChecklist");
  const frameEl = document.getElementById("calcEmbedFrame");
  const colTabButtons = Array.from(document.querySelectorAll(".col-tab-btn"));
  let activeTab = localStorage.getItem(COL_TAB_KEY) || "talents";

  if (notesEl) {
    notesEl.value = localStorage.getItem(NOTES_KEY) || "";
    notesEl.addEventListener("input", () => localStorage.setItem(NOTES_KEY, notesEl.value || ""));
  }
  if (checklistEl) {
    checklistEl.value = localStorage.getItem(CHECKLIST_KEY) || "";
    checklistEl.addEventListener("input", () => localStorage.setItem(CHECKLIST_KEY, checklistEl.value || ""));
  }

  function setActiveTab(next) {
    activeTab = next === "skills" ? "skills" : "talents";
    localStorage.setItem(COL_TAB_KEY, activeTab);
    for (const btn of colTabButtons) {
      btn.classList.toggle("active", btn.dataset.colTab === activeTab);
    }
    applyEmbedStyle();
  }

  function getEmbedStyleText() {
    const showTalents = activeTab === "talents";
    return `
      /* Hide everything except talent column, skills column and floating character panel */
      .column-controls { display: none !important; }
      .gap-icons-panel, .plan-panel, #mobileStickyHeader, #mobileSectionNav, #mobileLevelPill { display: none !important; }
      .layout {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 12px !important;
        width: 100% !important;
        max-width: none !important;
        padding: 10px !important;
      }
      .talents-panel {
        display: ${showTalents ? "block" : "none"} !important;
        height: calc(100dvh - 44px) !important;
        min-height: 0 !important;
        overflow: auto !important;
      }
      .skills-panel {
        display: ${showTalents ? "none" : "block"} !important;
        height: calc(100dvh - 44px) !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
    `;
  }

  function applyEmbedStyle() {
    if (!frameEl) return;
    try {
      const doc = frameEl.contentDocument;
      if (!doc) return;
      const style = doc.createElement("style");
      style.id = "gm-journal-embed-style";
      style.textContent = getEmbedStyleText();
      const old = doc.getElementById("gm-journal-embed-style");
      if (old) old.remove();
      (doc.head || doc.documentElement).appendChild(style);
    } catch (err) {
      console.warn("GM journal iframe styling failed", err);
    }
  }

  for (const btn of colTabButtons) {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.colTab || "talents"));
  }
  setActiveTab(activeTab);

  if (!frameEl) return;
  frameEl.addEventListener("load", () => {
    applyEmbedStyle();
  });
})();
