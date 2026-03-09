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
    PROF_5: 0,
    PROF_6: 4
  };
  const CLASS_RESOURCE_LABEL = {
    PROF_1: "Adrenalin",
    PROF_2: "Dusevni sila",
    PROF_3: "Mana",
    PROF_4: "Mana",
    PROF_5: "Zdroj",
    PROF_6: "Prizen"
  };
  const SPECIALIZATION_OPTIONS = {
    PROF_1: [{ key: "berserkr", name: "Berserkr" }, { key: "rytir", name: "Rytir" }, { key: "sermir", name: "Sermir" }],
    PROF_2: [{ key: "chodec", name: "Chodec" }, { key: "druid", name: "Druid" }, { key: "pan_zvirat", name: "Pan zvirat" }],
    PROF_3: [{ key: "medicus", name: "Medicus" }, { key: "pyromant", name: "Pyromant" }, { key: "theurg", name: "Theurg" }],
    PROF_4: [{ key: "bojovy_mag", name: "Bojovy mag" }, { key: "carodej", name: "Carodej" }, { key: "nekromant", name: "Nekromant" }],
    PROF_5: [{ key: "assassin", name: "Assassin" }, { key: "lupic", name: "Lupic" }, { key: "sicco", name: "Sicco" }],
    PROF_6: [{ key: "bojovy_mnich", name: "Bojovy mnich" }, { key: "exorcista", name: "Exorcista" }, { key: "knez", name: "Knez" }]
  };
  const SPEC_PREREQS = {
    PROF_1: {
      berserkr: ["Skola boje s obourucni zbrani", "Skola boje drticu kosti", "Urputnost"],
      rytir: ["Skola boje se stitem", "Skola boje s jednorucni zbrani", "Veleni"],
      sermir: ["Skola boje s bodnou zbrani", "Skola boje se dvema zbranemi", "Rozvaznost"]
    },
    PROF_2: {
      chodec: ["Obratne ostri", "Pruzkumnictvi", "Magie pocestnych"],
      druid: ["Bojova hul", "Lecitelstvi", "Magie prirody"],
      pan_zvirat: ["Boj se zviraty", "Magie zvirat", "Ochocovani zvirat"]
    },
    PROF_3: {
      medicus: ["Alchymisticke ingredience", "Lektvary a elixiry", "Substituce"],
      pyromant: ["Magicke predmety", "Nestabilni substance", "Vyroba svitku"],
      theurg: ["Hvezdne sestavy", "Krystaly a energie", "Precizni vyroba"]
    },
    PROF_4: {
      bojovy_mag: ["Divoka magie", "Ochranna magie", "Rychle kouzleni"],
      carodej: ["Vysoka magie", "Mentalni magie", "Kouzleni z knih"],
      nekromant: ["Vitalni magie", "Magie promen", "Ritual krve"]
    },
    PROF_5: {
      assassin: ["Umeni rvacu", "Umeni skryvani", "Vrhani dyk"],
      lupic: ["Umeni zelezneho klice", "Umeni kociciho pohybu", "Improvizace"],
      sicco: ["Umeni promen", "Umeni sarmu", "Zlodejska hantyrka"]
    },
    PROF_6: {
      bojovy_mnich: ["Bozi bojovnik", "Nauka bojovniku viry", "Nauka svate pravdy"],
      exorcista: ["Nauka bozich patronu", "Nauka demonologie", "Osviceni"],
      knez: ["Nauka milosrdenstvi", "Nauka zehnani aurami", "Pozehnane zdravi"]
    }
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
    resourceLabel: document.getElementById("resourceLabel"),
    manaValue: document.getElementById("manaValue"),
    attrsGrid: document.getElementById("attrsGrid"),
    tabButtons: [...document.querySelectorAll(".tab-btn")],
    tabContent: document.getElementById("tabContent"),
    progressionContent: document.getElementById("progressionContent"),
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
      enforceRulesModeByLevel();
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelUpBtn.addEventListener("click", () => {
      state.build.manualLevel = clampLevel(state.build.manualLevel + 1);
      state.build.levelMode = "manual";
      enforceRulesModeByLevel();
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelInput.addEventListener("change", () => {
      state.build.manualLevel = clampLevel(Number(els.levelInput.value || 1));
      state.build.levelMode = "manual";
      enforceRulesModeByLevel();
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
      selectedSpecializationKeyByClass: {},
      specializationLockLevelByClass: {},
      selectedSkillTargets: {},
      journalMeta: {
        rulesMode: "ppz",
        rssEnabled: false,
        warriorPath: "",
        warriorPathRank: 0,
        rangerGroveState: "spici",
        rangerGroveMana: 0,
        alchemistWorkshopTier: 0,
        wizardFocusItem: "hul",
        thiefNetworkSize: 0,
        clericSiteMode: "normal"
      },
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
    if (!state.build.selectedSpecializationKeyByClass || typeof state.build.selectedSpecializationKeyByClass !== "object") {
      state.build.selectedSpecializationKeyByClass = {};
    }
    state.build.journalMeta = sanitizeJournalMeta(state.build.journalMeta);
    if (state.build.manualLevel >= 6 && state.build.journalMeta.rulesMode === "ppz") {
      state.build.journalMeta.rulesMode = "ppp";
    }
    if (state.build.manualLevel < 6 && state.build.journalMeta.rulesMode === "ppp") {
      state.build.journalMeta.rulesMode = "ppz";
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
    renderProgressionPanel();
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
    els.resourceLabel.textContent = CLASS_RESOURCE_LABEL[profession && profession.id] || "Mana";
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

  function renderProgressionPanel() {
    const level = state.build.manualLevel;
    const profId = state.build.professionId;
    const specs = SPECIALIZATION_OPTIONS[profId] || [];
    const canUsePpp = level >= 6;
    const mode = canUsePpp ? state.build.journalMeta.rulesMode : "ppz";
    if (!canUsePpp) state.build.journalMeta.rulesMode = "ppz";
    const selectedSpec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const prereqNames = ((SPEC_PREREQS[profId] || {})[selectedSpec] || []);
    const prereqPills = prereqNames.map((name) => {
      const ok = hasNamedAbility(name);
      return `<span class="pill ${ok ? "ok" : "bad"}">${escapeHtml(name)}</span>`;
    }).join("");

    const subsystemHtml = renderClassSubsystem(profId);
    const optionsHtml = [`<option value="">Bez specializace</option>`]
      .concat(specs.map((s) => `<option value="${escapeHtml(s.key)}" ${selectedSpec === s.key ? "selected" : ""}>${escapeHtml(s.name)}</option>`))
      .join("");

    els.progressionContent.innerHTML = `
      <div class="progress-grid">
        <div class="progress-row">
          <label>Pravidlovy rezim</label>
          <div class="mode-row">
            <button class="mode-btn ${mode === "ppz" ? "active" : ""}" data-mode="ppz" type="button">PPZ</button>
            <button class="mode-btn ${mode === "ppp" ? "active" : ""}" data-mode="ppp" type="button" ${canUsePpp ? "" : "disabled"}>PPP</button>
          </div>
          <div class="meta-help">${canUsePpp ? "PPP je dostupne od 6. urovne." : "Do 5. urovne jedete ciste PPZ."}</div>
        </div>
        <div class="progress-row">
          <label>Specializace</label>
          <select id="specSelect">${optionsHtml}</select>
        </div>
        ${prereqPills ? `<div class="progress-row"><label>Predpoklady</label><div class="pill-row">${prereqPills}</div></div>` : ""}
        ${subsystemHtml}
      </div>
    `;

    for (const btn of els.progressionContent.querySelectorAll("button[data-mode]")) {
      btn.addEventListener("click", () => {
        const next = btn.dataset.mode === "ppp" && canUsePpp ? "ppp" : "ppz";
        state.build.journalMeta.rulesMode = next;
        renderAll();
        persistBuild();
      });
    }
    const specSelect = document.getElementById("specSelect");
    if (specSelect) {
      specSelect.addEventListener("change", () => {
        if (!state.build.selectedSpecializationKeyByClass) state.build.selectedSpecializationKeyByClass = {};
        if (!specSelect.value) delete state.build.selectedSpecializationKeyByClass[profId];
        else state.build.selectedSpecializationKeyByClass[profId] = specSelect.value;
        if (!state.build.specializationLockLevelByClass) state.build.specializationLockLevelByClass = {};
        if (specSelect.value) state.build.specializationLockLevelByClass[profId] = level;
        else delete state.build.specializationLockLevelByClass[profId];
        renderProgressionPanel();
        persistBuild();
      });
    }
    wireSubsystemInputs();
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
    if (state.activeTab === "systems") {
      renderSystemsTab();
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

  function renderSystemsTab() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const mode = state.build.journalMeta.rulesMode;
    const spec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const specName = ((SPECIALIZATION_OPTIONS[profId] || []).find((x) => x.key === spec) || {}).name || "Bez specializace";
    const lockLevel = state.build.specializationLockLevelByClass[profId];
    const canSpec = level >= 6;
    const unlockRule = canSpec ? "Specializace je od 6. urovne. Bez locku lze brat 1 spec schopnost kazdou 6. uroven." : "Do 5. urovne jedete pouze PPZ.";
    const rssEnabled = Boolean(state.build.journalMeta.rssEnabled);

    els.tabContent.innerHTML = `
      <div class="progress-grid">
        <div class="progress-row">
          <strong>Režim pravidel: ${mode.toUpperCase()}</strong>
          <div class="meta-help">${unlockRule}</div>
        </div>
        <div class="progress-row">
          <strong>Aktivni specializace: ${escapeHtml(specName)}</strong>
          <div class="meta-help">${lockLevel ? `Locknuto na urovni ${lockLevel}.` : "Specializace zatim neni locknuta."}</div>
        </div>
        <div class="progress-row">
          <label>
            <input id="rssEnabledInput" type="checkbox" ${rssEnabled ? "checked" : ""} />
            Pouzivat RSS poznamky pro encounter
          </label>
          <div class="meta-help">RSS pridava teren, viditelnost, AB ekonomiku a reakce. ZSS zustava validni fallback.</div>
        </div>
      </div>
    `;
    const rssEl = document.getElementById("rssEnabledInput");
    if (rssEl) {
      rssEl.addEventListener("change", () => {
        state.build.journalMeta.rssEnabled = Boolean(rssEl.checked);
        persistBuild();
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
      .sort((a, b) => {
        const aClass = a.prof_id === profId ? 0 : 1;
        const bClass = b.prof_id === profId ? 0 : 1;
        if (aClass !== bClass) return aClass - bClass;
        return byName(a, b);
      });

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
    const selectedSpec = state.build.selectedSpecializationKeyByClass && state.build.selectedSpecializationKeyByClass[profId];
    const allowed = new Set((SPECIALIZATION_OPTIONS[profId] || []).map((x) => x.key));
    if (selectedSpec && !allowed.has(selectedSpec)) {
      delete state.build.selectedSpecializationKeyByClass[profId];
      if (state.build.specializationLockLevelByClass) delete state.build.specializationLockLevelByClass[profId];
    }
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
    if (profId === "PROF_5") return 0;
    const intv = Number(attrs && attrs.int && attrs.int.base || 10);
    return intv * 3 + (Math.max(1, level) - 1) * (CLASS_MANA_PER_LEVEL[profId] || 2);
  }

  function buildSpellPreview() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const mode = state.build.journalMeta.rulesMode;
    const spec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const spells = [];
    if (profId === "PROF_4") spells.push("Magicka strela", "Stit many", "Iluze");
    if (profId === "PROF_3") spells.push("Destilace many", "Alchymisticka analyza");
    if (profId === "PROF_6") spells.push("Prosba za ochranu", "Ocisteni");
    if (profId === "PROF_2") spells.push("Pouto s prirodou");
    if (mode === "ppp" && level >= 6) {
      if (profId === "PROF_2") spells.push("Ochrana pred smeckou", "Sledovani");
      if (profId === "PROF_4") spells.push("Retezovy blesk", "Teleport");
      if (profId === "PROF_6") spells.push("Hlas viry", "Pozehnani zdaru");
      if (spec) spells.push(`Spec: ${spec}`);
    }
    return spells;
  }

  function buildItemPreview() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const mode = state.build.journalMeta.rulesMode;
    const meta = state.build.journalMeta;
    const out = [];
    if (profId === "PROF_1") out.push("Dlouhy mec", "Krouzkova zbroj", "Stit");
    if (profId === "PROF_2") out.push("Luk", "Lecive byliny", "Maskovaci plast");
    if (profId === "PROF_3") out.push("Alchymisticka sada", "Lih", "Destilacni banka");
    if (profId === "PROF_4") out.push("Kouzelnicka hul", "Grimoar", "Krystaly many");
    if (profId === "PROF_5") out.push("Dyka", "Paklice", "Maska");
    if (profId === "PROF_6") out.push("Posvatny symbol", "Kadidlo");
    if (mode === "ppp") {
      if (profId === "PROF_1" && meta.warriorPath) out.push(`Cesta: ${meta.warriorPath} (stupen ${meta.warriorPathRank || 0})`);
      if (profId === "PROF_2") out.push(`Hvozd: ${meta.rangerGroveState || "spici"} / mana ${meta.rangerGroveMana || 0}`);
      if (profId === "PROF_3" && Number(meta.alchemistWorkshopTier || 0) > 0) out.push(`Dilna tier ${meta.alchemistWorkshopTier}`);
      if (profId === "PROF_4") out.push(`Fokus: ${meta.wizardFocusItem || "hul"}`);
      if (profId === "PROF_5" && Number(meta.thiefNetworkSize || 0) > 0) out.push(`Siccova sit: ${meta.thiefNetworkSize}`);
      if (profId === "PROF_6") out.push(`Misto proseb: ${meta.clericSiteMode || "normal"}`);
    }
    if (level >= 5) out.push("Lecive lektvary x2");
    if (level >= 10) out.push("Vzacna surovina x1");
    return out;
  }

  function hasNamedAbility(name) {
    const target = normalize(name);
    const selectedTalentIds = new Set(state.build.selectedTalentIds || []);
    for (const t of state.talents) {
      if (!selectedTalentIds.has(t.id)) continue;
      if (normalize(t.name) === target) return true;
    }
    for (const [skillId, rank] of Object.entries(state.build.selectedSkillTargets || {})) {
      if (!rank || rank <= 0) continue;
      const s = state.skills.find((x) => x.id === skillId);
      if (!s) continue;
      if (normalize(s.name) === target) return true;
    }
    return false;
  }

  function renderClassSubsystem(profId) {
    const jm = state.build.journalMeta || {};
    if (profId === "PROF_1") {
      return `
        <div class="progress-row">
          <label>Cesta valecnika</label>
          <select id="warriorPathSelect">
            <option value="">Nezvoleno</option>
            <option value="mec" ${jm.warriorPath === "mec" ? "selected" : ""}>Cesta mece</option>
            <option value="sekera" ${jm.warriorPath === "sekera" ? "selected" : ""}>Cesta sekery</option>
            <option value="kopi_hul" ${jm.warriorPath === "kopi_hul" ? "selected" : ""}>Cesta hole a kopi</option>
            <option value="kladivo" ${jm.warriorPath === "kladivo" ? "selected" : ""}>Cesta kladiva</option>
            <option value="strategie" ${jm.warriorPath === "strategie" ? "selected" : ""}>Cesta strategie</option>
          </select>
          <label>Stupen cesty</label>
          <input id="warriorPathRankInput" type="number" min="0" max="4" value="${clampInt(jm.warriorPathRank, 0, 4, 0)}" />
        </div>
      `;
    }
    if (profId === "PROF_2") {
      return `
        <div class="progress-row">
          <label>Stav hvozdu</label>
          <select id="groveStateSelect">
            <option value="spici" ${jm.rangerGroveState === "spici" ? "selected" : ""}>Spici</option>
            <option value="drimajici" ${jm.rangerGroveState === "drimajici" ? "selected" : ""}>Drimajici</option>
            <option value="procitajici" ${jm.rangerGroveState === "procitajici" ? "selected" : ""}>Procitajici</option>
            <option value="probuzeny" ${jm.rangerGroveState === "probuzeny" ? "selected" : ""}>Probuzeny</option>
            <option value="besnici" ${jm.rangerGroveState === "besnici" ? "selected" : ""}>Besnici</option>
          </select>
          <label>Nastredana many hvozdu</label>
          <input id="groveManaInput" type="number" min="0" max="99999" value="${clampInt(jm.rangerGroveMana, 0, 99999, 0)}" />
        </div>
      `;
    }
    if (profId === "PROF_3") {
      return `
        <div class="progress-row">
          <label>Uroven alchymisticke dilny</label>
          <select id="workshopTierSelect">
            <option value="0" ${clampInt(jm.alchemistWorkshopTier, 0, 4, 0) === 0 ? "selected" : ""}>Bez dilny</option>
            <option value="1" ${clampInt(jm.alchemistWorkshopTier, 0, 4, 0) === 1 ? "selected" : ""}>1 - Mala</option>
            <option value="2" ${clampInt(jm.alchemistWorkshopTier, 0, 4, 0) === 2 ? "selected" : ""}>2 - Stredni</option>
            <option value="3" ${clampInt(jm.alchemistWorkshopTier, 0, 4, 0) === 3 ? "selected" : ""}>3 - Velka</option>
            <option value="4" ${clampInt(jm.alchemistWorkshopTier, 0, 4, 0) === 4 ? "selected" : ""}>4 - Vez</option>
          </select>
        </div>
      `;
    }
    if (profId === "PROF_4") {
      return `
        <div class="progress-row">
          <label>Fokus predmet</label>
          <select id="wizardFocusSelect">
            <option value="hul" ${jm.wizardFocusItem === "hul" ? "selected" : ""}>Kouzelnicka hul</option>
            <option value="zbran" ${jm.wizardFocusItem === "zbran" ? "selected" : ""}>Zbran bojoveho maga</option>
            <option value="carodejova_hul" ${jm.wizardFocusItem === "carodejova_hul" ? "selected" : ""}>Carodejova hul</option>
            <option value="dyka" ${jm.wizardFocusItem === "dyka" ? "selected" : ""}>Nekromantova dyka</option>
          </select>
        </div>
      `;
    }
    if (profId === "PROF_5") {
      return `
        <div class="progress-row">
          <label>Siccova sit (clenu)</label>
          <input id="thiefNetworkInput" type="number" min="0" max="50" value="${clampInt(jm.thiefNetworkSize, 0, 50, 0)}" />
        </div>
      `;
    }
    if (profId === "PROF_6") {
      return `
        <div class="progress-row">
          <label>Režim mista proseb</label>
          <select id="clericSiteModeSelect">
            <option value="normal" ${jm.clericSiteMode === "normal" ? "selected" : ""}>Normalni</option>
            <option value="posvatne" ${jm.clericSiteMode === "posvatne" ? "selected" : ""}>Posvatne</option>
            <option value="proklete" ${jm.clericSiteMode === "proklete" ? "selected" : ""}>Proklete</option>
          </select>
        </div>
      `;
    }
    return "";
  }

  function wireSubsystemInputs() {
    const jm = state.build.journalMeta;
    const bindSelect = (id, key, castFn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", () => {
        jm[key] = castFn ? castFn(el.value) : el.value;
        persistBuild();
      });
    };
    const bindInput = (id, key, min, max) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", () => {
        jm[key] = clampInt(el.value, min, max, min);
        el.value = String(jm[key]);
        persistBuild();
      });
    };
    bindSelect("warriorPathSelect", "warriorPath");
    bindInput("warriorPathRankInput", "warriorPathRank", 0, 4);
    bindSelect("groveStateSelect", "rangerGroveState");
    bindInput("groveManaInput", "rangerGroveMana", 0, 99999);
    bindSelect("workshopTierSelect", "alchemistWorkshopTier", (v) => clampInt(v, 0, 4, 0));
    bindSelect("wizardFocusSelect", "wizardFocusItem");
    bindInput("thiefNetworkInput", "thiefNetworkSize", 0, 50);
    bindSelect("clericSiteModeSelect", "clericSiteMode");
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
    out.selectedSpecializationKeyByClass = sanitizeIdMap(p.selectedSpecializationKeyByClass);
    out.specializationLockLevelByClass = sanitizeIntMap(p.specializationLockLevelByClass, 1, 36);
    out.selectedSkillTargets = sanitizeIntMap(p.selectedSkillTargets, 1, 36);
    out.journalMeta = sanitizeJournalMeta(p.journalMeta);
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

  function sanitizeIdMap(value) {
    const out = {};
    if (!value || typeof value !== "object") return out;
    for (const [k, v] of Object.entries(value)) {
      const id = sanitizeId(k);
      const val = sanitizeId(v);
      if (!id || !val) continue;
      out[id] = val;
    }
    return out;
  }

  function sanitizeJournalMeta(value) {
    const src = value && typeof value === "object" ? value : {};
    return {
      rulesMode: src.rulesMode === "ppp" ? "ppp" : "ppz",
      rssEnabled: Boolean(src.rssEnabled),
      warriorPath: sanitizeId(src.warriorPath),
      warriorPathRank: clampInt(src.warriorPathRank, 0, 4, 0),
      rangerGroveState: ["spici", "drimajici", "procitajici", "probuzeny", "besnici"].includes(src.rangerGroveState) ? src.rangerGroveState : "spici",
      rangerGroveMana: clampInt(src.rangerGroveMana, 0, 99999, 0),
      alchemistWorkshopTier: clampInt(src.alchemistWorkshopTier, 0, 4, 0),
      wizardFocusItem: ["hul", "zbran", "dyka", "carodejova_hul"].includes(src.wizardFocusItem) ? src.wizardFocusItem : "hul",
      thiefNetworkSize: clampInt(src.thiefNetworkSize, 0, 50, 0),
      clericSiteMode: ["normal", "posvatne", "proklete"].includes(src.clericSiteMode) ? src.clericSiteMode : "normal"
    };
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

  function enforceRulesModeByLevel() {
    const level = state.build.manualLevel;
    if (!state.build.journalMeta) state.build.journalMeta = sanitizeJournalMeta(null);
    if (level < 6) {
      state.build.journalMeta.rulesMode = "ppz";
    } else if (state.build.journalMeta.rulesMode !== "ppp") {
      state.build.journalMeta.rulesMode = "ppp";
    }
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
