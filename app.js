(function () {
  const state = {
    professions: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedTalentIds: new Set(),
    selectedSkillIds: new Set(),
    filters: { talent: "", skill: "" },
    config: {
      maxLevel: window.APP_CONFIG.maxLevel,
      points: { ...window.APP_CONFIG.points }
    }
  };

  const els = {
    professionSelect: document.getElementById("professionSelect"),
    maxLevel: document.getElementById("maxLevel"),
    talentL1: document.getElementById("talentL1"),
    talentPerLevel: document.getElementById("talentPerLevel"),
    skillL1: document.getElementById("skillL1"),
    skillPerLevel: document.getElementById("skillPerLevel"),
    talentSearch: document.getElementById("talentSearch"),
    skillSearch: document.getElementById("skillSearch"),
    talentList: document.getElementById("talentList"),
    skillList: document.getElementById("skillList"),
    talentCount: document.getElementById("talentCount"),
    skillCount: document.getElementById("skillCount"),
    summary: document.getElementById("summary"),
    issues: document.getElementById("issues"),
    timeline: document.getElementById("timeline"),
    resetBtn: document.getElementById("resetBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    exchangeBox: document.getElementById("exchangeBox")
  };

  init().catch((err) => {
    console.error(err);
    document.body.innerHTML = "<pre>Chyba při načítání dat. Spusť stránku přes lokální server (ne file://).\n" + String(err) + "</pre>";
  });

  async function init() {
    const [professionsPayload, talentsPayload, skillsPayload] = await Promise.all([
      fetchJson("./research/sirael-professions.json"),
      fetchJson("./research/sirael-player-talents.json"),
      fetchJson("./research/sirael-skills-all.json")
    ]);

    state.professions = professionsPayload.items || [];
    state.talents = (talentsPayload.items || []).map((x) => ({ ...x, type: "talent" }));
    state.skills = (skillsPayload.items || []).map((x) => ({ ...x, type: "skill" }));

    hydrateFromStorage();
    wireEvents();
    renderAll();
  }

  function wireEvents() {
    els.professionSelect.addEventListener("change", () => {
      state.selectedProfessionId = els.professionSelect.value;
      cleanseInvalidSelections();
      renderAll();
      persist();
    });

    els.maxLevel.addEventListener("change", () => {
      state.config.maxLevel = clampInt(els.maxLevel.value, 1, 30, window.APP_CONFIG.maxLevel);
      renderPlanOnly();
      persist();
    });

    els.talentL1.addEventListener("change", () => {
      state.config.points.talentLevel1 = clampInt(els.talentL1.value, 0, 50, window.APP_CONFIG.points.talentLevel1);
      renderPlanOnly();
      persist();
    });

    els.talentPerLevel.addEventListener("change", () => {
      state.config.points.talentPerLevel = clampInt(els.talentPerLevel.value, 0, 50, window.APP_CONFIG.points.talentPerLevel);
      renderPlanOnly();
      persist();
    });

    els.skillL1.addEventListener("change", () => {
      state.config.points.skillLevel1 = clampInt(els.skillL1.value, 0, 50, window.APP_CONFIG.points.skillLevel1);
      renderPlanOnly();
      persist();
    });

    els.skillPerLevel.addEventListener("change", () => {
      state.config.points.skillPerLevel = clampInt(els.skillPerLevel.value, 0, 50, window.APP_CONFIG.points.skillPerLevel);
      renderPlanOnly();
      persist();
    });

    els.talentSearch.addEventListener("input", () => {
      state.filters.talent = els.talentSearch.value.trim().toLowerCase();
      renderTalents();
    });

    els.skillSearch.addEventListener("input", () => {
      state.filters.skill = els.skillSearch.value.trim().toLowerCase();
      renderSkills();
    });

    els.resetBtn.addEventListener("click", () => {
      state.selectedTalentIds.clear();
      state.selectedSkillIds.clear();
      renderAll();
      persist();
    });

    els.exportBtn.addEventListener("click", () => {
      els.exchangeBox.value = JSON.stringify(exportBuild(), null, 2);
    });

    els.importBtn.addEventListener("click", () => {
      try {
        const payload = JSON.parse(els.exchangeBox.value);
        importBuild(payload);
        renderAll();
        persist();
      } catch (e) {
        alert("Import selhal: neplatný JSON.");
      }
    });
  }

  function renderAll() {
    renderControls();
    renderTalents();
    renderSkills();
    renderPlanOnly();
  }

  function renderControls() {
    const select = els.professionSelect;
    select.innerHTML = "";
    state.professions.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === state.selectedProfessionId) opt.selected = true;
      select.appendChild(opt);
    });

    if (!state.selectedProfessionId && state.professions.length) {
      state.selectedProfessionId = state.professions[0].id;
      select.value = state.selectedProfessionId;
    }

    els.maxLevel.value = state.config.maxLevel;
    els.talentL1.value = state.config.points.talentLevel1;
    els.talentPerLevel.value = state.config.points.talentPerLevel;
    els.skillL1.value = state.config.points.skillLevel1;
    els.skillPerLevel.value = state.config.points.skillPerLevel;
  }

  function renderTalents() {
    const list = els.talentList;
    list.innerHTML = "";
    const profId = state.selectedProfessionId;
    const visible = state.talents.filter((t) =>
      belongsToProfession(t.prof_id, profId) &&
      matchesFilter(t, state.filters.talent)
    ).sort(byName);

    visible.forEach((t) => list.appendChild(renderItemRow(t, state.selectedTalentIds, onToggleTalent)));
    els.talentCount.textContent = `${state.selectedTalentIds.size} / ${visible.length} viditelných`;
  }

  function renderSkills() {
    const list = els.skillList;
    list.innerHTML = "";
    const profId = state.selectedProfessionId;
    const visible = state.skills.filter((s) =>
      belongsToProfession(s.prof_id, profId) &&
      matchesFilter(s, state.filters.skill)
    ).sort(byName);

    visible.forEach((s) => list.appendChild(renderItemRow(s, state.selectedSkillIds, onToggleSkill)));
    els.skillCount.textContent = `${state.selectedSkillIds.size} / ${visible.length} viditelných`;
  }

  function renderItemRow(item, selectedSet, handler) {
    const wrapper = document.createElement("label");
    wrapper.className = "item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSet.has(item.id);
    checkbox.addEventListener("change", () => handler(item.id, checkbox.checked));

    const text = document.createElement("div");
    const title = document.createElement("div");
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "meta";
    const prof = item.prof_id ? ` | ${professionName(item.prof_id)}` : " | obecné";
    const req = item.ability_id ? ` | vyžaduje talent ${item.ability_id}` : "";
    meta.textContent = `${item.id}${prof}${req}`;

    const small = document.createElement("small");
    small.textContent = item.description || "";

    text.appendChild(title);
    text.appendChild(meta);
    text.appendChild(small);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(text);
    return wrapper;
  }

  function onToggleTalent(id, checked) {
    if (checked) state.selectedTalentIds.add(id);
    else state.selectedTalentIds.delete(id);
    renderPlanOnly();
    persist();
  }

  function onToggleSkill(id, checked) {
    if (checked) state.selectedSkillIds.add(id);
    else state.selectedSkillIds.delete(id);
    renderPlanOnly();
    persist();
  }

  function renderPlanOnly() {
    const plan = buildPlan();
    renderSummary(plan);
    renderIssues(plan);
    renderTimeline(plan);
  }

  function buildPlan() {
    const profId = state.selectedProfessionId;
    const talents = state.talents.filter((t) => state.selectedTalentIds.has(t.id) && belongsToProfession(t.prof_id, profId));
    const skills = state.skills.filter((s) => state.selectedSkillIds.has(s.id) && belongsToProfession(s.prof_id, profId));

    const selectedTalentMap = new Map(talents.map((t) => [t.id, t]));
    const skillMap = new Map(skills.map((s) => [s.id, s]));

    const issues = [];
    const missingPrereq = [];
    for (const s of skills) {
      if (s.ability_id && !selectedTalentMap.has(s.ability_id)) {
        missingPrereq.push(s);
      }
    }

    const maxLevel = state.config.maxLevel;
    const levels = [];
    for (let lvl = 1; lvl <= maxLevel; lvl += 1) {
      levels.push({
        level: lvl,
        talentCapacity: lvl === 1 ? state.config.points.talentLevel1 : state.config.points.talentPerLevel,
        skillCapacity: lvl === 1 ? state.config.points.skillLevel1 : state.config.points.skillPerLevel,
        talents: [],
        skills: []
      });
    }

    const talentQueue = [...talents].sort(byRequiredThenName);
    const remainingSkills = new Map([...skills].map((s) => [s.id, s]));
    const assignedTalentLevel = new Map();
    const assignedSkillLevel = new Map();

    for (const lvlState of levels) {
      while (lvlState.talents.length < lvlState.talentCapacity && talentQueue.length > 0) {
        const idx = talentQueue.findIndex((t) => t.required_level <= lvlState.level);
        if (idx < 0) break;
        const talent = talentQueue.splice(idx, 1)[0];
        lvlState.talents.push(talent);
        assignedTalentLevel.set(talent.id, lvlState.level);
      }

      const assignableSkills = [...remainingSkills.values()]
        .filter((s) => s.required_level <= lvlState.level)
        .filter((s) => {
          if (!s.ability_id) return true;
          const reqTalentLevel = assignedTalentLevel.get(s.ability_id);
          return typeof reqTalentLevel === "number" && reqTalentLevel <= lvlState.level;
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
      issues.push(`Chybí prerequisite talent pro ${missingPrereq.length} dovedností.`);
    }

    const unscheduledTalents = talentQueue;
    const unscheduledSkills = [...remainingSkills.values()];

    if (unscheduledTalents.length > 0 || unscheduledSkills.length > 0) {
      issues.push("Nedostatek bodů nebo úrovní v aktuálním limitu plánování.");
    }

    const assignedLevels = [
      ...[...assignedTalentLevel.values()],
      ...[...assignedSkillLevel.values()]
    ];
    const computedLevel = assignedLevels.length > 0 ? Math.max(...assignedLevels) : 1;

    return {
      levels,
      issues,
      totals: {
        selectedTalents: talents.length,
        selectedSkills: skills.length,
        assignedTalents: assignedTalentLevel.size,
        assignedSkills: assignedSkillLevel.size,
        currentLevel: computedLevel,
        unscheduledTalents: unscheduledTalents.length,
        unscheduledSkills: unscheduledSkills.length
      },
      unscheduledTalents,
      unscheduledSkills
    };
  }

  function renderSummary(plan) {
    const kpis = [
      ["Aktuální úroveň", String(plan.totals.currentLevel)],
      ["Talenty", `${plan.totals.assignedTalents}/${plan.totals.selectedTalents}`],
      ["Dovednosti", `${plan.totals.assignedSkills}/${plan.totals.selectedSkills}`],
      ["Nezařazeno", `${plan.totals.unscheduledTalents + plan.totals.unscheduledSkills}`]
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
    for (const msg of plan.issues) lines.push(`- ${msg}`);
    if (plan.unscheduledTalents.length > 0) {
      lines.push(`- Nezařazené talenty: ${plan.unscheduledTalents.map((x) => x.name).join(", ")}`);
    }
    if (plan.unscheduledSkills.length > 0) {
      lines.push(`- Nezařazené dovednosti: ${plan.unscheduledSkills.map((x) => x.name).join(", ")}`);
    }
    els.issues.innerHTML = lines.length > 0
      ? `<strong>Varování:</strong><br>${lines.map(escapeHtml).join("<br>")}`
      : "";
  }

  function renderTimeline(plan) {
    const root = els.timeline;
    root.innerHTML = "";

    for (const lvl of plan.levels) {
      if (lvl.talents.length === 0 && lvl.skills.length === 0) continue;
      const card = document.createElement("div");
      card.className = "level-card";

      const head = document.createElement("div");
      head.className = "level-head";
      head.innerHTML = `<strong>Úroveň ${lvl.level}</strong><span>Body: T ${lvl.talents.length}/${lvl.talentCapacity} | D ${lvl.skills.length}/${lvl.skillCapacity}</span>`;

      const tags = document.createElement("div");
      tags.className = "tags";

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

      card.appendChild(head);
      card.appendChild(tags);
      root.appendChild(card);
    }
  }

  function exportBuild() {
    return {
      version: 1,
      professionId: state.selectedProfessionId,
      selectedTalentIds: [...state.selectedTalentIds],
      selectedSkillIds: [...state.selectedSkillIds],
      config: state.config
    };
  }

  function importBuild(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Invalid payload");

    if (payload.professionId) state.selectedProfessionId = payload.professionId;
    state.selectedTalentIds = new Set(Array.isArray(payload.selectedTalentIds) ? payload.selectedTalentIds : []);
    state.selectedSkillIds = new Set(Array.isArray(payload.selectedSkillIds) ? payload.selectedSkillIds : []);

    if (payload.config && typeof payload.config === "object") {
      state.config.maxLevel = clampInt(payload.config.maxLevel, 1, 30, state.config.maxLevel);
      if (payload.config.points) {
        state.config.points.talentLevel1 = clampInt(payload.config.points.talentLevel1, 0, 50, state.config.points.talentLevel1);
        state.config.points.talentPerLevel = clampInt(payload.config.points.talentPerLevel, 0, 50, state.config.points.talentPerLevel);
        state.config.points.skillLevel1 = clampInt(payload.config.points.skillLevel1, 0, 50, state.config.points.skillLevel1);
        state.config.points.skillPerLevel = clampInt(payload.config.points.skillPerLevel, 0, 50, state.config.points.skillPerLevel);
      }
    }

    cleanseInvalidSelections();
  }

  function belongsToProfession(itemProfId, selectedProfId) {
    return !itemProfId || itemProfId === selectedProfId;
  }

  function professionName(id) {
    const p = state.professions.find((x) => x.id === id);
    return p ? p.name : id;
  }

  function matchesFilter(item, rawFilter) {
    if (!rawFilter) return true;
    const f = rawFilter.toLowerCase();
    return (`${item.name} ${item.id} ${item.description || ""}`).toLowerCase().includes(f);
  }

  function cleanseInvalidSelections() {
    const profId = state.selectedProfessionId;
    for (const t of [...state.selectedTalentIds]) {
      const item = state.talents.find((x) => x.id === t);
      if (!item || !belongsToProfession(item.prof_id, profId)) state.selectedTalentIds.delete(t);
    }
    for (const s of [...state.selectedSkillIds]) {
      const item = state.skills.find((x) => x.id === s);
      if (!item || !belongsToProfession(item.prof_id, profId)) state.selectedSkillIds.delete(s);
    }
  }

  function persist() {
    const payload = exportBuild();
    localStorage.setItem(window.APP_CONFIG.storageKey, JSON.stringify(payload));
  }

  function hydrateFromStorage() {
    const raw = localStorage.getItem(window.APP_CONFIG.storageKey);
    if (!raw) return;
    try {
      importBuild(JSON.parse(raw));
    } catch (_e) {
      // ignore corrupted storage
    }
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Nepodarilo se nacist ${path}: ${res.status}`);
    return await res.json();
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
