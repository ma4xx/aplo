# Errors

## No meetings found

An empty list means nothing matched, not that Aplo is broken. Try a shorter title fragment, or list folders and search inside one.

## Database not found

Aplo has not created its data yet. Ask the user to open Aplo once. Do not look for the database file yourself and do not read it directly.

## Database busy or incompatible

Report the error as it is. Ask the user to close and reopen Aplo, or to update it. Do not run migrations and do not retry in a tight loop.

## Importing recordings fails

`import_recording` needs the Aplo app to be open. Ask the user to open it, then retry with the same `request_key`.
