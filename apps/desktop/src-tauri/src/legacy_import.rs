//! One-time copy of the data folder Aplo's predecessor used.
//!
//! Aplo began as a fork that read and wrote `Application Support/anarlog`, the
//! folder the official Anarlog app also uses. Aplo now has its own folder. The
//! first launch copies the old folder across so existing meetings are still
//! there. The old folder is only read: it is never moved, changed or deleted,
//! so the older app keeps working and acts as the backup.
//!
//! The copy runs once. It is skipped when the new folder already has a
//! database, when the old folder has none, or while the old app is running
//! (copying a live database could capture half a write).

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub(crate) const SOURCE_FOLDER: &str = "anarlog";
const MARKER_FILENAME: &str = ".imported-from-anarlog";
const DB_FILENAME: &str = "app.db";
const DB_SIDECARS: [&str; 2] = ["app.db-wal", "app.db-shm"];
const LAUNCH_LOCK_FILENAME: &str = "launch.lock";

#[derive(Debug, PartialEq, Eq)]
pub(crate) enum ImportOutcome {
    /// The new folder already holds data, or the import already ran.
    NotNeeded,
    /// There is nothing to import from.
    NoSource,
    /// The old app is running; try again on a later launch.
    SourceInUse,
    Imported { files: usize },
}

pub(crate) fn source_dir_for(data_dir: &Path) -> PathBuf {
    data_dir.join(SOURCE_FOLDER)
}

pub(crate) fn import_legacy_folder(source: &Path, target: &Path) -> io::Result<ImportOutcome> {
    if source == target {
        return Ok(ImportOutcome::NotNeeded);
    }
    if target.join(MARKER_FILENAME).exists() || target.join(DB_FILENAME).is_file() {
        return Ok(ImportOutcome::NotNeeded);
    }
    if !source.join(DB_FILENAME).is_file() {
        return Ok(ImportOutcome::NoSource);
    }
    if source_is_running(source) {
        return Ok(ImportOutcome::SourceInUse);
    }

    fs::create_dir_all(target)?;

    let mut files = 0;
    files += copy_tree(source, target, true)?;

    // The database goes last, under a temporary name, then is renamed into
    // place. A launch interrupted earlier never leaves a database that looks
    // complete but is not, and the next launch simply starts over.
    for sidecar in DB_SIDECARS {
        let from = source.join(sidecar);
        if from.is_file() {
            fs::copy(&from, target.join(sidecar))?;
        }
    }
    let staged = target.join("app.db.importing");
    fs::copy(source.join(DB_FILENAME), &staged)?;
    fs::rename(&staged, target.join(DB_FILENAME))?;
    files += 1;

    fs::write(target.join(MARKER_FILENAME), source.display().to_string())?;
    Ok(ImportOutcome::Imported { files })
}

fn source_is_running(source: &Path) -> bool {
    let Ok(file) = fs::OpenOptions::new()
        .write(true)
        .open(source.join(LAUNCH_LOCK_FILENAME))
    else {
        return false;
    };
    matches!(file.try_lock(), Err(std::fs::TryLockError::WouldBlock))
}

fn is_skipped(name: &str, top_level: bool) -> bool {
    if name == ".DS_Store" || name.ends_with(".lock") {
        return true;
    }
    top_level && (name == DB_FILENAME || DB_SIDECARS.contains(&name))
}

fn copy_tree(from: &Path, to: &Path, top_level: bool) -> io::Result<usize> {
    let mut copied = 0;
    for entry in fs::read_dir(from)? {
        let entry = entry?;
        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        if is_skipped(&name_str, top_level) {
            continue;
        }
        let destination = to.join(&name);
        let kind = entry.file_type()?;
        if kind.is_dir() {
            fs::create_dir_all(&destination)?;
            copied += copy_tree(&entry.path(), &destination, false)?;
        } else if kind.is_file() {
            if destination.is_file()
                && destination.metadata()?.len() == entry.metadata()?.len()
            {
                continue;
            }
            fs::copy(entry.path(), &destination)?;
            copied += 1;
        }
    }
    Ok(copied)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(path: &Path, content: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, content).unwrap();
    }

    fn setup() -> (tempfile::TempDir, PathBuf, PathBuf) {
        let root = tempfile::tempdir().unwrap();
        let source = root.path().join("anarlog");
        let target = root.path().join("aplo");
        write(&source.join("app.db"), "db");
        write(&source.join("app.db-wal"), "wal");
        write(&source.join("store.json"), "{}");
        write(&source.join("sessions/a/audio.mp3"), "audio");
        write(&source.join("launch.lock"), "");
        write(&source.join("com.hyprnote.stable.running.lock"), "");
        write(&source.join(".DS_Store"), "junk");
        (root, source, target)
    }

    #[test]
    fn copies_everything_and_leaves_the_source_untouched() {
        let (_root, source, target) = setup();
        let before: Vec<_> = walk(&source);

        let outcome = import_legacy_folder(&source, &target).unwrap();

        assert!(matches!(outcome, ImportOutcome::Imported { .. }));
        assert_eq!(fs::read_to_string(target.join("app.db")).unwrap(), "db");
        assert_eq!(fs::read_to_string(target.join("app.db-wal")).unwrap(), "wal");
        assert_eq!(fs::read_to_string(target.join("store.json")).unwrap(), "{}");
        assert_eq!(
            fs::read_to_string(target.join("sessions/a/audio.mp3")).unwrap(),
            "audio"
        );
        assert!(target.join(MARKER_FILENAME).is_file());
        assert!(!target.join("app.db.importing").exists());
        assert_eq!(walk(&source), before, "source folder must not change");
    }

    #[test]
    fn does_not_copy_locks_or_finder_files() {
        let (_root, source, target) = setup();
        import_legacy_folder(&source, &target).unwrap();
        assert!(!target.join("launch.lock").exists());
        assert!(!target.join("com.hyprnote.stable.running.lock").exists());
        assert!(!target.join(".DS_Store").exists());
    }

    #[test]
    fn runs_once_and_never_overwrites_newer_data() {
        let (_root, source, target) = setup();
        import_legacy_folder(&source, &target).unwrap();
        fs::write(target.join("app.db"), "newer").unwrap();
        fs::write(source.join("app.db"), "changed in old app").unwrap();

        assert_eq!(
            import_legacy_folder(&source, &target).unwrap(),
            ImportOutcome::NotNeeded
        );
        assert_eq!(fs::read_to_string(target.join("app.db")).unwrap(), "newer");
    }

    #[test]
    fn skips_when_the_new_folder_already_has_a_database() {
        let (_root, source, target) = setup();
        write(&target.join("app.db"), "mine");
        assert_eq!(
            import_legacy_folder(&source, &target).unwrap(),
            ImportOutcome::NotNeeded
        );
        assert_eq!(fs::read_to_string(target.join("app.db")).unwrap(), "mine");
    }

    #[test]
    fn a_new_folder_with_only_a_launch_lock_still_imports() {
        let (_root, source, target) = setup();
        write(&target.join("launch.lock"), "");
        assert!(matches!(
            import_legacy_folder(&source, &target).unwrap(),
            ImportOutcome::Imported { .. }
        ));
    }

    #[test]
    fn nothing_to_import_when_the_old_folder_is_missing_or_empty() {
        let root = tempfile::tempdir().unwrap();
        let target = root.path().join("aplo");
        assert_eq!(
            import_legacy_folder(&root.path().join("anarlog"), &target).unwrap(),
            ImportOutcome::NoSource
        );
        fs::create_dir_all(root.path().join("anarlog")).unwrap();
        assert_eq!(
            import_legacy_folder(&root.path().join("anarlog"), &target).unwrap(),
            ImportOutcome::NoSource
        );
        assert!(!target.join("app.db").exists());
    }

    #[test]
    fn waits_while_the_old_app_is_running() {
        let (_root, source, target) = setup();
        let held = fs::OpenOptions::new()
            .write(true)
            .open(source.join("launch.lock"))
            .unwrap();
        held.try_lock().unwrap();

        assert_eq!(
            import_legacy_folder(&source, &target).unwrap(),
            ImportOutcome::SourceInUse
        );
        assert!(!target.join("app.db").exists());
        drop(held);
        assert!(matches!(
            import_legacy_folder(&source, &target).unwrap(),
            ImportOutcome::Imported { .. }
        ));
    }

    #[test]
    fn an_interrupted_import_is_resumed_without_a_half_written_database() {
        let (_root, source, target) = setup();
        // Interrupted after the sessions were copied, before the database.
        write(&target.join("sessions/a/audio.mp3"), "audio");
        write(&target.join("app.db.importing"), "partial");

        let outcome = import_legacy_folder(&source, &target).unwrap();

        assert!(matches!(outcome, ImportOutcome::Imported { .. }));
        assert_eq!(fs::read_to_string(target.join("app.db")).unwrap(), "db");
        assert!(!target.join("app.db.importing").exists());
    }

    fn walk(dir: &Path) -> Vec<(PathBuf, u64)> {
        let mut out = Vec::new();
        for entry in fs::read_dir(dir).unwrap() {
            let entry = entry.unwrap();
            if entry.file_type().unwrap().is_dir() {
                out.extend(walk(&entry.path()));
            } else {
                out.push((entry.path(), entry.metadata().unwrap().len()));
            }
        }
        out.sort();
        out
    }
}
