/**
 * Footer：保留必要法律信息（备案号 + 致敬原作），同时引流到 Maaker 主站。
 * MaakerBar 在顶部 + MaakerCTA 在结果页 + Footer 底部链接 = 三层引流。
 */
export default function Footer() {
  return (
    <footer className="w-full border-t border-border/30">
      {/* Maaker 引流条 — 比纯文字更醒目 */}
      <div className="bg-gradient-to-r from-[#FF2E7A]/10 via-[#FF4A8E]/10 to-[#FF6B3D]/10 border-b border-[#FF2E7A]/15">
        <a
          href="https://maaker.cn"
          className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 transition hover:bg-white/5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B3D]">
              Maaker.AI
            </p>
            <p className="mt-0.5 text-sm font-bold text-foreground sm:text-base">
              一句话生成你的小游戏
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FF2E7A] to-[#FF6B3D] px-4 py-2 text-xs font-bold text-white shadow-md">
            去看看
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>

      {/* 法律信息 + 致敬 */}
      <div className="py-6 text-center text-xs text-muted-foreground">
        <p>
          测试内容来源：B站{' '}
          <a
            href="https://space.bilibili.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors"
          >
            @蛆肉儿串儿
          </a>
          {' · '}
          体验优化：
          <a
            href="https://maaker.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-secondary transition-colors"
          >
            Maaker.AI
          </a>
        </p>
        <p className="mt-2">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            京ICP备2023007401号-13
          </a>
        </p>
      </div>
    </footer>
  );
}
