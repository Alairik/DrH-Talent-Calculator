(function () {
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
  const CLASS_ITEM_TEMPLATES = {
    PROF_1: ["Dlouhy mec", "Krouzkova zbroj", "Stit"],
    PROF_2: ["Luk", "Lecive byliny", "Maskovaci plast"],
    PROF_3: ["Alchymisticka sada", "Lih", "Destilacni banka"],
    PROF_4: ["Kouzelnicka hul", "Grimoar", "Krystaly many"],
    PROF_5: ["Dyka", "Paklice", "Maska"],
    PROF_6: ["Posvatny symbol", "Ranni modlitby", "Kadidlo"]
  };
  const CLASS_SPELL_TEMPLATES = {
    PROF_1: [],
    PROF_2: ["Pouto s prirodou", "Lovecuv instinkt"],
    PROF_3: ["Destilace many", "Alchymisticka analyza"],
    PROF_4: ["Magicka strela", "Stit many", "Iluze"],
    PROF_5: [],
    PROF_6: ["Prosba za ochranu", "Ocisteni", "Posveceni"]
  };

  const state = {
    kb: null,
    professions: [],
    races: [],
    talents: [],
    skills: [],
    character: null,
    activeTab: "skills"
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

    populateSelectors();
    wireEvents();
    randomizeCharacter();
  }

  function populateSelectors() {
    els.professionSelect.innerHTML = state.professions
      .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`)
      .join("");
    els.raceSelect.innerHTML = state.races
      .map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`)
      .join("");
    els.levelInput.value = "1";
  }

  function wireEvents() {
    els.levelDownBtn.addEventListener("click", () => {
      els.levelInput.value = String(clampLevel(Number(els.levelInput.value || 1) - 1));
      randomizeCharacter();
    });
    els.levelUpBtn.addEventListener("click", () => {
      els.levelInput.value = String(clampLevel(Number(els.levelInput.value || 1) + 1));
      randomizeCharacter();
    });
    els.levelInput.addEventListener("change", () => {
      els.levelInput.value = String(clampLevel(Number(els.levelInput.value || 1)));
      randomizeCharacter();
    });
    els.professionSelect.addEventListener("change", randomizeCharacter);
    els.raceSelect.addEventListener("change", randomizeCharacter);
    els.randomizeBtn.addEventListener("click", randomizeCharacter);
    els.resetBtn.addEventListener("click", () => {
      els.levelInput.value = "1";
      if (state.professions[0]) els.professionSelect.value = state.professions[0].id;
      if (state.races[0]) els.raceSelect.value = state.races[0].id;
      randomizeCharacter();
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

  function randomizeCharacter() {
    const profession = getProfessionById(els.professionSelect.value) || state.professions[0];
    const race = getRaceById(els.raceSelect.value) || state.races[0];
    if (!profession || !race) return;

    const level = clampLevel(Number(els.levelInput.value || 1));
    els.levelInput.value = String(level);

    const attrs = buildAttributes(profession.id, race, level);
    const hp = 10 + attrs.odo.base * 2 + (level - 1) * (CLASS_HP_PER_LEVEL[profession.id] || 6);
    const mana = attrs.int.base * 3 + (level - 1) * (CLASS_MANA_PER_LEVEL[profession.id] || 2);
    const skillRanks = buildSkillRanks(profession.id, level);
    const talents = buildTalents(profession.id, level);
    const spells = buildSpells(profession.id, level);
    const items = buildItems(profession.id, level);

    state.character = {
      name: randomCharacterName(),
      profession,
      race,
      level,
      attrs,
      hp,
      mana,
      skills: skillRanks,
      talents,
      spells,
      items
    };

    renderCharacter();
  }

  function buildAttributes(professionId, race, level) {
    const raceMap = state.kb.raceBaseAttributes || {};
    const raceBase = raceMap[normalize(race.name)] || raceMap.clovek || {
      sil: 7, obr: 7, odo: 7, int: 7, cha: 7
    };
    const dominantByClass = state.kb.classDominantAttributes || {};
    const dominant = new Set((dominantByClass[professionId] || []).map(normalize));

    const attrs = {};
    for (const key of ATTR_KEYS) {
      const base = Number(raceBase[key] || 7);
      const dominantBoost = dominant.has(key) ? 3 : 0;
      const growth = Math.floor(level / 6) * (dominant.has(key) ? 1 : 0);
      const randomBoost = randInt(0, 6);
      const score = clamp(Number(base + dominantBoost + growth + randomBoost), 1, 21);
      attrs[key] = {
        base: score,
        mod: getAttributeModifier(score)
      };
    }
    return attrs;
  }

  function buildSkillRanks(professionId, level) {
    const basicSkillNames = new Set((state.kb.basicSkillNames || []).map(normalize));
    const maxCount = Math.min(10 + level * 2, 28);
    const candidates = state.skills
      .filter((s) => Number(s.required_level || 1) <= level)
      .filter((s) => !s.prof_id || s.prof_id === professionId || basicSkillNames.has(normalize(s.name)));
    shuffle(candidates);
    return candidates.slice(0, maxCount).map((s) => ({
      id: s.id,
      name: s.name,
      rank: clamp(1 + Math.floor(level / 4) + randInt(0, 2), 1, 10)
    })).sort((a, b) => a.name.localeCompare(b.name, "cs"));
  }

  function buildTalents(professionId, level) {
    const candidates = state.talents
      .filter((t) => t.prof_id === professionId && Number(t.required_level || 1) <= level);
    shuffle(candidates);
    const count = Math.min(2 + level, 22);
    return candidates.slice(0, count).sort((a, b) => Number(a.required_level || 1) - Number(b.required_level || 1));
  }

  function buildSpells(professionId, level) {
    const base = (CLASS_SPELL_TEMPLATES[professionId] || []).slice();
    const extra = level >= 6 ? ["Specializacni formula"] : [];
    return [...base, ...extra];
  }

  function buildItems(professionId, level) {
    const base = (CLASS_ITEM_TEMPLATES[professionId] || []).slice();
    if (level >= 5) base.push("Lecive lektvary x2");
    if (level >= 10) base.push("Vzácna surovina x1");
    return base;
  }

  function renderCharacter() {
    const c = state.character;
    if (!c) return;
    els.charName.textContent = c.name;
    els.charMeta.textContent = `${c.race.name} • ${c.profession.name} • Level ${c.level}`;
    els.hpValue.textContent = String(c.hp);
    els.manaValue.textContent = String(c.mana);

    els.attrsGrid.innerHTML = ATTR_KEYS.map((k) => {
      const a = c.attrs[k];
      const mod = a.mod > 0 ? `+${a.mod}` : String(a.mod);
      return `
        <article class="attr-card">
          <div class="attr-key">${escapeHtml(ATTR_LABELS[k])}</div>
          <div class="attr-base">${a.base}</div>
          <div class="attr-mod">${mod}</div>
        </article>
      `;
    }).join("");

    renderTabs();
  }

  function renderTabs() {
    els.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
    });
    const c = state.character;
    if (!c) return;
    if (state.activeTab === "skills") {
      els.tabContent.innerHTML = renderList(c.skills.map((s) => `${s.name} (${s.rank})`));
      return;
    }
    if (state.activeTab === "talents") {
      els.tabContent.innerHTML = renderList(c.talents.map((t) => `Lv ${Number(t.required_level || 1)}: ${t.name}`));
      return;
    }
    if (state.activeTab === "spells") {
      els.tabContent.innerHTML = c.spells.length ? renderList(c.spells) : "<p>Bez kouzel.</p>";
      return;
    }
    els.tabContent.innerHTML = c.items.length ? renderList(c.items) : "<p>Bez predmetu.</p>";
  }

  function renderList(items) {
    if (!items.length) return "<p>Zatim prazdne.</p>";
    return `<ul class="entry-list">${items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function openSaveModal() {
    if (!state.character) return;
    const payload = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(state.character)))));
    const url = `${location.origin}${location.pathname}?sheet=${payload}`;
    els.saveUrlBox.value = url;
    els.saveModal.hidden = false;
  }

  function getProfessionById(id) {
    return state.professions.find((x) => x.id === id) || null;
  }

  function getRaceById(id) {
    return state.races.find((x) => x.id === id) || null;
  }

  function getAttributeModifier(x) {
    if (x <= 1) return -5;
    if (x <= 3) return -4;
    if (x <= 5) return -3;
    if (x <= 7) return -2;
    if (x <= 9) return -1;
    if (x <= 11) return 0;
    if (x <= 13) return 1;
    if (x <= 15) return 2;
    if (x <= 17) return 3;
    if (x <= 19) return 4;
    if (x <= 21) return 5;
    return 6;
  }

  function randomCharacterName() {
    const first = ["Arin", "Talan", "Mira", "Seli", "Borin", "Kael", "Riona", "Darik"];
    const second = ["Stribrny", "Z Kamenne", "Nocturn", "Jiskra", "Ze Severu", "Poutnik", "Temny", "Ranni"];
    return `${pick(first)} ${pick(second)}`;
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

  function clampLevel(v) {
    const max = Number((state.kb && state.kb.appConfig && state.kb.appConfig.maxLevel) || MAX_LEVEL_DEFAULT);
    return clamp(v, 1, max);
  }

  function clamp(v, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
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
