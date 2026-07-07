import { Header } from "./Header";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-soft-line bg-gradient-to-b from-white to-[#f4f8ff] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(90deg,rgba(37,87,167,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(37,87,167,0.05)_1px,transparent_1px)] before:bg-[length:min(25vw,300px)_100%,100%_132px]">
      <Header />
      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-32px))] py-16 pb-[70px]">
        <span className="mb-3.5 block font-extrabold text-accent">{eyebrow}</span>
        <h1 className="m-0 max-w-[760px] font-display text-[clamp(2.3rem,5vw,4.7rem)] leading-[1.04] tracking-normal">
          {title}
        </h1>
        <p className="mt-5 max-w-[650px] text-[1.12rem] leading-[1.65] text-muted">{description}</p>
      </div>
    </header>
  );
}
