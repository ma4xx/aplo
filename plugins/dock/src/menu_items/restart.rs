use super::DockMenuItem;

pub struct DockRestart;

impl DockMenuItem for DockRestart {
    fn title(app: &tauri::AppHandle<tauri::Wry>) -> String {
        format!("重新启动 {}", app.package_info().name)
    }

    fn handle(app: &tauri::AppHandle<tauri::Wry>) {
        app.restart();
    }
}
