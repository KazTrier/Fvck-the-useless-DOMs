# 菜单精简器

> 隐藏酒馆中的无用元素，让你的展开菜单变得清爽

> 再见了，所有的无用按钮👋

## 现在的功能有

- 测试按钮和扩展面板下`已弃用的API`部分默认隐藏
- 左下菜单，魔棒，顶栏，扩展面板可隐藏和重排序，扩展面板可切换单双栏
- **预设面板只列当前后端用得到的东西**：Kobold / NovelAI / Text Completion 的预设栏与采样栏在切到对应后端时才出现，其余情况不占位
- 用户设置区域可分块隐藏与可选折叠
- **世界书面板**按真实工具栏逐块隐藏（8 组：标题栏 / 多选器 / 全局激活 / 条目管理 ×2 / 搜索排序 / 列表工具 / 条目列表）
- **高级格式化**三栏（上下文模板 / Instruct / 系统提示词）可分块隐藏
- QR区域可隐藏按钮与折叠
- 以及隐藏其他一切你不想看见的东西

## 开始使用

- 确保你安装了 [酒馆助手](https://github.com/N0VI028/JS-Slash-Runner)
- 然后从本仓库的 [`dist/酒馆助手脚本-菜单精简器.json`](https://github.com/KazTrier/Fvck-the-useless-DOMs/blob/main/dist/酒馆助手脚本-菜单精简器.json) 下载脚本
- 在酒馆助手中导入脚本，随后在左下角魔棒菜单里打开操作面板
- 本插件入口也可以隐藏，隐藏后可在输入框使用`/menucleaner`命令打开操作面板
- 如果发生某种情况让你无法与扩展面板互动了，使用 `/menucleanerdisable`禁用插件
- **大家一起开心的玩吧**

## TauriTavern 用户请读这段

TauriTavern 有「Panel Runtime」档位（设置项 `tauritavern-settings.panel_runtime_profile`，默认 `off`）。
把它调到 `compat` / `aggressive` 后，宿主会把收起状态的抽屉内容从文档里摘走（parking），
插件的选择器就查不到节点了。表现是**某些板块整块看不见**，最典型的是：

| 现象 | 被摘走的节点 | 对应 slot |
| --- | --- | --- |
| 预设板块条目变少 | `#left-nav-panel .scrollableInner` | `panel:left-nav-panel` |
| 用户设置扫不到 | `#user-settings-block-content` | `panel:user-settings-block` |
| 世界书面板扫不到 | `#wi-holder` | `panel:WorldInfo` |
| 高级格式化扫不到 | `#AdvancedFormatting .flex-container.spaceEvenly` | `panel:AdvancedFormatting` |
| 扩展设置扫不到 | 各 `.extension_container` 的子节点 | `tt:gate:rm_extensions_block:extension_containers` |

本版在扫描前会自动调用宿主的 `__TAURITAVERN_PANEL_RUNTIME__.setVisible(slot, true)` + `reconcile()` 把节点接回来，
接回后立刻复位，抽屉不会自己弹开。如果仍有板块缺失，**先手动点开一次那个抽屉**再打开管理面板即可。

## 更新记录

### 1018.2.0 / M22

- **按当前后端过滤**：`changeMainAPI()` 用内联 `display:none` 隐藏非当前后端的预设栏/采样栏，插件据此跳过这些锚点。Chat Completion 下预设面板由 16 项收敛到 9 项，切到 NovelAI 自动换成 NovelAI 的 5 项
- `#range_block_novel` 从 OpenAI 的「上下文长度及备选回复」里拆出，不再跨后端连带隐藏
- 水合去重：接回前先探测目标是否已在文档里，稳态下 `applyAll` 不再调用宿主的 `reconcile()`（修复前每次 5 次）
- 未知 slot 加负缓存，不再每次 `applyAll` 白试并刷 warn
- `suppressObserver` 12 处裸置位统一改为 `setSuppress()`，带 100ms 看门狗，异常不再永久静默 observer
- `clearGroup` 还原栏位改用 `insertBefore` 尽量保住原生顺序，且仅在真发生还原时才复位右栏 `display`
- 世界书由 9 组收拢为 8 组：「新建条目」并入条目管理，`展开/收起/回填/刷新/分页` 合并为「列表工具」

### 1018.1.0 / M21

- 预设面板补齐全区域覆盖：`#respective-presets-block` 四个预设切换栏、`#common-gen-settings-block`（响应长度 / 上下文 / 提示词花费）、`#ai_module_block_novel`、`#range_block_novel`、`#kobold_api-settings` / `#novel_api-settings` / `#textgenerationwebui_api-settings`、`#completion_prompt_manager` 全部纳入；OpenAI 高级区区间由 `3..13` 扩到真实末尾 `3..15`（补回 Verbosity、Assistant Prefill）
- 世界书面板由 5 组细化到 9 组，锚点从 nth-child 换成真实静态 id（`#world_create_button`、`#world_popup_export`、`#world_info_sort_order`、`#world_backfill_memos` …）
- 移除「背景面板」「角色面板」两个分组及其停放 slot

### 1018.0.0 / M20

- 新增四块面板覆盖：世界书、高级格式化、背景、角色面板
- 修复自定义 Selector 在受管条目上完全失效（隐藏类拆分为 `mc3-gone`，不再被分组显隐擦除）
- 修复「恢复此组 / 全部恢复」不还原扩展面板左右栏位
- 修复原生栏位快照时机（改为插件动手之前记录）
- 修复消息按钮在缺少省略号收纳结构时整组静默失效
- 补 `display:contents` 容器下扩展面板条目的隐藏权重
- 拖拽增加 4px 阈值与 `pointercancel` 收尾，纯点击不再误触发排序
- 管理面板重建时保留滚动位置与键盘焦点
- `escHtml` 支持数字与单引号；子分组 id 统一走属性转义
- 设置加载改深拷贝，容器型字段补类型校验
- observer 容器集合剪枝、`body` 深层监听、重复注入单例保护

### 1017.0.0 / M19

- 修复 TauriTavern Panel Runtime 停放导致的三处扫描空缺（扩展设置 / 用户设置 / 预设）
- QR 面板按钮在弹出（popout）模式下扫不到的兜底
