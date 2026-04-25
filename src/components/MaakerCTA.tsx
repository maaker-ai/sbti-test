/**
 * 强引流 CTA 卡片 — 放在用户看完 SBTi 测试结果后的最佳引流时机。
 * 用 Maaker 主站粉橙渐变，跟 SBTi 暗紫底色形成强对比，确保被注意到。
 */
export default function MaakerCTA() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-lg">
        <a
          href="https://maaker.cn"
          className="block overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF2E7A] via-[#FF4A8E] to-[#FF6B3D] p-6 text-white shadow-[0_10px_40px_rgba(255,46,122,0.3)] transition-transform hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(255,46,122,0.45)]"
        >
          <div className="flex items-start gap-4">
            <div
              className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white text-2xl font-extrabold text-[#FF2E7A] shadow-lg"
              aria-hidden
            >
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                ↓ 测完了，来这个试试
              </p>
              <h3 className="mt-1 text-xl font-extrabold leading-tight sm:text-2xl">
                AI 一句话，
                <br className="sm:hidden" />
                3 秒生成你的小游戏
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-95">
                Maaker.cn — 输入一句话，免费生成可玩的小游戏，还能分享给朋友
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#FF2E7A] shadow">
                立即生成我的小游戏
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
