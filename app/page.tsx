"use client";

import { useMemo, useRef, useState } from "react";

type DieId = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

type DieDefinition = {
  id: DieId;
  label: string;
  name: string;
  sides: number;
};

type RolledDie = {
  key: string;
  type: DieId;
  value: number;
};

type RollRecord = {
  id: number;
  formula: string;
  total: number;
  detail: string;
};

const DICE: DieDefinition[] = [
  { id: "d4", label: "D4", name: "四面骰", sides: 4 },
  { id: "d6", label: "D6", name: "六面骰", sides: 6 },
  { id: "d8", label: "D8", name: "八面骰", sides: 8 },
  { id: "d10", label: "D10", name: "十面骰", sides: 10 },
  { id: "d12", label: "D12", name: "十二面骰", sides: 12 },
  { id: "d20", label: "D20", name: "二十面骰", sides: 20 },
  { id: "d100", label: "D100", name: "百分骰", sides: 100 },
];

const INITIAL_COUNTS: Record<DieId, number> = {
  d4: 0,
  d6: 0,
  d8: 0,
  d10: 0,
  d12: 0,
  d20: 1,
  d100: 0,
};

function formulaFrom(counts: Record<DieId, number>) {
  const parts = DICE.filter((die) => counts[die.id] > 0).map(
    (die) => `${counts[die.id]}${die.id}`,
  );
  return parts.length ? parts.join(" + ") : "尚未选骰";
}

export default function Home() {
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [results, setResults] = useState<RolledDie[]>([]);
  const [history, setHistory] = useState<RollRecord[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const rollSequence = useRef(0);

  const selectedCount = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );
  const total = results.reduce((sum, die) => sum + die.value, 0);

  function updateCount(id: DieId, delta: number) {
    setCounts((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(12, current[id] + delta)),
    }));
  }

  function rollDice() {
    if (!selectedCount || isRolling) return;

    rollSequence.current += 1;
    const sequence = rollSequence.current;
    const nextResults = DICE.flatMap((die) =>
      Array.from({ length: counts[die.id] }, (_, index) => ({
        key: `${sequence}-${die.id}-${index}`,
        type: die.id,
        value: Math.floor(Math.random() * die.sides) + 1,
      })),
    );

    setIsRolling(true);
    setResults(nextResults);

    window.setTimeout(() => {
      const nextTotal = nextResults.reduce((sum, die) => sum + die.value, 0);
      const detail = nextResults.map((die) => die.value).join(" · ");
      setHistory((current) => [
        {
          id: Date.now(),
          formula: formulaFrom(counts),
          total: nextTotal,
          detail,
        },
        ...current,
      ].slice(0, 5));
      setIsRolling(false);
    }, 760);
  }

  return (
    <main className="table-scene">
      <div className="gold-frame" aria-hidden="true" />
      <div className="corner corner-nw" aria-hidden="true"><span>♛</span></div>
      <div className="corner corner-ne" aria-hidden="true"><span>♛</span></div>
      <div className="corner corner-sw" aria-hidden="true"><span>♛</span></div>
      <div className="corner corner-se" aria-hidden="true"><span>♛</span></div>

      <header className="site-header">
        <div className="brand-mark" aria-hidden="true"><span>20</span></div>
        <div>
          <p className="eyebrow">Amber dice atelier · D&amp;D 5E</p>
          <h1>琥珀骰坊</h1>
        </div>
        <p className="header-note">让命运落在桌面上</p>
      </header>

      <section className="game-layout" aria-label="DND 骰子投掷器">
        <aside className="control-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Ⅰ · 组建骰池</p>
              <h2>选择骰子</h2>
            </div>
            <span className="dice-count">{selectedCount} 枚</span>
          </div>

          <div className="dice-selector-list">
            {DICE.map((die) => (
              <div className={`dice-selector ${counts[die.id] ? "selected" : ""}`} key={die.id}>
                <div className={`mini-die ${die.id}`} aria-hidden="true">{die.label.slice(1)}</div>
                <div className="dice-label">
                  <strong>{die.label}</strong>
                  <span>{die.name}</span>
                </div>
                <div className="stepper" aria-label={`${die.name}数量`}>
                  <button
                    type="button"
                    aria-label={`减少一枚${die.name}`}
                    onClick={() => updateCount(die.id, -1)}
                    disabled={counts[die.id] === 0}
                  >−</button>
                  <output aria-live="polite">{counts[die.id]}</output>
                  <button
                    type="button"
                    aria-label={`增加一枚${die.name}`}
                    onClick={() => updateCount(die.id, 1)}
                    disabled={counts[die.id] === 12}
                  >+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="formula-strip">
            <span>当前骰池</span>
            <strong>{formulaFrom(counts)}</strong>
          </div>

          <button
            type="button"
            className="roll-button"
            onClick={rollDice}
            disabled={!selectedCount || isRolling}
            data-testid="roll-button"
          >
            <span className="roll-rune" aria-hidden="true">✦</span>
            {isRolling ? "命运正在翻滚…" : "投掷骰子"}
            <span className="roll-key">R</span>
          </button>
        </aside>

        <div className="play-area">
          <section className="dice-tray" aria-label="投掷区域">
            <div className="tray-rail tray-rail-top" aria-hidden="true" />
            <div className="tray-title">
              <span>Ⅱ · 命运之盘</span>
              <i aria-hidden="true" />
              <span>{results.length ? `${results.length} 枚骰子` : "等待投掷"}</span>
            </div>

            <div className={`dice-stage ${isRolling ? "is-rolling" : ""}`}>
              {results.length ? (
                results.map((die, index) => (
                  <div
                    className={`die ${die.type}`}
                    style={{ "--delay": `${(index % 8) * 42}ms`, "--tilt": `${((index * 17) % 15) - 7}deg` } as React.CSSProperties}
                    key={die.key}
                    aria-label={`${die.type} 投出 ${die.value}`}
                  >
                    <span className="die-glint" aria-hidden="true" />
                    <span className="die-value">{die.value}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-d20" aria-hidden="true"><span>?</span></div>
                  <p>选择你的骰子</p>
                  <span>点击「投掷骰子」，让琥珀替你揭示命运</span>
                </div>
              )}
            </div>

            <div className="result-plaque" aria-live="polite" data-testid="total-result">
              <div className="plaque-flourish" aria-hidden="true">❧</div>
              <div className="result-copy">
                <span>本次总点数</span>
                <strong>{results.length ? total : "—"}</strong>
              </div>
              <div className="result-breakdown">
                <span>{results.length ? formulaFrom(counts) : "尚未投掷"}</span>
                <p>{results.length ? results.map((die) => die.value).join(" + ") : "结果将在这里结算"}</p>
              </div>
              <div className="plaque-flourish reverse" aria-hidden="true">❧</div>
            </div>
          </section>

          <section className="history-panel" aria-label="投掷记录">
            <div className="history-heading">
              <div>
                <p className="section-kicker">Ⅲ · 旅途札记</p>
                <h2>最近投掷</h2>
              </div>
              {history.length > 0 && (
                <button type="button" onClick={() => setHistory([])}>清空记录</button>
              )}
            </div>
            {history.length ? (
              <ol className="history-list">
                {history.map((record, index) => (
                  <li key={record.id}>
                    <span className="record-index">{String(index + 1).padStart(2, "0")}</span>
                    <div><strong>{record.formula}</strong><small>{record.detail}</small></div>
                    <b>{record.total}</b>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="history-empty">第一声骰响，会被记在这里。</p>
            )}
          </section>
        </div>
      </section>

      <footer>
        <span>规则适配 Dungeons &amp; Dragons 5th Edition</span>
        <i aria-hidden="true">◆</i>
        <span>愿你的每一次检定都得命运眷顾</span>
      </footer>
    </main>
  );
}
