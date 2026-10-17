# 菜单精简器

> 隐藏酒馆中的无用元素，让你的展开菜单变得清爽

> 再见了，所有的无用按钮👋

## 现在的功能有

- 测试按钮和扩展面板下`已弃用的API`部分默认隐藏
- 左下菜单，魔棒，顶栏，扩展面板可隐藏和重排序，扩展面板可切换单双栏
- **预设面板只列当前后端用得到的东西**：Kobold / NovelAI / Text Completion 的预设栏与采样栏在切到对应后端时才出现，其余情况不占位
- 用户设置区域可分块隐藏与可选折叠
- **世界书面板**按真实工具栏逐块隐藏（18 组：标题行 / 激活参数折叠栏 / 多选器 / 全局激活 ×5 / 世界书操作 ×2 / 条目工具条 ×7）
- **世界书·条目编辑器**分 18 组（关键字 / 条目级参数 / 内容与分组 / 筛选与递归），只作用于已展开的条目，不碰模板
- **高级格式化**三栏（上下文模板 / Instruct / 系统提示词）可分块隐藏
- QR区域可隐藏按钮与折叠
- 面板顶部有筛选框，可按名称过滤，也可切「仅看已启用」
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

### 1021.0.0 / M25

这一版是「把每一个开关都验一遍」的结果：建了一套锚点审计（判据不是「选择器能命中」，而是「隐藏后屏幕上确实少东西」），把所有分组过了一遍，只挑出四条真问题——但它们确实是问题。

- **修「世界书 · 标题栏」藏了没反应**：原来锚的是 `#WorldInfoheader`，而它是 `<div class="fa-solid fa-grip drag-grabber">` —— 一个空的拖拽手柄，藏了看不出任何变化。改成两条真实可见的项：
  - 「标题行（Worlds / Lorebooks）」
  - 「激活参数折叠栏（Scan Depth / Budget / Min Activations）」
- **删掉「世界书 · 条目列表（整块隐藏）」**：它是**容器**不是开关。藏掉它等于让「条目编辑器」那一页同时失去全部对象 —— 一个开关打穿两页。容器不该出现在开关列表里
- **修「深度 / 顺序 / 概率」认错元素**：原来的锚点 `.world_entry_edit .wi-enter-footer-text` 在真实 DOM 里只命中 1 个 —— 正好是「概率与选择性开关」那一列，也就是两个开关打同一块地方，而真正的 Position / Depth / Order / Trigger% 一行都没罩到。改成 `div.world_entry_form_control.wi-enter-footer-text`，现在命中 4 行
- **「条目正文编辑区」与「递归控制」不再互相踩**：那 4 个递归复选框（不可递归 / 防止递归 / 延迟到递归 / 无视预算）就长在正文那一行的 `<label>` 里，物理上是父子关系。合并成一条「正文编辑区（含 4 个递归开关）」，不再出现「藏了父项、子项变哑巴」
- **条目编辑器只作用于已展开的条目**：新增分组级 `scope`，锚点必须落在 `#world_popup_entries_list` 内。模板 `#entry_edit_template` **永不写类** —— 它会被 `cloneNode(true)` 复制给之后新建的每一个条目，插件一旦卸载，隐藏类会永久留在模板里，属于不可逆残留
- **面板顶部加筛选**：按名称过滤 + 「仅看已启用」。过滤是纯 DOM 可见性切换，不重建列表，所以输入法、光标、滚动都不会被打断
- 标签兜底补 `data-i18n`：静态 HTML 里不少按钮只有 `data-i18n` 属性、没有文本，运行时才注入，之前开面板第一眼是空白行
- 建立环境矩阵回归（`off / compat / aggressive` × 抽屉开合 × QR 形态 × 后端 × 有无条目 = 48 格），每格校验：compat 水合后条数与 off 完全一致、无重复元素、无同页父子重叠、模板零污染

### 1020.0.0 / M24

- **世界书面板重排**：8 组 → 18 组，按功能区拆开，不再出现「想单独藏搜索框得连排序一起藏」这种憋屈
  - 全局激活：扫描深度 / 上下文预算 / 高级门槛（预算上限·最小激活·最大深度·最大递归步数）/ 插入策略 / 全局开关，各自独立
  - 世界书操作：新建与编辑选择 / 导入 / 导出·重命名·复制·删除
  - 条目工具条：新建条目 / 展开收起全部 / 批量维护 / 搜索框 / 排序方式 / 刷新 / 分页，各自独立
- 去掉最后一个 `nth-child` 锚点（`#wiTopBlock > div:nth-child(2)`），滑块类控件改成「命中 input 再 closest 到它那一行」
- 空壳收拢认 `.menu_button`：酒馆的按钮是 `div.menu_button` 不是 `<button>`，之前整条工具条全藏光也不会收起来
- 修了一个自我锁死：`isRowEmpty` 早退条件从 `mc3-hidden || mc3-gone` 收窄成 `mc3-hidden`，否则整条工具条收起后永远回不来

### 1019.0.0 / M23

- **删掉重复项**：「提示词管理器」管的是「预设条目」那个 range-block 的子节点，两个开关打同一块区域，已合并
- **新增「世界书·条目编辑器」页**：按控件粒度拆成 20 组，锚点全部走 `name` 属性再上溯排版容器（不用 `nth-child`，酒馆改版时它只会静默错位），拆分粒度参考 cocktail 的 `modules/worldinfo-panel-slim.js`
  - 关键字类：主关键字与逻辑 / 可选过滤器
  - 条目级参数：出口名 / 扫描深度 / 区分大小写 / 完整单词 / 组评分 / 自动化 ID / 递归等级
  - 内容与分组：正文编辑区 / 包含组 / 组权重 / 粘性 / 冷却 / 延迟
  - 筛选与递归：绑定角色或标签 / 筛选生成触发器 / 递归控制 4 连 / 概率与选择性开关
- **空壳收拢**：一整行控件全被藏掉时，这一行连同父块一起收起来，不再留一排空白和分割线（思路同 cocktail 的 `applyCompactVisibility`）
  - 修了一个自己踩的坑：判断「这行是不是空的」时上溯必须停在当前行之前，否则上一轮的 `mc3-gone` 会被当成「里面的控件都藏了」，行永远自我维持，恢复分组也不回来

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
