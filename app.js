'use strict';

// =====================================================
// BRAIN TRAINING APP — JAVASCRIPT
// =====================================================
// 1. Constants & Config
// 2. Game Data
// 3. App State
// 4. LocalStorage Persistence
// 5. Helper Utilities
// 6. Challenge Generators
// 7. Scoring Logic
// 8. UI Helpers
// 9. Session Flow
// 10. Home Screen
// 11. Event Listeners
// =====================================================


// ─────────────────────────────────────────────────────
// 1. CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────

const SESSION_SECS = 15 * 60; // 15-minute sessions

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
    'candle','forest','mirror','silver','garden','rocket','window','carpet','ladder','pocket',
  ],
  medium: [
    'journey','cabinet','whisper','balance','lantern','captain','harvest','crystal',
    'thunder','blanket','silence','village','patient','compass','dolphin','horizon',
    'miracle','courage','phantom','kingdom','mystery','fortune','liberty','shadow',
    'fragile','ancient','glacier','pilgrim','current','venture','vintage','cascade',
    'eclipse','chimney','lanyard','turmoil','feather','chapter','council','furnace',
  ],
  hard: [
    'elaborate','momentum','synthesis','paradigm','ambiguous','eloquent','tangible',
    'coherent','obsolete','pragmatic','resilient','skeptical','meticulous','ephemeral',
    'intrinsic','plausible','intuitive','empirical','tenacious','arbitrary',
    'culminate','discernible','exemplary','formidable','acquiesce','immaculate',
    'precarious','spontaneous','clandestine','ambivalent','superfluous','circumspect',
  ],
};

// ── Letters for letter-span memory ──
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ'.split('');

// ── Articulation: Category Sprint lists ──
const CAT_LISTS = {
  easy: [
    { name: 'Animals',        words: ['dog','cat','bird','fish','lion','tiger','elephant','monkey','rabbit','horse','cow','pig','sheep','duck','chicken','bear','wolf','fox','deer','frog','snake','turtle','parrot','eagle','owl','dolphin','whale','shark','crab','ant','bee','goat','donkey','camel','penguin','koala','panda','giraffe','hippo','crocodile','flamingo','peacock','hamster','squirrel','beaver'] },
    { name: 'Fruits',         words: ['apple','banana','orange','grape','mango','pear','peach','plum','cherry','lemon','lime','melon','kiwi','fig','coconut','papaya','strawberry','blueberry','raspberry','pineapple','avocado','watermelon','pomegranate','apricot','nectarine','guava','lychee','dragonfruit','passion fruit','jackfruit','persimmon','tangerine','clementine','cranberry','blackberry'] },
    { name: 'Sports',         words: ['soccer','football','basketball','tennis','cricket','baseball','golf','swimming','boxing','running','cycling','skiing','surfing','wrestling','badminton','volleyball','hockey','rugby','rowing','gymnastics','archery','karate','judo','fencing','squash','lacrosse','handball','snooker','ping pong','polo','sailing','triathlon','marathon','sprinting','hurdles'] },
    { name: 'Colors',         words: ['red','blue','green','yellow','orange','purple','pink','black','white','brown','gray','teal','gold','silver','maroon','navy','cyan','magenta','indigo','violet','turquoise','beige','ivory','scarlet','crimson','azure','jade','olive','coral','salmon','lavender','amber','khaki','burgundy','chartreuse'] },
    { name: 'Countries',      words: ['usa','india','china','brazil','france','germany','japan','canada','australia','mexico','italy','spain','russia','uk','argentina','nigeria','egypt','turkey','iran','thailand','vietnam','indonesia','pakistan','bangladesh','kenya','ghana','colombia','chile','peru','ukraine','poland','sweden','norway','denmark','finland'] },
    { name: 'Body parts',     words: ['head','arm','leg','hand','foot','eye','ear','nose','mouth','heart','lung','kidney','stomach','brain','spine','shoulder','elbow','wrist','knee','ankle','thumb','finger','toe','hip','chest','neck','chin','cheek','jaw','tongue','teeth','hair','eyebrow','eyelid','heel'] },
  ],
  medium: [
    { name: 'Kitchen items',   words: ['knife','fork','spoon','plate','bowl','cup','pan','pot','oven','fridge','blender','toaster','microwave','kettle','spatula','colander','whisk','grater','ladle','tongs','strainer','apron','cutting board','timer','rolling pin','measuring cup','mixing bowl','sieve','peeler','can opener','garlic press','citrus squeezer','meat thermometer','baking tray','casserole dish'] },
    { name: 'Capital cities',  words: ['london','paris','tokyo','berlin','rome','madrid','beijing','moscow','ottawa','canberra','delhi','cairo','oslo','stockholm','vienna','athens','lisbon','dublin','warsaw','seoul','ankara','bangkok','lima','nairobi','accra','bogota','jakarta','manila','santiago','amsterdam','brussels','copenhagen','helsinki','budapest','bucharest','zagreb','bern','luxembourg','reykjavik','valletta'] },
    { name: 'Emotions',        words: ['happy','sad','angry','afraid','surprised','disgusted','anxious','excited','proud','ashamed','guilty','jealous','hopeful','lonely','confused','frustrated','content','bored','nervous','relieved','grateful','embarrassed','nostalgic','melancholy','euphoric','indifferent','overwhelmed','curious','inspired','disappointed','irritated','amused','skeptical','touched','apathetic','serene'] },
    { name: 'Work tools/apps', words: ['slack','email','jira','confluence','github','zoom','excel','powerpoint','google docs','trello','notion','figma','asana','salesforce','hubspot','tableau','snowflake','python','javascript','sql','api','dashboard','spreadsheet','calendar','database','linear','clickup','miro','loom','airtable','retool','looker','amplitude','segment','intercom'] },
    { name: 'Science terms',   words: ['atom','molecule','gravity','friction','velocity','acceleration','density','pressure','photosynthesis','evolution','dna','rna','protein','enzyme','bacteria','virus','mitosis','meiosis','ecosystem','habitat','isotope','proton','neutron','electron','wavelength','frequency','electrode','catalyst','oxidation','reduction'] },
    { name: 'Geography',       words: ['mountain','river','ocean','desert','forest','lake','valley','volcano','island','peninsula','canyon','glacier','waterfall','plateau','reef','delta','estuary','savanna','tundra','rainforest','continent','hemisphere','latitude','longitude','equator','tropics','basin','strait','archipelago','lagoon'] },
  ],
  hard: [
    { name: 'Words ending in -tion', words: ['action','nation','station','motion','notion','emotion','devotion','location','vacation','education','creation','relation','solution','attention','intention','mention','question','direction','position','function','section','fiction','fraction','traction','ambition','tradition','transition','innovation','communication','celebration','constitution','collaboration','administration','investigation','interpretation','implementation','transformation','preservation','justification','negotiation'] },
    { name: 'Abstract concepts',     words: ['love','freedom','justice','truth','beauty','peace','faith','hope','courage','wisdom','honor','pride','shame','guilt','joy','grief','anger','trust','doubt','loyalty','integrity','empathy','creativity','ambition','resilience','compassion','autonomy','identity','consciousness','morality','nostalgia','virtue','sovereignty','democracy','equality','infinity','paradox','serendipity','epiphany','metamorphosis'] },
    { name: 'Business/TAM terms',    words: ['onboarding','escalation','churn','retention','sla','nps','roadmap','integration','migration','adoption','enablement','stakeholder','cadence','bandwidth','alignment','deliverable','kpi','okr','pilot','poc','discovery','qbr','executive sponsor','data quality','api','webhook','catalog','ingestion','normalization','reconciliation','monetization','segmentation','attribution','benchmarking','go-to-market','product-led growth','customer success','revenue operations'] },
    { name: 'Philosophy terms',      words: ['epistemology','ontology','metaphysics','ethics','aesthetics','logic','empiricism','rationalism','phenomenology','existentialism','nihilism','utilitarianism','stoicism','dialectic','axiom','deduction','induction','paradox','solipsism','relativism','determinism','free will','categorical imperative','social contract','virtue ethics','pragmatism','constructivism','dualism','monism','skepticism'] },
  ],
};

// ── Articulation: Synonym Match ──
const SYNONYMS = {
  easy: [
    { word:'HAPPY',   ans:'Joyful',      opts:['Joyful','Sad','Angry','Bored']       },
    { word:'FAST',    ans:'Quick',       opts:['Quick','Slow','Heavy','Quiet']        },
    { word:'BRAVE',   ans:'Courageous',  opts:['Courageous','Timid','Lazy','Weak']    },
    { word:'SMART',   ans:'Intelligent', opts:['Intelligent','Dull','Clumsy','Loud']  },
    { word:'BEGIN',   ans:'Start',       opts:['Start','End','Pause','Skip']          },
    { word:'ANGRY',   ans:'Furious',     opts:['Furious','Calm','Happy','Tired']      },
    { word:'KIND',    ans:'Gentle',      opts:['Gentle','Harsh','Rude','Loud']        },
    { word:'QUIET',   ans:'Silent',      opts:['Silent','Noisy','Busy','Fast']        },
    { word:'COLD',    ans:'Chilly',      opts:['Chilly','Hot','Warm','Blazing']       },
    { word:'SCARED',  ans:'Afraid',      opts:['Afraid','Calm','Proud','Bold']        },
    { word:'BIG',     ans:'Large',       opts:['Large','Tiny','Flat','Empty']         },
    { word:'TIRED',   ans:'Exhausted',   opts:['Exhausted','Energetic','Calm','Busy'] },
    { word:'THIN',    ans:'Slim',        opts:['Slim','Heavy','Wide','Tall']          },
    { word:'FUNNY',   ans:'Amusing',     opts:['Amusing','Dull','Sad','Boring']       },
    { word:'DARK',    ans:'Dim',         opts:['Dim','Bright','Clear','Vivid']        },
  ],
  medium: [
    { word:'METICULOUS',  ans:'Thorough',    opts:['Thorough','Reckless','Boring','Loud']       },
    { word:'ELOQUENT',    ans:'Articulate',  opts:['Articulate','Mute','Clumsy','Dull']         },
    { word:'RESILIENT',   ans:'Tough',       opts:['Tough','Fragile','Passive','Vague']         },
    { word:'AMBIGUOUS',   ans:'Unclear',     opts:['Unclear','Obvious','Precise','Certain']     },
    { word:'PRAGMATIC',   ans:'Practical',   opts:['Practical','Idealistic','Reckless','Vague'] },
    { word:'CANDID',      ans:'Honest',      opts:['Honest','Deceptive','Shy','Aggressive']     },
    { word:'VERBOSE',     ans:'Wordy',       opts:['Wordy','Concise','Silent','Brief']          },
    { word:'CONCISE',     ans:'Brief',       opts:['Brief','Lengthy','Vague','Loud']            },
    { word:'DILIGENT',    ans:'Hardworking', opts:['Hardworking','Lazy','Careless','Vague']     },
    { word:'FRUGAL',      ans:'Thrifty',     opts:['Thrifty','Wasteful','Generous','Reckless']  },
    { word:'OBSOLETE',    ans:'Outdated',    opts:['Outdated','Modern','Trendy','Current']      },
    { word:'SERENE',      ans:'Calm',        opts:['Calm','Agitated','Loud','Restless']         },
    { word:'ARDUOUS',     ans:'Difficult',   opts:['Difficult','Easy','Simple','Trivial']       },
    { word:'BENEVOLENT',  ans:'Kind',        opts:['Kind','Cruel','Selfish','Harsh']            },
    { word:'CRYPTIC',     ans:'Mysterious',  opts:['Mysterious','Clear','Obvious','Simple']     },
    { word:'IMMINENT',    ans:'Approaching', opts:['Approaching','Distant','Unlikely','Gone']   },
  ],
  hard: [
    { word:'PERSPICACIOUS', ans:'Shrewd',       opts:['Shrewd','Naive','Reckless','Vague']       },
    { word:'TENACIOUS',     ans:'Persistent',   opts:['Persistent','Fickle','Lazy','Gentle']     },
    { word:'EPHEMERAL',     ans:'Fleeting',     opts:['Fleeting','Eternal','Heavy','Rigid']      },
    { word:'EQUIVOCAL',     ans:'Ambiguous',    opts:['Ambiguous','Clear','Decisive','Simple']   },
    { word:'LOQUACIOUS',    ans:'Talkative',    opts:['Talkative','Quiet','Reserved','Shy']      },
    { word:'INVETERATE',    ans:'Habitual',     opts:['Habitual','Occasional','Novice','Rare']   },
    { word:'SANGUINE',      ans:'Optimistic',   opts:['Optimistic','Gloomy','Nervous','Bitter']  },
    { word:'LACONIC',       ans:'Brief',        opts:['Brief','Verbose','Dramatic','Loud']       },
    { word:'OBSEQUIOUS',    ans:'Flattering',   opts:['Flattering','Rude','Blunt','Defiant']     },
    { word:'RECALCITRANT',  ans:'Stubborn',     opts:['Stubborn','Obedient','Flexible','Meek']   },
    { word:'MAGNANIMOUS',   ans:'Generous',     opts:['Generous','Selfish','Petty','Bitter']     },
    { word:'PERFIDIOUS',    ans:'Treacherous',  opts:['Treacherous','Loyal','Honest','Kind']     },
    { word:'GARRULOUS',     ans:'Talkative',    opts:['Talkative','Quiet','Shy','Reserved']      },
    { word:'TRUCULENT',     ans:'Aggressive',   opts:['Aggressive','Peaceful','Gentle','Timid']  },
    { word:'PELLUCID',      ans:'Clear',        opts:['Clear','Murky','Dark','Opaque']           },
  ],
};

// ── Articulation: Antonym Match ──
const ANTONYMS = {
  easy: [
    { word:'HAPPY',   ans:'Sad',         opts:['Sad','Excited','Loud','Tired']        },
    { word:'FAST',    ans:'Slow',        opts:['Slow','Bold','Heavy','Cold']          },
    { word:'BRAVE',   ans:'Cowardly',    opts:['Cowardly','Tall','Quiet','Silly']     },
    { word:'LOUD',    ans:'Quiet',       opts:['Quiet','Dark','Warm','Sharp']         },
    { word:'HOT',     ans:'Cold',        opts:['Cold','Soft','Strong','Tall']         },
    { word:'YOUNG',   ans:'Old',         opts:['Old','Tiny','Funny','Bright']         },
    { word:'DARK',    ans:'Bright',      opts:['Bright','Empty','Round','Still']      },
    { word:'TALL',    ans:'Short',       opts:['Short','Thin','Weak','Slow']          },
    { word:'OPEN',    ans:'Closed',      opts:['Closed','Heavy','Rough','Blank']      },
    { word:'START',   ans:'Finish',      opts:['Finish','Hide','Wait','Repeat']       },
    { word:'GIVE',    ans:'Take',        opts:['Take','Keep','Hold','Push']           },
    { word:'EMPTY',   ans:'Full',        opts:['Full','Spare','Clear','Light']        },
    { word:'CLEAN',   ans:'Dirty',       opts:['Dirty','Old','Dull','Thin']           },
    { word:'SHARP',   ans:'Blunt',       opts:['Blunt','Flat','Slim','Plain']         },
    { word:'RICH',    ans:'Poor',        opts:['Poor','Thin','Dull','Rough']          },
  ],
  medium: [
    { word:'COURAGE',    ans:'Cowardice',   opts:['Cowardice','Anger','Wisdom','Pride']      },
    { word:'GENEROUS',   ans:'Stingy',      opts:['Stingy','Friendly','Calm','Modest']       },
    { word:'TRANSPARENT',ans:'Opaque',      opts:['Opaque','Shiny','Liquid','Solid']         },
    { word:'OPTIMISM',   ans:'Pessimism',   opts:['Pessimism','Realism','Cynicism','Doubt']  },
    { word:'EXPAND',     ans:'Contract',    opts:['Contract','Adjust','Observe','Maintain']  },
    { word:'FICTION',    ans:'Fact',        opts:['Fact','Story','Myth','Drama']             },
    { word:'FLEXIBLE',   ans:'Rigid',       opts:['Rigid','Gentle','Careful','Distant']      },
    { word:'VERBOSE',    ans:'Concise',     opts:['Concise','Vague','Boring','Quiet']        },
    { word:'INFERIOR',   ans:'Superior',    opts:['Superior','Equal','Average','Common']     },
    { word:'AMPLIFY',    ans:'Reduce',      opts:['Reduce','Repeat','Adjust','Transfer']     },
    { word:'SINCERE',    ans:'Insincere',   opts:['Insincere','Nervous','Formal','Reserved'] },
    { word:'VOLATILE',   ans:'Stable',      opts:['Stable','Liquid','Rare','Extreme']        },
  ],
  hard: [
    { word:'LUCID',        ans:'Confused',     opts:['Confused','Elegant','Precise','Silent']    },
    { word:'VERBOSE',      ans:'Laconic',      opts:['Laconic','Formal','Polite','Candid']       },
    { word:'EPHEMERAL',    ans:'Eternal',      opts:['Eternal','Trivial','Complex','Rigid']      },
    { word:'MAGNANIMOUS',  ans:'Petty',        opts:['Petty','Noble','Warm','Brave']             },
    { word:'PRAGMATIC',    ans:'Idealistic',   opts:['Idealistic','Cautious','Factual','Clear']  },
    { word:'TRANSPARENT',  ans:'Opaque',       opts:['Opaque','Vivid','Sharp','Fluid']           },
    { word:'INVETERATE',   ans:'Occasional',   opts:['Occasional','Chronic','Common','Usual']    },
    { word:'RECALCITRANT', ans:'Compliant',    opts:['Compliant','Passive','Loud','Distant']     },
  ],
};

// ── Articulation: Word from Definition ──
const DEFINITIONS = {
  easy: [
    { def:'A place where books are kept and borrowed',          ans:'Library',    opts:['Library','Museum','Gallery','Office']      },
    { def:'The star at the center of our solar system',         ans:'Sun',        opts:['Sun','Moon','Star','Planet']               },
    { def:'A frozen water treat on a stick',                    ans:'Popsicle',   opts:['Popsicle','Candy','Cookie','Brownie']      },
    { def:'The season after summer',                            ans:'Autumn',     opts:['Autumn','Winter','Spring','Monsoon']       },
    { def:'A baby dog',                                         ans:'Puppy',      opts:['Puppy','Kitten','Cub','Foal']              },
    { def:'Used to cut bread or vegetables in the kitchen',     ans:'Knife',      opts:['Knife','Fork','Spoon','Ladle']             },
    { def:'The planet we live on',                              ans:'Earth',      opts:['Earth','Mars','Venus','Jupiter']           },
    { def:'A round object used in sports like soccer',          ans:'Ball',       opts:['Ball','Disk','Ring','Cube']                },
    { def:'The organ in your chest that pumps blood',           ans:'Heart',      opts:['Heart','Lung','Liver','Kidney']            },
    { def:'A person who flies an airplane',                     ans:'Pilot',      opts:['Pilot','Driver','Captain','Engineer']      },
    { def:'The hottest season of the year',                     ans:'Summer',     opts:['Summer','Winter','Spring','Autumn']        },
    { def:'A building where sick people are treated',           ans:'Hospital',   opts:['Hospital','School','Library','Hotel']      },
  ],
  medium: [
    { def:'Lasting for only a short time; not permanent',           ans:'Temporary',   opts:['Temporary','Permanent','Eternal','Chronic']       },
    { def:'Impossible to see through',                             ans:'Opaque',      opts:['Opaque','Clear','Shiny','Liquid']                 },
    { def:'A person who studies stars and planets',                ans:'Astronomer',  opts:['Astronomer','Physicist','Biologist','Geologist']   },
    { def:'The practice of growing crops and raising animals',     ans:'Agriculture', opts:['Agriculture','Industry','Commerce','Medicine']    },
    { def:'Relating to the mind rather than the body',            ans:'Mental',      opts:['Mental','Physical','Social','Cultural']           },
    { def:'A formal agreement between two countries',             ans:'Treaty',      opts:['Treaty','Law','Policy','Charter']                 },
    { def:'The way something appears or how it looks',            ans:'Appearance',  opts:['Appearance','Behavior','Character','Manner']      },
    { def:'Moving from one place to another permanently',         ans:'Migration',   opts:['Migration','Tourism','Travel','Exploration']      },
    { def:'Words that have the same or similar meanings',         ans:'Synonyms',    opts:['Synonyms','Antonyms','Homophones','Acronyms']     },
    { def:'The art of effective or persuasive speaking',          ans:'Rhetoric',    opts:['Rhetoric','Logic','Grammar','Syntax']             },
    { def:'Money paid regularly as wages or salary',              ans:'Income',      opts:['Income','Expense','Profit','Budget']              },
    { def:'A conclusion based on evidence and reasoning',         ans:'Inference',   opts:['Inference','Assumption','Belief','Instinct']      },
  ],
  hard: [
    { def:'Feeling or showing a lack of interest or enthusiasm',     ans:'Apathetic',     opts:['Apathetic','Enthusiastic','Curious','Diligent']     },
    { def:'The action of making something seem less serious',        ans:'Trivializing',  opts:['Trivializing','Amplifying','Clarifying','Justifying'] },
    { def:'Existing or occurring outside the normal physical world', ans:'Metaphysical',  opts:['Metaphysical','Physical','Biological','Chemical']    },
    { def:'Inclined to lay down principles as incontrovertibly true',ans:'Dogmatic',      opts:['Dogmatic','Skeptical','Flexible','Empirical']        },
    { def:'The quality of being pleasingly ingenious and simple',    ans:'Elegance',      opts:['Elegance','Complexity','Ambiguity','Precision']      },
    { def:'Apparent contradiction that may be true in fact',        ans:'Paradox',       opts:['Paradox','Axiom','Theorem','Hypothesis']             },
    { def:'Study of knowledge — how we know what we know',          ans:'Epistemology',  opts:['Epistemology','Ontology','Teleology','Cosmology']    },
    { def:'Representing the most perfect example of a quality',     ans:'Quintessential',opts:['Quintessential','Peripheral','Incidental','Marginal'] },
  ],
};

// ── Articulation: Word Unscramble ──
const SCRAMBLES = {
  easy: [
    { sc:'AELP',  ans:'PALE',  hint:'Light in color'              },
    { sc:'TALS',  ans:'SALT',  hint:'Table condiment'             },
    { sc:'EALM',  ans:'MALE',  hint:'Opposite of female'          },
    { sc:'ACEM',  ans:'CAME',  hint:'Arrived'                     },
    { sc:'TASE',  ans:'SEAT',  hint:'A place to sit'              },
    { sc:'REAT',  ans:'RATE',  hint:'A speed or price'            },
    { sc:'ELTA',  ans:'TALE',  hint:'A story'                     },
    { sc:'GELA',  ans:'GALE',  hint:'A strong wind'               },
    { sc:'NAEM',  ans:'NAME',  hint:'What you are called'         },
    { sc:'EALB',  ans:'ABLE',  hint:'Capable of something'        },
    { sc:'DEAR',  ans:'READ',  hint:'What you do with a book'     },
    { sc:'MARS',  ans:'ARMS',  hint:'Body limbs'                  },
    { sc:'LAME',  ans:'MEAL',  hint:'Breakfast, lunch, or dinner' },
    { sc:'TEAN',  ans:'NEAT',  hint:'Tidy and organized'          },
    { sc:'LEAP',  ans:'PLEA',  hint:'An urgent request'           },
  ],
  medium: [
    { sc:'SLIENT',   ans:'LISTEN',   hint:'Pay attention to sound'     },
    { sc:'ELGINS',   ans:'SINGLE',   hint:'Not paired or grouped'      },
    { sc:'IGENUS',   ans:'GENIUS',   hint:'Exceptional intelligence'   },
    { sc:'LATSER',   ans:'ALERTS',   hint:'Warnings or notifications'  },
    { sc:'TRICHES',  ans:'RICHEST',  hint:'Most wealthy'               },
    { sc:'STEADR',   ans:'TRADES',   hint:'Buying and selling'         },
    { sc:'NITLEGS',  ans:'GLISTEN',  hint:'Shine with reflected light' },
    { sc:'ROMATES',  ans:'MAESTRO',  hint:'A master conductor'         },
    { sc:'TPASKER',  ans:'SPARKET',  hint:'A sparkle or flicker'       },
    { sc:'LNAGET',   ans:'TANGLE',   hint:'To twist into knots'        },
    { sc:'RTEACH',   ans:'CHATER',   hint:'Alternative spelling of charter; to hire' },
    { sc:'ELANTG',   ans:'TANGLE',   hint:'A mess of twisted things'   },
    { sc:'SEATRD',   ans:'TRADES',   hint:'Exchanges goods'            },
    { sc:'ENSILG',   ans:'LENSIG',   hint:'A lens-related term'        },
    { sc:'PLSITES',  ans:'STIPELS',  hint:'Small spots or dots'        },
  ],
  hard: [
    { sc:'SLOTAUEB', ans:'ABSOLUTE', hint:'Complete and total'         },
    { sc:'NAKLBEST', ans:'BLANKETS', hint:'Warm bed covers'            },
    { sc:'PTCRASHE', ans:'CHAPTERS', hint:'Sections of a book'         },
    { sc:'NUMODECT', ans:'DOCUMENT', hint:'An official paper or file'  },
    { sc:'NATIMONU', ans:'MOUNTAIN', hint:'A large rocky hill'         },
    { sc:'BBLASCRE', ans:'SCRABBLE', hint:'A popular word board game'  },
    { sc:'ESTRMAL',  ans:'MALTRESE', hint:'A type of bed layer'        },
    { sc:'LDRSABCE', ans:'SCRABELD', hint:'Climbed hurriedly'          },
    { sc:'RTHCAES',  ans:'SCATHER',  hint:'To scatter or harm'         },
    { sc:'TALNREP',  ans:'PLANTER',  hint:'A container for growing plants' },
    { sc:'ESNBCALA', ans:'BALANCE',  hint:'Stability and equilibrium'  },
    { sc:'TMEODSR',  ans:'MODREST',  hint:'Restrained; not extreme'    },
  ],
};


// ─────────────────────────────────────────────────────
// 3. APP STATE
// ─────────────────────────────────────────────────────

let S = {
  diff: 'easy',
  phase: 'idle',
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
  results: [],
  startTime: null,
  sprintWords: [],
  choiceSelected: false,
  recentSubtypes: [],     // tracks last 4 subtypes to reduce repetition
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
function today() { return new Date().toISOString().slice(0, 10); }
function getStored() {
  const d = load();
  return { streak:d.streak||0, sessions:d.sessions||0, bestAcc:d.bestAcc||null, lastDate:d.lastDate||null, diff:d.diff||'easy' };
}
function recordSession(total, correct) {
  const d = load();
  const t = today();
  const acc = total > 0 ? Math.round(correct / total * 100) : 0;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d.lastDate === yesterday) d.streak = (d.streak || 0) + 1;
  else if (d.lastDate !== t)   d.streak = 1;
  d.lastDate = t; d.sessions = (d.sessions||0)+1; d.bestAcc = Math.max(d.bestAcc||0, acc); d.diff = S.diff;
  save(d);
  return { streak: d.streak, acc };
}


// ─────────────────────────────────────────────────────
// 5. HELPER UTILITIES
// ─────────────────────────────────────────────────────

function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j=ri(0,i); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function fmt(s) {
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
}

// Pick a subtype that hasn't appeared recently
function pickType(types) {
  const available = types.filter(t => !S.recentSubtypes.includes(t));
  const pool = available.length > 0 ? available : types;
  const chosen = pool[ri(0, pool.length-1)];
  S.recentSubtypes.push(chosen);
  if (S.recentSubtypes.length > 4) S.recentSubtypes.shift();
  return chosen;
}


// ─────────────────────────────────────────────────────
// 6. CHALLENGE GENERATORS
// ─────────────────────────────────────────────────────

function genMath(d) {
  if (d === 'easy') {
    const t = pickType(['add','sub','mul','div','half']);
    if (t==='add')  { const a=ri(2,9),b=ri(2,9); return {cat:'math',q:`${a} + ${b}`,ans:String(a+b),tl:20}; }
    if (t==='sub')  { const b=ri(2,9),a=ri(b,15); return {cat:'math',q:`${a} − ${b}`,ans:String(a-b),tl:20}; }
    if (t==='mul')  { const a=ri(2,9),b=ri(2,9); return {cat:'math',q:`${a} × ${b}`,ans:String(a*b),tl:25}; }
    if (t==='div')  { const a=ri(2,5),b=ri(2,9); return {cat:'math',q:`${a*b} ÷ ${a}`,ans:String(b),tl:20}; }
    if (t==='half') { const n=ri(2,15)*2; return {cat:'math',q:`Half of ${n}`,ans:String(n/2),tl:15}; }
  }
  if (d === 'medium') {
    const t = pickType(['add2','sub2','mul','pct','div2','double']);
    if (t==='add2')   { const a=ri(13,79),b=ri(13,79); return {cat:'math',q:`${a} + ${b}`,ans:String(a+b),tl:30}; }
    if (t==='sub2')   { const b=ri(12,50),a=ri(b+10,99); return {cat:'math',q:`${a} − ${b}`,ans:String(a-b),tl:30}; }
    if (t==='mul')    { const a=ri(6,12),b=ri(6,12); return {cat:'math',q:`${a} × ${b}`,ans:String(a*b),tl:25}; }
    if (t==='pct')    { const p=[10,20,25,50][ri(0,3)],base=ri(2,20)*10; return {cat:'math',q:`${p}% of ${base}`,ans:String(p*base/100),tl:35}; }
    if (t==='div2')   { const a=ri(3,9),b=ri(11,15); return {cat:'math',q:`${a*b} ÷ ${a}`,ans:String(b),tl:30}; }
    if (t==='double') { const n=ri(15,75); return {cat:'math',q:`Double ${n}`,ans:String(n*2),tl:20}; }
  }
  // hard
  const t = pickType(['mul2','step','pct2','sq','triple','cube_root','missing_op']);
  if (t==='mul2')       { const a=ri(11,25),b=ri(11,25); return {cat:'math',q:`${a} × ${b}`,ans:String(a*b),tl:50}; }
  if (t==='step')       { const a=ri(2,9),b=ri(2,9),c=ri(2,9); return {cat:'math',q:`(${a} × ${b}) + ${c}`,ans:String(a*b+c),tl:35}; }
  if (t==='pct2')       { const p=ri(1,9)*5,base=ri(10,40)*5; return {cat:'math',q:`${p}% of ${base}`,ans:String(p*base/100),tl:50}; }
  if (t==='sq')         { const n=ri(11,20); return {cat:'math',q:`${n}²`,ans:String(n*n),tl:45}; }
  if (t==='triple')     { const n=ri(15,50); return {cat:'math',q:`Triple ${n}`,ans:String(n*3),tl:35}; }
  if (t==='cube_root')  { const bases=[2,3,4,5]; const b=bases[ri(0,3)]; return {cat:'math',q:`∛${b*b*b}`,ans:String(b),hint:'What number cubed gives this?',tl:40}; }
  // missing_op: 5 ? 3 = 8, what's the operator
  const pairs = [{a:5,b:3,op:'+',r:8},{a:9,b:4,op:'-',r:5},{a:6,b:7,op:'×',r:42},{a:24,b:6,op:'÷',r:4},{a:8,b:5,op:'+',r:13},{a:15,b:8,op:'-',r:7}];
  const p = pairs[ri(0,pairs.length-1)];
  return {cat:'math',q:`${p.a} ? ${p.b} = ${p.r}`,ans:p.op,hint:'Type the missing operator: + − × ÷',tl:20};
}

function genMemory(d) {
  const t = pickType(['digit','digit','letter','missing']); // weight digit higher
  if (t === 'letter') {
    if (d==='easy')   { const len=ri(4,5), seq=Array.from({length:len},()=>LETTERS[ri(0,LETTERS.length-1)]).join(''); return {cat:'memory',type:'letter',seq,displayMs:3500,prompt:'Type the letters you just saw',ans:seq,tl:22}; }
    if (d==='medium') { const len=ri(5,6), seq=Array.from({length:len},()=>LETTERS[ri(0,LETTERS.length-1)]).join(''); return {cat:'memory',type:'letter',seq,displayMs:4000,prompt:'Type the letters you just saw',ans:seq,tl:26}; }
    // hard: reverse letters
    const len=ri(6,7), seq=Array.from({length:len},()=>LETTERS[ri(0,LETTERS.length-1)]).join('');
    return {cat:'memory',type:'letter-rev',seq,displayMs:4500,prompt:'Type the letters in REVERSE ORDER',ans:seq.split('').reverse().join(''),tl:32};
  }
  if (t === 'missing') {
    const len = d==='easy'?5:d==='medium'?6:7;
    const seq = Array.from({length:len}, ()=>ri(1,20));
    const missingIdx = ri(1, len-2);
    const hiddenSeq = seq.map((n,i) => i===missingIdx ? '___' : n);
    return {cat:'memory',type:'missing',seq,hiddenSeq,missingIdx,displayMs:d==='easy'?4500:d==='medium'?4000:3500,prompt:`What number was at the blank?`,ans:String(seq[missingIdx]),tl:d==='easy'?15:d==='medium'?12:10};
  }
  // digit span (default)
  if (d==='easy')   { const len=ri(4,5), seq=Array.from({length:len},()=>ri(1,9)).join(''); return {cat:'memory',type:'digit',seq,displayMs:3500,prompt:'Type the digits you just saw',ans:seq,tl:20}; }
  if (d==='medium') { const len=ri(6,7), seq=Array.from({length:len},()=>ri(1,9)).join(''); return {cat:'memory',type:'digit',seq,displayMs:4000,prompt:'Type the digits you just saw',ans:seq,tl:25}; }
  const len=ri(7,8), seq=Array.from({length:len},()=>ri(1,9)).join('');
  return {cat:'memory',type:'digit-rev',seq,displayMs:5000,prompt:'Type the digits in REVERSE ORDER',ans:seq.split('').reverse().join(''),tl:35};
}

function genPattern(d) {
  const t = pickType(['arith','geo','fib','alt','letter','sq','cube','primes','poly']);
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Letter sequence
  if (t === 'letter') {
    const start = ri(0,14), step = d==='easy'?ri(2,4):d==='medium'?ri(3,6):ri(4,8);
    const seq = [0,1,2,3,4].map(i => ALPHA[(start + i*step) % 26]);
    return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:seq[4],hint:`Each letter jumps ${step} places in the alphabet`,tl:d==='easy'?30:d==='medium'?35:40};
  }
  if (t === 'arith' || (!['geo','fib','alt','sq','cube','primes','poly'].includes(t) && d==='easy')) {
    const s=ri(1,10),step=ri(2,8),seq=[0,1,2,3,4].map(i=>s+i*step);
    return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Find the common difference',tl:28};
  }
  if (d === 'easy') {
    const s=ri(1,10),step=ri(2,8),seq=[0,1,2,3,4].map(i=>s+i*step);
    return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Find the common difference',tl:28};
  }
  if (t==='geo'    && d!=='easy') { const s=ri(1,4),r=ri(2,3),seq=[0,1,2,3,4].map(i=>s*Math.pow(r,i)); return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Each term is multiplied by the same number',tl:35}; }
  if (t==='fib'    && d!=='easy') { const a=ri(1,4),b=ri(1,6),seq=[a,b];for(let i=2;i<5;i++)seq.push(seq[i-1]+seq[i-2]); return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Each term = sum of two previous',tl:35}; }
  if (t==='alt'    && d!=='easy') { const a0=ri(2,8),sA=ri(2,5),b0=ri(2,8),sB=ri(2,5),seq=[a0,b0,a0+sA,b0+sB,a0+2*sA,b0+2*sB]; return {cat:'pattern',q:`${seq.slice(0,5).join(', ')}, ?`,ans:String(seq[5]),hint:'Two interleaved sequences',tl:42}; }
  if (t==='sq')    { const off=ri(1,6),seq=[0,1,2,3,4].map(i=>(i+off)*(i+off)); return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Perfect squares',tl:40}; }
  if (t==='cube')  { const off=ri(1,4),seq=[0,1,2,3,4].map(i=>Math.pow(i+off,3)); return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Perfect cubes',tl:45}; }
  if (t==='primes'){ const s=ri(1,10),primes=[2,3,5,7,11],seq=[s];for(let i=0;i<4;i++)seq.push(seq[i]+primes[i]); return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Differences are prime numbers',tl:50}; }
  // poly (quadratic)
  const c=ri(1,4),seq=[1,2,3,4,5].map(n=>n*n+n+c);
  return {cat:'pattern',q:`${seq.slice(0,4).join(', ')}, ?`,ans:String(seq[4]),hint:'Check second differences',tl:55};
}

function genWords(d) {
  const counts={easy:4,medium:6,hard:8},ms={easy:8000,medium:11000,hard:14000},tl={easy:35,medium:50,hard:70};
  const words = shuffle([...WORD_BANK[d]]).slice(0, counts[d]);
  return {cat:'words',type:'words',words,displayMs:ms[d],prompt:'Type every word you remember',ans:words,tl:tl[d]};
}

function genArticulation(d) {
  const t = pickType(['cat-sprint','synonym','unscramble','antonym','definition']);

  if (t === 'cat-sprint') {
    const lists = CAT_LISTS[d];
    const picked = lists[ri(0, lists.length-1)];
    return {cat:'articulation',type:'cat-sprint',categoryName:picked.name,validWords:picked.words,tl:45};
  }
  if (t === 'synonym') {
    const s = shuffle([...SYNONYMS[d]])[0];
    return {cat:'articulation',type:'synonym',word:s.word,label:'Synonym of:',ans:s.ans,opts:shuffle([...s.opts]),tl:{easy:20,medium:18,hard:15}[d]};
  }
  if (t === 'antonym') {
    const s = shuffle([...ANTONYMS[d]])[0];
    return {cat:'articulation',type:'synonym',word:s.word,label:'Opposite of:',ans:s.ans,opts:shuffle([...s.opts]),tl:{easy:20,medium:18,hard:15}[d]};
  }
  if (t === 'definition') {
    const s = shuffle([...DEFINITIONS[d]])[0];
    return {cat:'articulation',type:'synonym',word:s.def,label:'Which word matches this definition?',ans:s.ans,opts:shuffle([...s.opts]),tl:{easy:25,medium:22,hard:18}[d]};
  }
  // unscramble
  const s = shuffle([...SCRAMBLES[d]])[0];
  return {cat:'articulation',type:'unscramble',sc:s.sc,ans:s.ans,hint:s.hint,tl:{easy:30,medium:35,hard:45}[d]};
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
  if (ch.cat === 'words') {
    const typed = input.toLowerCase().split(/[\s,;]+/).map(w=>w.trim()).filter(Boolean);
    const got   = ch.ans.filter(w => typed.includes(w.toLowerCase()));
    const miss  = ch.ans.filter(w => !typed.includes(w.toLowerCase()));
    return {correct:got.length===ch.ans.length, pts:got.length*15, got, miss, partial:got.length};
  }
  if (ch.type === 'cat-sprint') {
    const typed = Array.isArray(input)?input:input.toLowerCase().split(/[\s,;]+/).map(w=>w.trim()).filter(Boolean);
    const got   = [...new Set(typed.filter(w => ch.validWords.includes(w.toLowerCase())))];
    return {correct:got.length>0, pts:got.length*12, got, miss:[], partial:got.length, total:got.length};
  }
  if (ch.type === 'synonym') {
    const correct = input === ch.ans;
    const base    = {easy:30,medium:50,hard:70}[S.diff];
    const pts     = correct ? base + Math.round(10*(S.chalLeft/S.chalLimit)) : 0;
    return {correct, pts, got:[], miss:[], partial:correct?1:0};
  }
  // all others: exact match (case-insensitive)
  const correct = input.trim().toUpperCase() === ch.ans.toUpperCase();
  let pts = 0;
  if (correct) {
    const base = {easy:20,medium:35,hard:55}[S.diff];
    pts = base + Math.round(base * 0.5 * (S.chalLeft/S.chalLimit));
  }
  return {correct, pts, got:[], miss:[], partial:correct?1:0};
}


// ─────────────────────────────────────────────────────
// 8. UI HELPERS
// ─────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showPhase(id) {
  ['ph-memorize','ph-answer','ph-feedback'].forEach(p => {
    const el = document.getElementById(p); if(el) el.style.display='none';
  });
  const t = document.getElementById(id); if(t) t.style.display='flex';
}

function setBadge(elId, cat) {
  const el = document.getElementById(elId), c = CAT_CFG[cat];
  el.textContent = c.icon+' '+c.name;
  el.className   = 'cat-badge '+c.cls;
}

function updateHeader() {
  const t = document.getElementById('sess-timer');
  t.textContent = fmt(S.sessLeft);
  t.className   = 'session-timer'+(S.sessLeft<120?' urgent':'');
  document.getElementById('sess-score').textContent = S.score;
  document.getElementById('sess-progress').style.width = ((1-S.sessLeft/SESSION_SECS)*100)+'%';
}

function updateChalTimer(fillId, numId) {
  const pct = S.chalLeft/S.chalLimit*100;
  const f   = document.getElementById(fillId);
  if (f) { f.style.width=pct+'%'; f.className='timer-fill'+(pct>50?'':pct>25?' warn':' dang'); }
  const n = document.getElementById(numId); if(n) n.textContent=S.chalLeft;
}


// ─────────────────────────────────────────────────────
// 9. SESSION FLOW
// ─────────────────────────────────────────────────────

function startSession() {
  S.sessLeft=SESSION_SECS; S.score=0; S.results=[]; S.catIdx=0; S.startTime=Date.now();
  S.recentSubtypes=[];
  showScreen('s-session'); updateHeader();
  clearInterval(S.sessInterval);
  S.sessInterval = setInterval(()=>{
    S.sessLeft--; updateHeader();
    if(S.sessLeft<=0){ clearInterval(S.sessInterval); endSession(); }
  },1000);
  nextChallenge();
}

function nextChallenge() {
  const cat = CATS[S.catIdx % CATS.length]; S.catIdx++;
  S.challenge   = makeChallenge(cat, S.diff);
  S.sprintWords = [];
  const ch = S.challenge;
  if(ch.type==='digit'||ch.type==='digit-rev'||ch.type==='letter'||ch.type==='letter-rev'||ch.type==='missing'||ch.type==='words') startMemorize();
  else startAnswer();
}

function startMemorize() {
  S.phase='memorize'; showPhase('ph-memorize');
  const ch=S.challenge; setBadge('mem-badge',ch.cat);

  if(ch.type==='digit'||ch.type==='digit-rev') {
    document.getElementById('mem-instruction').textContent = ch.type==='digit-rev' ? "Memorize these digits — you'll type them BACKWARDS" : 'Memorize these digits';
    document.getElementById('mem-content').innerHTML = `<div class="mem-sequence">${ch.seq}</div>`;
  } else if(ch.type==='letter'||ch.type==='letter-rev') {
    document.getElementById('mem-instruction').textContent = ch.type==='letter-rev' ? "Memorize these letters — type them BACKWARDS" : 'Memorize these letters';
    document.getElementById('mem-content').innerHTML = `<div class="mem-sequence" style="font-size:3rem;letter-spacing:10px">${ch.seq}</div>`;
  } else if(ch.type==='missing') {
    document.getElementById('mem-instruction').textContent = 'Memorize this sequence — one number will be blanked';
    document.getElementById('mem-content').innerHTML = `<div class="mem-sequence" style="font-size:2.2rem;letter-spacing:8px">${ch.seq.join('  ')}</div>`;
  } else {
    document.getElementById('mem-instruction').textContent = 'Memorize these words';
    document.getElementById('mem-content').innerHTML = `<div class="mem-words">${ch.words.map(w=>`<span class="word-chip">${w}</span>`).join('')}</div>`;
  }

  let t = Math.ceil(ch.displayMs/1000);
  const cel = document.getElementById('mem-count');
  cel.innerHTML = `Disappears in <span>${t}s</span>`;
  clearInterval(S.memCountInterval);
  S.memCountInterval = setInterval(()=>{ t--; if(t>0)cel.innerHTML=`Disappears in <span>${t}s</span>`; else clearInterval(S.memCountInterval); },1000);
  clearTimeout(S.memTimeout);
  S.memTimeout = setTimeout(()=>{ clearInterval(S.memCountInterval); startAnswer(); }, ch.displayMs);
}

function startAnswer() {
  S.phase='answer'; showPhase('ph-answer');
  const ch=S.challenge; setBadge('ans-badge',ch.cat);
  S.choiceSelected=false;

  const inp         = document.getElementById('ans-input');
  const textArea    = document.getElementById('text-input-area');
  const choiceArea  = document.getElementById('choice-input-area');
  const sprintChips = document.getElementById('sprint-chips');

  inp.value=''; inp.className='answer-input';
  sprintChips.style.display='none'; sprintChips.innerHTML='';

  if(ch.type==='synonym') {
    textArea.style.display='none'; choiceArea.style.display='block';
    const grid = document.getElementById('choice-grid');
    grid.innerHTML = ch.opts.map(o=>`<button class="choice-btn" data-opt="${o}">${o}</button>`).join('');
    grid.querySelectorAll('.choice-btn').forEach(btn=>btn.addEventListener('click',()=>handleChoice(btn.dataset.opt)));
  } else {
    textArea.style.display='block'; choiceArea.style.display='none';
    if     (ch.type==='cat-sprint') { inp.className='answer-input word-input'; inp.placeholder=`${ch.categoryName}… type separated by commas`; sprintChips.style.display='flex'; }
    else if(ch.cat ==='memory')     { inp.placeholder='Type your answer…'; }
    else if(ch.cat ==='words')      { inp.className='answer-input word-input'; inp.placeholder='apple, house, river…'; }
    else if(ch.type==='unscramble') { inp.placeholder='Type the word…'; }
    else                            { inp.placeholder='Answer…'; }
  }

  const promptEl = document.getElementById('ch-prompt');
  const mainEl   = document.getElementById('ch-main');
  const hintEl   = document.getElementById('ch-hint');

  if(ch.cat==='memory') {
    if(ch.type==='missing') {
      promptEl.textContent = 'What number was hidden here?';
      mainEl.innerHTML = ch.hiddenSeq.map(n => n==='___'
        ? `<span style="color:var(--warning);background:rgba(247,151,30,0.15);padding:2px 10px;border-radius:6px">___</span>`
        : n).join('  ');
      mainEl.style.fontSize='1.8rem';
    } else {
      promptEl.textContent=ch.prompt; mainEl.textContent=''; mainEl.style.fontSize='2.4rem';
    }
    hintEl.style.display='none';
  } else if(ch.cat==='words') {
    promptEl.textContent=ch.prompt; mainEl.textContent=''; mainEl.style.fontSize='2.4rem'; hintEl.style.display='none';
  } else if(ch.type==='cat-sprint') {
    promptEl.textContent='🗣️ Verbal Fluency Sprint'; mainEl.textContent=ch.categoryName; mainEl.style.fontSize='2.4rem';
    hintEl.textContent='Type as many as you can — comma separated. Each valid word scores!'; hintEl.style.display='block';
  } else if(ch.type==='synonym') {
    promptEl.textContent = ch.label || 'Which word matches:'; mainEl.textContent=ch.word; mainEl.style.fontSize=ch.word.length>30?'1.2rem':'2.4rem'; hintEl.style.display='none';
  } else if(ch.type==='unscramble') {
    promptEl.textContent='Unscramble these letters:'; mainEl.textContent=ch.sc.split('').join(' − '); mainEl.style.fontSize='2.4rem';
    hintEl.textContent='Hint: '+ch.hint; hintEl.style.display='block';
  } else {
    promptEl.textContent=CAT_CFG[ch.cat].icon+' '+CAT_CFG[ch.cat].name;
    mainEl.textContent=(ch.q||'')+' = ?'; mainEl.style.fontSize='2.4rem';
    hintEl.style.display=ch.hint?'block':'none'; if(ch.hint) hintEl.textContent=ch.hint;
  }

  S.chalLimit=ch.tl||30; S.chalLeft=S.chalLimit;
  updateChalTimer('ch-timer-fill','ch-timer-num');
  updateChalTimer('ch-timer-fill2','ch-timer-num2');
  clearInterval(S.chalInterval);
  S.chalInterval = setInterval(()=>{
    S.chalLeft--;
    updateChalTimer('ch-timer-fill','ch-timer-num');
    updateChalTimer('ch-timer-fill2','ch-timer-num2');
    if(S.chalLeft<=0){ clearInterval(S.chalInterval); submitAnswer(true); }
  },1000);

  setTimeout(()=>{ if(ch.type!=='synonym') inp.focus(); },80);
}

function handleChoice(opt) {
  if(S.choiceSelected) return;
  S.choiceSelected=true;
  clearInterval(S.chalInterval);
  const ch=S.challenge, res=scoreIt(ch,opt);
  S.score+=res.pts;
  S.results.push({cat:ch.cat,correct:res.correct,partial:res.partial,total:1,pts:res.pts});
  document.querySelectorAll('.choice-btn').forEach(btn=>{
    btn.disabled=true;
    if(btn.dataset.opt===ch.ans) btn.classList.add('correct');
    else if(btn.dataset.opt===opt&&!res.correct) btn.classList.add('wrong');
  });
  setTimeout(()=>showFeedback(ch,res,false),800);
}

// Sprint chip input
document.getElementById('ans-input').addEventListener('keydown', function(e) {
  if(S.phase!=='answer') return;
  const ch=S.challenge;
  if(ch&&ch.type==='cat-sprint') {
    if(e.key===','||e.key==='Enter') {
      e.preventDefault();
      const val=this.value.replace(/,/g,'').trim().toLowerCase();
      if(val.length>1&&!S.sprintWords.includes(val)) {
        S.sprintWords.push(val);
        const chip=document.createElement('span'); chip.className='sprint-chip'; chip.textContent=val;
        document.getElementById('sprint-chips').appendChild(chip);
      }
      this.value='';
    }
  } else if(e.key==='Enter') { submitAnswer(false); }
});

function submitAnswer(timeUp=false) {
  clearInterval(S.chalInterval);
  const ch=S.challenge;
  if(ch.type==='synonym') return;
  let input;
  if(ch.type==='cat-sprint') {
    const rem=document.getElementById('ans-input').value.replace(/,/g,'').trim().toLowerCase();
    if(rem.length>1&&!S.sprintWords.includes(rem)) S.sprintWords.push(rem);
    input=S.sprintWords;
  } else { input=timeUp?'':document.getElementById('ans-input').value; }
  const res=scoreIt(ch,input);
  S.score+=res.pts;
  S.results.push({cat:ch.cat,correct:res.correct,partial:res.partial,total:ch.cat==='words'?ch.ans.length:ch.type==='cat-sprint'?Math.max(res.partial,1):1,pts:res.pts});
  if(ch.cat!=='words'&&ch.type!=='cat-sprint'&&ch.type!=='missing') {
    document.getElementById('ans-input').className='answer-input '+(res.correct?'is-correct':'is-wrong');
  }
  showFeedback(ch,res,timeUp);
}

function showFeedback(ch,res,timeUp) {
  S.phase='feedback'; showPhase('ph-feedback');
  const icon=document.getElementById('fb-icon'),text=document.getElementById('fb-text');
  const ansEl=document.getElementById('fb-answer'),ptsEl=document.getElementById('fb-points'),wordsEl=document.getElementById('fb-words');

  if(ch.cat==='words') {
    const pct=Math.round(res.got.length/ch.ans.length*100);
    icon.textContent=pct>=80?'✅':pct>=50?'👍':'❌';
    text.textContent=`${res.got.length} / ${ch.ans.length} words recalled`;
    text.className='fb-text '+(pct>=60?'fb-correct':'fb-wrong');
    ansEl.style.display='none';
    wordsEl.innerHTML=ch.ans.map(w=>{const got=res.got.includes(w);return`<span class="fw ${got?'fw-got':'fw-miss'}">${w}</span>`;}).join('');
    wordsEl.style.display='flex';
  } else if(ch.type==='cat-sprint') {
    icon.textContent=res.partial>=8?'🔥':res.partial>=5?'✅':res.partial>=2?'👍':'❌';
    text.textContent=`${res.partial} valid ${ch.categoryName.toLowerCase()} named`;
    text.className='fb-text '+(res.partial>=5?'fb-correct':'fb-wrong');
    ansEl.style.display='none';
    if(res.got.length>0){ wordsEl.innerHTML=res.got.map(w=>`<span class="fw fw-got">${w}</span>`).join(''); wordsEl.style.display='flex'; }
    else wordsEl.style.display='none';
  } else if(timeUp&&!res.correct) {
    icon.textContent='⏰'; text.textContent="Time's up!"; text.className='fb-text fb-wrong';
    ansEl.textContent=`Answer: ${ch.ans}`; ansEl.style.display='block'; wordsEl.style.display='none';
  } else if(res.correct) {
    icon.textContent='✅'; text.textContent='Correct!'; text.className='fb-text fb-correct';
    ansEl.style.display='none'; wordsEl.style.display='none';
  } else {
    icon.textContent='❌'; text.textContent='Not quite'; text.className='fb-text fb-wrong';
    ansEl.textContent=`Answer: ${ch.ans}`; ansEl.style.display='block'; wordsEl.style.display='none';
  }

  ptsEl.style.display=res.pts>0?'block':'none'; if(res.pts>0) ptsEl.textContent=`+${res.pts} pts`;
  updateHeader();
  clearTimeout(S.fbTimeout);
  S.fbTimeout=setTimeout(()=>{ if(S.sessLeft>0) nextChallenge(); },2500);
}

function endSession() {
  clearInterval(S.sessInterval); clearInterval(S.chalInterval);
  clearTimeout(S.memTimeout); clearTimeout(S.fbTimeout); clearInterval(S.memCountInterval);
  const total=S.results.length, correct=S.results.filter(r=>r.correct).length;
  const {streak,acc}=recordSession(total,correct);
  const elapsed=Math.round((Date.now()-S.startTime)/1000);

  document.getElementById('sum-pts').textContent=S.score;
  document.getElementById('sum-acc').textContent=acc+'%';
  document.getElementById('sum-chal').textContent=total;
  document.getElementById('sum-streak').textContent=streak+' 🔥';
  document.getElementById('sum-time').textContent=`${Math.floor(elapsed/60)}m ${elapsed%60}s`;
  document.getElementById('sum-emoji').textContent=acc>=80?'🎉':acc>=60?'💪':'🧠';
  document.getElementById('sum-title').textContent=acc>=80?'Excellent Session!':acc>=60?'Good Work!':'Keep Practicing!';

  const cs={}; CATS.forEach(c=>{cs[c]={correct:0,total:0};});
  S.results.forEach(r=>{cs[r.cat].total+=r.total||1; cs[r.cat].correct+=r.partial||0;});
  document.getElementById('bd-list').innerHTML=CATS.map(c=>{
    const s=cs[c],pct=s.total>0?Math.round(s.correct/s.total*100):null;
    return`<div class="bd-item"><div class="bd-icon">${CAT_CFG[c].icon}</div><div class="bd-name">${CAT_CFG[c].name}</div><div class="bd-track"><div class="bd-fill" style="width:${pct??0}%;background:${BD_COLORS[c]}"></div></div><div class="bd-pct" style="color:${BD_COLORS[c]}">${pct!==null?pct+'%':'—'}</div></div>`;
  }).join('');

  showScreen('s-summary'); loadHomeStats();
}


// ─────────────────────────────────────────────────────
// 10. HOME SCREEN
// ─────────────────────────────────────────────────────

function loadHomeStats() {
  const d=getStored();
  document.getElementById('h-streak').textContent=d.streak;
  document.getElementById('h-sessions').textContent=d.sessions;
  document.getElementById('h-accuracy').textContent=d.bestAcc!==null?d.bestAcc+'%':'—';
  document.getElementById('h-played').style.display=d.lastDate===today()?'flex':'none';
  setDiff(d.diff||'easy',false);
}

function setDiff(d,persist=true) {
  S.diff=d;
  document.querySelectorAll('.diff-btn').forEach(b=>b.classList.toggle('sel',b.dataset.d===d));
  if(persist){ const dd=load(); dd.diff=d; save(dd); }
}


// ─────────────────────────────────────────────────────
// 11. EVENT LISTENERS
// ─────────────────────────────────────────────────────

document.getElementById('btn-start').addEventListener('click', startSession);
document.getElementById('btn-submit').addEventListener('click', ()=>{ if(S.phase==='answer') submitAnswer(false); });
document.getElementById('btn-end').addEventListener('click', ()=>{ if(confirm('End session early? Your progress will be saved.')) endSession(); });
document.getElementById('btn-again').addEventListener('click', startSession);
document.getElementById('btn-home').addEventListener('click', ()=>{ loadHomeStats(); showScreen('s-home'); });
document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>setDiff(b.dataset.d)));

// ── Init ──
loadHomeStats();
