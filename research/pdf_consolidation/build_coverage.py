import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RESEARCH = ROOT / "research"
OUT_DIR = RESEARCH / "pdf_consolidation"


def norm(value: str) -> str:
    s = "".join(
        c for c in unicodedata.normalize("NFD", str(value).lower()) if unicodedata.category(c) != "Mn"
    )
    s = re.sub(r"[^a-z0-9\s()/-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main():
    texts = []
    for fn in ["dovednosti_1_ocr.txt", "dovednosti2_ocr.txt"]:
        p = ROOT / fn
        if p.exists():
            texts.append(p.read_text(encoding="utf-8", errors="ignore"))
    raw_text = "\n".join(texts)
    lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
    lines_n = [norm(ln) for ln in lines]
    full_n = "\n".join(lines_n)

    skills = load_json(RESEARCH / "sirael-skills-all.json")["items"]
    talents = load_json(RESEARCH / "sirael-player-talents.json")["items"]
    aliases = load_json(OUT_DIR / "manual_aliases.json")

    canon = []
    for s in skills:
        canon.append({"type": "skill", "id": s["id"], "name": s["name"], "n": norm(s["name"])})
    for t in talents:
        canon.append({"type": "talent", "id": t["id"], "name": t["name"], "n": norm(t["name"])})

    by_id = {x["id"]: x for x in canon}
    matched = {"skill": set(), "talent": set()}
    matches = []

    # Direct contain match.
    for item in canon:
        if item["n"] and item["n"] in full_n:
            matched[item["type"]].add(item["id"])
            matches.append(
                {
                    "source": "direct_contains",
                    "type": item["type"],
                    "id": item["id"],
                    "name": item["name"],
                    "score": 1.0,
                    "raw": item["name"],
                }
            )

    # Fuzzy candidate match for still-missing ids.
    for raw, nline in zip(lines, lines_n):
        if len(nline) < 4:
            continue
        best = None
        for item in canon:
            if item["id"] in matched[item["type"]]:
                continue
            ratio = SequenceMatcher(None, item["n"], nline).ratio()
            if best is None or ratio > best["score"]:
                best = {"score": ratio, "item": item}
        if not best:
            continue
        threshold = 0.88 if best["item"]["type"] == "skill" else 0.84
        if best["score"] >= threshold:
            item = best["item"]
            matched[item["type"]].add(item["id"])
            matches.append(
                {
                    "source": "fuzzy_candidate",
                    "type": item["type"],
                    "id": item["id"],
                    "name": item["name"],
                    "score": round(best["score"], 3),
                    "raw": raw,
                }
            )

    # Manual alias pass.
    alias_hits = []
    for group in ["skills", "talents"]:
        typ = "skill" if group == "skills" else "talent"
        for alias in aliases.get(group, []):
            target_id = alias["id"]
            target = by_id.get(target_id)
            if not target:
                continue
            for pat in alias.get("patterns", []):
                pn = norm(pat)
                if pn and pn in full_n:
                    if target_id not in matched[typ]:
                        matched[typ].add(target_id)
                        alias_hits.append(
                            {
                                "source": "manual_alias",
                                "type": typ,
                                "id": target_id,
                                "name": target["name"],
                                "pattern": pat,
                            }
                        )
                    break

    coverage = {
        "skills": sorted(matched["skill"]),
        "talents": sorted(matched["talent"]),
        "generated_from": ["dovednosti_1_ocr.txt", "dovednosti2_ocr.txt"],
        "alias_hits": alias_hits,
    }
    (OUT_DIR / "pdf_coverage_map.json").write_text(
        json.dumps(coverage, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "matches.json").write_text(json.dumps(matches, ensure_ascii=False, indent=2), encoding="utf-8")

    matched_sk = [x for x in skills if x["id"] in matched["skill"]]
    matched_ta = [x for x in talents if x["id"] in matched["talent"]]
    miss_sk = [x for x in skills if x["id"] not in matched["skill"]]
    miss_ta = [x for x in talents if x["id"] not in matched["talent"]]

    md = []
    md.append("# PDF vs Sirael Coverage")
    md.append("")
    md.append("Zdroj OCR: `dovednosti_1.pdf` + `dovednosti2.pdf`")
    md.append("")
    md.append(f"- Skills pokryto: **{len(matched_sk)}/{len(skills)}**")
    md.append(f"- Talenty pokryto: **{len(matched_ta)}/{len(talents)}**")
    md.append(f"- Manual alias zásahy: **{len(alias_hits)}**")
    md.append("")
    md.append("## Matched Skills")
    for x in matched_sk:
        md.append(f"- {x['name']} ({x['id']})")
    md.append("")
    md.append("## Matched Talents")
    for x in matched_ta:
        md.append(f"- {x['name']} ({x['id']})")
    md.append("")
    md.append("## Missing Skills")
    for x in miss_sk:
        md.append(f"- {x['name']} ({x['id']})")
    md.append("")
    md.append("## Missing Talents")
    for x in miss_ta:
        md.append(f"- {x['name']} ({x['id']})")
    md.append("")
    md.append("## Manual Alias Hits")
    for hit in alias_hits:
        md.append(f"- {hit['name']} ({hit['id']}) <- {hit['pattern']}")
    (OUT_DIR / "report.md").write_text("\n".join(md), encoding="utf-8")

    # Keep candidate list regenerated for inspection.
    candidates = []
    for raw, nline in zip(lines, lines_n):
        if len(nline) < 4:
            continue
        if re.search(r"\([sd]\)", nline) or any(
            k in nline for k in ["umeni ", "obor ", "nauka ", "magie ", "schopnost", "triky", "prosby"]
        ):
            candidates.append({"raw": raw, "normalized": nline})
    seen = set()
    uniq = []
    for c in candidates:
        if c["normalized"] in seen:
            continue
        seen.add(c["normalized"])
        uniq.append(c)
    (OUT_DIR / "consolidated_candidates.json").write_text(
        json.dumps(uniq, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(
        f"done: skills {len(matched_sk)}/{len(skills)}, talents {len(matched_ta)}/{len(talents)}, alias_hits {len(alias_hits)}"
    )


if __name__ == "__main__":
    main()
