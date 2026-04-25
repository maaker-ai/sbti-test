/**
 * 顶部固定 ribbon — 让 SBTi 用户立即识别"我在 Maaker 旗下"。
 * 视觉刻意用 Maaker 主站的粉橙渐变（跟 SBTi 暗紫主体形成强对比，醒目）。
 * 引流目标：让看到 SBTi 的人知道还有 Maaker 主站可去。
 */
export default function MaakerBar() {
  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#FF2E7A] to-[#FF6B3D] text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2">
        <a
          href="https://maaker.cn"
          className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-90"
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg bg-white text-base font-extrabold text-[#FF2E7A] shadow"
            aria-hidden
          >
            M
          </span>
          <span className="hidden sm:inline">Maaker</span>
          <span className="text-[11px] font-medium opacity-80">·</span>
          <span className="text-[11px] font-medium opacity-90">趣味测试</span>
        </a>
        <a
          href="https://maaker.cn"
          className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm transition hover:bg-white/30"
        >
          <span className="hidden sm:inline">一句话生成 AI 小游戏</span>
          <span className="sm:hidden">AI 小游戏</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
