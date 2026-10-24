import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { ContactLinks, Evidence } from "@/components/Exhibit";
import { T } from "@/components/LangProvider";
import { ProfileDirection } from "@/components/ProfileDirection";
export const metadata = pageMetadata(
  "关于我",
  "Evergreen 的个人介绍、求职方向与联系方式。",
  "/about",
);
export default function AboutPage() {
  const records = [
    { key: "education" as const, items: site.education },
    { key: "experience" as const, items: site.experience },
  ];
  return (
    <div className="about-page">
      <header className="about-header">
        <div>
          <p className="eyebrow">THE PERSON BEHIND THE SCREEN</p>
          <h1 className="page-title mt-5">
            <T k="about.title" />
          </h1>
        </div>
        <img
          src={site.avatar}
          width={112}
          height={112}
          alt="Evergreen"
          className="about-avatar"
        />
      </header>
      <section className="about-block">
        <span className="eyebrow">01 / INTRODUCTION</span>
        <div>
          <h2>
            <T k="about.intro" />
          </h2>
          <p lang="zh-CN" className="mt-5 max-w-2xl leading-8 text-text-muted">
            {site.introduction}
          </p>
          <h3 className="mt-8 text-sm font-medium text-accent">
            <T k="about.direction" />
          </h3>
          <p className="mt-2 text-text-muted">
            <ProfileDirection />
          </p>
        </div>
      </section>
      {records.map(
        ({ key, items }) =>
          items.length > 0 && (
            <section className="about-block" key={key}>
              <span className="eyebrow">BACKGROUND</span>
              <div>
                <h2>
                  <T
                    k={
                      key === "education"
                        ? "about.education"
                        : "about.experience"
                    }
                  />
                </h2>
                {[...items]
                  .sort((a, b) => b.start.localeCompare(a.start))
                  .map((item) => (
                    <div
                      className="mt-6 border-l border-border pl-5"
                      key={item.title + item.start}
                    >
                      <p className="text-xs text-text-muted">
                        {item.start}
                        {item.end && " — " + item.end}
                      </p>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                      <p className="mt-2 text-sm text-text-muted">
                        {item.detail}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          ),
      )}
      <section className="about-block">
        <span className="eyebrow">02 / EVIDENCE</span>
        <div>
          <h2 className="mb-6">
            <T k="home.evidence" />
          </h2>
          <Evidence />
        </div>
      </section>
      <section className="about-block">
        <span className="eyebrow">03 / CONTACT</span>
        <div>
          <h2>
            <T k="about.contact" />
          </h2>
          <p className="mb-6 mt-4 text-sm text-text-muted">{site.email}</p>
          <ContactLinks resume />
        </div>
      </section>
    </div>
  );
}
