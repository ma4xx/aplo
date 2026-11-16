# Aplo

开会时的第二位听众。

Aplo 在你的 Mac 上记录会议、转写成文字，并且让你在会议**进行的过程中**随时向 AI 提问。它读着正在进行的逐字稿，你可以问"他刚才那句是什么意思""这个问题我该怎么回"，得到一句在会议室里就能用的回答。会后自动生成会议纪要。

## 能做什么

- **会中提问**：打字向 AI 提问，它基于当前的逐字稿回答，不用离开会议。
- **会中参谋**（设置 → 会中参谋）：一段可以自己修改的指令，决定 AI 怎么当你的"第二位听众"。它默认给出简短回答、建议你下一句怎么说，也能把一个模糊的需求拆成清楚的范围。可以修改、关闭、恢复默认。
- **同一件事，连续几场会**：把相关的会议放进同一个文件夹，聊天会自动带上这个文件夹的说明和前三场会议的纪要，不用每次重新交代背景。
- **会后纪要**：自动生成，内置多种中文模板，也可以自己写。
- **全中文界面**，包括日期和模板。
- **数据留在你的电脑上**：不需要账号，没有云端。录音转写和 AI 回答使用**你自己配置**的服务（自带 API 密钥），也可以用本机的模型。

## 下载安装

要求：Apple 芯片的 Mac，macOS 15 或更新。

1. 在本仓库的 [Releases](../../releases) 下载最新的 `Aplo-*-macos-arm64.tar.gz`，双击解压得到 `Aplo.app`，拖进"应用程序"。
2. **第一次打开**：这个安装包没有经过苹果的公证，系统会拦一下。先试着在 `Aplo.app` 上右键 → 打开 → 打开。较新的 macOS 里如果没有"打开"按钮，就到 系统设置 → 隐私与安全性，拉到最下面，点"仍要打开"。
3. 按提示给 Aplo 授权：麦克风、系统音频（用来录到对方的声音）。
4. 到设置里配置你的转写服务和 AI 服务（填入自己的 API 密钥）。

数据保存在 `~/Library/Application Support/aplo`。

## 从源码构建

macOS，Apple 芯片。需要完整的 Xcode（含 Metal 工具链）、Node 22、pnpm，以及 `rust-toolchain.toml` 里指定的 Rust 版本。

```bash
pnpm install --frozen-lockfile
cd packages/ui && pnpm run build && cd ../..
cd apps/desktop && pnpm exec tauri build --bundles app
```

## 感谢

感谢 [Anarlog](https://github.com/fastrepl/anarlog)（Fastrepl, Inc.，前身是 Hyprnote）以 MIT 协议开源了它的项目。Aplo 的录音、转写、编辑器等基础能力建立在它的工作之上。它原来的 README 保留在 [`docs/upstream/`](docs/upstream/) 里。

也感谢所有被用到的开源项目，包括 Tauri、React、Lingui、SQLite 等。它们各自的许可证见各目录下的 `LICENSE*` 和 `NOTICE` 文件。

## 许可证

MIT，见 [`LICENSE`](LICENSE)，其中保留了原项目的版权声明。
