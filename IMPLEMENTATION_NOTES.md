# DrH Talent Calculator - Stav implementace (detail)

Datum: 2026-03-03

## 1) Co je hotove

Aplikace je staticka (`HTML/CSS/JS`), bez backendu a bez DB.

- horni dropdown: **vyber rasy**
- panel `Class Talenty`: vyber povolani pres 6 boxu
- class talenty: 3 vetve, klikani na "kosticky"
- panel dovednosti: checklist dovednosti
- panel timeline: automaticky vypocet "co na jakem levelu"
- export/import buildu (JSON)
- `localStorage` persist

## 2) Zmena na zaklade posledni instrukce

Byly odstraneny **Obecne talenty** z UI i z manualniho vyberu:

- sekce `Obecne talenty` je odstranena z `index.html`
- styly pro `general-talents`/`general-list` odstraneny
- v JS se uz obecne talenty nerenderuji ani neberou jako manualni volba
- manualne lze volit pouze class talenty (`prof_id == vybrane povolani`)

## 3) Rasa a bonusy

### 3.1 Data ras

Zdroj ras:

- `research/sirael-races.json`
- API: `https://sirael.dracihlidka.cz/api/trpc/rulesRouter.getRaces`

Rasa obsahuje pole `ability` (nazev rasove schopnosti), napr.

- Barbar -> Houzevnatost
- Clovek -> Vsestrannost
- Elf -> Orli zrak
- Gnom -> Zrucnost
- Obr -> Hrosi kuze
- Pulcik -> Tichoslapek
- Trpaslik -> Videni ve tme

### 3.2 Rasovy talent v planneru

- rasovy talent se pridava automaticky jako `RACE BONUS` na **Level 1**
- neodecita se z manualne kliknutych class talentu
- v timeline je zobrazen jako prvni bonus na lvl 1

### 3.3 Rasove body

Konfigurace je v `config.js`:

- `racePointBonusesByTalentId`
- aktualne:
  - `ABI_81` (Vsestrannost / Clovek):
    - `skillLevel1 +2`
    - `skillPerLevel +2`

Tj. bodove kapacity pro dovednosti se navysi pri vypoctu timeline.

### 3.4 Rasove dovednosti

Konfigurace v `config.js`:

- `raceSkillAddsByName`

To je pracovni mapovani (do potvrzeni z pravidel/fotek), ktere rozsiruje seznam dostupnych dovednosti podle rasy.

V UI jsou takove dovednosti oznacene textem `[RASA]`.

## 4) Datove zdroje v projektu

- `research/sirael-player-talents.json`
- `research/sirael-skills-all.json`
- `research/sirael-professions.json`
- `research/sirael-races.json`

## 5) Algoritmus timeline (aktualni)

Vstup:

- vybrane povolani (6 class boxu)
- vybrana rasa (dropdown)
- kliknute class talenty
- kliknute dovednosti
- bodove kapacity na level (`config` + rasove bonusy)

Prubeh:

1. Sestavi se timeline od lvl 1 do `maxLevel`
2. Na lvl 1 se vlozi `RACE BONUS` talent
3. Talenty se radi podle `required_level`, pak podle nazvu
4. Dovednosti se radi stejne, navic musi projit prerequisite `ability_id`
5. Planner se snazi najit nejkratsi logickou cestu (co nejdriv zaradit)
6. Nezarazene polozky jsou vypsane jako issue

## 6) Omezujici body (cekaji na presna pravidla)

Nasledujici casti jsou zatim konfigurovane / odhadnute a je potreba je potvrdit podle fotek pravidel:

1. presna tabulka bodu za level (talenty + dovednosti)
2. presne rasove bonusy na body (vsechny rasy)
3. presne rasove pridane dovednosti (vsechny rasy)
4. pripadne dalsi prerequisite logika mimo `ability_id`
5. finalni rozdeleni class talentu do 3 vetvi (API nema explicitni branch pole)

## 7) Co staci dodat v dalsim kroku

Po poslani fotek pravidel a uplneho seznamu schopnosti/dovednosti doplnim:

- finalni `rules` model (1:1 podle pravidel)
- finalni vetve talentu
- finalni bodove prepocet tabulky
- finalni rasove bonusy bez heuristik
- kontrolni validacni test scenare (sanity checks)

## 8) Dulezite info z RULE_5 (TVORBA POSTAVY)

Zdroj:

- `https://sirael.dracihlidka.cz/rules?filter=PPZ_PH&cid=RULE_5`

Relevantni body k implementaci:

1. Kazda postava ma od zacatku 3 blizke dovednosti podle povolani.
2. Kazda postava ma od zacatku 3 dovednostni body navic.
3. Clovek (rodova schopnost Vsestrannost) ma od zacatku dalsi 2 dovednostni body.
4. Tyto body je mozne nechat do dalsi urovne (carry-over point pool).
5. Na zaver tvorby se zapisuje rodova schopnost + schopnosti dle povolani.

Poznamka k souladu pravidel:

- text v `ABI_81 (Vsestrannost)` rika +2 dovednostni body na zacatku i pri kazdem dalsim levelu
- text v `RULE_5` explicitne potvrzuje +2 na startu a moznost odlozit body
- po dodani fotek pravidel je potreba definitivne potvrdit, jestli +2 plati i per-level ve vsech rezimech

## 9) Dopad na planner (todo po potvrzeni pravidel)

1. Zavest explicitni startovni pool dovednosti:
   - `baseStartingSkillsByClass = 3`
   - `baseStartingSkillPoints = 3`
2. Zavest carry-over mechaniku nevypotrebovanych dovednostnich bodu mezi levely.
3. Rozdelit timeline na:
   - `Tvorba postavy (L1 start)`
   - `Postup na dalsi levely`
4. U lidske rasy aplikovat +2 body v souladu s finalne potvrzenym vykladem pravidel.

## 9.1 Implementovano okamzite (na zaklade RULE_5)

Nize uvedene uz je zapojeno do kalkulatoru:

1. Startovni blizke dovednosti povolani:
   - automaticky se pridaji 3 dovednosti (deterministicky vyber z class skill listu)
   - v timeline jsou oznacene `START SKILL`
   - v UI dovednosti jsou videt jako `[START]` a nejdou odkliknout
2. Dovednostni body jako pool:
   - body se generuji per-level
   - planner je utraci na vybrane dovednosti
   - nevyuzite body se prenasi (`carry`) do dalsiho levelu
   - timeline zobrazuje `gain / spent / carry`
3. Clovek / Vsestrannost:
   - aktualne implementovano jako `+2` dovednostni body na levelu 1
   - (per-level +2 bylo odstraneno, dokud nebude definitivne potvrzeno pravidly)

## 10) Dotcene soubory v teto zmene

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `research/sirael-races.json`

