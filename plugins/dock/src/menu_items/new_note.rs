use super::DockMenuItem;

pub struct DockNewNote;

impl DockMenuItem for DockNewNote {
    fn title(_app: &tauri::AppHandle<tauri::Wry>) -> String {
        "新建笔记".to_string()
    }

    fn handle(app: &tauri::AppHandle<tauri::Wry>) {
        tauri_plugin_tray::AnlgMenuItem::AppNew.handle(app);
    }
}
