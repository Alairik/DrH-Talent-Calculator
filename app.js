(function () {
  const BRANCH_NAMES = {
    PROF_1: ["Berserk", "Strážce", "Veterán"],
    PROF_2: ["Lovec", "Stopař", "Hraniční magie"],
    PROF_3: ["Mastičkář", "Mistr směsí", "Runotvůrce"],
    PROF_4: ["Elementalista", "Iluzionista", "Arkanista"],
    PROF_5: ["Vrah", "Akrobat", "Stín"],
    PROF_6: ["Inkvizitor", "Ochránce víry", "Mystik"]
  };

  const state = {
    professions: [],
    talents: [],
    skills: [],
    selectedProfessionId: "",
    selectedTalentIds: new Set(),
    selectedSkillIds: new Set(),
    config: {
      maxLevel: window.APP_CONFIG.maxLevel,
      points: { ...window.APP_CONFIG.points }
    }
  };

  const els = {
    professionSelect: document.getElementById("professionSelect"),
    resetBtn: document.getElementById("resetBtn"),
    branchTitle1: document.getElementById("branchTitle1"),
    branchTitle2: document.getElementById("branchTitle2"),
    branchTitle3: document.getElementById("branchTitle3"),
    classPicker: document.getElementById("classPicker"),
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
    document.body.innerHTML = "<pre>Chyba při načítání dat. Spusť přes lokální server (ne file://).\n" + String(err) + "</pre>";
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
      state.config.points.talentLevel1 = clampInt(v, 0, 50, window.APP_CONFIG.points.talentLevel1);
    });
    bindNumber(els.talentPerLevel, (v) => {
      state.config.points.talentPerLevel = clampInt(v, 0, 50, window.APP_CONFIG.points.talentPerLevel);
    });
    bindNumber(els.skillL1, (v) => {
      state.config.points.skillLevel1 = clampInt(v, 0, 50, window.APP_CONFIG.points.skillLevel1);
    });
    bindNumber(els.skillPerLevel, (v) => {
      state.config.points.skillPerLevel = clampInt(v, 0, 50, window.APP_CONFIG.points.skillPerLevel);
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
      } catch (_err) {
        alert("Import selhal: neplatný JSON.");
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
    els.professionSelect.innerHTML = "";
    for (const p of state.professions) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === state.selectedProfessionId) opt.selected = true;
      els.professionSelect.appendChild(opt);
    }
    if (!state.selectedProfessionId && state.professions.length > 0) {
      state.selectedProfessionId = state.professions[0].id;
      els.professionSelect.value = state.selectedProfessionId;
    }

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
        els.professionSelect.value = p.id;
        cleanseInvalidSelections();
        renderAll();
        persist();
      });
      els.classPicker.appendChild(btn);
    }
  }

  function renderTalentTree() {
    const profId = state.selectedProfessionId;
    const branchNames = BRANCH_NAMES[profId] || ["Větev I", "Větev II", "Větev III"];
    els.branchTitle1.textContent = branchNames[0];
    els.branchTitle2.textContent = branchNames[1];
    els.branchTitle3.textContent = branchNames[2];

    const classTalents = state.talents
      .filter((t) => t.prof_id === profId)
      .sort(byRequiredThenName);

    const generalTalents = state.talents
      .filter((t) => !t.prof_id)
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

    const visibleTalentTotal = classTalents.length + generalTalents.length;
    els.talentCount.textContent = `${countSelectedVisibleTalents(classTalents, generalTalents)} / ${visibleTalentTotal}`;
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
    const visibleSkills = state.skills
      .filter((s) => belongsToProfession(s.prof_id, profId))
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
      title.textContent = s.name;
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
    renderPlanOnly();
    renderSkills();
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
    const issues = [];
    const missingPrereq = [];
    for (const s of skills) {
      if (s.ability_id && !selectedTalentMap.has(s.ability_id)) missingPrereq.push(s);
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
      issues.push(`Chybí prerequisite talent pro ${missingPrereq.length} dovedností.`);
    }

    if (talentQueue.length > 0 || remainingSkills.size > 0) {
      issues.push("Nedostatek bodů v aktuálním level capu.");
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
        selectedTalents: talents.length,
        selectedSkills: skills.length,
        assignedTalents: assignedTalentLevel.size,
        assignedSkills: assignedSkillLevel.size,
        currentLevel: maxAssigned
      }
    };
  }

  function renderSummary(plan) {
    const kpis = [
      ["Aktuální level", String(plan.totals.currentLevel)],
      ["Talenty", `${plan.totals.assignedTalents}/${plan.totals.selectedTalents}`],
      ["Dovednosti", `${plan.totals.assignedSkills}/${plan.totals.selectedSkills}`],
      ["Nezařazeno", `${plan.unscheduledTalents.length + plan.unscheduledSkills.length}`]
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
    if (plan.unscheduledTalents.length) lines.push(`- Talenty bez místa: ${plan.unscheduledTalents.map((x) => x.name).join(", ")}`);
    if (plan.unscheduledSkills.length) lines.push(`- Dovednosti bez místa: ${plan.unscheduledSkills.map((x) => x.name).join(", ")}`);
    els.issues.innerHTML = lines.length ? lines.map((x) => escapeHtml(x)).join("<br>") : "";
  }

  function renderTimeline(plan) {
    els.timeline.innerHTML = "";
    for (const lvl of plan.levels) {
      if (!lvl.talents.length && !lvl.skills.length) continue;
      const card = document.createElement("div");
      card.className = "level-card";
      card.innerHTML = `<div class="level-head"><strong>Level ${lvl.level}</strong><span>T ${lvl.talents.length}/${lvl.talentCapacity} | D ${lvl.skills.length}/${lvl.skillCapacity}</span></div>`;
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
      card.appendChild(tags);
      els.timeline.appendChild(card);
    }
  }

  function exportBuild() {
    return {
      version: 2,
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
    if (payload.config) {
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

  function hydrateFromStorage() {
    const raw = localStorage.getItem(window.APP_CONFIG.storageKey);
    if (!raw) return;
    try {
      importBuild(JSON.parse(raw));
    } catch (_e) {
      // ignore corrupted data
    }
  }

  function persist() {
    localStorage.setItem(window.APP_CONFIG.storageKey, JSON.stringify(exportBuild()));
  }

  function cleanseInvalidSelections() {
    const profId = state.selectedProfessionId;
    for (const id of [...state.selectedTalentIds]) {
      const t = state.talents.find((x) => x.id === id);
      if (!t || !belongsToProfession(t.prof_id, profId)) state.selectedTalentIds.delete(id);
    }
    for (const id of [...state.selectedSkillIds]) {
      const s = state.skills.find((x) => x.id === id);
      if (!s || !belongsToProfession(s.prof_id, profId)) state.selectedSkillIds.delete(id);
    }
  }

  function countSelectedVisibleTalents(classTalents, generalTalents) {
    const visibleIds = new Set([...classTalents.map((x) => x.id), ...generalTalents.map((x) => x.id)]);
    let count = 0;
    for (const id of state.selectedTalentIds) if (visibleIds.has(id)) count += 1;
    return count;
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
    if (!res.ok) throw new Error(`Nepodarilo se nacist ${path}: ${res.status}`);
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
