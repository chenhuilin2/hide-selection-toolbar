// ==UserScript==
// @name         AI 对话网页隐藏选中文本菜单
// @namespace    https://chatgpt.com/
// @version      2.8
// @description  隐藏 AI 对话页（ChatGPT / 豆包 / 通义千问 / 智谱清言 / 文心一言 / 讯飞星火）与网页文档（语雀 / 腾讯文档）中选中文字后弹出的浮动工具条
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://*.doubao.com/*
// @match        https://*.qianwen.com/*
// @match        https://*.tongyi.com/*
// @match        https://tongyi.aliyun.com/*
// @match        https://*.chatglm.cn/*
// @match        https://yiyan.baidu.com/*
// @match        https://wenxin.baidu.com/*
// @match        https://xinghuo.xfyun.cn/*
// @match        https://*.yuque.com/*
// @match        https://docs.qq.com/*
// @run-at       document-start
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHJva2Utd2lkdGg9IjEuNSIgY2xhc3M9ImgtNiB3LTYiIHJvbGU9ImltZyI+PHRpdGxlPkNoYXRHUFQ8L3RpdGxlPjx0ZXh0IHg9Ii05OTk5IiB5PSItOTk5OSI+Q2hhdEdQVDwvdGV4dD48cGF0aCBkPSJNMzcuNTMyNCAxNi44NzA3QzM3Ljk4MDggMTUuNTI0MSAzOC4xMzYzIDE0LjA5NzQgMzcuOTg4NiAxMi42ODU5QzM3Ljg0MDkgMTEuMjc0NCAzNy4zOTM0IDkuOTEwNzYgMzYuNjc2IDguNjg2MjJDMzUuNjEyNiA2LjgzNDA0IDMzLjk4ODIgNS4zNjc2IDMyLjAzNzMgNC40OTg1QzMwLjA4NjQgMy42Mjk0MSAyNy45MDk4IDMuNDAyNTkgMjUuODIxNSAzLjg1MDc4QzI0Ljg3OTYgMi43ODkzIDIzLjcyMTkgMS45NDEyNSAyMi40MjU3IDEuMzYzNDFDMjEuMTI5NSAwLjc4NTU3NSAxOS43MjQ5IDAuNDkxMjY5IDE4LjMwNTggMC41MDAxOTdDMTYuMTcwOCAwLjQ5NTA0NCAxNC4wODkzIDEuMTY4MDMgMTIuMzYxNCAyLjQyMjE0QzEwLjYzMzUgMy42NzYyNCA5LjM0ODUzIDUuNDQ2NjYgOC42OTE3IDcuNDc4MTVDNy4zMDA4NSA3Ljc2Mjg2IDUuOTg2ODYgOC4zNDE0IDQuODM3NyA5LjE3NTA1QzMuNjg4NTQgMTAuMDA4NyAyLjczMDczIDExLjA3ODIgMi4wMjgzOSAxMi4zMTJDMC45NTY0NjQgMTQuMTU5MSAwLjQ5ODkwNSAxNi4yOTg4IDAuNzIxNjk4IDE4LjQyMjhDMC45NDQ0OTIgMjAuNTQ2NyAxLjgzNjEyIDIyLjU0NDkgMy4yNjggMjQuMTI5M0MyLjgxOTY2IDI1LjQ3NTkgMi42NjQxMyAyNi45MDI2IDIuODExODIgMjguMzE0MUMyLjk1OTUxIDI5LjcyNTYgMy40MDcwMSAzMS4wODkyIDQuMTI0MzcgMzIuMzEzOEM1LjE4NzkxIDM0LjE2NTkgNi44MTIzIDM1LjYzMjIgOC43NjMyMSAzNi41MDEzQzEwLjcxNDEgMzcuMzcwNCAxMi44OTA3IDM3LjU5NzMgMTQuOTc4OSAzNy4xNDkyQzE1LjkyMDggMzguMjEwNyAxNy4wNzg2IDM5LjA1ODcgMTguMzc0NyAzOS42MzY2QzE5LjY3MDkgNDAuMjE0NCAyMS4wNzU1IDQwLjUwODcgMjIuNDk0NiA0MC40OTk4QzI0LjYzMDcgNDAuNTA1NCAyNi43MTMzIDM5LjgzMjEgMjguNDQxOCAzOC41NzcyQzMwLjE3MDQgMzcuMzIyMyAzMS40NTU2IDM1LjU1MDYgMzIuMTExOSAzMy41MTc5QzMzLjUwMjcgMzMuMjMzMiAzNC44MTY3IDMyLjY1NDcgMzUuOTY1OSAzMS44MjFDMzcuMTE1IDMwLjk4NzQgMzguMDcyOCAyOS45MTc4IDM4Ljc3NTIgMjguNjg0QzM5Ljg0NTggMjYuODM3MSA0MC4zMDIzIDI0LjY5NzkgNDAuMDc4OSAyMi41NzQ4QzM5Ljg1NTYgMjAuNDUxNyAzOC45NjM5IDE4LjQ1NDQgMzcuNTMyNCAxNi44NzA3Wk0yMi40OTc4IDM3Ljg4NDlDMjAuNzQ0MyAzNy44ODc0IDE5LjA0NTkgMzcuMjczMyAxNy42OTk0IDM2LjE1MDFDMTcuNzYwMSAzNi4xMTcgMTcuODY2NiAzNi4wNTg2IDE3LjkzNiAzNi4wMTYxTDI1LjkwMDQgMzEuNDE1NkMyNi4xMDAzIDMxLjMwMTkgMjYuMjY2MyAzMS4xMzcgMjYuMzgxMyAzMC45Mzc4QzI2LjQ5NjQgMzAuNzM4NiAyNi41NTYzIDMwLjUxMjQgMjYuNTU0OSAzMC4yODI1VjE5LjA1NDJMMjkuOTIxMyAyMC45OThDMjkuOTM4OSAyMS4wMDY4IDI5Ljk1NDEgMjEuMDE5OCAyOS45NjU2IDIxLjAzNTlDMjkuOTc3IDIxLjA1MiAyOS45ODQyIDIxLjA3MDcgMjkuOTg2NyAyMS4wOTAyVjMwLjM4ODlDMjkuOTg0MiAzMi4zNzUgMjkuMTk0NiAzNC4yNzkxIDI3Ljc5MDkgMzUuNjg0MUMyNi4zODcyIDM3LjA4OTIgMjQuNDgzOCAzNy44ODA2IDIyLjQ5NzggMzcuODg0OVpNNi4zOTIyNyAzMS4wMDY0QzUuNTEzOTcgMjkuNDg4OCA1LjE5NzQyIDI3LjcxMDcgNS40OTgwNCAyNS45ODMyQzUuNTU3MTggMjYuMDE4NyA1LjY2MDQ4IDI2LjA4MTggNS43MzQ2MSAyNi4xMjQ0TDEzLjY5OSAzMC43MjQ4QzEzLjg5NzUgMzAuODQwOCAxNC4xMjMzIDMwLjkwMiAxNC4zNTMyIDMwLjkwMkMxNC41ODMgMzAuOTAyIDE0LjgwODggMzAuODQwOCAxNS4wMDczIDMwLjcyNDhMMjQuNzMxIDI1LjExMDNWMjguOTk3OUMyNC43MzIxIDI5LjAxNzcgMjQuNzI4MyAyOS4wMzc2IDI0LjcxOTkgMjkuMDU1NkMyNC43MTE1IDI5LjA3MzYgMjQuNjk4OCAyOS4wODkzIDI0LjY4MjkgMjkuMTAxMkwxNi42MzE3IDMzLjc0OTdDMTQuOTA5NiAzNC43NDE2IDEyLjg2NDMgMzUuMDA5NyAxMC45NDQ3IDM0LjQ5NTRDOS4wMjUwNiAzMy45ODExIDcuMzg3ODUgMzIuNzI2MyA2LjM5MjI3IDMxLjAwNjRaTTQuMjk3MDcgMTMuNjE5NEM1LjE3MTU2IDEyLjA5OTggNi41NTI3OSAxMC45MzY0IDguMTk4ODUgMTAuMzMyN0M4LjE5ODg1IDEwLjQwMTMgOC4xOTQ5MSAxMC41MjI4IDguMTk0OTEgMTAuNjA3MVYxOS44MDhDOC4xOTM1MSAyMC4wMzc4IDguMjUzMzQgMjAuMjYzOCA4LjM2ODIzIDIwLjQ2MjlDOC40ODMxMiAyMC42NjE5IDguNjQ4OTMgMjAuODI2NyA4Ljg0ODYzIDIwLjk0MDRMMTguNTcyMyAyNi41NTQyTDE1LjIwNiAyOC40OTc5QzE1LjE4OTQgMjguNTA4OSAxNS4xNzAzIDI4LjUxNTUgMTUuMTUwNSAyOC41MTczQzE1LjEzMDcgMjguNTE5MSAxNS4xMTA3IDI4LjUxNiAxNS4wOTI0IDI4LjUwODJMNy4wNDA0NiAyMy44NTU3QzUuMzIxMzUgMjIuODYwMSA0LjA2NzE2IDIxLjIyMzUgMy41NTI4OSAxOS4zMDQ2QzMuMDM4NjIgMTcuMzg1OCAzLjMwNjI0IDE1LjM0MTMgNC4yOTcwNyAxMy42MTk0Wk0zMS45NTUgMjAuMDU1NkwyMi4yMzEyIDE0LjQ0MTFMMjUuNTk3NiAxMi40OTgxQzI1LjYxNDIgMTIuNDg3MiAyNS42MzMzIDEyLjQ4MDUgMjUuNjUzMSAxMi40Nzg3QzI1LjY3MjkgMTIuNDc2OSAyNS42OTI4IDEyLjQ4MDEgMjUuNzExMSAxMi40ODc5TDMzLjc2MzEgMTcuMTM2NEMzNC45OTY3IDE3Ljg0OSAzNi4wMDE3IDE4Ljg5ODIgMzYuNjYwNiAyMC4xNjEzQzM3LjMxOTQgMjEuNDI0NCAzNy42MDQ3IDIyLjg0OSAzNy40ODMyIDI0LjI2ODRDMzcuMzYxNyAyNS42ODc4IDM2LjgzODIgMjcuMDQzMiAzNS45NzQzIDI4LjE3NTlDMzUuMTEwMyAyOS4zMDg2IDMzLjk0MTUgMzAuMTcxNyAzMi42MDQ3IDMwLjY2NDFDMzIuNjA0NyAzMC41OTQ3IDMyLjYwNDcgMzAuNDczMyAzMi42MDQ3IDMwLjM4ODlWMjEuMTg4QzMyLjYwNjYgMjAuOTU4NiAzMi41NDc0IDIwLjczMjggMzIuNDMzMiAyMC41MzM4QzMyLjMxOSAyMC4zMzQ4IDMyLjE1NCAyMC4xNjk4IDMxLjk1NSAyMC4wNTU2Wk0zNS4zMDU1IDE1LjAxMjhDMzUuMjQ2NCAxNC45NzY1IDM1LjE0MzEgMTQuOTE0MiAzNS4wNjkgMTQuODcxN0wyNy4xMDQ1IDEwLjI3MTJDMjYuOTA2IDEwLjE1NTQgMjYuNjgwMyAxMC4wOTQzIDI2LjQ1MDQgMTAuMDk0M0MyNi4yMjA2IDEwLjA5NDMgMjUuOTk0OCAxMC4xNTU0IDI1Ljc5NjMgMTAuMjcxMkwxNi4wNzI2IDE1Ljg4NThWMTEuOTk4MkMxNi4wNzE1IDExLjk3ODMgMTYuMDc1MyAxMS45NTg1IDE2LjA4MzcgMTEuOTQwNUMxNi4wOTIxIDExLjkyMjUgMTYuMTA0OCAxMS45MDY4IDE2LjEyMDcgMTEuODk0OUwyNC4xNzE5IDcuMjUwMjVDMjUuNDA1MyA2LjUzOTAzIDI2LjgxNTggNi4xOTM3NiAyOC4yMzgzIDYuMjU0ODJDMjkuNjYwOCA2LjMxNTg5IDMxLjAzNjQgNi43ODA3NyAzMi4yMDQ0IDcuNTk1MDhDMzMuMzcyMyA4LjQwOTM5IDM0LjI4NDIgOS41Mzk0NSAzNC44MzM0IDEwLjg1MzFDMzUuMzgyNiAxMi4xNjY3IDM1LjU0NjQgMTMuNjA5NSAzNS4zMDU1IDE1LjAxMjhaTTE0LjI0MjQgMjEuOTQxOUwxMC44NzUyIDE5Ljk5ODFDMTAuODU3NiAxOS45ODkzIDEwLjg0MjMgMTkuOTc2MyAxMC44MzA5IDE5Ljk2MDJDMTAuODE5NSAxOS45NDQxIDEwLjgxMjIgMTkuOTI1NCAxMC44MDk4IDE5LjkwNThWMTAuNjA3MUMxMC44MTA3IDkuMTgyOTUgMTEuMjE3MyA3Ljc4ODQ4IDExLjk4MTkgNi41ODY5NkMxMi43NDY2IDUuMzg1NDQgMTMuODM3NyA0LjQyNjU5IDE1LjEyNzUgMy44MjI2NEMxNi40MTczIDMuMjE4NjkgMTcuODUyNCAyLjk5NDY0IDE5LjI2NDkgMy4xNzY3QzIwLjY3NzUgMy4zNTg3NiAyMi4wMDg5IDMuOTM5NDEgMjMuMTAzNCA0Ljg1MDY3QzIzLjA0MjcgNC44ODM3OSAyMi45MzcgNC45NDIxNSAyMi44NjY4IDQuOTg0NzNMMTQuOTAyNCA5LjU4NTE3QzE0LjcwMjUgOS42OTg3OCAxNC41MzY2IDkuODYzNTYgMTQuNDIxNSAxMC4wNjI2QzE0LjMwNjUgMTAuMjYxNiAxNC4yNDY2IDEwLjQ4NzcgMTQuMjQ3OSAxMC43MTc1TDE0LjI0MjQgMjEuOTQxOVpNMTYuMDcxIDE3Ljk5OTFMMjAuNDAxOCAxNS40OTc4TDI0LjczMjUgMTcuOTk3NVYyMi45OTg1TDIwLjQwMTggMjUuNDk4M0wxNi4wNzEgMjIuOTk4NVYxNy45OTkxWiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+PC9zdmc+
// @license MIT
// ==/UserScript==

(function () {
    'use strict';

    // 每个站点一条规则：
    //   host    仅在该域名下生效的正则
    //   targets 菜单容器的候选选择器数组
    //     selector  必填，CSS 选择器
    //     keywords  可选。容器文本必须**同时**包含这些关键词才算命中，
    //               用于选择器偏宽时的二次校验（如 CSS Module 类名前缀）
    //
    // 精度约定（重要）：
    //   没有 keywords 的 target 视为「高精度选择器」，会在 document-start
    //   阶段直接写进 CSS 隐藏 —— 抢在首帧之前，且页面重写行内 style 也冲不掉；
    //   带 keywords 的 target 只能由 JS 逐帧校验后隐藏，会有一帧的闪现。
    //   所以宽泛选择器（如 [class*="menu"]）务必配上 keywords。
    //
    // ⚠️ keywords 里的文案会随站点改版变化。ChatGPT 的菜单项改版后只剩
    //    「询问 ChatGPT / 分享所选内容」，原来的 keywords.every() 判定永远
    //    失败、规则静默失效。主力选择器请认准稳定的语义标识，keywords
    //    只留给兜底选择器加保险。
    //
    // ⚠️ 反过来也成立：整条工具条只有图标、没有任何文字时（如语雀），
    //    textContent 恒为空，配 keywords 等于让规则永久失效。这种情况
    //    只能把误伤面压在「模块名 + 语义名」的选择器精度上。
    const RULES = [
        {
            // ChatGPT
            host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/,
            targets: [
                // 旧版浮层（改版后仍可能被 A/B 命中）。类名形如 `<hash>_selectionPopover`：
                // 语义后缀稳定 → 走进 CSS 层，那一批用户彻底不闪现。
                { selector: '[class*="selectionPopover"]' },

                // 2026-11 改版后的新浮层：整棵树都是 Tailwind 工具类，
                // 没有 id、没有 data-*、也没有 `xxx_selectionPopover` 这类语义类名。
                // 唯一可用的结构特征只剩「fixed + pointer-events-none + z-50」
                // 这组穿透式浮层的写法 —— 但它在页面上并不唯一（悬浮提示也是这套），
                // 所以必须配 keywords 做二次校验，否则会把别处的 tooltip 一起隐藏。
                //
                // keywords 只取品牌名「ChatGPT」：按钮文案已经改过一轮
                //（「询问 ChatGPT / 分享所选内容」→「向 ChatGPT 提问」），
                // 只有品牌名是它不会改的部分。宁可短，不要长。
                { selector: 'div.pointer-events-none.fixed.z-50', keywords: ['ChatGPT'] },

                // 更早版本的兜底：内层容器 + 菜单项文案
                { selector: 'div.shadow-long.flex.overflow-hidden.rounded-xl', keywords: ['询问 ChatGPT'] }
            ]
        },
        {
            // 豆包
            host: /(^|\.)doubao\.com$/,
            targets: [
                // 官方留的标记属性，最稳定
                { selector: '[data-word-selection-toolbar]' },
                // 兜底：CSS Module 类名哈希会变，但前缀一般保留
                { selector: '[class*="toolContainer-"]', keywords: ['复制', '朗读'] }
            ]
        },
        {
            // 通义千问
            host: /(^|\.)(qianwen\.com|tongyi\.com)$|^tongyi\.aliyun\.com$/,
            targets: [
                { selector: '[class*="selection-menu"]', keywords: ['引用', '复制'] }
            ]
        },
        {
            // 智谱清言
            host: /(^|\.)chatglm\.cn$/,
            targets: [
                { selector: '[class*="button-mask"]', keywords: ['引用'] }
            ]
        },
        {
            // 文心一言 / 文心助手（百度）
            // 同一套页面有两个入口域名：yiyan 与 wenxin。
            // 起初只写了 yiyan，用户实际在用的 wenxin.baidu.com 上脚本压根不注入，
            // 选择器写得再准也白搭 —— 加站点时务必按地址栏的真实域名来，别照着产品名猜。
            host: /(^|\.)(yiyan|wenxin)\.baidu\.com$/,
            targets: [
                // 官方留的测试属性，最稳定 → 走 CSS 层。
                // 外层容器由页面写行内 inset 定位，页面重写 style 也冲不掉它。
                { selector: '[data-testid="selection-bar"]' },
                // 兜底：CSS Module 哈希（_17n4z_）会随构建变化，语义段一般保留
                { selector: '[class*="chat-selection-bar"]', keywords: ['引用', '复制'] }
            ]
        },
        {
            // 讯飞星火
            host: /(^|\.)xinghuo\.xfyun\.cn$/,
            targets: [
                // 引用工具栏。类名形如 `CodeWin_quote__02wVL`：
                // 模块名 CodeWin + 语义名 quote 稳定，末尾哈希随构建变化。
                // 只认到语义段、不带哈希 → 哈希怎么变换都命中，且走 CSS 层。
                // 刻意不放到 `[class*="quote"]`：那样会连输入框里的引用气泡
                // （InputArea_quoteBox__xxx 之类）一起误伤，模块名前缀是关键。
                { selector: '[class*="CodeWin_quote"]' }
            ]
        },
        {
            // 语雀文档（yuque.com）
            // 两个场景各有一条工具条，都是划词后弹出、都只有图标没有文字：
            //   阅读态 → 「评论 / 笔记」（wording-tooltip-module）
            //   编辑态 → 「AI 写作 / 评论」（ne-select-helper-toolbar）
            //
            // ⚠️ 这些工具条里只有 <svg> 图标，**没有任何文字**，textContent 恒为空。
            //    所以 keywords 在这里天然失效（includes 永远不成立，配了就等于让规则自杀），
            //    误伤面只能靠选择器精度兜住 —— 这也是为什么阅读态那条要取到
            //    「模块名 + 语义名」全段，而不是 [class*="toolTipContent"]：
            //    页面别处同样有 tooltip，只认语义名会一并隐藏。
            host: /(^|\.)yuque\.com$/,
            targets: [
                { selector: '[class*="wording-tooltip-module_toolTipContent"]' },
                // 兜底：只留模块名。toolTipContent 这层若改叫别的，模块前缀通常还在。
                // 该模块只承载这一个划词提示，整体隐藏同样只影响它。
                { selector: '[class*="wording-tooltip-module"]' },

                // 编辑态工具条。类名是 `ne-card-toolbar ne-select-helper-toolbar` 两个一起挂。
                // ⚠️ 只认 ne-select-helper-toolbar 这个限定名，**不能写 ne-card-toolbar**：
                //    后者是通用类，块级悬浮工具栏（段落左侧那套拖拽/复制/删除）同样在用，
                //    按它写会把编辑器的正常功能一起干掉。
                { selector: '[class*="ne-select-helper-toolbar"]' }
            ]
        },
        {
            // 腾讯文档（docs.qq.com）编辑态：选中文字后的浮动格式工具栏
            // （AI编辑 / 字号 / 加粗 / 斜体 / 下划线 / 颜色 …）。
            //
            // 结构：div.float-toolbar_container__zdDax
            //         └ div[role="toolbar"]
            //             ├ .toolbar-container.toolbar_container__3r-Et.toolbar_hidden__2I957  ← 量宽度用的隐藏副本
            //             └ .toolbar-container.toolbar_container__3r-Et                      ← 真正显示的那个
            //
            // ⚠️ 锚点必须带 float 这个限定词：顶部固定菜单栏也挂
            //    toolbar-container / toolbar_container__3r-Et，只认 toolbar_container
            //    会把整个顶部菜单一起隐藏 —— 那是编辑器的核心入口，不是"少显示一条"，
            //    而是"没法正常用"。这和语雀 ne-card-toolbar 是同一类坑。
            //
            // 隐藏整个 float-toolbar_container 时，那份 toolbar_hidden 量宽副本会一起消失。
            // 它的宽度算出来是 0，但工具栏本来就被我们藏了，不影响可见结果。
            host: /^docs\.qq\.com$/,
            targets: [
                { selector: '[class*="float-toolbar_container"]' }
            ]
        }
    ];

    const rules = RULES.filter(rule => rule.host.test(location.hostname));
    if (rules.length === 0) return;

    // ---- CSS 层：抢在首帧渲染之前隐藏高精度选择器命中的菜单 ----
    // 页面重写浮层行内 style（锚点偏移等）冲掉 display:none 的情况，也由它兜住。
    // 每条选择器单独成一块规则：CSS 的逗号列表里只要有一个选择器不被支持，
    // 整条规则都会被丢弃，导致所有规则一起失效。
    const cssText = rules
        .reduce((list, rule) => list.concat(rule.targets), [])
        .filter(target => !target.keywords)
        .map(target => `${target.selector} {\n    display: none !important;\n}`)
        .join('\n');

    if (cssText) {
        const style = document.createElement('style');
        style.id = 'hide-ai-selection-menu-style';
        style.textContent = cssText;

        const root = document.head || document.documentElement;
        if (root) {
            root.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                (document.head || document.documentElement).appendChild(style);
            }, { once: true });
        }
    }

    function hideSelectionMenu() {
        for (const rule of rules) {
            for (const { selector, keywords } of rule.targets) {
                let menus;
                try {
                    menus = document.querySelectorAll(selector);
                } catch (e) {
                    continue; // 选择器不合法时只跳过它，别让整轮清理中断
                }

                for (const menu of menus) {
                    // 幂等：已经是目标状态就跳过，避免自己触发 observer 空转。
                    // 但不能靠 dataset 打标记永久跳过 —— 这类浮层带页面自己算出来的
                    // 行内样式，页面重写 style 时会把 display:none 一起冲掉，
                    // 必须每轮重新校验、自动补回。
                    if (menu.style
                        && menu.style.getPropertyValue('display') === 'none'
                        && menu.style.getPropertyPriority('display') === 'important') {
                        continue;
                    }
                    if (keywords && !keywords.every(k => menu.textContent.includes(k))) continue;
                    menu.style.setProperty('display', 'none', 'important');
                }
            }
        }
    }

    // 初始检查
    hideSelectionMenu();

    // 监听动态生成的菜单；AI 页面流式输出时 DOM 变动极频繁，用 rAF 合并成每帧一次
    let pending = false;

    function scheduleHide() {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            hideSelectionMenu();
        });
    }

    if (document.documentElement) {
        new MutationObserver(scheduleHide).observe(document.documentElement, {
            childList: true,
            subtree: true,
            // 菜单被页面「重新 show」时往往只改 class/style，只看 childList 会漏掉
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // 兜底轮询：少数菜单由页面定时器插入、或只改属性，observer 可能漏掉。
    // 前 30 秒密集一点，之后降到 3 秒当保险。
    let ticks = 0;
    const timer = setInterval(() => {
        hideSelectionMenu();
        if (++ticks === 120) {
            clearInterval(timer);
            setInterval(hideSelectionMenu, 3000);
        }
    }, 250);
})();
