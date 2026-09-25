import React, {createContext, useContext} from 'react';

export type Word = {w: string; s: number; e: number};
export type Para = {id: string; section: string; start: number; end: number; words: Word[]};
export type Timeline = {voice: string; duration: number; paragraphs: Para[]};

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9%-]/g, '');

/** Absolute-time lookups into the narration timeline. */
export const makeCues = (tl: Timeline) => {
  const byId = new Map(tl.paragraphs.map((p) => [p.id, p]));
  const para = (id: string) => {
    const p = byId.get(id);
    if (!p) throw new Error(`Unknown paragraph ${id}`);
    return p;
  };
  /** Time at which the nth occurrence of `word` (or a phrase) is spoken in paragraph `id`. */
  const word = (id: string, phrase: string, nth = 1) => {
    const p = para(id);
    const target = phrase.split(/\s+/).map(norm);
    let seen = 0;
    for (let i = 0; i + target.length <= p.words.length; i++) {
      if (target.every((w, k) => norm(p.words[i + k].w) === w)) {
        seen++;
        if (seen === nth) return p.words[i].s;
      }
    }
    throw new Error(`Cue "${phrase}" #${nth} not found in ${id}`);
  };
  return {para, word};
};

type Cues = ReturnType<typeof makeCues>;
const Ctx = createContext<{cues: Cues; offset: number} | null>(null);

export const CueProvider: React.FC<{cues: Cues; offset: number; children: React.ReactNode}> = ({cues, offset, children}) => (
  <Ctx.Provider value={{cues, offset}}>{children}</Ctx.Provider>
);

/** Scene-local cue helpers: c(pid, word) → seconds relative to the scene's Sequence. */
export const useCues = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCues outside CueProvider');
  const {cues, offset} = v;
  return {
    c: (id: string, phrase: string, nth = 1) => cues.word(id, phrase, nth) - offset,
    ps: (id: string) => cues.para(id).start - offset,
    pe: (id: string) => cues.para(id).end - offset,
  };
};
