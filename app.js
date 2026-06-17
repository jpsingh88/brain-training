'use strict';

// =====================================================
// BRAIN TRAINING APP — JAVASCRIPT
// =====================================================
// Structure:
//   1. Constants & Config
//   2. Game Data (word banks, synonyms, scrambles, categories)
//   3. App State
//   4. LocalStorage Persistence
//   5. Helper Utilities
//   6. Challenge Generators  ← edit these to add/change questions
//   7. Scoring Logic
//   8. UI Helpers
//   9. Session Flow
//   10. Home Screen
//   11. Event Listeners
// =====================================================


// ─────────────────────────────────────────────────────
// 1. CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────

const SESSION_SECS = 30 * 60; // 30-minute sessions

const CATS = ['math', 'memory', 'pattern', 'words', 'articulation'];

const CAT_CFG = {
  math:         { name: 'Mental Math',         icon: '🔢', cls: 'b-math'         },
  memory:       { name: 'Working Memory',      icon: '🧩', cls: 'b-memory'       },
  pattern:      { name: 'Pattern Recognition', icon: '🔍', cls: 'b-pattern'      },
  words:        { name: 'Word Recall',         icon: '📝', cls: 'b-words'        },
  articulation: { name: 'Articulation',        icon: '🗣️', cls: 'b-articulation' },
};

const BD_COLORS = {
  math: '#a69cff', memory: '#ff9ab0', pattern: '#ffc46a',
  words: '#7fefaa', articulation: '#f9a8d4',
};


// ─────────────────────────────────────────────────────
// 2. GAME DATA
// ─────────────────────────────────────────────────────

// ── Word Recall bank ──
const WORD_BANK = {
  easy: [
    'apple','house','river','cloud','music','bread','table','smile','light','water',
    'green','phone','chair','grass','stone','ocean','paper','voice','black','eagle',
    'tiger','happy','beach','night','flame','storm','dance','heart','dream','bridge',
  ],
  medium: [
    'journey','cabinet','whisper','balance','lantern','captain','harvest','crystal',
    'thunder','blanket','silence','village','patient','compass','dolphin','horizon',
    'miracle','courage','phantom','kingdom','mystery','fortune','liberty','shadow',
    'fragile','ancient','glacier','pilgrim','current','venture',
  ],
  hard: [
    'elaborate','momentum','synthesis','paradigm','ambiguous','eloquent','tangible',
    'coherent','obsolete','pragmatic','resilient','skeptical','meticulous','ephemeral',
    'intrinsic','plausible','intuitive','empirical','tenacious','arbitrary',
    'culminate','discernible','exemplary','formidable','acquiesce',
  ],
};

// ── Articulation: Category Sprint lists ──
// To add a new category: { name: 'Your Category', words: ['word1','word2',...] }
const CAT_LISTS = {
  easy: [
    { name: 'Animals', words: ['dog','cat','bird','fish','lion','tiger','elephant','monkey','rabbit','horse','cow','pig','sheep','duck','chicken','bear','wolf','fox','deer','frog','snake','turtle','parrot','eagle','owl','dolphin','whale','shark','crab','ant','bee','fly','goat','donkey','camel','penguin','koala','panda','giraffe','hippo'] },
    { name: 'Fruits',  words: ['apple','banana','orange','grape','mango','pear','peach','plum','cherry','lemon','lime','melon','kiwi','fig','coconut','papaya','strawberry','blueberry','raspberry','pineapple','avocado','watermelon','pomegranate','apricot','nectarine','guava','lychee','dragonfruit'] },
    { name: 'Sports',  words: ['soccer','football','basketball','tennis','cricket','baseball','golf','swimming','boxing','running','cycling','skiing','surfing','wrestling','badminton','volleyball','hockey','rugby','rowing','gymnastics','archery','karate','judo','fencing','polo','squash','lacrosse','handball','snooker'] },
    { name: 'Colors',  words: ['red','blue','green','yellow','orange','purple','pink','black','white','brown','gray','teal','gold','silver','maroon','navy','cyan','magenta','indigo','violet','turquoise','beige','ivory','scarlet','crimson','azure','jade','olive','coral','salmon'] },
  ],
  medium: [
    { name: 'Kitchen items',   words: ['knife','fork','spoon','plate','bowl','cup','pan','pot','oven','fridge','blender','toaster','microwave','kettle','spatula','colander','whisk','grater','ladle','tongs','strainer','apron','cutting board','timer','rolling pin','measuring cup','mixing bowl','sieve','peeler','can opener'] },
    { name: 'Capital cities',  words: ['london','paris','tokyo','berlin','rome','madrid','beijing','moscow','ottawa','canberra','delhi','cairo','oslo','stockholm','vienna','athens','lisbon','dublin','warsaw','seoul','ankara','bangkok','lima','nairobi','accra','bogota','jakarta','manila','santiago','amsterdam'] },
    { name: 'Emotions',        words: ['happy','sad','angry','afraid','surprised','disgusted','anxious','excited','proud','ashamed','guilty','jealous','hopeful','lonely','confused','frustrated','content','bored','nervous','relieved','grateful','embarrassed','nostalgic','melancholy','euphoric','indifferent','overwhelmed','curious','inspired','disappointed'] },
    { name: 'Work tools/apps', words: ['slack','email','jira','confluence','github','zoom','excel','powerpoint','google docs','trello','notion','figma','asana','salesforce','hubspot','tableau','snowflake','python','javascript','sql','api','dashboard','spreadsheet','calendar','database'] },
  ],
  hard: [
    { name: 'Words ending in -tion', words: ['action','nation','station','motion','notion','emotion','devotion','location','vacation','education','creation','relation','solution','attention','intention','mention','question','direction','position','function','section','fiction','fraction','traction','ambition','tradition','transition','innovation','communication','celebration'] },
    { name: 'Abstract concepts',     words: ['love','freedom','justice','truth','beauty','peace','faith','hope','courage','wisdom','honor','pride','shame','guilt','joy','grief','anger','trust','doubt','loyalty','integrity','empathy','creativity','ambition','resilience','compassion','autonomy','identity','consciousness','morality'] },
    { name: 'Business/TAM terms',    words: ['onboarding','escalation','churn','retention','sla','nps','roadmap','integration','migration','adoption','enablement','stakeholder','cadence','bandwidth','alignment','deliverable','kpi','okr','pilot','poc','discovery','qbr','executive sponsor','data quality','api','webhook','catalog','ingestion','normalization','reconciliation'] },
  ],
};

// ── Articulation: Synonym Match ──
// Format: { word, ans (correct), opts (all 4 options including correct) }
const SYNONYMS = {
  easy: [
    { word: 'HAPPY',  ans: 'Joyful',      opts: ['Joyful',      'Sad',        'Angry',    'Bored']  },
    { word: 'FAST',   ans: 'Quick',       opts: ['Quick',       'Slow',       'Heavy',    'Quiet']  },
    { word: 'BRAVE',  ans: 'Courageous',  opts: ['Courageous',  'Timid',      'Lazy',     'Weak']   },
    { word: 'SMART',  ans: 'Intelligent', opts: ['Intelligent', 'Dull',       'Clumsy',   'Loud']   },
    { word: 'BEGIN',  ans: 'Start',       opts: ['Start',       'End',        'Pause',    'Skip']   },
    { word: 'ANGRY',  ans: 'Furious',     opts: ['Furious',     'Calm',       'Happy',    'Tired']  },
    { word: 'KIND',   ans: 'Gentle',      opts: ['Gentle',      'Harsh',      'Rude',     'Loud']   },
    { word: 'QUIET',  ans: 'Silent',      opts: ['Silent',      'Noisy',      'Busy',     'Fast']   },
  ],
  medium: [
    { word: 'METICULOUS', ans: 'Thorough',   opts: ['Thorough',   'Reckless',   'Boring',   'Loud']       },
    { word: 'ELOQUENT',   ans: 'Articulate', opts: ['Articulate', 'Mute',       'Clumsy',   'Dull']       },
    { word: 'RESILIENT',  ans: 'Tough',      opts: ['Tough',      'Fragile',    'Passive',  'Vague']      },
    { word: 'AMBIGUOUS',  ans: 'Unclear',    opts: ['Unclear',    'Obvious',    'Precise',  'Certain']    },
    { word: 'PRAGMATIC',  ans: 'Practical',  opts: ['Practical',  'Idealistic', 'Reckless', 'Vague']      },
    { word: 'CANDID',     ans: 'Honest',     opts: ['Honest',     'Deceptive',  'Shy',      'Aggressive'] },
    { word: 'VERBOSE',    ans: 'Wordy',      opts: ['Wordy',      'Concise',    'Silent',   'Brief']      },
    { word: 'CONCISE',    ans: 'Brief',      opts: ['Brief',      'Lengthy',    'Vague',    'Loud']       },
  ],
  hard: [
    { word: 'PERSPICACIOUS', ans: 'Shrewd',       opts: ['Shrewd',       'Naive',       'Reckless',  'Vague']   },
    { word: 'TENACIOUS',     ans: 'Persistent',   opts: ['Persistent',   'Fickle',      'Lazy',      'Gentle']  },
    { word: 'EPHEMERAL',     ans: 'Fleeting',     opts: ['Fleeting',     'Eternal',     'Heavy',     'Rigid']   },
    { word: 'EQUIVOCAL',     ans: 'Ambiguous',    opts: ['Ambiguous',    'Clear',       'Decisive',  'Simple']  },
    { word: 'LOQUACIOUS',    ans: 'Talkative',    opts: ['Talkative',    'Quiet',       'Reserved',  'Shy']     },
    { word: 'INVETERATE',    ans: 'Habitual',     opts: ['Habitual',     'Occasional',  'Novice',    'Rare']    },
    { word: 'SANGUINE',      ans: 'Optimistic',   opts: ['Optimistic',   'Gloomy',      'Nervous',   'Bitter']  },
    { word: 'LACONIC',       ans: 'Brief',        opts: ['Brief',        'Verbose',     'Dramatic',  'Loud']    },
  ],
};

// ── Articulation: Word Unscramble ──
// sc = scrambled letters, ans = correct answer (uppercase), hint = clue
const SCRAMBLES = {
  easy: [
    { sc: 'AELP',  ans: 'PALE',  hint: 'Light in color'         },
    { sc: 'TALS',  ans: 'SALT',  hint: 'Table condiment'        },
    { sc: 'EALM',  ans: 'MALE',  hint: 'Opposite of female'     },
    { sc: 'ACEM',  ans: 'CAME',  hint: 'Arrived'                },
    { sc: 'TASE',  ans: 'SEAT',  hint: 'A place to sit'         },
    { sc: 'REAT',  ans: 'RATE',  hint: 'A speed or price'       },
    { sc: 'ELTA',  ans: 'TALE',  hint: 'A story'                },
    { sc: 'GELA',  ans: 'GALE',  hint: 'A strong wind'          },
    { sc: 'NAEM',  ans: 'NAME',  hint: 'What you are called'    },
    { sc: 'EALB',  ans: 'ABLE',  hint: 'Capable of something'   },
  ],
  medium: [
    { sc: 'SLIENT',  ans: 'LISTEN',  hint: 'Pay attention to sound'       },
    { sc: 'ELGINS',  ans: 'SINGLE',  hint: 'Not paired or grouped'        },
    { sc: 'IGENUS',  ans: 'GENIUS',  hint: 'Exceptional intelligence'     },
    { sc: 'LATSER',  ans: 'ALERTS',  hint: 'Warnings or notifications'    },
    { sc: 'TRICHES', ans: 'RICHEST', hint: 'Most wealthy'                 },
    { sc: 'STEADR',  ans: 'TRADES',  hint: 'Buying and selling'           },
    { sc: 'NITLEGS', ans: 'GLISTEN', hint: 'Shine with reflected light'   },
    { sc: 'ROMATES', ans: 'MAESTRO', hint: 'A master conductor'           },
  ],
  hard: [
    { sc: 'SLOTAUEB', ans: 'ABSOLUTE', hint: 'Complete and total'          },
    { sc: 'NAKLBEST', ans: 'BLANKETS', hint: 'Warm bed covers'             },
    { sc: 'PTCRASHE', ans: 'CHAPTERS', hint: 'Sections of a book'          },
    { sc: 'NUMODECT', ans: 'DOCUMENT', hint: 'An official paper or file'   },
    { sc: 'NATIMONU', ans: 'MOUNTAIN', hint: 'A large rocky hill'          },
    { sc: 'BBLASCRE', ans: 'SCRABBLE', hint: 'A popular word board game'   },
    { sc: 'LPETHSAA', ans: 'ASPHALT',  hint: 'Road paving material'        },
  ],
};


// ─────────────────────────────────────────────────────
// 3. APP STATE
// ─────────────────────────────────────────────────────

let S = {
  diff: 'easy',
  phase: 'idle',           // 'idle' | 'memorize' | 'answer' | 'feedback'
  sessLeft: SESSION_SECS,
  sessInterval: null,
  chalLeft: 30,
  chalLimit: 30,
  chalInterval: null,
  memTimeout: null,
  fbTimeout: null,
  memCountInterval: null,
  challenge: null,
  catIdx: 0,
  score: 0,
  results: [],             // array of { cat, correct, partial, total, pts }
  startTime: null,
  sprintWords: [],         // words logged during a category sprint
  choiceSelected: false,
};


// ─────────────────────────────────────────────────────
// 4. PERSISTENCE (localStorage)
// ─────────────────────────────────────────────────────

function load() {
  try { return JSON.parse(localStorage.getItem('btv3') || '{}'); } catch { return {}; }
}
function save(d) {
  try { localStorage.setItem('btv3', JSON.stringify(d)); } catch {}
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function getStored() {
  const d = load();
  return {
    streak:   d.streak   || 0,
    sessions: d.sessions || 0,
    bestAcc:  d.bestAcc  || null,
    lastDate: d.lastDate || null,
    diff:     d.diff     || 'easy',
  };
}
function recordSession(total, correct) {
  const d = load();
  const t = today();
  const acc = total > 0 ? Math.round(correct / total * 100) : 0;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d.lastDate === yesterday) d.streak = (d.streak || 0) + 1;
  else if (d.lastDate !== t)   d.streak = 1;
  d.lastDate  = t;
  d.sessions  = (d.sessions || 0) + 1;
  d.bestAcc   = Math.max(d.bestAcc || 0, acc);
  d.diff      = S.diff;
  save(d);
  return { streak: d.streak, acc };
}


// ─────────────────────────────────────────────────────
// 5. HELPER UTILITIES
// ─────────────────────────────────────────────────────

function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}


// ─────────────────────────────────────────────────────
// 6. CHALLENGE GENERATORS
// Edit these functions to change difficulty or add new question types.
// ─────────────────────────────────────────────────────

function genMath(d) {
  if (d === 'easy') {
    const t = ['add', 'sub', 'mul'][ri(0, 2)];
    if (t === 'add') { const a = ri(2,9), b = ri(2,9); return { cat:'math', q:`${a} + ${b}`, ans:String(a+b), tl:20 }; }
    if (t === 'sub') { const b = ri(2,9), a = ri(b,15); return { cat:'math', q:`${a} − ${b}`, ans:String(a-b), tl:20 }; }
    const a = ri(2,9), b = ri(2,9);
    return { cat:'math', q:`${a} × ${b}`, ans:String(a*b), tl:25 };
  }
  if (d === 'medium') {
    const t = ['add2', 'sub2', 'mul', 'pct'][ri(0, 3)];
    if (t === 'add2') { const a = ri(13,79), b = ri(13,79); return { cat:'math', q:`${a} + ${b}`, ans:String(a+b), tl:30 }; }
    if (t === 'sub2') { const b = ri(12,50), a = ri(b+10,99); return { cat:'math', q:`${a} − ${b}`, ans:String(a-b), tl:30 }; }
    if (t === 'mul')  { const a = ri(6,12), b = ri(6,12); return { cat:'math', q:`${a} × ${b}`, ans:String(a*b), tl:25 }; }
    const p = [10,20,25,50][ri(0,3)], base = ri(2,20)*10;
    return { cat:'math', q:`${p}% of ${base}`, ans:String(p*base/100), tl:35 };
  }
  // hard
  const t = ['mul2', 'step', 'pct2', 'sq'][ri(0, 3)];
  if (t === 'mul2') { const a = ri(11,25), b = ri(11,25); return { cat:'math', q:`${a} × ${b}`, ans:String(a*b), tl:50 }; }
  if (t === 'step') { const a = ri(2,9), b = ri(2,9), c = ri(2,9); return { cat:'math', q:`(${a} × ${b}) + ${c}`, ans:String(a*b+c), tl:35 }; }
  if (t === 'pct2') { const p = ri(1,9)*5, base = ri(10,40)*5; return { cat:'math', q:`${p}% of ${base}`, ans:String(p*base/100), tl:50 }; }
  const n = ri(11, 20);
  return { cat:'math', q:`${n}²`, ans:String(n*n), tl:45 };
}

function genMemory(d) {
  if (d === 'easy') {
    const len = ri(4,5), seq = Array.from({length:len}, () => ri(1,9)).join('');
    return { cat:'memory', type:'digit', seq, displayMs:3500, prompt:'Type the digits you just saw', ans:seq, tl:20 };
  }
  if (d === 'medium') {
    const len = ri(6,7), seq = Array.from({length:len}, () => ri(1,9)).join('');
    return { cat:'memory', type:'digit', seq, displayMs:4000, prompt:'Type the digits you just saw', ans:seq, tl:25 };
  }
  // hard: reverse digit span
  const len = ri(7,8), seq = Array.from({length:len}, () => ri(1,9)).join('');
  const rev = seq.split('').reverse().join('');
  return { cat:'memory', type:'digit-rev', seq, displayMs:5000, prompt:'Type the digits in REVERSE ORDER', ans:rev, tl:35 };
}

function genPattern(d) {
  if (d === 'easy') {
    const s = ri(1,10), step = ri(2,8), seq = [0,1,2,3,4].map(i => s + i*step);
    return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Find the common difference', tl:28 };
  }
  if (d === 'medium') {
    const t = ['geo', 'fib', 'alt'][ri(0, 2)];
    if (t === 'geo') {
      const s = ri(1,4), r = ri(2,3), seq = [0,1,2,3,4].map(i => s * Math.pow(r,i));
      return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Each term is multiplied by the same number', tl:35 };
    }
    if (t === 'fib') {
      const a = ri(1,4), b = ri(1,6), seq = [a, b];
      for (let i = 2; i < 5; i++) seq.push(seq[i-1] + seq[i-2]);
      return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Each term = sum of two previous', tl:35 };
    }
    // alternating
    const a0 = ri(2,8), sA = ri(2,5), b0 = ri(2,8), sB = ri(2,5);
    const seq = [a0, b0, a0+sA, b0+sB, a0+2*sA, b0+2*sB];
    return { cat:'pattern', q:`${seq.slice(0,5).join(', ')}, ?`, ans:String(seq[5]), hint:'Two interleaved sequences', tl:42 };
  }
  // hard
  const t = ['sq', 'cube', 'primes', 'poly'][ri(0, 3)];
  if (t === 'sq')     { const off = ri(1,6), seq = [0,1,2,3,4].map(i => (i+off)*(i+off)); return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Perfect squares', tl:40 }; }
  if (t === 'cube')   { const off = ri(1,4), seq = [0,1,2,3,4].map(i => Math.pow(i+off,3)); return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Perfect cubes', tl:45 }; }
  if (t === 'primes') { const s = ri(1,10), primes = [2,3,5,7,11], seq = [s]; for (let i=0;i<4;i++) seq.push(seq[i]+primes[i]); return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Differences are prime numbers', tl:50 }; }
  const c = ri(1,4), seq = [1,2,3,4,5].map(n => n*n + n + c);
  return { cat:'pattern', q:`${seq.slice(0,4).join(', ')}, ?`, ans:String(seq[4]), hint:'Check second differences', tl:55 };
}

function genWords(d) {
  const counts   = { easy:4, medium:6, hard:8 };
  const ms       = { easy:8000, medium:11000, hard:14000 };
  const timeLims = { easy:35, medium:50, hard:70 };
  const words = shuffle([...WORD_BANK[d]]).slice(0, counts[d]);
  return { cat:'words', type:'words', words, displayMs:ms[d], prompt:'Type every word you remember', ans:words, tl:timeLims[d] };
}

function genArticulation(d) {
  const t = ['cat-sprint', 'synonym', 'unscramble'][ri(0, 2)];

  if (t === 'cat-sprint') {
    const lists  = CAT_LISTS[d];
    const picked = lists[ri(0, lists.length - 1)];
    return { cat:'articulation', type:'cat-sprint', categoryName:picked.name, validWords:picked.words, tl:45 };
  }
  if (t === 'synonym') {
    const s = shuffle([...SYNONYMS[d]])[0];
    const timeLims = { easy:20, medium:18, hard:15 };
    return { cat:'articulation', type:'synonym', word:s.word, ans:s.ans, opts:shuffle([...s.opts]), tl:timeLims[d] };
  }
  // unscramble
  const s = shuffle([...SCRAMBLES[d]])[0];
  const timeLims = { easy:30, medium:35, hard:45 };
  return { cat:'articulation', type:'unscramble', sc:s.sc, ans:s.ans, hint:s.hint, tl:timeLims[d] };
}

function makeChallenge(cat, d) {
  switch (cat) {
    case 'math':         return genMath(d);
    case 'memory':       return genMemory(d);
    case 'pattern':      return genPattern(d);
    case 'words':        return genWords(d);
    case 'articulation': return genArticulation(d);
  }
}


// ─────────────────────────────────────────────────────
// 7. SCORING LOGIC
// ─────────────────────────────────────────────────────

function scoreIt(ch, input) {
  // Word Recall: partial credit per word recalled
  if (ch.cat === 'words') {
    const typed = input.toLowerCase().split(/[\s,;]+/).map(w => w.trim()).filter(Boolean);
    const got   = ch.ans.filter(w => typed.includes(w.toLowerCase()));
    const miss  = ch.ans.filter(w => !typed.includes(w.toLowerCase()));
    return { correct: got.length === ch.ans.length, pts: got.length * 15, got, miss, partial: got.length };
  }
  // Category Sprint: count valid unique words
  if (ch.type === 'cat-sprint') {
    const typed  = Array.isArray(input) ? input : input.toLowerCase().split(/[\s,;]+/).map(w => w.trim()).filter(Boolean);
    const got    = [...new Set(typed.filter(w => ch.validWords.includes(w.toLowerCase())))];
    return { correct: got.length > 0, pts: got.length * 12, got, miss: [], partial: got.length, total: got.length };
  }
  // Synonym: correct/wrong
  if (ch.type === 'synonym') {
    const correct = input === ch.ans;
    const base    = { easy:30, medium:50, hard:70 }[S.diff];
    const pts     = correct ? base + Math.round(10 * (S.chalLeft / S.chalLimit)) : 0;
    return { correct, pts, got: [], miss: [], partial: correct ? 1 : 0 };
  }
  // All others (math, pattern, memory, unscramble): exact match
  const correct = input.trim().toUpperCase() === ch.ans.toUpperCase();
  let pts = 0;
  if (correct) {
    const base = { easy:20, medium:35, hard:55 }[S.diff];
    pts = base + Math.round(base * 0.5 * (S.chalLeft / S.chalLimit));
  }
  return { correct, pts, got: [], miss: [], partial: correct ? 1 : 0 };
}


// ─────────────────────────────────────────────────────
// 8. UI HELPERS
// ─────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showPhase(id) {
  ['ph-memorize', 'ph-answer', 'ph-feedback'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) target.style.display = 'flex';
}

function setBadge(elId, cat) {
  const el = document.getElementById(elId);
  const c  = CAT_CFG[cat];
  el.textContent = c.icon + ' ' + c.name;
  el.className   = 'cat-badge ' + c.cls;
}

function updateHeader() {
  const t = document.getElementById('sess-timer');
  t.textContent = fmt(S.sessLeft);
  t.className   = 'session-timer' + (S.sessLeft < 120 ? ' urgent' : '');
  document.getElementById('sess-score').textContent = S.score;
  document.getElementById('sess-progress').style.width = ((1 - S.sessLeft / SESSION_SECS) * 100) + '%';
}

function updateChalTimer(fillId, numId) {
  const pct = S.chalLeft / S.chalLimit * 100;
  const f   = document.getElementById(fillId);
  if (f) { f.style.width = pct + '%'; f.className = 'timer-fill' + (pct > 50 ? '' : pct > 25 ? ' warn' : ' dang'); }
  const n = document.getElementById(numId);
  if (n) n.textContent = S.chalLeft;
}


// ─────────────────────────────────────────────────────
// 9. SESSION FLOW
// ─────────────────────────────────────────────────────

function startSession() {
  S.sessLeft = SESSION_SECS; S.score = 0; S.results = []; S.catIdx = 0; S.startTime = Date.now();
  showScreen('s-session');
  updateHeader();
  clearInterval(S.sessInterval);
  S.sessInterval = setInterval(() => {
    S.sessLeft--;
    updateHeader();
    if (S.sessLeft <= 0) { clearInterval(S.sessInterval); endSession(); }
  }, 1000);
  nextChallenge();
}

function nextChallenge() {
  const cat = CATS[S.catIdx % CATS.length];
  S.catIdx++;
  S.challenge   = makeChallenge(cat, S.diff);
  S.sprintWords = [];
  const ch = S.challenge;
  if (ch.type === 'digit' || ch.type === 'digit-rev' || ch.type === 'words') startMemorize();
  else startAnswer();
}

function startMemorize() {
  S.phase = 'memorize';
  showPhase('ph-memorize');
  const ch = S.challenge;
  setBadge('mem-badge', ch.cat);

  if (ch.type === 'digit' || ch.type === 'digit-rev') {
    document.getElementById('mem-instruction').textContent =
      ch.type === 'digit-rev' ? "Memorize these digits — you'll type them BACKWARDS" : 'Memorize these digits';
    document.getElementById('mem-content').innerHTML = `<div class="mem-sequence">${ch.seq}</div>`;
  } else {
    document.getElementById('mem-instruction').textContent = 'Memorize these words';
    document.getElementById('mem-content').innerHTML =
      `<div class="mem-words">${ch.words.map(w => `<span class="word-chip">${w}</span>`).join('')}</div>`;
  }

  let t = Math.ceil(ch.displayMs / 1000);
  const cel = document.getElementById('mem-count');
  cel.innerHTML = `Disappears in <span>${t}s</span>`;
  clearInterval(S.memCountInterval);
  S.memCountInterval = setInterval(() => {
    t--;
    if (t > 0) cel.innerHTML = `Disappears in <span>${t}s</span>`;
    else clearInterval(S.memCountInterval);
  }, 1000);

  clearTimeout(S.memTimeout);
  S.memTimeout = setTimeout(() => { clearInterval(S.memCountInterval); startAnswer(); }, ch.displayMs);
}

function startAnswer() {
  S.phase = 'answer';
  showPhase('ph-answer');
  const ch = S.challenge;
  setBadge('ans-badge', ch.cat);
  S.choiceSelected = false;

  const inp         = document.getElementById('ans-input');
  const textArea    = document.getElementById('text-input-area');
  const choiceArea  = document.getElementById('choice-input-area');
  const sprintChips = document.getElementById('sprint-chips');

  inp.value = ''; inp.className = 'answer-input';
  sprintChips.style.display = 'none'; sprintChips.innerHTML = '';

  if (ch.type === 'synonym') {
    textArea.style.display  = 'none';
    choiceArea.style.display = 'block';
    const grid = document.getElementById('choice-grid');
    grid.innerHTML = ch.opts.map(o => `<button class="choice-btn" data-opt="${o}">${o}</button>`).join('');
    grid.querySelectorAll('.choice-btn').forEach(btn => btn.addEventListener('click', () => handleChoice(btn.dataset.opt)));
  } else {
    textArea.style.display  = 'block';
    choiceArea.style.display = 'none';
    if      (ch.type === 'cat-sprint') { inp.className = 'answer-input word-input'; inp.placeholder = `${ch.categoryName}… type them separated by commas`; sprintChips.style.display = 'flex'; }
    else if (ch.cat  === 'memory')     { inp.placeholder = 'Type the digits…'; }
    else if (ch.cat  === 'words')      { inp.className = 'answer-input word-input'; inp.placeholder = 'apple, house, river…'; }
    else if (ch.type === 'unscramble') { inp.placeholder = 'Type the word…'; }
    else                               { inp.placeholder = 'Answer…'; }
  }

  const promptEl = document.getElementById('ch-prompt');
  const mainEl   = document.getElementById('ch-main');
  const hintEl   = document.getElementById('ch-hint');

  if      (ch.cat  === 'memory')     { promptEl.textContent = ch.prompt; mainEl.textContent = ''; hintEl.style.display = 'none'; }
  else if (ch.cat  === 'words')      { promptEl.textContent = ch.prompt; mainEl.textContent = ''; hintEl.style.display = 'none'; }
  else if (ch.type === 'cat-sprint') { promptEl.textContent = '🗣️ Verbal Fluency Sprint'; mainEl.textContent = ch.categoryName; hintEl.textContent = 'Type as many as you can — separated by commas. Each valid word scores!'; hintEl.style.display = 'block'; }
  else if (ch.type === 'synonym')    { promptEl.textContent = 'Which word means the same as:'; mainEl.textContent = ch.word; hintEl.style.display = 'none'; }
  else if (ch.type === 'unscramble') { promptEl.textContent = 'Unscramble these letters:'; mainEl.textContent = ch.sc.split('').join(' − '); hintEl.textContent = 'Hint: ' + ch.hint; hintEl.style.display = 'block'; }
  else { promptEl.textContent = CAT_CFG[ch.cat].icon + ' ' + CAT_CFG[ch.cat].name; mainEl.textContent = (ch.q || '') + ' = ?'; hintEl.style.display = ch.hint ? 'block' : 'none'; if (ch.hint) hintEl.textContent = ch.hint; }

  S.chalLimit = ch.tl || 30; S.chalLeft = S.chalLimit;
  updateChalTimer('ch-timer-fill', 'ch-timer-num');
  updateChalTimer('ch-timer-fill2', 'ch-timer-num2');
  clearInterval(S.chalInterval);
  S.chalInterval = setInterval(() => {
    S.chalLeft--;
    updateChalTimer('ch-timer-fill', 'ch-timer-num');
    updateChalTimer('ch-timer-fill2', 'ch-timer-num2');
    if (S.chalLeft <= 0) { clearInterval(S.chalInterval); submitAnswer(true); }
  }, 1000);

  setTimeout(() => { if (ch.type !== 'synonym') inp.focus(); }, 80);
}

function handleChoice(opt) {
  if (S.choiceSelected) return;
  S.choiceSelected = true;
  clearInterval(S.chalInterval);
  const ch  = S.challenge;
  const res = scoreIt(ch, opt);
  S.score += res.pts;
  S.results.push({ cat: ch.cat, correct: res.correct, partial: res.partial, total: 1, pts: res.pts });
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.opt === ch.ans)                        btn.classList.add('correct');
    else if (btn.dataset.opt === opt && !res.correct)      btn.classList.add('wrong');
  });
  setTimeout(() => showFeedback(ch, res, false), 800);
}

// Category sprint: lock a word when the user presses comma or Enter
document.getElementById('ans-input').addEventListener('keydown', function(e) {
  if (S.phase !== 'answer') return;
  const ch = S.challenge;
  if (ch && ch.type === 'cat-sprint') {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const val = this.value.replace(/,/g, '').trim().toLowerCase();
      if (val.length > 1 && !S.sprintWords.includes(val)) {
        S.sprintWords.push(val);
        const chip = document.createElement('span');
        chip.className   = 'sprint-chip';
        chip.textContent = val;
        document.getElementById('sprint-chips').appendChild(chip);
      }
      this.value = '';
    }
  } else if (e.key === 'Enter') {
    submitAnswer(false);
  }
});

function submitAnswer(timeUp = false) {
  clearInterval(S.chalInterval);
  const ch = S.challenge;
  if (ch.type === 'synonym') return; // handled by handleChoice

  let input;
  if (ch.type === 'cat-sprint') {
    const remaining = document.getElementById('ans-input').value.replace(/,/g, '').trim().toLowerCase();
    if (remaining.length > 1 && !S.sprintWords.includes(remaining)) S.sprintWords.push(remaining);
    input = S.sprintWords;
  } else {
    input = timeUp ? '' : document.getElementById('ans-input').value;
  }

  const res = scoreIt(ch, input);
  S.score += res.pts;
  S.results.push({
    cat:     ch.cat,
    correct: res.correct,
    partial: res.partial,
    total:   ch.cat === 'words' ? ch.ans.length : ch.type === 'cat-sprint' ? Math.max(res.partial, 1) : 1,
    pts:     res.pts,
  });
  if (ch.cat !== 'words' && ch.type !== 'cat-sprint') {
    document.getElementById('ans-input').className = 'answer-input ' + (res.correct ? 'is-correct' : 'is-wrong');
  }
  showFeedback(ch, res, timeUp);
}

function showFeedback(ch, res, timeUp) {
  S.phase = 'feedback';
  showPhase('ph-feedback');
  const icon    = document.getElementById('fb-icon');
  const text    = document.getElementById('fb-text');
  const ansEl   = document.getElementById('fb-answer');
  const ptsEl   = document.getElementById('fb-points');
  const wordsEl = document.getElementById('fb-words');

  if (ch.cat === 'words') {
    const pct = Math.round(res.got.length / ch.ans.length * 100);
    icon.textContent  = pct >= 80 ? '✅' : pct >= 50 ? '👍' : '❌';
    text.textContent  = `${res.got.length} / ${ch.ans.length} words recalled`;
    text.className    = 'fb-text ' + (pct >= 60 ? 'fb-correct' : 'fb-wrong');
    ansEl.style.display = 'none';
    wordsEl.innerHTML = ch.ans.map(w => {
      const got = res.got.includes(w);
      return `<span class="fw ${got ? 'fw-got' : 'fw-miss'}">${w}</span>`;
    }).join('');
    wordsEl.style.display = 'flex';
  } else if (ch.type === 'cat-sprint') {
    icon.textContent  = res.partial >= 8 ? '🔥' : res.partial >= 5 ? '✅' : res.partial >= 2 ? '👍' : '❌';
    text.textContent  = `${res.partial} valid ${ch.categoryName.toLowerCase()} named`;
    text.className    = 'fb-text ' + (res.partial >= 5 ? 'fb-correct' : 'fb-wrong');
    ansEl.style.display = 'none';
    if (res.got.length > 0) {
      wordsEl.innerHTML     = res.got.map(w => `<span class="fw fw-got">${w}</span>`).join('');
      wordsEl.style.display = 'flex';
    } else { wordsEl.style.display = 'none'; }
  } else if (timeUp && !res.correct) {
    icon.textContent      = '⏰'; text.textContent = "Time's up!"; text.className = 'fb-text fb-wrong';
    ansEl.textContent     = `Answer: ${ch.ans}`; ansEl.style.display = 'block'; wordsEl.style.display = 'none';
  } else if (res.correct) {
    icon.textContent      = '✅'; text.textContent = 'Correct!'; text.className = 'fb-text fb-correct';
    ansEl.style.display   = 'none'; wordsEl.style.display = 'none';
  } else {
    icon.textContent      = '❌'; text.textContent = 'Not quite'; text.className = 'fb-text fb-wrong';
    ansEl.textContent     = `Answer: ${ch.ans}`; ansEl.style.display = 'block'; wordsEl.style.display = 'none';
  }

  ptsEl.style.display = res.pts > 0 ? 'block' : 'none';
  if (res.pts > 0) ptsEl.textContent = `+${res.pts} pts`;
  updateHeader();
  clearTimeout(S.fbTimeout);
  S.fbTimeout = setTimeout(() => { if (S.sessLeft > 0) nextChallenge(); }, 2500);
}

function endSession() {
  clearInterval(S.sessInterval); clearInterval(S.chalInterval);
  clearTimeout(S.memTimeout); clearTimeout(S.fbTimeout); clearInterval(S.memCountInterval);

  const total   = S.results.length;
  const correct = S.results.filter(r => r.correct).length;
  const { streak, acc } = recordSession(total, correct);
  const elapsed = Math.round((Date.now() - S.startTime) / 1000);

  document.getElementById('sum-pts').textContent    = S.score;
  document.getElementById('sum-acc').textContent    = acc + '%';
  document.getElementById('sum-chal').textContent   = total;
  document.getElementById('sum-streak').textContent = streak + ' 🔥';
  document.getElementById('sum-time').textContent   = `${Math.floor(elapsed/60)}m ${elapsed%60}s`;
  document.getElementById('sum-emoji').textContent  = acc >= 80 ? '🎉' : acc >= 60 ? '💪' : '🧠';
  document.getElementById('sum-title').textContent  = acc >= 80 ? 'Excellent Session!' : acc >= 60 ? 'Good Work!' : 'Keep Practicing!';

  const cs = {};
  CATS.forEach(c => { cs[c] = { correct: 0, total: 0 }; });
  S.results.forEach(r => { cs[r.cat].total += r.total || 1; cs[r.cat].correct += r.partial || 0; });

  document.getElementById('bd-list').innerHTML = CATS.map(c => {
    const s   = cs[c];
    const pct = s.total > 0 ? Math.round(s.correct / s.total * 100) : null;
    return `<div class="bd-item">
      <div class="bd-icon">${CAT_CFG[c].icon}</div>
      <div class="bd-name">${CAT_CFG[c].name}</div>
      <div class="bd-track"><div class="bd-fill" style="width:${pct ?? 0}%;background:${BD_COLORS[c]}"></div></div>
      <div class="bd-pct" style="color:${BD_COLORS[c]}">${pct !== null ? pct + '%' : '—'}</div>
    </div>`;
  }).join('');

  showScreen('s-summary');
  loadHomeStats();
}


// ─────────────────────────────────────────────────────
// 10. HOME SCREEN
// ─────────────────────────────────────────────────────

function loadHomeStats() {
  const d = getStored();
  document.getElementById('h-streak').textContent   = d.streak;
  document.getElementById('h-sessions').textContent = d.sessions;
  document.getElementById('h-accuracy').textContent = d.bestAcc !== null ? d.bestAcc + '%' : '—';
  document.getElementById('h-played').style.display = d.lastDate === today() ? 'flex' : 'none';
  setDiff(d.diff || 'easy', false);
}

function setDiff(d, persist = true) {
  S.diff = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('sel', b.dataset.d === d));
  if (persist) { const dd = load(); dd.diff = d; save(dd); }
}


// ─────────────────────────────────────────────────────
// 11. EVENT LISTENERS
// ─────────────────────────────────────────────────────

document.getElementById('btn-start').addEventListener('click', startSession);
document.getElementById('btn-submit').addEventListener('click', () => { if (S.phase === 'answer') submitAnswer(false); });
document.getElementById('btn-end').addEventListener('click', () => { if (confirm('End session early? Your progress will be saved.')) endSession(); });
document.getElementById('btn-again').addEventListener('click', startSession);
document.getElementById('btn-home').addEventListener('click', () => { loadHomeStats(); showScreen('s-home'); });
document.querySelectorAll('.diff-btn').forEach(b => b.addEventListener('click', () => setDiff(b.dataset.d)));

// ── Init ──
loadHomeStats();
