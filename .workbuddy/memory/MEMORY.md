# 项目长期记忆 — Hide AI Selection Menu

## 项目性质
油猴脚本，隐藏**选中文本后弹出的浮动工具条**。v2.6 起范围从「AI 对话」扩到「AI 对话 + 网页文档」。
- AI 对话：ChatGPT / 豆包 / 通义千问 / 智谱清言 / 文心一言（yiyan + wenxin）/ 讯飞星火
- 网页文档：语雀（`*.yuque.com`，划词的「评论 / 笔记」工具条）

核心配置是 `hide-ai-selection-menu.js` 里的 `RULES` 数组。

## 约定（改规则前必读）
- `RULES` 每条含 `host`（域名正则）+ `targets`（候选选择器数组）。
- **域名要按用户地址栏的真实域名写，不能照产品名推断**：同一个产品常有多个入口域名。
  文心一言就有 `yiyan.baidu.com` 和 `wenxin.baidu.com` 两个入口、服务同一套页面、DOM 一样。
  域名写错时脚本**根本不注入**，现象是「完全没生效」，而不是「偶尔漏一个」；
  这时改选择器全是白费功夫。
  - 排查手法：让用户在页面控制台跑
    `!!document.getElementById('hide-ai-selection-menu-style')`
    —— false 就说明脚本没在该页跑，先查 `@match`/`host`，别碰选择器。
- **精度约定**：target 不带 `keywords` → 视为高精度选择器，在 `document-start` 直接注入 CSS 隐藏；
  带 `keywords` → 只能由 JS 逐帧校验后隐藏（会有一帧闪现）。宽泛选择器必须配 `keywords`。
- **keywords 是最易静默失效处**：文案随站点改版变化，`every()` 全包含语义一旦不满足就永远失效。
  主力选择器认准稳定语义标识（`data-*`、`<hash>_selectionPopover` 这类语义后缀），
  keywords 只留给兜底选择器，且尽量只放一项。
- **反过来的陷阱：纯图标工具条根本没法用 keywords**（语雀的教训）。
  整条只有 `<svg>`、没有文字 → `textContent === ''`，配 keywords 等于让规则永久失效。
  这种情况只能把误伤面压在「模块名 + 语义名」的选择器精度上。**配 guard 前先看一眼 textContent**。
- `dom/*.html` 存放各站点菜单的真实 DOM 片段，写选择器时以它为准。
- **类名取语义段要连模块名前缀一起带**（讯飞星火的教训）：`[class*="CodeWin_quote"]` 可以，
  `[class*="quote"]` 会把输入框里的引用气泡等同名功能元素一起误伤。宁可窄，不要宽。
- **站点没有稳定标识时**（整棵树都是 Tailwind 工具类，无 id / data-* / 语义类名）：
  不要硬凑一个"看起来高精度"的选择器塞进 CSS 层——那是在赌这些工具类不会出现在别处。
  取结构特征（如 `fixed` + `pointer-events-none` + `z-50` 的穿透式浮层写法）+ keywords 走 JS 层，
  且 keywords 只放**品牌名**这类不会改的词，别放菜单项文案。

## 各站点锚点现状
- ChatGPT：旧版 `[class*="selectionPopover"]`（CSS 层，A/B 兜底）；
  2026-11 新结构 `div.pointer-events-none.fixed.z-50` + keywords `['ChatGPT']`（JS 层）。
- 文心一言/文心：`[data-testid="selection-bar"]`（CSS 层）+ 兜底 `[class*="chat-selection-bar"]`。
- 讯飞星火：`[class*="CodeWin_quote"]`（CSS 层）。
- 语雀：两个场景两条工具条，都无文字、都走 CSS 层。
  - 阅读态：`[class*="wording-tooltip-module_toolTipContent"]` + 兜底 `[class*="wording-tooltip-module"]`
  - 编辑态：`[class*="ne-select-helper-toolbar"]`（**不能**用同元素上的通用类 `ne-card-toolbar`，
    块级工具栏也挂那个类）
  - 反例两个：`editor-tooltip-module_toolTipContent__k2P9a`（同语义名不同模块）、
    `ne-card-toolbar` 单独出现（块级工具栏）。
- **NE 设计系统的类名不是 CSS Module、没有哈希**（`ne-icon`、`ne-card-toolbar` 这类 BEM 风格），
  比哈希类名稳定得多，但一个元素常挂多个类名，必须挑限定名。
- 腾讯文档：`[class*="float-toolbar_container"]`（CSS 层）。
  **必须带 `float` 这个限定词**——顶部固定菜单栏也挂 `toolbar_container__3r-Et`，
  只认它就等于把整个顶部菜单干掉。反例：不带 `float-toolbar` 的 `toolbar_container`。
  容器内还有一份 `toolbar_hidden__2I957` 的量宽副本，会被一起隐藏（无可见副作用）。

## 验证
- `node test/userscript.test.js` —— 最小 DOM 桩回归测试（无浏览器/无 jsdom），按站点分块，当前 65 项断言。
- 加站点时：把真实 DOM 存进 `dom/`，在测试里加一个 `xxxFixture()` 并在 `run(hostname, fixture)` 后补断言，再改代码。
  同产品的每个入口域名都要用同一个 fixture 各跑一遍。
- 桩必须支持脚本会用到的全部选择器形态：`=` / `*=` / `^=` / `$=` / 存在性属性选择器、复合多类、逗号分组。
  漏掉任何一种都会让规则"看起来失效"，而问题其实在桩上。
- `run()` 返回 `{ css, tick, started }`：站点没匹配上时脚本提前 return，`tick` 兜底为空函数（**别让它崩掉整个套件**），
  是否真的跑起来用 `started` 断言。
- 每个站点除正例外要留**反例**：既要有"同名容器但文本不含 keywords"的，也要有
  "同名功能元素但模块前缀不同"的（后者守住选择器不被放宽）。
- 改完规则必须做**反向验证**：把选择器故意改坏/改宽，确认测试真的报错，否则绿灯不算数。

## Git 注意事项
- 仓库 `core.ignorecase = true`（Windows）。**README 文件名固定用大写 `README.md`**：
  一旦远端/本地同时出现 `readme.md` 和 `README.md`，merge 会在索引里塞进两条记录，
  而文件系统不区分大小写，小写那份会直接覆盖大写文件的内容。
  修法：`git rm --cached readme.md` → `git show HEAD:README.md > README.md` → `git add` → `git commit --amend --no-edit`。
- 仓库是**公开**的（github.com/chenhuilin2/hide-ai-selection-menu）。`.gitignore` 已被删除，
  但 `.workbuddy/memory/*` 与 `test/userscript.test.js` **早已被跟踪**，仍会随提交推到公开仓库；
  要让 `.workbuddy` 退出公开仓库需 `git rm -r --cached .workbuddy`（用户尚未决定）。
  写 memory 时注意：**假设这些笔记会公开可见**，别记敏感信息。
