import { InstrumentSpec, PromAnswer } from "./types";

export const SNAP_IV: InstrumentSpec = {
  key: "snap-iv",
  version: "1.0.0",
  title: "SNAP-IV (Short)",
  subscales: ["Inattention","Hyperactivity"],
  items: [
    { id: "q1", textParent: "Often fails to give close attention", textChild: "Sometimes misses small details", subscale: "Inattention" },
    { id: "q2", textParent: "Difficulty sustaining attention", textChild: "Hard to focus for long", subscale: "Inattention" },
    { id: "q3", textParent: "Fidgets or taps hands or feet", textChild: "Wriggles and fidgets", subscale: "Hyperactivity" },
  ],
  score: (answers: PromAnswer[]) => {
    const vals: Record<string, number[]> = { Inattention: [], Hyperactivity: [] };
    for (const a of answers) {
      const item = SNAP_IV.items.find(i => i.id === a.itemId);
      if (!item) continue;
      const val = Math.max(0, Math.min(3, a.value));
      vals[item.subscale].push(val);
    }
    const subscaleScores: Record<string, number> = {
      Inattention: avg(vals["Inattention"]) * 10,
      Hyperactivity: avg(vals["Hyperactivity"]) * 10
    };
    const total = avg([...vals["Inattention"], ...vals["Hyperactivity"]]) * 10;
    const flags = [];
    if (subscaleScores["Inattention"] >= 15) flags.push("Focus Support");
    if (subscaleScores["Hyperactivity"] >= 15) flags.push("Movement Breaks");
    return { total, subscales: subscaleScores, flags };
  }
};

function avg(arr: number[]) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
