import { object } from 'badwords-list';

/**
 * Leet speek alternatives to letters.
 */
 const leetLetters = {
  a: "4Д@",
  b: "d836",
  c: "k",
  d: "b6?",
  e: "3£€&ë",
  f: "ƒv",
  g: "&69j",
  h: "#",
  i: "1!",
  j: "1;",
  k: "c",
  l: "17|i£",
  m: "w",
  n: "И^ท",
  o: "0Øq",
  p: "9q",
  q: "92p",
  r: "®Я",
  s: "5z2$",
  t: "7+",
  u: "vµบ",
  v: "u",
  w: "ШЩพ",
  x: "×*?",
  y: "j7Ч",
  z: "2s",
}

/**
 * Words that will be flagged in discord channel
 */
const flagWords = { ...object, 'wtf': 1, 'lmfao': 1 };

/**
 * Words that will be immediately removed
 */
const explicitWords = {
  'anal': 1,
  'anus': 1,
  'arse': 1,
  'ass': 1,
  'ballsack': 1,
  'balls': 1,
  'bastard': 1,
  'bitch': 1,
  'biatch': 1,
  'blowjob': 1,
  'blow job': 1,
  'bollock': 1,
  'bollok': 1,
  'boner': 1,
  'boob': 1,
  'butt': 1,
  'buttplug': 1,
  'clitoris': 1,
  'cock': 1,
  'coon': 1,
  'cunt': 1,
  'dick': 1,
  'dildo': 1,
  'dyke': 1,
  'fag': 1,
  'feck': 1,
  'fellate': 1,
  'fellatio': 1,
  'felching': 1,
  'fuck': 1,
  'f u c k': 1,
  'flange': 1,
  'Goddamn': 1,
  'God damn': 1,
  'homo': 1,
  'jizz': 1,
  'knobend': 1,
  'knob end': 1,
  'labia': 1,
  'nigger': 1,
  'nigga': 1,
  'penis': 1,
  'piss': 1,
  'prick': 1,
  'pube': 1,
  'pussy': 1,
  'queer': 1,
  'scrotum': 1,
  'sex': 1,
  'shit': 1,
  'slut': 1,
  'smegma': 1,
  'spunk': 1,
  'tit': 1,
  'turd': 1,
  'twat': 1,
  'vagina': 1,
  'wank': 1,
  'whore': 1,
};

/**
 * Creates a RegExp string for a word, 
 * accounting for punctuation and l33t speak
 * 
 * @param word The word to be converted into a RegExp string
 * @returns A RegExp string for a word
 */
function createRegexFromWord(word: string) {
  //Account for punctuation
  word = word.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');

  //Account for l33t speak
  return word.replace(/[abcdefghijklmnopqrstuvwxyz]/g, c => `[${c}${leetLetters[c]}]+`);
}

/**
 * Creates a RegExp string for all words within a list, 
 * accounting for punctuation l33t speak
 * 
 * @param wordList The list of words to be created into a RegExp string
 * @returns A RegExp string for all words within a list
 */
function createRegexList(wordList: Object) {
  return "\\b(" + Object.keys(wordList).map(createRegexFromWord).join("|") + ")\\b";
}

/**
 * RegExp for flagged words
 */
export const flag = new RegExp(createRegexList(flagWords), "ig");

/**
 * RegExp for explicit words
 */
export const explicit = new RegExp(createRegexList(explicitWords), "ig");