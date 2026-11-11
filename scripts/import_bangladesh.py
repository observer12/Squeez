"""Export named Bangladeshi OSM businesses with public phone and email tags."""

import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

import osmium


def first_valid(value, predicate):
    return next((part for item in (value or "").split(";")
                 for part in [item.strip()] if predicate(part)), None)


def valid_phone(value):
    return bool(re.fullmatch(r"\+?[\d().\s-]+", value, re.ASCII)
                and re.fullmatch(r"\+?\d{7,15}", re.sub(r"[^\d+]", "", value), re.ASCII))


def valid_email(value):
    return bool(re.fullmatch(r"[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+", value))


def public_url(value):
    try:
        url = urlsplit(value)
        if url.scheme in {"https", "http"} and url.hostname and not url.username:
            return value
    except ValueError:
        pass
    return None


class BusinessExtract(osmium.SimpleHandler):
    def __init__(self, groups):
        super().__init__()
        self.categories = {(tag, value): label for group in groups
                           for label, (tag, *values) in group["entries"].items()
                           for value in values}
        self.category_keys = tuple(dict.fromkeys(tag for tag, _ in self.categories))
        self.records = []

    def details(self, item, kind):
        tags = item.tags
        name = tags.get("name:en") or tags.get("name")
        if not name or not name.strip():
            return None
        phone = first_valid(tags.get("contact:phone"), valid_phone) or first_valid(tags.get("phone"), valid_phone)
        email = first_valid(tags.get("contact:email"), valid_email) or first_valid(tags.get("email"), valid_email)
        if not phone or not email:
            return None
        category = next((self.categories[(key, tags.get(key))] for key in self.category_keys
                         if (key, tags.get(key)) in self.categories), None)
        if not category:
            return None
        website = public_url(tags.get("contact:website") or tags.get("website") or "")
        street = " ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street")]))
        area = tags.get("addr:city") or tags.get("addr:district") or tags.get("addr:suburb") or "Bangladesh"
        address = ", ".join(filter(None, [street, tags.get("addr:suburb"), tags.get("addr:city")]))
        socials = []
        for platform in ("facebook", "instagram", "youtube", "tiktok", "linkedin"):
            link = public_url(tags.get(f"contact:{platform}") or tags.get(platform) or "")
            if link:
                socials.append({"platform": {"youtube": "YouTube", "tiktok": "TikTok", "linkedin": "LinkedIn"}.get(platform, platform.title()), "url": link})
        record = {
            "id": f"osm-{kind}-{item.id}", "name": name.strip(), "area": area,
            "category": category, "phone": phone, "email": email,
            "source": f"https://www.openstreetmap.org/{kind}/{item.id}",
            "website": {"status": "unknown" if website else "unlisted"},
        }
        if address:
            record["address"] = address
        if website:
            record["listedWebsite"] = website
        if socials:
            record["socials"] = socials
        if tags.get("opening_hours"):
            record["hours"] = tags.get("opening_hours")
        return record

    def node(self, node):
        record = self.details(node, "node")
        if record and node.location.valid():
            record["coordinates"] = [node.location.lon, node.location.lat]
            self.records.append(record)

    def way(self, way):
        record = self.details(way, "way")
        if not record:
            return
        coords = [(node.location.lon, node.location.lat) for node in way.nodes if node.location.valid()]
        if not coords:
            return
        lon, lat = zip(*coords)
        record["coordinates"] = [(min(lon) + max(lon)) / 2, (min(lat) + max(lat)) / 2]
        self.records.append(record)


def main():
    source, groups, output = map(Path, sys.argv[1:])
    extract = BusinessExtract(json.loads(groups.read_text(encoding="utf-8")))
    extract.apply_file(source, locations=True)
    if not extract.records:
        raise RuntimeError("No qualifying Bangladesh business records")
    records = sorted(extract.records, key=lambda item: hashlib.sha256(item["id"].encode()).hexdigest())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Exported {len(records)} Bangladesh business records")


if __name__ == "__main__":
    main()
