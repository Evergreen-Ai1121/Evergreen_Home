export type Lang = "zh" | "en";

export const LANGS: Lang[] = ["zh", "en"];
export const LANG_STORAGE_KEY = "site:lang";

/**
 * 界面文案字典。只放「界面」文案 —— 文章内容与页面描述仍是中文，不做双语。
 * 中英两套必须键完全一致，靠 DictKey 约束。
 */
const zh = {
  "nav.home": "首页",
  "nav.notes": "笔记",
  "nav.posts": "文章",
  "nav.moments": "说说",
  "nav.projects": "作品",
  "nav.about": "关于",
  "nav.tags": "标签",
  "nav.archive": "归档",

  "action.search": "搜索",
  "action.close": "关闭",
  "action.all": "全部",
  "action.cancel": "取消",
  "action.submit": "发表评论",
  "action.reply": "回复",
  "action.copyCode": "复制代码",
  "action.expandCode": "展开全部",
  "action.collapseCode": "收起",
  "action.copyLink": "复制链接",
  "action.copied": "已复制链接",
  "action.share": "分享",
  "action.viewAll": "全部",
  "action.clearFilter": "清除筛选",
  "action.lang": "切换语言",

  "label.tags": "标签",
  "label.category": "分类",
  "label.minRead": "分钟",
  "label.words": "约",
  "label.wordsUnit": "字",
  "label.updatedAt": "更新于",
  "label.prevPost": "上一篇",
  "label.nextPost": "下一篇",
  "label.related": "相关推荐",
  "label.comments": "评论",
  "label.readingTime": "阅读时长",
  "label.year": "年份",
  "archive.summary": "共 {n} 篇内容，按年份倒序排列。",
  "tag.summary": "该标签下共 {n} 篇内容。",
  "label.backToTags": "← 返回全部标签",
  "label.allTags": "全站标签，按文章数排。点进去看该标签下的全部内容（跨笔记、文章、作品）。",
  "label.rss": "订阅 RSS",
  "label.social": "社交链接",
  "label.nickname": "昵称",
  "label.email": "邮箱（选填，不公开）",
  "label.thinking": "写下你的想法…",
  "label.sort": "评论排序",
  "label.sortNewest": "最新优先",
  "label.sortOldest": "最早优先",
  "label.author": "作者",
  "comment.empty": "还没有评论，来说两句吧。",
  "comment.degraded": "评论服务暂不可用，可发邮件直接联系我。",
  "comment.replying": "正在回复 @{name}",
  "comment.repliedTo": "回复 @{name}",
  "comment.hide": "隐藏",
  "comment.delete": "删除",
  "comment.posted": "评论已发布。",
  "comment.confirmDelete": "确定删除这条评论？",
  "comment.errNick": "请填写昵称",
  "comment.errContent": "请填写评论内容",
  "comment.errSubmit": "提交失败",
  "comment.errAction": "操作失败",
  "comment.errDelete": "删除失败",

  "home.latestPosts": "最新文章",
  "home.latestMoments": "最新说说",
  "home.featuredProjects": "精选作品",
  "home.profileIntro": "这里记录我整理过的学习笔记、写完的文章、随手发的生活瞬间，以及几个能说明我能做什么的项目。",

  "empty.posts": "还没有文章，写完第一篇就会出现在这里。",
  "empty.moments": "说说还没有内容，去 /admin 发一条。",
  "empty.projects": "还没有标记为精选的作品。",
  "empty.tags": "还没有打过标签的内容。",
  "empty.archive": "还没有内容。",
  "empty.filtered": "这个标签下还没有内容，换个筛选条件看看。",

  "search.placeholder": "搜索文章、笔记、说说、作品…",
  "search.help": "输入关键词开始检索，↑ ↓ 选择，Enter 打开，Esc 关闭。",
  "search.empty": "没有找到相关内容，看看最近更新的？",
  "search.error": "搜索索引不可用，请稍后再试。",
  "search.recent": "最近更新",

  "footer.builtWith": "用 Next.js 构建",
} as const;

const en: Record<keyof typeof zh, string> = {
  "nav.home": "Home",
  "nav.notes": "Notes",
  "nav.posts": "Posts",
  "nav.moments": "Moments",
  "nav.projects": "Projects",
  "nav.about": "About",
  "nav.tags": "Tags",
  "nav.archive": "Archive",

  "action.search": "Search",
  "action.close": "Close",
  "action.all": "All",
  "action.cancel": "Cancel",
  "action.submit": "Post comment",
  "action.reply": "Reply",
  "action.copyCode": "Copy code",
  "action.expandCode": "Expand all",
  "action.collapseCode": "Collapse",
  "action.copyLink": "Copy link",
  "action.copied": "Link copied",
  "action.share": "Share",
  "action.viewAll": "All",
  "action.clearFilter": "Clear filter",
  "action.lang": "Switch language",

  "label.tags": "Tags",
  "label.category": "Category",
  "label.minRead": "min read",
  "label.words": "About",
  "label.wordsUnit": "words",
  "label.updatedAt": "Updated",
  "label.prevPost": "Previous",
  "label.nextPost": "Next",
  "label.related": "Related",
  "label.comments": "Comments",
  "label.readingTime": "Reading time",
  "label.year": "Year",
  "archive.summary": "{n} entries, newest first.",
  "tag.summary": "{n} entries under this tag.",
  "label.backToTags": "← Back to all tags",
  "label.allTags":
    "Every tag on this site, ranked by how often I use it. Tap one to see everything filed under it.",
  "label.rss": "RSS feed",
  "label.social": "Social",
  "label.nickname": "Nickname",
  "label.email": "Email (optional, never shown)",
  "label.thinking": "Share your thoughts…",
  "label.sort": "Comment order",
  "label.sortNewest": "Newest first",
  "label.sortOldest": "Oldest first",
  "label.author": "Author",
  "comment.empty": "No comments yet — say something.",
  "comment.degraded": "Comments are unavailable right now — email me instead.",
  "comment.replying": "Replying to @{name}",
  "comment.repliedTo": "@{name}",
  "comment.hide": "Hide",
  "comment.delete": "Delete",
  "comment.posted": "Comment posted.",
  "comment.confirmDelete": "Delete this comment?",
  "comment.errNick": "Nickname is required",
  "comment.errContent": "Comment cannot be empty",
  "comment.errSubmit": "Failed to post",
  "comment.errAction": "Action failed",
  "comment.errDelete": "Delete failed",

  "home.latestPosts": "Latest posts",
  "home.latestMoments": "Latest moments",
  "home.featuredProjects": "Featured projects",
  "home.profileIntro":
    "Notes I have organised, posts I have finished writing, moments from everyday life, and a few projects that show what I can build.",

  "empty.posts": "No posts yet — the first one will show up here.",
  "empty.moments": "No moments yet. Post one from /admin.",
  "empty.projects": "No featured projects yet.",
  "empty.tags": "Nothing has been tagged yet.",
  "empty.archive": "Nothing here yet.",
  "empty.filtered": "Nothing under this tag. Try another filter.",

  "search.placeholder": "Search posts, notes, moments, projects…",
  "search.help": "Type to search · ↑ ↓ to move · Enter to open · Esc to close",
  "search.empty": "Nothing matched. Maybe something recent?",
  "search.error": "Search index unavailable, please try again later.",
  "search.recent": "Recently updated",

  "footer.builtWith": "Built with Next.js",
};

export type DictKey = keyof typeof zh;

const DICTS: Record<Lang, Record<DictKey, string>> = { zh, en };

export function translate(lang: Lang, key: DictKey): string {
  return DICTS[lang][key] ?? DICTS.zh[key];
}

/** 日期随语言切换：`2026 年 10 月 13 日` ↔ `Oct 13, 2026` */
export function formatDate(date: string, lang: Lang): string {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  if (lang === "en") {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[m - 1]} ${d}, ${y}`;
  }
  return `${y} 年 ${m} 月 ${d} 日`;
}

export const LANG_LABEL: Record<Lang, string> = { zh: "中", en: "EN" };
