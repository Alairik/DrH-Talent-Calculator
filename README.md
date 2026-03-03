# DrH Talent Calculator

Staticky kalkulator talentu a dovednosti pro Draci Hlidku (HTML/CSS/JS, bez backendu).

## Spusteni lokalne

Pouzij libovolny staticky server (kvuli fetch JSON):

```bash
python -m http.server 8080
```

Pak otevri:

- http://localhost:8080/

## Co umi

- vyber povolani
- vyber talentu a dovednosti
- automaticke prepocteni nejkratsi logicke cesty po urovnich
- timeline po urovnich (co se bere na ktere urovni)
- kontrola navaznosti dovednost -> talent (ability_id)
- export/import buildu
- localStorage persistence

## Data

- `research/sirael-player-talents.json`
- `research/sirael-skills-all.json`
- `research/sirael-professions.json`

## Poznamka

Presne bodove schema za level je v `config.js` + editovatelne v UI.
