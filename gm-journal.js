(function () {
  const COL_TAB_KEY = "dh_journal_col_tab_v1";
  const colTabButtons = Array.from(document.querySelectorAll(".col-tab-btn"));
  const mainFrame = document.getElementById("calcEmbedFrame");
  const creatorFrame = document.getElementById("creatorEmbedFrame");
  const auxTabContent = document.getElementById("auxTabContent");
  const auxTabTitle = document.getElementById("auxTabTitle");
  const auxTabHint = document.getElementById("auxTabHint");
  const hpDisplayInput = document.getElementById("hpDisplayInput");
  const hpAutoBtn = document.getElementById("hpAutoBtn");
  const hpAutoHint = document.getElementById("hpAutoHint");
  let activeTab = localStorage.getItem(COL_TAB_KEY) || "talents";
  let reloadTimer = null;
  let creatorSyncTimer = null;
  let creatorMutationObserver = null;
  let lastCreatorSnapshotSig = "";
  let currentClassName = "";
  const journalState = {
    classId: "",
    className: "",
    raceId: "",
    raceName: "",
    level: 1,
    inventorySig: "",
    inventoryItems: [],
    inventoryEntries: [],
    selectedOptionalSpells: {}
  };

  const SPELL_CLASSES = ["hraničář", "kouzelník", "klerik"];
  const SPELL_CLASS_IDS = new Set(["PROF_2", "PROF_4", "PROF_6"]);
  const SPELLS_STORAGE_KEY = "dh_journal_spells_v1";
  const INVENTORY_STORAGE_KEY = "dh_journal_inventory_v1";
  const HP_STORAGE_KEY = "dh_journal_hp_override_v1";
  const SPELLS_DATA = {
    hranicar: {
      fixed: [
        { minLevel: 1, name: "Zakladni hranicarska kouzla (PPZ) - automaticky" },
        { minLevel: 6, name: "Ochrana pred smeckou" },
        { minLevel: 6, name: "Ochrana pred zimou" },
        { minLevel: 6, name: "Odvraceni zvirat" },
        { minLevel: 6, name: "Sledovani" },
        { minLevel: 6, name: "Uder nenavisti" },
        { minLevel: 6, name: "Uzdrav tezka zraneni" }
      ],
      optionalGroups: [
        { label: "Hranicarsky luk", spells: ["Dest sipu", "Jasna strela", "Ochromujici sip", "Plamenny sip", "Trefa do cerneho"] },
        { label: "Hranicaruv kun", spells: ["Nezdolnost", "Privolej kone", "S vetrem o zavod", "Uklidni zvire", "Zvireci posel"] },
        { label: "Druidova kouzla", requiresSpec: 0, spells: ["Obri rust", "Poskytni pribytek", "Pozehnani prirody", "Probuzeni hvozdu", "Prilnavost brectanu", "Privolej Druida", "Splynuti", "Trnovy stit", "Uklidneni hvozdu", "Uvadni"] },
        { label: "Chodecka magie", requiresSpec: 1, spells: ["Falesna stopa", "Mateni pachu", "Mateni stop", "Oci prirody", "Uhrancivy pohled"] },
        { label: "Chodcuv mec", requiresSpec: 1, spells: ["Odrazeni kouzla", "Posileni zbrane", "Transmutace zbrane", "Zablesk", "Zivelne ostri"] },
        { label: "Magie lovcu monster", requiresSpec: 1, spells: ["Bleskovy vypad", "Dvojity svih", "Srazeni projektilu", "Poskozeni zbrane", "Virive ostri"] },
        { label: "Divoke pokriky", requiresSpec: 2, spells: ["Bojovny rev", "Desivy rev", "Pokrik lovu", "Varovny vykrik", "Vabici krik"] },
        { label: "Magie smecky", requiresSpec: 2, spells: ["Chran", "Stvi", "Trhej", "Zadrz", "Zachran"] },
        { label: "Pokrocila magie zvirat", requiresSpec: 2, spells: ["Mimikry", "Nakrm zvire", "Oci zvirete", "Pochvala", "Poslouchej"] }
      ],
      note: "Volitelna kouzla vychazeji z volitelnych schopnosti a specializaci PPP."
    },
    kouzelnik: {
      fixed: [
        { minLevel: 1, name: "Kouzelnicke triky (zaklad) - automaticky" },
        { minLevel: 1, name: "Obecna magie (zakladni kouzla dle PPZ) - automaticky" }
      ],
      optionalGroups: [],
      note: "Detailni checklist oborovych kouzel doplnime podle kompletniho seznamu kouzel v datech."
    },
    klerik: {
      fixed: [
        { minLevel: 1, name: "Zakladni prosby klerika (PPZ) - automaticky" },
        { minLevel: 1, name: "Zvolani (specialni forma vzyvani) - pravidlove dostupne" }
      ],
      optionalGroups: [],
      note: "Detailni checklist proseb dle nauk doplnime podle kompletniho seznamu proseb v datech."
    }
  };

  const STARTER_RULE_LINES = [
    "3 blízké dovednosti povolání automaticky na stupni 3.",
    "+3 dovednostní body na začátku.",
    "Člověk: +2 dovednostní body navíc (Všestrannost)."
  ];
  const COMMON_STARTER_ITEMS = [
    "Cestovní plášť a pevné boty",
    "Měšec s mincemi",
    "Tornistra / vak",
    "Křesadlo, lano, svíce nebo louč"
  ];
  const CLASS_LOADOUTS = {
    valecnik: {
      fixed: ["Bojová zbraň (jednoruční nebo obouruční)", "Štít nebo druhá zbraň", "Střední zbroj"],
      pool: ["Záložní dýka", "Kroužková kukla", "Lékárnička", "Opravná sada na zbroj", "Vrhací sekera"]
    },
    hranicar: {
      fixed: ["Luk + toulec šípů", "Lehká/střední zbraň na blízko", "Kožená zbroj"],
      pool: ["Lovecký nůž", "Past na zvěř", "Bylinkářská brašna", "Maskovací plášť", "Náhradní tětiva"]
    },
    alchymista: {
      fixed: ["Alchymistická brašna", "Základní skleněné baňky", "Sada surovin"],
      pool: ["Přenosný hmoždíř", "Filtrační plátno", "2x prázdný flakón", "Měřicí sada", "Destilační mini-set"]
    },
    kouzelnik: {
      fixed: ["Hůl / fokus", "Kniha poznámek", "Lehký oděv bez zbroje"],
      pool: ["Rituální chalk", "Svíce a kadidlo", "Náhradní fokus", "Pergameny", "Ochranný talisman"]
    },
    zlodej: {
      fixed: ["Lehká zbraň", "Lehká zbroj", "Sada paklíčů / nářadí"],
      pool: ["Házecí dýky", "Kápě", "Lanko s hákem", "Kouřová ampule", "Maskovací sada"]
    },
    klerik: {
      fixed: ["Posvátný symbol", "Jednoruční zbraň", "Lehká/střední zbroj"],
      pool: ["Cestovní oltářík", "Léčivé obvazy", "Svěcená voda", "Modlitební kniha", "Kadidelnice"]
    },
    fallback: {
      fixed: ["Základní zbraň", "Cestovní oděv"],
      pool: ["Dýka", "Lano", "Lékárnička", "Vak na zásoby"]
    }
  };

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getClassKey(className, classId = "") {
    const id = String(classId || "").trim().toUpperCase();
    if (id === "PROF_1") return "valecnik";
    if (id === "PROF_2") return "hranicar";
    if (id === "PROF_3") return "alchymista";
    if (id === "PROF_4") return "kouzelnik";
    if (id === "PROF_5") return "zlodej";
    if (id === "PROF_6") return "klerik";

    const n = normalizeText(className);
    if (n.includes("valecnik")) return "valecnik";
    if (n.includes("hranicar")) return "hranicar";
    if (n.includes("alchymista")) return "alchymista";
    if (n.includes("kouzelnik")) return "kouzelnik";
    if (n.includes("zlodej")) return "zlodej";
    if (n.includes("klerik")) return "klerik";
    return "fallback";
  }

  function readCreatorSnapshot() {
    if (!creatorFrame || !creatorFrame.contentDocument) {
      return {
        classId: journalState.classId || "",
        className: journalState.className || "",
        raceId: journalState.raceId || "",
        raceName: journalState.raceName || "",
        level: Number.isFinite(journalState.level) ? journalState.level : 1
      };
    }
    const doc = creatorFrame.contentDocument;
    const classSelect = doc.getElementById("mobileClassSelect");
    const raceSelect = doc.getElementById("quickRaceSelect");
    const levelDisplay = doc.getElementById("quickLevelDisplay");

    const className = classSelect && classSelect.selectedIndex >= 0
      ? (classSelect.options[classSelect.selectedIndex]?.textContent || "")
      : "";
    const classId = classSelect ? String(classSelect.value || "") : "";
    const raceName = raceSelect && raceSelect.selectedIndex >= 0
      ? (raceSelect.options[raceSelect.selectedIndex]?.textContent || "")
      : "";
    const raceId = raceSelect ? String(raceSelect.value || "") : "";
    const level = Math.max(1, Number.parseInt(levelDisplay?.textContent || "1", 10) || 1);
    return { classId, className, raceId, raceName, level };
  }

  function pickRandomUnique(pool, count) {
    const source = [...pool];
    const result = [];
    while (source.length > 0 && result.length < count) {
      const idx = Math.floor(Math.random() * source.length);
      const [picked] = source.splice(idx, 1);
      result.push(picked);
    }
    return result;
  }

  function getExtraItemCountByLevel(level) {
    if (level <= 2) return 1;
    if (level <= 5) return 2;
    if (level <= 10) return 3;
    if (level <= 15) return 4;
    return 5;
  }

  function buildInventorySuggestion(snapshot) {
    const classKey = getClassKey(snapshot.className, snapshot.classId);
    const loadout = CLASS_LOADOUTS[classKey] || CLASS_LOADOUTS.fallback;
    const extrasCount = getExtraItemCountByLevel(snapshot.level);
    const extras = pickRandomUnique(loadout.pool || [], extrasCount);
    const levelLine =
      snapshot.level <= 5
        ? "Nízké úrovně: lehká, praktická výbava."
        : snapshot.level <= 10
          ? "Střední úrovně: širší sada nástrojů a záloh."
          : "Vyšší úrovně: robustní výbava s více specializací.";

    return [
      ...COMMON_STARTER_ITEMS,
      ...(loadout.fixed || []),
      ...extras,
      levelLine
    ];
  }

  function loadHpOverride() {
    try {
      const raw = localStorage.getItem(HP_STORAGE_KEY);
      if (!raw) return null;
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }

  function saveHpOverride(value) {
    try {
      if (Number.isFinite(value) && value > 0) {
        localStorage.setItem(HP_STORAGE_KEY, String(value));
      } else {
        localStorage.removeItem(HP_STORAGE_KEY);
      }
    } catch {
      // ignore storage failures
    }
  }

  function getOdoModFromCreator() {
    if (!creatorFrame || !creatorFrame.contentDocument) return 0;
    const doc = creatorFrame.contentDocument;
    const raw = String(doc.getElementById("attrOdoMod")?.value || "0").trim();
    const odoMod = Number.parseInt(raw.replace(/\s+/g, ""), 10);
    if (Number.isFinite(odoMod)) return odoMod;
    const odoBase = Number.parseInt(doc.getElementById("attrOdoBase")?.value || "10", 10);
    if (!Number.isFinite(odoBase)) return 0;
    if (odoBase <= 1) return -5;
    if (odoBase <= 3) return -4;
    if (odoBase <= 5) return -3;
    if (odoBase <= 7) return -2;
    if (odoBase <= 9) return -1;
    if (odoBase <= 11) return 0;
    if (odoBase <= 13) return 1;
    if (odoBase <= 15) return 2;
    if (odoBase <= 17) return 3;
    if (odoBase <= 19) return 4;
    if (odoBase <= 21) return 5;
    return 6;
  }

  function computeAutoHp() {
    const level = Math.max(1, Number.parseInt(String(journalState.level || 1), 10) || 1);
    const odoMod = getOdoModFromCreator();
    const hpAtLevel1 = 10 + odoMod;
    const hpPerLevel = 4 + odoMod; // prumer 1k6 (zaokrouhleno nahoru) + ODO
    return Math.max(1, hpAtLevel1 + (level - 1) * hpPerLevel);
  }

  function updateHpUi() {
    if (!hpDisplayInput || !hpAutoHint) return;
    const autoHp = computeAutoHp();
    const hasManual = Number.isFinite(journalState.hpOverride) && journalState.hpOverride > 0;
    const shown = hasManual ? journalState.hpOverride : autoHp;
    hpDisplayInput.value = String(shown);
    hpAutoHint.textContent = hasManual ? `Auto: ${autoHp}` : `Auto aktivní: ${autoHp}`;
  }

  function resetHpToAuto() {
    journalState.hpOverride = null;
    saveHpOverride(null);
    updateHpUi();
  }

  function loadInventoryEntriesState() {
    try {
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x) => String(x || "")).slice(0, 40);
    } catch {
      return [];
    }
  }

  function saveInventoryEntriesState() {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(journalState.inventoryEntries || []));
    } catch {
      // ignore storage failures
    }
  }

  function ensureInventoryEntries(forceReset = false) {
    if (
      forceReset ||
      !Array.isArray(journalState.inventoryEntries) ||
      journalState.inventoryEntries.length === 0
    ) {
      journalState.inventoryEntries = [...(journalState.inventoryItems || []), ""];
      saveInventoryEntriesState();
    }
  }

  function getInventorySuggestionPool() {
    const set = new Set();
    for (const x of COMMON_STARTER_ITEMS) set.add(x);
    for (const key of Object.keys(CLASS_LOADOUTS)) {
      const obj = CLASS_LOADOUTS[key] || {};
      for (const x of obj.fixed || []) set.add(x);
      for (const x of obj.pool || []) set.add(x);
    }
    return Array.from(set);
  }

  function renderInventoryEditorHtml() {
    const starterHtml = STARTER_RULE_LINES.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
    const rows = (journalState.inventoryEntries || []).map((entry, idx) => `
      <div class="inv-row">
        <input
          class="inv-input"
          type="text"
          list="journalInventorySuggestions"
          data-inv-input="${idx}"
          value="${escapeHtml(entry)}"
          placeholder="Zadej nebo vyber předmět..."
        />
        <button type="button" class="inv-remove" data-inv-remove="${idx}" aria-label="Odstranit řádek">−</button>
      </div>
    `).join("");
    const options = getInventorySuggestionPool().map((x) => `<option value="${escapeHtml(x)}"></option>`).join("");

    return `
      <div>
        <strong>Start podle pravidel (PPZ, krok 5):</strong>
        <ul>${starterHtml}</ul>
      </div>
      <div>
        <strong>Doporučená výbava (${escapeHtml(journalState.className || "postava")} · úroveň ${escapeHtml(journalState.level)}):</strong>
      </div>
      <div class="inv-toolbar">
        <button type="button" class="inv-add" data-inv-add>+ Přidat řádek</button>
        <button type="button" class="inv-reset" data-inv-reset>Reset návrhu</button>
      </div>
      <div class="inv-list">${rows}</div>
      <datalist id="journalInventorySuggestions">${options}</datalist>
    `;
  }

  function loadOptionalSpellsState() {
    try {
      const raw = localStorage.getItem(SPELLS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveOptionalSpellsState() {
    try {
      localStorage.setItem(SPELLS_STORAGE_KEY, JSON.stringify(journalState.selectedOptionalSpells || {}));
    } catch {
      // ignore storage failures
    }
  }

  function getSpellsContext() {
    const classKey = getClassKey(journalState.className, journalState.classId);
    return {
      classKey,
      def: SPELLS_DATA[classKey] || null,
      level: Math.max(1, Number(journalState.level || 1))
    };
  }

  function getLockedSpecializationIndex() {
    if (!mainFrame || !mainFrame.contentDocument) return null;
    const doc = mainFrame.contentDocument;
    const locked = doc.querySelector(".spec-picker .spec-node.locked-spec");
    if (!locked) return null;
    for (let i = 0; i <= 2; i += 1) {
      if (locked.classList.contains(`spec-${i}`)) return i;
    }
    return null;
  }

  function getSelectedSpellKey(classKey, spellName) {
    return `${classKey}::${spellName}`;
  }

  function renderSpellsHtml() {
    const ctx = getSpellsContext();
    if (!ctx.def) {
      return `<p>Toto povolani nema vlastni sekci kouzel.</p>`;
    }
    const fixed = (ctx.def.fixed || []).filter((x) => (x.minLevel || 1) <= ctx.level);
    const fixedHtml = fixed.length
      ? `<ul>${fixed.map((x) => `<li>${escapeHtml(x.name)}</li>`).join("")}</ul>`
      : "<p>Na teto urovni nejsou evidovana zadna pevna kouzla.</p>";

    const lockedSpec = getLockedSpecializationIndex();
    const groups = (ctx.def.optionalGroups || []).filter((g) => {
      if (!Object.prototype.hasOwnProperty.call(g, "requiresSpec")) return true;
      return g.requiresSpec === lockedSpec;
    });
    const groupsHtml = groups.length
      ? groups.map((g) => {
          const checks = (g.spells || []).map((spell) => {
            const key = getSelectedSpellKey(ctx.classKey, spell);
            const checked = !!journalState.selectedOptionalSpells[key];
            return `
              <label class="spell-check">
                <input type="checkbox" data-spell-key="${escapeHtml(key)}" ${checked ? "checked" : ""} />
                <span>${escapeHtml(spell)}</span>
              </label>
            `;
          }).join("");
          return `
            <div class="spell-group">
              <h4>${escapeHtml(g.label)}</h4>
              <div class="spell-checklist">${checks}</div>
            </div>
          `;
        }).join("")
      : "<p>Volitelna kouzla nejsou dostupna (nebo cekaji na zamceni specializace).</p>";

    return `
      <div>
        <strong>Pevna kouzla (automaticka):</strong>
        ${fixedHtml}
      </div>
      ${lockedSpec === null ? "<p><em>Specializace neni zamcena - specializacni kouzla se skryvaji.</em></p>" : ""}
      <div>
        <strong>Volitelna kouzla (checklist):</strong>
        ${groupsHtml}
      </div>
      ${ctx.def.note ? `<p>${escapeHtml(ctx.def.note)}</p>` : ""}
    `;
  }

  function classHasSpells(className, classId = "") {
    const id = String(classId || "").trim().toUpperCase();
    if (SPELL_CLASS_IDS.has(id)) return true;
    const n = normalizeText(className);
    return SPELL_CLASSES.some((key) => n.includes(normalizeText(key)));
  }

  function classIsAlchemist(className, classId = "") {
    const id = String(classId || "").trim().toUpperCase();
    if (id === "PROF_3") return true;
    const n = normalizeText(className);
    return n.includes("alchymista");
  }

  function getVisibleTabsForClass(className, classId = "") {
    const tabs = new Set(["talents", "skills", "inventory"]);
    if (classHasSpells(className, classId)) tabs.add("spells");
    if (classIsAlchemist(className, classId)) tabs.add("recipes");
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

      ${!showTalents ? `
      .skills-panel .skills-split {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }
      .skills-panel #skillListClass {
        order: 1 !important;
      }
      .skills-panel #skillListBasic {
        order: 2 !important;
      }
      .skills-panel .skill-item {
        min-height: 47px !important;
        padding: 0.36rem 0.42rem !important;
        gap: 0.26rem !important;
        font-size: 0.9rem !important;
        align-items: center !important;
      }
      .skills-panel .skill-rank-controls button {
        width: 34px !important;
        min-width: 34px !important;
        height: 34px !important;
        min-height: 34px !important;
        font-size: 1rem !important;
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
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background: #16110d !important;
        background-image:
          linear-gradient(45deg, transparent 50%, #d2b074 50%),
          linear-gradient(135deg, #d2b074 50%, transparent 50%) !important;
        background-position:
          calc(100% - 18px) 50%,
          calc(100% - 12px) 50% !important;
        background-size: 6px 6px, 6px 6px !important;
        background-repeat: no-repeat !important;
        border: 1px solid #8b6a3d !important;
        color: #f3e8d1 !important;
        border-radius: 12px !important;
        min-height: 44px !important;
        padding: 0.4rem 2.25rem 0.4rem 0.75rem !important;
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

  function refreshJournalCharacterState(forceInventoryReroll = false) {
    const snap = readCreatorSnapshot();
    journalState.classId = snap.classId;
    journalState.className = snap.className;
    journalState.raceId = snap.raceId;
    journalState.raceName = snap.raceName;
    journalState.level = snap.level;
    currentClassName = snap.className;

    const sig = `${getClassKey(snap.className, snap.classId)}|${normalizeText(snap.raceName)}|${snap.level}`;
    if (forceInventoryReroll || journalState.inventorySig !== sig || journalState.inventoryItems.length === 0) {
      journalState.inventoryItems = buildInventorySuggestion(snap);
      journalState.inventorySig = sig;
      ensureInventoryEntries(true);
    } else {
      ensureInventoryEntries(false);
    }

    if (forceInventoryReroll) {
      resetHpToAuto();
    } else {
      updateHpUi();
    }
  }

  function getCreatorSnapshotSig(snapshot) {
    if (!snapshot) return "";
    return [
      String(snapshot.classId || ""),
      normalizeText(snapshot.className || ""),
      String(snapshot.raceId || ""),
      normalizeText(snapshot.raceName || ""),
      String(snapshot.level || 1)
    ].join("|");
  }

  function syncFromCreatorIfChanged(force = false) {
    const snap = readCreatorSnapshot();
    const sig = getCreatorSnapshotSig(snap);
    if (!force && sig && sig === lastCreatorSnapshotSig) return false;
    lastCreatorSnapshotSig = sig;
    refreshJournalCharacterState(false);
    syncTabVisibility();
    applyRightPaneMode();
    return true;
  }

  function startCreatorAutoSync() {
    if (creatorSyncTimer) {
      clearInterval(creatorSyncTimer);
      creatorSyncTimer = null;
    }
    if (creatorMutationObserver) {
      creatorMutationObserver.disconnect();
      creatorMutationObserver = null;
    }

    syncFromCreatorIfChanged(true);

    creatorSyncTimer = setInterval(() => {
      syncFromCreatorIfChanged(false);
    }, 700);

    if (!creatorFrame || !creatorFrame.contentDocument) return;
    const doc = creatorFrame.contentDocument;
    const classSelect = doc.getElementById("mobileClassSelect");
    const raceSelect = doc.getElementById("quickRaceSelect");
    const levelDisplay = doc.getElementById("quickLevelDisplay");
    const observer = new MutationObserver(() => {
      syncFromCreatorIfChanged(false);
    });
    if (classSelect) observer.observe(classSelect, { childList: true, subtree: true, attributes: true });
    if (raceSelect) observer.observe(raceSelect, { childList: true, subtree: true, attributes: true });
    if (levelDisplay) observer.observe(levelDisplay, { childList: true, subtree: true, characterData: true });
    creatorMutationObserver = observer;
  }

  function updateAuxTabContent() {
    if (!auxTabContent || !auxTabTitle || !auxTabHint) return;
    const byTab = {
      spells: {
        title: "Kouzla",
        hint: ""
      },
      recipes: {
        title: "Recepty",
        hint: "Sekce receptů Alchymisty. Obsah bude navázán na pravidla povolání."
      },
      inventory: {
        title: "Inventář",
        hint: ""
      }
    };
    const data = byTab[activeTab];
    if (!data) {
      auxTabContent.hidden = true;
      return;
    }
    auxTabTitle.textContent = data.title;
    if (activeTab === "spells") {
      auxTabHint.innerHTML = renderSpellsHtml();
    } else if (activeTab === "inventory") {
      ensureInventoryEntries(false);
      auxTabHint.innerHTML = renderInventoryEditorHtml();
    } else {
      auxTabHint.textContent = data.hint;
    }
    auxTabContent.hidden = false;
  }

  function syncTabVisibility() {
    const visibleTabs = getVisibleTabsForClass(currentClassName, journalState.classId);
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
        const isRandomize = t.id === "quickRandomBtn";
        refreshJournalCharacterState(isRandomize);
        syncTabVisibility();
        applyRightPaneMode();
        scheduleMainReload();
        lastCreatorSnapshotSig = getCreatorSnapshotSig(readCreatorSnapshot());
      }
    }, true);
    doc.addEventListener("change", (ev) => {
      const t = ev.target;
      if (isCreatorControl(t)) {
        refreshJournalCharacterState(false);
        syncTabVisibility();
        applyRightPaneMode();
        scheduleMainReload();
        lastCreatorSnapshotSig = getCreatorSnapshotSig(readCreatorSnapshot());
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
      refreshJournalCharacterState(false);
      syncTabVisibility();
      applyRightPaneMode();
      hookCreatorEvents();
      startCreatorAutoSync();
    } catch (err) {
      console.warn("GM journal creator iframe styling failed", err);
    }
  }

  function setActiveTab(next) {
    const nextTab = String(next || "talents");
    activeTab = nextTab;
    const visibleTabs = getVisibleTabsForClass(currentClassName, journalState.classId);
    if (!visibleTabs.has(activeTab)) activeTab = "talents";
    localStorage.setItem(COL_TAB_KEY, activeTab);
    for (const btn of colTabButtons) {
      btn.classList.toggle("active", btn.dataset.colTab === activeTab);
    }
    applyRightPaneMode();
  }

  journalState.selectedOptionalSpells = loadOptionalSpellsState();
  journalState.inventoryEntries = loadInventoryEntriesState();
  journalState.hpOverride = loadHpOverride();

  for (const btn of colTabButtons) {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.colTab || "talents"));
  }
  setActiveTab(activeTab);

  if (auxTabContent) {
    auxTabContent.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[data-inv-add]")) {
        journalState.inventoryEntries.push("");
        saveInventoryEntriesState();
        if (activeTab === "inventory") updateAuxTabContent();
        return;
      }
      if (target.matches("[data-inv-reset]")) {
        ensureInventoryEntries(true);
        if (activeTab === "inventory") updateAuxTabContent();
        return;
      }
      const removeIdxRaw = target.getAttribute("data-inv-remove");
      if (removeIdxRaw !== null) {
        const idx = Math.max(0, Number.parseInt(removeIdxRaw, 10) || 0);
        journalState.inventoryEntries.splice(idx, 1);
        if (journalState.inventoryEntries.length === 0) journalState.inventoryEntries.push("");
        saveInventoryEntriesState();
        if (activeTab === "inventory") updateAuxTabContent();
      }
    });

    auxTabContent.addEventListener("input", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement)) return;
      const idxRaw = target.getAttribute("data-inv-input");
      if (idxRaw === null) return;
      const idx = Math.max(0, Number.parseInt(idxRaw, 10) || 0);
      journalState.inventoryEntries[idx] = target.value;
      saveInventoryEntriesState();
    });

    auxTabContent.addEventListener("change", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== "checkbox") return;
      const key = String(target.dataset.spellKey || "");
      if (!key) return;
      if (target.checked) journalState.selectedOptionalSpells[key] = true;
      else delete journalState.selectedOptionalSpells[key];
      saveOptionalSpellsState();
    });
  }

  if (hpDisplayInput) {
    hpDisplayInput.addEventListener("input", () => {
      const value = Number.parseInt(hpDisplayInput.value || "", 10);
      if (Number.isFinite(value) && value > 0) {
        journalState.hpOverride = value;
        saveHpOverride(value);
      } else {
        journalState.hpOverride = null;
        saveHpOverride(null);
      }
      updateHpUi();
    });
  }

  if (hpAutoBtn) {
    hpAutoBtn.addEventListener("click", () => resetHpToAuto());
  }
  if (mainFrame) mainFrame.addEventListener("load", applyRightPaneMode);
  if (creatorFrame) creatorFrame.addEventListener("load", applyCreatorEmbedStyle);
})();



