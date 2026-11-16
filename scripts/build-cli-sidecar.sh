#!/bin/bash
# Build the command-line program that Aplo's MCP server runs from, and put it
# where `tauri build` expects a sidecar.
#
# The app bundles it as Contents/MacOS/anarlog-cli. When the user opens
# Settings -> Connect AI agents, the app links it to ~/.local/bin/aplo, and the
# MCP configuration it shows points at that file.
#
# Run this on the build machine before every `tauri build`: tauri.conf.json
# lists the file under bundle.externalBin, so the build fails without it.
#
# Usage: scripts/build-cli-sidecar.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="aarch64-apple-darwin"
DEST="$ROOT/apps/desktop/src-tauri/resources/cli/anarlog-cli-$TRIPLE"

cd "$ROOT"
cargo build --locked --release -p anarlog-cli --target "$TRIPLE"

BUILT="${CARGO_TARGET_DIR:-$ROOT/target}/$TRIPLE/release/anarlog"
[ -f "$BUILT" ] || { echo "not built: $BUILT" >&2; exit 1; }

cp "$BUILT" "$DEST"
chmod 755 "$DEST"
echo "sidecar ready: $DEST ($(du -h "$DEST" | cut -f1))"
