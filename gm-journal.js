(function () {
  const NOTES_KEY = "dh_journal_notes_v1";
  const CHECKLIST_KEY = "dh_journal_checklist_v1";

  const notesEl = document.getElementById("journalNotes");
  const checklistEl = document.getElementById("journalChecklist");
  const frameEl = document.getElementById("calcEmbedFrame");

  if (notesEl) {
    notesEl.value = localStorage.getItem(NOTES_KEY) || "";
    notesEl.addEventListener("input", () => localStorage.setItem(NOTES_KEY, notesEl.value || ""));
  }
  if (checklistEl) {
    checklistEl.value = localStorage.getItem(CHECKLIST_KEY) || "";
    checklistEl.addEventListener("input", () => localStorage.setItem(CHECKLIST_KEY, checklistEl.value || ""));
  }

  if (!frameEl) return;
  frameEl.addEventListener("load", () => {
    try {
      const doc = frameEl.contentDocument;
      if (!doc) return;
      const style = doc.createElement("style");
      style.id = "gm-journal-embed-style";
      style.textContent = `
        /* Hide everything except talent column, skills column and floating character panel */
        .column-controls { display: none !important; }
        .gap-icons-panel, .plan-panel, #mobileStickyHeader, #mobileSectionNav, #mobileLevelPill { display: none !important; }
        .layout {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          gap: 12px !important;
          width: 100% !important;
          max-width: none !important;
          padding: 10px !important;
        }
        .talents-panel, .skills-panel {
          height: calc(100dvh - 44px) !important;
          min-height: 0 !important;
        }
        .talents-panel { overflow: auto !important; }
        .skills-panel { overflow: hidden !important; }
      `;
      const old = doc.getElementById("gm-journal-embed-style");
      if (old) old.remove();
      (doc.head || doc.documentElement).appendChild(style);
    } catch (err) {
      console.warn("GM journal iframe styling failed", err);
    }
  });
})();

