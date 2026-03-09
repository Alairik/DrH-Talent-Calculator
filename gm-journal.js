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
    lastStorageSnapshot: "",
    calcFilters: {
      talents: "",
      skills: ""
    }
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
    state.talents = (talentsPayload.items || []).filter((x) => !x.monster);
    state.skills = skillsPayload.items || [];
    state.maxLevel = clampInt(state.kb && state.kb.appConfig && state.kb.appConfig.maxLevel, 1, 36, MAX_LEVEL_DEFAULT);

    populateSelectors();
    wireEvents();
    hydrateBuild();
    ensureBuildDefaults();
    syncLevelWithSelections(false);
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
      syncLevelWithSelections(false);
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelUpBtn.addEventListener("click", () => {
      state.build.manualLevel = clampLevel(state.build.manualLevel + 1);
      state.build.levelMode = "manual";
      syncLevelWithSelections(false);
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.levelInput.addEventListener("change", () => {
      state.build.manualLevel = clampLevel(Number(els.levelInput.value || 1));
      state.build.levelMode = "manual";
      syncLevelWithSelections(false);
      applyBuildToControls();
      renderAll();
      persistBuild();
    });
    els.professionSelect.addEventListener("change", () => {
      state.build.professionId = els.professionSelect.value;
      cleanseBuildForClass();
      applyClassStarterPackage(true);
      ensureAttributeProfile();
      syncLevelWithSelections(false);
      renderAll();
      persistBuild();
    });
    els.raceSelect.addEventListener("change", () => {
      state.build.raceId = els.raceSelect.value;
      ensureAttributeProfile();
      syncLevelWithSelections(false);
      renderAll();
      persistBuild();
    });
    els.randomizeBtn.addEventListener("click", () => {
      randomizeBuild();
      applyBuildToControls();
      syncLevelWithSelections(false);
      renderAll();
      persistBuild();
    });
    els.resetBtn.addEventListener("click", () => {
      state.build = createEmptyBuild();
      ensureBuildDefaults();
      syncLevelWithSelections(false);
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
        rssEnabled: false
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
    state.build.config.maxLevel = state.maxLevel;
    cleanseBuildForClass();
    applyClassStarterPackage(true);
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
    els.charMeta.textContent = `${race ? race.name : "-"} - ${profession ? profession.name : "-"} - Level ${level}`;
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
    const canSpecialize = level >= 6;
    const selectedSpec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const prereqNames = ((SPEC_PREREQS[profId] || {})[selectedSpec] || []);
    const prereqPills = prereqNames.map((name) => {
      const ok = hasNamedAbility(name);
      return `<span class="pill ${ok ? "ok" : "bad"}">${escapeHtml(name)}</span>`;
    }).join("");
    const requiredLevel = getRequiredLevelForBuild();
    const optionsHtml = [`<option value="">Bez specializace</option>`]
      .concat(specs.map((s) => `<option value="${escapeHtml(s.key)}" ${selectedSpec === s.key ? "selected" : ""}>${escapeHtml(s.name)}</option>`))
      .join("");

    els.progressionContent.innerHTML = `
      <div class="progress-grid">
        <div class="progress-row">
          <label>Pravidla postavy</label>
          <div class="meta-help">PPZ + PPP tvori jednu navaznou progresi. Omezujeme pouze podle urovne a zvolene specializace.</div>
          <div class="meta-help">Minimalni uroven dle aktualniho vyberu: <strong>${requiredLevel}</strong></div>
        </div>
        <div class="progress-row">
          <label>Specializace</label>
          <select id="specSelect" ${canSpecialize ? "" : "disabled"}>${optionsHtml}</select>
          <div class="meta-help">${canSpecialize ? "Specializace je dostupna od 6. urovne." : "Specializaci lze vybrat od 6. urovne."}</div>
        </div>
        ${prereqPills ? `<div class="progress-row"><label>Predpoklady</label><div class="pill-row">${prereqPills}</div></div>` : ""}
      </div>
    `;
    const specSelect = document.getElementById("specSelect");
    if (specSelect) {
      specSelect.addEventListener("change", () => {
        if (!state.build.selectedSpecializationKeyByClass) state.build.selectedSpecializationKeyByClass = {};
        if (!specSelect.value) delete state.build.selectedSpecializationKeyByClass[profId];
        else state.build.selectedSpecializationKeyByClass[profId] = specSelect.value;
        if (!state.build.specializationLockLevelByClass) state.build.specializationLockLevelByClass = {};
        if (specSelect.value) state.build.specializationLockLevelByClass[profId] = level;
        else delete state.build.specializationLockLevelByClass[profId];
        syncLevelWithSelections(false);
        renderProgressionPanel();
        renderTabs();
        persistBuild();
      });
    }
  }

  function renderTabs() {
    if (state.activeTab === "calculator") state.activeTab = "talents";
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
    const items = buildItemPreview();
    els.tabContent.innerHTML = renderList(items.length ? items : ["Bez predmetu."]);
  }

  function renderCalculatorTab() {
    renderTalentsTab();
  }

  function renderTalentsTab() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const requiredLevel = getRequiredLevelForBuild();
    const selectedTalentIds = new Set(state.build.selectedTalentIds || []);
    const selectedSkillTargets = state.build.selectedSkillTargets || {};
    const talentFilter = state.calcFilters.talents;
    const skillFilter = state.calcFilters.skills;
    const talents = state.talents
      .filter((t) => t.prof_id === profId)
      .filter((t) => matchesLocalFilter(t.name, talentFilter))
      .sort((a, b) => {
        const la = Number(a.required_level || 1);
        const lb = Number(b.required_level || 1);
        if (la !== lb) return la - lb;
        return byName(a, b);
      });
    const skills = getAvailableSkills(profId, Math.max(level, 36))
      .filter((s) => matchesLocalFilter(s.name, skillFilter))
      .sort((a, b) => {
        const aClass = isClassSkillForProfession(a, profId) ? 0 : 1;
        const bClass = isClassSkillForProfession(b, profId) ? 0 : 1;
        if (aClass !== bClass) return aClass - bClass;
        return byName(a, b);
      });
    const selectedTalentCount = selectedTalentIds.size;
    const selectedSkillPoints = Object.values(selectedSkillTargets).reduce((sum, x) => sum + Math.max(0, Number(x) || 0), 0);

    els.tabContent.innerHTML = `
      <div class="calc-native-wrap">
        <div class="calc-native-head">
          <div>Aktualni uroven: <strong>${level}</strong></div>
          <div>Potrebna uroven: <strong>${requiredLevel}</strong></div>
          <div>Talenty: <strong>${selectedTalentCount}</strong></div>
          <div>Body dovednosti: <strong>${selectedSkillPoints}</strong></div>
        </div>
        <div class="calc-native-grid">
          <section class="calc-native-col">
            <h4>Talenty</h4>
            <input id="calcTalentSearch" type="search" placeholder="Filtrovat talenty..." value="${escapeHtml(talentFilter)}" />
            <div class="interactive-list calc-native-list">
              ${talents.map((t) => {
                const req = Number(t.required_level || 1);
                const locked = req > level;
                return `
                <label class="interactive-row">
                  <span>Lv ${req} - ${escapeHtml(t.name)}${locked ? " (zamceno)" : ""}</span>
                  <input type="checkbox" data-calc-talent-id="${escapeHtml(t.id)}" ${selectedTalentIds.has(t.id) ? "checked" : ""} ${locked && !selectedTalentIds.has(t.id) ? "disabled" : ""} />
                </label>
              `;
              }).join("")}
            </div>
          </section>
          <section class="calc-native-col">
            <h4>Dovednosti</h4>
            <input id="calcSkillSearch" type="search" placeholder="Filtrovat dovednosti..." value="${escapeHtml(skillFilter)}" />
            <div class="interactive-list calc-native-list">
              ${skills.map((s) => {
                const rank = Number(selectedSkillTargets[s.id] || 0);
                return `
                  <div class="interactive-row">
                    <span>Lv ${Number(s.required_level || 1)} - ${escapeHtml(s.name)}</span>
                    <div class="rank-ctrl">
                      <button type="button" data-calc-skill-minus="${escapeHtml(s.id)}">-</button>
                      <strong>${rank}</strong>
                      <button type="button" data-calc-skill-plus="${escapeHtml(s.id)}">+</button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </section>
        </div>
      </div>
    `;
    const talentSearchEl = document.getElementById("calcTalentSearch");
    if (talentSearchEl) {
      talentSearchEl.addEventListener("input", () => {
        state.calcFilters.talents = String(talentSearchEl.value || "");
        renderTalentsTab();
      });
    }
    const skillSearchEl = document.getElementById("calcSkillSearch");
    if (skillSearchEl) {
      skillSearchEl.addEventListener("input", () => {
        state.calcFilters.skills = String(skillSearchEl.value || "");
        renderTalentsTab();
      });
    }
    for (const cb of els.tabContent.querySelectorAll("input[data-calc-talent-id]")) {
      cb.addEventListener("change", () => {
        const id = cb.dataset.calcTalentId;
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
        syncLevelWithSelections(false);
        applyBuildToControls();
        renderAll();
        persistBuild();
      });
    }
    for (const btn of els.tabContent.querySelectorAll("button[data-calc-skill-minus]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.calcSkillMinus;
        const cur = Number(state.build.selectedSkillTargets[id] || 0);
        const next = Math.max(0, cur - 1);
        if (next <= 0) delete state.build.selectedSkillTargets[id];
        else state.build.selectedSkillTargets[id] = next;
        syncLevelWithSelections(false);
        applyBuildToControls();
        renderAll();
        persistBuild();
      });
    }
    for (const btn of els.tabContent.querySelectorAll("button[data-calc-skill-plus]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.calcSkillPlus;
        const cur = Number(state.build.selectedSkillTargets[id] || 0);
        state.build.selectedSkillTargets[id] = Math.min(36, cur + 1);
        syncLevelWithSelections(false);
        applyBuildToControls();
        renderAll();
        persistBuild();
      });
    }
  }

  function renderSystemsTab() {
    const profId = state.build.professionId;
    const level = state.build.manualLevel;
    const spec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const specName = ((SPECIALIZATION_OPTIONS[profId] || []).find((x) => x.key === spec) || {}).name || "Bez specializace";
    const lockLevel = state.build.specializationLockLevelByClass[profId];
    const canSpec = level >= 6;
    const unlockRule = canSpec ? "Specializace je od 6. urovne. Bez locku lze brat 1 spec schopnost kazdou 6. uroven." : "Specializace se otevre na 6. urovni.";
    const rssEnabled = Boolean(state.build.journalMeta.rssEnabled);

    els.tabContent.innerHTML = `
      <div class="progress-grid">
        <div class="progress-row">
          <strong>Progrese postavy</strong>
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
    const available = getAvailableSkills(profId, level)
      .sort((a, b) => {
        const aClass = isClassSkillForProfession(a, profId) ? 0 : 1;
        const bClass = isClassSkillForProfession(b, profId) ? 0 : 1;
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
        syncLevelWithSelections(false);
        applyBuildToControls();
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
        syncLevelWithSelections(false);
        applyBuildToControls();
        renderTabs();
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
    const selectedTalentIds = new Set(state.build.selectedTalentIds || []);
    const cleanTargets = {};
    for (const [id, target] of Object.entries(state.build.selectedSkillTargets || {})) {
      const s = state.skills.find((x) => x.id === id);
      if (!s) continue;
      if (s.ability_id && !selectedTalentIds.has(s.ability_id)) continue;
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

  function applyClassStarterPackage(keepExisting) {
    const profId = state.build.professionId;
    const classRules = (state.kb && state.kb.classRules && state.kb.classRules[profId]) || null;
    if (!classRules) return;

    if (!Array.isArray(state.build.selectedTalentIds)) state.build.selectedTalentIds = [];
    if (!state.build.selectedTalentOrder || typeof state.build.selectedTalentOrder !== "object") {
      state.build.selectedTalentOrder = {};
    }
    if (!state.build.selectedSkillTargets || typeof state.build.selectedSkillTargets !== "object") {
      state.build.selectedSkillTargets = {};
    }

    const selectedTalentSet = new Set(state.build.selectedTalentIds);
    const starterTalentNames = Array.isArray(classRules.starterTalents) ? classRules.starterTalents : [];
    for (const talentName of starterTalentNames) {
      const talent = findTalentByNameAndProfession(talentName, profId);
      if (!talent) continue;
      if (!selectedTalentSet.has(talent.id)) {
        selectedTalentSet.add(talent.id);
        state.build.talentOrderCounter = Number(state.build.talentOrderCounter || 0) + 1;
        state.build.selectedTalentOrder[talent.id] = state.build.talentOrderCounter;
      }
    }
    state.build.selectedTalentIds = [...selectedTalentSet];

    const starterSkillNames = Array.isArray(classRules.starterSkills) ? classRules.starterSkills : [];
    for (const skillName of starterSkillNames) {
      const skill = findSkillByNameForProfession(skillName, profId);
      if (!skill) continue;
      const current = Number(state.build.selectedSkillTargets[skill.id] || 0);
      if (keepExisting) {
        state.build.selectedSkillTargets[skill.id] = Math.max(1, current);
      } else if (current <= 0) {
        state.build.selectedSkillTargets[skill.id] = 1;
      }
    }
  }

  function findTalentByNameAndProfession(name, profId) {
    const target = normalize(name);
    return state.talents.find((t) => t.prof_id === profId && normalize(t.name) === target) || null;
  }

  function findSkillByNameForProfession(name, profId) {
    const target = normalize(name);
    const available = getAvailableSkills(profId, Math.max(1, state.build.manualLevel || 1));
    return available.find((s) => normalize(s.name) === target) || null;
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

    const candidates = getAvailableSkills(profId, level);
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
    const spec = state.build.selectedSpecializationKeyByClass[profId] || "";
    const spells = [];
    if (profId === "PROF_4") spells.push("Magicka strela", "Stit many", "Iluze");
    if (profId === "PROF_3") spells.push("Destilace many", "Alchymisticka analyza");
    if (profId === "PROF_6") spells.push("Prosba za ochranu", "Ocisteni");
    if (profId === "PROF_2") spells.push("Pouto s prirodou");
    if (level >= 6) {
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

  function getAvailableTalents(profId, level) {
    return state.talents
      .filter((t) => t.prof_id === profId)
      .filter((t) => Number(t.required_level || 1) <= level);
  }

  function getAvailableSkills(profId, level) {
    const skillClassOverrides = state.kb.skillClassOverrides || {};
    const basicSkillNames = new Set((state.kb.basicSkillNames || []).map(normalize));
    const selectedTalentIds = new Set(state.build.selectedTalentIds || []);
    return state.skills
      .filter((s) => Number(s.required_level || 1) <= level)
      .filter((s) => !s.ability_id || selectedTalentIds.has(s.ability_id))
      .filter((s) => {
        const n = normalize(s.name);
        const overrideProf = skillClassOverrides[n];
        if (overrideProf && overrideProf !== profId) return false;
        if (!s.prof_id || s.prof_id === profId) return true;
        return basicSkillNames.has(n);
      });
  }

  function isClassSkillForProfession(skill, profId) {
    const overrides = state.kb.skillClassOverrides || {};
    const overrideProf = overrides[normalize(skill && skill.name)];
    if (overrideProf) return overrideProf === profId;
    return Boolean(skill && skill.prof_id === profId);
  }

  function matchesLocalFilter(name, rawFilter) {
    const q = normalize(rawFilter);
    if (!q) return true;
    return normalize(name).includes(q);
  }

  function getRequiredLevelForBuild() {
    const profId = state.build.professionId;
    const selectedTalentIds = new Set(state.build.selectedTalentIds || []);
    const selectedSkillTargets = state.build.selectedSkillTargets || {};

    let maxReqLevel = 1;
    let selectedTalentCount = 0;
    for (const t of state.talents) {
      if (!selectedTalentIds.has(t.id)) continue;
      if (t.prof_id !== profId) continue;
      selectedTalentCount += 1;
      maxReqLevel = Math.max(maxReqLevel, Number(t.required_level || 1));
    }

    let selectedSkillPoints = 0;
    for (const [skillId, rank] of Object.entries(selectedSkillTargets)) {
      const points = Math.max(0, Number(rank) || 0);
      if (points <= 0) continue;
      const s = state.skills.find((x) => x.id === skillId);
      if (!s) continue;
      selectedSkillPoints += points;
      maxReqLevel = Math.max(maxReqLevel, Number(s.required_level || 1));
    }

    const talentL1 = clampInt(state.build.config?.points?.talentLevel1, 0, 50, 2);
    const talentPer = clampInt(state.build.config?.points?.talentPerLevel, 0, 50, 1);
    const skillL1 = clampInt(state.build.config?.points?.skillLevel1, 0, 50, 3);
    const skillPer = clampInt(state.build.config?.points?.skillPerLevel, 0, 50, 1);

    const levelByTalentPoints = minLevelForPoints(selectedTalentCount, talentL1, talentPer, state.maxLevel);
    const levelBySkillPoints = minLevelForPoints(selectedSkillPoints, skillL1, skillPer, state.maxLevel);

    return clampLevel(Math.max(1, maxReqLevel, levelByTalentPoints, levelBySkillPoints));
  }

  function minLevelForPoints(pointsNeeded, pointsLevel1, pointsPerLevel, maxLevel) {
    if (pointsNeeded <= pointsLevel1) return 1;
    if (pointsPerLevel <= 0) return maxLevel;
    const rest = pointsNeeded - pointsLevel1;
    return clampInt(1 + Math.ceil(rest / pointsPerLevel), 1, maxLevel, maxLevel);
  }

  function syncLevelWithSelections(allowDecrease) {
    const required = getRequiredLevelForBuild();
    const current = clampLevel(state.build.manualLevel);
    if (allowDecrease) {
      state.build.manualLevel = required;
    } else if (current < required) {
      state.build.manualLevel = required;
    }
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
        renderAll();
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
      rssEnabled: Boolean(src.rssEnabled)
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






