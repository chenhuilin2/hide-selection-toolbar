# 项目长期记忆 — Hide AI Selection Menu

## 项目性质
油猴脚本，隐藏 AI 对话网页选中文本后弹出的浮动操作菜单。
站点：ChatGPT / 豆包 / 通义千问 / 智谱清言。核心配置是 `hide-ai-selection-menu.js` 里的 `RULES` 数组。

## 约定（改规则前必读）
- `RULES` 每条含 `host`（域名正则）+ `targets`（候选选择器数组）。
- **精度约定**：target 不带 `keywords` → 视为高精度选择器，在 `document-start` 直接注入 CSS 隐藏；
  带 `keywords` → 只能由 JS 逐帧校验后隐藏（会有一帧闪现）。宽泛选择器必须配 `keywords`。
- **keywords 是最易静默失效处**：文案随站点改版变化，`every()` 全包含语义一旦不满足就永远失效。
  主力选择器认准稳定语义标识（`data-*`、`<hash>_selectionPopover` 这类语义后缀），
  keywords 只留给兜底选择器，且尽量只放一项。
- `dom/*.html` 存放各站点菜单的真实 DOM 片段，写选择器时以它为准。

## 验证
- `node test/userscript.test.js` —— 最小 DOM 桩回归测试（无浏览器/无 jsdom）。
- 加站点时：把真实 DOM 存进 `dom/`，在测试 `fixture()` 里照抄一份并补断言，再改代码。
