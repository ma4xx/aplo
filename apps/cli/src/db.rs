use std::path::{Path, PathBuf};

use crate::{Args, Error, Result};

pub async fn open(args: &Args) -> Result<anlg_db_core::Db> {
    let path = resolve_path(args)?;
    if !path.is_file() {
        return Err(Error::DatabaseNotFound(path));
    }

    anlg_db_core::Db::connect_local_read_only(&path)
        .await
        .map_err(|error| Error::operation("open database", error.to_string()))
}

pub async fn open_write(args: &Args) -> Result<anlg_db_core::Db> {
    let path = resolve_path(args)?;
    if !path.is_file() {
        return Err(Error::DatabaseNotFound(path));
    }

    anlg_db_core::Db::connect_local_read_write(&path)
        .await
        .map_err(|error| Error::operation("open database for writes", error.to_string()))
}

pub(crate) fn resolve_path(args: &Args) -> Result<PathBuf> {
    if let Some(path) = &args.db_path {
        return Ok(path.clone());
    }
    if let Some(base) = &args.base {
        return Ok(base.join("app.db"));
    }

    let data_dir = dirs::data_dir().ok_or_else(|| {
        Error::operation("resolve database path", "data directory is unavailable")
    })?;
    Ok(resolve_default_path(&data_dir))
}

// Aplo keeps its data in one place. The command never falls back to another
// product's folder: an older copy there would be stale data.
fn resolve_default_path(data_dir: &Path) -> PathBuf {
    data_dir.join("aplo").join("app.db")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_path_is_the_aplo_folder() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(
            resolve_default_path(dir.path()),
            dir.path().join("aplo/app.db")
        );
    }

    #[test]
    fn default_path_ignores_other_products_folders() {
        let dir = tempfile::tempdir().unwrap();
        for folder in ["anarlog", "hyprnote", "com.hyprnote.stable"] {
            let stale = dir.path().join(folder).join("app.db");
            std::fs::create_dir_all(stale.parent().unwrap()).unwrap();
            std::fs::write(&stale, "").unwrap();
        }

        assert_eq!(
            resolve_default_path(dir.path()),
            dir.path().join("aplo/app.db")
        );
    }
}
