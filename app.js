(function () {
  const BRANCH_NAMES = {
    PROF_1: ["Berserkr", "Rytir", "Sermir"],
    PROF_2: ["Druid", "Chodec", "Pan selem"],
    PROF_3: ["Medikus", "Pyromant", "Theurg"],
    PROF_4: ["Bojovy mag", "Carodej", "Nekromant"],
    PROF_5: ["Assassin", "Lupic", "Sicco"],
    PROF_6: ["Bojovy mnich", "Exorcista", "Knez"]
  };
  const GENERAL_TALENT_SLOTS = 12;
  const BRANCH_TALENT_SLOTS = 8;
  const SPECIALIZATION_UNLOCK_LEVEL = 6;
  const SPECIALIZATION_TRANSITION_LEVEL = SPECIALIZATION_UNLOCK_LEVEL - 1;
  const SPECIALIZATION_REQUIREMENTS = {
    PROF_1: {
      0: ["Skola boje s obourucni zbrani", "Skola boje drtice kosti", "Urputnost"],
      1: ["Skola boje se stitem", "Skola boje s jednorucni zbrani", "Veleni"],
      2: ["Skola boje s bodnou zbrani", "Skola boje se dvema zbranemi", "Rozvaznost"]
    },
    PROF_2: {
      0: ["Bojova hul", "Lecitelstvi", "Magie prirody"],
      1: ["Obranne ostri", "Pruzkumnictvi", "Magie pocestnych"],
      2: ["Boj se zviraty", "Magie zvirat", "Ochocovani zvirat"]
    },
    PROF_3: {
      0: ["Nauka anatomie", "Nauka elixiry", "Substituce"],
      1: ["Nauka predmety", "Nauka substance", "Vyroba svitku"],
      2: ["Nauka sestavy", "Nauka energie", "Precizni vyroba"]
    },
    PROF_4: {
      0: ["Obor Divoka magie", "Obor Ochranna magie", "Rychle kouzleni"],
      1: ["Obor Vysoka magie", "Obor Mentalni magie", "Kouzleni z knih"],
      2: ["Obor Vitalni magie", "Obor Magie promen", "Ritual krve"]
    },
    PROF_5: {
      0: ["Umeni rvacu", "Umeni skryvani", "Vrhani dyk"],
      1: ["Umeni zelezneho klice", "Umeni kociciho pohybu", "Improvizace"],
      2: ["Umeni promen", "Umeni sarmu", "Zlodejska hantyrka"]
    },
    PROF_6: {
      0: ["Bozi bojovnik", "Nauka Bojovniku viry", "Nauka Svate pravdy"],
      1: ["Osviceni", "Nauka Bozich patronu", "Nauka Demonologie"],
      2: ["Pozehnane zdravi", "Nauka Milosrdenstvi", "Nauka Zehnani aurami"]
    }
  };
  const WARRIOR_BASE_COLUMNS = {
    general: ["Mistrovstvi ve zbrani", "Skvela kondice", "Vicenasobny utok"],
    berserkr: ["Urputnost", "Skola boje drtice kosti", "Skola boje s obourucni zbrani"],
    rytir: ["Veleni", "Skola boje s jednorucni zbrani", "Skola boje se stitem"],
    sermir: ["Rozvaznost", "Skola boje s bodnou zbrani", "Skola boje se dvema zbranemi"]
  };
  const RANGER_BASE_COLUMNS = {
    general: ["Presna strelba", "Rychla strelba", "Zoceleni"],
    druid: ["Bojova hul", "Lecitelstvi", "Magie prirody"],
    chodec: ["Obranne ostri", "Pruzkumnictvi", "Magie pocestnych"],
    panSelem: ["Boj se zviraty", "Magie zvirat", "Ochocovani zvirat"]
  };
  const ALCHEMIST_BASE_COLUMNS = {
    general: ["Efektivni vyroba", "Odolnost vuci jedum", "Pokrocila identifikace"],
    medikus: ["Substituce", "Nauka anatomie", "Nauka elixiry"],
    pyromant: ["Vyroba svitku", "Nauka predmety", "Nauka substance"],
    theurg: ["Precizni vyroba", "Nauka sestavy", "Nauka energie"]
  };
  const WIZARD_BASE_COLUMNS = {
    general: ["Koncentrace many", "Pamet na kouzla", "Vyvolani pritele"],
    bojovyMag: ["Rychle kouzleni", "Obor Divoka magie", "Obor Ochranna magie"],
    carodej: ["Kouzleni z knih", "Obor Mentalni magie", "Obor Vysoka magie"],
    nekromant: ["Ritual krve", "Obor Magie promen", "Obor Vitalni magie"]
  };
  const THIEF_BASE_COLUMNS = {
    general: ["Odezirani ze rtu", "Vrazedne ostri", "Zakerna kuse"],
    assassin: ["Vrhani dyk", "Umeni rvacu", "Umeni skryvani"],
    lupic: ["Improvizace", "Umeni kociciho pohybu", "Umeni zelezneho klice"],
    sicco: ["Zlodejska hantyrka", "Umeni promen", "Umeni sarmu"]
  };
  const CLERIC_BASE_COLUMNS = {
    general: ["Dar slitovani", "Posvatny symbol", "Ritualy a obrady"],
    bojovyMnich: ["Bozi bojovnik", "Nauka Bojovniku viry", "Nauka Svate pravdy"],
    exorcista: ["Osviceni", "Nauka Bozich patronu", "Nauka Demonologie"],
    knez: ["Pozehnane zdravi", "Nauka Milosrdenstvi", "Nauka Zehnani aurami"]
  };

  const CLASS_RULES = {
    PROF_1: { starterSkills: ["Atletika", "Prvni pomoc", "Vydrz"], skillPointsMultiplier: 3 },
    PROF_2: {
      starterSkills: ["Prvni pomoc", "Preziti v prirode", "Znalost prirody"],
      starterTalents: ["Hranicarske umeni", "Pouto s prirodou"],
      starterSkillsByTalent: ["Hranicarske umeni", "Pouto s prirodou"],
      skillPointsMultiplier: 5
    },
    PROF_3: { starterSkills: ["Cteni a psani", "Mechanika", "Znalost prirody"], skillPointsMultiplier: 4 },
    PROF_4: { starterSkills: ["Cizi jazyky", "Cteni a psani", "Historie"], skillPointsMultiplier: 3 },
    PROF_5: { starterSkills: ["Akrobacie", "Postreh", "Reflex"], skillPointsMultiplier: 8 },
    PROF_6: { starterSkills: ["Cteni a psani", "Teologie", "Vule"], skillPointsMultiplier: 3 }
  };

  const BASIC_SKILL_NAMES = new Set([
    "akrobacie",
    "atletika",
    "cizi jazyky",
    "cteni a psani",
    "historie",
    "jizda na zvireti",
    "mechanika",
    "plavani",
    "plizeni",
    "postreh",
    "prvni pomoc",
    "preziti v prirode",
    "reflex",
    "remesla",
    "teologie",
    "umeni",
    "vule",
    "vydrz",
    "znalost prirody",
    "zpracovani zvere"
  ]);
  const SKILL_CLASS_OVERRIDES = new Map([
    ["znalost prirody", "PROF_2"],
    ["zpracovani zvere", "PROF_2"],
    ["videni many", "PROF_3"],
    ["destilace many", "PROF_3"]
  ]);
  const SKILL_NO_PREREQ_NAMES = new Set([
    "prosby",
    "hazardni hry",
    "odhad ceny",
    "presvedcovani",
    "vybirani kapes"
  ]);
  const D_TALENT_NAMES = new Set([
    "lecitelstvi",
    "ochocovani zvirat",
    "pruzkumnictvi",
    "pokrocila identifikace",
    "vyroba svitku",
    "umeni kociciho pohybu",
    "umeni promen",
    "umeni rvacu",
    "umeni skryvani",
    "umeni sarmu",
    "umeni zelezneho klice"
  ]);
  const MANUAL_D_SKILLS = [
    // Alchymista (D)
    { id: "PDF_SKILL_ALC_01", name: "Pokrocila identifikace", prof_id: "PROF_3", ability_name: "Pokrocila identifikace", check_type: ["int"], is_knowledge_based: true },
    { id: "PDF_SKILL_ALC_02", name: "Vyroba svitku", prof_id: "PROF_3", ability_name: "Vyroba svitku", check_type: ["dex"], is_knowledge_based: true },
    // Zlodej (D) - novy model: samostatna dovednost je cele Umeni, podakce jsou jen akce uvnitr.
    { id: "PDF_SKILL_THF_U01", name: "Umeni kociciho pohybu", prof_id: "PROF_5", ability_name: "Umeni kociciho pohybu", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_U02", name: "Umeni promen", prof_id: "PROF_5", ability_name: "Umeni promen", check_type: ["cha"] },
    { id: "PDF_SKILL_THF_U03", name: "Umeni rvacu", prof_id: "PROF_5", ability_name: "Umeni rvacu", check_type: ["sil"] },
    { id: "PDF_SKILL_THF_U04", name: "Umeni skryvani", prof_id: "PROF_5", ability_name: "Umeni skryvani", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_U05", name: "Umeni sarmu", prof_id: "PROF_5", ability_name: "Umeni sarmu", check_type: ["cha"] },
    { id: "PDF_SKILL_THF_U06", name: "Umeni zelezneho klice", prof_id: "PROF_5", ability_name: "Umeni zelezneho klice", check_type: ["dex"] }
  ];
  const MANUAL_SPECIALIZATION_SKILLS = [
    // Chodec: specializacni dovednost od 6. urovne s automatickym startem na 5.
    {
      id: "PDF_SPEC_SKILL_RNGC_01",
      name: "Znalost mistnich pomeru",
      prof_id: "PROF_2",
      required_level: 6,
      check_type: ["int"],
      spec_branch_index: 1,
      auto_floor_on_spec: 5
    }
  ];

  const state = {
    professions: [],
    races: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedRaceId: "",
    selectedTalentIds: new Set(),
    selectedTalentOrder: {},
    talentOrderCounter: 0,
    selectedSpecializationByClass: {},
    selectedSkillTargets: {},
    pdfCoverage: {
      skills: new Set(),
      talents: new Set()
    },
    manualLevel: 1,
    levelMode: "auto",
    lastPlanSignature: "",
    config: {
      maxLevel: window.APP_CONFIG.maxLevel,
      points: { ...window.APP_CONFIG.points }
    },
    ui: {
      l6Visible: false,
      branchVisible: [false, false, false]
    }
  };

  const els = {
    layout: document.querySelector(".layout"),
    classTopControls: document.getElementById("classTopControls"),
    humanToggleWrap: document.getElementById("humanToggleWrap"),
    humanToggleSlotClass: document.getElementById("humanToggleSlotClass"),
    humanToggleSlotSkills: document.getElementById("humanToggleSlotSkills"),
    resetSlotClass: document.getElementById("resetSlotClass"),
    resetSlotPlan: document.getElementById("resetSlotPlan"),
    controlSlotClass: document.getElementById("controlSlotClass"),
    controlSlotSkills: document.getElementById("controlSlotSkills"),
    controlSlotPlan: document.getElementById("controlSlotPlan"),
    skillsTopControls: document.getElementById("skillsTopControls"),
    panelClassControls: document.getElementById("panelClassControls"),
    panelSkillsControls: document.getElementById("panelSkillsControls"),
    panelPlanControls: document.getElementById("panelPlanControls"),
    planTopControls: document.getElementById("planTopControls"),
    mobileClassSelect: document.getElementById("mobileClassSelect"),
    mobileLevelPill: document.getElementById("mobileLevelPill"),
    mobileSectionNav: document.getElementById("mobileSectionNav"),
    humanToggle: document.getElementById("humanToggle"),
    resetBtn: document.getElementById("resetBtn"),
    classPicker: document.getElementById("classPicker"),
    generalNodes: document.getElementById("generalNodes"),
    generalBranchL6: document.getElementById("generalBranchL6"),
    generalNodesL6: document.getElementById("generalNodesL6"),
    specPicker: document.getElementById("specPicker"),
    branchTitle1: document.getElementById("branchTitle1"),
    branchTitle2: document.getElementById("branchTitle2"),
    branchTitle3: document.getElementById("branchTitle3"),
    branch1: document.getElementById("branch1"),
    branch2: document.getElementById("branch2"),
    branch3: document.getElementById("branch3"),
    talentCount: document.getElementById("talentCount"),
    skillListBasic: document.getElementById("skillListBasic"),
    skillListClass: document.getElementById("skillListClass"),
    skillCount: document.getElementById("skillCount"),
    maxLevel: document.getElementById("maxLevel"),
    talentL1: document.getElementById("talentL1"),
    talentPerLevel: document.getElementById("talentPerLevel"),
    skillL1: document.getElementById("skillL1"),
    skillPerLevel: document.getElementById("skillPerLevel"),
    manualLevelMinus: document.getElementById("manualLevelMinus"),
    manualLevelDisplay: document.getElementById("manualLevelDisplay"),
    manualLevelPlus: document.getElementById("manualLevelPlus"),
    shareLinkBtn: document.getElementById("shareLinkBtn"),
    summary: document.getElementById("summary"),
    issues: document.getElementById("issues"),
    timeline: document.getElementById("timeline"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    exchangeBox: document.getElementById("exchangeBox"),
    infoTooltip: document.getElementById("infoTooltip"),
    talentsPanel: document.querySelector(".talents-panel")
  };
  els.mobileSectionButtons = Array.from(document.querySelectorAll(".mobile-section-btn"));
  const tooltipState = {
    pinned: false,
    anchorEl: null
  };

  init().catch((err) => {
    console.error(err);
    document.body.innerHTML =
      "<pre>Error loading data. Use local server (not file://).\n" +
      String(err) +
      "</pre>";
  });

  async function init() {
    const [
      professionsPayload,
      racesPayload,
      talentsPayload,
      skillsPayload,
      pdfCoveragePayload,
      manualPdfTalentsPayload
    ] =
      await Promise.all([
        fetchJson("./research/sirael-professions.json"),
        fetchJson("./research/sirael-races.json"),
        fetchJson("./research/sirael-player-talents.json"),
        fetchJson("./research/sirael-skills-all.json"),
        fetchJsonOptional("./research/pdf_consolidation/pdf_coverage_map.json"),
        fetchJsonOptional("./research/pdf_consolidation/manual_talents_from_pdf.json")
      ]);

    state.professions = professionsPayload.items || [];
    state.races = (racesPayload.items || []).map((r) => ({
      ...r,
      name: fixMojibake(r.name),
      ability: fixMojibake(r.ability)
    }));
    const baseTalents = (talentsPayload.items || []).map((x) => ({
      ...normalizeTalentRecord(x),
      type: "talent"
    }));
    state.talents = mergeManualTalents(baseTalents, manualPdfTalentsPayload);
    const baseSkills = (skillsPayload.items || []).map((x) => ({
      ...normalizeSkillRecord(x),
      type: "skill"
    }));
    state.skills = injectManualSpecializationSkills(
      injectManualDSkills(applyKnownSkillClassOverrides(baseSkills))
    );
    if (pdfCoveragePayload && typeof pdfCoveragePayload === "object") {
      state.pdfCoverage.skills = new Set(Array.isArray(pdfCoveragePayload.skills) ? pdfCoveragePayload.skills : []);
      state.pdfCoverage.talents = new Set(Array.isArray(pdfCoveragePayload.talents) ? pdfCoveragePayload.talents : []);
    }

    hydrateFromStorage();
    hydrateFromUrl();
    ensureDefaults();
    wireEvents();
    renderAll();
  }

  function ensureDefaults() {
    if (!state.selectedProfessionId && state.professions.length > 0) {
      state.selectedProfessionId = state.professions[0].id;
    }
    if (!state.selectedRaceId && state.races.length > 0) {
      state.selectedRaceId = state.races[0].id;
    }
    // Prevent stale localStorage from keeping old low cap (e.g., 12).
    state.config.maxLevel = Math.max(
      clampInt(state.config.maxLevel, 1, 36, window.APP_CONFIG.maxLevel),
      window.APP_CONFIG.maxLevel
    );
  }

  function wireEvents() {
    if (els.humanToggle) els.humanToggle.addEventListener("change", () => {
      const humanId = getHumanRaceId();
      if (els.humanToggle.checked && humanId) {
        state.selectedRaceId = humanId;
      } else if (!els.humanToggle.checked && normalize((getRaceById(state.selectedRaceId) || {}).name) === "clovek") {
        const fallback = getFirstNonHumanRaceId();
        if (fallback) state.selectedRaceId = fallback;
      }
      cleanseInvalidSelections();
      renderAll();
      persist();
    });

    if (els.mobileClassSelect) els.mobileClassSelect.addEventListener("change", () => {
      state.selectedProfessionId = els.mobileClassSelect.value;
      cleanseInvalidSelections();
      renderAll();
      persist();
    });

    if (els.resetBtn) els.resetBtn.addEventListener("click", () => {
      state.selectedTalentIds.clear();
      state.selectedTalentOrder = {};
      state.talentOrderCounter = 0;
      state.selectedSpecializationByClass = {};
      state.selectedSkillTargets = {};
      renderAll();
      persist();
    });

    bindNumber(els.maxLevel, (v) => {
      state.config.maxLevel = clampInt(v, 1, 36, window.APP_CONFIG.maxLevel);
    });
    bindNumber(els.talentL1, (v) => {
      state.config.points.talentLevel1 = clampInt(
        v,
        0,
        50,
        window.APP_CONFIG.points.talentLevel1
      );
    });
    bindNumber(els.talentPerLevel, (v) => {
      state.config.points.talentPerLevel = clampInt(
        v,
        0,
        50,
        window.APP_CONFIG.points.talentPerLevel
      );
    });
    bindNumber(els.skillL1, (v) => {
      state.config.points.skillLevel1 = clampInt(
        v,
        0,
        50,
        window.APP_CONFIG.points.skillLevel1
      );
    });
    bindNumber(els.skillPerLevel, (v) => {
      state.config.points.skillPerLevel = clampInt(
        v,
        0,
        50,
        window.APP_CONFIG.points.skillPerLevel
      );
    });
    if (els.manualLevelMinus) els.manualLevelMinus.addEventListener("click", () => {
      state.levelMode = "manual";
      state.manualLevel = clampInt(state.manualLevel - 1, 1, state.config.maxLevel, 1);
      renderAll();
      persist();
    });
    if (els.manualLevelPlus) els.manualLevelPlus.addEventListener("click", () => {
      state.levelMode = "manual";
      state.manualLevel = clampInt(state.manualLevel + 1, 1, state.config.maxLevel, state.config.maxLevel);
      renderAll();
      persist();
    });
    if (els.shareLinkBtn) els.shareLinkBtn.addEventListener("click", async () => {
      const url = buildShareUrl();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          throw new Error("Clipboard API unavailable");
        }
        els.shareLinkBtn.textContent = "OK";
        window.setTimeout(() => {
          if (els.shareLinkBtn) els.shareLinkBtn.textContent = "URL";
        }, 1000);
      } catch (_err) {
        if (els.exchangeBox) {
          els.exchangeBox.value = url;
          alert("URL jsem vlozil do export pole. Zkopiruj ji rucne.");
        } else {
          alert(url);
        }
      }
    });

    if (els.exportBtn) els.exportBtn.addEventListener("click", () => {
      els.exchangeBox.value = JSON.stringify(exportBuild(), null, 2);
    });

    if (els.importBtn) els.importBtn.addEventListener("click", () => {
      try {
        importBuild(JSON.parse(els.exchangeBox.value));
        renderAll();
        persist();
      } catch (_err) {
        alert("Import failed: invalid JSON.");
      }
    });
    window.addEventListener("resize", () => {
      hideInfoTooltip();
      renderSkills();
      handleResponsiveLayout();
    });
    if (els.layout) els.layout.addEventListener("scroll", onLayoutScroll, { passive: true });
    document.addEventListener("pointerdown", (ev) => {
      if (!els.infoTooltip || els.infoTooltip.hidden) return;
      const target = ev.target;
      if (target && target.closest && target.closest(".node-info-btn")) return;
      hideInfoTooltip();
    });
    document.addEventListener("scroll", () => hideInfoTooltip(), { passive: true, capture: true });
    for (const btn of els.mobileSectionButtons) {
      btn.addEventListener("click", () => {
        const idx = clampInt(btn.dataset.sectionIndex, 0, 2, 0);
        scrollToMobileSection(idx);
      });
    }
    if (els.mobileLevelPill) els.mobileLevelPill.addEventListener("click", () => {
      scrollToMobileSection(2);
    });
  }

  function bindNumber(input, onChange) {
    input.addEventListener("change", () => {
      onChange(input.value);
      renderPlanOnly();
      persist();
    });
  }

  function renderAll() {
    hideInfoTooltip();
    handleResponsiveLayout();
    renderControls();
    renderTalentTree();
    renderSkills();
    renderPlanOnly();
  }

  function renderControls() {
    renderClassPicker();
    renderMobileClassSelect();
    const selectedRace = getRaceById(state.selectedRaceId);
    if (els.humanToggle) els.humanToggle.checked = normalize(selectedRace && selectedRace.name) === "clovek";

    els.maxLevel.value = state.config.maxLevel;
    els.talentL1.value = state.config.points.talentLevel1;
    els.talentPerLevel.value = state.config.points.talentPerLevel;
    els.skillL1.value = state.config.points.skillLevel1;
    els.skillPerLevel.value = state.config.points.skillPerLevel;
    const manual = clampInt(state.manualLevel, 1, state.config.maxLevel, 1);
    if (els.manualLevelDisplay) els.manualLevelDisplay.textContent = String(manual);
  }

  function renderMobileClassSelect() {
    if (!els.mobileClassSelect) return;
    els.mobileClassSelect.innerHTML = "";
    for (const p of state.professions) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === state.selectedProfessionId) opt.selected = true;
      els.mobileClassSelect.appendChild(opt);
    }
    els.mobileClassSelect.value = state.selectedProfessionId;
  }

  function isMobileSectionLayout() {
    return window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches;
  }

  function handleResponsiveLayout() {
    relocateColumnControls();
    updateMobileSectionNav();
  }

  function relocateColumnControls() {
    if (!els.classTopControls || !els.skillsTopControls || !els.planTopControls || !els.humanToggleWrap) return;
    const isMobile = isMobileSectionLayout();
    if (isMobile) {
      if (els.humanToggleSlotClass && els.humanToggleWrap.parentElement !== els.humanToggleSlotClass) {
        els.humanToggleSlotClass.appendChild(els.humanToggleWrap);
      }
      if (els.resetBtn && els.resetSlotClass && els.resetBtn.parentElement !== els.resetSlotClass) {
        els.resetSlotClass.appendChild(els.resetBtn);
      }
      // Class selection is handled by the global mobile sticky dropdown.
      if (els.panelSkillsControls && els.skillsTopControls.parentElement !== els.panelSkillsControls) {
        els.panelSkillsControls.appendChild(els.skillsTopControls);
      }
      if (els.panelPlanControls && els.planTopControls.parentElement !== els.panelPlanControls) {
        els.panelPlanControls.appendChild(els.planTopControls);
      }
      if (els.mobileSectionNav) els.mobileSectionNav.style.display = "";
    } else {
      if (els.controlSlotClass && els.classTopControls.parentElement !== els.controlSlotClass) {
        els.controlSlotClass.appendChild(els.classTopControls);
      }
      if (els.humanToggleSlotSkills && els.humanToggleWrap.parentElement !== els.humanToggleSlotSkills) {
        els.humanToggleSlotSkills.appendChild(els.humanToggleWrap);
      }
      if (els.resetBtn && els.resetSlotPlan && els.resetBtn.parentElement !== els.resetSlotPlan) {
        els.resetSlotPlan.appendChild(els.resetBtn);
      }
      if (els.controlSlotSkills && els.skillsTopControls.parentElement !== els.controlSlotSkills) {
        els.controlSlotSkills.appendChild(els.skillsTopControls);
      }
      if (els.controlSlotPlan && els.planTopControls.parentElement !== els.controlSlotPlan) {
        els.controlSlotPlan.appendChild(els.planTopControls);
      }
      if (els.mobileSectionNav) els.mobileSectionNav.style.display = "";
    }
  }

  function scrollToMobileSection(index) {
    if (!isMobileSectionLayout() || !els.layout) return;
    const width = Math.max(1, els.layout.clientWidth);
    els.layout.scrollTo({ left: index * width, behavior: "smooth" });
  }

  function onLayoutScroll() {
    hideInfoTooltip();
    if (!isMobileSectionLayout()) return;
    updateMobileSectionNav();
  }

  function showInfoTooltip(text, anchorEl, pinned = false) {
    if (!els.infoTooltip || !anchorEl || !text) return;
    tooltipState.pinned = !!pinned;
    tooltipState.anchorEl = anchorEl;
    els.infoTooltip.textContent = text;
    els.infoTooltip.hidden = false;
    positionInfoTooltip(anchorEl);
  }

  function hideInfoTooltip() {
    if (!els.infoTooltip) return;
    els.infoTooltip.hidden = true;
    tooltipState.pinned = false;
    tooltipState.anchorEl = null;
  }

  function positionInfoTooltip(anchorEl) {
    if (!els.infoTooltip || !anchorEl || els.infoTooltip.hidden) return;
    const rect = anchorEl.getBoundingClientRect();
    const tipRect = els.infoTooltip.getBoundingClientRect();
    const pad = 8;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(pad, Math.min(left, viewWidth - tipRect.width - pad));
    let top = rect.top - tipRect.height - pad;
    if (top < pad) top = rect.bottom + pad;
    top = Math.max(pad, Math.min(top, viewHeight - tipRect.height - pad));
    els.infoTooltip.style.left = `${Math.round(left)}px`;
    els.infoTooltip.style.top = `${Math.round(top)}px`;
  }

  function triggerUnlockAnimation(container) {
    if (!container) return;
    const nodes = Array.from(container.querySelectorAll(".node:not(.empty)"));
    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].style.setProperty("--unlock-i", String(i));
    }
    container.classList.remove("unlock-reveal");
    // Force restart so repeated unlocks play reliably.
    void container.offsetWidth; // eslint-disable-line no-unused-expressions
    container.classList.add("unlock-reveal");
    window.setTimeout(() => {
      container.classList.remove("unlock-reveal");
      for (const n of nodes) n.style.removeProperty("--unlock-i");
    }, 1000);
  }

  function updateMobileSectionNav() {
    if (!els.mobileSectionButtons || els.mobileSectionButtons.length === 0) return;
    if (!isMobileSectionLayout()) {
      for (const btn of els.mobileSectionButtons) btn.classList.remove("active");
      els.mobileSectionButtons[0].classList.add("active");
      return;
    }
    if (!els.layout) return;
    const width = Math.max(1, els.layout.clientWidth);
    const index = clampInt(Math.round(els.layout.scrollLeft / width), 0, els.mobileSectionButtons.length - 1, 0);
    for (let i = 0; i < els.mobileSectionButtons.length; i += 1) {
      els.mobileSectionButtons[i].classList.toggle("active", i === index);
    }
  }

  function renderClassPicker() {
    els.classPicker.innerHTML = "";
    for (const p of state.professions) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-box";
      btn.classList.add(`class-${String(p.id || "").toLowerCase()}`);
      if (p.id === state.selectedProfessionId) btn.classList.add("active");
      btn.textContent = p.name;
      btn.addEventListener("click", () => {
        state.selectedProfessionId = p.id;
        cleanseInvalidSelections();
        renderAll();
        persist();
      });
      els.classPicker.appendChild(btn);
    }
  }

  function renderTalentTree() {
    const plan = buildPlan();
    const talentLevelById = new Map(Object.entries(plan.talentLevelsById || {}));
    const profId = state.selectedProfessionId;
    const isWarrior = profId === "PROF_1";
    const hasSpecColor =
      profId === "PROF_1" ||
      profId === "PROF_2" ||
      profId === "PROF_3" ||
      profId === "PROF_4" ||
      profId === "PROF_5" ||
      profId === "PROF_6";
    if (els.talentsPanel) els.talentsPanel.dataset.profId = profId;
    const branchNames = BRANCH_NAMES[profId] || ["Branch I", "Branch II", "Branch III"];
    els.branchTitle1.textContent = branchNames[0];
    els.branchTitle2.textContent = branchNames[1];
    els.branchTitle3.textContent = branchNames[2];

    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const starterTalentIds = new Set(getClassStarterTalentIds(profId));
    const split = splitClassTalentsForTree(classTalents, profId);
    const currentLevel = clampInt(plan.totals.currentLevel, 1, state.config.maxLevel, 1);
    const specializationChoiceUnlocked = currentLevel >= SPECIALIZATION_TRANSITION_LEVEL;
    const specializationTalentsUnlocked = currentLevel >= SPECIALIZATION_UNLOCK_LEVEL;
    if (!specializationChoiceUnlocked) {
      for (const branch of split.branches) {
        for (const talent of branch) removeTalentSelection(talent.id);
      }
      delete state.selectedSpecializationByClass[profId];
    }
    const requiredByTalentId = buildRequiredTalentBranchMap(profId, split.generalBase);
    const lockedSpecIndex = getLockedSpecializationIndex(profId, split.branches);
    if (lockedSpecIndex !== null && !hasSpecializationRequirements(profId, lockedSpecIndex, split.generalBase)) {
      clearSpecializationBranch(profId, lockedSpecIndex);
    }
    const lockedSpecIndexAfterReq = getLockedSpecializationIndex(profId, split.branches);
    const activeSpec =
      Number.isInteger(state.selectedSpecializationByClass[profId]) &&
      state.selectedSpecializationByClass[profId] >= 0 &&
      state.selectedSpecializationByClass[profId] <= 2
        ? state.selectedSpecializationByClass[profId]
        : (lockedSpecIndexAfterReq !== null ? lockedSpecIndexAfterReq : null);
    const showL6General = currentLevel >= SPECIALIZATION_UNLOCK_LEVEL && split.generalL6.length > 0;

    renderBranch(els.generalNodes, split.generalBase, {
      maxNodes: GENERAL_TALENT_SLOTS,
      disabled: false,
      starterTalentIds,
      enableSpecColor: hasSpecColor,
      requiredByTalentId,
      talentLevelById,
      onToggle: (talent, checked) => toggleTalent(talent.id, checked)
    });
    if (els.generalBranchL6 && els.generalNodesL6) {
      els.generalBranchL6.classList.toggle("branch-hidden", !showL6General);
      if (showL6General) {
        renderBranch(els.generalNodesL6, split.generalL6, {
          maxNodes: GENERAL_TALENT_SLOTS,
          disabled: false,
          starterTalentIds,
          enableSpecColor: false,
          talentLevelById,
          onToggle: (talent, checked) => toggleTalent(talent.id, checked)
        });
        if (!state.ui.l6Visible) triggerUnlockAnimation(els.generalBranchL6);
      } else {
        els.generalNodesL6.innerHTML = "";
      }
      state.ui.l6Visible = showL6General;
    }

    renderSpecializationPicker(
      profId,
      branchNames,
      split.branches,
      specializationChoiceUnlocked,
      activeSpec,
      currentLevel,
      hasSpecColor
    );

    const branchContainers = [els.branch1, els.branch2, els.branch3];
    for (let i = 0; i < branchContainers.length; i += 1) {
      const container = branchContainers[i];
      const card = container.parentElement;
      const branchTalents = split.branches[i] || [];
      const branchEnabled = specializationTalentsUnlocked && activeSpec === i;
      const branchVisible = specializationTalentsUnlocked && activeSpec === i;
      card.classList.toggle("branch-active", branchEnabled);
      card.classList.toggle("branch-hidden", !branchVisible);
      renderBranch(container, branchTalents, {
        maxNodes: BRANCH_TALENT_SLOTS,
        disabled: !branchEnabled,
        starterTalentIds,
        enableSpecColor: hasSpecColor,
        talentLevelById,
        onToggle: (talent, checked) => toggleTalentInBranch(profId, i, talent.id, checked)
      });
      if (branchVisible && !state.ui.branchVisible[i]) triggerUnlockAnimation(card);
      state.ui.branchVisible[i] = branchVisible;
    }
    const raceTalent = getRaceBonusTalent();
    els.talentCount.textContent = "";
  }

  function renderBranch(container, talents, opts = {}) {
    const maxNodes = Number.isFinite(opts.maxNodes) ? opts.maxNodes : Math.max(9, talents.length);
    const isDisabled = !!opts.disabled;
    const enableSpecColor = !!opts.enableSpecColor;
    const starterTalentIds = opts.starterTalentIds instanceof Set ? opts.starterTalentIds : new Set();
    const requiredByTalentId = opts.requiredByTalentId instanceof Map ? opts.requiredByTalentId : new Map();
    const talentLevelById = opts.talentLevelById instanceof Map ? opts.talentLevelById : new Map();
    const onToggle = typeof opts.onToggle === "function" ? opts.onToggle : null;
    container.innerHTML = "";
    for (let i = 0; i < maxNodes; i += 1) {
      const talent = talents[i];
      const node = document.createElement("button");
      node.type = "button";
      node.className = "node";
      if (!talent) {
        node.classList.add("empty");
        node.disabled = true;
        node.textContent = " ";
      } else {
        const isStarterTalent = starterTalentIds.has(talent.id);
        const isSelected = isStarterTalent || state.selectedTalentIds.has(talent.id);
        const isPdfCovered = state.pdfCoverage.talents.has(talent.id);
        const reqBranchIndex = requiredByTalentId.get(talent.id);
        if (isSelected) node.classList.add("selected");
        if (isStarterTalent) node.classList.add("locked");
        if (isDisabled) node.classList.add("locked");
        if (enableSpecColor && Number.isInteger(reqBranchIndex)) node.classList.add(`spec-${reqBranchIndex}`);
        if (isPdfCovered) node.classList.add("pdf-covered");
        const tooltipLines = [talent.name];
        if (talent.description) tooltipLines.push(talent.description);
        if (isStarterTalent) tooltipLines.push("[ZAKLAD OD LVL 1]");
        if (isPdfCovered) tooltipLines.push("[PDF]");
        const tooltipText = tooltipLines.join("\n");
        node.textContent = talent.name;
        node.setAttribute("aria-label", tooltipText);
        node.addEventListener("mouseenter", () => showInfoTooltip(tooltipText, node, false));
        node.addEventListener("mouseleave", () => {
          if (!tooltipState.pinned) hideInfoTooltip();
        });
        const infoBtn = document.createElement("button");
        infoBtn.type = "button";
        infoBtn.className = "node-info-btn";
        infoBtn.textContent = "i";
        infoBtn.setAttribute("aria-label", `Info: ${talent.name}`);
        infoBtn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const sameNodeOpen =
            !els.infoTooltip.hidden && tooltipState.anchorEl === node && tooltipState.pinned;
          if (sameNodeOpen) hideInfoTooltip();
          else showInfoTooltip(tooltipText, node, true);
        });
        node.appendChild(infoBtn);
        const selectedAtLevel = Number(talentLevelById.get(talent.id));
        if (isSelected && Number.isFinite(selectedAtLevel) && selectedAtLevel > 0) {
          const lvl = document.createElement("span");
          lvl.className = "node-level-indicator";
          lvl.textContent = `Lv ${selectedAtLevel}`;
          node.appendChild(lvl);
        }
        if (isDisabled || isStarterTalent) node.setAttribute("aria-disabled", "true");
        if (onToggle && !isStarterTalent && !isDisabled) {
          node.addEventListener("click", () => onToggle(talent, !isSelected));
        }
      }
      container.appendChild(node);
    }
  }

  function renderSpecializationPicker(profId, branchNames, branches, unlocked, activeIndex, currentLevel, enableSpecColor = false) {
    els.specPicker.innerHTML = "";
    for (let i = 0; i < 3; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spec-node";
      if (enableSpecColor) btn.classList.add(`spec-${i}`);
      if (activeIndex === i) btn.classList.add("active");
      if (!unlocked) btn.classList.add("locked");
      const selectedCount = (branches[i] || []).filter((t) => state.selectedTalentIds.has(t.id)).length;
      const suffix = selectedCount > 0 ? ` (${selectedCount})` : "";
      btn.textContent = `${branchNames[i]}${suffix}`;
      const req = getSpecializationRequirements(profId, i);
      const missingReq = req.filter((r) => !state.selectedTalentIds.has(r.id));
      if (!unlocked) {
        btn.title = `Odemkne se při přestupu na level ${SPECIALIZATION_UNLOCK_LEVEL} (od ${SPECIALIZATION_TRANSITION_LEVEL}. úrovně). Aktuálně ${currentLevel}.`;
        btn.disabled = true;
      } else {
        const blockedByLock = activeIndex !== null && activeIndex !== i;
        const blockedByReq = missingReq.length > 0 && activeIndex !== i;
        if (blockedByLock) btn.classList.add("locked");
        if (blockedByReq) btn.classList.add("locked");
        btn.title =
          activeIndex === i
            ? "Klikni pro vyčištění celé větve a odemknutí ostatních specializací."
            : blockedByLock
              ? "Ostatní specializace jsou zamčené, dokud neodznačíš aktivní větev."
              : blockedByReq
                ? `Chybí základní schopnosti: ${missingReq.map((x) => x.name).join(", ")}`
                : "Vybrat specializaci";
        btn.disabled = blockedByLock || blockedByReq;
        btn.addEventListener("click", () => {
          if (activeIndex === i) clearSpecializationBranch(profId, i);
          else if ((activeIndex === null || activeIndex === i) && missingReq.length === 0) setSpecialization(profId, i);
          renderAll();
          persist();
        });
      }
      els.specPicker.appendChild(btn);
    }
  }

  function renderSkills() {
    const profId = state.selectedProfessionId;
    const starterIds = new Set(getClassStarterSkillIds());
    const closeStarterIds = new Set(getClassCloseStarterSkillIds());
    const selectedTalentIds = new Set(state.selectedTalentIds);
    for (const id of getClassStarterTalentIds(profId)) selectedTalentIds.add(id);
    const raceTalent = getRaceBonusTalent();
    if (raceTalent) selectedTalentIds.add(raceTalent.id);
    const visibleSkills = state.skills
      .filter((s) => (isSkillAvailableForClass(s, profId) || starterIds.has(s.id)) && isSkillVisibleForCurrentSpec(s, profId))
      .sort((a, b) => {
        const aGroup = getSkillSortBucket(a, profId, closeStarterIds);
        const bGroup = getSkillSortBucket(b, profId, closeStarterIds);
        if (aGroup !== bGroup) return aGroup - bGroup;
        const aReq = requiresPrereqForSkill(a);
        const bReq = requiresPrereqForSkill(b);
        if (aReq && bReq) {
          const aReqTalent = state.talents.find((t) => t.id === a.ability_id);
          const bReqTalent = state.talents.find((t) => t.id === b.ability_id);
          const aReqName = aReqTalent ? aReqTalent.name : String(a.ability_id || "");
          const bReqName = bReqTalent ? bReqTalent.name : String(b.ability_id || "");
          const reqCmp = String(aReqName).localeCompare(String(bReqName), "cs");
          if (reqCmp !== 0) return reqCmp;
          const aOrder = Number.isFinite(a.manual_order) ? a.manual_order : Number.MAX_SAFE_INTEGER;
          const bOrder = Number.isFinite(b.manual_order) ? b.manual_order : Number.MAX_SAFE_INTEGER;
          if (aOrder !== bOrder) return aOrder - bOrder;
        }
        return byName(a, b);
      });

    const basicSkills = visibleSkills.filter((s) => !isCurrentClassSkill(s));
    const classSkills = visibleSkills.filter((s) => isCurrentClassSkill(s));

    renderSkillColumn(els.skillListBasic, basicSkills, {
      starterIds,
      closeStarterIds,
      selectedTalentIds,
      profId
    });
    renderSkillColumn(els.skillListClass, classSkills, {
      starterIds,
      closeStarterIds,
      selectedTalentIds,
      profId,
      showLevelDivider: true
    });

    els.skillCount.textContent = "";
  }

  function renderSkillColumn(container, skills, ctx) {
    container.innerHTML = "";
    let levelDividerAdded = false;
    for (const s of skills) {
      const reqLevel = Number(s.required_level || 1);
      if (ctx.showLevelDivider && !levelDividerAdded && reqLevel >= SPECIALIZATION_UNLOCK_LEVEL) {
        const divider = document.createElement("div");
        divider.className = "skill-level-divider";
        container.appendChild(divider);
        levelDividerAdded = true;
      }
      const floorRank = getSkillFloor(s, ctx.starterIds, ctx.profId);
      const targetRank = getSkillTargetRank(s.id, floorRank);
      const isPdfCovered = state.pdfCoverage.skills.has(s.id);

      const row = document.createElement("div");
      row.className = "skill-item";
      if (ctx.closeStarterIds.has(s.id)) row.classList.add("starter");
      if (!isBasicSkill(s) && s.prof_id) row.classList.add(`class-${s.prof_id.toLowerCase()}`);
      if (isPdfCovered) row.classList.add("pdf-covered");

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "skill-title";
      title.textContent = s.name;
      left.appendChild(title);

      const controls = document.createElement("div");
      controls.className = "skill-rank-controls";
      const hasPrereq =
        !requiresPrereqForSkill(s) ||
        ctx.selectedTalentIds.has(s.ability_id) ||
        (ctx.profId === "PROF_2" && s.prof_id === "PROF_2");
      const reqTalent = s.ability_id ? state.talents.find((t) => t.id === s.ability_id) : null;

      if (!hasPrereq) {
        const lock = document.createElement("span");
        lock.className = "skill-lock";
        lock.textContent = `⛔ ${reqTalent ? reqTalent.name : s.ability_id}`;
        controls.appendChild(lock);
      } else {
        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "-";
        minus.disabled = targetRank <= floorRank;
        minus.addEventListener("click", () => {
          const isClass = isCurrentClassSkill(s);
          const desired =
            isClass && floorRank === 0 && targetRank === 3 ? 0 : targetRank - 1;
          setSkillTargetRank(s.id, desired, floorRank);
        });

        const badge = document.createElement("span");
        badge.className = "skill-rank-badge";
        badge.textContent = String(targetRank);

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.disabled = targetRank >= 10;
        plus.addEventListener("click", () => setSkillTargetRank(s.id, targetRank + 1, floorRank));

        controls.appendChild(minus);
        controls.appendChild(badge);
        controls.appendChild(plus);
      }

      row.appendChild(left);
      row.appendChild(controls);
      container.appendChild(row);
    }

    // Let rows keep natural height so the in-column scrollbar can work normally.
    container.style.gridAutoRows = "";
  }

  function getSkillSortBucket(skill, profId, closeStarterIds) {
    if (closeStarterIds.has(skill.id)) return 0;
    const isClassSkill = skill.prof_id === profId && !isBasicSkill(skill);
    const hasReq = requiresPrereqForSkill(skill);
    if (!hasReq) return isClassSkill ? 1 : 2;
    return isClassSkill ? 3 : 4;
  }

  function getSkillFloor(skill, starterIds, profId = state.selectedProfessionId) {
    if (!skill) return 0;
    let floor = starterIds && starterIds.has(skill.id) ? 3 : 0;
    const isClassSkill = skill.prof_id === profId && !isBasicSkill(skill);
    const reqLevel = Number(skill.required_level || 1);
    if (isClassSkill && reqLevel <= 1 && !requiresPrereqForSkill(skill)) floor = Math.max(floor, 3);
    floor = Math.max(floor, getSpecializationSkillFloor(skill, profId));
    return floor;
  }

  function getSpecializationSkillFloor(skill, profId = state.selectedProfessionId) {
    if (!skill || skill.prof_id !== profId) return 0;
    const branch = Number(skill.spec_branch_index);
    if (!Number.isInteger(branch) || branch < 0 || branch > 2) return 0;
    const selectedBranch = Number(state.selectedSpecializationByClass[profId]);
    if (!Number.isInteger(selectedBranch) || selectedBranch !== branch) return 0;
    if (Number(skill.required_level || 1) > SPECIALIZATION_UNLOCK_LEVEL) return 0;
    return clampInt(skill.auto_floor_on_spec, 0, 10, 0);
  }

  function setSkillTargetRank(id, desired, floor) {
    const skill = state.skills.find((x) => x.id === id);
    const isClass = isCurrentClassSkill(skill);
    let next = Math.max(floor, Math.min(10, desired));
    // Class skills start at rank 3 once selected.
    if (isClass && floor === 0 && desired > 0) next = Math.max(3, next);
    if (next <= floor && floor === 0) {
      delete state.selectedSkillTargets[id];
    } else if (next === floor && floor > 0) {
      delete state.selectedSkillTargets[id];
    } else {
      state.selectedSkillTargets[id] = next;
    }
    renderAll();
    persist();
  }

  function getSkillTargetRank(id, floor) {
    const explicit = state.selectedSkillTargets[id];
    if (typeof explicit === "number") return Math.max(floor, explicit);
    return floor;
  }

  function toggleTalent(id, checked) {
    if (checked) {
      addTalentSelection(id);
      autoGrantSkillsFromSTalent(id);
    } else removeTalentSelection(id);
    renderAll();
    persist();
  }

  function addTalentSelection(id) {
    if (state.selectedTalentIds.has(id)) return;
    state.selectedTalentIds.add(id);
    state.talentOrderCounter += 1;
    state.selectedTalentOrder[id] = state.talentOrderCounter;
  }

  function removeTalentSelection(id) {
    state.selectedTalentIds.delete(id);
    delete state.selectedTalentOrder[id];
  }

  function compareTalentsBySelectionOrder(a, b) {
    const ao = Number(state.selectedTalentOrder[a.id]);
    const bo = Number(state.selectedTalentOrder[b.id]);
    const aHas = Number.isFinite(ao);
    const bHas = Number.isFinite(bo);
    if (aHas && bHas && ao !== bo) return ao - bo;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return byRequiredThenName(a, b);
  }

  function splitClassTalentsForTree(classTalents, profId = state.selectedProfessionId) {
    let generalBase = [];
    let generalL6 = [];
    let rest = [];
    if (
      profId === "PROF_1" ||
      profId === "PROF_2" ||
      profId === "PROF_3" ||
      profId === "PROF_4" ||
      profId === "PROF_5" ||
      profId === "PROF_6"
    ) {
      const basePattern =
        profId === "PROF_1"
          ? /^PDF_ABI_WAR_\d+$/i
          : profId === "PROF_2"
            ? /^PDF_ABI_RNG_\d+$/i
            : profId === "PROF_3"
              ? /^PDF_ABI_ALC_\d+$/i
              : profId === "PROF_4"
                ? /^PDF_ABI_WIZ_\d+$/i
                : profId === "PROF_5"
                  ? /^PDF_ABI_THF_\d+$/i
                  : /^PDF_ABI_CLR_\d+$/i;
      const l6Pattern =
        profId === "PROF_1"
          ? /^PDF_ABI_WARX_\d+$/i
          : profId === "PROF_2"
            ? /^PDF_ABI_RNGX_\d+$/i
            : profId === "PROF_3"
              ? /^PDF_ABI_ALCX_\d+$/i
              : profId === "PROF_4"
                ? /^PDF_ABI_WIZX_\d+$/i
                : profId === "PROF_5"
                  ? /^PDF_ABI_THFX_\d+$/i
                  : /^PDF_ABI_CLRX_\d+$/i;
      const baseRaw = classTalents.filter((t) => basePattern.test(String(t.id || ""))).sort(byRequiredThenName).slice(0, GENERAL_TALENT_SLOTS);
      if (profId === "PROF_1") generalBase = orderWarriorBaseTalents(baseRaw);
      else if (profId === "PROF_2") generalBase = orderRangerBaseTalents(baseRaw);
      else if (profId === "PROF_3") generalBase = orderAlchemistBaseTalents(baseRaw);
      else if (profId === "PROF_4") generalBase = orderWizardBaseTalents(baseRaw);
      else if (profId === "PROF_5") generalBase = orderThiefBaseTalents(baseRaw);
      else if (profId === "PROF_6") generalBase = orderClericBaseTalents(baseRaw);
      else generalBase = baseRaw;
      generalL6 = classTalents
        .filter((t) => l6Pattern.test(String(t.id || "")))
        .sort(byRequiredThenName)
        .slice(0, GENERAL_TALENT_SLOTS);
      const taken = new Set([...generalBase, ...generalL6].map((t) => t.id));
      rest = classTalents.filter((t) => !taken.has(t.id));
    } else {
      const isPdfGeneral = (t) => String(t.id || "").startsWith("PDF_ABI_");
      const pdfGeneral = classTalents.filter(isPdfGeneral).sort(byRequiredThenName);
      const nonPdf = classTalents.filter((t) => !isPdfGeneral(t)).sort(byRequiredThenName);
      generalBase = [...pdfGeneral, ...nonPdf].slice(0, GENERAL_TALENT_SLOTS);
      const generalIds = new Set(generalBase.map((t) => t.id));
      rest = classTalents.filter((t) => !generalIds.has(t.id));
    }
    const branches = [[], [], []];
    const explicit = rest.filter((t) => Number.isInteger(t.branch_index) && t.branch_index >= 0 && t.branch_index <= 2);
    const nonExplicit = rest.filter((t) => !(Number.isInteger(t.branch_index) && t.branch_index >= 0 && t.branch_index <= 2));
    for (const t of explicit.sort(byRequiredThenName)) {
      const bi = t.branch_index;
      if (branches[bi].length < BRANCH_TALENT_SLOTS) branches[bi].push(t);
    }
    nonExplicit.forEach((talent, idx) => {
      const branchIndex = idx % 3;
      if (branches[branchIndex].length < BRANCH_TALENT_SLOTS) branches[branchIndex].push(talent);
    });
    return { generalBase, generalL6, branches };
  }

  function orderWarriorBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      WARRIOR_BASE_COLUMNS.general,
      WARRIOR_BASE_COLUMNS.berserkr,
      WARRIOR_BASE_COLUMNS.rytir,
      WARRIOR_BASE_COLUMNS.sermir
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function orderRangerBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      RANGER_BASE_COLUMNS.general,
      RANGER_BASE_COLUMNS.druid,
      RANGER_BASE_COLUMNS.chodec,
      RANGER_BASE_COLUMNS.panSelem
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function orderAlchemistBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      ALCHEMIST_BASE_COLUMNS.general,
      ALCHEMIST_BASE_COLUMNS.medikus,
      ALCHEMIST_BASE_COLUMNS.pyromant,
      ALCHEMIST_BASE_COLUMNS.theurg
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function orderWizardBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      WIZARD_BASE_COLUMNS.general,
      WIZARD_BASE_COLUMNS.bojovyMag,
      WIZARD_BASE_COLUMNS.carodej,
      WIZARD_BASE_COLUMNS.nekromant
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function orderThiefBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      THIEF_BASE_COLUMNS.general,
      THIEF_BASE_COLUMNS.assassin,
      THIEF_BASE_COLUMNS.lupic,
      THIEF_BASE_COLUMNS.sicco
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function orderClericBaseTalents(baseTalents) {
    const byName = new Map(baseTalents.map((t) => [normalize(t.name), t]));
    const cols = [
      CLERIC_BASE_COLUMNS.general,
      CLERIC_BASE_COLUMNS.bojovyMnich,
      CLERIC_BASE_COLUMNS.exorcista,
      CLERIC_BASE_COLUMNS.knez
    ].map((names) => names.map((n) => byName.get(normalize(n))).filter(Boolean));

    const ordered = [];
    const rows = 3;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        const t = cols[c][r];
        if (t) ordered.push(t);
      }
    }

    const used = new Set(ordered.map((t) => t.id));
    for (const t of baseTalents) {
      if (!used.has(t.id)) ordered.push(t);
    }
    return ordered.slice(0, GENERAL_TALENT_SLOTS);
  }

  function getCurrentCharacterLevel() {
    const plan = buildPlan();
    return clampInt(plan.totals.currentLevel, 1, state.config.maxLevel, 1);
  }

  function getSpecializationRequirements(profId, branchIndex) {
    const reqNames = (SPECIALIZATION_REQUIREMENTS[profId] && SPECIALIZATION_REQUIREMENTS[profId][branchIndex]) || [];
    if (!reqNames.length) return [];
    const wanted = new Set(reqNames.map(normalize));
    return state.talents
      .filter((t) => t.prof_id === profId && wanted.has(normalize(t.name)))
      .sort(byRequiredThenName);
  }

  function hasSpecializationRequirements(profId, branchIndex, generalTalents) {
    const req = getSpecializationRequirements(profId, branchIndex);
    if (!req.length) return true;
    const generalIds = new Set((generalTalents || []).map((t) => t.id));
    return req.every((t) => generalIds.has(t.id) && state.selectedTalentIds.has(t.id));
  }

  function buildRequiredTalentBranchMap(profId, generalTalents) {
    const map = new Map();
    const generalIds = new Set((generalTalents || []).map((t) => t.id));
    for (let i = 0; i < 3; i += 1) {
      const req = getSpecializationRequirements(profId, i);
      for (const t of req) {
        if (generalIds.has(t.id)) map.set(t.id, i);
      }
    }
    return map;
  }

  function getLockedSpecializationIndex(profId, branches) {
    const selectedByTalent = [];
    for (let i = 0; i < branches.length; i += 1) {
    const hasSelected = branches[i].some((t) => state.selectedTalentIds.has(t.id));
      if (hasSelected) selectedByTalent.push(i);
    }
    const forced = Number.isInteger(state.selectedSpecializationByClass[profId])
      ? state.selectedSpecializationByClass[profId]
      : null;
    if (selectedByTalent.length > 0) {
      const locked = selectedByTalent.includes(forced) ? forced : selectedByTalent[0];
      for (let i = 0; i < branches.length; i += 1) {
        if (i === locked) continue;
        for (const t of branches[i]) removeTalentSelection(t.id);
      }
      state.selectedSpecializationByClass[profId] = locked;
      return locked;
    }
    if (forced === 0 || forced === 1 || forced === 2) return forced;
    return null;
  }

  function setSpecialization(profId, branchIndex) {
    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const split = splitClassTalentsForTree(classTalents);
    if (!hasSpecializationRequirements(profId, branchIndex, split.generalBase)) return;
    state.selectedSpecializationByClass[profId] = branchIndex;
  }

  function clearSpecializationBranch(profId, branchIndex) {
    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const { branches } = splitClassTalentsForTree(classTalents);
    for (const t of branches[branchIndex] || []) removeTalentSelection(t.id);
    delete state.selectedSpecializationByClass[profId];
  }

  function toggleTalentInBranch(profId, branchIndex, talentId, checked) {
    const currentLevel = getCurrentCharacterLevel();
    if (currentLevel < SPECIALIZATION_UNLOCK_LEVEL) return;
    const classTalents = state.talents.filter((t) => t.prof_id === profId).sort(byRequiredThenName);
    const split = splitClassTalentsForTree(classTalents);
    if (!hasSpecializationRequirements(profId, branchIndex, split.generalBase)) return;
    const lockedIndex = getLockedSpecializationIndex(profId, split.branches);
    if (lockedIndex !== null && lockedIndex !== branchIndex) return;
    state.selectedSpecializationByClass[profId] = branchIndex;
    if (checked) {
      addTalentSelection(talentId);
      autoGrantSkillsFromSTalent(talentId);
    }
    else {
      removeTalentSelection(talentId);
      const classTalents = state.talents
        .filter((t) => t.prof_id === profId)
        .sort(byRequiredThenName);
      const { branches } = splitClassTalentsForTree(classTalents);
      const stillSelected = (branches[branchIndex] || []).some((t) => state.selectedTalentIds.has(t.id));
      if (!stillSelected) delete state.selectedSpecializationByClass[profId];
    }
    renderAll();
    persist();
  }

  function buildPlan() {
    const profId = state.selectedProfessionId;
    const raceTalent = getRaceBonusTalent();
    const classStarterTalentIds = new Set(getClassStarterTalentIds(profId));
    const classStarterTalents = state.talents.filter((t) => classStarterTalentIds.has(t.id));
    const racePointBonus = getRacePointBonus(raceTalent);
    const starterIds = new Set(getClassStarterSkillIds());

    const talents = state.talents.filter(
      (t) =>
        state.selectedTalentIds.has(t.id) &&
        t.prof_id === profId &&
        (!raceTalent || t.id !== raceTalent.id) &&
        !classStarterTalentIds.has(t.id)
    );

    const skillPlans = [];
    for (const s of state.skills) {
      if ((!isSkillAvailableForClass(s, profId) && !starterIds.has(s.id)) || !isSkillVisibleForCurrentSpec(s, profId)) continue;
      const startRank = getSkillFloor(s, starterIds, profId);
      const targetRank = getSkillTargetRank(s.id, startRank);
      if (targetRank <= 0) continue;
      skillPlans.push({ skill: s, startRank, targetRank, currentRank: startRank });
    }

    const selectedTalentMap = new Map(talents.map((t) => [t.id, t]));
    if (raceTalent) selectedTalentMap.set(raceTalent.id, raceTalent);
    for (const t of classStarterTalents) selectedTalentMap.set(t.id, t);

    const issues = [];
    const missingPrereq = [];
    for (const p of skillPlans) {
      if (requiresPrereqForSkill(p.skill) && p.skill.ability_id && !selectedTalentMap.has(p.skill.ability_id)) {
        missingPrereq.push(p.skill);
      }
    }

    const maxLevel = state.config.maxLevel;
    const levels = [];
    const classRule = CLASS_RULES[profId] || { skillPointsMultiplier: 3 };
    const hasSkillRaceBonus =
      !!raceTalent && (racePointBonus.skillLevel1 > 0 || racePointBonus.skillPerLevel > 0);
    for (let lvl = 1; lvl <= maxLevel; lvl += 1) {
      const talentBase =
        lvl === 1 ? state.config.points.talentLevel1 : state.config.points.talentPerLevel;
      const skillGain =
        (lvl === 1 ? state.config.points.skillLevel1 : classRule.skillPointsMultiplier * lvl) +
        (lvl === 1 ? racePointBonus.skillLevel1 : racePointBonus.skillPerLevel);
      levels.push({
        level: lvl,
        talentCapacity:
          talentBase + (lvl === 1 ? racePointBonus.talentLevel1 : racePointBonus.talentPerLevel),
        skillGain,
        skillSpent: 0,
        skillCarry: 0,
        raceBonuses: lvl === 1 && hasSkillRaceBonus ? [raceTalent] : [],
        startSkills: lvl === 1 ? skillPlans.filter((x) => x.startRank >= 3).map((x) => x.skill) : [],
        talents: [],
        skillActions: []
      });
    }

    const talentQueue = [...talents].sort((a, b) => compareTalentsBySelectionOrder(a, b));
    const assignedTalentLevel = new Map();
    if (raceTalent) assignedTalentLevel.set(raceTalent.id, 1);
    for (const t of classStarterTalents) assignedTalentLevel.set(t.id, 1);

    let skillPointPool = 0;

    for (const lvlState of levels) {
      while (lvlState.talents.length < lvlState.talentCapacity && talentQueue.length > 0) {
        const idx = talentQueue.findIndex((t) => Number(t.required_level || 1) <= lvlState.level);
        if (idx < 0) break;
        const t = talentQueue.splice(idx, 1)[0];
        lvlState.talents.push(t);
        assignedTalentLevel.set(t.id, lvlState.level);
      }

      skillPointPool += lvlState.skillGain;
      const upgradedThisLevel = new Set();

      while (true) {
        const candidates = skillPlans
          .filter((p) => p.currentRank < p.targetRank)
          .filter((p) => !upgradedThisLevel.has(p.skill.id))
          .filter((p) => Number(p.skill.required_level || 1) <= lvlState.level)
          .filter((p) => {
            if (!requiresPrereqForSkill(p.skill) || !p.skill.ability_id) return true;
            const reqLvl = assignedTalentLevel.get(p.skill.ability_id);
            return typeof reqLvl === "number" && reqLvl <= lvlState.level;
          })
          .map((p) => ({
            plan: p,
            nextRank: p.currentRank + 1,
            cost: p.currentRank + 1
          }))
          .filter((x) => x.cost <= skillPointPool)
          .sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost;
            return byName(a.plan.skill, b.plan.skill);
          });

        if (candidates.length === 0) break;
        const pick = candidates[0];
        const before = pick.plan.currentRank;
        pick.plan.currentRank = pick.nextRank;
        upgradedThisLevel.add(pick.plan.skill.id);
        skillPointPool -= pick.cost;
        lvlState.skillSpent += pick.cost;
        lvlState.skillActions.push({
          skill: pick.plan.skill,
          from: before,
          to: pick.nextRank,
          cost: pick.cost
        });
      }

      lvlState.skillCarry = skillPointPool;
    }

    if (missingPrereq.length > 0) {
      issues.push(`Missing prerequisite talent for ${missingPrereq.length} skills.`);
    }

    const unscheduledTalents = talentQueue;
    const unscheduledSkills = skillPlans.filter((p) => p.currentRank < p.targetRank);

    const maxAssignedTalent = Math.max(1, ...assignedTalentLevel.values());
    const maxSkillActionLevel = Math.max(
      1,
      ...levels
        .filter((l) => l.skillActions.length > 0)
        .map((l) => l.level)
    );

    const autoLevel = Math.max(maxAssignedTalent, maxSkillActionLevel, getSpecializationLevelFloor(profId));
    const effectiveLevel = resolveEffectiveCurrentLevel(autoLevel);
    const currentLevelState = levels.find((l) => l.level === effectiveLevel) || levels[levels.length - 1];
    const freeSkillPoints = currentLevelState ? currentLevelState.skillCarry : 0;

    return {
      levels,
      issues,
      unscheduledTalents,
      unscheduledSkills,
      talentLevelsById: Object.fromEntries(assignedTalentLevel),
      totals: {
        selectedTalents: talents.length + classStarterTalents.length + (raceTalent ? 1 : 0),
        selectedSkills: skillPlans.length,
        assignedTalents:
          (talents.length - unscheduledTalents.length) + classStarterTalents.length + (raceTalent ? 1 : 0),
        assignedSkills: skillPlans.length - unscheduledSkills.length,
        currentLevel: effectiveLevel,
        freeSkillPoints
      }
    };
  }

  function getSpecializationLevelFloor(profId) {
    const idx = state.selectedSpecializationByClass[profId];
    return Number.isInteger(idx) && idx >= 0 && idx <= 2 ? SPECIALIZATION_UNLOCK_LEVEL : 1;
  }

  function renderPlanOnly() {
    const modeBefore = state.levelMode;
    const signature = getPlanSignature();
    if (signature !== state.lastPlanSignature) {
      state.levelMode = "auto";
      state.lastPlanSignature = signature;
    }
    const plan = buildPlan();
    renderSummary(plan);
    renderIssues(plan);
    renderTimeline(plan);
    const currentLevel = String(clampInt(plan.totals.currentLevel, 1, state.config.maxLevel, 1));
    els.manualLevelDisplay.textContent = currentLevel;
    if (els.mobileLevelPill) els.mobileLevelPill.textContent = currentLevel;
    if (modeBefore !== state.levelMode) persist();
  }

  function renderSummary(plan) {
    const kpis = [
      ["Volne body dovednosti", String(plan.totals.freeSkillPoints)]
    ];
    els.summary.innerHTML = "";
    for (const [label, value] of kpis) {
      const div = document.createElement("div");
      div.className = "kpi";
      div.innerHTML = `<div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div>`;
      els.summary.appendChild(div);
    }
  }

  function renderIssues(plan) {
    const lines = [];
    for (const issue of plan.issues) lines.push(`- ${issue}`);
    els.issues.innerHTML = lines.length ? lines.map(escapeHtml).join("<br>") : "";
  }

  function renderTimeline(plan) {
    els.timeline.innerHTML = "";
    for (const lvl of plan.levels) {
      if (
        !lvl.raceBonuses.length &&
        !lvl.startSkills.length &&
        !lvl.talents.length &&
        !lvl.skillActions.length
      ) {
        continue;
      }
      const card = document.createElement("div");
      card.className = "level-card";
      if (lvl.level > plan.totals.currentLevel) card.classList.add("future");
      const levelBadge = document.createElement("div");
      levelBadge.className = "level-badge";
      levelBadge.textContent = `Lv ${lvl.level}`;
      const cell = document.createElement("div");
      cell.className = "timeline-cell";
      for (const s of lvl.startSkills) {
        const line = document.createElement("div");
        line.className = "timeline-line skill";
        line.textContent = `D: ${s.name} (3)`;
        cell.appendChild(line);
      }
      for (const t of lvl.talents) {
        const line = document.createElement("div");
        line.className = "timeline-line talent";
        line.textContent = `T: ${t.name}`;
        cell.appendChild(line);
      }
      for (const a of lvl.skillActions) {
        const line = document.createElement("div");
        line.className = "timeline-line skill";
        line.textContent = `D: ${a.skill.name} ${a.from}->${a.to} (-${a.cost})`;
        cell.appendChild(line);
      }
      card.appendChild(levelBadge);
      card.appendChild(cell);
      els.timeline.appendChild(card);
    }
    // Keep timeline anchored at top after each recompute/render.
    els.timeline.scrollTop = 0;
    const panel = els.timeline.closest(".panel");
    if (panel) panel.scrollTop = 0;
  }

  function exportBuild() {
    return {
      version: 4,
      professionId: state.selectedProfessionId,
      raceId: state.selectedRaceId,
      selectedTalentIds: [...state.selectedTalentIds],
      selectedTalentOrder: state.selectedTalentOrder,
      talentOrderCounter: state.talentOrderCounter,
      selectedSpecializationByClass: state.selectedSpecializationByClass,
      selectedSkillTargets: state.selectedSkillTargets,
      manualLevel: state.manualLevel,
      levelMode: state.levelMode,
      config: state.config
    };
  }

  function buildShareUrl() {
    const build = exportBuild();
    const json = JSON.stringify(build);
    const encoded = encodeBase64UrlUtf8(json);
    const url = new URL(window.location.href);
    url.searchParams.set("build", encoded);
    return url.toString();
  }

  function encodeBase64UrlUtf8(text) {
    const bytes = new TextEncoder().encode(String(text || ""));
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeBase64UrlUtf8(base64url) {
    const normalized = String(base64url || "").replace(/-/g, "+").replace(/_/g, "/");
    const padLen = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
    const padded = normalized + "=".repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function importBuild(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
    if (payload.professionId) state.selectedProfessionId = payload.professionId;
    if (payload.raceId) state.selectedRaceId = payload.raceId;
    state.selectedTalentIds = new Set(payload.selectedTalentIds || []);
    state.selectedTalentOrder =
      payload.selectedTalentOrder && typeof payload.selectedTalentOrder === "object"
        ? payload.selectedTalentOrder
        : {};
    state.talentOrderCounter = Number.isFinite(payload.talentOrderCounter)
      ? Number(payload.talentOrderCounter)
      : Object.values(state.selectedTalentOrder).reduce((m, x) => Math.max(m, Number(x) || 0), 0);
    state.selectedSpecializationByClass =
      payload.selectedSpecializationByClass && typeof payload.selectedSpecializationByClass === "object"
        ? payload.selectedSpecializationByClass
        : {};
    state.selectedSkillTargets = payload.selectedSkillTargets || {};
    state.manualLevel = Number.isFinite(payload.manualLevel)
      ? clampInt(payload.manualLevel, 1, 36, 1)
      : 1;
    state.levelMode = payload.levelMode === "manual" ? "manual" : "auto";
    if (payload.selectedSkillIds && !payload.selectedSkillTargets) {
      // backward compatibility with old binary model
      for (const id of payload.selectedSkillIds) state.selectedSkillTargets[id] = 1;
    }
    if (payload.config && payload.config.points) {
      state.config.maxLevel = clampInt(payload.config.maxLevel, 1, 36, state.config.maxLevel);
      state.config.points.talentLevel1 = clampInt(
        payload.config.points.talentLevel1,
        0,
        50,
        state.config.points.talentLevel1
      );
      state.config.points.talentPerLevel = clampInt(
        payload.config.points.talentPerLevel,
        0,
        50,
        state.config.points.talentPerLevel
      );
      state.config.points.skillLevel1 = clampInt(
        payload.config.points.skillLevel1,
        0,
        50,
        state.config.points.skillLevel1
      );
      state.config.points.skillPerLevel = clampInt(
        payload.config.points.skillPerLevel,
        0,
        50,
        state.config.points.skillPerLevel
      );
    }
    ensureDefaults();
    cleanseInvalidSelections();
  }

  function hydrateFromStorage() {
    const raw = localStorage.getItem(window.APP_CONFIG.storageKey);
    if (!raw) return;
    try {
      importBuild(JSON.parse(raw));
    } catch (_e) {
      // ignore
    }
  }

  function hydrateFromUrl() {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get("build");
      if (!encoded) return;
      const json = decodeBase64UrlUtf8(encoded);
      importBuild(JSON.parse(json));
    } catch (_e) {
      // ignore
    }
  }

  function persist() {
    localStorage.setItem(window.APP_CONFIG.storageKey, JSON.stringify(exportBuild()));
  }

  function cleanseInvalidSelections() {
    const profId = state.selectedProfessionId;
    const starterIds = new Set(getClassStarterSkillIds());
    const raceTalent = getRaceBonusTalent();

    for (const id of [...state.selectedTalentIds]) {
      const t = state.talents.find((x) => x.id === id);
      if (!t || t.prof_id !== profId || (raceTalent && t.id === raceTalent.id)) {
        removeTalentSelection(id);
      }
    }
    // Keep talent order map consistent with current selection.
    for (const id of Object.keys(state.selectedTalentOrder)) {
      if (!state.selectedTalentIds.has(id)) delete state.selectedTalentOrder[id];
    }
    for (const id of state.selectedTalentIds) {
      if (!Number.isFinite(Number(state.selectedTalentOrder[id]))) {
        state.talentOrderCounter += 1;
        state.selectedTalentOrder[id] = state.talentOrderCounter;
      }
    }

    const cleaned = {};
    for (const [id, target] of Object.entries(state.selectedSkillTargets)) {
      const s = state.skills.find((x) => x.id === id);
      if (!s) continue;
      if ((!isSkillAvailableForClass(s, profId) && !starterIds.has(id)) || !isSkillVisibleForCurrentSpec(s, profId)) continue;
      const floor = getSkillFloor(s, starterIds, profId);
      const t = Math.max(floor, Number(target) || floor);
      if (t > floor) cleaned[id] = t;
    }
    state.selectedSkillTargets = cleaned;

    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const { branches } = splitClassTalentsForTree(classTalents);
    getLockedSpecializationIndex(profId, branches);
  }

  function getRaceById(id) {
    return state.races.find((r) => r.id === id);
  }

  function getHumanRaceId() {
    const human = state.races.find((r) => normalize(r.name) === "clovek");
    return human ? human.id : null;
  }

  function getFirstNonHumanRaceId() {
    const nonHuman = state.races.find((r) => normalize(r.name) !== "clovek");
    return nonHuman ? nonHuman.id : null;
  }

  function getRaceBonusTalent() {
    const race = getRaceById(state.selectedRaceId);
    if (!race) return null;
    if (race.ability) {
      const byName = state.talents.find((t) => normalize(t.name) === normalize(race.ability));
      if (byName) return byName;
    }
    const fallbackMap = window.APP_CONFIG.raceBonusTalentIdByRaceId || {};
    const fallbackId = fallbackMap[race.id];
    if (!fallbackId) return null;
    return state.talents.find((t) => t.id === fallbackId) || null;
  }

  function getRacePointBonus(raceTalent) {
    const base = {
      talentLevel1: 0,
      talentPerLevel: 0,
      skillLevel1: 0,
      skillPerLevel: 0
    };
    if (!raceTalent) return base;
    const fromConfig = window.APP_CONFIG.racePointBonusesByTalentId || {};
    const cfg = fromConfig[raceTalent.id];
    if (cfg) return { ...base, ...cfg };
    return base;
  }

  function getClassStarterSkillIds() {
    const profId = state.selectedProfessionId;
    const classRule = CLASS_RULES[profId];
    if (!classRule) return [];
    const wanted = new Set(classRule.starterSkills.map(normalize));
    const starterTalentIds = new Set(getClassStarterTalentIds(profId));
    const ids = [];
    for (const s of state.skills) {
      if (!isSkillAvailableForClass(s, profId)) continue;
      if (wanted.has(normalize(s.name))) {
        ids.push(s.id);
        continue;
      }
      if (s.ability_id && starterTalentIds.has(s.ability_id)) ids.push(s.id);
    }
    return ids;
  }

  function getClassCloseStarterSkillIds() {
    const profId = state.selectedProfessionId;
    const classRule = CLASS_RULES[profId];
    if (!classRule) return [];
    const wanted = new Set(classRule.starterSkills.map(normalize));
    const ids = [];
    for (const s of state.skills) {
      if (wanted.has(normalize(s.name)) && isSkillAvailableForClass(s, profId)) ids.push(s.id);
    }
    return ids;
  }

  function getClassStarterTalentIds(profId) {
    const classRule = CLASS_RULES[profId];
    if (!classRule || !Array.isArray(classRule.starterTalents)) return [];
    const wanted = new Set(classRule.starterTalents.map(normalize));
    return state.talents
      .filter((t) => t.prof_id === profId && wanted.has(normalize(t.name)))
      .map((t) => t.id);
  }

  function isSkillAvailableForClass(skill, profId) {
    if (!skill) return false;
    if (!skill.prof_id || skill.prof_id === profId) return true;
    return BASIC_SKILL_NAMES.has(normalize(skill.name));
  }

  function isSkillVisibleForCurrentSpec(skill, profId = state.selectedProfessionId) {
    if (!skill) return false;
    const branch = Number(skill.spec_branch_index);
    if (!Number.isInteger(branch) || branch < 0 || branch > 2) return true;
    if (skill.prof_id !== profId) return false;
    const selectedBranch = Number(state.selectedSpecializationByClass[profId]);
    return Number.isInteger(selectedBranch) && selectedBranch === branch;
  }

  function countSelectedVisibleTalents(classTalents) {
    const visibleIds = new Set(classTalents.map((x) => x.id));
    let count = 0;
    for (const id of state.selectedTalentIds) if (visibleIds.has(id)) count += 1;
    return count;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function resolveEffectiveCurrentLevel(autoLevel) {
    const fallback = clampInt(autoLevel, 1, state.config.maxLevel, 1);
    const manual = clampInt(state.manualLevel, 1, state.config.maxLevel, fallback);
    if (state.levelMode !== "manual") {
      state.manualLevel = fallback;
      return fallback;
    }
    if (state.levelMode === "manual") {
      if (fallback > manual) {
        state.levelMode = "auto";
        state.manualLevel = fallback;
        return fallback;
      }
      return manual;
    }
    return fallback;
  }

  function getPlanSignature() {
    const skills = Object.entries(state.selectedSkillTargets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, rank]) => `${id}:${rank}`)
      .join("|");
    const talents = [...state.selectedTalentIds].sort().join("|");
    return [
      state.selectedProfessionId,
      state.selectedRaceId,
      talents,
      skills,
      state.config.maxLevel,
      state.config.points.talentLevel1,
      state.config.points.talentPerLevel,
      state.config.points.skillLevel1,
      state.config.points.skillPerLevel
    ].join("::");
  }

  function isBasicSkill(skill) {
    return BASIC_SKILL_NAMES.has(normalize(skill && skill.name));
  }

  function normalizeTalentRecord(talent) {
    return {
      ...talent,
      name: fixMojibake(talent.name),
      description: fixMojibake(talent.description),
      text: fixMojibake(talent.text),
      text_formatted: fixMojibake(talent.text_formatted)
    };
  }

  function normalizeSkillRecord(skill) {
    return {
      ...skill,
      name: fixMojibake(skill.name),
      description: fixMojibake(skill.description),
      check: fixMojibake(skill.check)
    };
  }

  function mergeManualTalents(baseTalents, manualPayload) {
    if (!manualPayload || !Array.isArray(manualPayload.items)) return baseTalents;
    const byId = new Set(baseTalents.map((x) => x.id));
    const byNameAndProf = new Set(baseTalents.map((x) => `${normalize(x.name)}|${x.prof_id || ""}`));
    const merged = [...baseTalents];
    for (const raw of manualPayload.items) {
      const t = {
        ...normalizeTalentRecord(raw),
        type: "talent",
        source: "pdf-manual"
      };
      const key = `${normalize(t.name)}|${t.prof_id || ""}`;
      if (byId.has(t.id) || byNameAndProf.has(key)) continue;
      merged.push(t);
      byId.add(t.id);
      byNameAndProf.add(key);
    }
    return merged;
  }

  function applyKnownSkillClassOverrides(skills) {
    return skills.map((skill) => {
      const overrideProf = SKILL_CLASS_OVERRIDES.get(normalize(skill.name));
      const next = overrideProf ? { ...skill, prof_id: overrideProf } : skill;
      if (SKILL_NO_PREREQ_NAMES.has(normalize(next.name))) {
        return { ...next, ability_id: null };
      }
      return next;
    });
  }

  function injectManualDSkills(skills) {
    const byId = new Set(skills.map((s) => s.id));
    const byNameProf = new Set(skills.map((s) => `${normalize(s.name)}|${s.prof_id || ""}`));
    const out = [...skills];
    for (const x of MANUAL_D_SKILLS) {
      const ability = state.talents.find(
        (t) => t.prof_id === x.prof_id && normalize(t.name) === normalize(x.ability_name)
      );
      const rec = {
        id: x.id,
        name: x.name,
        description: "Dovednost odemcena schopnosti (D).",
        prof_id: x.prof_id,
        required_level: 1,
        ability_id: ability ? ability.id : null,
        check_type: x.check_type || ["int"],
        is_knowledge_based: !!x.is_knowledge_based,
        manual_order: Number(out.length),
        type: "skill"
      };
      const key = `${normalize(rec.name)}|${rec.prof_id || ""}`;
      if (byId.has(rec.id) || byNameProf.has(key)) continue;
      out.push(rec);
      byId.add(rec.id);
      byNameProf.add(key);
    }
    return out;
  }

  function injectManualSpecializationSkills(skills) {
    const byId = new Set(skills.map((s) => s.id));
    const byNameProf = new Set(skills.map((s) => `${normalize(s.name)}|${s.prof_id || ""}`));
    const out = [...skills];
    for (const x of MANUAL_SPECIALIZATION_SKILLS) {
      const rec = {
        id: x.id,
        name: x.name,
        description: "Dovednost ziskana specializaci povolani.",
        prof_id: x.prof_id,
        required_level: x.required_level || SPECIALIZATION_UNLOCK_LEVEL,
        ability_id: null,
        check_type: x.check_type || ["int"],
        is_knowledge_based: !!x.is_knowledge_based,
        spec_branch_index: x.spec_branch_index,
        auto_floor_on_spec: x.auto_floor_on_spec,
        manual_order: Number(out.length),
        type: "skill"
      };
      const key = `${normalize(rec.name)}|${rec.prof_id || ""}`;
      if (byId.has(rec.id) || byNameProf.has(key)) continue;
      out.push(rec);
      byId.add(rec.id);
      byNameProf.add(key);
    }
    return out;
  }

  function isDTalentId(id) {
    if (!id) return false;
    const t = state.talents.find((x) => x.id === id);
    if (!t) return false;
    return D_TALENT_NAMES.has(normalize(t.name));
  }

  function isSTalentId(id) {
    if (!id) return false;
    const t = state.talents.find((x) => x.id === id);
    if (!t) return false;
    return !isDTalentId(id);
  }

  function requiresPrereqForSkill(skill) {
    if (!skill || !skill.ability_id) return false;
    return isDTalentId(skill.ability_id);
  }

  function isCurrentClassSkill(skill) {
    if (!skill) return false;
    return skill.prof_id === state.selectedProfessionId && !isBasicSkill(skill);
  }

  function autoGrantSkillsFromSTalent(talentId) {
    if (!isSTalentId(talentId)) return;
    const starterIds = new Set(getClassStarterSkillIds());
    for (const s of state.skills) {
      if (s.ability_id !== talentId) continue;
      if (!isCurrentClassSkill(s)) continue;
      const floor = getSkillFloor(s, starterIds, state.selectedProfessionId);
      const current = getSkillTargetRank(s.id, floor);
      if (current < 3) state.selectedSkillTargets[s.id] = 3;
    }
  }

  function fixMojibake(value) {
    const noisePattern = /[\u00C3\u00C5\u00C4\u00C2]/;
    if (typeof value !== "string" || !noisePattern.test(value)) return value;
    try {
      const bytes = Uint8Array.from(value, (ch) => ch.charCodeAt(0) & 0xff);
      const decoded = new TextDecoder("utf-8").decode(bytes);
      const originalNoise = (value.match(/[\u00C3\u00C5\u00C4\u00C2]/g) || []).length;
      const decodedNoise = (decoded.match(/[\u00C3\u00C5\u00C4\u00C2]/g) || []).length;
      return decodedNoise < originalNoise ? decoded : value;
    } catch (_err) {
      return value;
    }
  }

  function byName(a, b) {
    return String(a.name).localeCompare(String(b.name), "cs");
  }

  function byRequiredThenName(a, b) {
    const ra = Number(a.required_level || 1);
    const rb = Number(b.required_level || 1);
    if (ra !== rb) return ra - rb;
    return byName(a, b);
  }

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Cannot load ${path}: ${res.status}`);
    return await res.json();
  }

  async function fetchJsonOptional(path) {
    try {
      return await fetchJson(path);
    } catch (_err) {
      return null;
    }
  }

  function escapeHtml(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
