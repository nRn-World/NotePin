#!/usr/bin/env python3
"""Build NotePin Firefox.zip (+ optional source zip) for addons.mozilla.org."""

from __future__ import annotations

import json
import shutil
import subprocess
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
APP = ROOT / "notepin"
DIST = APP / "dist"
STAGING = ROOT / "_firefox_build"
ZIP_NAME = ROOT / "NotePin Firefox.zip"
SOURCE_ZIP = ROOT / "NotePin Firefox Source.zip"


def run_build() -> None:
    print("Building with Vite...")
    subprocess.run(["npm", "run", "build"], cwd=APP, check=True, shell=True)


def make_icon32() -> None:
    src = DIST / "icons" / "icon128.png"
    if not src.exists():
        src = APP / "public" / "icons" / "icon128.png"
    img = Image.open(src).convert("RGBA").resize((32, 32), Image.Resampling.LANCZOS)
    out = STAGING / "icons" / "icon32.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, format="PNG")


def patch_manifest(m: dict) -> dict:
    m["background"] = {"scripts": ["background.js"]}
    m["homepage_url"] = "https://nrnworld.one/p/notepin"
    m["browser_specific_settings"] = {
        "gecko": {
            "id": "notepin@nrnworld.one",
            "strict_min_version": "142.0",
            "data_collection_permissions": {"required": ["none"]},
        }
    }
    icon_map = {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png",
    }
    m["icons"] = icon_map
    if "action" in m:
        m["action"]["default_icon"] = icon_map
    return m


def stage_extension() -> None:
    if STAGING.exists():
        shutil.rmtree(STAGING)
    shutil.copytree(
        DIST,
        STAGING,
        ignore=shutil.ignore_patterns("*.map", "Kaffe.icon.png"),
    )
    make_icon32()
    manifest_path = STAGING / "manifest.json"
    m = json.loads(manifest_path.read_text(encoding="utf-8"))
    m = patch_manifest(m)
    # Ensure version matches package if public copy lagged
    pkg = json.loads((APP / "package.json").read_text(encoding="utf-8"))
    m["version"] = pkg.get("version", m.get("version"))
    manifest_path.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Ship privacy copy for reviewers
    privacy = ROOT / "docs" / "privacy.html"
    if privacy.exists():
        shutil.copy2(privacy, STAGING / "privacy.html")


def build_zip(src: Path, dest: Path) -> None:
    if dest.exists():
        dest.unlink()
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in sorted(src.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(src).as_posix())
    print(f"ZIP ready: {dest.name} ({dest.stat().st_size / 1024:.1f} KB)")


def build_source_zip() -> None:
    """Source for AMO (Vite/React build)."""
    if SOURCE_ZIP.exists():
        SOURCE_ZIP.unlink()
    include_root = [
        "LICENSE.md",
        "README.md",
        "STORE_LISTING.md",
        "privacy-policy.md",
        "AMO_BUILD.md",
        "prepare_firefox_zip.py",
    ]
    include_app = [
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "vite.config.ts",
        "index.html",
        "metadata.json",
    ]
    include_dirs = [
        APP / "src",
        APP / "public",
        ROOT / "docs",
    ]

    with zipfile.ZipFile(SOURCE_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        zf.writestr(
            "AMO_BUILD.md",
            (ROOT / "AMO_BUILD.md").read_text(encoding="utf-8")
            if (ROOT / "AMO_BUILD.md").exists()
            else "",
        )
        for name in include_root:
            p = ROOT / name
            if p.exists() and name != "AMO_BUILD.md":
                zf.write(p, name)
        for name in include_app:
            p = APP / name
            if p.exists():
                zf.write(p, f"notepin/{name}")
        for folder in include_dirs:
            if not folder.exists():
                continue
            for path in sorted(folder.rglob("*")):
                if not path.is_file():
                    continue
                if "node_modules" in path.parts or "testsprite" in path.parts:
                    continue
                if folder == APP / "src" or folder == APP / "public":
                    arc = Path("notepin") / path.relative_to(APP)
                else:
                    arc = path.relative_to(ROOT)
                zf.write(path, arc.as_posix())
    print(f"Source ZIP ready: {SOURCE_ZIP.name} ({SOURCE_ZIP.stat().st_size / 1024:.1f} KB)")


def verify() -> None:
    with zipfile.ZipFile(ZIP_NAME, "r") as zf:
        names = set(zf.namelist())
        manifest = json.loads(zf.read("manifest.json"))
    required = {"manifest.json", "background.js", "loader.js", "content.js", "index.html", "icons/icon32.png"}
    missing = sorted(required - names)
    if missing:
        raise RuntimeError("Missing: " + ", ".join(missing))
    bg = manifest.get("background", {})
    if "scripts" not in bg:
        raise RuntimeError("Firefox background.scripts required")
    gecko = manifest["browser_specific_settings"]["gecko"]
    if gecko.get("id") != "notepin@nrnworld.one":
        raise RuntimeError("Bad gecko.id")
    print(f"OK v={manifest['version']} files={len(names)} id={gecko['id']}")


def main() -> None:
    run_build()
    stage_extension()
    build_zip(STAGING, ZIP_NAME)
    verify()
    build_source_zip()
    shutil.rmtree(STAGING, ignore_errors=True)
    print()
    print(f"Upload extension: {ZIP_NAME}")
    print(f"Upload source:    {SOURCE_ZIP}")


if __name__ == "__main__":
    main()
