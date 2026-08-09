#!/usr/bin/env python3
"""Render the dependency-free Unpopping Candy documentation preview.

This is an optional documentation utility. It requires Python Playwright and a
Chromium executable, but it does not require the JavaScript workspace packages
to be installed.
"""
from __future__ import annotations

import base64
import json
import mimetypes
import os
import re
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError as exc:  # pragma: no cover - environment guard
    raise SystemExit("Python Playwright is required: pip install playwright") from exc

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "docs" / "preview"
CAPTURE = PREVIEW / "captures" / "unpopping-candy-overview.png"
AUDIT = PREVIEW / "capture-audit.json"
VIEWPORT = {"width": 1440, "height": 1000}


def inline_document() -> str:
    html = (PREVIEW / "index.html").read_text(encoding="utf-8")
    css_paths = [
        ROOT / "packages" / "tokens" / "src" / "styles.css",
        ROOT / "packages" / "icons" / "src" / "styles.css",
        ROOT / "packages" / "ui" / "src" / "styles.css",
        ROOT / "packages" / "social" / "src" / "styles.css",
        PREVIEW / "preview.css",
    ]
    css = "\n".join(path.read_text(encoding="utf-8") for path in css_paths)
    html = re.sub(r'\s*<link rel="stylesheet"[^>]+/>', "", html)
    html = html.replace("</head>", f"<style>{css}</style></head>")

    for path in (PREVIEW / "assets").iterdir():
        if not path.is_file():
            continue
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        html = html.replace(f"./assets/{path.name}", f"data:{mime};base64,{encoded}")
    return html


def main() -> None:
    executable = os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium")
    CAPTURE.parent.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=executable,
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page(viewport=VIEWPORT, device_scale_factor=1)
        page.on(
            "console",
            lambda message: errors.append(f"console:{message.type}:{message.text}")
            if message.type == "error"
            else None,
        )
        page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))
        page.set_content(inline_document(), wait_until="load", timeout=20_000)
        broken_images = page.locator("img").evaluate_all(
            "images => images.filter(image => !image.complete || image.naturalWidth === 0).length"
        )
        dimensions = page.evaluate(
            "({scrollWidth: document.documentElement.scrollWidth, "
            "scrollHeight: document.documentElement.scrollHeight, "
            "viewportWidth: innerWidth, viewportHeight: innerHeight})"
        )
        page.screenshot(path=str(CAPTURE), full_page=False)
        browser.close()

    audit = {
        "viewport": VIEWPORT,
        "deviceScaleFactor": 1,
        "capture": str(CAPTURE.relative_to(ROOT)),
        "brokenImages": broken_images,
        "consoleOrPageErrors": errors,
        "horizontalOverflow": dimensions["scrollWidth"] > dimensions["viewportWidth"],
        "documentDimensions": dimensions,
    }
    AUDIT.write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")

    if broken_images or errors or audit["horizontalOverflow"]:
        raise SystemExit(json.dumps(audit, indent=2))
    print(json.dumps(audit, indent=2))


if __name__ == "__main__":
    main()
