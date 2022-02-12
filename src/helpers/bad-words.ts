import { object } from 'badwords-list';

/**
 * Leet speek alternatives to letters.
 */
 const leetLetters = {
  a: "4Д@",
  b: "d836",
  c: "k<({[",
  d: "b6?",
  e: "3£€&ë",
  f: "ƒv",
  g: "&69j",
  h: "#",
  i: "1!|",
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
  'a n a l': 1,
  'anus': 1,
  'a n u s': 1,
  'arse': 1,
  'a r s e': 1,
  'ass': 1,
  'a s s': 1,
  'ballsack': 1,
  'b a l l s a c k': 1,
  'bastard': 1,
  'b a s t a r d': 1,
  'bitch': 1,
  'b i t c h': 1,
  'biatch': 1,
  'b i a t c h': 1,
  'blowjob': 1,
  'b l o w j o b': 1,
  'blow job': 1,
  'bollock': 1,
  'b o l l o c k': 1,
  'bollok': 1,
  'b o l l o k': 1,
  'boner': 1,
  'b o n e r': 1,
  'boob': 1,
  'b o o b': 1,
  'buttplug': 1,
  'b u t t p l u g': 1,
  'clitoris': 1,
  'c l i t o r i s': 1,
  'cock': 1,
  'c o c k': 1,
  'coon': 1,
  'c o o n': 1,
  'cunt': 1,
  'c u n t': 1,
  'dick': 1,
  'd i c k': 1,
  'dildo': 1,
  'd i l d o': 1,
  'dyke': 1,
  'd y k e': 1,
  'fag': 1,
  'f a g': 1,
  'faggot': 1,
  'f a g g o t': 1,
  'fagot': 1,
  'f a g o t': 1,
  'feck': 1,
  'f e c k': 1,
  'fellate': 1,
  'f e l l a t e': 1,
  'fellatio': 1,
  'f e l l a t i o': 1,
  'felching': 1,
  'f e l c h i n g': 1,
  'fuck': 1,
  'fucking': 1,
  'f u c k i n g': 1,
  'f u c k': 1,
  'flange': 1,
  'f l a n g e': 1,
  'Goddamn': 1,
  'g o d d a m n': 1,
  'goddamnit': 1,
  'g o d d a m n i t': 1,
  'God damn': 1,
  'ho': 1,
  'h o': 1,
  'homo': 1,
  'h o m o': 1,
  'jizz': 1,
  'j i z z': 1,
  'knobend': 1,
  'k n o b e n d': 1,
  'knob end': 1,
  'labia': 1,
  'l a b i a': 1,
  'nigger': 1,
  'n i g g e r': 1,
  'nigga': 1,
  'n i g g a': 1,
  'penis': 1,
  'p e n i s': 1,
  'piss': 1,
  'p i s s': 1,
  'prick': 1,
  'p r i c k': 1,
  'pube': 1,
  'p u b e': 1,
  'pussy': 1,
  'p u s s y': 1,
  'queer': 1,
  'q e e r': 1,
  'scrotum': 1,
  's c r o t u m': 1,
  'sex': 1,
  's e x': 1,
  'shit': 1,
  's h i t': 1,
  'slut': 1,
  's l u t': 1,
  'smegma': 1,
  's m e g m a': 1,
  'spunk': 1,
  's p u n k': 1,
  'tit': 1,
  't i t': 1,
  'titty': 1,
  't i t t y': 1,
  'tittie': 1,
  't i t t i e': 1,
  'turd': 1,
  't u r d': 1,
  'twat': 1,
  't w a t': 1,
  'vagina': 1,
  'v a g i n a': 1,
  'wank': 1,
  'w a n k': 1,
  'wankstain': 1,
  'w a n k s t a i n': 1,
  'wanker': 1,
  'w a n k e r': 1,
  'whore': 1,
  'w h o r e': 1,
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
  return word.replace(/[abcdefghijklmnopqrstuvwxyz]/g, c => `[${c}${leetLetters[c]}]+`) + "(s?)";
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