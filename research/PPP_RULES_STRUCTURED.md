# PPP pravidla - strukturovany referencni markdown

Status: strukturovany prehled z uzivatelem dodaneho textu PPP
Aktualizace: 2026-03-09
Scope: Pravidla pro pokrocile (specializace, pokrocile schopnosti, RSS)

## Jak cist tento dokument

- Dokument je udelany stejne jako PPZ reference: `Tagy`, `Vazby`, `Pouziti v appce`.
- Neni to doslovny prepis, ale pravidlova mapa pro implementaci a rychle rozhodovani.
- Vsechny casti explicitne navazuji na PPZ.

---

## Tag index

- `#ppp` pravidla pro pokrocile
- `#core` obecne principy
- `#class` povolani
- `#spec` specializace
- `#skills` dovednosti a triky
- `#resource` mana / prizen / dusevni sila / adrenalin
- `#combat` boj
- `#rss` rozsireny soubojovy system
- `#gear` vybaveni a specialni predmety
- `#faith` bozi mechaniky a posvatna mista
- `#calculator` dopad na planner
- `#journal` dopad na denik PJ
- `#ppz-link` prime propojeni na PPZ pravidla

---

## Rychly obsah

1. [Uvod a navaznost](#1-uvod-a-navaznost)
2. [Valecnik (PPP)](#2-valecnik-ppp)
3. [Hranicar (PPP)](#3-hranicar-ppp)
4. [Alchymista (PPP)](#4-alchymista-ppp)
5. [Kouzelnik (PPP)](#5-kouzelnik-ppp)
6. [Zlodej (PPP)](#6-zlodej-ppp)
7. [Klerik (PPP)](#7-klerik-ppp)
8. [Rozsireny soubojovy system (RSS)](#8-rozsireny-soubojovy-system-rss)
9. [Slovo zaverem](#9-slovo-zaverem)
10. [Propojeni PPP <-> PPZ](#propojeni-ppp---ppz)
11. [Implementacni checklist](#implementacni-checklist)

---

## 1. Uvod a navaznost
Tagy: `#ppp #core #ppz-link`

### Co PPP prinasi
- Rozsireni PPZ, ne nahrazeni.
- Silnejsi zamereni na pokrocile schopnosti povolani.
- Kazde povolani se vetvi do 3 specializaci.
- Velky narust kouzel, proseb, predmetu a bojovych triku.

### RSS jako volitelna vrstva
- RSS je volitelny slozitejsi bojovy modul.
- Lze stale hrat jen se zakladnim soubojovym systemem z PPZ.

Vazby:
- [PPZ_RULES_STRUCTURED.md](./PPZ_RULES_STRUCTURED.md)

Pouziti v appce:
- `#calculator`: PPP je vrstva nad PPZ (gating od 6. urovne).
- `#journal`: prepinac ZSS/RSS per encounter.

---

## 2. Valecnik (PPP)
Tagy: `#class #spec #combat #resource #ppz-link`

### Pokrocile schopnosti od 6+
- Cesty valecnika (mece, sekery, hole/kopi, kladiva, strategie).
- Tovarys cechu valecniku: od 6. urovne 2 triky za uroven (bez zpetne opravy).

### Cesty valecnika - jadro
- Vyber cesty: od 6. urovne a pak kazdou 3. uroven.
- Kazda cesta ma 4 stupne + mistr.
- Bonusy z cest se aplikuji jen pro relevantni typ zbrane/styl.
- Pri boji dvema zbranemi naraz se ciselne bonusy cest nesectou.

### Cesta strategie
- Vyzaduje skupinu cca 3-10 inteligentnich spojencu (bez mistra).
- Bonusy a strategie jsou casove omezeny.
- Mistr cesty strategie rusi limit poctu podporenych spojencu a prodluzuje trvani.

### Specializace valecnika (od 6+)
- Berserkr
- Rytir
- Sermir

### Dulezite mechaniky pro planner
- Bez specializace: na kazde 6. urovni 1 schopnost ze specializaci.
- Se specializaci: volny pristup k talentum dane specializace + stale lze brat obecne valecnicke schopnosti.

Vazby:
- [PPZ valecnik + specializace](./PPZ_RULES_STRUCTURED.md#5-valecnik)
- [PPZ rozvoj postavy](./PPZ_RULES_STRUCTURED.md#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: pridat "Cesty" jako samostatny progression strom s ranky I-IV + mistr.
- `#journal`: evidovat vybranou cestu, stupen, trick list, specializaci a jeji lock level.

---

## 3. Hranicar (PPP)
Tagy: `#class #spec #skills #resource #ppz-link`

### Pokrocile schopnosti od 6+
- Nove profesni dovednosti automaticky:
  - Pohyb v terenu
  - Prirodni prekazky
  - Vyroba sipu
- Nova kouzla navazana na smery magie.

### Dusevni sila
- Rozsirena tabulka DS pokryva vyssi urovne a INT az do 40.
- Limit INT < 4 stale blokuje pouto s prirodou.

### Specializace hranicare
- Chodec
- Druid
- Pan zvirat

### Druid - extra pravidlova vrstva
- Druid ma zavazna RP/mechanicka pravidla (kov, zabiti zvirat, ochrana hvozdu).
- Hvozd ma stupne probuzenosti podle many.
- Posvatna mista druidu (druidsky kruh, srdce hvozdu) modifikuji ucinek kouzel.

Vazby:
- [PPZ hranicar](./PPZ_RULES_STRUCTURED.md#6-hranicar)
- [PPZ uzitecne informace (mana/priroda)](./PPZ_RULES_STRUCTURED.md#17-uzitecne-informace)

Pouziti v appce:
- `#calculator`: druid branch potrebuje samostatny subsystem "hvozd" (stav + many pool).
- `#journal`: panel hvozdu (stupen probuzeni, nastredana many, udalosti).

---

## 4. Alchymista (PPP)
Tagy: `#class #spec #gear #resource #ppz-link`

### Pokrocile schopnosti od 6+
- Alchymisticka dilna (nova mechanika zrychleni + bonusu).
- Varianty dlen: mala/stredni/velka/vez + specialni dilny specializaci.

### Dilny - klicove body
- Zrizeni + denni udrzba + kapacita many/surovin + bonusy.
- Pronajem dlen je mozny.
- Cechovni varianta funguje podobne jako rady u klerika.

### Specializace alchymisty
- Medicus
- Pyromant
- Theurg

### Theurg - navic specialni predmet
- Theurgova hul s vlastnim subsystemem vyroby a pouziti (astron, démoni, elementaly).

Vazby:
- [PPZ alchymista](./PPZ_RULES_STRUCTURED.md#7-alchymista)
- [PPZ vybaveni](./PPZ_RULES_STRUCTURED.md#12-vyzbroj-a-vystroj)

Pouziti v appce:
- `#calculator`: specializacni vetve + dilensky modifikator vyroby.
- `#journal`: evidence dilny (uroven, udrzba, bonusy, kapacity).

---

## 5. Kouzelnik (PPP)
Tagy: `#class #spec #resource #skills #ppz-link`

### Pokrocile schopnosti od 6+
- Kouzelnikova hul.
- Zaslechnuti kouzla.
- Dalsi magicti pratele (had, havran, netopyr).

### Kouzelnikova hul - jadro
- Vlastni ritual vyroby.
- Ukladani many (kapacita dle urovne).
- Privolani hole.
- V specializacich alternativni formy (zbran, carodejova hul, nekromantova dyka).

### Specializace kouzelnika
- Bojovy mag
- Carodej
- Nekromant

### Magie pokrocilych
- PPP navic mapuje "obecna" PPZ kouzla do oboru magie.
- To je dulezite pro schopnosti, ktere posiluji konkretni obory.

Vazby:
- [PPZ kouzelnik](./PPZ_RULES_STRUCTURED.md#8-kouzelnik)
- [PPZ magie a resource](./PPZ_RULES_STRUCTURED.md#17-uzitecne-informace)

Pouziti v appce:
- `#calculator`: oborova taxonomie kouzel musi zahrnout i puvodne obecna kouzla.
- `#journal`: tracker hole/dyky, ulozene many, pet summary magickych pratel.

---

## 6. Zlodej (PPP)
Tagy: `#class #spec #skills #gear #ppz-link`

### Pokrocile schopnosti od 6+
- Specialni predmety zlodeje.
- Zlodejsky cech.
- Zlodejske tetovani a organizacni struktury.

### Zlodejske triky
- Formalizovane parametry triku:
  - Cetnost
  - Pouziti
  - Overeni
- Typy: souboj/pohyb/reakce/soustredeni/vykrik (u valecnika), u zlodeje navazane na "umeni".

### Specializace zlodeje
- Assassin
- Lupic
- Sicco

### Sicco - sit kriminalnich akci
- Vlastni mini-ekonomika site (clenove, ceny, akce, riziko).
- Akce delene na prestupky a zlociny.
- U nezdaru u zlocinu hrozi ztraty clenu site.

Vazby:
- [PPZ zlodej](./PPZ_RULES_STRUCTURED.md#9-zlodej)
- [PPZ dovednosti](./PPZ_RULES_STRUCTURED.md#11-dovednosti)

Pouziti v appce:
- `#calculator`: talentove stromy pro specializace + unlock bez specializace co 6 level.
- `#journal`: Sicco dashboard (kumpani, naklady, akce, vysledky).

---

## 7. Klerik (PPP)
Tagy: `#class #spec #faith #resource #ppz-link`

### Pokrocila schopnost od 6+
- Dar zivota (lecive prosby jsou o 1/4 silnejsi, min +1).

### Prizen
- Rozsirena tabulka Prizne pro vyssi urovne a CHAR do 40.

### Specificke znalosti klerika (obecne pro hru)
- Posvatna a prokleta mista.
- Tlumeni a umlceni proseb.
- Relikvie a posvatne predmety.

### Specializace klerika
- Bojovy mnich
- Exorcista
- Knez

Vazby:
- [PPZ klerik](./PPZ_RULES_STRUCTURED.md#10-klerik)
- [PPZ vira](./PPZ_RULES_STRUCTURED.md#16-nabozenstvi-a-vira)

Pouziti v appce:
- `#journal`: tracker posvatnych mist + rezimy proseb (normal/tlumene/umlcene).

---

## 8. Rozsireny soubojovy system (RSS)
Tagy: `#rss #combat #gm #ppz-link`

### Co RSS pridava proti ZSS
- Plan boje (hex nebo ctverce), orientace postav, linie dohledu, trajektorie.
- Kryty, tereny, pocasi, viditelnost, rozhled.
- Akcni body, detailni ekonomika kratkych/dlouhych akci.
- Reakce, menzura, utoky z prilezitosti, obrana spojence.

### Kolo v RSS
1. Otevreni
2. Vyhlaseni
3. Vyhodnoceni

### Iniciativa
- stale navazuje na PPZ princip, ale v RSS se standardne prehazuje kazda 3 kola.

### Akcni body
- zakladne 3 AB (modifikuje unava, zatizeni, efekty).
- kratke akce stoji AB dle typu.
- dlouhe akce spotrebovavaji AB pres vice kol.

### Viditelnost a kryt
- stavy: Skryty / Neviditelny / Spatne viditelny / Viditelny.
- kryt: celkovy / 3-ctvrtecni / polovicni.

### Efekty a stavy
- napr. krváceni, povaleni, otrseni, paralyza, zapaleni, promoèení, vycerpani.
- RSS formalizuje jejich dopad na AB, pohyb, obranu, iniciativu.

Vazby:
- [PPZ boj](./PPZ_RULES_STRUCTURED.md#13-boj-a-jeho-pravidla)
- [PPZ herni mechaniky](./PPZ_RULES_STRUCTURED.md#4-herni-mechaniky)

Pouziti v appce:
- `#journal`: volitelny combat mode switch ZSS/RSS.
- `#calculator`: bez prime simulace, ale muze poskytovat RSS-ready export stat bloku.

---

## 9. Slovo zaverem
Tagy: `#core #gm`

- PPP ma umoznit dlouhodoby rust postav a hloubsi hrani.
- Dalsi obsah (epicke profese) ma byt v lore knihach.
- Konecne rozhodnuti pri nejasnostech je na PJ.

Vazby:
- [PPZ zaver](./PPZ_RULES_STRUCTURED.md#18-slovo-zaverem)

---

## Propojeni PPP <-> PPZ
Tagy: `#ppz-link #class #spec`

### Obecne pravidlo navaznosti
- PPP predpoklada vsechny zaklady z PPZ (atributy, resource, dovednosti, boj, levelup).
- PPP odemyka nove vrstvy primarne od 6. urovne.

### Propojeni po povolanich
- Valecnik (PPZ) -> Berserkr/Rytir/Sermir (PPP) + Cesty valecnika.
- Hranicar (PPZ) -> Chodec/Druid/Pan zvirat (PPP) + pokrocile prirodni subsystemy.
- Alchymista (PPZ) -> Medicus/Pyromant/Theurg (PPP) + dilny.
- Kouzelnik (PPZ) -> Bojovy mag/Carodej/Nekromant (PPP) + pokrocila oborova magie.
- Zlodej (PPZ) -> Assassin/Lupic/Sicco (PPP) + cech/sit/triky.
- Klerik (PPZ) -> Bojovy mnich/Exorcista/Knez (PPP) + posvatna/prokleta mista.

### Dulezite jednotne pravidlo specializaci
- Specializace neni povinna.
- Volba specializace je trvala.
- I po specializaci lze brat obecne class schopnosti.
- Bez zvolene specializace lze vzit 1 schopnost ze specializaci kazdou 6. uroven.

---

## Implementacni checklist

### Kalkulator (`#calculator`)
- [ ] Pridat PPP datovou vrstvu oddelenou od PPZ (gating: level >= 6).
- [ ] Podpora trvaleho locku specializace.
- [ ] Podpora pravidla "bez spec 1 pick kazdou 6. uroven".
- [ ] Valecnik: subsystem Cesty (I-IV + Mistr).
- [ ] Hranicar: druid/hvozd a pan-zvirat subsystemy.
- [ ] Alchymista: dilny + specializacni obory.
- [ ] Kouzelnik: oborove mapovani vcetne puvodne obecnych kouzel.
- [ ] Zlodej: model site pro Sicca (minim. timeline eventy + naklady).
- [ ] Klerik: rezimy proseb podle mista (normal/tlumene/umlcene).

### Denik PJ (`#journal`)
- [ ] Prehled PPZ+PPP schopnosti v jedne osi postupu.
- [ ] Samostatne panely pro subsystemy (hvozd, sit Sicca, dilna, hul).
- [ ] RSS encounter karta (teren, pocasi, viditelnost, efekty).
- [ ] U specializaci evidovat: podminky splneny, lock level, aktivni vetve.

---

## Zdroj a kvalita

- Zdroj: uzivatelem dodany text PPP v tomto vlakne.
- Pokud dorazi uplna revize PPP, doplnit diff znacky:
  - `CHANGED-RULE`
  - `NEW-RULE`
  - `DEPRECATED-RULE`