use super::DockMenuItem;

pub struct DockOpen;

impl DockMenuItem for DockOpen {
    fn title(app: &tauri::AppHandle<tauri::Wry>) -> String {
        format!("打开 {}", app.package_info().name)
    }

    fn handle(app: &tauri::AppHandle<tauri::Wry>) {
        tauri_plugin_tray::AnlgMenuItem::TrayOpen.handle(app);
    }
}
