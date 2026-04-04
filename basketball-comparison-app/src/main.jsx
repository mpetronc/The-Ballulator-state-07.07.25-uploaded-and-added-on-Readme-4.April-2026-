import React, { startTransition, useDeferredValue, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STAT_FIELDS = [
  { key: "points", label: "Points", shortLabel: "PTS", step: 1, category: "Box score" },
  { key: "rebounds", label: "Rebounds", shortLabel: "REB", step: 1, category: "Box score" },
  { key: "assists", label: "Assists", shortLabel: "AST", step: 1, category: "Box score" },
  { key: "steals", label: "Steals", shortLabel: "STL", step: 1, category: "Defense" },
  { key: "blocks", label: "Blocks", shortLabel: "BLK", step: 1, category: "Defense" },
  { key: "threes", label: "3PM", shortLabel: "3PM", step: 1, category: "Shooting" },
  { key: "turnovers", label: "Turnovers", shortLabel: "TOV", step: 1, category: "Control" },
  { key: "fouls", label: "Fouls", shortLabel: "PF", step: 1, category: "Control" },
  { key: "fgPct", label: "FG%", shortLabel: "FG%", step: 0.1, category: "Efficiency" },
  { key: "ftPct", label: "FT%", shortLabel: "FT%", step: 0.1, category: "Efficiency" },
];

const CATEGORY_ORDER = ["Box score", "Shooting", "Efficiency", "Defense", "Control"];

const STAT_WEIGHTS = {
  points: 1.2,
  rebounds: 1,
  assists: 1.05,
  steals: 0.9,
  blocks: 0.9,
  threes: 0.95,
  turnovers: 0.8,
  fouls: 0.5,
  fgPct: 1.05,
  ftPct: 0.65,
};

const QUICK_LINES = [
  {
    label: "Scoring burst",
    values: { points: 33, rebounds: 6, assists: 5, steals: 2, blocks: 0, threes: 5, turnovers: 3, fouls: 2, fgPct: 52, ftPct: 88 },
  },
  {
    label: "Triple-double feel",
    values: { points: 19, rebounds: 11, assists: 12, steals: 2, blocks: 1, threes: 1, turnovers: 4, fouls: 3, fgPct: 57, ftPct: 79 },
  },
  {
    label: "Rim protector",
    values: { points: 16, rebounds: 14, assists: 3, steals: 1, blocks: 4, threes: 0, turnovers: 2, fouls: 4, fgPct: 61, ftPct: 68 },
  },
];

const MILESTONE_TRACKERS = [
  { key: "points", label: "Scoring", shortLabel: "PTS", checkpoints: [10, 20, 30] },
  { key: "rebounds", label: "Rebounding", shortLabel: "REB", checkpoints: [5, 10, 15] },
  { key: "assists", label: "Playmaking", shortLabel: "AST", checkpoints: [3, 6, 10] },
  { key: "stealsBlocks", label: "Defense", shortLabel: "STL+BLK", checkpoints: [2, 4, 6] },
  { key: "efficiency", label: "Efficiency", shortLabel: "FG%+FT%", checkpoints: [60, 70, 80] },
];

const ALL_TIME_PLAYERS = [
  { name: "Michael Jordan", emoji: "🐐", era: "1984-2003", archetype: "Pure scoring guard", stats: { points: 30.1, rebounds: 6.2, assists: 5.3, steals: 2.3, blocks: 0.8, threes: 0.5, turnovers: 2.7, fouls: 2.5, fgPct: 49.7, ftPct: 83.5 } },
  { name: "LeBron James", emoji: "👑", era: "2003-present", archetype: "Point forward engine", stats: { points: 27.0, rebounds: 7.5, assists: 7.4, steals: 1.5, blocks: 0.7, threes: 1.7, turnovers: 3.5, fouls: 1.8, fgPct: 50.6, ftPct: 73.6 } },
  { name: "Magic Johnson", emoji: "🎩", era: "1979-1996", archetype: "Oversized playmaker", stats: { points: 19.5, rebounds: 7.2, assists: 11.2, steals: 1.9, blocks: 0.4, threes: 0.1, turnovers: 3.9, fouls: 2.1, fgPct: 52.0, ftPct: 84.8 } },
  { name: "Larry Bird", emoji: "🪶", era: "1979-1992", archetype: "Shooting forward creator", stats: { points: 24.3, rebounds: 10.0, assists: 6.3, steals: 1.7, blocks: 0.8, threes: 0.7, turnovers: 3.1, fouls: 2.8, fgPct: 49.6, ftPct: 88.6 } },
  { name: "Kobe Bryant", emoji: "🐍", era: "1996-2016", archetype: "Volume shot-maker", stats: { points: 25.0, rebounds: 5.2, assists: 4.7, steals: 1.4, blocks: 0.5, threes: 1.4, turnovers: 3.0, fouls: 2.5, fgPct: 44.7, ftPct: 83.7 } },
  { name: "Stephen Curry", emoji: "🎯", era: "2009-present", archetype: "Gravity shooter", stats: { points: 24.7, rebounds: 4.7, assists: 6.4, steals: 1.5, blocks: 0.2, threes: 3.9, turnovers: 3.1, fouls: 2.0, fgPct: 47.1, ftPct: 91.0 } },
  { name: "Tim Duncan", emoji: "🏦", era: "1997-2016", archetype: "Fundamental big", stats: { points: 19.0, rebounds: 10.8, assists: 3.0, steals: 0.7, blocks: 2.2, threes: 0.0, turnovers: 2.4, fouls: 2.4, fgPct: 50.6, ftPct: 69.6 } },
  { name: "Shaquille O'Neal", emoji: "🦍", era: "1992-2011", archetype: "Interior force", stats: { points: 23.7, rebounds: 10.9, assists: 2.5, steals: 0.6, blocks: 2.3, threes: 0.0, turnovers: 2.7, fouls: 3.1, fgPct: 58.2, ftPct: 52.7 } },
  { name: "Hakeem Olajuwon", emoji: "🌀", era: "1984-2002", archetype: "Two-way center", stats: { points: 21.8, rebounds: 11.1, assists: 2.5, steals: 1.7, blocks: 3.1, threes: 0.0, turnovers: 2.8, fouls: 3.1, fgPct: 51.2, ftPct: 71.2 } },
  { name: "Kevin Durant", emoji: "🗡️", era: "2007-present", archetype: "Three-level wing scorer", stats: { points: 27.2, rebounds: 7.0, assists: 4.4, steals: 1.1, blocks: 1.1, threes: 1.9, turnovers: 3.2, fouls: 1.9, fgPct: 50.1, ftPct: 88.2 } },
  { name: "Nikola Jokic", emoji: "🃏", era: "2015-present", archetype: "Passing hub big", stats: { points: 21.8, rebounds: 10.9, assists: 7.2, steals: 1.3, blocks: 0.7, threes: 1.1, turnovers: 3.0, fouls: 2.7, fgPct: 55.9, ftPct: 82.5 } },
  { name: "Oscar Robertson", emoji: "📈", era: "1960-1974", archetype: "Triple-double pioneer", stats: { points: 25.7, rebounds: 7.5, assists: 9.5, steals: 0.0, blocks: 0.0, threes: 0.0, turnovers: 3.2, fouls: 2.8, fgPct: 48.5, ftPct: 83.8 } },
];

const NBA_REPRESENTATIVE_PLAYERS = [
  { name: "Festus Ezeli", emoji: "🪫", era: "NBA low-output comp", archetype: "Limited backup big", stats: { points: 4.0, rebounds: 5.4, assists: 0.4, steals: 0.3, blocks: 1.1, threes: 0.0, turnovers: 0.8, fouls: 2.3, fgPct: 54.8, ftPct: 53.1 } },
  { name: "Ron Baker", emoji: "🧊", era: "NBA low-output comp", archetype: "End-of-rotation guard", stats: { points: 4.1, rebounds: 1.8, assists: 1.6, steals: 0.5, blocks: 0.2, threes: 0.5, turnovers: 0.6, fouls: 1.2, fgPct: 40.2, ftPct: 77.0 } },
  { name: "Tyler Ulis", emoji: "🪶", era: "NBA low-output comp", archetype: "Small reserve playmaker", stats: { points: 7.5, rebounds: 1.6, assists: 3.7, steals: 0.9, blocks: 0.1, threes: 0.7, turnovers: 1.4, fouls: 1.7, fgPct: 42.1, ftPct: 84.9 } },
  { name: "Tony Snell", emoji: "🫥", era: "NBA low-output comp", archetype: "Low-touch floor spacer", stats: { points: 6.1, rebounds: 2.3, assists: 1.1, steals: 0.4, blocks: 0.2, threes: 1.3, turnovers: 0.5, fouls: 1.7, fgPct: 43.1, ftPct: 82.0 } },
  { name: "Matisse Thybulle", emoji: "🕷️", era: "NBA low-usage comp", archetype: "Defense-first wing", stats: { points: 4.4, rebounds: 2.0, assists: 1.2, steals: 1.2, blocks: 0.7, threes: 0.8, turnovers: 0.5, fouls: 1.7, fgPct: 43.8, ftPct: 66.9 } },
  { name: "Andre Roberson", emoji: "🔒", era: "NBA low-usage comp", archetype: "Defensive stopper", stats: { points: 4.5, rebounds: 3.9, assists: 1.0, steals: 1.0, blocks: 0.5, threes: 0.3, turnovers: 0.6, fouls: 1.9, fgPct: 48.9, ftPct: 46.7 } },
  { name: "Tony Allen", emoji: "🐺", era: "NBA low-usage comp", archetype: "Perimeter disruptor", stats: { points: 8.1, rebounds: 3.5, assists: 1.3, steals: 1.7, blocks: 0.4, threes: 0.2, turnovers: 1.1, fouls: 2.4, fgPct: 47.5, ftPct: 58.2 } },
  { name: "P.J. Tucker", emoji: "🪨", era: "NBA role-player comp", archetype: "Corner-three utility forward", stats: { points: 6.6, rebounds: 5.4, assists: 1.4, steals: 1.1, blocks: 0.3, threes: 1.3, turnovers: 0.7, fouls: 2.6, fgPct: 42.5, ftPct: 75.0 } },
  { name: "Kevon Looney", emoji: "🧰", era: "NBA role-player comp", archetype: "Screening rebound big", stats: { points: 5.0, rebounds: 5.7, assists: 2.0, steals: 0.6, blocks: 0.5, threes: 0.0, turnovers: 0.8, fouls: 2.3, fgPct: 57.2, ftPct: 61.6 } },
  { name: "Alex Caruso", emoji: "⚡", era: "NBA role-player comp", archetype: "Impact defender guard", stats: { points: 7.8, rebounds: 2.9, assists: 2.9, steals: 1.7, blocks: 0.7, threes: 1.2, turnovers: 1.0, fouls: 2.1, fgPct: 44.0, ftPct: 79.1 } },
  { name: "Kentavious Caldwell-Pope", emoji: "🛡️", era: "NBA role-player comp", archetype: "Low-usage 3-and-D guard", stats: { points: 11.2, rebounds: 3.0, assists: 1.9, steals: 1.1, blocks: 0.4, threes: 2.0, turnovers: 1.0, fouls: 1.8, fgPct: 46.2, ftPct: 84.1 } },
  { name: "Derrick White", emoji: "🔧", era: "NBA starter comp", archetype: "Two-way combo guard", stats: { points: 15.1, rebounds: 4.2, assists: 4.2, steals: 0.9, blocks: 1.0, threes: 2.3, turnovers: 1.3, fouls: 2.1, fgPct: 44.7, ftPct: 85.3 } },
  { name: "Josh Hart", emoji: "🫀", era: "NBA glue-guy comp", archetype: "Rebounding wing connector", stats: { points: 13.2, rebounds: 8.1, assists: 4.1, steals: 0.9, blocks: 0.3, threes: 1.4, turnovers: 1.7, fouls: 2.2, fgPct: 46.3, ftPct: 76.1 } },
  { name: "Mike Conley", emoji: "🎮", era: "NBA veteran comp", archetype: "Steady pick-and-roll guard", stats: { points: 14.3, rebounds: 2.9, assists: 5.7, steals: 1.3, blocks: 0.2, threes: 2.2, turnovers: 1.7, fouls: 1.8, fgPct: 43.8, ftPct: 84.2 } },
  { name: "Brook Lopez", emoji: "🧱", era: "NBA big comp", archetype: "Stretch rim protector", stats: { points: 15.9, rebounds: 6.1, assists: 1.3, steals: 0.5, blocks: 2.4, threes: 1.8, turnovers: 1.5, fouls: 2.6, fgPct: 49.2, ftPct: 80.4 } },
  { name: "Aaron Gordon", emoji: "🪜", era: "NBA forward comp", archetype: "Athletic finisher and cutter", stats: { points: 14.9, rebounds: 6.0, assists: 3.0, steals: 0.8, blocks: 0.6, threes: 0.9, turnovers: 1.5, fouls: 1.9, fgPct: 55.6, ftPct: 65.8 } },
  { name: "CJ McCollum", emoji: "🎼", era: "NBA scorer comp", archetype: "Shot-making combo guard", stats: { points: 19.5, rebounds: 4.3, assists: 4.6, steals: 0.9, blocks: 0.5, threes: 3.0, turnovers: 1.9, fouls: 2.0, fgPct: 45.4, ftPct: 82.7 } },
  { name: "Rudy Gobert", emoji: "🗼", era: "NBA center comp", archetype: "Elite rebound and rim defender", stats: { points: 12.6, rebounds: 11.7, assists: 1.2, steals: 0.7, blocks: 2.1, threes: 0.0, turnovers: 1.8, fouls: 2.7, fgPct: 65.5, ftPct: 63.8 } },
  { name: "Jalen Brunson", emoji: "🧭", era: "NBA lead-guard comp", archetype: "Crafty scoring playmaker", stats: { points: 24.0, rebounds: 3.6, assists: 6.2, steals: 0.9, blocks: 0.2, threes: 2.3, turnovers: 2.4, fouls: 1.9, fgPct: 47.9, ftPct: 84.7 } },
];

const STORAGE_KEY = "hoop-dna-games";
const GOAT_PROFILE = {
  name: "G O A T",
  emoji: "👽",
  era: "Incomparable profile",
  archetype: "Unrealistic averages, no valid player comp",
  score: 100,
};

function roundStat(value) {
  return Math.round(value * 10) / 10;
}

function formatStat(value) {
  return Number.isFinite(value) ? roundStat(value).toFixed(1) : "0.0";
}

function clampNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function emptyForm() {
  return Object.fromEntries(STAT_FIELDS.map((field) => [field.key, ""]));
}

function calculateAverages(games) {
  if (games.length === 0) {
    return Object.fromEntries(STAT_FIELDS.map((field) => [field.key, 0]));
  }

  return Object.fromEntries(
    STAT_FIELDS.map((field) => [
      field.key,
      games.reduce((sum, game) => sum + game[field.key], 0) / games.length,
    ]),
  );
}

function loadSavedGames() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawGames = window.localStorage.getItem(STORAGE_KEY);
    if (!rawGames) {
      return [];
    }

    const parsedGames = JSON.parse(rawGames);
    if (!Array.isArray(parsedGames)) {
      return [];
    }

    return parsedGames.map((game, index) => ({
      id: game.id ?? Date.now() + index,
      opponent: typeof game.opponent === "string" && game.opponent.trim() ? game.opponent : `Game ${index + 1}`,
      ...Object.fromEntries(STAT_FIELDS.map((field) => [field.key, clampNumber(game[field.key])])),
    }));
  } catch {
    return [];
  }
}

function computeSimilarity(playerStats, userAverages) {
  const totalDistance = STAT_FIELDS.reduce((sum, field) => {
    const baseline = Math.max(playerStats[field.key], field.key.includes("Pct") ? 25 : 1);
    const delta = Math.abs(userAverages[field.key] - playerStats[field.key]) / baseline;
    return sum + delta * STAT_WEIGHTS[field.key];
  }, 0);

  return {
    distance: totalDistance,
    score: roundStat(Math.max(0, 100 - totalDistance * 18)),
  };
}

function buildArchetypeSummary(averages) {
  if (STAT_FIELDS.every((field) => averages[field.key] === 0)) {
    return "Only way is up from here.";
  }
  if (averages.points >= 27 && averages.threes >= 2.5) {
    return "High-volume scoring creator with real perimeter pressure.";
  }
  if (averages.assists >= 7 && averages.rebounds >= 7) {
    return "All-around engine who creates offense and fills the glass.";
  }
  if (averages.blocks >= 2 || (averages.rebounds >= 10 && averages.fgPct >= 52)) {
    return "Interior presence with strong rim impact and efficient finishing.";
  }
  if (averages.steals >= 2 && averages.points >= 20) {
    return "Two-way playmaker bringing scoring and disruptive defense.";
  }
  return "Balanced contributor whose profile will sharpen as more games are logged.";
}

function getStrengths(averages) {
  return [
    { label: "Scoring load", value: averages.points + averages.threes * 1.5 },
    { label: "Playmaking", value: averages.assists * 1.7 - averages.turnovers * 0.8 },
    { label: "Glass work", value: averages.rebounds * 1.4 },
    { label: "Defensive events", value: averages.steals * 2 + averages.blocks * 1.8 },
    { label: "Efficiency", value: averages.fgPct * 0.7 + averages.ftPct * 0.3 },
  ].sort((a, b) => b.value - a.value).slice(0, 3);
}

function getTopComparisons(averages, pool) {
  return pool.map((player) => {
    const similarity = computeSimilarity(player.stats, averages);

    return {
      ...player,
      ...similarity,
      differences: STAT_FIELDS.map((field) => ({
        ...field,
        delta: roundStat(averages[field.key] - player.stats[field.key]),
      })),
    };
  }).sort((a, b) => a.distance - b.distance);
}

function hasUsableStats(games, averages) {
  if (games.length === 0) {
    return false;
  }

  return STAT_FIELDS.some((field) => averages[field.key] > 0);
}

function getMilestones(averages) {
  const values = {
    points: averages.points,
    rebounds: averages.rebounds,
    assists: averages.assists,
    stealsBlocks: averages.steals + averages.blocks,
    efficiency: averages.fgPct * 0.6 + averages.ftPct * 0.4,
  };

  return MILESTONE_TRACKERS.map((tracker) => {
    const value = values[tracker.key];
    const reached = tracker.checkpoints.filter((checkpoint) => value >= checkpoint).length;
    const nextCheckpoint = tracker.checkpoints.find((checkpoint) => value < checkpoint) ?? null;

    return {
      ...tracker,
      value,
      reached,
      nextCheckpoint,
    };
  });
}

function groupFieldsByCategory() {
  return CATEGORY_ORDER.map((category) => ({
    category,
    fields: STAT_FIELDS.filter((field) => field.category === category),
  }));
}

function chooseComparisonPool(averages) {
  const veryLowProfile =
    averages.points <= 8 &&
    averages.rebounds <= 6 &&
    averages.assists <= 4;
  const lowerProfile =
    averages.points < 18 &&
    averages.rebounds < 7 &&
    averages.assists < 6;

  if (veryLowProfile) {
    return NBA_REPRESENTATIVE_PLAYERS;
  }

  return lowerProfile ? NBA_REPRESENTATIVE_PLAYERS : [...NBA_REPRESENTATIVE_PLAYERS, ...ALL_TIME_PLAYERS];
}

function isGoatProfile(averages) {
  const absurdCountingStats =
    averages.points >= 42 ||
    averages.rebounds >= 18 ||
    averages.assists >= 14 ||
    averages.steals >= 4 ||
    averages.blocks >= 5 ||
    averages.threes >= 7;

  const absurdEfficiency =
    (averages.points >= 35 && averages.fgPct >= 65) ||
    (averages.points >= 30 && averages.ftPct >= 95 && averages.threes >= 5);

  return absurdCountingStats || absurdEfficiency;
}

function hasAnyEnteredStats(form) {
  return STAT_FIELDS.some((field) => String(form[field.key]).trim() !== "");
}

function App() {
  const [games, setGames] = useState(loadSavedGames);
  const [form, setForm] = useState(() => ({ opponent: "", ...emptyForm() }));
  const [copied, setCopied] = useState(false);
  const [formWarning, setFormWarning] = useState("");
  const groupedFields = groupFieldsByCategory();

  const deferredGames = useDeferredValue(games);
  const averages = calculateAverages(deferredGames);
  const profileReady = hasUsableStats(deferredGames, averages);
  const goatProfile = isGoatProfile(averages);
  const comparisonPool = chooseComparisonPool(averages);
  const rankedComparisons = profileReady && !goatProfile ? getTopComparisons(averages, comparisonPool) : [];
  const comparisons = goatProfile ? [GOAT_PROFILE] : rankedComparisons;
  const bestMatch = goatProfile ? GOAT_PROFILE : comparisons[0];
  const runnerUp = goatProfile ? null : comparisons[1];
  const strengths = getStrengths(averages);
  const profileSummary = buildArchetypeSummary(averages);
  const milestones = getMilestones(averages);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }, [games]);

  const handleChange = (key, value) => {
    startTransition(() => {
      setFormWarning("");
      setForm((current) => ({ ...current, [key]: value }));
    });
  };

  const handleTemplateClick = (template) => {
    startTransition(() => {
      setFormWarning("");
      setForm((current) => ({
        ...current,
        opponent: current.opponent || template.label,
        ...Object.fromEntries(STAT_FIELDS.map((field) => [field.key, String(template.values[field.key])])),
      }));
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!hasAnyEnteredStats(form)) {
      setFormWarning("Add at least one stat before saving a game.");
      return;
    }

    const nextGame = {
      id: Date.now(),
      opponent: form.opponent.trim() || `Game ${games.length + 1}`,
      ...Object.fromEntries(STAT_FIELDS.map((field) => [field.key, clampNumber(form[field.key])])),
    };

    startTransition(() => {
      setGames((current) => [nextGame, ...current]);
      setForm({ opponent: "", ...emptyForm() });
      setCopied(false);
      setFormWarning("");
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setGames([]);
      setCopied(false);
    });
  };

  const removeGame = (id) => {
    startTransition(() => {
      setGames((current) => current.filter((game) => game.id !== id));
    });
  };

  const handleCopySummary = async () => {
    if (!bestMatch) {
      return;
    }

    const summary = `Closest comp: ${bestMatch.emoji} ${bestMatch.name} (${bestMatch.score}%)
Games logged: ${games.length}
Averages: ${STAT_FIELDS.map((field) => `${field.shortLabel} ${formatStat(averages[field.key])}`).join(" | ")}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Basketball / All-Time Matchup</p>
          <h1>Ballulator</h1>
          <p className="lede">
            A court-side tracker that turns your game log into running averages, then stacks them against legends or more realistic NBA-level comps depending on your stat profile.
          </p>

          <div className="stat-row">
            <div className="stat-card">
              <span>Games logged</span>
              <strong>{games.length}</strong>
            </div>
            <div className="stat-card">
              <span>Closest comp</span>
              <strong>{bestMatch ? `${bestMatch.emoji} ${bestMatch.name}` : "💩 No comp yet"}</strong>
            </div>
            <div className="stat-card">
              <span>Similarity</span>
              <strong>{bestMatch ? `${bestMatch.score}%` : "0%"}</strong>
            </div>
          </div>
        </div>

        <div className="hero-art-card">
          <div className="ball-icon-panel" aria-hidden="true">
            <div className="ball-icon">
              <span className="ball-seam ball-seam-vertical" />
              <span className="ball-seam ball-seam-horizontal" />
              <span className="ball-seam ball-seam-left" />
              <span className="ball-seam ball-seam-right" />
            </div>
          </div>
          <blockquote className="quote-card">
            <p>"Champions keep playing until they get it right."</p>
            <footer>Michael Jordan</footer>
          </blockquote>
        </div>
      </section>

      <section className="momentum-panel">
        <div className="momentum-highlight">
          <p className="panel-kicker">Momentum Board</p>
          <h2>Every stat line shifts your identity</h2>
          <p>
            Ballulator keeps re-reading your profile as the sample grows, so one hot night or one low-output game can still reshape the comp.
          </p>
        </div>
        <div className="momentum-graphic" aria-hidden="true">
          <div className="route-top">
            <span>Game Log</span>
            <span>Averages</span>
            <span>Legend Match</span>
          </div>
          <div className="route-line" />
          <div className="route-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="momentum-pillars">
          <div className="momentum-card">
            <span>Current read</span>
            <strong>{bestMatch ? `${bestMatch.emoji} ${bestMatch.name}` : "💩 No comp yet"}</strong>
          </div>
          <div className="momentum-card">
            <span>Profile note</span>
            <strong>{goatProfile ? "G O A T ceiling" : strengths[0]?.label ?? "Waiting"}</strong>
          </div>
        </div>
      </section>

      <section className="translator-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Tracker Panel</p>
            <h2>Enter your basketball stats</h2>
          </div>
          <button className="copy-button" onClick={handleCopySummary} type="button">
            {copied ? "Copied" : "Copy Summary"}
          </button>
        </div>

        <div className="translator-grid">
          <div className="input-card">
            <span>Game entry</span>
            <label className="entry-label">
              <span className="entry-label-text">Opponent or label</span>
              <input
                value={form.opponent}
                onChange={(event) => handleChange("opponent", event.target.value)}
                placeholder="Varsity opener"
                type="text"
              />
            </label>

            <div className="field-groups">
              {groupedFields.map((group) => (
                <section className="field-group" key={group.category}>
                  <p className="group-title">{group.category}</p>
                  <div className="stat-grid">
                    {group.fields.map((field) => (
                      <label className="field" key={field.key}>
                        <span>{field.shortLabel}</span>
                        <input
                          min="0"
                          onChange={(event) => handleChange(field.key, event.target.value)}
                          placeholder="0"
                          step={field.step}
                          type="number"
                          value={form[field.key]}
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {formWarning ? <p className="helper warning-text">{formWarning}</p> : null}

            <div className="action-row">
              <button className="submit-button" onClick={handleSubmit} type="button">
                Add Game
              </button>
              <button className="ghost-button" onClick={handleReset} type="button">
                Clear Log
              </button>
            </div>
          </div>

          <div className="output-card">
            <span>Closest player result</span>
            {bestMatch ? (
              <>
                <div className="result-hero">
                  <div className="result-emoji">{bestMatch.emoji}</div>
                  <div>
                    <div className="output-text">{bestMatch.name}</div>
                    <p className="helper">{bestMatch.era} • {bestMatch.archetype}</p>
                  </div>
                </div>
                <div className="result-badges">
                  <div className="badge-card">
                    <span>Match score</span>
                    <strong>{bestMatch.score}%</strong>
                  </div>
                  <div className="badge-card">
                    <span>{goatProfile ? "Status" : "Runner-up"}</span>
                    <strong>{goatProfile ? "Incomparable" : runnerUp ? `${runnerUp.emoji} ${runnerUp.name}` : "None"}</strong>
                  </div>
                </div>
                <div className="averages-board">
                  {STAT_FIELDS.slice(0, 6).map((field) => (
                    <div className="mini-stat" key={field.key}>
                      <span>{field.shortLabel}</span>
                      <strong>{formatStat(averages[field.key])}</strong>
                    </div>
                  ))}
                </div>
                <div className="strength-strip">
                  {goatProfile ? (
                    <>
                      <span>Unrealistic scoring</span>
                      <span>Broken comparison scale</span>
                      <span>No human comp</span>
                    </>
                  ) : (
                    strengths.map((strength) => (
                      <span key={strength.label}>{strength.label}</span>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="result-hero">
                  <div className="result-emoji">💩</div>
                  <div>
                    <div className="output-text">No comparison yet.</div>
                    <p className="helper">Only way is up from here. Add a real stat line to unlock your first player comp.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="example-strip">
          {QUICK_LINES.map((template) => (
            <button
              key={template.label}
              className="example-chip"
              onClick={() => handleTemplateClick(template)}
              type="button"
            >
              {template.label}
            </button>
          ))}
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="panel-kicker">Profile Read</p>
          <h3>Your average identity</h3>
          <p>{goatProfile ? "Your averages are beyond the player database, so Ballulator flags the profile as G O A T instead of pretending there is a fair match." : profileSummary}</p>
          <div className="limits-note">
            <strong>Tracked now:</strong> scoring, playmaking, rebounding, steals, blocks, threes, turnovers, fouls, FG%, and FT%.
          </div>
        </article>

        <article className="info-card">
          <p className="panel-kicker">Milestones</p>
          <h3>Five average goals</h3>
          <div className="milestone-list">
            {milestones.map((milestone) => (
              <div className="milestone-line" key={milestone.key}>
                <div>
                  <strong>{milestone.label}</strong>
                  <span>
                    {milestone.shortLabel} {formatStat(milestone.value)}
                  </span>
                </div>
                <div className="milestone-meta">
                  <span>{milestone.reached}/3 hit</span>
                  <strong>{milestone.nextCheckpoint ? `Next ${milestone.nextCheckpoint}` : "Maxed"}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="info-card">
          <p className="panel-kicker">Top Board</p>
          <h3>Closest player comps</h3>
          <div className="leaderboard-list">
            {goatProfile ? (
              <div className="leaderboard-line">
                <strong>👽 G O A T</strong>
                <span>Incomparable</span>
              </div>
            ) : comparisons.length > 0 ? (
              comparisons.slice(0, 4).map((player, index) => (
                <div className="leaderboard-line" key={player.name}>
                  <strong>#{index + 1} {player.emoji} {player.name}</strong>
                  <span>{player.score}% match</span>
                </div>
              ))
            ) : (
              <div className="leaderboard-line">
                <strong>💩 No ranked comps yet</strong>
                <span>Need real averages</span>
              </div>
            )}
          </div>
        </article>

        <article className="info-card conversation-card">
          <div className="conversation-box">
            <p className="conversation-title">Saved Game Log</p>
            <p className="conversation-subtitle">Recent entries keep updating the board</p>
            {games.length === 0 ? (
              <div className="conversation-line">
                <strong>Waiting:</strong> No games saved yet
                <span className="conversation-translation">Add one stat line to start the tracker.</span>
              </div>
            ) : (
              games.slice(0, 4).map((game) => (
                <div className="conversation-line" key={game.id}>
                  <strong>{game.opponent}</strong>
                  <span className="conversation-translation">
                    {STAT_FIELDS.slice(0, 6).map((field) => `${field.shortLabel} ${formatStat(game[field.key])}`).join(" • ")}
                  </span>
                  <button className="remove-link" onClick={() => removeGame(game.id)} type="button">
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
