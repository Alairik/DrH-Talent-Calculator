# Rešerše skillů ze Sirael (Dračí Hlídka)

Datum sběru: 2026-03-03 13:22:23 +01:00

## Zdroje
- Stránka: https://sirael.dracihlidka.cz/abilities
- API (abilities): https://sirael.dracihlidka.cz/api/trpc/abilities.getAll
- API (professions): https://sirael.dracihlidka.cz/api/trpc/professions.getAll

## Přehled dat
- Celkem schopností: 52
- Hráčské (monster=false): 18
- Nestvůří / cizí (monster=true): 34
- Profesí: 6

## Pole v datech (frekvence)
- `book`: 52/52
- `description`: 42/52
- `chapter`: 27/52
- `check`: 6/52
- `id`: 52/52
- `lite`: 52/52
- `monster`: 52/52
- `name`: 52/52
- `page`: 27/52
- `prof_id`: 11/52
- `required_level`: 52/52
- `text`: 52/52
- `text_formatted`: 52/52

## Kapitoly (všechna data)
- ``: 25
- `Herní postava`: 7
- `Cizí postavy`: 6
- `Bestiář`: 3
- `Válečník`: 2
- `Klerik`: 2
- `Kouzelník`: 2
- `Hraničář`: 2
- `Zloděj`: 2
- `Alchymista`: 1

## Kapitoly (hráčské talenty)
- `Herní postava`: 7
- `Zloděj`: 2
- `Klerik`: 2
- `Válečník`: 2
- `Hraničář`: 2
- `Kouzelník`: 2
- `Alchymista`: 1

## Úrovně (hráčské)
- L1: 18

## Profese
- `PROF_1`: Válečník
- `PROF_2`: Hraničář
- `PROF_3`: Alchymista
- `PROF_4`: Kouzelník
- `PROF_5`: Zloděj
- `PROF_6`: Klerik

Počet talentů navázaných na prof_id:
- `PROF_1`: 2
- `PROF_2`: 2
- `PROF_3`: 1
- `PROF_4`: 2
- `PROF_5`: 2
- `PROF_6`: 2

## Poznámky pro talent calculator
- Aktuální dataset obsahuje jen startovní hráčské talenty (všechny hráčské mají required_level = 1).
- Pro dlouhodobý calculator je vhodné připravit model i na vyšší úrovně (v datech nestvůr se objevují úrovně 3/4/6).
- text_formatted je HTML, vhodné pro tooltip/modal; description je vhodnější pro tabulky a fulltext.
- prof_id je jen u profesních talentů; obecné hráčské talenty (kapitola Herní postava) ho nemají.
- Doporučený klíč pro UI: id (např. ABI_1, MONABI_42).

## Doporučený datový model (MVP)
- Talent: id, name, category (general|profession|monster), professionId?, requiredLevel, book, chapter?, description, html?
- Profession: id, name

## Exporty
- research/sirael-abilities-all.json
- research/sirael-professions.json
- research/sirael-player-talents.json
