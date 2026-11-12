use super::DockMenuItem;

pub struct DockSettings;

impl DockMenuItem for DockSettings {
    fn title(_app: &tauri::AppHandle<tauri::Wry>) -> String {
        "设置".to_string()
    }

    fn handle(app: &tauri::AppHandle<tauri::Wry>) {
        tauri_plugin_tray::AnlgMenuItem::TraySettings.handle(app);
    }
}
