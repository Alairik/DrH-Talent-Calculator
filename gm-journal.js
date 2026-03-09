(function () {
  const SHARE_BUILD_PARAM = "build";
  const STORAGE_KEY = "dh_calc_build_v1";
  const MAX_LEVEL_DEFAULT = 36;
  const ATTR_KEYS = ["sil", "obr", "odo", "int", "cha"];
  const ATTR_LABELS = {
    sil: "Sila",
    obr: "Obratnost",
    odo: "Odolnost",
    int: "Inteligence",
    cha: "Charisma"
  };
  const CLASS_HP_PER_LEVEL = {
    PROF_1: 8,
    PROF_2: 7,
    PROF_3: 6,
    PROF_4: 5,
    PROF_5: 6,
    PROF_6: 7
  };
  const CLASS_MANA_PER_LEVEL = {
    PROF_1: 1,
    PROF_2: 2,
    PROF_3: 5,
    PROF_4: 6,
    PROF_5: 2,
    PROF_6: 4
  };

  const state = {
    kb: null,
    professions: [],
    races: [],
    talents: [],
    skills: [],
    build: null,
    activeTab: "skills",
    maxLevel: MAX_LEVEL_DEFAULT,
    lastStorageSnapshot: ""
  };

  const els = {
    professionSelect: document.getElementById("professionSelect"),
    raceSelect: document.getElementById("raceSelect"),
    levelInput: document.getElementById("levelInput"),
    levelDownBtn: document.getElementById("levelDownBtn"),
    levelUpBtn: document.getElementById("levelUpBtn"),
    randomizeBtn: document.getElementById("randomizeBtn"),
    resetBtn: document.getElementById("resetBtn"),
    saveBtn: document.getElementById("saveBtn"),
    charName: document.getElementById("charName"),
    charMeta: document.getElementById("charMeta"),
    hpValue: document.getElementById("hpValue"),
    manaValue: document.getElementById("manaValue"),
    attrsGrid: document.getElementById("attrsGrid"),
    tabButtons: [...document.querySelectorAll(".tab-btn")],
    tabContent: document.getElementById("tabContent"),
    saveModal: document.getElementById("saveModal"),
    saveUrlBox: document.getElementById("saveUrlBox"),
    copyUrlBtn: document.getElementById("copyUrlBtn"),
    closeModalBtn: document.getElementById("closeModalBtn")
  };

  init().catch((err) => {
    console.error(err);
    document.body.innerHTML = `<pre>GM Journal load error:\n${String(err)}</pre>`;
  });

  async function init() {
    const [kb, professionsPayload, racesPayload, talentsPayload, skillsPayload] = await Promise.all([
      fetchJsonOptional("./research/rules-knowledge-base.json"),
      fetchJson("./research/sirael-professions.json"),
      fetchJson("./research/sirael-races.json"),
      fetchJson("./research/sirael-player-talents.json"),
      fetchJson("./research/sirael-skills-all.json")
    ]);

    state.kb = kb || {};
    state.professions = (professionsPayload.items || []).slice().sort(byName);
    state.races = (racesPayload.items || []).slice().sort(byName);
    state.talents = talentsPayload.items || [];
    state.skills = skillsPayload.items || [];
    state.maxLevel = clampInt(state.kb && state.kb.appConfig && state.kb.appConfig.maxLevel, 1, 36, MAX_LEVEL_DEFAULT);

    populateSelectors();
    wireEvents();
    hydrateBuild();
    ensureBuildDefaults();
    applyBuildToControls();
    renderAll();
    startStorageSyncLoop();
  }

  function populateSelectors() {
    els.professionSelect.innerHTML = state.professions
      .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`)
      .join("");
    els.raceSelect.innerHTML = state.races
      .map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`)
      .join("");
  }

  function wireEvents() {
    els.levelDownBtn.addEventListener("click", () => {
      state.build.manualLevel = clampLevel(state.build.manualLevel - 1);
      state.build.levelMode = "manual";
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelUpBtn.addEventListener("click", () => {
      state.build.manualLevel = clampLevel(state.build.manualLevel + 1);
      state.build.levelMode = "manual";
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelInput.addEventListener("change", () => {
      state.build.manualLevel = clampLevel(Number(els.levelInput.value || 1));
      state.build.levelMode = "manual";
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.professionSelect.addEventListener("change", () => {
      state.build.professionId = els.professionSelect.value;
      cleanseBuildForClass();
      ensureAttributeProfile();
      renderAll();
      persistBuild();
    });
    els.raceSelect.addEventListener("change", () => {
      state.build.raceId = els.raceSelect.value;
      ensureAttributeProfile();
      renderAll();
      persistBuild();
    });
    els.randomizeBtn.addEventListener("click", () => {
      randomizeBuild();
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.resetBtn.addEventListener("click", () => {
      state.build = createEmptyBuild();
      ensureBuildDefaults();
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.saveBtn.addEventListener("click", openSaveModal);
    els.closeModalBtn.addEventListener("click", () => {
      els.saveModal.hidden = true;
    });
    els.copyUrlBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(els.saveUrlBox.value);
      } catch (_err) {
        els.saveUrlBox.select();
        document.execCommand("copy");
      }
    });
    els.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTab = btn.dataset.tab || "skills";
        renderTabs();
      });
    });
  }

  function hydrateBuild() {
    const urlBuild = parseBuildFromUrl();
    if (urlBuild) {
      state.build = sanitizeBuildPayload(urlBuild);
      return;
    }
    const storageBuild = parseBuildFromStorage();
    if (storageBuild) {
      state.build = sanitizeBuildPayload(storageBuild);
      return;
    }
    state.build = createEmptyBuild();
  }

  function createEmptyBuild() {
    return {
      version: 4,
      professionId: "",
      raceId: "",
      selectedTalentIds: [],
      selectedTalentOrder: {},
      talentOrderCounter: 0,
      selectedSpecializationByClass: {},
      specializationLockLevelByClass: {},
      selectedSkillTargets: {},
      attributes: defaultAttributes(),
      manualLevel: 1,
      levelMode: "auto",
      config: {
        maxLevel: state.maxLevel,
        points: {
          talentLevel1: 2,
          talentPerLevel: 1,
          skillLevel1: 3,
          skillPerLevel: 1
        }
      }
    };
  }

  function ensureBuildDefaults() {
    if (!state.build) state.build = createEmptyBuild();
    if (!state.build.professionId && state.professions[0]) state.build.professionId = state.professions[0].id;
    if (!state.build.raceId && state.races[0]) state.build.raceId = state.races[0].id;
    state.build.manualLevel = clampLevel(state.build.manualLevel);
    if (!state.build.attributes || typeof state.build.attributes !== "object") state.build.attributes = defaultAttributes();
    for (const key of ATTR_KEYS) {
      const src = state.build.attributes[key] || {};
      const base = clampInt(src.base, 1, 21, 10);
      state.build.attributes[key] = {
        base,
        mod: getAttributeModifier(base),
        bonus: clampInt(src.bonus, 0, 6, 0)
      };
    }
    if (!state.build.config || typeof state.build.config !== "object") {
      state.build.config = createEmptyBuild().config;
    }
    state.build.config.maxLevel = state.maxLevel;
    cleanseBuildForClass();
  }

  function applyBuildToControls() {
    els.professionSelect.value = state.build.professionId;
    els.raceSelect.value = state.build.raceId;
    els.levelInput.value = String(state.build.manualLevel);
  }

  function renderAll() {
    renderDiary();
    renderTabs();
  }

  function renderDiary() {
    const profession = getProfessionById(state.build.professionId);
    const race = getRaceById(state.build.raceId);
    const level = state.build.manualLevel;
    const name = randomCharacterNameFromBuild();
    const hp = calcHp(level, profession && profession.id, state.build.attributes);
    const mana = calcMana(level, profession && profession.id, state.build.attributes);

    els.charName.textContent = name;
    els.charMeta.textContent = `${race ? race.name : "-"} • ${profession ? profession.name : "-"} • Level ${level}`;
    els.hpValue.textContent = String(hp);
    els.manaValue.textContent = String(mana);

    els.attrsGrid.innerHTML = ATTR_KEYS.map((k) => {
      const a = state.build.attributes[k];
      const mod = a.mod > 0 ? `+${a.mod}` : String(a.mod);
      return `
        <article class="attr-card">
          <div class="attr-key">${escapeHtml(ATTR_LABELS[k])}</div>
          <div class="attr-base">${a.base}</div>
          <div class="attr-mod">${mod}</div>
        </article>
      `;
    }).join("");
  }

  function renderTabs() {
    els.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
    });

    if (state.activeTab === "skills") {
      renderSkillsTab();
      return;
    }
    if (state.activeTab === "talents") {
      renderTalentsTab();
      return;
    }
    if (state.activeTab === "spells") {
      const spells = buildSpellPreview();
      els.tabContent.innerHTML = renderList(spells.length ? spells : ["Bez kouzel."]);
      return;
    }
    if (state.activeTab === "calculator") {
      renderCalculatorTab();
      return;
    }
    const items = buildItemPreview();
    els.tabContent.innerHTML = renderList(items.length ? items : ["Bez predmetu."]);
  }

  function renderCalculatorTab() {
    const encoded = encodeBase64UrlUtf8(JSON.stringify(sanitizeBuildPayload(state.build)));
    const src = `./index.html?build=${encoded}`;
    els.tabContent.innerHTML = `
      <div class="calc-wrap">
        <div class="calc-bar">
          <button id="reloadFromCalcBtn" type="button">Nacist zmeny z kalkulatoru</button>
        </div>
        <iframe class="calc-iframe" src="${escapeHtml(src)}" title="DrH Kalkulator"></iframe>
      </div>
    `;
    const btn = document.getElementById("reloadFromCalcBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const payload = parseBuildFromStorage();
        if (!payload) return;
        state.build = sanitizeBuildPayload(payload);
        ensureBuildDefaults();
        applyBuildToControls();
        renderAll();
      });
    }
  }

  function renderSkillsTab() {
    const level = state.build.manualLevel;
    const profId = state.build.professionId;
    const skillClassOverrides = state.kb.skillClassOverrides || {};
    const basicSkillNames = new Set((state.kb.basicSkillNames || []).map(normalize));

    const available = state.skills
      .filter((s) => Number(s.required_level || 1) <= level)
      .filter((s) => {
        const n = normalize(s.name);
        const overrideProf = skillClassOverrides[n];
        if (overrideProf && overrideProf !== profId) return false;
        if (!s.prof_id || s.prof_id === profId) return true;
        return basicSkillNames.has(n);
      })
      .sort(byName);

    els.tabContent.innerHTML = `
      <div class="interactive-list">
        ${available.map((s) => {
          const rank = Number(state.build.selectedSkillTargets[s.id] || 0);
          return `
            <div class="interactive-row">
              <span>${escapeHtml(s.name)}</span>
              <div class="rank-ctrl">
                <button type="button" data-skill-minus="${escapeHtml(s.id)}">-</button>
                <strong>${rank}</strong>
                <button type="button" data-skill-plus="${escapeHtml(s.id)}">+</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    for (const btn of els.tabContent.querySelectorAll("button[data-skill-minus]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.skillMinus;
        const cur = Number(state.build.selectedSkillTargets[id] || 0);
        const next = Math.max(0, cur - 1);
        if (next <= 0) delete state.build.selectedSkillTargets[id];
        else state.build.selectedSkillTargets[id] = next;
        renderTabs();
        persistBuild();
      });
    }
    for (const btn of els.tabContent.querySelectorAll("button[data-skill-plus]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.skillPlus;
        const cur = Number(state.build.selectedSkillTargets[id] || 0);
        const next = Math.min(36, cur + 1);
        state.build.selectedSkillTargets[id] = next;
        renderTabs();
        persistBuild();
      });
    }
  }

  function renderTalentsTab() {
    const level = state.build.manualLevel;
    const profId = state.build.professionId;
    const selected = new Set(state.build.selectedTalentIds || []);

    const available = state.talents
      .filter((t) => t.prof_id === profId)
      .filter((t) => Number(t.required_level || 1) <= level)
      .sort((a, b) => {
        const la = Number(a.required_level || 1);
        const lb = Number(b.required_level || 1);
        if (la !== lb) return la - lb;
        return byName(a, b);
      });

    els.tabContent.innerHTML = `
      <div class="interactive-list">
        ${available.map((t) => `
          <label class="interactive-row">
            <span>Lv ${Number(t.required_level || 1)} • ${escapeHtml(t.name)}</span>
            <input type="checkbox" data-talent-id="${escapeHtml(t.id)}" ${selected.has(t.id) ? "checked" : ""} />
          </label>
        `).join("")}
      </div>
    `;

    for (const cb of els.tabContent.querySelectorAll("input[data-talent-id]")) {
      cb.addEventListener("change", () => {
        const id = cb.dataset.talentId;
        const set = new Set(state.build.selectedTalentIds || []);
        if (cb.checked) {
          set.add(id);
          state.build.talentOrderCounter = Number(state.build.talentOrderCounter || 0) + 1;
          state.build.selectedTalentOrder[id] = state.build.talentOrderCounter;
        } else {
          set.delete(id);
          delete state.build.selectedTalentOrder[id];
        }
        state.build.selectedTalentIds = [...set];
        persistBuild();
      });
    }
  }

  function cleanseBuildForClass() {
    const profId = state.build.professionId;
    const allowedTalentIds = new Set(
      state.talents.filter((t) => t.prof_id === profId).map((t) => t.id)
    );
    state.build.selectedTalentIds = (state.build.selectedTalentIds || []).filter((id) => allowedTalentIds.has(id));
    for (const id of Object.keys(state.build.selectedTalentOrder || {})) {
      if (!allowedTalentIds.has(id)) delete state.build.selectedTalentOrder[id];
    }

    const basicSkillNames = new Set((state.kb.basicSkillNames || []).map(normalize));
    const overrides = state.kb.skillClassOverrides || {};
    const cleanTargets = {};
    for (const [id, target] of Object.entries(state.build.selectedSkillTargets || {})) {
      const s = state.skills.find((x) => x.id === id);
      if (!s) continue;
      const n = normalize(s.name);
      if (overrides[n] && overrides[n] !== profId) continue;
      if (s.prof_id && s.prof_id !== profId && !basicSkillNames.has(n)) continue;
      const t = clampInt(target, 1, 36, 1);
      cleanTargets[id] = t;
    }
    state.build.selectedSkillTargets = cleanTargets;
  }

  function randomizeBuild() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;

    ensureAttributeProfile();

    const classTalents = state.talents
      .filter((t) => t.prof_id === profId && Number(t.required_level || 1) <= level);
    shuffle(classTalents);
    const talentCount = Math.min(2 + level, classTalents.length);
    state.build.selectedTalentIds = classTalents.slice(0, talentCount).map((t) => t.id);
    state.build.selectedTalentOrder = {};
    state.build.talentOrderCounter = 0;
    for (const id of state.build.selectedTalentIds) {
      state.build.talentOrderCounter += 1;
      state.build.selectedTalentOrder[id] = state.build.talentOrderCounter;
    }

    const basicSkillNames = new Set((state.kb.basicSkillNames || []).map(normalize));
    const overrides = state.kb.skillClassOverrides || {};
    const candidates = state.skills
      .filter((s) => Number(s.required_level || 1) <= level)
      .filter((s) => {
        const n = normalize(s.name);
        if (overrides[n] && overrides[n] !== profId) return false;
        if (!s.prof_id || s.prof_id === profId) return true;
        return basicSkillNames.has(n);
      });
    shuffle(candidates);
    const chosen = candidates.slice(0, Math.min(12 + level, candidates.length));
    state.build.selectedSkillTargets = {};
    for (const s of chosen) {
      state.build.selectedSkillTargets[s.id] = clampInt(1 + Math.floor(level / 4) + randInt(0, 2), 1, 36, 1);
    }
    cleanseBuildForClass();
  }

  function ensureAttributeProfile() {
    const raceBase = getRaceBaseAttributes();
    const dominantByClass = state.kb.classDominantAttributes || {};
    const dominant = new Set((dominantByClass[state.build.professionId] || []).map(normalize));
    const level = state.build.manualLevel;
    for (const key of ATTR_KEYS) {
      const base = Number(raceBase[key] || 7);
      const dominantBoost = dominant.has(key) ? 3 : 0;
      const growth = Math.floor(level / 6) * (dominant.has(key) ? 1 : 0);
      const bonus = clampInt(state.build.attributes[key] && state.build.attributes[key].bonus, 0, 6, 0);
      const score = clampInt(base + dominantBoost + growth + bonus, 1, 21, 10);
      state.build.attributes[key] = {
        base: score,
        mod: getAttributeModifier(score),
        bonus
      };
    }
  }

  function getRaceBaseAttributes() {
    const race = getRaceById(state.build.raceId);
    const raceKey = normalize(race && race.name);
    const map = state.kb.raceBaseAttributes || {};
    return map[raceKey] || map.clovek || { sil: 7, obr: 7, odo: 7, int: 7, cha: 7 };
  }

  function calcHp(level, profId, attrs) {
    const odo = Number(attrs && attrs.odo && attrs.odo.base || 10);
    return 10 + odo * 2 + (Math.max(1, level) - 1) * (CLASS_HP_PER_LEVEL[profId] || 6);
  }

  function calcMana(level, profId, attrs) {
    const intv = Number(attrs && attrs.int && attrs.int.base || 10);
    return intv * 3 + (Math.max(1, level) - 1) * (CLASS_MANA_PER_LEVEL[profId] || 2);
  }

  function buildSpellPreview() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const spells = [];
    if (profId === "PROF_4") spells.push("Magicka strela", "Stit many", "Iluze");
    if (profId === "PROF_3") spells.push("Destilace many", "Alchymisticka analyza");
    if (profId === "PROF_6") spells.push("Prosba za ochranu", "Ocisteni");
    if (profId === "PROF_2") spells.push("Pouto s prirodou");
    if (level >= 6 && spells.length) spells.push("Specializacni formula");
    return spells;
  }

  function buildItemPreview() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const out = [];
    if (profId === "PROF_1") out.push("Dlouhy mec", "Krouzkova zbroj", "Stit");
    if (profId === "PROF_2") out.push("Luk", "Lecive byliny", "Maskovaci plast");
    if (profId === "PROF_3") out.push("Alchymisticka sada", "Lih", "Destilacni banka");
    if (profId === "PROF_4") out.push("Kouzelnicka hul", "Grimoar", "Krystaly many");
    if (profId === "PROF_5") out.push("Dyka", "Paklice", "Maska");
    if (profId === "PROF_6") out.push("Posvatny symbol", "Kadidlo");
    if (level >= 5) out.push("Lecive lektvary x2");
    if (level >= 10) out.push("Vzacna surovina x1");
    return out;
  }

  function openSaveModal() {
    const build = sanitizeBuildPayload(state.build);
    const json = JSON.stringify(build);
    const encoded = encodeBase64UrlUtf8(json);
    const url = new URL(window.location.href);
    url.searchParams.set(SHARE_BUILD_PARAM, encoded);
    els.saveUrlBox.value = url.toString();
    els.saveModal.hidden = false;
  }

  function persistBuild() {
    try {
      const json = JSON.stringify(sanitizeBuildPayload(state.build));
      localStorage.setItem(STORAGE_KEY, json);
      state.lastStorageSnapshot = json;
    } catch (_err) {
      // ignore
    }
  }

  function startStorageSyncLoop() {
    try {
      state.lastStorageSnapshot = localStorage.getItem(STORAGE_KEY) || "";
    } catch (_err) {
      state.lastStorageSnapshot = "";
    }
    window.setInterval(() => {
      try {
        const cur = localStorage.getItem(STORAGE_KEY) || "";
        if (!cur || cur === state.lastStorageSnapshot) return;
        state.lastStorageSnapshot = cur;
        const parsed = JSON.parse(cur);
        state.build = sanitizeBuildPayload(parsed);
        ensureBuildDefaults();
        applyBuildToControls();
        if (state.activeTab !== "calculator") renderAll();
      } catch (_err) {
        // ignore
      }
    }, 1300);
  }

  function parseBuildFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function parseBuildFromUrl() {
    try {
      const url = new URL(window.location.href);
      const encoded = url.searchParams.get(SHARE_BUILD_PARAM);
      if (!encoded) return null;
      const json = decodeBase64UrlUtf8(encoded);
      return JSON.parse(json);
    } catch (_err) {
      return null;
    }
  }

  function encodeBase64UrlUtf8(text) {
    const bytes = new TextEncoder().encode(String(text || ""));
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
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

  function sanitizeBuildPayload(payload) {
    const p = payload && typeof payload === "object" ? payload : {};
    const out = createEmptyBuild();
    out.professionId = sanitizeId(p.professionId);
    out.raceId = sanitizeId(p.raceId);
    out.selectedTalentIds = sanitizeIdList(p.selectedTalentIds);
    out.selectedTalentOrder = sanitizeIntMap(p.selectedTalentOrder, 1, 9999);
    out.talentOrderCounter = clampInt(p.talentOrderCounter, 0, 9999, 0);
    out.selectedSpecializationByClass = sanitizeIntMap(p.selectedSpecializationByClass, 0, 2);
    out.specializationLockLevelByClass = sanitizeIntMap(p.specializationLockLevelByClass, 1, 36);
    out.selectedSkillTargets = sanitizeIntMap(p.selectedSkillTargets, 1, 36);
    out.attributes = sanitizeAttributes(p.attributes);
    out.manualLevel = clampLevel(p.manualLevel);
    out.levelMode = p.levelMode === "manual" ? "manual" : "auto";
    if (p.config && typeof p.config === "object") {
      out.config.maxLevel = state.maxLevel;
      out.config.points.talentLevel1 = clampInt(p.config.points && p.config.points.talentLevel1, 0, 50, out.config.points.talentLevel1);
      out.config.points.talentPerLevel = clampInt(p.config.points && p.config.points.talentPerLevel, 0, 50, out.config.points.talentPerLevel);
      out.config.points.skillLevel1 = clampInt(p.config.points && p.config.points.skillLevel1, 0, 50, out.config.points.skillLevel1);
      out.config.points.skillPerLevel = clampInt(p.config.points && p.config.points.skillPerLevel, 0, 50, out.config.points.skillPerLevel);
    }
    return out;
  }

  function sanitizeId(v) {
    const s = String(v || "");
    return /^[A-Za-z0-9_:-]+$/.test(s) ? s : "";
  }

  function sanitizeIdList(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const x of arr) {
      const id = sanitizeId(x);
      if (id) out.push(id);
    }
    return out;
  }

  function sanitizeIntMap(value, min, max) {
    const out = {};
    if (!value || typeof value !== "object") return out;
    for (const [k, v] of Object.entries(value)) {
      const id = sanitizeId(k);
      if (!id) continue;
      const n = clampInt(v, min, max, min);
      out[id] = n;
    }
    return out;
  }

  function sanitizeAttributes(value) {
    const src = value && typeof value === "object" ? value : {};
    const out = {};
    for (const key of ATTR_KEYS) {
      const x = src[key] && typeof src[key] === "object" ? src[key] : {};
      const base = clampInt(x.base, 1, 21, 10);
      out[key] = {
        base,
        mod: getAttributeModifier(base),
        bonus: clampInt(x.bonus, 0, 6, 0)
      };
    }
    return out;
  }

  function defaultAttributes() {
    const out = {};
    for (const key of ATTR_KEYS) out[key] = { base: 10, mod: 0, bonus: 0 };
    return out;
  }

  function getAttributeModifier(x) {
    const n = clampInt(x, 1, 23, 1);
    if (n <= 1) return -5;
    if (n <= 3) return -4;
    if (n <= 5) return -3;
    if (n <= 7) return -2;
    if (n <= 9) return -1;
    if (n <= 11) return 0;
    if (n <= 13) return 1;
    if (n <= 15) return 2;
    if (n <= 17) return 3;
    if (n <= 19) return 4;
    if (n <= 21) return 5;
    return 6;
  }

  function randomCharacterNameFromBuild() {
    const race = getRaceById(state.build.raceId);
    const prof = getProfessionById(state.build.professionId);
    const a = race ? race.name : "Postava";
    const b = prof ? prof.name : "Dobrodruh";
    return `${a} ${b}`;
  }

  function renderList(items) {
    if (!items.length) return "<p>Zatim prazdne.</p>";
    return `<ul class="entry-list">${items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function getProfessionById(id) {
    return state.professions.find((x) => x.id === id) || null;
  }

  function getRaceById(id) {
    return state.races.find((x) => x.id === id) || null;
  }

  function byName(a, b) {
    return String(a.name || "").localeCompare(String(b.name || ""), "cs");
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clampInt(v, min, max, fallback) {
    const n = Number.parseInt(String(v), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function clampLevel(v) {
    return clampInt(v, 1, state.maxLevel, 1);
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
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
})();
