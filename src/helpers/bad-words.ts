import { object } from 'badwords-list';

/**
 * Leet speek alternatives to letters.
 */
 const leetLetters = {
  a: "4@Д",
  e: "3£€ë",
  i: "1!|",
  o: "0Ø",
  u: "vµบ",
}

/**
 * Words that will be flagged in discord channel
 */
const flagWords: string[] = [ ...object.toString(), 'wtf', 'lmfao' ];

/**
 * Words that will be immediately removed
 */
const explicitWords: string[] = [
  'anal',
  'anus',
  'arse',
  'ass',
  'ballsack',
  'balls',
  'bastard',
  'bitch',
  'biatch',
  'blowjob',
  'blow job',
  'bollock',
  'bollok',
  'boner',
  'boob',
  'butt',
  'buttplug',
  'clitoris',
  'cock',
  'coon',
  'cunt',
  'dick',
  'dildo',
  'dyke',
  'fag',
  'feck',
  'fellate',
  'fellatio',
  'felching',
  'fuck',
  'f u c k',
  'flange',
  'Goddamn',
  'God damn',
  'homo',
  'jizz',
  'knobend',
  'knob end',
  'labia',
  'nigger',
  'nigga',
  'penis',
  'piss',
  'prick',
  'pube',
  'pussy',
  'queer',
  'scrotum',
  'sex',
  'shit',
  'sh1t',
  'slut',
  'smegma',
  'spunk',
  'tit',
  'turd',
  'twat',
  'vagina',
  'wank',
  'whore',
];

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
  return word.replace(/[aeiou]/g, c => `[${c}${leetLetters[c]}]+`);
}

/**
 * Creates a RegExp string for all words within a list, 
 * accounting for punctuation l33t speak
 * 
 * @param wordList The list of words to be created into a RegExp string
 * @returns A RegExp string for all words within a list
 */
function createRegexList(wordList: string[]) {
  return "\\b(" + wordList.map(createRegexFromWord).join("|") + ")\\b";
}

/**
 * RegExp for flagged words
 */
export const flag = new RegExp(createRegexList(flagWords), "ig");

/**
 * RegExp for explicit words
 */
export const explicit = new RegExp(createRegexList(explicitWords), "ig");