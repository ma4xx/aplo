# 会议录音状态地图

记录"录音"这件事在界面上所有出现的位置，改会议页之前先读这里。源码读于 2026-11-26。

## 状态

`store/zustand/listener/general-shared.ts`：

| 状态 | 含义 |
|---|---|
| `inactive` | 没在录 |
| `active` | 正在录 |
| `finalizing` | 刚点停止，正在收尾 |
| `running_batch` | 录完后整段重新转写中 |

## 每个状态在哪里显示

| 位置 | 没在录 | 正在录 | 收尾 / 重新转写 | 代码 |
|---|---|---|---|---|
| 右上角主按钮 | "录制"；有日历会议时是"加入并录制" | "停止" | 不显示 | `session/components/outer-header/index.tsx` 的 `HeaderMeetingControl` |
| 左上角"逐字稿"标签 | 普通图标 | 红色跳动竖条（音量） | 转圈 | `session/components/note-input/header-transcript.tsx` |
| 右键"逐字稿"标签 | 继续录音、复制、重新转写 | 复制 | 继续录音 | 同上，约 270 行 |
| 右上角三个点菜单 | 开始录音 / 继续录音 | 停止录音、打开浮动面板 | 继续录音 | `outer-header/overflow/` |
| 左侧列表那一条 | 普通 | 整条红底，悬停出现停止 | 转圈 | `sidebar/timeline/item.tsx` |
| 屏幕底部悬浮条（应用外） | 无 | 自动出现：红色音量点、展开、停止 | 收尾中 | `meeting-float/`，设置项 `floating_bar_enabled` |
| 菜单栏图标 | 默认图标 | 三帧录音动画，标题显示会议名 | | `plugins/tray/` |
| 菜单栏"开始新会议" | 新建笔记并应该自动开录 | 灰掉 | | `plugins/tray/src/menu_items/tray_start.rs` |
| 笔记底部"随便问" | 会后三个快捷问题：待办、跟进邮件、关键决定 | 会中三个：回顾 5 分钟、接下来问什么、目前待办 | | `chat/components/body/empty.tsx` |
| 笔记底部播放条 | 会后出现，是录音回放，不是继续录音 | | | `audio-player/` |
| 意外中断提示 | | | 提示"已保存音频"，可继续录音或生成笔记 | `stt/saved-capture-audio.tsx` |
| 快捷键 | ⌘⇧N 新建并开录；⌘J 问 AI | | | `shared/useMainShortcuts.tsx`、`chat/state/use-chat-mode.ts` |

## 已确认的缺陷

- **菜单栏"开始新会议"不会自动开录。** `tray_start.rs` 发出的事件带了 `auto_start: true`，但 `shared/main-app-layout.tsx` 处理 `openTab` 时，遇到 id 为 `new` 就直接调用 `openNewNote()`，把 `auto_start` 丢掉了。同文件处理 `/app/new?record=true` 时用的是 `openNewNoteAndListen`，应该照这个改。用户反馈的"点了开始还要再点一次录制"就是这个。

## 改动原则

- 上面这套状态是成套设计的，同一个状态会在 3 到 6 个地方同时变化。**不要挪动已有的按钮或指示**，只做增补，或者修缺陷。
- 新增的入口必须调用同一个开始和停止函数（`useStartListening`、`listener.stop`），这样其他位置的状态会自动跟着变。
