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
  return parts.length ? parts.join(" + ") : "未选择骰子";
}

export default function Home() {
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [results, setResults] = useState<RolledDie[]>([]);
  const [lastFormula, setLastFormula] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const rollSequence = useRef(0);

  const selectedCount = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );
  const currentFormula = formulaFrom(counts);
  const total = results.reduce((sum, die) => sum + die.value, 0);
  const densityClass = results.length > 16 ? "very-dense" : results.length > 8 ? "dense" : "";

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

    setLastFormula(currentFormula);
    setResults(nextResults);
    setIsRolling(true);
    window.setTimeout(() => setIsRolling(false), 720);
  }

  return (
    <main className="table-scene">
      <div className="gold-frame" aria-hidden="true" />
      <div className="corner corner-nw" aria-hidden="true" />
      <div className="corner corner-ne" aria-hidden="true" />
      <div className="corner corner-sw" aria-hidden="true" />
      <div className="corner corner-se" aria-hidden="true" />

      <div className="app-shell">
        <header className="compact-header">
          <div className="brand-mark" aria-hidden="true">20</div>
          <h1>琥珀骰坊</h1>
          <span className="edition-badge">D&amp;D 5E</span>
        </header>

        <div className="roll-workspace">
          <section className="dice-tray" aria-label="投掷结果">
            <div className="total-display" aria-live="polite" data-testid="total-result">
              <span>总点数</span>
              <strong>{results.length ? total : "—"}</strong>
              <small>{results.length ? lastFormula : "等待投掷"}</small>
            </div>

            <div className={`dice-stage ${densityClass} ${isRolling ? "is-rolling" : ""}`}>
              {results.length ? (
                results.map((die, index) => (
                  <div
                    className={`die ${die.type}`}
                    style={{
                      "--delay": `${(index % 8) * 36}ms`,
                      "--tilt": `${((index * 17) % 15) - 7}deg`,
                    } as React.CSSProperties}
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
                  <p>选择骰子并投掷</p>
                </div>
              )}
            </div>

            <div className="result-detail">
              {results.length ? results.map((die) => `${die.type.toUpperCase()} · ${die.value}`).join("   /   ") : "投掷结果会显示在骰面上"}
            </div>
          </section>

          <section className="control-dock" aria-label="选择骰子">
            <div className="dock-heading">
              <h2>选择骰子</h2>
              <span>{currentFormula}</span>
            </div>

            <div className="dice-selector-list">
              {DICE.map((die) => (
                <div className={`dice-control ${counts[die.id] ? "selected" : ""}`} key={die.id}>
                  <button
                    type="button"
                    className="count-button"
                    aria-label={`减少一枚${die.name}`}
                    onClick={() => updateCount(die.id, -1)}
                    disabled={counts[die.id] === 0}
                  >−</button>

                  <div className="dice-control-center">
                    <span className={`mini-die ${die.id}`} aria-hidden="true">{die.label.slice(1)}</span>
                    <strong>{die.label}</strong>
                    <output aria-label={`${die.name}数量`}>{counts[die.id]}</output>
                  </div>

                  <button
                    type="button"
                    className="count-button"
                    aria-label={`增加一枚${die.name}`}
                    onClick={() => updateCount(die.id, 1)}
                    disabled={counts[die.id] === 12}
                  >+</button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="roll-button"
              onClick={rollDice}
              disabled={!selectedCount || isRolling}
              data-testid="roll-button"
            >
              <span aria-hidden="true">✦</span>
              {isRolling ? "投掷中…" : `投掷 ${selectedCount} 枚骰子`}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
