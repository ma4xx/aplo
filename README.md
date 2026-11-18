<h1 align="center">Aplo</h1>

<p align="center"><strong>会上听懂，会后交给 AI 去办</strong></p>

<p align="center">为 Agent 设计的会议录音工具<br>Mac（Apple 芯片）· 中文优先 · 会议存在你自己的电脑上</p>

<p align="center">
  <a href="../../releases/latest"><strong>下载最新版本</strong></a> ·
  <a href="#开始使用">开始使用</a> ·
  <a href="#常见问题">常见问题</a>
</p>

---

**让 AI 也参加你的会。** 在会议室里打开 Mac，开会时 AI 和你一起听，随时帮你理解；散会后，整场会议直接交给你的 Agent，接着去做。

## 会上：AI 和你一起听

开会时随时打字问它，不用切窗口，也不用等散会。

> **10:12 老板**：下半年不能只盯着拉新了。用户来了留不住，前面花的钱都白花……
>
> **你问**：老板刚才讲的这个，你怎么理解？
>
> **AI**：他想把重点从拉新转到留存，方向定了，但还没给具体指标。接下来值得先确认：留存看哪个数，目标定多少，哪些现有的拉新投入要收。
>
> **10:14 老板**：大家怎么看？
>
> <sub>示例</sub>

- **跟着会议回答**：你问的时候，它知道这场会到现在说了什么。
- **按你的方式讲**：它的角色和说话方式可以自己设定，回答贴近你的岗位和习惯。
- **知道来龙去脉**：同一件事的会放在一起，前几场的结论它都记得。

## 会后：交给你的 Agent

Agent 已经在帮你写文档、推进任务，它缺的只是会上发生了什么。

- **直接交给它**：Codex、Claude Code 这类 Agent 直接读会议，不用导出转发。
- **它本来就懂你的工作**：拿到会议后，结合它已经了解的项目和习惯，就能接着做。
- **原话都在**：完整的逐字稿也能读，不只是一份摘要。

> **你对 Agent 说**：读一下刚才那场会，按会上定下来的调整方案。
>
> <sub>示例。Agent 读取会议，再去改你的方案文档</sub>

## 记录在你手里

- **默认存在本机**：会议、逐字稿、录音都在你自己的电脑上。让哪个 AI 读，由你决定。
- **AI 由你选**：本机模型、自己的 Key，或者已有的 ChatGPT 订阅，随时可以换。

## 开始使用

需要 Apple 芯片的 Mac，macOS 15 或更新。

1. **下载并安装**：在 [Releases](../../releases/latest) 下载 `Aplo-*-macos-arm64.tar.gz`，解压后把 `Aplo.app` 拖进“应用程序”。
   - 第一次打开：在 `Aplo.app` 上右键，选“打开”。应用还没有苹果公证，系统会拦一次。
   - 较新的 macOS 里如果没有“打开”按钮，到“系统设置 → 隐私与安全性”，拉到最下面点“仍要打开”。
2. **允许麦克风**：会议室里的会靠麦克风录。线上会议还需要允许系统音频，才能录到对方的声音。
3. **选择转写和 AI**：填入你自己的服务 Key，或者用已有的 ChatGPT 订阅登录，也可以用本机模型。
4. **进会议室，点开始录音**：把 Mac 放在桌上，尽量离说话的人近一些。开会时随时在旁边打字问 AI。
5. **散会后，交给你的 Agent**：第一次使用时，在“设置 → 连接 AI 助手”里点“复制配置说明”，发给你的 Agent，它会自己配好，只需要做一次。之后直接让它读会议。

## 费用

| | 自己配置 | 开箱即用的套餐 |
|---|---|---|
| 状态 | 现在可用 | 计划中，尚未上线 |
| 怎么收费 | 工具本身免费。你只为自己选的转写和 AI 服务付费，直接付给服务商 | 订阅一个套餐，转写和 AI 都包含在内，每月包含一定的转写时长。价格未定 |
| 适合 | 愿意自己动手、想自己控制成本的人 | 不想研究设置，只想开会时有 AI 帮忙的人 |

## 为什么做 Aplo

我是产品经理，每天要开好几场会，和老板对需求，和同事对方案。

以前开完会，大家各自把结论记在脑子里。现在有了 AI，事情推得更快，会也更多，光靠脑子已经记不住。

我平时用 Agent 干活。可每次开完会，想让它接着推进，都得先把会上的事口述一遍给它听。线上会议还有一份自动纪要可以转给它，会议室里的会什么都没留下。

还有些时候，老板讲的是方向，我在会上没完全听懂，会后推进起来就没底。

所以我做了 Aplo，让 AI 也参加我的会：会上听不懂，马上就能问；散会后，整场会议直接交给 Agent。

—— Max

## 常见问题

<details>
<summary><strong>和腾讯会议、飞书会议有什么区别？</strong></summary>

它们主要服务线上会议，会后给大家一份纪要。Aplo 主要为会议室里的会做：打开 Mac 就能录，开会时你可以随时问 AI，散会后你自己的 Agent 能直接读这场会。
</details>

<details>
<summary><strong>线上会议能用吗？</strong></summary>

能。在飞书、腾讯会议里开会时，Aplo 同时录电脑里放出来的声音和你的麦克风。
</details>

<details>
<summary><strong>会上问 AI，别人看得到吗？</strong></summary>

看不到。提问和回答只显示在你自己的电脑上。
</details>

<details>
<summary><strong>“按你的方式讲”怎么设置？</strong></summary>

在“设置 → 会中参谋”里，用一段文字写下你希望 AI 扮演的角色和回答方式，比如回答多长、侧重什么。可以随时修改、关闭或恢复默认。
</details>

<details>
<summary><strong>哪些 Agent 能读我的会议？</strong></summary>

Codex、Claude Code 这类支持连接外部工具（MCP）的 Agent。它需要运行在你自己的这台电脑上。
</details>

<details>
<summary><strong>一定要自己申请 API Key 吗？</strong></summary>

不一定。可以用已有的 ChatGPT 订阅登录来当 AI 用，也可以用本机模型，这两种都不需要 Key。
</details>

<details>
<summary><strong>我的会议会被上传吗？</strong></summary>

Aplo 把会议存在你的电脑上（`~/Library/Application Support/aplo`）。如果你选了云端的转写服务，录音会发给那家服务商做转写；你让哪个 AI 读会议，被读到的内容就会发给它。想完全留在本机，转写和 AI 都选本机模型。
</details>

<details>
<summary><strong>在会议室录音，要告诉大家吗？</strong></summary>

要。录音前请告诉在场的人，应用里有一句现成的告知语。
</details>

<details>
<summary><strong>会议室里人多、离得远，转写准吗？</strong></summary>

取决于说话人离 Mac 多远、房间吵不吵，以及你选的转写服务。建议把 Mac 放在桌子中间。不同转写服务效果不同，可以在设置里换着试。
</details>

<details>
<summary><strong>能分享给同事吗？有 Windows 版吗？</strong></summary>

目前是个人使用，要分享可以把纪要导出成 Markdown。暂时只有 Mac（Apple 芯片）版本。
</details>

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
