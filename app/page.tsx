import type { Metadata } from "next";
import Script from "next/script";
import "./hero.css";

export const metadata: Metadata = {
  title: "Kusal Senith — Motion and Visual Design",
  description: "Portfolio of Kusal Senith — motion and visual design.",
};

const OBJECTS = [
  { key: "camera", src: "/assets/camera.png" },
  { key: "keyboard", src: "/assets/keyboard.png" },
  { key: "mic", src: "/assets/mic.png" },
  { key: "notebook", src: "/assets/notebook.png" },
  { key: "sunglasses", src: "/assets/sunglass.png" },
];

export default function Home() {
  return (
    <section
      id="hero"
      className="hero"
      aria-label="Kusal Senith — Motion and Visual Design portfolio"
    >
      <div className="hero-bg" aria-hidden="true" />

      <h1 className="sr-only">Kusal Senith — Motion and Visual Design</h1>

      {OBJECTS.map((o) => (
        <div
          key={o.key}
          className={`obj obj--${o.key}`}
          data-obj={o.key}
          aria-hidden="true"
        >
          <div className="obj-idle">
            <div className="obj-art">
              <img src={o.src} alt="" draggable={false} />
            </div>
          </div>
        </div>
      ))}

      <div className="logo">
        <img
          src="/assets/logo.png"
          alt="Motion and Visual Design — Kusal Senith, Portfolio"
        />
      </div>

      <Script src="/script.js" strategy="afterInteractive" />
    </section>
  );
}
