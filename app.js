(function () {
  const BRANCH_NAMES = {
    PROF_1: ["Berserk", "Strazce", "Veteran"],
    PROF_2: ["Lovec", "Stopar", "Hranicni magie"],
    PROF_3: ["Mastickar", "Mistr smesi", "Runotvurce"],
    PROF_4: ["Elementalista", "Iluzionista", "Arkanista"],
    PROF_5: ["Vrah", "Akrobat", "Stin"],
    PROF_6: ["Inkvizitor", "Ochrance viry", "Mystik"]
  };
  const GENERAL_TALENT_SLOTS = 12;
  const BRANCH_TALENT_SLOTS = 12;
  const SPECIALIZATION_UNLOCK_LEVEL = 6;

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
    // Zlodej (D) - doplnene dovednosti
    { id: "PDF_SKILL_THF_01", name: "Lezeni", prof_id: "PROF_5", ability_name: "Umeni kociciho pohybu", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_02", name: "Ohebnost", prof_id: "PROF_5", ability_name: "Umeni kociciho pohybu", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_03", name: "Pad z vysky", prof_id: "PROF_5", ability_name: "Umeni kociciho pohybu", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_04", name: "Schovani se ve stinu", prof_id: "PROF_5", ability_name: "Umeni skryvani", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_05", name: "Splynuti s davem", prof_id: "PROF_5", ability_name: "Umeni skryvani", check_type: ["cha"] },
    { id: "PDF_SKILL_THF_06", name: "Maskovani", prof_id: "PROF_5", ability_name: "Umeni promen", check_type: ["int"] },
    { id: "PDF_SKILL_THF_07", name: "Odstraneni pasti", prof_id: "PROF_5", ability_name: "Umeni zelezneho klice", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_08", name: "Otevirani zamku", prof_id: "PROF_5", ability_name: "Umeni zelezneho klice", check_type: ["dex"] },
    { id: "PDF_SKILL_THF_09", name: "Padelani", prof_id: "PROF_5", ability_name: "Umeni sarmu", check_type: ["int"] }
  ];

  const state = {
    professions: [],
    races: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedRaceId: "",
    selectedTalentIds: new Set(),
    selectedSpecializationByClass: {},
    selectedSkillTargets: {},
    pdfCoverage: {
      skills: new Set(),
      talents: new Set()
    },
    manualLevel: 1,
    levelMode: "auto",
    config: {
      maxLevel: window.APP_CONFIG.maxLevel,
      points: { ...window.APP_CONFIG.points }
    }
  };

  const els = {
    raceSelect: document.getElementById("raceSelect"),
    resetBtn: document.getElementById("resetBtn"),
    classPicker: document.getElementById("classPicker"),
    generalNodes: document.getElementById("generalNodes"),
    specPicker: document.getElementById("specPicker"),
    branchTitle1: document.getElementById("branchTitle1"),
    branchTitle2: document.getElementById("branchTitle2"),
    branchTitle3: document.getElementById("branchTitle3"),
    branch1: document.getElementById("branch1"),
    branch2: document.getElementById("branch2"),
    branch3: document.getElementById("branch3"),
    talentCount: document.getElementById("talentCount"),
    skillList: document.getElementById("skillList"),
    skillCount: document.getElementById("skillCount"),
    maxLevel: document.getElementById("maxLevel"),
    talentL1: document.getElementById("talentL1"),
    talentPerLevel: document.getElementById("talentPerLevel"),
    skillL1: document.getElementById("skillL1"),
    skillPerLevel: document.getElementById("skillPerLevel"),
    manualLevelMinus: document.getElementById("manualLevelMinus"),
    manualLevelInput: document.getElementById("manualLevelInput"),
    manualLevelPlus: document.getElementById("manualLevelPlus"),
    summary: document.getElementById("summary"),
    issues: document.getElementById("issues"),
    timeline: document.getElementById("timeline"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    exchangeBox: document.getElementById("exchangeBox")
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
    state.skills = injectManualDSkills(applyKnownSkillClassOverrides(baseSkills));
    if (pdfCoveragePayload && typeof pdfCoveragePayload === "object") {
      state.pdfCoverage.skills = new Set(Array.isArray(pdfCoveragePayload.skills) ? pdfCoveragePayload.skills : []);
      state.pdfCoverage.talents = new Set(Array.isArray(pdfCoveragePayload.talents) ? pdfCoveragePayload.talents : []);
    }

    hydrateFromStorage();
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
  }

  function wireEvents() {
    els.raceSelect.addEventListener("change", () => {
      state.selectedRaceId = els.raceSelect.value;
      cleanseInvalidSelections();
      renderAll();
      persist();
    });

    els.resetBtn.addEventListener("click", () => {
      state.selectedTalentIds.clear();
      state.selectedSpecializationByClass = {};
      state.selectedSkillTargets = {};
      renderAll();
      persist();
    });

    bindNumber(els.maxLevel, (v) => {
      state.config.maxLevel = clampInt(v, 1, 30, window.APP_CONFIG.maxLevel);
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
    els.manualLevelMinus.addEventListener("click", () => {
      state.levelMode = "manual";
      state.manualLevel = clampInt(state.manualLevel - 1, 1, state.config.maxLevel, 1);
      renderAll();
      persist();
    });
    els.manualLevelPlus.addEventListener("click", () => {
      state.levelMode = "manual";
      state.manualLevel = clampInt(state.manualLevel + 1, 1, state.config.maxLevel, state.config.maxLevel);
      renderAll();
      persist();
    });
    els.manualLevelInput.addEventListener("change", () => {
      state.levelMode = "manual";
      state.manualLevel = clampInt(els.manualLevelInput.value, 1, state.config.maxLevel, 1);
      renderAll();
      persist();
    });

    els.exportBtn.addEventListener("click", () => {
      els.exchangeBox.value = JSON.stringify(exportBuild(), null, 2);
    });

    els.importBtn.addEventListener("click", () => {
      try {
        importBuild(JSON.parse(els.exchangeBox.value));
        renderAll();
        persist();
      } catch (_err) {
        alert("Import failed: invalid JSON.");
      }
    });
    window.addEventListener("resize", () => {
      renderSkills();
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
    renderControls();
    renderTalentTree();
    renderSkills();
    renderPlanOnly();
  }

  function renderControls() {
    els.raceSelect.innerHTML = "";
    for (const r of state.races) {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name;
      if (r.id === state.selectedRaceId) opt.selected = true;
      els.raceSelect.appendChild(opt);
    }
    els.raceSelect.value = state.selectedRaceId;

    renderClassPicker();

    els.maxLevel.value = state.config.maxLevel;
    els.talentL1.value = state.config.points.talentLevel1;
    els.talentPerLevel.value = state.config.points.talentPerLevel;
    els.skillL1.value = state.config.points.skillLevel1;
    els.skillPerLevel.value = state.config.points.skillPerLevel;
    const manual = clampInt(state.manualLevel, 1, state.config.maxLevel, 1);
    els.manualLevelInput.max = String(state.config.maxLevel);
    els.manualLevelInput.value = String(manual);
  }

  function renderClassPicker() {
    els.classPicker.innerHTML = "";
    for (const p of state.professions) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-box";
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
    const profId = state.selectedProfessionId;
    const branchNames = BRANCH_NAMES[profId] || ["Branch I", "Branch II", "Branch III"];
    els.branchTitle1.textContent = branchNames[0];
    els.branchTitle2.textContent = branchNames[1];
    els.branchTitle3.textContent = branchNames[2];

    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const starterTalentIds = new Set(getClassStarterTalentIds(profId));
    const split = splitClassTalentsForTree(classTalents);
    const currentLevel = getCurrentCharacterLevel();
    const specializationUnlocked = currentLevel >= SPECIALIZATION_UNLOCK_LEVEL;
    if (!specializationUnlocked) {
      for (const branch of split.branches) {
        for (const talent of branch) state.selectedTalentIds.delete(talent.id);
      }
      delete state.selectedSpecializationByClass[profId];
    }
    const lockedSpecIndex = getLockedSpecializationIndex(profId, split.branches);

    renderBranch(els.generalNodes, split.general, {
      maxNodes: GENERAL_TALENT_SLOTS,
      disabled: false,
      starterTalentIds,
      onToggle: (talent, checked) => toggleTalent(talent.id, checked)
    });

    renderSpecializationPicker(
      profId,
      branchNames,
      split.branches,
      specializationUnlocked,
      lockedSpecIndex,
      currentLevel
    );

    const branchContainers = [els.branch1, els.branch2, els.branch3];
    for (let i = 0; i < branchContainers.length; i += 1) {
      const container = branchContainers[i];
      const card = container.parentElement;
      const branchTalents = split.branches[i] || [];
      const branchEnabled = specializationUnlocked && lockedSpecIndex === i;
      card.classList.toggle("branch-active", branchEnabled);
      card.classList.toggle("branch-hidden", !branchEnabled);
      renderBranch(container, branchTalents, {
        maxNodes: BRANCH_TALENT_SLOTS,
        disabled: !branchEnabled,
        starterTalentIds,
        onToggle: (talent, checked) => toggleTalentInBranch(profId, i, talent.id, checked)
      });
    }
    const raceTalent = getRaceBonusTalent();
    const visibleTalentTotal = classTalents.length + (raceTalent ? 1 : 0);
    const selectedVisible = countSelectedVisibleTalents(classTalents) + (raceTalent ? 1 : 0);
    els.talentCount.textContent = `${selectedVisible} / ${visibleTalentTotal}`;
  }

  function renderBranch(container, talents, opts = {}) {
    const maxNodes = Number.isFinite(opts.maxNodes) ? opts.maxNodes : Math.max(9, talents.length);
    const isDisabled = !!opts.disabled;
    const starterTalentIds = opts.starterTalentIds instanceof Set ? opts.starterTalentIds : new Set();
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
        if (isSelected) node.classList.add("selected");
        if (isStarterTalent) node.classList.add("locked");
        if (isDisabled) node.classList.add("locked");
        if (isPdfCovered) node.classList.add("pdf-covered");
        node.title = `${talent.name}\n${talent.description || ""}`;
        if (isStarterTalent) node.title += "\n[ZAKLAD OD LVL 1]";
        if (isPdfCovered) node.title += "\n[PDF]";
        node.textContent = talent.name;
        node.disabled = isDisabled || isStarterTalent;
        if (onToggle && !isStarterTalent) node.addEventListener("click", () => onToggle(talent, !isSelected));
      }
      container.appendChild(node);
    }
  }

  function renderSpecializationPicker(profId, branchNames, branches, unlocked, activeIndex, currentLevel) {
    els.specPicker.innerHTML = "";
    for (let i = 0; i < 3; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spec-node";
      if (activeIndex === i) btn.classList.add("active");
      if (!unlocked) btn.classList.add("locked");
      const selectedCount = (branches[i] || []).filter((t) => state.selectedTalentIds.has(t.id)).length;
      const suffix = selectedCount > 0 ? ` (${selectedCount})` : "";
      btn.textContent = `${branchNames[i]}${suffix}`;
      if (!unlocked) {
        btn.title = `Odemkne se od levelu ${SPECIALIZATION_UNLOCK_LEVEL}. Aktuálně ${currentLevel}.`;
        btn.disabled = true;
      } else {
        const blockedByLock = activeIndex !== null && activeIndex !== i;
        if (blockedByLock) btn.classList.add("locked");
        btn.title =
          activeIndex === i
            ? "Klikni pro vyčištění celé větve a odemknutí ostatních specializací."
            : blockedByLock
              ? "Ostatní specializace jsou zamčené, dokud neodznačíš aktivní větev."
              : "Vybrat specializaci";
        btn.disabled = blockedByLock;
        btn.addEventListener("click", () => {
          if (activeIndex === i) clearSpecializationBranch(profId, i);
          else if (activeIndex === null || activeIndex === i) setSpecialization(profId, i);
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
      .filter((s) => isSkillAvailableForClass(s, profId) || starterIds.has(s.id))
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

    els.skillList.innerHTML = "";
    for (const s of visibleSkills) {
      const floorRank = getSkillFloor(s, starterIds, profId);
      const targetRank = getSkillTargetRank(s.id, floorRank);
      const isPdfCovered = state.pdfCoverage.skills.has(s.id);

      const row = document.createElement("div");
      row.className = "skill-item";
      if (closeStarterIds.has(s.id)) row.classList.add("starter");
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
        selectedTalentIds.has(s.ability_id) ||
        (profId === "PROF_2" && s.prof_id === "PROF_2");
      const reqTalent = s.ability_id ? state.talents.find((t) => t.id === s.ability_id) : null;

      if (!hasPrereq) {
        const lock = document.createElement("span");
        lock.className = "skill-lock";
        lock.textContent = `Vyžaduje ${reqTalent ? reqTalent.name : s.ability_id}`;
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
      els.skillList.appendChild(row);
    }

    fitSkillRowsToViewport(visibleSkills.length);

    const selectedVisible = visibleSkills.filter((s) => getSkillTargetRank(s.id, getSkillFloor(s, starterIds, profId)) > 0).length;
    els.skillCount.textContent = `${selectedVisible} / ${visibleSkills.length}`;
  }

  function fitSkillRowsToViewport(rowCount) {
    if (!els.skillList || rowCount <= 0) return;
    const listHeight = els.skillList.clientHeight;
    if (!listHeight || !Number.isFinite(listHeight)) return;
    const gapPx = 2;
    const raw = (listHeight - Math.max(0, rowCount - 1) * gapPx) / rowCount;
    const rowPx = Math.max(18, Math.min(30, Math.floor(raw)));
    els.skillList.style.gridAutoRows = `${rowPx}px`;
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
    if (isClassSkill && reqLevel <= 1) floor = Math.max(floor, 3);
    return floor;
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
      state.selectedTalentIds.add(id);
      autoGrantSkillsFromSTalent(id);
    } else state.selectedTalentIds.delete(id);
    renderAll();
    persist();
  }

  function splitClassTalentsForTree(classTalents) {
    const isPdfGeneral = (t) => String(t.id || "").startsWith("PDF_ABI_");
    const pdfGeneral = classTalents.filter(isPdfGeneral).sort(byRequiredThenName);
    const nonPdf = classTalents.filter((t) => !isPdfGeneral(t)).sort(byRequiredThenName);
    const general = [...pdfGeneral, ...nonPdf].slice(0, GENERAL_TALENT_SLOTS);
    const generalIds = new Set(general.map((t) => t.id));
    const rest = classTalents.filter((t) => !generalIds.has(t.id));
    const branches = [[], [], []];
    rest.forEach((talent, idx) => {
      const branchIndex = idx % 3;
      if (branches[branchIndex].length < BRANCH_TALENT_SLOTS) branches[branchIndex].push(talent);
    });
    return { general, branches };
  }

  function getCurrentCharacterLevel() {
    const plan = buildPlan();
    return clampInt(plan.totals.currentLevel, 1, state.config.maxLevel, 1);
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
        for (const t of branches[i]) state.selectedTalentIds.delete(t.id);
      }
      state.selectedSpecializationByClass[profId] = locked;
      return locked;
    }
    if (forced === 0 || forced === 1 || forced === 2) return forced;
    return null;
  }

  function setSpecialization(profId, branchIndex) {
    state.selectedSpecializationByClass[profId] = branchIndex;
  }

  function clearSpecializationBranch(profId, branchIndex) {
    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);
    const { branches } = splitClassTalentsForTree(classTalents);
    for (const t of branches[branchIndex] || []) state.selectedTalentIds.delete(t.id);
    delete state.selectedSpecializationByClass[profId];
  }

  function toggleTalentInBranch(profId, branchIndex, talentId, checked) {
    const currentLevel = getCurrentCharacterLevel();
    if (currentLevel < SPECIALIZATION_UNLOCK_LEVEL) return;
    const lockedIndex = getLockedSpecializationIndex(profId, splitClassTalentsForTree(
      state.talents.filter((t) => t.prof_id === profId).sort(byRequiredThenName)
    ).branches);
    if (lockedIndex !== null && lockedIndex !== branchIndex) return;
    state.selectedSpecializationByClass[profId] = branchIndex;
    if (checked) {
      state.selectedTalentIds.add(talentId);
      autoGrantSkillsFromSTalent(talentId);
    }
    else {
      state.selectedTalentIds.delete(talentId);
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
      if (!isSkillAvailableForClass(s, profId) && !starterIds.has(s.id)) continue;
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
        (lvl === 1 ? state.config.points.skillLevel1 : state.config.points.skillPerLevel) +
        (lvl === 1 ? racePointBonus.skillLevel1 : racePointBonus.skillPerLevel) +
        (lvl === 1 ? 0 : classRule.skillPointsMultiplier * lvl);
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

    const talentQueue = [...talents].sort(byRequiredThenName);
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

    if (unscheduledTalents.length > 0 || unscheduledSkills.length > 0) {
      issues.push("Not enough points/levels for all requested targets.");
    }

    const maxAssignedTalent = Math.max(1, ...assignedTalentLevel.values());
    const maxSkillActionLevel = Math.max(
      1,
      ...levels
        .filter((l) => l.skillActions.length > 0)
        .map((l) => l.level)
    );

    const autoLevel = Math.max(maxAssignedTalent, maxSkillActionLevel);
    const effectiveLevel = resolveEffectiveCurrentLevel(autoLevel);

    return {
      levels,
      issues,
      unscheduledTalents,
      unscheduledSkills,
      totals: {
        selectedTalents: talents.length + classStarterTalents.length + (raceTalent ? 1 : 0),
        selectedSkills: skillPlans.length,
        assignedTalents:
          (talents.length - unscheduledTalents.length) + classStarterTalents.length + (raceTalent ? 1 : 0),
        assignedSkills: skillPlans.length - unscheduledSkills.length,
        currentLevel: effectiveLevel
      }
    };
  }

  function renderPlanOnly() {
    const modeBefore = state.levelMode;
    const plan = buildPlan();
    renderSummary(plan);
    renderIssues(plan);
    renderTimeline(plan);
    if (modeBefore !== state.levelMode) persist();
  }

  function renderSummary(plan) {
    const kpis = [
      ["Current level", String(plan.totals.currentLevel)],
      ["Talents", `${plan.totals.assignedTalents}/${plan.totals.selectedTalents}`],
      ["Skills", `${plan.totals.assignedSkills}/${plan.totals.selectedSkills}`],
      ["Unscheduled", `${plan.unscheduledTalents.length + plan.unscheduledSkills.length}`]
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
    if (plan.unscheduledTalents.length) {
      lines.push(`- Unscheduled talents: ${plan.unscheduledTalents.map((x) => x.name).join(", ")}`);
    }
    if (plan.unscheduledSkills.length) {
      lines.push(
        `- Unscheduled skill ranks: ${plan.unscheduledSkills
          .map((x) => `${x.skill.name} (${x.currentRank}->${x.targetRank})`)
          .join(", ")}`
      );
    }
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
      const tags = document.createElement("div");
      tags.className = "tags";
      for (const r of lvl.raceBonuses) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `RACE BONUS: ${r.name}`;
        tags.appendChild(tag);
      }
      for (const s of lvl.startSkills) {
        const tag = document.createElement("span");
        tag.className = "tag skill";
        tag.textContent = `D: ${s.name} (3)`;
        tags.appendChild(tag);
      }
      for (const t of lvl.talents) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `T: ${t.name}`;
        tags.appendChild(tag);
      }
      for (const a of lvl.skillActions) {
        const tag = document.createElement("span");
        tag.className = "tag skill";
        tag.textContent = `D: ${a.skill.name} ${a.from}->${a.to} (-${a.cost})`;
        tags.appendChild(tag);
      }
      card.appendChild(levelBadge);
      card.appendChild(tags);
      els.timeline.appendChild(card);
    }
  }

  function exportBuild() {
    return {
      version: 4,
      professionId: state.selectedProfessionId,
      raceId: state.selectedRaceId,
      selectedTalentIds: [...state.selectedTalentIds],
      selectedSpecializationByClass: state.selectedSpecializationByClass,
      selectedSkillTargets: state.selectedSkillTargets,
      manualLevel: state.manualLevel,
      levelMode: state.levelMode,
      config: state.config
    };
  }

  function importBuild(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
    if (payload.professionId) state.selectedProfessionId = payload.professionId;
    if (payload.raceId) state.selectedRaceId = payload.raceId;
    state.selectedTalentIds = new Set(payload.selectedTalentIds || []);
    state.selectedSpecializationByClass =
      payload.selectedSpecializationByClass && typeof payload.selectedSpecializationByClass === "object"
        ? payload.selectedSpecializationByClass
        : {};
    state.selectedSkillTargets = payload.selectedSkillTargets || {};
    state.manualLevel = Number.isFinite(payload.manualLevel)
      ? clampInt(payload.manualLevel, 1, 30, 1)
      : 1;
    state.levelMode = payload.levelMode === "manual" ? "manual" : "auto";
    if (payload.selectedSkillIds && !payload.selectedSkillTargets) {
      // backward compatibility with old binary model
      for (const id of payload.selectedSkillIds) state.selectedSkillTargets[id] = 1;
    }
    if (payload.config && payload.config.points) {
      state.config.maxLevel = clampInt(payload.config.maxLevel, 1, 30, state.config.maxLevel);
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
        state.selectedTalentIds.delete(id);
      }
    }

    const cleaned = {};
    for (const [id, target] of Object.entries(state.selectedSkillTargets)) {
      const s = state.skills.find((x) => x.id === id);
      if (!s) continue;
      if (!isSkillAvailableForClass(s, profId) && !starterIds.has(id)) continue;
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
    if (state.levelMode === "manual") {
      if (fallback > manual) {
        state.levelMode = "auto";
        return fallback;
      }
      return manual;
    }
    return fallback;
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
