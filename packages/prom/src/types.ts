export type Likert = 0 | 1 | 2 | 3; // Never→Very Often

export interface PromAnswer {
  itemId: string;
  value: Likert;
}

export interface InstrumentSpec {
  key: string; version: string; title: string;
  items: Array<{ id: string; textParent: string; textChild?: string; subscale: string; reverse?: boolean }>;
  subscales: string[]; // e.g. ["Inattention","Hyperactivity"]
  score: (answers: PromAnswer[]) => {
    total: number;
    subscales: Record<string, number>;
    flags: string[]; // e.g. ["Focus Support"]
  };
}
