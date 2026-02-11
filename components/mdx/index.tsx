"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

// ============================================
// CALLOUT COMPONENTS
// ============================================

interface CalloutProps {
  type?: "info" | "warning" | "success" | "danger" | "tip";
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-200",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200",
    success: "bg-green-500/10 border-green-500/30 text-green-200",
    danger: "bg-red-500/10 border-red-500/30 text-red-200",
    tip: "bg-purple-500/10 border-purple-500/30 text-purple-200",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    danger: "🚨",
    tip: "💡",
  };

  return (
    <div className={cn("p-4 rounded-xl border my-4", styles[type])}>
      {title && (
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>{icons[type]}</span>
          {title}
        </div>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ============================================
// SCENARIO / QUIZ INLINE
// ============================================

interface ScenarioProps {
  title: string;
  context?: string;
  children: ReactNode;
}

export function Scenario({ title, context, children }: ScenarioProps) {
  return (
    <div className="bg-[#111118] border border-gray-700 rounded-xl p-6 my-6">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {context && <p className="text-gray-400 text-sm mb-4">{context}</p>}
      <div className="text-gray-300">{children}</div>
    </div>
  );
}

// ============================================
// INTERACTIVE CHOICE (Single question)
// ============================================

interface ChoiceOption {
  text: string;
  correct?: boolean;
  explanation?: string;
}

interface ChoiceProps {
  question: string;
  options: ChoiceOption[];
}

export function Choice({ question, options }: ChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
  };

  return (
    <div className="bg-[#0d0d12] border border-gray-800 rounded-xl p-6 my-6">
      <p className="font-medium text-white mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let bg = "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700";
          if (revealed) {
            if (opt.correct) {
              bg = "bg-green-500/20 border-green-500";
            } else if (i === selected) {
              bg = "bg-red-500/20 border-red-500";
            } else {
              bg = "bg-gray-800/30 border-gray-800 opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all",
                bg
              )}
            >
              <span className="text-gray-200">{opt.text}</span>
            </button>
          );
        })}
      </div>
      {revealed && selected !== null && options[selected].explanation && (
        <div
          className={cn(
            "mt-4 p-3 rounded-lg text-sm",
            options[selected].correct
              ? "bg-green-500/10 text-green-300"
              : "bg-red-500/10 text-red-300"
          )}
        >
          {options[selected].correct ? "✅ " : "❌ "}
          {options[selected].explanation}
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP-BY-STEP GUIDE
// ============================================

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4 my-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <div className="text-gray-400 text-sm">{children}</div>
      </div>
    </div>
  );
}

interface StepsProps {
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <div className="my-6 space-y-2">{children}</div>;
}

// ============================================
// CODE BLOCK WITH SYNTAX HIGHLIGHTING
// ============================================

interface CodeBlockProps {
  language?: string;
  title?: string;
  children: string;
}

export function CodeBlock({ language = "javascript", title, children }: CodeBlockProps) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-800">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
          {title}
        </div>
      )}
      <pre className="bg-[#0d0d12] p-4 overflow-x-auto">
        <code className={`language-${language} text-sm text-gray-300`}>
          {children}
        </code>
      </pre>
    </div>
  );
}

// ============================================
// TRADING SPECIFIC COMPONENTS
// ============================================

interface SignalBoxProps {
  type: "bullish" | "bearish";
  entry: string;
  stopLoss: string;
  target: string;
  riskReward?: string;
}

export function SignalBox({ type, entry, stopLoss, target, riskReward }: SignalBoxProps) {
  const isBullish = type === "bullish";

  return (
    <div
      className={cn(
        "p-4 rounded-xl border my-4",
        isBullish
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{isBullish ? "🟢" : "🔴"}</span>
        <span className="font-bold text-white">
          {isBullish ? "LONG SETUP" : "SHORT SETUP"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-400">Entry:</span>
          <span className="text-white ml-2">{entry}</span>
        </div>
        <div>
          <span className="text-gray-400">Stop Loss:</span>
          <span className={cn("ml-2", isBullish ? "text-red-400" : "text-red-400")}>
            {stopLoss}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Target:</span>
          <span className="text-green-400 ml-2">{target}</span>
        </div>
        {riskReward && (
          <div>
            <span className="text-gray-400">R:R:</span>
            <span className="text-emerald-400 ml-2">{riskReward}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface IndicatorStatusProps {
  name: string;
  value: string;
  status: "bullish" | "bearish" | "neutral";
}

export function IndicatorStatus({ name, value, status }: IndicatorStatusProps) {
  const colors = {
    bullish: "text-green-400",
    bearish: "text-red-400",
    neutral: "text-gray-400",
  };

  const icons = {
    bullish: "🟢",
    bearish: "🔴",
    neutral: "⚪",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <span className="text-gray-300">{name}</span>
      <div className="flex items-center gap-2">
        <span className={colors[status]}>{value}</span>
        <span>{icons[status]}</span>
      </div>
    </div>
  );
}

interface IndicatorPanelProps {
  children: ReactNode;
}

export function IndicatorPanel({ children }: IndicatorPanelProps) {
  return (
    <div className="my-4 p-4 bg-[#111118] border border-gray-800 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-400 mb-3">INDICATOR STATUS</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ============================================
// VIDEO EMBED
// ============================================

interface VideoProps {
  src: string;
  title?: string;
}

export function Video({ src, title }: VideoProps) {
  // Support YouTube, Vimeo, Loom
  let embedUrl = src;

  const ytMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = src.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  const loomMatch = src.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    embedUrl = `https://www.loom.com/embed/${loomMatch[1]}`;
  }

  return (
    <div className="my-6">
      {title && <p className="text-sm text-gray-400 mb-2">{title}</p>}
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ============================================
// ACCORDION / EXPANDABLE
// ============================================

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden my-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 bg-gray-800/50 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium text-white">{title}</span>
        <span className="text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="p-4 bg-[#0d0d12] text-gray-300 text-sm">{children}</div>
      )}
    </div>
  );
}

// ============================================
// TAB COMPONENT
// ============================================

interface TabProps {
  label: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <div>{children}</div>;
}

interface TabsProps {
  children: ReactNode;
}

export function Tabs({ children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = Array.isArray(children) ? children : [children];
  
  return (
    <div className="my-6">
      <div className="flex border-b border-gray-800 mb-4">
        {tabs.map((tab: any, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === i
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {tab.props?.label || `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab]}</div>
    </div>
  );
}

// ============================================
// EXPORTS FOR MDX
// ============================================

export const mdxComponents = {
  Callout,
  Scenario,
  Choice,
  Step,
  Steps,
  CodeBlock,
  SignalBox,
  IndicatorStatus,
  IndicatorPanel,
  Video,
  AccordionItem,
  Tab,
  Tabs,
  // Override default elements
  h1: (props: any) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-semibold text-white mt-4 mb-2" {...props} />,
  p: (props: any) => <p className="text-gray-300 my-3 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside text-gray-300 my-3 space-y-1" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside text-gray-300 my-3 space-y-1" {...props} />,
  li: (props: any) => <li className="text-gray-300" {...props} />,
  a: (props: any) => <a className="text-emerald-400 hover:underline" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-emerald-500 pl-4 my-4 text-gray-400 italic" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 text-sm" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-[#0d0d12] border border-gray-800 rounded-xl p-4 my-4 overflow-x-auto" {...props} />
  ),
  hr: () => <hr className="border-gray-800 my-8" />,
  table: (props: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-800" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-gray-800 bg-gray-800/50 px-4 py-2 text-left text-white" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-gray-800 px-4 py-2 text-gray-300" {...props} />
  ),
};
