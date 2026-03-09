# Generator deniku pro PJ - navrh (faze 0)

## Cile

- Navazat na existujici kalkulator (talenty + dovednosti + timeline).
- Umoznit kompletni tvorbu postavy a export "deniku" (print + JSON/URL).
- Pouzit stejnou pravidlovou databazi (SSOT).

## Jde to na soucasnem stacku?

Ano. Pro prvni plnou verzi to jde ciste na:
- HTML
- CSS
- JavaScript
- JSON data soubory

DB neni nutna, pokud:
- staci lokalni ulozeni (`localStorage`)
- sdileni bude pres URL nebo export JSON

DB pridat az pokud budete chtit:
- ukladani vice postav na ucty
- sdilene knihovny postav mezi hraci
- historii revizi/kolaboraci

## Navrh UI (desktop)

1. Sloupec "Denik":
- jmeno, rasa, povolani, level
- atributy + modifikatory
- zivoty + mana
- obrana/utok, pohyblivost, velikost

2. Zalozky (skryte, otevritelne):
- Dovednosti
- Talenty
- Kouzla
- Predmety

3. Timeline:
- co bylo vzato na jakem levelu
- lock specializace + eventy progression

## Randomize (v2)

Input:
- level
- rasa (nebo random)
- povolani (nebo random)

Heuristika:
- atributy: random hod, ale preferovat dominantni atributy povolani
- talenty: preferovat class + locknuta specializace
- dovednosti: preferovat class blizke + povolani relevantni

Output:
- konzistentni build validni podle pravidel
- timeline bez konfliktu prerequisite

## Exporty

1. URL build:
- kratky kod/stav (jako dnes)

2. JSON build:
- plny stav postavy + timeline + metadata

3. "Denik layout":
- tiskovy rezim (`@media print`)
- strankovani A4

## Technicka skladba

1. `rules` vrstva (data + validace)
2. `planner` vrstva (timeline, body, locky)
3. `character-sheet` vrstva (odvozene statistiky)
4. `ui` vrstva (sloupce, zalozky, modaly)

## Minimalni implementacni kroky

1. Stabilizovat `rules-knowledge-base` jako jediny zdroj pravdy.
2. Vytahnout vsechny progression vypocty do samostatnych funkci.
3. Pridat model `characterSheet` (atributy, HP, mana, vypoctene hodnoty).
4. Udelat novy panel "Denik" napojeny na stavajici state.
5. Dodelat export:
- URL
- JSON
- print styl

## Otevrene body (cekaji na finalni pravidla)

- finalni vzorec zivotu/many
- finalni pravidla na rust atributu po urovnich
- finalni mapa kouzel a predmetovych pravidel

