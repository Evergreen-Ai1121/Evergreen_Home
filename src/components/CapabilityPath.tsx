"use client";
import { useState } from "react";
import {
  Braces,
  Server,
  Database,
  Sparkles,
  ArrowDownRight,
} from "lucide-react";
import { useLang } from "./LangProvider";
const nodes = [
  {
    key: "interface",
    Icon: Braces,
    code: "01",
    detail: "INTERFACE / EXPERIENCE",
  },
  { key: "service", Icon: Server, code: "02", detail: "LOGIC / CONNECTION" },
  {
    key: "data",
    Icon: Database,
    code: "03",
    detail: "STRUCTURE / PERSISTENCE",
  },
  { key: "ai", Icon: Sparkles, code: "04", detail: "CONTEXT / INTELLIGENCE" },
] as const;
export function CapabilityPath() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  return (
    <div className="capability-panel">
      <div className="capability-top">
        <span className="eyebrow">THE BUILDING BLOCKS</span>
        <span className="status-dot" aria-hidden />
      </div>
      <div className="capability-title">
        {t("path.title")}
        <ArrowDownRight size={24} className="text-accent" />
      </div>
      <div className="capability-nodes">
        {nodes.map(({ key, Icon, code }, index) => (
          <button
            type="button"
            key={key}
            className={`capability-node ${index === active ? "is-active" : ""}`}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            aria-pressed={index === active}
          >
            <span className="node-icon">
              <Icon size={23} strokeWidth={1.4} />
            </span>
            <span>{t(`path.${key}`)}</span>
            <span className="font-mono text-xs text-text-muted">{code}</span>
          </button>
        ))}
      </div>
      <div className="capability-bottom">
        <span className="font-mono text-[10px] tracking-widest">
          {nodes[active].detail}
        </span>
        <span className="text-xs text-text-muted">{t("path.hint")}</span>
      </div>
    </div>
  );
}
