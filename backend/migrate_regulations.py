"""
One-shot migration: apply all regulation corrections identified in the validation audit.
Run once: python migrate_regulations.py
"""
from database import SessionLocal
import models

db = SessionLocal()

def get_creature(name):
    c = db.query(models.SeaCreature).filter(models.SeaCreature.common_name == name).first()
    if not c:
        raise ValueError(f"Creature not found: {name}")
    return c

def get_state(abbr):
    s = db.query(models.State).filter(models.State.code == abbr).first()
    if not s:
        raise ValueError(f"State not found: {abbr}")
    return s

def get_regulation(creature_id, state_id):
    return (
        db.query(models.LegalRegulation)
        .filter_by(creature_id=creature_id, state_id=state_id)
        .first()
    )

def upsert(creature_name, state_abbr, **fields):
    c = get_creature(creature_name)
    s = get_state(state_abbr)
    reg = get_regulation(c.id, s.id)
    if reg:
        for k, v in fields.items():
            setattr(reg, k, v)
        action = "UPDATED"
    else:
        reg = models.LegalRegulation(creature_id=c.id, state_id=s.id, **fields)
        db.add(reg)
        action = "INSERTED"
    print(f"  {action}: {creature_name} / {state_abbr}")


print("=== Regulation migration starting ===\n")

# 1. Weakfish — bag_limit 6 → 1 for all three states
print("1. Weakfish bag_limit corrections (6 → 1)")
for state in ["NJ", "MD", "DE"]:
    upsert("Weakfish", state,
           bag_limit=1,
           season="Year-round (1-fish possession limit)")

# 2. Horseshoe Crab — DE season inverted (was showing closure window, not open window)
print("2. Horseshoe Crab DE season fix")
upsert("Horseshoe Crab", "DE",
       season="Year-round except May 15 – June 15 (spawning closure)")

# 3. Winter Flounder — MD and DE showing "Year-round" (incorrect, both have seasonal closures)
print("3. Winter Flounder MD/DE season corrections")
for state in ["MD", "DE"]:
    upsert("Winter Flounder", state,
           season="March 1 – May 31, October 1 – November 30")

# 4. Sandbar Shark — add missing DE and NJ entries (federally prohibited, same as US/MD)
print("4. Sandbar Shark — add DE and NJ entries")
upsert("Sandbar Shark", "DE",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / DNREC Division of Fish & Wildlife")
upsert("Sandbar Shark", "NJ",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / NJ Division of Fish & Wildlife")

# 5. Black Sea Bass NJ — min_size_cm 33.0 → 31.75 (12.5 inches per MAFMC)
print("5. Black Sea Bass NJ min_size_cm correction (33.0 → 31.75)")
upsert("Black Sea Bass", "NJ", min_size_cm=31.75)

# 6. Atlantic Menhaden — add missing DE entry
print("6. Atlantic Menhaden — add DE entry")
upsert("Atlantic Menhaden", "DE",
       harvest_legal=True, min_size_cm=None, bag_limit=None,
       season="Year-round", permit_required="No for recreational bait use",
       authority="ASMFC / DNREC Division of Fish & Wildlife")

# 7. American Lobster — add missing MD and DE entries
print("7. American Lobster — add MD and DE entries")
upsert("American Lobster", "MD",
       harvest_legal=True, min_size_cm=8.3, bag_limit=None,
       season="Year-round", permit_required="Yes — MD Sport Fishing License",
       authority="ASMFC / MD Department of Natural Resources")
upsert("American Lobster", "DE",
       harvest_legal=True, min_size_cm=8.3, bag_limit=None,
       season="Year-round", permit_required="Yes — DNREC license",
       authority="ASMFC / DNREC Division of Fish & Wildlife")

# 8. Atlantic Mackerel — add missing DE entry
print("8. Atlantic Mackerel — add DE entry")
upsert("Atlantic Mackerel", "DE",
       harvest_legal=True, min_size_cm=None, bag_limit=None,
       season="Year-round", permit_required="Yes — DNREC license",
       authority="MAFMC / DNREC Division of Fish & Wildlife")

# 9. Blue Mussel — add missing DE entry
print("9. Blue Mussel — add DE entry")
upsert("Blue Mussel", "DE",
       harvest_legal=True, min_size_cm=None, bag_limit=None,
       season="Year-round (subject to closures)", permit_required="No for recreational",
       authority="DNREC Division of Fish & Wildlife")

# 10. Jonah Crab — add missing MD and DE entries
print("10. Jonah Crab — add MD and DE entries")
upsert("Jonah Crab", "MD",
       harvest_legal=True, min_size_cm=10.2, bag_limit=None,
       season="Year-round", permit_required="Yes — MD commercial crab license",
       authority="ASMFC / MD Department of Natural Resources")
upsert("Jonah Crab", "DE",
       harvest_legal=True, min_size_cm=10.2, bag_limit=None,
       season="Year-round", permit_required="Yes — DNREC commercial license",
       authority="ASMFC / DNREC Division of Fish & Wildlife")

# 11. Atlantic Sturgeon — add missing MD and DE entries (ESA-protected, no harvest)
print("11. Atlantic Sturgeon — add MD and DE entries")
upsert("Atlantic Sturgeon", "MD",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / MD Department of Natural Resources")
upsert("Atlantic Sturgeon", "DE",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / DNREC Division of Fish & Wildlife")

# 12. Great White Shark — add missing DE, MD, NJ entries (federally protected)
print("12. Great White Shark — add DE, MD, NJ entries")
upsert("Great White Shark", "DE",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / DNREC Division of Fish & Wildlife")
upsert("Great White Shark", "MD",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / MD Department of Natural Resources")
upsert("Great White Shark", "NJ",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / NJ Division of Fish & Wildlife")

# 13. Whale Shark — add missing DE, MD, NJ entries (CITES Appendix II)
print("13. Whale Shark — add DE, MD, NJ entries")
upsert("Whale Shark", "DE",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / DNREC Division of Fish & Wildlife")
upsert("Whale Shark", "MD",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / MD Department of Natural Resources")
upsert("Whale Shark", "NJ",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / NJ Division of Fish & Wildlife")

# 14. Giant Manta Ray — add missing DE, MD, NJ entries (ESA / CITES Appendix II)
print("14. Giant Manta Ray — add DE, MD, NJ entries")
upsert("Giant Manta Ray", "DE",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / DNREC Division of Fish & Wildlife")
upsert("Giant Manta Ray", "MD",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / MD Department of Natural Resources")
upsert("Giant Manta Ray", "NJ",
       harvest_legal=False, min_size_cm=None, bag_limit=0,
       season="N/A", permit_required="N/A",
       authority="NOAA / NJ Division of Fish & Wildlife")

db.commit()
db.close()
print("\n=== Migration complete ===")
