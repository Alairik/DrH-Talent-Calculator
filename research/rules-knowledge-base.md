# DrH Rules Knowledge Base (SSOT)

Ucel: jeden centralni zdroj pravidel pro vsechny nastroje v tomto repu:
- talent kalkulator
- randomizer postavy
- budouci generator deniku pro PJ

Primarni textovy referencni prehled:
- `research/PPZ_RULES_STRUCTURED.md` (kapitoly 1-18, tagy, vazby, implementacni mapovani)

Status:
- cast pravidel je potvrzena
- cast je zatim "TODO/overit podle finalnich podkladu"

## 1) Potvrzene zdroje dat v repu

- `research/sirael-player-talents.json`
- `research/sirael-skills-all.json`
- `research/sirael-professions.json`
- `research/sirael-races.json`
- `config.js`

## 2) Potvrzene herni konstanty (aktualni implementace)

### 2.1 Dovednostni body na levelup

- Valecnik: `3 x level`
- Hranicar: `5 x level`
- Alchymista: `4 x level`
- Kouzelnik: `3 x level`
- Zlodej: `8 x level`
- Klerik: `3 x level`

Poznamka: body se v planneru pouzivaji jako pool a nevyuzite body se prenaseji.

### 2.2 Start dovednosti

- Na zacatku se automaticky pridaji 3 "blizke" dovednosti povolani na stupen 3.
- Plus startovni body pro dalsi volby.

### 2.3 Rasa Clovek

- Pouziva se bonus `+2` dovednostni body na startu (L1).
- V UI se bonus zobrazuje jako `+ Vsestrannost`.

### 2.4 Uceni/zlepsovani dovednosti

- Nova dovednost: cena `1`, start na stupni 1.
- Zlepseni na cilovy stupen `N`: cena `N`.
- V ramci jednoho levelu lze danou dovednost zlepsit max o 1 stupen.

### 2.5 Specializace (rozsirene povolani)

- Lze zvolit lock specializace.
- Po locku nelze brat nove skilly z jinych specializaci.
- Jiz drive vzate skilly z jine specializace zustavaji.
- Timeline oznacuje level, kde doslo k locku.

### 2.6 Pravidlo "kazdych 6 urovni"

- Pokud neni specializace locknuta:
  - na kazde 6. urovni lze vzit jednu schopnost z nektere specializace.
  - interval je dynamicky po +6 od posledniho takoveho vyberu.
  - priklad: pokud vezmu na L9, dalsi moznost je az na L15.

## 3) Datovy model pro dalsi nastroje (doporučeny)

Vsechny UI vrstvy maji cist stejne runtime objekty:

```json
{
  "version": "drh-rules-v1",
  "classes": [],
  "races": [],
  "talents": [],
  "skills": [],
  "progression": {
    "skill_points_formula_by_class": {},
    "starting_rules": {},
    "specialization_rules": {}
  },
  "derived": {
    "skill_prereq_edges": [],
    "talent_prereq_edges": []
  }
}
```

Doporuceni:
- udrzovat v repu jako `research/rules-knowledge-base.json`
- generovat z existujicich JSON + `config.js` (skriptem)
- appka nema mit tvrde dulezite konstanty rozsekane na vice mistech

## 4) TODO pred "generator deniku PJ v2"

- doplnit finalni tabulky:
  - zivoty/mana progression per class
  - presne mapovani rozsirenych povolani + podminky vstupu
  - kouzla, predmety, suroviny
- sjednotit nazvy/id mezi OCR/PDF zdroji
- dopsat validacni sadu "pravidlovych testu"

## 5) Akceptacni pravidla pro nove features

Kazda nova funkce musi:
- cist pravidla z centralniho rules modelu
- neobchazet pravidla lokalnimi hardcoded podminkami v UI
- mit timeline/denik export, ktery lze zpetne validovat
