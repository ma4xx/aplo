#!/bin/bash
# Re-sign a built Aplo.app with the local self-signed certificate.
#
# Why: the build tools only ad-hoc sign the app. macOS then ties every
# permission the user grants (microphone, system audio, accessibility,
# calendar) to the exact bytes of one build, so each rebuild looks like a
# different app and the grants stop applying. A certificate gives the app a
# stable identity: "this identifier, signed by this certificate".
#
# The certificate and its private key live in a dedicated keychain on the build
# machine (~/.aplo-signing). Nothing here is a secret; the passwords stay in
# files in that folder and are never printed.
#
# Usage: scripts/sign-aplo-local.sh /path/to/Aplo.app
set -euo pipefail

APP="${1:?usage: sign-aplo-local.sh /path/to/Aplo.app}"
DIR="${APLO_SIGNING_DIR:-$HOME/.aplo-signing}"
KEYCHAIN="${APLO_SIGNING_KEYCHAIN:-$HOME/Library/Keychains/aplo-signing.keychain-db}"
IDENTITY_NAME="${APLO_SIGNING_IDENTITY:-Aplo Local Signing}"
BUNDLE_ID="com.ma4xx.aplo"

[ -d "$APP/Contents/MacOS" ] || { echo "not an app bundle: $APP" >&2; exit 1; }
[ -f "$DIR/keychain.pass" ] || { echo "missing $DIR/keychain.pass" >&2; exit 1; }

security unlock-keychain -p "$(cat "$DIR/keychain.pass")" "$KEYCHAIN"

# Find the certificate by name and sign with its hash, so a second certificate
# with the same name can never be picked up by accident.
HASH="$(security find-identity -p codesigning "$KEYCHAIN" | awk -v n="\"$IDENTITY_NAME\"" '$0 ~ n {print $2; exit}')"
[ -n "$HASH" ] || { echo "no identity named $IDENTITY_NAME in $KEYCHAIN" >&2; exit 1; }

sign() { codesign --force --keychain "$KEYCHAIN" --sign "$HASH" --timestamp=none "$@"; }

# Inside-out: helpers and libraries first, the app last.
while IFS= read -r f; do
  if file "$f" | grep -q "Mach-O"; then
    case "$f" in
      "$APP/Contents/MacOS/aplo") ;;  # signed last, with the bundle id
      *) sign "$f" ;;
    esac
  fi
done < <(find "$APP/Contents" -type f \( -path "*/Frameworks/*" -o -path "*/MacOS/*" \))

sign --identifier "$BUNDLE_ID" "$APP"

codesign --verify --deep --strict "$APP"
echo "signed: $APP"
codesign -d -r- "$APP" 2>&1 | sed -n 's/^designated => /designated requirement: /p'
