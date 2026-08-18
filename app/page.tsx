import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Script from "next/script";
import "./hero.css";
import "./page2.css";
import "./page3.css";
import "./sidenav.css";

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

const MODELS = [
  {
    key: "robot",
    label: "Robot Model",
    images: [
      "/assets/page3(3D)/Robot (4).png",
      "/assets/page3(3D)/Robot (5).png",
      "/assets/page3(3D)/Robot (6).png",
    ],
  },
  {
    key: "bedroom",
    label: "Bedroom Model",
    images: [
      "/assets/page3(3D)/BedRoom.jpg",
      "/assets/page3(3D)/BedRoom (3).png",
    ],
  },
];

const SIDE_NAV_ITEMS = [
  { key: "3d-works", label: "3D Works", target: "showcase" },
  { key: "motion-graphics", label: "Motion Graphics", target: null },
  { key: "reel-creations", label: "Reel Creations", target: null },
  { key: "graphic-designs", label: "Graphic Designs", target: null },
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

      <nav id="side-nav" className="side-nav" aria-label="Portfolio sections">
        <ul className="side-nav-list">
          {SIDE_NAV_ITEMS.map((item) =>
            item.target ? (
              <li key={item.key}>
                <button
                  type="button"
                  className="side-nav-item active"
                  data-target={item.target}
                  aria-current="page"
                >
                  {item.label}
                </button>
              </li>
            ) : (
              <li key={item.key}>
                <span className="side-nav-item">{item.label}</span>
              </li>
            )
          )}
        </ul>
      </nav>

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

      <section
        id="showcase"
        className="showcase"
        aria-label="3D model showcase"
      >
        <div className="showcase-bg" aria-hidden="true" />

        <div className="showcase-inner">
          <div className="stage">
            <div className="frame-wrap">
              <button
                type="button"
                className="arrow-btn arrow-left"
                data-dir="-1"
                aria-label="Previous image"
              >
                <img
                  src="/assets/page3(3D)/arrow.png"
                  alt=""
                  draggable={false}
                />
              </button>

              <div className="frame">
                <img
                  id="showcase-image"
                  src={MODELS[0].images[0]}
                  alt={`${MODELS[0].label} render`}
                  draggable={false}
                />
              </div>

              <button
                type="button"
                className="arrow-btn arrow-right"
                data-dir="1"
                aria-label="Next image"
              >
                <img
                  src="/assets/page3(3D)/arrow.png"
                  alt=""
                  draggable={false}
                />
              </button>
            </div>
          </div>

          <div className="model-switch" role="tablist" aria-label="Choose 3D model">
            {MODELS.map((m, i) => (
              <span key={m.key} className="model-switch-item">
                <button
                  type="button"
                  className={`model-btn${i === 0 ? " active" : ""}`}
                  data-model={m.key}
                  data-images={JSON.stringify(m.images)}
                  role="tab"
                  aria-selected={i === 0}
                >
                  {m.label}
                </button>
                {i < MODELS.length - 1 ? (
                  <span className="divider" aria-hidden="true">
                    |
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Script src="/script.js" strategy="afterInteractive" />
      <Script src="/page2.js" strategy="afterInteractive" />
      <Script src="/page3.js" strategy="afterInteractive" />
      <Script src="/sidenav.js" strategy="afterInteractive" />
    </>
  );
}
