export default function Footer() {
  return (
    <footer className="w-full py-8 text-center text-xs text-muted-foreground border-t border-border/30">
      <p>
        测试内容来源：B站@蛆肉儿串儿 · 体验优化：
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
    </footer>
  );
}
