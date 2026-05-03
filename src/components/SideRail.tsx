export default function SideRail() {
  const icons = ['⚒', '◈', '♫', '⌬', '⟁'];
  return <aside className="hidden lg:flex flex-col gap-4 fixed left-3 top-1/3">{icons.map((i) => <div className="forge-panel w-10 h-10 grid place-items-center">{i}</div>)}</aside>;
}
