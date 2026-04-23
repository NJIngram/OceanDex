"""
Backfill image_url for any sea creature that doesn't have one yet.
Fetches photos from iNaturalist using each creature's scientific name.

Usage:
    python backfill_images.py
"""

import requests
from database import SessionLocal
import models


def fetch_image_url(scientific_name):
    try:
        resp = requests.get(
            "https://api.inaturalist.org/v1/taxa",
            params={"q": scientific_name, "per_page": 1, "rank": "species"},
            timeout=8,
        )
        results = resp.json().get("results", [])
        if results and results[0].get("default_photo"):
            return results[0]["default_photo"]["medium_url"]
    except Exception:
        pass
    return None


def main():
    db = SessionLocal()
    creatures = db.query(models.SeaCreature).filter(
        models.SeaCreature.image_url == None
    ).all()

    if not creatures:
        print("All creatures already have images.")
        db.close()
        return

    print(f"Fetching images for {len(creatures)} creature(s)...\n")

    for c in creatures:
        url = fetch_image_url(c.scientific_name)
        if url:
            c.image_url = url
            print(f"  ✓  {c.common_name} ({c.scientific_name})")
        else:
            print(f"  ✗  {c.common_name} ({c.scientific_name}) — no image found")

    db.commit()
    db.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
