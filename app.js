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

const CATS = ['math', 'memory', 'pattern', 'words', 'articulation', 'phrase'];

const CAT_CFG = {
  math:         { name: 'Mental Math',         icon: '🔢', cls: 'b-math'         },
  memory:       { name: 'Working Memory',      icon: '🧩', cls: 'b-memory'       },
  pattern:      { name: 'Pattern Recognition', icon: '🔍', cls: 'b-pattern'      },
  words:        { name: 'Word Recall',         icon: '📝', cls: 'b-words'        },
  articulation: { name: 'Articulation',        icon: '🗣️', cls: 'b-articulation' },
  phrase:       { name: 'Daily Phrase',        icon: '💬', cls: 'b-phrase'       },
};

const BD_COLORS = {
  math: '#a69cff', memory: '#ff9ab0', pattern: '#ffc46a',
  words: '#7fefaa', articulation: '#f9a8d4', phrase: '#67e8f9',
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


// ── Corporate / IT Phrases (100 entries) ──
// Each entry: { phrase, meaning, cat, examples:[3 sentences with **phrase** bolded via <em>] }
const PHRASES = [
  // ── Conversation Pivots ──
  { phrase:'Taking a step back', meaning:'Pausing to reconsider the bigger picture instead of getting stuck in details.', cat:'pivot', examples:['<em>Taking a step back</em>, the real issue isn\'t the timeline — it\'s how we\'re prioritizing work.','Before we dive deeper, let\'s <em>take a step back</em> and confirm we\'re solving the right problem.','<em>Taking a step back</em>, the retailer\'s catalog issues all trace back to a single root cause.'] },
  { phrase:'Having said that', meaning:'Introducing a contrasting or qualifying point after something just stated.', cat:'pivot', examples:['The launch went smoothly. <em>Having said that</em>, we still have onboarding gaps to close.','The data looks clean. <em>Having said that</em>, let\'s verify ingestion logs before closing the ticket.','Good progress this quarter. <em>Having said that</em>, retention numbers still need attention.'] },
  { phrase:'That said', meaning:'A shorter way to introduce a contrast or caveat — same as "having said that".', cat:'pivot', examples:['The pipeline is faster now. <em>That said</em>, we haven\'t stress-tested it under full load yet.','<em>That said</em>, I don\'t think we should escalate until we\'ve given engineering 24 hours.','It\'s a solid interim fix. <em>That said</em>, it won\'t hold once we onboard more retailers.'] },
  { phrase:'At the end of the day', meaning:'Ultimately; what really matters when everything else is stripped away.', cat:'pivot', examples:['<em>At the end of the day</em>, the retailer just wants their items showing up correctly on the app.','We can debate process, but <em>at the end of the day</em>, delivery is what we\'re measured on.','<em>At the end of the day</em>, if the customer isn\'t happy, nothing else matters.'] },
  { phrase:'Circling back', meaning:'Returning to a topic that was discussed earlier, often after more information is available.', cat:'pivot', examples:['Just <em>circling back</em> on the SLA discussion from Tuesday — have we reached a decision?','I\'ll <em>circle back</em> with the engineering team and share their timeline by EOD.','Let\'s park this and <em>circle back</em> once we have results from the normalization run.'] },
  { phrase:'To be fair', meaning:'Introducing a more balanced or charitable perspective, especially when being critical.', cat:'pivot', examples:['<em>To be fair</em>, the retailer flagged this issue two weeks ago and we didn\'t prioritize it.','<em>To be fair</em> to the team, this was a complex migration with very little runway.','<em>To be fair</em>, the bug was in a part of the system that rarely gets touched.'] },
  { phrase:'To your point', meaning:'Acknowledging and building on something the other person just said.', cat:'pivot', examples:['<em>To your point</em>, we should absolutely audit the column mapping before the next launch.','<em>To your point</em> earlier — yes, the pricing mismatch is likely coming from the feed format.','<em>To your point</em>, the retailer has been flagging this for weeks, which makes it even more urgent.'] },
  { phrase:'Let me push back on that', meaning:'Respectfully disagreeing with or questioning an idea or statement.', cat:'pivot', examples:['<em>Let me push back on that</em> — I don\'t think adding more resources will fix a process problem.','<em>I\'d push back on that</em> slightly: the timeline assumes no blockers, which is unrealistic.','<em>Let me push back</em> — the root cause isn\'t clear enough yet to start building a solution.'] },
  { phrase:'Fair enough', meaning:'Acknowledging that someone\'s point is valid, even if you don\'t fully agree.', cat:'pivot', examples:['<em>Fair enough</em> — if the retailer needs this by Friday, we\'ll reprioritize accordingly.','You want to wait for more data before escalating. <em>Fair enough</em>, let\'s set a 24-hour window.','<em>Fair enough</em>. I\'ll adjust the approach and bring a revised plan to the next sync.'] },
  { phrase:'To be clear', meaning:'Used before a definitive statement to remove any possible ambiguity.', cat:'pivot', examples:['<em>To be clear</em>, this is a P1 issue and it needs to be resolved before COB today.','<em>To be clear</em>, I\'m not saying the approach is wrong — just that the timing is off.','<em>To be clear</em>, the retailer hasn\'t churned — they\'re just pausing the expansion.'] },
  { phrase:'For what it\'s worth', meaning:'Offering an opinion or information without being imposing about its value.', cat:'pivot', examples:['<em>For what it\'s worth</em>, I\'ve seen this pattern before with other retailers in this segment.','<em>For what it\'s worth</em>, the engineering team thinks this is a two-day fix, not two weeks.','<em>For what it\'s worth</em>, the retailer seemed more open to the idea than the email suggested.'] },
  { phrase:'Level set', meaning:'To align everyone on the same shared understanding or baseline before moving forward.', cat:'pivot', examples:['Before we start, let\'s quickly <em>level set</em> on what we\'re trying to accomplish today.','I want to <em>level set</em> with the retailer on expectations before we commit to a date.','Can we take five minutes to <em>level set</em>? I don\'t think everyone has the same context.'] },
  { phrase:'Walk me through', meaning:'A request for a step-by-step explanation of something.', cat:'pivot', examples:['<em>Walk me through</em> exactly what happens when the ingestion run fails at step three.','Can you <em>walk me through</em> the column mapping you set up for this retailer\'s feed?','<em>Walk me through</em> your logic — I want to understand before we escalate this.'] },
  { phrase:'Unpack that', meaning:'To explain something in more detail; to break it down for better understanding.', cat:'pivot', examples:['That\'s interesting — can you <em>unpack that</em> a bit? What\'s driving the 20% drop?','Let\'s <em>unpack</em> the retailer\'s complaint before we respond so we\'re addressing the real issue.','I\'d like to <em>unpack</em> the assumptions behind that estimate before we put it in the deck.'] },
  { phrase:'Double click on that', meaning:'To explore a topic or point in greater detail — a way to say "tell me more".', cat:'pivot', examples:['You mentioned a data quality issue — I want to <em>double click on that</em>. What specifically is failing?','<em>Let\'s double click</em> on the pricing discrepancy; the retailer will definitely ask about it.','Before we move on, I want to <em>double click on that</em> point about the ingestion schedule.'] },

  // ── Strategy & Vision ──
  { phrase:'Move the needle', meaning:'Make a meaningful, measurable difference — not just a minor or cosmetic improvement.', cat:'strategy', examples:['We need to focus on what will actually <em>move the needle</em> on GMV, not just cosmetic fixes.','Adding five retailers won\'t <em>move the needle</em> if catalog quality issues aren\'t resolved.','This feature is nice, but will it really <em>move the needle</em> for key accounts?'] },
  { phrase:'Low-hanging fruit', meaning:'Easy wins that can be achieved quickly with minimal effort or risk.', cat:'strategy', examples:['Let\'s tackle the <em>low-hanging fruit</em> first — the image gaps are straightforward to fix.','The <em>low-hanging fruit</em> here is fixing the column mapping before rethinking the whole pipeline.','There\'s a lot of <em>low-hanging fruit</em> in the retailer\'s feed we can clean up this sprint.'] },
  { phrase:'Boil the ocean', meaning:'Attempting something unnecessarily large or complex when a simpler approach would work.', cat:'strategy', examples:['We don\'t need to <em>boil the ocean</em> — just fix the three most common failure modes.','Let\'s not <em>boil the ocean</em> by rebuilding the whole pipeline when a targeted patch would do.','I know we want perfection, but we\'ll <em>boil the ocean</em> if we try to solve everything in Q3.'] },
  { phrase:'Paradigm shift', meaning:'A fundamental change in approach or thinking — not just an incremental improvement.', cat:'strategy', examples:['Moving from manual ingestion to automated normalization is a real <em>paradigm shift</em> for the team.','This isn\'t a product update — it\'s a <em>paradigm shift</em> in how we approach retailer onboarding.','The industry is going through a <em>paradigm shift</em> in how data quality is measured.'] },
  { phrase:'Pivot', meaning:'To change direction — in strategy, product, or approach — based on new information or results.', cat:'strategy', examples:['Based on pilot results, we may need to <em>pivot</em> on how we handle weighted items.','The team <em>pivoted</em> from bulk upload to real-time sync after the launch issues.','If the retailer can\'t provide structured data, we\'ll need to <em>pivot</em> the ingestion method.'] },
  { phrase:'Deep dive', meaning:'A thorough, detailed investigation into a topic, problem, or dataset.', cat:'strategy', examples:['Can we schedule a <em>deep dive</em> into the pricing discrepancies before next week\'s QBR?','I did a <em>deep dive</em> into the normalization logs and found three patterns causing failures.','The retailer wants a <em>deep dive</em> on why their item count dropped 12% after the last run.'] },
  { phrase:'North star', meaning:'The ultimate guiding goal or metric that everything else should align to.', cat:'strategy', examples:['Our <em>north star</em> is seamless retailer onboarding — every decision should support that.','When priorities conflict, come back to the <em>north star</em>: what does the retailer actually need?','The <em>north star</em> metric for this quarter is item availability, not item count.'] },
  { phrase:'Pain point', meaning:'A specific problem or frustration that a person, team, or customer is experiencing.', cat:'strategy', examples:['The biggest <em>pain point</em> for this retailer is pricing discrepancies at the store level.','Understanding the retailer\'s <em>pain points</em> is the first step before proposing any solution.','The new onboarding flow directly addresses the <em>pain point</em> of lengthy data validation cycles.'] },
  { phrase:'Value proposition', meaning:'The unique benefit or value that something offers — why it\'s worth choosing.', cat:'strategy', examples:['Our <em>value proposition</em> to retailers is faster catalog launch with fewer errors.','The PM needs to clearly define the <em>value proposition</em> before we pitch this to the exec team.','<em>What\'s the value proposition</em> for the retailer if they invest in the SFP integration?'] },
  { phrase:'Game changer', meaning:'Something that fundamentally alters the situation, rules, or competitive landscape.', cat:'strategy', examples:['Real-time catalog sync would be a <em>game changer</em> for retailers with high SKU turnover.','Automating image validation is a <em>game changer</em> — it cuts launch time in half.','If we can fix ingestion reliability, it\'ll be a <em>game changer</em> for retailer trust.'] },
  { phrase:'Raise the bar', meaning:'To increase the standard of quality or performance that is expected.', cat:'strategy', examples:['This launch set a new standard — it\'s <em>raised the bar</em> for every future onboarding.','We need to <em>raise the bar</em> on data quality before we can scale to more retailers.','The new SLA commitments <em>raise the bar</em> significantly, so let\'s make sure we can deliver.'] },
  { phrase:'Best practice', meaning:'The most effective and widely accepted method for accomplishing something.', cat:'strategy', examples:['Following <em>best practices</em>, we should validate the feed before importing, not after.','The <em>best practice</em> for catalog ingestion is to run a test batch before going live.','Let\'s document this fix as a <em>best practice</em> so other TAMs can reuse it.'] },
  { phrase:'Synergy', meaning:'When the combined effect of two things is greater than the sum of their individual parts.', cat:'strategy', examples:['There\'s real <em>synergy</em> between the catalog and pricing teams — they should share the data pipeline.','The merger creates <em>synergy</em> in the supply chain that neither company had on its own.','We\'re seeing <em>synergy</em> between the SFP launch and improved customer retention rates.'] },
  { phrase:'Blue sky thinking', meaning:'Unrestricted, creative brainstorming without worrying about practicality or constraints.', cat:'strategy', examples:['Let\'s do some <em>blue sky thinking</em> first — no constraints, just ideas for the retailer portal.','I know it\'s ambitious, but this is the <em>blue sky thinking</em> phase — we\'ll pressure-test later.','The offsite gave us space for <em>blue sky thinking</em> on the next three-year roadmap.'] },
  { phrase:'Skin in the game', meaning:'Having a personal stake in the outcome — risk or investment that keeps you accountable.', cat:'strategy', examples:['The retailer has more <em>skin in the game</em> now that they\'ve committed budget to the integration.','If the vendor has no <em>skin in the game</em>, they\'re less motivated to meet our SLA.','Our team has real <em>skin in the game</em> — our KPIs are tied directly to retailer success.'] },
  { phrase:'Mission critical', meaning:'Absolutely essential to the success or function of the operation — cannot fail.', cat:'strategy', examples:['The catalog ingestion pipeline is <em>mission critical</em> — downtime means zero items on the app.','Treat this retailer launch as <em>mission critical</em>; it\'s our largest account this quarter.','The pricing feed is <em>mission critical</em> during peak hours, so the SLA needs to reflect that.'] },
  { phrase:'Proof of concept', meaning:'A preliminary test or pilot to verify that an idea or approach is feasible before full investment.', cat:'strategy', examples:['Let\'s run a <em>proof of concept</em> with one retailer before we scale the new ingestion model.','The <em>POC</em> showed that real-time sync is viable — now we can write the business case.','A quick <em>proof of concept</em> will tell us if this column mapping approach actually works at scale.'] },
  { phrase:'Go-to-market strategy', meaning:'The plan for how a product or feature will be launched and made available to customers.', cat:'strategy', examples:['The <em>go-to-market strategy</em> for this new onboarding tool needs to target mid-market retailers first.','We need a solid <em>GTM strategy</em> before we announce the pricing changes to existing retailers.','The <em>go-to-market plan</em> should address both the technical rollout and the retailer communication.'] },
  { phrase:'Benchmark', meaning:'A standard reference point used to measure or compare performance, quality, or results.', cat:'strategy', examples:['Our <em>benchmark</em> for catalog accuracy is 99.5% — anything below that triggers a review.','Let\'s <em>benchmark</em> the new pipeline against the old one before we commit to the switch.','Use the top retailer\'s performance as a <em>benchmark</em> for what\'s achievable with the current stack.'] },
  { phrase:'Drill down', meaning:'To investigate or analyze something in greater detail; to go deeper into the data or problem.', cat:'strategy', examples:['Let\'s <em>drill down</em> into the 15% of items that are failing normalization — what\'s causing it?','I want to <em>drill down</em> into the store-level pricing data to see where the discrepancies sit.','<em>Drilling down</em> into the logs, the issue seems to start at the transformation step.'] },

  // ── Collaboration ──
  { phrase:'Take this offline', meaning:'To have a separate, private conversation rather than discussing it in the current meeting.', cat:'collab', examples:['This is getting detailed — let\'s <em>take it offline</em> and schedule time with just us two.','Good question, but it\'s specific to one retailer — can we <em>take it offline</em> after the call?','I don\'t want to derail the group, so let\'s <em>take this offline</em> and loop in the right people.'] },
  { phrase:'Touch base', meaning:'A brief, informal check-in to share updates or get aligned on something.', cat:'collab', examples:['Let\'s <em>touch base</em> tomorrow morning before the retailer call to make sure we\'re aligned.','I\'ll <em>touch base</em> with engineering to get an ETA on the fix.','Can we <em>touch base</em> this week about the SFP launch timeline?'] },
  { phrase:'On the same page', meaning:'Having a mutual understanding or agreement about something.', cat:'collab', examples:['Before we send the retailer an update, let\'s make sure we\'re all <em>on the same page</em>.','I want to sync quickly to get <em>on the same page</em> before the escalation call.','Are we <em>on the same page</em> that this is a P1, or does the team see it differently?'] },
  { phrase:'Ping me', meaning:'Send me a quick message — used informally in Slack, Teams, or email.', cat:'collab', examples:['Once you have the query results, <em>ping me</em> and I\'ll review before you send them.','If anything blocks you today, just <em>ping me</em> on Slack and I\'ll jump in.','<em>Ping me</em> when you\'re free — I need five minutes to walk you through the column map.'] },
  { phrase:'Loop in', meaning:'To include someone in a conversation, email, or decision they weren\'t previously part of.', cat:'collab', examples:['Can you <em>loop in</em> the engineering team on this thread? They\'ll need context.','I\'m going to <em>loop in</em> our PM before we commit to a timeline with the retailer.','Make sure you <em>loop in</em> legal if the retailer is asking for a custom data agreement.'] },
  { phrase:'Buy-in', meaning:'Agreement, approval, or support from key people — especially those with authority or influence.', cat:'collab', examples:['We need executive <em>buy-in</em> before we can change the SLA structure.','Getting retailer <em>buy-in</em> early makes the launch process much smoother.','The proposal is solid, but without engineering <em>buy-in</em>, we won\'t be able to execute.'] },
  { phrase:'Stakeholder', meaning:'Anyone with a vested interest in the outcome of a project or decision.', cat:'collab', examples:['We need to identify all <em>stakeholders</em> before the kickoff to make sure no one is surprised.','The retailer is our primary <em>stakeholder</em>, but the fulfillment team is equally affected.','A <em>stakeholder</em> review is scheduled for Thursday before we finalize the roadmap.'] },
  { phrase:'Visibility', meaning:'Awareness or transparency — ensuring the right people can see status, progress, or issues.', cat:'collab', examples:['I want to give leadership more <em>visibility</em> into the catalog quality issues.','The new dashboard gives the retailer <em>visibility</em> into their ingestion health in real time.','We need better <em>visibility</em> into which retailers are at risk before the quarterly business review.'] },
  { phrase:'Sign off', meaning:'To give official approval or authorization on a decision, document, or deliverable.', cat:'collab', examples:['I need the engineering lead to <em>sign off</em> on the technical spec before we share it externally.','The retailer needs to <em>sign off</em> on the column mapping before we start the ingestion run.','Can you get <em>sign-off</em> from your manager and send it back to us by Friday?'] },
  { phrase:'Keep me in the loop', meaning:'Keep someone informed and updated as things develop — don\'t leave them out.', cat:'collab', examples:['Please <em>keep me in the loop</em> on any communication with the retailer about this issue.','<em>Keep me in the loop</em> on the engineering investigation — I want to know if the ETA changes.','I\'m not the decision-maker here, but <em>keep me in the loop</em> so I can brief the team.'] },
  { phrase:'Champion', meaning:'To actively advocate for an idea, initiative, or person within an organization.', cat:'collab', examples:['We need someone internally to <em>champion</em> this initiative — it won\'t move without an exec sponsor.','The account director is willing to <em>champion</em> the retailer\'s request in the product review.','I\'ve been <em>championing</em> faster image validation for months — glad it\'s finally on the roadmap.'] },
  { phrase:'Escalate', meaning:'To raise an issue to a higher level of authority when it can\'t be resolved at the current level.', cat:'collab', examples:['If we don\'t hear back from the retailer by tomorrow, we\'ll need to <em>escalate</em> to their exec team.','This is beyond my scope — I\'m going to <em>escalate</em> to the engineering director.','Know when to <em>escalate</em>: if a ticket has been open for 72 hours with no progress, it\'s time.'] },
  { phrase:'Socialize an idea', meaning:'To informally share an idea with key people before making a formal proposal, to gauge reaction.', cat:'collab', examples:['Let me <em>socialize this idea</em> with a few team leads before we bring it to the all-hands.','I want to <em>socialize</em> the new onboarding workflow with the TAMs before writing the spec.','Have you <em>socialized</em> this with the engineering team yet? Their feedback will matter most.'] },
  { phrase:'Cross-functional', meaning:'Involving people or teams from multiple departments working together toward a shared goal.', cat:'collab', examples:['This is a <em>cross-functional</em> project — engineering, product, and TAM all need to be aligned.','We set up a <em>cross-functional</em> task force to tackle the catalog reliability issue.','<em>Cross-functional</em> collaboration is what makes large retailer launches successful.'] },
  { phrase:'Alignment', meaning:'The state of being in agreement or working toward the same goal — across people or teams.', cat:'collab', examples:['Before the QBR, I want to make sure there\'s full <em>alignment</em> on the metrics we\'re presenting.','There\'s a lack of <em>alignment</em> between what the retailer expects and what we can deliver.','Let\'s get <em>alignment</em> on the priority before we assign it to the sprint.'] },
  { phrase:'Pushback', meaning:'Resistance or objection to a plan, request, or decision — can be formal or informal.', cat:'collab', examples:['We got some <em>pushback</em> from the retailer on the timeline — they need two more weeks.','Expect <em>pushback</em> from engineering if we try to rush this into the next sprint.','The <em>pushback</em> is fair — we hadn\'t fully accounted for the data migration complexity.'] },
  { phrase:'Empower', meaning:'To give someone the authority, tools, or confidence to take ownership and act independently.', cat:'collab', examples:['The goal of the new workflow is to <em>empower</em> TAMs to resolve catalog issues without engineering.','We want to <em>empower</em> the retailer to self-serve as much as possible after onboarding.','<em>Empowering</em> the team to make decisions at their level speeds up everything downstream.'] },
  { phrase:'Talk track', meaning:'Prepared key messages or speaking points for a conversation, meeting, or presentation.', cat:'collab', examples:['Can you share the <em>talk track</em> for the retailer call so I know what angle we\'re taking?','I built a <em>talk track</em> for explaining the pricing changes without alarming the account.','Stick to the approved <em>talk track</em> during the exec call — don\'t go off-script on the roadmap.'] },
  { phrase:'Single point of contact', meaning:'One designated person responsible for all communication on a topic or project.', cat:'collab', examples:['During the launch, I\'ll be the <em>single point of contact</em> between our team and the retailer.','Having a <em>single point of contact</em> reduces confusion and prevents duplicate communication.','The retailer asked us to designate a <em>SPOC</em> for the integration project.'] },
  { phrase:'Hard stop', meaning:'A firm, non-negotiable end time for a meeting — the person must leave at that exact time.', cat:'collab', examples:['I have a <em>hard stop</em> at 3 PM, so let\'s make sure we cover the key decisions first.','Just flagging — I have a <em>hard stop</em> at the top of the hour. Can we prioritize the action items?','The retailer\'s VP has a <em>hard stop</em> at 30 minutes, so keep the intro tight.'] },

  // ── Workload & Capacity ──
  { phrase:'Bandwidth', meaning:'A person\'s or team\'s capacity to take on additional work at a given time.', cat:'workload', examples:['I don\'t have the <em>bandwidth</em> to run this investigation — can someone else pick it up?','We need to be honest with the retailer that our team\'s <em>bandwidth</em> is stretched right now.','Before assigning this, let\'s check who has <em>bandwidth</em> in the current sprint.'] },
  { phrase:'In the weeds', meaning:'Getting too focused on small details and losing sight of the bigger picture.', cat:'workload', examples:['We\'re getting <em>in the weeds</em> on column mapping — let\'s zoom out and confirm the goal first.','I noticed I was getting <em>in the weeds</em> during the call, so I brought it back to the key ask.','Don\'t get <em>in the weeds</em> on technical details during the stakeholder presentation.'] },
  { phrase:'30,000-foot view', meaning:'A high-level, strategic perspective — the opposite of being in the technical details.', cat:'workload', examples:['From a <em>30,000-foot view</em>, the retailer\'s catalog issues all trace back to the feed format.','Let\'s start with the <em>30,000-foot view</em> before we decide which ticket to prioritize.','The exec team wants the <em>30,000-foot view</em> — they don\'t need the Snowflake query details.'] },
  { phrase:'On my plate', meaning:'Something that someone is currently responsible for or working on.', cat:'workload', examples:['I\'ve got three retailer escalations <em>on my plate</em> right now — this will have to wait until Monday.','What\'s currently <em>on your plate</em>? I want to make sure I\'m not overloading you.','Can you take the catalog audit? I already have too much <em>on my plate</em> this week.'] },
  { phrase:'Fire drill', meaning:'An urgent, unplanned task that disrupts normal work and demands immediate attention.', cat:'workload', examples:['This retailer issue turned into a <em>fire drill</em> — the whole team dropped what they were doing.','We have too many <em>fire drills</em> because we\'re not doing proper root cause analysis.','The launch was going smoothly until a last-minute <em>fire drill</em> around pricing configuration.'] },
  { phrase:'Stretched thin', meaning:'Having too many responsibilities or commitments relative to available capacity.', cat:'workload', examples:['The team is <em>stretched thin</em> across five retailer launches — something is going to slip.','I\'m <em>stretched thin</em> this sprint; if you add more, I\'ll need to drop something else.','The TAM team is <em>stretched thin</em>, which is why we need to standardize the onboarding process.'] },
  { phrase:'Park it', meaning:'To set something aside temporarily and return to it later, without dismissing it entirely.', cat:'workload', examples:['That\'s a good idea, but let\'s <em>park it</em> for now and revisit in the next planning session.','<em>Parking</em> the API question for now — let\'s focus on the feed validation first.','I\'m going to <em>park</em> the retroactive pricing fix and focus on preventing future occurrences.'] },
  { phrase:'Runway', meaning:'The amount of time available before a deadline, budget runs out, or a decision must be made.', cat:'workload', examples:['We have about two weeks of <em>runway</em> before the retailer expects a resolution.','The <em>runway</em> for the catalog migration is shorter than we thought — we need to compress testing.','With only a few sprints of <em>runway</em>, we can\'t afford to scope creep.'] },
  { phrase:'Crunch time', meaning:'A period of intense work and pressure as a deadline or critical moment approaches.', cat:'workload', examples:['We\'re in <em>crunch time</em> for the launch — all hands on deck until go-live.','<em>Crunch time</em> is when team communication matters most — overcommunicate everything.','The next two weeks are going to be <em>crunch time</em>, so clear your calendars for daily standups.'] },
  { phrase:'Triage', meaning:'To assess and prioritize issues by urgency and severity — deciding what to tackle first.', cat:'workload', examples:['We\'ve got eight open retailer tickets — let\'s <em>triage</em> them before Monday\'s standup.','I need to <em>triage</em> these bugs by impact before deciding what goes in the hotfix.','The support team <em>triages</em> incoming issues into P1, P2, and P3 based on business impact.'] },
  { phrase:'Deprioritize', meaning:'To move something to a lower priority — deliberately choosing to focus on other things first.', cat:'workload', examples:['We need to <em>deprioritize</em> the reporting feature this sprint to free up capacity for the hotfix.','The roadmap committee decided to <em>deprioritize</em> the API enhancement until Q4.','I\'m going to <em>deprioritize</em> the documentation cleanup — the retailer issue is more urgent.'] },
  { phrase:'Context switching', meaning:'The cognitive cost of jumping between different tasks, projects, or conversations frequently.', cat:'workload', examples:['Too much <em>context switching</em> is killing productivity — block your calendar for deep work.','Every time I move between retailers, there\'s significant <em>context switching</em> overhead.','Minimizing <em>context switching</em> is why we batch similar tasks together in the same sprint.'] },
  { phrase:'Heads down', meaning:'Focused and deep in concentrated work — not available for interruptions or meetings.', cat:'workload', examples:['I\'m going to be <em>heads down</em> for the next two hours finishing the retailer audit.','The engineering team is <em>heads down</em> on the critical fix — hold all non-urgent questions.','I have a <em>heads down</em> block from 9 to 11 AM every day to protect focus time.'] },
  { phrase:'Juggling priorities', meaning:'Managing multiple competing tasks or responsibilities simultaneously without dropping any.', cat:'workload', examples:['I\'m <em>juggling</em> three retailer launches and two escalations this week — I need support.','The TAM role is all about <em>juggling priorities</em> without letting the urgent crowd out the important.','<em>Juggling priorities</em> is harder when everything is labeled P1 — we need a clearer ranking system.'] },
  { phrase:'Overcommunicate', meaning:'To share more information or updates than might seem necessary — a best practice in complex projects.', cat:'workload', examples:['When timelines shift, <em>overcommunicate</em> — the retailer would rather hear too much than nothing.','In remote teams, it\'s better to <em>overcommunicate</em> than to assume everyone has the same context.','<em>Overcommunicate</em> the change management plan; people need to hear it multiple times to internalize it.'] },

  // ── Execution & Delivery ──
  { phrase:'Bottleneck', meaning:'The slowest or most constrained part of a process that limits overall throughput.', cat:'exec', examples:['The <em>bottleneck</em> in the ingestion pipeline is the normalization step, not feed ingestion.','Manual image review is the <em>bottleneck</em> for catalog launches — we need to automate it.','The approval process is a <em>bottleneck</em> slowing down every retailer SFP onboarding.'] },
  { phrase:'Action item', meaning:'A specific task assigned to someone that needs to be completed by a certain time.', cat:'exec', examples:['<em>Action item</em> for me: I\'ll pull the Snowflake report and share it by Friday.','Let\'s leave this meeting with clear <em>action items</em> and owners for each one.','The <em>action item</em> from the retailer call is to investigate the pricing mismatch in zone 3.'] },
  { phrase:'Deliverable', meaning:'A concrete, tangible output that is expected to be completed and handed over by a specific date.', cat:'exec', examples:['The main <em>deliverable</em> for this week is the QBR deck and the updated SLA document.','Make sure the retailer understands what the <em>deliverables</em> are before the launch date.','We\'re tracking three <em>deliverables</em> this sprint: catalog audit, image fix, and pricing reconciliation.'] },
  { phrase:'Scalable', meaning:'Designed to grow or handle increasing demand without requiring major rework.', cat:'exec', examples:['The manual workaround works for now, but it\'s not <em>scalable</em> beyond 50 retailers.','We need a <em>scalable</em> solution, not just a one-off fix for this retailer.','The ingestion process is finally <em>scalable</em> — it handles 10x the item count without issues.'] },
  { phrase:'Leverage', meaning:'To use a resource, relationship, data, or advantage to maximum effect.', cat:'exec', examples:['We can <em>leverage</em> the existing Snowflake queries to build the retailer health dashboard.','Let\'s <em>leverage</em> the relationship we have with their IT team to fast-track the integration.','<em>Leveraging</em> past QBR data, I built a trend report showing catalog quality over time.'] },
  { phrase:'Iterate', meaning:'To make incremental improvements to a product, process, or plan through repeated cycles.', cat:'exec', examples:['We shipped a v1 of the dashboard — let\'s <em>iterate</em> based on retailer feedback over the next two sprints.','Don\'t wait for perfection; ship it and <em>iterate</em> quickly based on what you learn.','The column mapping approach is solid — we just need to <em>iterate</em> on edge cases.'] },
  { phrase:'Cadence', meaning:'A regular, predictable rhythm or schedule for meetings, reviews, or communications.', cat:'exec', examples:['We established a weekly <em>cadence</em> with the retailer to review catalog health metrics.','Our QBR <em>cadence</em> is quarterly, but high-touch accounts get a monthly business review.','Stick to the <em>cadence</em> — consistency builds trust with the retailer over time.'] },
  { phrase:'Roadmap', meaning:'A strategic plan that shows what will be built or delivered and when, over a future timeframe.', cat:'exec', examples:['The product <em>roadmap</em> for H2 includes real-time pricing sync and image AI validation.','The retailer asked to see our <em>roadmap</em> so they can plan their internal resources accordingly.','Before committing to the retailer, check if it\'s on the <em>roadmap</em> — we can\'t promise ad hoc features.'] },
  { phrase:'Milestone', meaning:'A significant achievement or checkpoint in a project that marks meaningful progress.', cat:'exec', examples:['Completing the first catalog ingestion without errors is a major <em>milestone</em> for this retailer.','We hit a key <em>milestone</em> today: 10 retailers live on the new normalization pipeline.','Let\'s celebrate this <em>milestone</em> — it took three months of hard work to get here.'] },
  { phrase:'KPI', meaning:'Key Performance Indicator — a measurable value that shows how effectively a goal is being achieved.', cat:'exec', examples:['Our primary <em>KPI</em> for this quarter is retailer catalog accuracy above 99%.','If the <em>KPIs</em> don\'t improve after this sprint, we need to rethink the approach.','Every retailer should have a clear set of <em>KPIs</em> agreed upon before the launch.'] },
  { phrase:'MVP', meaning:'Minimum Viable Product — the simplest version of a feature or product that can be shipped and tested.', cat:'exec', examples:['Let\'s ship the <em>MVP</em> of the catalog health dashboard by end of month and iterate from there.','The <em>MVP</em> doesn\'t need to be perfect — it needs to be usable enough to get feedback.','We scoped down to an <em>MVP</em> so we could hit the Q3 deadline without sacrificing core functionality.'] },
  { phrase:'Hit the ground running', meaning:'To start a new task or project with immediate speed and effectiveness — no ramp-up time needed.', cat:'exec', examples:['With your catalog experience, you\'ll <em>hit the ground running</em> on this retailer account.','We need someone who can <em>hit the ground running</em> — the launch is in three weeks.','The onboarding documentation was so thorough that the new TAM could <em>hit the ground running</em>.'] },
  { phrase:'Due diligence', meaning:'The research and investigation done before making a decision, commitment, or agreement.', cat:'exec', examples:['We need to do proper <em>due diligence</em> on the retailer\'s data structure before committing to a timeline.','<em>Due diligence</em> revealed that the retailer\'s feed had undocumented custom fields we weren\'t aware of.','Skipping <em>due diligence</em> on the catalog spec is why we\'re dealing with this problem now.'] },
  { phrase:'Sanity check', meaning:'A quick verification to make sure something is correct, reasonable, or makes sense.', cat:'exec', examples:['Can you do a <em>sanity check</em> on my query before I share these numbers with the retailer?','Quick <em>sanity check</em> — are we sure the item count drop is a data issue and not a display issue?','Always do a <em>sanity check</em> on the totals before the QBR. Retailers notice errors immediately.'] },
  { phrase:'Red flag', meaning:'A warning sign that something is wrong, risky, or potentially problematic — warrants attention.', cat:'exec', examples:['The fact that the retailer hasn\'t responded in five days is a <em>red flag</em> — check in with them.','A sudden 30% drop in item count is always a <em>red flag</em> worth investigating before it becomes a P1.','The audit surfaced a <em>red flag</em>: pricing for weighted items has been wrong for three weeks.'] },
  { phrase:'Green light', meaning:'Approval or permission to proceed with a plan, project, or action.', cat:'exec', examples:['We got the <em>green light</em> from the retailer\'s IT team — ingestion starts Monday.','The exec team gave us the <em>green light</em> to expand the pilot to five new regions.','We\'re waiting on the <em>green light</em> from legal before sharing the data agreement with the retailer.'] },
  { phrase:'Table it', meaning:'In US corporate usage: to postpone or defer a discussion for a later time.', cat:'exec', examples:['That\'s a valid concern — can we <em>table it</em> for now and revisit in next week\'s sync?','<em>Tabling</em> the API enhancement discussion until we have more clarity on the Q4 roadmap.','Let\'s <em>table</em> the pricing model debate — we don\'t have enough data to decide today.'] },
  { phrase:'Put a pin in it', meaning:'To pause a discussion or idea temporarily and return to it later — similar to "table it".', cat:'exec', examples:['Good point — let\'s <em>put a pin in it</em> and make sure it\'s on the agenda for next week.','<em>Put a pin in</em> the migration plan; we need to finish the audit first.','I want to come back to this. <em>Put a pin in it</em> — I\'ll add it to the parking lot document.'] },
  { phrase:'Move the goalposts', meaning:'To change the requirements or success criteria midway through a project — usually frustrating for the team.', cat:'exec', examples:['The retailer keeps <em>moving the goalposts</em> — we need to lock the spec before writing another line of code.','Every time we\'re close to delivering, someone <em>moves the goalposts</em>. We need a change control process.','<em>Moving the goalposts</em> after the sprint has started is expensive — changes should wait for the next cycle.'] },
  { phrase:'Gut check', meaning:'An intuitive evaluation or quick reality test — checking whether something feels right before proceeding.', cat:'exec', examples:['Quick <em>gut check</em>: does this timeline feel realistic given everything else we have going on?','My <em>gut check</em> says the retailer isn\'t going to like this proposal — let\'s soften the delivery.','Before we escalate, do a <em>gut check</em>: is this truly a P1, or does it just feel urgent right now?'] },

  // ── Tech & IT ──
  { phrase:'Technical debt', meaning:'The accumulated cost of shortcuts or workarounds that will need to be fixed or refactored later.', cat:'tech', examples:['We\'re carrying a lot of <em>technical debt</em> in the ingestion pipeline — it\'s slowing down every new feature.','Every quick fix creates <em>technical debt</em>; eventually you have to pay it back.','Before we add more features, we should allocate a sprint to paying down <em>technical debt</em>.'] },
  { phrase:'End-to-end', meaning:'Covering the complete process from start to finish, without gaps or hand-offs to another system.', cat:'tech', examples:['We need to test the <em>end-to-end</em> flow before the retailer goes live — not just the ingestion step.','The new platform handles the <em>end-to-end</em> catalog journey: upload, validation, normalization, and display.','An <em>end-to-end</em> audit of the pricing pipeline revealed a discrepancy at the store-level mapping step.'] },
  { phrase:'Single source of truth', meaning:'One authoritative, agreed-upon location or system where data or information is stored and trusted.', cat:'tech', examples:['Snowflake is the <em>single source of truth</em> for all retailer catalog data — don\'t use the cached API.','We need a <em>single source of truth</em> for pricing; having two systems with different values is causing confusion.','The wiki should be the <em>single source of truth</em> for the onboarding process — all other docs should link there.'] },
  { phrase:'Legacy system', meaning:'An older technology or system that is still in use but may be outdated or harder to maintain.', cat:'tech', examples:['The retailer is still on a <em>legacy system</em> that doesn\'t support real-time API calls.','Integrating with their <em>legacy system</em> added six weeks to the project timeline.','We\'re building a bridge between the <em>legacy system</em> and the new platform while the migration happens.'] },
  { phrase:'Sunset', meaning:'To phase out or retire a product, feature, or system — gradually stopping support for it.', cat:'tech', examples:['The old ingestion method is being <em>sunsetted</em> in Q1 — all retailers need to migrate before then.','We\'re <em>sunsetting</em> the manual image upload process in favor of the automated validation pipeline.','The API v1 was <em>sunsetted</em> last year; any retailer still using it needs to upgrade immediately.'] },
  { phrase:'Out of the box', meaning:'Working immediately without requiring customization or configuration — ready to use as-is.', cat:'tech', examples:['The new integration works <em>out of the box</em> for standard feed formats — no custom mapping needed.','Most retailers can go live with the <em>out-of-the-box</em> configuration without TAM involvement.','<em>Out of the box</em>, the tool handles 80% of catalog scenarios; the remaining 20% need custom logic.'] },
  { phrase:'Regression', meaning:'When a change or fix in one area accidentally breaks something that was previously working.', cat:'tech', examples:['The latest deployment caused a <em>regression</em> in the price display for weighted items.','Always run the full test suite after a hotfix to catch any <em>regressions</em> before they hit production.','We identified a <em>regression</em> in the normalization step — it started failing on items with special characters.'] },
  { phrase:'Tiger team', meaning:'A specialized, dedicated group assembled temporarily to solve a specific critical problem.', cat:'tech', examples:['We\'re forming a <em>tiger team</em> to investigate the catalog reliability issue — I\'ll need two engineers.','The exec team created a <em>tiger team</em> to tackle the retailer\'s P1 escalation.','A <em>tiger team</em> is the right approach when the problem is too complex for a single owner to solve.'] },
  { phrase:'Cut over', meaning:'The moment of switching from one system or process to another — often the final step of a migration.', cat:'tech', examples:['The <em>cut over</em> to the new ingestion pipeline is scheduled for Saturday at midnight to minimize impact.','We\'ll do a dry run on Friday, then the actual <em>cut over</em> happens Sunday morning.','The <em>cut over</em> went smoothly — all retailer feeds are now running on the new infrastructure.'] },
  { phrase:'Rubber stamp', meaning:'To approve something quickly and without much scrutiny — often a formality.', cat:'tech', examples:['The legal review was just a <em>rubber stamp</em> — they didn\'t ask a single question.','I don\'t want this to be a <em>rubber stamp</em> approval; I want genuine feedback on the proposal.','The committee <em>rubber-stamped</em> the budget increase without reviewing the line items.'] },
];

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
  phraseIdx: 0,           // which phrase to show this session
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

function genPhrase() {
  const ph = PHRASES[S.phraseIdx];
  const otherMeanings = PHRASES.filter((_, i) => i !== S.phraseIdx).map(p => p.meaning);
  const wrongs = shuffle(otherMeanings).slice(0, 3);
  return {
    cat: 'phrase',
    type: 'phrase',
    phrase: ph.phrase,
    meaning: ph.meaning,
    examples: ph.examples,
    phraseIdx: S.phraseIdx,
    displayMs: 16000,
    ans: ph.meaning,
    opts: shuffle([ph.meaning, ...wrongs]),
    tl: 18,
    label: 'What does this phrase mean?',
  };
}

function makeChallenge(cat, d) {
  switch (cat) {
    case 'math':         return genMath(d);
    case 'memory':       return genMemory(d);
    case 'pattern':      return genPattern(d);
    case 'words':        return genWords(d);
    case 'articulation': return genArticulation(d);
    case 'phrase':       return genPhrase();
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
  if (ch.type === 'synonym' || ch.type === 'phrase') {
    const correct = input === ch.ans;
    const base    = ch.type === 'phrase' ? 40 : {easy:30,medium:50,hard:70}[S.diff];
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
  S.phraseIdx = (load().sessions || 0) % PHRASES.length;
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
  if(ch.type==='digit'||ch.type==='digit-rev'||ch.type==='letter'||ch.type==='letter-rev'||ch.type==='missing'||ch.type==='words'||ch.type==='phrase') startMemorize();
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
  } else if (ch.type === 'phrase') {
    document.getElementById('mem-instruction').textContent = '💬 Daily Phrase — read carefully, then answer';
    const num = `Phrase ${S.phraseIdx + 1} of ${PHRASES.length}`;
    document.getElementById('mem-content').innerHTML = `
      <div class="phrase-card">
        <div class="phrase-num">${num}</div>
        <div class="phrase-headline">"${ch.phrase}"</div>
        <div class="phrase-meaning">${ch.meaning}</div>
        <div class="phrase-examples">
          ${ch.examples.map(e => `<div class="phrase-ex">${e}</div>`).join('')}
        </div>
      </div>`;
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

  if(ch.type==='synonym'||ch.type==='phrase') {
    textArea.style.display='none'; choiceArea.style.display='block';
    const grid = document.getElementById('choice-grid');
    // For phrase: truncate long meanings so buttons don't overflow
    grid.innerHTML = ch.opts.map(o=>`<button class="choice-btn" data-opt="${o}" style="font-size:${o.length>50?'0.8rem':'0.95rem'}">${o}</button>`).join('');
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
  } else if(ch.type==='phrase') {
    promptEl.textContent = ch.label || 'What does this phrase mean?';
    mainEl.textContent = `"${ch.phrase}"`;
    mainEl.style.fontSize = '1.6rem';
    hintEl.style.display = 'none';
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
  if(ch.type==='synonym'||ch.type==='phrase') return;
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
