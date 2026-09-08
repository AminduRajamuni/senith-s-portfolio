import Link from "next/link";

const ITEMS = [
  { href: "/admin/dashboard", label: "Motion Graphics" },
  { href: "/admin/dashboard/reel-creations", label: "Reel Creations" },
  { href: "/admin/dashboard/graphic-designs", label: "Graphic Designs" },
  { href: "/admin/dashboard/contact", label: "Contact Links" },
];

export default function AdminSubnav({ active }: { active: string }) {
  return (
    <nav className="admin-subnav" aria-label="Admin sections">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.href === active ? "active" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
