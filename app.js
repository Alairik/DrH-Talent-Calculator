(function () {
  const BRANCH_NAMES = {
    PROF_1: ["Berserk", "Strazce", "Veteran"],
    PROF_2: ["Lovec", "Stopar", "Hranicni magie"],
    PROF_3: ["Mastickar", "Mistr smesi", "Runotvurce"],
    PROF_4: ["Elementalista", "Iluzionista", "Arkanista"],
    PROF_5: ["Vrah", "Akrobat", "Stin"],
    PROF_6: ["Inkvizitor", "Ochrance viry", "Mystik"]
  };

  const CLASS_RULES = {
    PROF_1: { starterSkills: ["Atletika", "Prvni pomoc", "Vydrz"], skillPointsMultiplier: 3 },
    PROF_2: { starterSkills: ["Prvni pomoc", "Preziti v prirode", "Znalost prirody"], skillPointsMultiplier: 5 },
    PROF_3: { starterSkills: ["Cteni a psani", "Mechanika", "Znalost prirody"], skillPointsMultiplier: 4 },
    PROF_4: { starterSkills: ["Cizi jazyky", "Cteni a psani", "Historie"], skillPointsMultiplier: 3 },
    PROF_5: { starterSkills: ["Akrobacie", "Postreh", "Reflex"], skillPointsMultiplier: 8 },
    PROF_6: { starterSkills: ["Cteni a psani", "Teologie", "Vule"], skillPointsMultiplier: 3 }
  };

  const START_SKILL_POINTS_BASE = 3;

  const state = {
    professions: [],
    races: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedRaceId: "",
    selectedTalentIds: new Set(),
    selectedSkillTargets: {},
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
    const branches = [[], [], []];
    classTalents.forEach((talent, idx) => {
      branches[idx % 3].push(talent);
    });

    renderBranch(els.branch1, branches[0]);
    renderBranch(els.branch2, branches[1]);
    renderBranch(els.branch3, branches[2]);

    const visibleTalentTotal = classTalents.length + (raceTalent ? 1 : 0);
    const selectedVisible = countSelectedVisibleTalents(classTalents) + (raceTalent ? 1 : 0);
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
    const starterIds = new Set(getClassStarterSkillIds());
    const visibleSkills = state.skills
      .filter((s) => isSkillAvailableForClass(s, profId) || starterIds.has(s.id))
      .sort(byName);

    els.skillList.innerHTML = "";
    for (const s of visibleSkills) {
      const starterRank = starterIds.has(s.id) ? 3 : 0;
      const targetRank = getSkillTargetRank(s.id, starterRank);

      const row = document.createElement("div");
      row.className = "skill-item";

      const left = document.createElement("div");
      const title = document.createElement("div");
      const startMark = starterRank > 0 ? " [START 3]" : "";
      title.textContent = s.name + startMark;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${s.id}${s.ability_id ? ` | talent: ${s.ability_id}` : ""}`;
      left.appendChild(title);
      left.appendChild(meta);

      const controls = document.createElement("div");
      controls.className = "skill-rank-controls";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "-";
      minus.disabled = targetRank <= starterRank;
      minus.addEventListener("click", () => setSkillTargetRank(s.id, targetRank - 1, starterRank));

      const badge = document.createElement("span");
      badge.className = "skill-rank-badge";
      badge.textContent = targetRank > 0 ? `Stupen ${targetRank}` : "Nevybrano";

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.disabled = targetRank >= 10;
      plus.addEventListener("click", () => setSkillTargetRank(s.id, targetRank + 1, starterRank));

      controls.appendChild(minus);
      controls.appendChild(badge);
      controls.appendChild(plus);

      row.appendChild(left);
      row.appendChild(controls);
      els.skillList.appendChild(row);
    }

    const selectedVisible = visibleSkills.filter((s) => getSkillTargetRank(s.id, starterIds.has(s.id) ? 3 : 0) > 0).length;
    els.skillCount.textContent = `${selectedVisible} / ${visibleSkills.length}`;
  }

  function setSkillTargetRank(id, desired, floor) {
    const next = Math.max(floor, Math.min(10, desired));
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
    if (checked) state.selectedTalentIds.add(id);
    else state.selectedTalentIds.delete(id);
    renderAll();
    persist();
  }

  function buildPlan() {
    const profId = state.selectedProfessionId;
    const raceTalent = getRaceBonusTalent();
    const racePointBonus = getRacePointBonus(raceTalent);
    const starterIds = new Set(getClassStarterSkillIds());

    const talents = state.talents.filter(
      (t) =>
        state.selectedTalentIds.has(t.id) &&
        t.prof_id === profId &&
        (!raceTalent || t.id !== raceTalent.id)
    );

    const skillPlans = [];
    for (const s of state.skills) {
      if (!isSkillAvailableForClass(s, profId) && !starterIds.has(s.id)) continue;
      const startRank = starterIds.has(s.id) ? 3 : 0;
      const targetRank = getSkillTargetRank(s.id, startRank);
      if (targetRank <= 0) continue;
      skillPlans.push({ skill: s, startRank, targetRank, currentRank: startRank });
    }

    const selectedTalentMap = new Map(talents.map((t) => [t.id, t]));
    if (raceTalent) selectedTalentMap.set(raceTalent.id, raceTalent);

    const issues = [];
    const missingPrereq = [];
    for (const p of skillPlans) {
      if (p.skill.ability_id && !selectedTalentMap.has(p.skill.ability_id)) {
        missingPrereq.push(p.skill);
      }
    }

    const maxLevel = state.config.maxLevel;
    const levels = [];
    const classRule = CLASS_RULES[profId] || { skillPointsMultiplier: 3 };
    for (let lvl = 1; lvl <= maxLevel; lvl += 1) {
      const talentBase =
        lvl === 1 ? state.config.points.talentLevel1 : state.config.points.talentPerLevel;
      const skillGain =
        lvl === 1
          ? START_SKILL_POINTS_BASE + racePointBonus.skillLevel1
          : classRule.skillPointsMultiplier * lvl;
      levels.push({
        level: lvl,
        talentCapacity:
          talentBase + (lvl === 1 ? racePointBonus.talentLevel1 : racePointBonus.talentPerLevel),
        skillGain,
        skillSpent: 0,
        skillCarry: 0,
        raceBonuses: lvl === 1 && raceTalent ? [raceTalent] : [],
        startSkills: lvl === 1 ? skillPlans.filter((x) => x.startRank >= 3).map((x) => x.skill) : [],
        talents: [],
        skillActions: []
      });
    }

    const talentQueue = [...talents].sort(byRequiredThenName);
    const assignedTalentLevel = new Map();
    if (raceTalent) assignedTalentLevel.set(raceTalent.id, 1);

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
            if (!p.skill.ability_id) return true;
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

    return {
      levels,
      issues,
      unscheduledTalents,
      unscheduledSkills,
      totals: {
        selectedTalents: talents.length + (raceTalent ? 1 : 0),
        selectedSkills: skillPlans.length,
        assignedTalents: (talents.length - unscheduledTalents.length) + (raceTalent ? 1 : 0),
        assignedSkills: skillPlans.length - unscheduledSkills.length,
        currentLevel: Math.max(maxAssignedTalent, maxSkillActionLevel)
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
      card.innerHTML = `<div class="level-head"><strong>Level ${lvl.level}</strong><span>T ${lvl.talents.length}/${lvl.talentCapacity} | D +${lvl.skillGain}, spent ${lvl.skillSpent}, carry ${lvl.skillCarry}</span></div>`;
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
        tag.textContent = `START SKILL: ${s.name} (3)`;
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
      selectedSkillTargets: state.selectedSkillTargets,
      config: state.config
    };
  }

  function importBuild(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
    if (payload.professionId) state.selectedProfessionId = payload.professionId;
    if (payload.raceId) state.selectedRaceId = payload.raceId;
    state.selectedTalentIds = new Set(payload.selectedTalentIds || []);
    state.selectedSkillTargets = payload.selectedSkillTargets || {};
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
      const floor = starterIds.has(id) ? 3 : 0;
      const t = Math.max(floor, Number(target) || floor);
      if (t > floor) cleaned[id] = t;
    }
    state.selectedSkillTargets = cleaned;
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

  function getClassStarterSkillIds() {
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

  function isSkillAvailableForClass(skill, profId) {
    return !skill.prof_id || skill.prof_id === profId;
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
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
