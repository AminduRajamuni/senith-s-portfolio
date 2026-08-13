import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Script from "next/script";
import "./hero.css";
import "./page2.css";

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

const HEADING_WORDS = [
  { text: "Hello!", accent: false },
  { text: "i’m", accent: false },
  { text: "Kusal", accent: true },
  { text: "Senith", accent: false },
];

const WHAT_I_DO = [
  "Motion Graphics",
  "Graphic Design",
  "Video Editing",
  "Social Media Design",
  "Video & Content Creation",
  "Visual Effects ( VFX )",
];

const TOOLS = [
  { key: "ai", src: "/assets/page2/tools_icons/ai.png", alt: "Adobe Illustrator" },
  { key: "ae", src: "/assets/page2/tools_icons/ae.png", alt: "Adobe After Effects" },
  { key: "ps", src: "/assets/page2/tools_icons/ps.png", alt: "Adobe Photoshop" },
  { key: "id", src: "/assets/page2/tools_icons/id.png", alt: "Adobe InDesign" },
  { key: "pr", src: "/assets/page2/tools_icons/pr.png", alt: "Adobe Premiere Pro" },
  { key: "figma", src: "/assets/page2/tools_icons/figma.png", alt: "Figma" },
];

function jd(seconds: number): CSSProperties {
  return { "--jd": `${seconds}s` } as CSSProperties;
}

export default function Home() {
  return (
    <>
      <div
        className="brand-mark"
        role="button"
        tabIndex={0}
        aria-label="Scroll to top"
      >
        <img src="/assets/kusal.png" alt="" draggable={false} />
      </div>

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
      </section>

      <section id="about" className="about" aria-label="About Kusal Senith">
        <div className="about-bg" aria-hidden="true" />

        <div className="about-inner">
          <div className="card-wrap">
            <img
              className="card-photo"
              src="/assets/page2/photo.png"
              alt="Kusal Senith standing on a beach at sunset with the Dubai skyline behind him"
              draggable={false}
            />
            <div className="card-tape" aria-hidden="true">
              <img src="/assets/page2/tape.png" alt="" draggable={false} />
            </div>
          </div>

          <div className="about-copy">
            <h2 className="about-heading">
              {HEADING_WORDS.map((w, i) => (
                <span key={w.text}>
                  <span
                    className={`jump word${w.accent ? " accent" : ""}`}
                    style={jd(i * 0.06)}
                  >
                    {w.text}
                  </span>
                  {i < HEADING_WORDS.length - 1 ? " " : ""}
                </span>
              ))}
            </h2>

            <p className="about-para jump" style={jd(0.15)}>
              I&rsquo;m a <b>Motion &amp; Graphic Designer</b> with a creative
              mind and a passion for turning ideas into visually engaging
              experiences. I love working across graphic design, motion
              graphics, video editing, and visual storytelling, using
              creativity to bring concepts to life. From bold visuals to
              smooth animations, I enjoy experimenting with different styles
              and finding unique ways to communicate ideas.
            </p>

            <p className="about-para jump" style={jd(0.22)}>
              Currently based in <b>Dubai</b>, I&rsquo;m always looking for
              opportunities to learn, create, and push my creativity further.
              I work with Adobe After Effects, Illustrator, Photoshop, and
              other creative tools to transform ideas into impactful visuals.
              For me, design is more than just making things look good.
              It&rsquo;s about creating something that catches attention,
              communicates a message, and leaves an impression.
            </p>

            <div className="about-columns">
              <div className="about-col">
                <h3 className="jump" style={jd(0.3)}>
                  What i do
                </h3>
                <ul className="about-list">
                  {WHAT_I_DO.map((item, i) => (
                    <li key={item}>
                      <img
                        className="star jump"
                        style={jd(0.36 + i * 0.06)}
                        src="/assets/page2/star.png"
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                      />
                      <span
                        className="jump"
                        style={jd(0.38 + i * 0.06)}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="about-col">
                <h3 className="jump" style={jd(0.3)}>
                  Tools i use
                </h3>
                <div className="tools-row">
                  {TOOLS.map((t, i) => (
                    <img
                      key={t.key}
                      className="jump"
                      style={jd(0.4 + i * 0.07)}
                      src={t.src}
                      alt={t.alt}
                      draggable={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Script src="/script.js" strategy="afterInteractive" />
      <Script src="/page2.js" strategy="afterInteractive" />
    </>
  );
}
