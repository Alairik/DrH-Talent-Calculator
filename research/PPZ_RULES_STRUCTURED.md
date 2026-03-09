# PPZ pravidla - strukturovany referencni markdown

Status: strukturovany prehled z plneho textu PPZ dodaneho uzivatelem
Aktualizace: 2026-03-09
Scope: kapitoly 1-18 (zakladni pravidla + navaznosti)

## Jak cist tento dokument

- Toto **neni doslovny prepis**. Je to srozumitelna pravidlova mapa.
- Kazda sekce obsahuje:
  - `Tagy` (tematicke stitky)
  - `Vazby` (na ktere casti pravidel navazuje)
  - `Pouziti v appce` (dopad na kalkulator/denik PJ)
- Vzorce a limity jsou uvedeny explicitne.

---

## Tag index

- `#core` obecna pravidla hry a vykladu
- `#terms` pojmy, zkratky, jednotky
- `#dice` kostky, hody, vyhoda/nevyhoda
- `#char` tvorba a stav postavy
- `#race` rasy a rodove schopnosti
- `#class` povolani a specializace
- `#attr` atributy a opravy
- `#skills` dovednosti a dovednostni body
- `#resource` mana/adrenalin/prizen/dusevni sila/suroviny
- `#gear` vybaveni, zbrane, zbroje, stity
- `#combat` boj a bojove akce
- `#hp` zivoty, bezvedomi, leceni, smrt
- `#progression` levelovani, rust postavy
- `#faith` nabozenstvi, vira, bozi kontext
- `#travel` pohyb, unava, cestovani, pruzkum
- `#gm` rulings a podpora PJ
- `#calculator` implikace pro kalkulator
- `#journal` implikace pro denik PJ

---

## Rychly obsah

1. [Uvod, hra, pojmy](#1-uvod-hra-pojmy)
2. [Herni postava](#2-herni-postava)
3. [Tvorba postavy](#3-tvorba-postavy)
4. [Herni mechaniky](#4-herni-mechaniky)
5. [Valecnik](#5-valecnik)
6. [Hranicar](#6-hranicar)
7. [Alchymista](#7-alchymista)
8. [Kouzelnik](#8-kouzelnik)
9. [Zlodej](#9-zlodej)
10. [Klerik](#10-klerik)
11. [Dovednosti](#11-dovednosti)
12. [Vyzbroj a vystroj](#12-vyzbroj-a-vystroj)
13. [Boj a jeho pravidla](#13-boj-a-jeho-pravidla)
14. [Zivoty a leceni](#14-zivoty-a-leceni)
15. [Rozvoj postavy](#15-rozvoj-postavy)
16. [Nabozenstvi a vira](#16-nabozenstvi-a-vira)
17. [Uzitecne informace](#17-uzitecne-informace)
18. [Slovo zaverem](#18-slovo-zaverem)

---

## 1. Uvod, hra, pojmy
Tagy: `#core #terms #gm`

### Co je cilem hry
- Drachi Hlidka neni hra na "vyhru" v klasickem smyslu.
- Cilem je prozivat pribeh, rust postav a rozhodovat se v otevrenych situacich.
- PJ (Pan Jeskyne) vede svet, hraci ridi sve postavy.

### Zakladni role
- PJ: vypravi, rozhoduje sporne situace, hraje CP.
- Druzina: skupina dobrodruhu.
- CP/NPC: cizi postavy vedene PJ.

### Zakladni pojmy
- Atributy: SIL, OBR, ODO, INT, CHAR.
- Ve hre se pouziva **oprava atributu**, ne stupen.
- Bonus/postih: ciselna uprava hodu.
- Vyhoda/nevihoda: standardne `+5 / -5`.
- Overeni/past: test proti obtiznosti/nebezpecnosti.

### Zkratky
- PJ, k6, k10, zk, zl, st, md, zt, UC, OC, OD, ZO, CP.

### Jednotky
- Cas: kolo ~ 6 s, smena ~ 15 min.
- Mira: coul, sah, mile.
- Vaha: un, lb, metrak, tuna.

### Penize
- `1 zl = 10 st`
- `1 st = 10 md`
- orientacne kazda mince ~ 10 un

Vazby:
- [4. Herni mechaniky](#4-herni-mechaniky)
- [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla)

Pouziti v appce:
- `#calculator`: centralni slovnik zkratek/pojmu.
- `#journal`: tooltipy k pojmum pro rychle rulings.

---

## 2. Herni postava
Tagy: `#char #attr #resource`

### Co tvori postavu
- Zaklad: jmeno, rasa, povolani, velikost, pohyblivost.
- Stav: nalozeni, unava, zivoty, mana.
- Schopnosti: dovednosti + zvlastni schopnosti.
- Ekonomika: vybaveni, zbroj, zbrane, penize.
- Progrese: zkusenosti a uroven.

### Atributy
- SIL: utok zblizka, nosnost, tezke vybaveni.
- OBR: obrana, strelba, jemna manipulace.
- ODO: zivoty, odolani vycerpani, jedum a nemocem.
- INT: kouzleni, postreh, analyticke cinnosti.
- CHAR: socialni interakce, vule, cast class mechanik.

### Zivoty
- `Max zivoty`: zdrava a odpocata postava.
- `Aktualni zivoty`: prubezne meni boj/leceni.
- `Mez vyrazeni`: pri `<= 0` bezvedomi.
- `Hranice smrti`: po prekroceni postava umira.

### Zdroje (kolonka Mana)
- V deniku se vse zapisuje do pole "Mana", i kdyz se nazev zdroje lisi.
- Mapovani dle povolani:
  - Valecnik -> Adrenalin
  - Hranicar -> Dusevni sila
  - Alchymista -> Mana (+ Suroviny)
  - Kouzelnik -> Mana
  - Zlodej -> bez manoveho zdroje
  - Klerik -> Prizen

Vazby:
- [3. Tvorba postavy](#3-tvorba-postavy)
- [14. Zivoty a leceni](#14-zivoty-a-leceni)

Pouziti v appce:
- `#journal`: class-specific label zdroje.
- `#calculator`: timeline musi zobrazovat realny nazev zdroje dle classy.

---

## 3. Tvorba postavy
Tagy: `#char #attr #race #class #skills #resource`

### Krok 1 - vyber rasy a povolani
- Zapis rasu, povolani, velikost a pohyblivost.
- Vol co chces hrat, ne jen "nejlepsi cisla".

### Krok 2 - urceni atributu

#### Rodove zaklady
- Clovek: `7/7/7/7/7`
- Trpaslik: `10/5/10/5/5`
- Elf: `6/7/5/10/9`
- Barbar: `9/8/8/5/5`
- Obr: `12/3/12/3/3`
- Gnom: `4/10/5/9/5`
- Pulcik: `6/9/6/7/8`

#### Dominantni +3 podle povolani
- Valecnik: SIL, ODO
- Hranicar: OBR, INT
- Alchymista: OBR, ODO
- Kouzelnik: INT, CHAR
- Zlodej: OBR, CHAR
- Klerik: INT, CHAR

#### Zakladni metoda (hody)
1. Hod `6x k6`.
2. Nejhorsi cislo skrtni.
3. 5 cisel rozdel do atributu.
4. Pricti rodove zaklady.
5. Pricti +3 do 2 dominantnich atributu povolani.
6. Vysledek zapis jako `Stupen`.

#### Alternativni metoda (body)
- Rozdel `20 bodu` do 5 atributu.
- Do kazdeho atributu min 1, max 6 bodu.
- Pricti rodovy zaklad a +3/+3 dominantni atributy.

### Krok 3 - opravy za atribut

| Stupen | Oprava |
|---|---|
| 1 | -5 |
| 2-3 | -4 |
| 4-5 | -3 |
| 6-7 | -2 |
| 8-9 | -1 |
| 10-11 | 0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18-19 | +4 |
| 20-21 | +5 |
| 22-23 | +6 |

Poznamka: nad 23 pokracuje vzor +1 oprava za kazde 2 stupne.

### Krok 4 - zivoty a hranice smrti
- `Zivoty = 10 + ODO`
- `Hranice smrti = -(10 + ODO)`

### Krok 5 - startovni vybaveni a dovednosti
- 3 blizke dovednosti classy automaticky na stupni 3.
- +3 dovednostni body na startu.
- Clovek ma +2 body navic (Vsestrannost).

Vazby:
- [11. Dovednosti](#11-dovednosti)
- [12. Vyzbroj a vystroj](#12-vyzbroj-a-vystroj)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: validace startu L1.
- `#journal`: generator postavy musi hlidat oboje metody atributu.

---

## 4. Herni mechaniky
Tagy: `#core #dice #combat #gm`

### Overovaci hod
- Univerzalni vzorec:
  - `Vysledek = 1k10 + oprava atributu + stupen dovednosti`
- Uspesny hod: vysledek je **vyssi** nez obtiznost/nebezpecnost.
- Pokud dovednost neovladas, dovednostni cast je 0.

### Typy hodu
- Overeni akce (aktivni pokus postavy).
- Hod proti pasti (reakce na hrozbu).
- Porovnavaci hod (vice postav proti sobe).
- Jednoduchy hod na atribut (bez dovednosti).

### Vyhoda a nevyhoda
- Vyhoda `+5`, nevyhoda `-5`.
- Obvykle se navzajem rusi.
- Stejne efekty se obvykle nestackuji.
- PJ muze hodnotu upravit dle situace.

### Doplne mechaniky
- Utonuti/uduseni:
  - priprava dechu: pocet kol podle hodu na Vydrz (minimum 1)
  - po vycerpani dechu ztrata zivotu kumulativne po `k6` za kolo
- Pad z vysky:
  - nad 2 sahy kumulativni zraneni `k6` po 2 sazich navic

### Obecne metapravidla
- Zaokrouhluje se nahoru.
- Pravidlo zpetne opravy plati.
- Konkretni pravidlo prebija obecne.
- PJ ma vzdy posledni slovo.

Vazby:
- [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla)
- [14. Zivoty a leceni](#14-zivoty-a-leceni)

Pouziti v appce:
- `#journal`: quick-reference blok pro PJ.

---

## 5. Valecnik
Tagy: `#class #resource #combat #progression`

### Start
- Blizke dovednosti: Atletika (3), Prvni pomoc (3), Vydrz (3)
- Zvlastni schopnosti L1:
  - Lecba vlastnich zraneni
  - Bojove triky

### Zdroj
- Adrenalin:
  - narusta v boji (`+1` na konci kola za aktivni ucast/pripravu)
  - mimo boj opada (`-1` za kolo)
  - slouzi pro triky a povybojove dolaceni

### Rust na dalsi urovni
- 1 nova schopnost nebo bojova skola
- 1 novy bojovy trik
- dovednostni body: `3 x nova uroven`
- zivoty: `1k6 + ODO`
- kazda 3. uroven: 2 charakterove body

### Specializace od 6. urovne
- Berserkr: obouruc + drtici kosti + Urputnost
- Sermir: bodna + dve zbrane + Rozvaznost
- Rytir: stit + jednoruc + Veleni

Vazby:
- [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: adrenalin jako resource label, triky jako class node.
- `#journal`: boje/triky panel + poznamka o urputnosti.

---

## 6. Hranicar
Tagy: `#class #resource #skills #progression`

### Start
- Blizke dovednosti: Prvni pomoc (3), Preziti v prirode (3), Znalost prirody (3)
- Zvlastni schopnosti L1:
  - Hranicarske umeni (Lov, Orientace, Predpovidani pocasi, Stopovani na +3)
  - Hranicarska magie (Pouto s prirodou)

### Zdroj
- Dusevni sila:
  - maxima podle tabulky (INT x uroven)
  - obnova po vydatnem spanku

### Kouzleni
- Ohlaseni zameru + odecteni DS.
- Overeni: `1k10 + INT + Pouto s prirodou` vs obtiznost kouzla.
- Specifikace: cena, dosah, rozsah, trvani, vyvolani, obtiznost, pozadavky.

### Rust na dalsi urovni
- 1 nova schopnost nebo smer magie
- dovednostni body: `5 x nova uroven`
- zivoty: `1k6 + ODO`
- zvyseni maxima DS dle tabulky

### Specializace od 6. urovne
- Chodec: Pruzkumnictvi + Magie pocestnych + Obratne ostri
- Druid: Lecitelstvi + Magie prirody + Bojova hul
- Pan zvirat: Ochocovani zvirat + Magie zvirat + Boj se zviraty

Vazby:
- [11. Dovednosti](#11-dovednosti)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: DS progression napojit na INT+level tabulku.
- `#journal`: zvir. pritel (pes/vlk/sokol) jako subpanel.

---

## 7. Alchymista
Tagy: `#class #resource #gear #progression`

### Start
- Blizke dovednosti: Znalost prirody (3), Mechanika (3), Cteni a psani (3)
- Zvlastni schopnosti L1:
  - Videni many (+3)
  - Destilace many (+3)
  - Lucba (+3)

### Podstata profese
- Vyroba = mana + zaklad + suroviny.
- Mana: vazana forma energie ziskana destilaci.
- Suroviny: promena surovinovych predmetu na numericky pool.

### Alchymisticka truhla
- laborator + sklad + uchovani many/surovin.
- ruzne nosice maji limity kapacity many.

### Rust na dalsi urovni
- 1 nova schopnost/obor
- dovednostni body: `4 x nova uroven`
- zivoty: `1k6 + ODO`

### Specializace od 6. urovne
- Medicus
- Pyromant
- Theurg

Vazby:
- [12. Vyzbroj a vystroj](#12-vyzbroj-a-vystroj)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#journal`: suroviny jako samostatny resource tracker.

---

## 8. Kouzelnik
Tagy: `#class #resource #progression`

### Start
- Blizke dovednosti: Cteni a psani (3), Historie (3), Cizi jazyky (3)
- Startovni magie: zakladni triky + sesilani kouzel (podle class kapitoly)

### Zdroj
- Mana, maxima podle class tabulek.

### Rust na dalsi urovni
- 1 nova schopnost/obor
- +2 nova kouzla
- dovednostni body: `3 x nova uroven`
- zivoty: `1k6 + ODO`
- navyseni maxima many dle tabulky

### Specializace od 6. urovne
- Bojovy mag
- Carodej
- Nekromant

Vazby:
- [15. Rozvoj postavy](#15-rozvoj-postavy)
- [17. Uzitecne informace](#17-uzitecne-informace)

Pouziti v appce:
- `#calculator`: kouzla vazat na obory a level gate.

---

## 9. Zlodej
Tagy: `#class #skills #progression`

### Start
- Blizke dovednosti: Akrobacie (3), Postreh (3), Reflex (3)
- Zvlastni schopnosti L1: dle class kapitoly (zlodejska umeni)

### Zdroj
- Nema manovy zdroj.

### Rust na dalsi urovni
- 1 nova schopnost/umeni
- dovednostni body: `8 x nova uroven`
- zivoty: `1k6 + ODO`

### Specializace od 6. urovne
- Assassin
- Lupic
- Sicco

Vazby:
- [11. Dovednosti](#11-dovednosti)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: nejvyssi skill-economy multiplikator (8x).

---

## 10. Klerik
Tagy: `#class #resource #faith #progression`

### Start
- Blizke dovednosti: Cteni a psani (3), Teologie (3), Vule (3)
- L1: Spojeni s bohem, Prosby, Sveceni

### Zdroj
- Prizen (bozi zdroj), maxima podle class tabulek.

### Nauky
- Bojovniku viry
- Bozich patronu
- Demonologie
- Milosrdenstvi
- Svate pravdy
- Zehnani aurami

### Rust na dalsi urovni
- 1 nova schopnost nebo nauka
- dovednostni body: `3 x nova uroven`
- zivoty: `1k6 + ODO`
- navyseni maxima Prizne dle tabulky

### Specializace od 6. urovne
- Bojovy mnich
- Exorcista
- Knez

Vazby:
- [16. Nabozenstvi a vira](#16-nabozenstvi-a-vira)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#journal`: vazba boha + nauk + proseb.

---

## 11. Dovednosti
Tagy: `#skills #attr #progression`

### Typy dovednosti
- Obecne
- Znalostni
- Blizke
- Profesni (specialni)

### Klicove pravidlo znalostnich dovednosti
- Pokud postava potrebnou znalostni dovednost neovlada, akce je automaticky neuspesna.

### Startovni body
- Vsechny postavy: 3 body.
- Clovek: 5 bodu (diky Vsestrannosti).

### Body za level
- Valecnik: `3 x uroven`
- Hranicar: `5 x uroven`
- Alchymista: `4 x uroven`
- Kouzelnik: `3 x uroven`
- Zlodej: `8 x uroven`
- Klerik: `3 x uroven`

### Uceni a zlepsovani
- Nova dovednost: cena 1, start na stupni 1.
- Zlepseni na stupen `N`: cena `N`.
- V ramci jednoho levelupu lze danou dovednost zvednout max o 1 stupen.

Vazby:
- [3. Tvorba postavy](#3-tvorba-postavy)
- [15. Rozvoj postavy](#15-rozvoj-postavy)

Pouziti v appce:
- `#calculator`: jadro planneru a validaci.
- `#journal`: audit dovednostnich bodu po levelu.

---

## 12. Vyzbroj a vystroj
Tagy: `#gear #combat #travel`

### Zakladni princip
- Vybaveni ma cenu, hmotnost, casto i pravidlovy efekt.
- Ceny jsou orientacni (lokalita/PJ je muze menit).

### Zbrane
- Deleni podle boje: zblizka / strelne / vrhaci.
- Deleni podle drzeni: jednoruce / obouruce.
- Deleni podle hmotnosti: lehke / stredni / tezke.
- Pokud postava nema dost SIL: nevyhoda pri utoku i obrane s danou zbrani.

### Dostrel a nabijeni
- Nad efektivni dostrel obvykle nevyhoda `-5`.
- Ruzne typy strel. zbrani maji ruzny cas nabijeni.

### Zbroje a stity
- Kvalita zbroje/stitu se zapocitava do obrany.
- Tezsi zbroje ovlivnuji stealth, plavani, odpocinek a kouzleni.

Vazby:
- [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla)
- [17. Uzitecne informace](#17-uzitecne-informace)

Pouziti v appce:
- `#journal`: loadout s SIL validaci a dopadem na OBR testy.

---

## 13. Boj a jeho pravidla
Tagy: `#combat #dice #hp`

### Faze boje
1. Zaujeti pozic
2. Moment prekvapeni
3. Iniciativa
4. Bojove kolo

### Iniciativa
- `Iniciativa = 1k6 + OBR`

### Utok
- `Utok = UC + k6`
- k6 exploduje (pri 6 hod znovu, secte se)
- zasah pokud `Utok > Obrana`
- `Zraneni = (Utok - Obrana) + Zraneni zbrane`

### Obrana
- Pasivni: `Obrana = ZO`
- Aktivni: `Obrana = OC + k6` (k6 exploduje)

### Bojove akce
- dlouhe, kratke, okamzite
- typicky max 1 dlouha nebo 2 kratke akce za kolo

### Netradicni situace
- boj v presile
- boj beze zbrane
- boj se dvema zbranemi
- utok ze zalohy
- utok na leziciho/bezbranneho
- boj s neviditelnym protivnikem
- utek a pronasledovani

### Kriticky utok/obrana
- 2+ sestky na hodu mohou spustit kriticky efekt (krvaceni/vedlejsi nasledky)

Vazby:
- [14. Zivoty a leceni](#14-zivoty-a-leceni)
- [12. Vyzbroj a vystroj](#12-vyzbroj-a-vystroj)

Pouziti v appce:
- `#journal`: combat quick cards (UC/OC/ZO + stavy).

---

## 14. Zivoty a leceni
Tagy: `#hp #combat`

### Mez vyrazeni a bezvedomi
- Pri `0 a mene` postava pada do bezvedomi.
- Je prakticky bez akce a je snadny cil.

### Kriticka zraneni
- Prubezne odcerpavaji zivoty, dokud nejsou osetrena.
- Osetreni: Prvni pomoc nebo magie.

### Prvni pomoc
- Stabilizuje, ale standardne neleci ztracene zivoty.
- Obvykle hod `Prvni pomoc (OBR) vs X`.

### Leceni
- Spanek, odpocinek, class schopnosti, magie.
- Aktualni zivoty nelze zvednout nad maximum.

### Smrt
- Po prekroceni hranice smrti je postava mrtva.

Vazby:
- [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla)
- [3. Tvorba postavy](#3-tvorba-postavy)

Pouziti v appce:
- `#journal`: stavovy semafor (ok / bezvedomi / mrtvy).

---

## 15. Rozvoj postavy
Tagy: `#progression #skills #attr #resource`

### Urovne
- Celkem 24 urovni.
- Tato prirucka pokryva primarne zacatecnicke spektrum (1-5), ale tabulky jdou vys.

### Rust zkusenosti
- Po dosazeni hranice zk dochazi k levelupu.
- Zkusenosti se nenuluji.

### Co se meni pri levelupu
- 1 nova class schopnost/nauka/skola/obor.
- Dovednostni body dle classy.
- Zivoty `+ (1k6 + ODO)`, minimum prirustku je 1.
- Kazda 3. uroven: 2 charakterove body do atributu (do dvou ruznych atributu).
- U class se zdrojem navyseni maxima resource dle class tabulek.

### Specializace
- Oteviraji se od 6. urovne.
- Vyzaduji konkretni kombinace schopnosti.
- Volba specializace je zavazna.

Vazby:
- [5. Valecnik](#5-valecnik)
- [6. Hranicar](#6-hranicar)
- [7. Alchymista](#7-alchymista)
- [8. Kouzelnik](#8-kouzelnik)
- [9. Zlodej](#9-zlodej)
- [10. Klerik](#10-klerik)

Pouziti v appce:
- `#calculator`: timeline eventy + spec lock + spending guardrails.
- `#journal`: level history (co bylo vzato na jakem levelu).

---

## 16. Nabozenstvi a vira
Tagy: `#faith #gm #class`

### Zakladni teze
- Bohove maji domeny a zamereni.
- Vira smrtelniku je zdrojem bozi moci.
- Klerik je sluzebnik boha a vykonavatel jeho vule.

### Svetlo vs temnota
- Rozdeleni bohu dle stylu prosazovani moci.
- PJ urcuje konkretni kosmologii sveta kampane.

### Duse
- Dulezita metafyzicka slozka bytosti.
- Klicova pro nabozenstvi, klericke motivace a tone setting.

Vazby:
- [10. Klerik](#10-klerik)

Pouziti v appce:
- `#journal`: roleplay field (vira, bozi prikazy, tabu).

---

## 17. Uzitecne informace
Tagy: `#travel #gear #skills #resource #gm`

### Pohyb, nalozeni, unava
- Nosnost urcena SIL (tabulkove).
- Prekroceni nosnosti snizuje pohyblivost a zhorsuje unavu.
- Unava ma stupne a postihy.

### Cestovani
- Rychlost dle terenu + stylu (pesky, kun, povoz).
- Dulezite jsou zasoby, pitny rezim, odpocinek, hlidky.

### Pruzkum a podzemi
- Svetlo, naslouchani, hledani, mapovani, stopovani.
- Spravna pochodova sestava snizuje rizika.

### Mana - doplnkove kontexty
- Volna vs vazana mana.
- Vichry many.
- Transformace/promeny a obecna pravidla efektu.

Vazby:
- [4. Herni mechaniky](#4-herni-mechaniky)
- [12. Vyzbroj a vystroj](#12-vyzbroj-a-vystroj)

Pouziti v appce:
- `#journal`: cestovni mini-widget (volitelne v dalsi verzi).

---

## 18. Slovo zaverem
Tagy: `#core #gm`

### Finalni principy
- Pravidla slouzi hre, ne naopak.
- Pokud pravidla neco nepokryji, PJ rozhodne.
- Rozhodnuti PJ je zavazne pro konzistenci stolu.

Vazby:
- [4. Herni mechaniky](#4-herni-mechaniky)

---

## Propojeni stitku (topic map)

### Tvorba -> Boj -> Leceni -> Progrese
- [3. Tvorba postavy](#3-tvorba-postavy) -> [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla) -> [14. Zivoty a leceni](#14-zivoty-a-leceni) -> [15. Rozvoj postavy](#15-rozvoj-postavy)

### Class workflow
- [5. Valecnik](#5-valecnik), [6. Hranicar](#6-hranicar), [7. Alchymista](#7-alchymista), [8. Kouzelnik](#8-kouzelnik), [9. Zlodej](#9-zlodej), [10. Klerik](#10-klerik) -> [15. Rozvoj postavy](#15-rozvoj-postavy)

### Skill economy
- [11. Dovednosti](#11-dovednosti) <-> [3. Tvorba postavy](#3-tvorba-postavy) <-> [15. Rozvoj postavy](#15-rozvoj-postavy)

### Resource economy
- [2. Herni postava](#2-herni-postava) <-> class sekce 5-10 <-> [15. Rozvoj postavy](#15-rozvoj-postavy)

### Rulings
- [4. Herni mechaniky](#4-herni-mechaniky) + [13. Boj a jeho pravidla](#13-boj-a-jeho-pravidla) + [17. Uzitecne informace](#17-uzitecne-informace)

---

## Implementacni checklist

### Kalkulator (`#calculator`)
- [ ] startovni validace L1 (blizke 3x + body + clovek bonus)
- [ ] dovednostni body dle classy (`mult x level`)
- [ ] cap: +1 stupen na dovednost za levelup
- [ ] class resource label
- [ ] specializace od 6+ + lock logika
- [ ] timeline eventy (spec lock, attr bump, class milestone)

### Denik PJ (`#journal`)
- [ ] class-specific resource card (nazev + max/aktual)
- [ ] atributy + Opravy + HP + hranice smrti
- [ ] dovednosti s auditem bodu
- [ ] combat mini panel (UC/OC/ZO + stavy)
- [ ] export kompatibilni s build modelem kalkulatoru

---

## Poznamka ke zdroji
- Zdroj: uzivatelsky poskytnuty plny text PPZ v tomto vlakne.
- Pokud prijde novejsi revize pravidel, pouzit diff marker:
  - `CHANGED-RULE`
  - `NEW-RULE`
  - `DEPRECATED-RULE`