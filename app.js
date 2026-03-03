(function () {
  const BRANCH_NAMES = {
    PROF_1: ["Berserk", "Strazce", "Veteran"],
    PROF_2: ["Lovec", "Stopar", "Hranicni magie"],
    PROF_3: ["Mastickar", "Mistr smesi", "Runotvurce"],
    PROF_4: ["Elementalista", "Iluzionista", "Arkanista"],
    PROF_5: ["Vrah", "Akrobat", "Stin"],
    PROF_6: ["Inkvizitor", "Ochrance viry", "Mystik"]
  };

  const state = {
    professions: [],
    races: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedRaceId: "",
    selectedTalentIds: new Set(),
    selectedSkillIds: new Set(),
    config: {
      maxLevel: window.APP_CONFIG.maxLevel,
      points: { ...window.APP_CONFIG.points }
    }
  };

  const els = {
    raceSelect: document.getElementById("raceSelect"),
    resetBtn: document.getElementById("resetBtn"),
    classPicker: document.getElementById("classPicker"),
    branchTitle1: document.getElementById("branchTitle1"),
    branchTitle2: document.getElementById("branchTitle2"),
    branchTitle3: document.getElementById("branchTitle3"),
    branch1: document.getElementById("branch1"),
    branch2: document.getElementById("branch2"),
    branch3: document.getElementById("branch3"),
    generalTalents: document.getElementById("generalTalents"),
    talentCount: document.getElementById("talentCount"),
    skillList: document.getElementById("skillList"),
    skillCount: document.getElementById("skillCount"),
    maxLevel: document.getElementById("maxLevel"),
    talentL1: document.getElementById("talentL1"),
    talentPerLevel: document.getElementById("talentPerLevel"),
    skillL1: document.getElementById("skillL1"),
    skillPerLevel: document.getElementById("skillPerLevel"),
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
    const [professionsPayload, racesPayload, talentsPayload, skillsPayload] =
      await Promise.all([
        fetchJson("./research/sirael-professions.json"),
        fetchJson("./research/sirael-races.json"),
        fetchJson("./research/sirael-player-talents.json"),
        fetchJson("./research/sirael-skills-all.json")
      ]);

    state.professions = professionsPayload.items || [];
    state.races = racesPayload.items || [];
    state.talents = (talentsPayload.items || []).map((x) => ({ ...x, type: "talent" }));
    state.skills = (skillsPayload.items || []).map((x) => ({ ...x, type: "skill" }));

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
      state.selectedSkillIds.clear();
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

    const raceTalent = getRaceBonusTalent();
    const generalTalents = state.talents
      .filter((t) => !t.prof_id && (!raceTalent || t.id !== raceTalent.id))
      .sort(byRequiredThenName);

    const branches = [[], [], []];
    classTalents.forEach((talent, idx) => {
      branches[idx % 3].push(talent);
    });

    renderBranch(els.branch1, branches[0]);
    renderBranch(els.branch2, branches[1]);
    renderBranch(els.branch3, branches[2]);

    els.generalTalents.innerHTML = "";
    for (const t of generalTalents) {
      const row = document.createElement("label");
      row.className = "general-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.selectedTalentIds.has(t.id);
      checkbox.addEventListener("change", () => toggleTalent(t.id, checkbox.checked));
      const text = document.createElement("span");
      text.textContent = `${t.name} (${t.id})`;
      row.appendChild(checkbox);
      row.appendChild(text);
      els.generalTalents.appendChild(row);
    }

    const visibleTalentTotal =
      classTalents.length + generalTalents.length + (raceTalent ? 1 : 0);
    const selectedVisible =
      countSelectedVisibleTalents(classTalents, generalTalents) + (raceTalent ? 1 : 0);
    els.talentCount.textContent = `${selectedVisible} / ${visibleTalentTotal}`;
  }

  function renderBranch(container, talents) {
    container.innerHTML = "";
    const maxNodes = Math.max(9, talents.length);
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
        const isSelected = state.selectedTalentIds.has(talent.id);
        if (isSelected) node.classList.add("selected");
        node.title = `${talent.name}\n${talent.description || ""}`;
        node.textContent = talent.name;
        node.addEventListener("click", () => toggleTalent(talent.id, !isSelected));
      }
      container.appendChild(node);
    }
  }

  function renderSkills() {
    const profId = state.selectedProfessionId;
    const raceSkillIds = getRaceBonusSkillIds();
    const raceSkillSet = new Set(raceSkillIds);
    const visibleSkills = state.skills
      .filter((s) => belongsToProfession(s.prof_id, profId) || raceSkillSet.has(s.id))
      .sort(byName);

    els.skillList.innerHTML = "";
    for (const s of visibleSkills) {
      const row = document.createElement("label");
      row.className = "skill-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.selectedSkillIds.has(s.id);
      checkbox.addEventListener("change", () => toggleSkill(s.id, checkbox.checked));
      const box = document.createElement("div");
      const title = document.createElement("div");
      const raceMark = raceSkillSet.has(s.id) ? " [RASA]" : "";
      title.textContent = s.name + raceMark;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${s.id}${s.ability_id ? ` | talent: ${s.ability_id}` : ""}`;
      box.appendChild(title);
      box.appendChild(meta);
      row.appendChild(checkbox);
      row.appendChild(box);
      els.skillList.appendChild(row);
    }
    const selectedVisible = visibleSkills.filter((s) => state.selectedSkillIds.has(s.id)).length;
    els.skillCount.textContent = `${selectedVisible} / ${visibleSkills.length}`;
  }

  function toggleTalent(id, checked) {
    if (checked) state.selectedTalentIds.add(id);
    else state.selectedTalentIds.delete(id);
    renderAll();
    persist();
  }

  function toggleSkill(id, checked) {
    if (checked) state.selectedSkillIds.add(id);
    else state.selectedSkillIds.delete(id);
    renderAll();
    persist();
  }

  function buildPlan() {
    const profId = state.selectedProfessionId;
    const raceTalent = getRaceBonusTalent();
    const racePointBonus = getRacePointBonus(raceTalent);
    const raceSkillIds = getRaceBonusSkillIds();
    const raceSkillSet = new Set(raceSkillIds);

    const talents = state.talents.filter(
      (t) =>
        state.selectedTalentIds.has(t.id) &&
        belongsToProfession(t.prof_id, profId) &&
        (!raceTalent || t.id !== raceTalent.id)
    );

    const skills = state.skills.filter(
      (s) =>
        state.selectedSkillIds.has(s.id) &&
        (belongsToProfession(s.prof_id, profId) || raceSkillSet.has(s.id))
    );

    const selectedTalentMap = new Map(talents.map((t) => [t.id, t]));
    if (raceTalent) selectedTalentMap.set(raceTalent.id, raceTalent);

    const issues = [];
    const missingPrereq = [];
    for (const s of skills) {
      if (s.ability_id && !selectedTalentMap.has(s.ability_id)) missingPrereq.push(s);
    }

    const maxLevel = state.config.maxLevel;
    const levels = [];
    for (let lvl = 1; lvl <= maxLevel; lvl += 1) {
      const talentBase =
        lvl === 1 ? state.config.points.talentLevel1 : state.config.points.talentPerLevel;
      const skillBase =
        lvl === 1 ? state.config.points.skillLevel1 : state.config.points.skillPerLevel;
      levels.push({
        level: lvl,
        talentCapacity:
          talentBase + (lvl === 1 ? racePointBonus.talentLevel1 : racePointBonus.talentPerLevel),
        skillCapacity:
          skillBase + (lvl === 1 ? racePointBonus.skillLevel1 : racePointBonus.skillPerLevel),
        raceBonuses: lvl === 1 && raceTalent ? [raceTalent] : [],
        talents: [],
        skills: []
      });
    }

    const talentQueue = [...talents].sort(byRequiredThenName);
    const remainingSkills = new Map([...skills].map((s) => [s.id, s]));
    const assignedTalentLevel = new Map();
    const assignedSkillLevel = new Map();
    if (raceTalent) assignedTalentLevel.set(raceTalent.id, 1);

    for (const lvlState of levels) {
      while (lvlState.talents.length < lvlState.talentCapacity && talentQueue.length > 0) {
        const idx = talentQueue.findIndex((t) => Number(t.required_level || 1) <= lvlState.level);
        if (idx < 0) break;
        const t = talentQueue.splice(idx, 1)[0];
        lvlState.talents.push(t);
        assignedTalentLevel.set(t.id, lvlState.level);
      }

      const assignableSkills = [...remainingSkills.values()]
        .filter((s) => Number(s.required_level || 1) <= lvlState.level)
        .filter((s) => {
          if (!s.ability_id) return true;
          const reqLvl = assignedTalentLevel.get(s.ability_id);
          return typeof reqLvl === "number" && reqLvl <= lvlState.level;
        })
        .sort(byRequiredThenName);

      while (lvlState.skills.length < lvlState.skillCapacity && assignableSkills.length > 0) {
        const s = assignableSkills.shift();
        if (!remainingSkills.has(s.id)) continue;
        lvlState.skills.push(s);
        remainingSkills.delete(s.id);
        assignedSkillLevel.set(s.id, lvlState.level);
      }
    }

    if (missingPrereq.length > 0) {
      issues.push(`Missing prerequisite talent for ${missingPrereq.length} skills.`);
    }
    if (talentQueue.length > 0 || remainingSkills.size > 0) {
      issues.push("Not enough points in current level cap.");
    }

    const maxAssigned = Math.max(
      1,
      ...assignedTalentLevel.values(),
      ...assignedSkillLevel.values()
    );

    return {
      levels,
      issues,
      unscheduledTalents: talentQueue,
      unscheduledSkills: [...remainingSkills.values()],
      totals: {
        selectedTalents: talents.length + (raceTalent ? 1 : 0),
        selectedSkills: skills.length,
        assignedTalents: assignedTalentLevel.size,
        assignedSkills: assignedSkillLevel.size,
        currentLevel: maxAssigned
      }
    };
  }

  function renderPlanOnly() {
    const plan = buildPlan();
    renderSummary(plan);
    renderIssues(plan);
    renderTimeline(plan);
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
      lines.push(`- Unscheduled skills: ${plan.unscheduledSkills.map((x) => x.name).join(", ")}`);
    }
    els.issues.innerHTML = lines.length ? lines.map(escapeHtml).join("<br>") : "";
  }

  function renderTimeline(plan) {
    els.timeline.innerHTML = "";
    for (const lvl of plan.levels) {
      if (!lvl.raceBonuses.length && !lvl.talents.length && !lvl.skills.length) continue;
      const card = document.createElement("div");
      card.className = "level-card";
      card.innerHTML = `<div class="level-head"><strong>Level ${lvl.level}</strong><span>T ${lvl.talents.length}/${lvl.talentCapacity} | D ${lvl.skills.length}/${lvl.skillCapacity}</span></div>`;
      const tags = document.createElement("div");
      tags.className = "tags";
      for (const r of lvl.raceBonuses) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `RACE BONUS: ${r.name}`;
        tags.appendChild(tag);
      }
      for (const t of lvl.talents) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `T: ${t.name}`;
        tags.appendChild(tag);
      }
      for (const s of lvl.skills) {
        const tag = document.createElement("span");
        tag.className = "tag skill";
        tag.textContent = `D: ${s.name}`;
        tags.appendChild(tag);
      }
      card.appendChild(tags);
      els.timeline.appendChild(card);
    }
  }

  function exportBuild() {
    return {
      version: 3,
      professionId: state.selectedProfessionId,
      raceId: state.selectedRaceId,
      selectedTalentIds: [...state.selectedTalentIds],
      selectedSkillIds: [...state.selectedSkillIds],
      config: state.config
    };
  }

  function importBuild(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
    if (payload.professionId) state.selectedProfessionId = payload.professionId;
    if (payload.raceId) state.selectedRaceId = payload.raceId;
    state.selectedTalentIds = new Set(payload.selectedTalentIds || []);
    state.selectedSkillIds = new Set(payload.selectedSkillIds || []);
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
    const raceSkillSet = new Set(getRaceBonusSkillIds());
    for (const id of [...state.selectedTalentIds]) {
      const t = state.talents.find((x) => x.id === id);
      if (!t || !belongsToProfession(t.prof_id, profId)) state.selectedTalentIds.delete(id);
    }
    for (const id of [...state.selectedSkillIds]) {
      const s = state.skills.find((x) => x.id === id);
      if (!s || (!belongsToProfession(s.prof_id, profId) && !raceSkillSet.has(id))) {
        state.selectedSkillIds.delete(id);
      }
    }
  }

  function getRaceById(id) {
    return state.races.find((r) => r.id === id);
  }

  function getRaceBonusTalent() {
    const race = getRaceById(state.selectedRaceId);
    if (!race || !race.ability) return null;
    return state.talents.find((t) => normalize(t.name) === normalize(race.ability)) || null;
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

  function getRaceBonusSkillIds() {
    const map = window.APP_CONFIG.raceSkillAddsByName || {};
    const names = map[state.selectedRaceId] || [];
    const wanted = new Set(names.map(normalize));
    const result = [];
    for (const s of state.skills) {
      if (wanted.has(normalize(s.name))) result.push(s.id);
    }
    return result;
  }

  function countSelectedVisibleTalents(classTalents, generalTalents) {
    const visibleIds = new Set([...classTalents.map((x) => x.id), ...generalTalents.map((x) => x.id)]);
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

  function belongsToProfession(itemProfId, selectedProfId) {
    return !itemProfId || itemProfId === selectedProfId;
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

  function escapeHtml(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
