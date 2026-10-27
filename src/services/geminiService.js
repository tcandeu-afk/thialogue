import { GEMINI_CHAPTER_RESPONSE_SCHEMA } from '../types/schema';
import { getPriorityLearningWords } from './storageService';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const DIFFICULTY_INSTRUCTIONS = {
  simplify: {
    label: 'Simplified (i-1 Scaffolding)',
    promptDirective:
      'The reader found the previous chapter TOO HARD. Simplify the syntax: use shorter, high-clarity sentences, use high-frequency core vocabulary, provide strong contextual clues around target words, and stick to foundational tense/aspect structures.',
  },
  maintain: {
    label: 'Comprehensible Input (i+1 Flow)',
    promptDirective:
      'The reader found the previous chapter JUST RIGHT. Maintain the current CEFR difficulty level following Stephen Krashen’s i+1 Comprehensible Input principle: 95% familiar structures with gentle, natural forward plot momentum.',
  },
  challenge: {
    label: 'Challenging (i+2 Stretch)',
    promptDirective:
      'The reader found the previous chapter TOO EASY. Increase linguistic richness slightly above baseline: introduce more natural connectors, subordinate clauses, vivid descriptive verbs, and deeper narrative intrigue while staying comprehensible.',
  },
  regenerate: {
    label: 'Fresh Story & New Vocabulary',
    promptDirective:
      'Generate a fresh, engaging chapter introducing 4 to 5 practical new vocabulary words in vivid context while also recycling the learner’s target words.',
  },
};

/**
 * Built-in rotating bonus fiction chapters with characters, dialogue, and fresh vocabulary for all 4 languages
 * so clicking "Regenerate New Text & Vocabulary" or "+ New Chapter" produces an engaging story even offline!
 */
const BONUS_SCENE_BANK = {
  fr: [
    {
      title: 'Le Billet Caché à la Boulangerie (The Hidden Note at the Bakery)',
      summary: 'Clara and Lucas stop at a warm neighbourhood bakery where Madame Moreau slips them a mysterious postcard signed by the man in the grey coat.',
      recycled: ['clé', 'chercher', 'pluie', 'boulangerie'],
      sentences: [
        {
          fullSentence: 'Après la pluie, l’odeur du pain chaud attire Clara et Lucas vers la boulangerie du coin.',
          englishTranslation: 'After the rain, the smell of warm bread draws Clara and Lucas toward the corner bakery.',
          romanisation: null,
          grammarNote: 'Use "du" (contraction of "de + le") to mean "of the" before masculine nouns like "pain" and "coin".',
          tokens: [
            { surface: 'Après', reading: null, baseForm: 'après', contextualMeaning: 'after' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'pluie,', reading: null, baseForm: 'pluie', contextualMeaning: 'rain' },
            { surface: 'l’odeur', reading: null, baseForm: 'odeur', contextualMeaning: 'the smell' },
            { surface: 'du', reading: null, baseForm: 'du', contextualMeaning: 'of the' },
            { surface: 'pain', reading: null, baseForm: 'pain', contextualMeaning: 'bread' },
            { surface: 'chaud', reading: null, baseForm: 'chaud', contextualMeaning: 'warm' },
            { surface: 'attire', reading: null, baseForm: 'attirer', contextualMeaning: 'draws / attracts' },
            { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
            { surface: 'Lucas', reading: null, baseForm: 'Lucas', contextualMeaning: 'Lucas' },
            { surface: 'vers', reading: null, baseForm: 'vers', contextualMeaning: 'toward' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'boulangerie', reading: null, baseForm: 'boulangerie', contextualMeaning: 'bakery' },
            { surface: 'du', reading: null, baseForm: 'du', contextualMeaning: 'of the' },
            { surface: 'coin.', reading: null, baseForm: 'coin', contextualMeaning: 'corner' },
          ],
        },
        {
          fullSentence: 'La boulangère, Madame Moreau, regarde la clé dorée de Clara et sourit mystérieusement.',
          englishTranslation: 'The baker, Madame Moreau, looks at Clara’s golden key and smiles mysteriously.',
          romanisation: null,
          grammarNote: 'Adverbs ending in "-ment" like "mystérieusement" correspond to "-ly" in English ("mysteriously").',
          tokens: [
            { surface: 'La', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'boulangère,', reading: null, baseForm: 'boulanger', contextualMeaning: 'baker' },
            { surface: 'Madame', reading: null, baseForm: 'madame', contextualMeaning: 'Mrs.' },
            { surface: 'Moreau,', reading: null, baseForm: 'Moreau', contextualMeaning: 'Moreau' },
            { surface: 'regarde', reading: null, baseForm: 'regarder', contextualMeaning: 'looks at' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'clé', reading: null, baseForm: 'clé', contextualMeaning: 'key' },
            { surface: 'dorée', reading: null, baseForm: 'doré', contextualMeaning: 'golden' },
            { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
            { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
            { surface: 'sourit', reading: null, baseForm: 'sourire', contextualMeaning: 'smiles' },
            { surface: 'mystérieusement.', reading: null, baseForm: 'mystérieusement', contextualMeaning: 'mysteriously' },
          ],
        },
        {
          fullSentence: '« Vous êtes Clara ? L’homme au manteau gris a payé deux croissants et a laissé cette carte pour vous ! » dit-elle.',
          englishTranslation: '"Are you Clara? The man in the grey coat paid for two croissants and left this card for you!" she says.',
          romanisation: null,
          grammarNote: '"A payé" and "a laissé" use the passé composé ("avoir" + past participle) to recount completed actions.',
          tokens: [
            { surface: '« Vous', reading: null, baseForm: 'vous', contextualMeaning: 'you' },
            { surface: 'êtes', reading: null, baseForm: 'être', contextualMeaning: 'are' },
            { surface: 'Clara ?', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'L’homme', reading: null, baseForm: 'homme', contextualMeaning: 'the man' },
            { surface: 'au', reading: null, baseForm: 'au', contextualMeaning: 'in the' },
            { surface: 'manteau', reading: null, baseForm: 'manteau', contextualMeaning: 'coat' },
            { surface: 'gris', reading: null, baseForm: 'gris', contextualMeaning: 'grey' },
            { surface: 'a', reading: null, baseForm: 'avoir', contextualMeaning: 'has' },
            { surface: 'payé', reading: null, baseForm: 'payer', contextualMeaning: 'paid for' },
            { surface: 'deux', reading: null, baseForm: 'deux', contextualMeaning: 'two' },
            { surface: 'croissants', reading: null, baseForm: 'croissant', contextualMeaning: 'croissants' },
            { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
            { surface: 'a', reading: null, baseForm: 'avoir', contextualMeaning: 'has' },
            { surface: 'laissé', reading: null, baseForm: 'laisser', contextualMeaning: 'left' },
            { surface: 'cette', reading: null, baseForm: 'ce', contextualMeaning: 'this' },
            { surface: 'carte', reading: null, baseForm: 'carte', contextualMeaning: 'card' },
            { surface: 'pour', reading: null, baseForm: 'pour', contextualMeaning: 'for' },
            { surface: 'vous ! »', reading: null, baseForm: 'vous', contextualMeaning: 'you' },
            { surface: 'dit-elle.', reading: null, baseForm: 'dire', contextualMeaning: 'says she' },
          ],
        },
        {
          fullSentence: 'Lucas lit la carte à voix haute : « Ce soir à huit heures, cherchez le bateau vert près du Pont Neuf. »',
          englishTranslation: 'Lucas reads the card aloud: "Tonight at eight o’clock, look for the green boat near the Pont Neuf."',
          romanisation: null,
          grammarNote: '"À voix haute" means "out loud", the opposite of "à voix basse" ("in a low voice").',
          tokens: [
            { surface: 'Lucas', reading: null, baseForm: 'Lucas', contextualMeaning: 'Lucas' },
            { surface: 'lit', reading: null, baseForm: 'lire', contextualMeaning: 'reads' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'carte', reading: null, baseForm: 'carte', contextualMeaning: 'card' },
            { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'in / at' },
            { surface: 'voix', reading: null, baseForm: 'voix', contextualMeaning: 'voice' },
            { surface: 'haute :', reading: null, baseForm: 'haut', contextualMeaning: 'high / loud' },
            { surface: '« Ce', reading: null, baseForm: 'ce', contextualMeaning: 'this' },
            { surface: 'soir', reading: null, baseForm: 'soir', contextualMeaning: 'evening / tonight' },
            { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'at' },
            { surface: 'huit', reading: null, baseForm: 'huit', contextualMeaning: 'eight' },
            { surface: 'heures,', reading: null, baseForm: 'heure', contextualMeaning: 'o’clock' },
            { surface: 'cherchez', reading: null, baseForm: 'chercher', contextualMeaning: 'look for!' },
            { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'the' },
            { surface: 'bateau', reading: null, baseForm: 'bateau', contextualMeaning: 'boat' },
            { surface: 'vert', reading: null, baseForm: 'vert', contextualMeaning: 'green' },
            { surface: 'près', reading: null, baseForm: 'près', contextualMeaning: 'near' },
            { surface: 'du', reading: null, baseForm: 'du', contextualMeaning: 'the' },
            { surface: 'Pont', reading: null, baseForm: 'pont', contextualMeaning: 'Bridge' },
            { surface: 'Neuf. »', reading: null, baseForm: 'neuf', contextualMeaning: 'New (Pont Neuf)' },
          ],
        },
      ],
    },
    {
      title: 'Rendez-vous sur le Bateau Vert (Meeting on the Green Boat)',
      summary: 'At dusk by the River Seine, Clara and Lucas board the green houseboat and meet Clara’s uncle, who reveals why he hid the golden key.',
      recycled: ['clé', 'chercher', 'bateau', 'pont'],
      sentences: [
        {
          fullSentence: 'Au coucher du soleil, Clara et Lucas traversent le vieux pont de pierre au-dessus de la Seine.',
          englishTranslation: 'At sunset, Clara and Lucas cross the old stone bridge above the Seine.',
          romanisation: null,
          grammarNote: '"Au coucher du soleil" (literally "at the lying-down of the sun") is the standard French phrase for "at sunset".',
          tokens: [
            { surface: 'Au', reading: null, baseForm: 'au', contextualMeaning: 'at the' },
            { surface: 'coucher', reading: null, baseForm: 'coucher', contextualMeaning: 'setting' },
            { surface: 'du', reading: null, baseForm: 'du', contextualMeaning: 'of the' },
            { surface: 'soleil,', reading: null, baseForm: 'soleil', contextualMeaning: 'sun' },
            { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
            { surface: 'Lucas', reading: null, baseForm: 'Lucas', contextualMeaning: 'Lucas' },
            { surface: 'traversent', reading: null, baseForm: 'traverser', contextualMeaning: 'cross' },
            { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'the' },
            { surface: 'vieux', reading: null, baseForm: 'vieux', contextualMeaning: 'old' },
            { surface: 'pont', reading: null, baseForm: 'pont', contextualMeaning: 'bridge' },
            { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
            { surface: 'pierre', reading: null, baseForm: 'pierre', contextualMeaning: 'stone' },
            { surface: 'au-dessus', reading: null, baseForm: 'au-dessus', contextualMeaning: 'above' },
            { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'Seine.', reading: null, baseForm: 'Seine', contextualMeaning: 'Seine' },
          ],
        },
        {
          fullSentence: 'Sur le bateau vert, l’homme au manteau gris enlève son chapeau et sourit : « Bonsoir Clara, je suis ton oncle Antoine ! »',
          englishTranslation: 'On the green boat, the man in the grey coat takes off his hat and smiles: "Good evening Clara, I am your Uncle Antoine!"',
          romanisation: null,
          grammarNote: '"Ton" is used before masculine nouns ("ton oncle") as well as feminine nouns that start with a vowel.',
          tokens: [
            { surface: 'Sur', reading: null, baseForm: 'sur', contextualMeaning: 'on' },
            { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'the' },
            { surface: 'bateau', reading: null, baseForm: 'bateau', contextualMeaning: 'boat' },
            { surface: 'vert,', reading: null, baseForm: 'vert', contextualMeaning: 'green' },
            { surface: 'l’homme', reading: null, baseForm: 'homme', contextualMeaning: 'the man' },
            { surface: 'au', reading: null, baseForm: 'au', contextualMeaning: 'in the' },
            { surface: 'manteau', reading: null, baseForm: 'manteau', contextualMeaning: 'coat' },
            { surface: 'gris', reading: null, baseForm: 'gris', contextualMeaning: 'grey' },
            { surface: 'enlève', reading: null, baseForm: 'enlever', contextualMeaning: 'takes off' },
            { surface: 'son', reading: null, baseForm: 'son', contextualMeaning: 'his' },
            { surface: 'chapeau', reading: null, baseForm: 'chapeau', contextualMeaning: 'hat' },
            { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
            { surface: 'sourit :', reading: null, baseForm: 'sourire', contextualMeaning: 'smiles' },
            { surface: '« Bonsoir', reading: null, baseForm: 'bonsoir', contextualMeaning: 'good evening' },
            { surface: 'Clara,', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'je', reading: null, baseForm: 'je', contextualMeaning: 'I' },
            { surface: 'suis', reading: null, baseForm: 'être', contextualMeaning: 'am' },
            { surface: 'ton', reading: null, baseForm: 'ton', contextualMeaning: 'your' },
            { surface: 'oncle', reading: null, baseForm: 'oncle', contextualMeaning: 'uncle' },
            { surface: 'Antoine ! »', reading: null, baseForm: 'Antoine', contextualMeaning: 'Antoine!' },
          ],
        },
        {
          fullSentence: '« Pourquoi avez-vous caché la clé au Café Rouge ? » demande Clara avec surprise.',
          englishTranslation: '"Why did you hide the key at Café Rouge?" asks Clara in surprise.',
          romanisation: null,
          grammarNote: 'Invert the verb and pronoun ("avez-vous") after question words like "Pourquoi" (why) for clear, natural questions.',
          tokens: [
            { surface: '« Pourquoi', reading: null, baseForm: 'pourquoi', contextualMeaning: 'why' },
            { surface: 'avez-vous', reading: null, baseForm: 'avoir', contextualMeaning: 'did you' },
            { surface: 'caché', reading: null, baseForm: 'cacher', contextualMeaning: 'hide' },
            { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'clé', reading: null, baseForm: 'clé', contextualMeaning: 'key' },
            { surface: 'au', reading: null, baseForm: 'au', contextualMeaning: 'at the' },
            { surface: 'Café', reading: null, baseForm: 'café', contextualMeaning: 'Café' },
            { surface: 'Rouge ? »', reading: null, baseForm: 'rouge', contextualMeaning: 'Red' },
            { surface: 'demande', reading: null, baseForm: 'demander', contextualMeaning: 'asks' },
            { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
            { surface: 'avec', reading: null, baseForm: 'avec', contextualMeaning: 'with' },
            { surface: 'surprise.', reading: null, baseForm: 'surprise', contextualMeaning: 'surprise' },
          ],
        },
      ],
    },
  ],
  it: [
    {
      title: 'Il Concerto Segreto in Piazza (The Secret Concert in the Square)',
      summary: 'Marco and Sofia join Maestro Bellini at an outdoor café in Bologna, where a mysterious countess offers a reward to hear the golden violin.',
      recycled: ['mercato', 'treno', 'pagina', 'violino'],
      sentences: [
        {
          fullSentence: 'Dopo l’avventura sul treno, Marco e Sofia bevono un espresso in piazza con il Maestro Bellini.',
          englishTranslation: 'After the adventure on the train, Marco and Sofia drink an espresso in the square with Maestro Bellini.',
          romanisation: null,
          grammarNote: 'Plural "-ere" verbs like "bere" (to drink) end in "-ono" ("bevono" = they drink) in the present tense.',
          tokens: [
            { surface: 'Dopo', reading: null, baseForm: 'dopo', contextualMeaning: 'after' },
            { surface: 'l’avventura', reading: null, baseForm: 'avventura', contextualMeaning: 'the adventure' },
            { surface: 'sul', reading: null, baseForm: 'sul', contextualMeaning: 'on the' },
            { surface: 'treno,', reading: null, baseForm: 'treno', contextualMeaning: 'train' },
            { surface: 'Marco', reading: null, baseForm: 'Marco', contextualMeaning: 'Marco' },
            { surface: 'e', reading: null, baseForm: 'e', contextualMeaning: 'and' },
            { surface: 'Sofia', reading: null, baseForm: 'Sofia', contextualMeaning: 'Sofia' },
            { surface: 'bevono', reading: null, baseForm: 'bere', contextualMeaning: 'drink' },
            { surface: 'un', reading: null, baseForm: 'un', contextualMeaning: 'an' },
            { surface: 'espresso', reading: null, baseForm: 'espresso', contextualMeaning: 'espresso' },
            { surface: 'in', reading: null, baseForm: 'in', contextualMeaning: 'in' },
            { surface: 'piazza', reading: null, baseForm: 'piazza', contextualMeaning: 'the square' },
            { surface: 'con', reading: null, baseForm: 'con', contextualMeaning: 'with' },
            { surface: 'il', reading: null, baseForm: 'il', contextualMeaning: 'the' },
            { surface: 'Maestro', reading: null, baseForm: 'maestro', contextualMeaning: 'Maestro' },
            { surface: 'Bellini.', reading: null, baseForm: 'Bellini', contextualMeaning: 'Bellini' },
          ],
        },
        {
          fullSentence: '« Guardate l’ultima pagina del libro! C’è un invito per il teatro di Venezia! » dice Sofia.',
          englishTranslation: '"Look at the last page of the book! There is an invitation for the theatre in Venice!" says Sofia.',
          romanisation: null,
          grammarNote: '"Guardate" is the plural command form ("Look!") used when speaking to two or more friends.',
          tokens: [
            { surface: '« Guardate', reading: null, baseForm: 'guardare', contextualMeaning: 'look at!' },
            { surface: 'l’ultima', reading: null, baseForm: 'ultimo', contextualMeaning: 'the last' },
            { surface: 'pagina', reading: null, baseForm: 'pagina', contextualMeaning: 'page' },
            { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'of the' },
            { surface: 'libro!', reading: null, baseForm: 'libro', contextualMeaning: 'book' },
            { surface: 'C’è', reading: null, baseForm: 'esserci', contextualMeaning: 'there is' },
            { surface: 'un', reading: null, baseForm: 'un', contextualMeaning: 'an' },
            { surface: 'invito', reading: null, baseForm: 'invito', contextualMeaning: 'invitation' },
            { surface: 'per', reading: null, baseForm: 'per', contextualMeaning: 'for' },
            { surface: 'il', reading: null, baseForm: 'il', contextualMeaning: 'the' },
            { surface: 'teatro', reading: null, baseForm: 'teatro', contextualMeaning: 'theatre' },
            { surface: 'di', reading: null, baseForm: 'di', contextualMeaning: 'of' },
            { surface: 'Venezia! »', reading: null, baseForm: 'Venezia', contextualMeaning: 'Venice!' },
            { surface: 'dice', reading: null, baseForm: 'dire', contextualMeaning: 'says' },
            { surface: 'Sofia.', reading: null, baseForm: 'Sofia', contextualMeaning: 'Sofia' },
          ],
        },
        {
          fullSentence: 'Il Maestro sorride e risponde: « Allora prepariamo le valigie: stasera suoniamo insieme a Venezia! »',
          englishTranslation: 'The Maestro smiles and replies: "Then let’s pack our suitcases: tonight we play together in Venice!"',
          romanisation: null,
          grammarNote: 'First-person plural "-iamo" verbs ("prepariamo", "suoniamo") mean both "we prepare/play" and "let’s prepare/play!".',
          tokens: [
            { surface: 'Il', reading: null, baseForm: 'il', contextualMeaning: 'the' },
            { surface: 'Maestro', reading: null, baseForm: 'maestro', contextualMeaning: 'Maestro' },
            { surface: 'sorride', reading: null, baseForm: 'sorridere', contextualMeaning: 'smiles' },
            { surface: 'e', reading: null, baseForm: 'e', contextualMeaning: 'and' },
            { surface: 'risponde:', reading: null, baseForm: 'rispondere', contextualMeaning: 'replies' },
            { surface: '« Allora', reading: null, baseForm: 'allora', contextualMeaning: 'then / well then' },
            { surface: 'prepariamo', reading: null, baseForm: 'preparare', contextualMeaning: 'let’s prepare / pack' },
            { surface: 'le', reading: null, baseForm: 'la', contextualMeaning: 'the' },
            { surface: 'valigie:', reading: null, baseForm: 'valigia', contextualMeaning: 'suitcases' },
            { surface: 'stasera', reading: null, baseForm: 'stasera', contextualMeaning: 'tonight' },
            { surface: 'suoniamo', reading: null, baseForm: 'suonare', contextualMeaning: 'we play' },
            { surface: 'insieme', reading: null, baseForm: 'insieme', contextualMeaning: 'together' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'in' },
            { surface: 'Venezia! »', reading: null, baseForm: 'Venezia', contextualMeaning: 'Venice!' },
          ],
        },
      ],
    },
  ],
  ja: [
    {
      title: '月夜の茶屋の暗号 (The Code at the Moonlit Teahouse)',
      summary: 'After escaping the shrine steps, Haruka and Ren meet Master Tachibana at a lantern-lit teahouse in Gion to unlock the second secret of the silver watch.',
      recycled: ['時計', '静か', '不思議'],
      sentences: [
        {
          fullSentence: '夜になり、遥と蓮は静かな祇園の茶屋で時計屋の主人、橘さんに会いました。',
          englishTranslation: 'When night fell, Haruka and Ren met Master Tachibana, the owner of the clock shop, at a quiet teahouse in Gion.',
          romanisation: 'Yoru ni nari, Haruka to Ren wa shizuka na Gion no chaya de tokeiya no shujin, Tachibana-san ni aimashita.',
          grammarNote: 'Use "に会いました" ("Tachibana-san ni aimashita") to mark the person you meet with the particle "に".',
          tokens: [
            { surface: '夜', reading: 'よる', baseForm: '夜', contextualMeaning: 'night' },
            { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'into' },
            { surface: 'なり、', reading: null, baseForm: 'なる', contextualMeaning: 'becoming' },
            { surface: '遥', reading: 'はるか', baseForm: '遥', contextualMeaning: 'Haruka' },
            { surface: 'と', reading: null, baseForm: 'と', contextualMeaning: 'and' },
            { surface: '蓮', reading: 'れん', baseForm: '蓮', contextualMeaning: 'Ren' },
            { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
            { surface: '静かな', reading: 'しずかな', baseForm: '静か', contextualMeaning: 'quiet' },
            { surface: '祇園', reading: 'ぎおん', baseForm: '祇園', contextualMeaning: 'Gion' },
            { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: 'of' },
            { surface: '茶屋', reading: 'ちゃや', baseForm: '茶屋', contextualMeaning: 'teahouse' },
            { surface: 'で', reading: null, baseForm: 'で', contextualMeaning: 'at' },
            { surface: '時計屋', reading: 'とけいや', baseForm: '時計屋', contextualMeaning: 'clock shop' },
            { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: '’s' },
            { surface: '主人、', reading: 'しゅじん', baseForm: '主人', contextualMeaning: 'owner / master' },
            { surface: '橘さん', reading: 'たちばなさん', baseForm: '橘', contextualMeaning: 'Mr. Tachibana' },
            { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'with / to' },
            { surface: '会いました。', reading: 'あいました', baseForm: '会う', contextualMeaning: 'met' },
          ],
        },
        {
          fullSentence: '橘さんは温かいお茶を出しながら、「よくその不思議な時計を守ってくれましたね！」と言いました。',
          englishTranslation: 'While serving warm tea, Mr. Tachibana said: "You did well protecting that mysterious watch for me!"',
          romanisation: 'Tachibana-san wa atatakai ocha wo dashinagara, “Yoku sono fushigi na tokei wo mamotte kuremashita ne!” to iimashita.',
          grammarNote: '"守ってくれました" ("protected for me") uses "-てくれる" to show gratitude for someone’s helpful action.',
          tokens: [
            { surface: '橘さん', reading: 'たちばなさん', baseForm: '橘', contextualMeaning: 'Mr. Tachibana' },
            { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
            { surface: '温かい', reading: 'あたたかい', baseForm: '温かい', contextualMeaning: 'warm' },
            { surface: 'お茶', reading: 'おちゃ', baseForm: 'お茶', contextualMeaning: 'green tea' },
            { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
            { surface: '出しながら、', reading: 'だしながら', baseForm: '出す', contextualMeaning: 'while serving' },
            { surface: '「よく', reading: null, baseForm: 'よく', contextualMeaning: 'well / bravely' },
            { surface: 'その', reading: null, baseForm: 'その', contextualMeaning: 'that' },
            { surface: '不思議な', reading: 'ふしぎな', baseForm: '不思議', contextualMeaning: 'mysterious' },
            { surface: '時計', reading: 'とけい', baseForm: '時計', contextualMeaning: 'watch' },
            { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
            { surface: '守って', reading: 'まもって', baseForm: '守る', contextualMeaning: 'protecting' },
            { surface: 'くれましたね！」', reading: null, baseForm: 'くれる', contextualMeaning: 'did for me!' },
            { surface: 'と', reading: null, baseForm: 'と', contextualMeaning: '(quote)' },
            { surface: '言いました。', reading: 'いいました', baseForm: '言う', contextualMeaning: 'said' },
          ],
        },
      ],
    },
  ],
  es: [
    {
      title: 'La Isla Detrás de la Niebla (The Island Behind the Fog)',
      summary: 'At dawn, Elena, Mateo, and Capitán Vega sail past the cliffs and spot stone ruins emerging from the mist.',
      recycled: ['niebla', 'acantilado', 'destello'],
      sentences: [
        {
          fullSentence: 'Al amanecer, el barco de Mateo dejó atrás el acantilado mientras la niebla se abría lentamente sobre el océano.',
          englishTranslation: 'At dawn, Mateo’s boat left the cliff behind while the fog slowly parted over the ocean.',
          romanisation: null,
          grammarNote: '"Dejó atrás" (left behind) in the preterite contrasts with "se abría" (was opening) in the imperfect.',
          tokens: [
            { surface: 'Al', reading: null, baseForm: 'al', contextualMeaning: 'at' },
            { surface: 'amanecer,', reading: null, baseForm: 'amanecer', contextualMeaning: 'dawn' },
            { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'barco', reading: null, baseForm: 'barco', contextualMeaning: 'boat' },
            { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
            { surface: 'Mateo', reading: null, baseForm: 'Mateo', contextualMeaning: 'Mateo' },
            { surface: 'dejó', reading: null, baseForm: 'dejar', contextualMeaning: 'left' },
            { surface: 'atrás', reading: null, baseForm: 'atrás', contextualMeaning: 'behind' },
            { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'acantilado', reading: null, baseForm: 'acantilado', contextualMeaning: 'cliff' },
            { surface: 'mientras', reading: null, baseForm: 'mientras', contextualMeaning: 'while' },
            { surface: 'la', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'niebla', reading: null, baseForm: 'niebla', contextualMeaning: 'fog' },
            { surface: 'se', reading: null, baseForm: 'se', contextualMeaning: '(reflexive)' },
            { surface: 'abría', reading: null, baseForm: 'abrirse', contextualMeaning: 'was parting / opening' },
            { surface: 'lentamente', reading: null, baseForm: 'lentamente', contextualMeaning: 'slowly' },
            { surface: 'sobre', reading: null, baseForm: 'sobre', contextualMeaning: 'over' },
            { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'océano.', reading: null, baseForm: 'océano', contextualMeaning: 'ocean' },
          ],
        },
        {
          fullSentence: '« ¡Mirad hacia el norte! ¡Ese destello dorado viene de un puerto antiguo en la isla! » gritó Elena desde la proa.',
          englishTranslation: '"Look toward the north! That golden flash is coming from an ancient harbour on the island!" shouted Elena from the bow.',
          romanisation: null,
          grammarNote: '"¡Mirad!" is the plural imperative form used in Spain ("vosotros") to say "Look!".',
          tokens: [
            { surface: '« ¡Mirad', reading: null, baseForm: 'mirar', contextualMeaning: 'look!' },
            { surface: 'hacia', reading: null, baseForm: 'hacia', contextualMeaning: 'toward' },
            { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'norte!', reading: null, baseForm: 'norte', contextualMeaning: 'north' },
            { surface: '¡Ese', reading: null, baseForm: 'ese', contextualMeaning: 'that' },
            { surface: 'destello', reading: null, baseForm: 'destello', contextualMeaning: 'flash' },
            { surface: 'dorado', reading: null, baseForm: 'dorado', contextualMeaning: 'golden' },
            { surface: 'viene', reading: null, baseForm: 'venir', contextualMeaning: 'comes' },
            { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'from' },
            { surface: 'un', reading: null, baseForm: 'uno', contextualMeaning: 'an' },
            { surface: 'puerto', reading: null, baseForm: 'puerto', contextualMeaning: 'harbour' },
            { surface: 'antiguo', reading: null, baseForm: 'antiguo', contextualMeaning: 'ancient' },
            { surface: 'en', reading: null, baseForm: 'en', contextualMeaning: 'on' },
            { surface: 'la', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'isla! »', reading: null, baseForm: 'isla', contextualMeaning: 'island!' },
            { surface: 'gritó', reading: null, baseForm: 'gritar', contextualMeaning: 'shouted' },
            { surface: 'Elena', reading: null, baseForm: 'Elena', contextualMeaning: 'Elena' },
            { surface: 'desde', reading: null, baseForm: 'desde', contextualMeaning: 'from' },
            { surface: 'la', reading: null, baseForm: 'el', contextualMeaning: 'the' },
            { surface: 'proa.', reading: null, baseForm: 'proa', contextualMeaning: 'bow (of the ship)' },
          ],
        },
      ],
    },
  ],
};

let offlineRegenerateCounter = 0;

/**
 * Generates an instant pre-tokenised chapter from the local bonus scene bank or variation engine
 * when no Gemini API key is configured yet.
 */
export function generateOfflineBonusChapter(
  profile,
  adjustment = 'regenerate',
  targetChapterNumber = null,
  currentChapter = null
) {
  const chapterNum =
    targetChapterNumber || (profile.chapters?.length || 0) + 1;
  const langBank = BONUS_SCENE_BANK[profile.id] || [];
  const baseChapters = profile.chapters || [];

  offlineRegenerateCounter += 1;

  if (langBank.length > 0) {
    let pickedIdx = offlineRegenerateCounter % langBank.length;
    let pickedScene = langBank[pickedIdx];
    if (
      langBank.length > 1 &&
      currentChapter?.chapterTitle &&
      currentChapter.chapterTitle.includes(pickedScene.title)
    ) {
      pickedIdx = (offlineRegenerateCounter + 1) % langBank.length;
      pickedScene = langBank[pickedIdx];
    }

    return {
      id: `${profile.id}-ch-${chapterNum}-${Date.now()}`,
      preRenderedAudioId: `${profile.id}-bonus-${pickedIdx}`,
      chapterNumber: chapterNum,
      difficultyLabel: `${profile.cefrLevel} • Fresh Story & Vocabulary`,
      chapterTitle: `Chapter ${chapterNum} : ${pickedScene.title}`,
      updatedArcSummary: pickedScene.summary,
      recycledWordsUsed: pickedScene.recycled,
      sentences: structuredClone(pickedScene.sentences),
    };
  }

  // Fallback alternate story from other chapters if offline without Gemini key
  const otherChapters = baseChapters.filter((c) => c.id !== currentChapter?.id);
  const pool = otherChapters.length > 0 ? otherChapters : baseChapters;
  const sourceChapter = pool[offlineRegenerateCounter % pool.length];
  const rawTitle = (sourceChapter.chapterTitle || '').replace(
    /^(Chapter|Chapitre|Capitolo|Capítulo|제\d+장|第\d+章|บทที่\s*\d+)\s*\d*\s*[:：]?\s*/i,
    ''
  );

  return {
    ...structuredClone(sourceChapter),
    id: `${profile.id}-ch-${chapterNum}-${Date.now()}`,
    preRenderedAudioId: sourceChapter.preRenderedAudioId || sourceChapter.id,
    chapterNumber: chapterNum,
    difficultyLabel: `${profile.cefrLevel} • Fresh Story & Vocabulary`,
    chapterTitle: `Chapter ${chapterNum} : ${rawTitle}`,
  };
}

/**
 * Generates the next sequential chapter (or regenerates the current chapter with fresh text & vocabulary)
 * using Gemini 2.5 Flash with pre-tokenised JSON output.
 */
export async function generateNextChapter({
  profile,
  adjustment = 'maintain',
  apiKey,
  targetChapterNumber = null,
  currentChapter = null,
}) {
  const nextChapterNumber =
    targetChapterNumber || (profile.chapters?.length || 0) + 1;

  // If user has no Gemini key yet, provide an instant pre-tokenised chapter for this chapter number
  if (!apiKey || !apiKey.trim()) {
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
  }

  const targetLearningWords = getPriorityLearningWords(profile.vocabBank, 5);
  const diffConfig =
    DIFFICULTY_INSTRUCTIONS[adjustment] || DIFFICULTY_INSTRUCTIONS.maintain;

  const targetWordsPromptBlock =
    targetLearningWords.length > 0
      ? `TARGET LEARNING WORDS TO NATURALLY RECYCLE IN THIS CHAPTER (up to 5 words with lowest exposures):
${targetLearningWords
  .map(
    (w, i) =>
      `${i + 1}. baseForm: "${w.baseForm}" (surface seen: "${w.word}", meaning: "${w.contextualMeaning}", exposures: ${w.exposures}/5)`
  )
  .join('\n')}
You MUST naturally weave as many of these target words as fit the plot into the new chapter in fresh, meaningful contexts, and list the baseForms you used in "recycledWordsUsed". Also introduce 3 to 4 useful new words in context.`
      : `Introduce 4 to 5 high-utility new words appropriate for ${profile.cefrLevel} and list their baseForms in "recycledWordsUsed".`;

  const scriptSpecificRules =
    profile.id === 'ja'
      ? `JAPANESE CJK & FURIGANA RULES (CRITICAL):
- Never rely on space-separated tokens. Split every sentence into natural morphological word/particle tokens so concatenating "surface" across all tokens reconstructs the exact Japanese sentence.
- Attach Japanese punctuation (、 or 。 or 「」) to the end of the preceding token's "surface".
- For "reading": provide the exact Hiragana reading ONLY if the token's "surface" contains at least one Kanji character (e.g. surface: "時計", reading: "とけい"). If a token is pure Hiragana or Katakana, "reading" MUST be null.
- For "romanisation": provide accurate Hepburn Romaji for the full sentence.`

      : `LATIN SCRIPT (${profile.name.toUpperCase()}) RULES (CRITICAL):
- Split each sentence into individual clickable word tokens (keeping trailing punctuation like commas or periods attached to the word's "surface", while keeping "baseForm" clean without punctuation).
- "reading" MUST be null for all tokens.
- "romanisation" MUST be null for all sentences.`;

  const systemPrompt = `You are a bestselling fiction author and master graded-reader creator trained in Stephen Krashen's Comprehensible Input (i+1) hypothesis and Olly Richards' StoryLearning method.

Write Chapter ${nextChapterNumber} of the ongoing serial story "${profile.storyTitle}" in ${profile.name} (${profile.nativeName}), strictly calibrated for ${profile.cefrLevel}.

CONTINUOUS PLOT CONTEXT (storyArcSummary so far):
"${profile.storyArcSummary}"

FICTION & DIALOGUE QUALITY REQUIREMENTS (MANDATORY):
- This MUST be a genuinely engaging, page-turning fiction story that people actually love reading—NEVER a dry textbook exercise or disconnected phrase list!
- Include vivid named characters who interact with personality, emotion, curiosity, or suspense.
- Include natural spoken dialogue in at least 2 to 3 sentences of the chapter (using appropriate quotation marks for the language, e.g. « ... », “...”, or 「...」).
- End the chapter with a compelling narrative discovery, twist, or hook that makes the reader eager for the next chapter, while keeping vocabulary and grammar 100% appropriate for ${profile.cefrLevel}.

ADAPTIVE DIFFICULTY DIRECTIVE (${diffConfig.label}):
${diffConfig.promptDirective}

${targetWordsPromptBlock}

${scriptSpecificRules}

ENGLISH TRANSLATION & GRAMMAR NOTE RULES:
- Every sentence MUST include "englishTranslation" with a clear, natural English translation of the full sentence.
- Every sentence MUST include a "grammarNote" consisting of a single, plain-English sentence explaining the core recurring sentence pattern used in that sentence, avoiding dense academic jargon.

CHAPTER LENGTH:
- Write 8 to 9 cohesive, character-and-dialogue-driven sentences with fresh, practical vocabulary that advance the plot naturally.`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_CHAPTER_RESPONSE_SCHEMA,
        temperature: 0.75,
      },
    }),
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson?.error?.message || errorDetail;
    } catch {
      // ignore json parse failure
    }
    throw new Error(`Gemini API Error: ${errorDetail}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  let parsedChapter;
  try {
    parsedChapter = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON output: ${err.message}`);
  }

  if (!Array.isArray(parsedChapter.sentences) || parsedChapter.sentences.length === 0) {
    throw new Error('Generated chapter did not contain valid pre-tokenised sentences.');
  }

  return {
    id: `${profile.id}-ch-${nextChapterNumber}-${Date.now()}`,
    chapterNumber: nextChapterNumber,
    difficultyLabel: `${profile.cefrLevel} • ${diffConfig.label}`,
    chapterTitle: parsedChapter.chapterTitle || `Chapter ${nextChapterNumber}`,
    updatedArcSummary: parsedChapter.updatedArcSummary || profile.storyArcSummary,
    recycledWordsUsed: Array.isArray(parsedChapter.recycledWordsUsed)
      ? parsedChapter.recycledWordsUsed
      : [],
    sentences: parsedChapter.sentences.map((s) => ({
      fullSentence: s.fullSentence || '',
      englishTranslation: s.englishTranslation || '',
      romanisation: profile.isCJK ? s.romanisation || null : null,
      grammarNote: s.grammarNote || 'Notice how the words group together to express a complete thought.',
      tokens: (s.tokens || []).map((t) => ({
        surface: t.surface || '',
        reading: profile.hasFurigana ? t.reading || null : null,
        baseForm: t.baseForm || t.surface || '',
        contextualMeaning: t.contextualMeaning || '',
      })),
    })),
  };
}

/**
 * Richer, slightly more complex extension sentences for each language so the "Too Easy" (Challenge)
 * version of a chapter is visibly longer and linguistically deeper even without a Gemini API key.
 */
const CHALLENGE_EXTENSION_BANK = {
  fr: [
    {
      fullSentence: 'Bien que l’atmosphère semble paisible, chaque détail de cet endroit cache une histoire ancienne qu’elle souhaite comprendre.',
      englishTranslation: 'Although the atmosphere seems peaceful, every detail of this place hides an ancient story that she wishes to understand.',
      romanisation: null,
      grammarNote: '"Bien que" ("although") introduces a concession clause and is followed by the subjunctive mood ("semble").',
      tokens: [
        { surface: 'Bien', reading: null, baseForm: 'bien que', contextualMeaning: 'although (part 1)' },
        { surface: 'que', reading: null, baseForm: 'bien que', contextualMeaning: 'although (part 2)' },
        { surface: 'l’atmosphère', reading: null, baseForm: 'atmosphère', contextualMeaning: 'the atmosphere' },
        { surface: 'semble', reading: null, baseForm: 'sembler', contextualMeaning: 'seems' },
        { surface: 'paisible,', reading: null, baseForm: 'paisible', contextualMeaning: 'peaceful' },
        { surface: 'chaque', reading: null, baseForm: 'chaque', contextualMeaning: 'each / every' },
        { surface: 'détail', reading: null, baseForm: 'détail', contextualMeaning: 'detail' },
        { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
        { surface: 'cet', reading: null, baseForm: 'ce', contextualMeaning: 'this' },
        { surface: 'endroit', reading: null, baseForm: 'endroit', contextualMeaning: 'place' },
        { surface: 'cache', reading: null, baseForm: 'cacher', contextualMeaning: 'hides' },
        { surface: 'une', reading: null, baseForm: 'un', contextualMeaning: 'an' },
        { surface: 'histoire', reading: null, baseForm: 'histoire', contextualMeaning: 'story / history' },
        { surface: 'ancienne', reading: null, baseForm: 'ancien', contextualMeaning: 'ancient / old' },
        { surface: 'qu’elle', reading: null, baseForm: 'que + elle', contextualMeaning: 'that she' },
        { surface: 'souhaite', reading: null, baseForm: 'souhaiter', contextualMeaning: 'wishes / hopes' },
        { surface: 'comprendre.', reading: null, baseForm: 'comprendre', contextualMeaning: 'to understand' },
      ],
    },
    {
      fullSentence: 'Sans hésiter davantage, elle note soigneusement ces indices dans son carnet avant de poursuivre ses recherches.',
      englishTranslation: 'Without hesitating any further, she carefully writes down these clues in her notebook before continuing her search.',
      romanisation: null,
      grammarNote: 'Prepositions like "sans" ("without") and "avant de" ("before") are followed directly by the infinitive verb ("hésiter", "poursuivre").',
      tokens: [
        { surface: 'Sans', reading: null, baseForm: 'sans', contextualMeaning: 'without' },
        { surface: 'hésiter', reading: null, baseForm: 'hésiter', contextualMeaning: 'hesitating' },
        { surface: 'davantage,', reading: null, baseForm: 'davantage', contextualMeaning: 'further / more' },
        { surface: 'elle', reading: null, baseForm: 'elle', contextualMeaning: 'she' },
        { surface: 'note', reading: null, baseForm: 'noter', contextualMeaning: 'notes / writes down' },
        { surface: 'soigneusement', reading: null, baseForm: 'soigneusement', contextualMeaning: 'carefully' },
        { surface: 'ces', reading: null, baseForm: 'ce', contextualMeaning: 'these' },
        { surface: 'indices', reading: null, baseForm: 'indice', contextualMeaning: 'clues' },
        { surface: 'dans', reading: null, baseForm: 'dans', contextualMeaning: 'in' },
        { surface: 'son', reading: null, baseForm: 'son', contextualMeaning: 'her' },
        { surface: 'carnet', reading: null, baseForm: 'carnet', contextualMeaning: 'notebook' },
        { surface: 'avant', reading: null, baseForm: 'avant de', contextualMeaning: 'before' },
        { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of / to' },
        { surface: 'poursuivre', reading: null, baseForm: 'poursuivre', contextualMeaning: 'continuing / pursuing' },
        { surface: 'ses', reading: null, baseForm: 'son', contextualMeaning: 'her' },
        { surface: 'recherches.', reading: null, baseForm: 'recherche', contextualMeaning: 'research / search' },
      ],
    },
  ],
  it: [
    {
      fullSentence: 'Mentre osserva attentamente i passanti, Marco si rende conto che quel pomeriggio nasconde una sorpresa inaspettata.',
      englishTranslation: 'While he carefully observes the passersby, Marco realises that that afternoon hides an unexpected surprise.',
      romanisation: null,
      grammarNote: '"Rendersi conto che" ("to realise that") is a high-frequency reflexive idiom used to express sudden realisation.',
      tokens: [
        { surface: 'Mentre', reading: null, baseForm: 'mentre', contextualMeaning: 'while' },
        { surface: 'osserva', reading: null, baseForm: 'osservare', contextualMeaning: 'observes' },
        { surface: 'attentamente', reading: null, baseForm: 'attentamente', contextualMeaning: 'carefully' },
        { surface: 'i', reading: null, baseForm: 'il', contextualMeaning: 'the (plural)' },
        { surface: 'passanti,', reading: null, baseForm: 'passante', contextualMeaning: 'passersby' },
        { surface: 'Marco', reading: null, baseForm: 'Marco', contextualMeaning: 'Marco' },
        { surface: 'si', reading: null, baseForm: 'si', contextualMeaning: 'himself (reflexive)' },
        { surface: 'rende', reading: null, baseForm: 'rendere', contextualMeaning: 'makes / realises' },
        { surface: 'conto', reading: null, baseForm: 'conto', contextualMeaning: 'awareness' },
        { surface: 'che', reading: null, baseForm: 'che', contextualMeaning: 'that' },
        { surface: 'quel', reading: null, baseForm: 'quello', contextualMeaning: 'that' },
        { surface: 'pomeriggio', reading: null, baseForm: 'pomeriggio', contextualMeaning: 'afternoon' },
        { surface: 'nasconde', reading: null, baseForm: 'nascondere', contextualMeaning: 'hides' },
        { surface: 'una', reading: null, baseForm: 'una', contextualMeaning: 'an' },
        { surface: 'sorpresa', reading: null, baseForm: 'sorpresa', contextualMeaning: 'surprise' },
        { surface: 'inaspettata.', reading: null, baseForm: 'inaspettato', contextualMeaning: 'unexpected' },
      ],
    },
    {
      fullSentence: 'Pertanto decide di approfondire la questione parlando direttamente con le persone del posto.',
      englishTranslation: 'Therefore, he decides to look deeper into the matter by speaking directly with the locals.',
      romanisation: null,
      grammarNote: 'The gerund "parlando" ("by speaking") expresses the means or manner by which an action is carried out.',
      tokens: [
        { surface: 'Pertanto', reading: null, baseForm: 'pertanto', contextualMeaning: 'therefore' },
        { surface: 'decide', reading: null, baseForm: 'decidere', contextualMeaning: 'he decides' },
        { surface: 'di', reading: null, baseForm: 'di', contextualMeaning: 'to' },
        { surface: 'approfondire', reading: null, baseForm: 'approfondire', contextualMeaning: 'deepen / investigate' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'questione', reading: null, baseForm: 'questione', contextualMeaning: 'matter / question' },
        { surface: 'parlando', reading: null, baseForm: 'parlare', contextualMeaning: 'by speaking' },
        { surface: 'direttamente', reading: null, baseForm: 'direttamente', contextualMeaning: 'directly' },
        { surface: 'con', reading: null, baseForm: 'con', contextualMeaning: 'with' },
        { surface: 'le', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'persone', reading: null, baseForm: 'persona', contextualMeaning: 'people' },
        { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'of the' },
        { surface: 'posto.', reading: null, baseForm: 'posto', contextualMeaning: 'local place' },
      ],
    },
  ],
  ja: [
    {
      fullSentence: '不思議に思いながらも、健太はその古い手掛かりが新しい発見につながると確信していました。',
      englishTranslation: 'While thinking it was mysterious, Kenta was convinced that that old clue would lead to a new discovery.',
      romanisation: 'Fushigi ni omoinagara mo, Kenta wa sono furui tegakari ga atarashii hakken ni tsunagaru to kakushin shite imashita.',
      grammarNote: '「〜ながらも」 ("while / although") expresses two simultaneous contrasting feelings or actions.',
      tokens: [
        { surface: '不思議', reading: 'ふしぎ', baseForm: '不思議', contextualMeaning: 'mysterious / strange' },
        { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'as (adverbial)' },
        { surface: '思いながらも、', reading: 'おもいながらも、', baseForm: '思う', contextualMeaning: 'while thinking / feeling,' },
        { surface: '健太', reading: 'けんた', baseForm: '健太', contextualMeaning: 'Kenta' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: 'その', reading: null, baseForm: 'その', contextualMeaning: 'that' },
        { surface: '古い', reading: 'ふるい', baseForm: '古い', contextualMeaning: 'old' },
        { surface: '手掛かり', reading: 'てがかり', baseForm: '手掛かり', contextualMeaning: 'clue' },
        { surface: 'が', reading: null, baseForm: 'が', contextualMeaning: '(subject)' },
        { surface: '新しい', reading: 'あたらしい', baseForm: '新しい', contextualMeaning: 'new' },
        { surface: '発見', reading: 'はっけん', baseForm: '発見', contextualMeaning: 'discovery' },
        { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'to' },
        { surface: 'つながる', reading: null, baseForm: 'つながる', contextualMeaning: 'leads / connects' },
        { surface: 'と', reading: null, baseForm: 'と', contextualMeaning: 'that (quotation)' },
        { surface: '確信して', reading: 'かくしんして', baseForm: '確信する', contextualMeaning: 'being convinced' },
        { surface: 'いました。', reading: null, baseForm: 'いる', contextualMeaning: 'was' },
      ],
    },
  ],
  es: [
    {
      fullSentence: 'A medida que avanzaba la tarde, Elena comprendió que cada conversación revelaba una pieza fundamental del misterio.',
      englishTranslation: 'As the afternoon progressed, Elena understood that every conversation revealed a fundamental piece of the mystery.',
      romanisation: null,
      grammarNote: '"A medida que" ("as / to the extent that") describes two actions developing in parallel over time.',
      tokens: [
        { surface: 'A', reading: null, baseForm: 'a medida que', contextualMeaning: 'as (part 1)' },
        { surface: 'medida', reading: null, baseForm: 'medida', contextualMeaning: 'measure / extent' },
        { surface: 'que', reading: null, baseForm: 'que', contextualMeaning: 'that' },
        { surface: 'avanzaba', reading: null, baseForm: 'avanzar', contextualMeaning: 'progressed / advanced' },
        { surface: 'la', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'tarde,', reading: null, baseForm: 'tarde', contextualMeaning: 'afternoon' },
        { surface: 'Elena', reading: null, baseForm: 'Elena', contextualMeaning: 'Elena' },
        { surface: 'comprendió', reading: null, baseForm: 'comprender', contextualMeaning: 'understood' },
        { surface: 'que', reading: null, baseForm: 'que', contextualMeaning: 'that' },
        { surface: 'cada', reading: null, baseForm: 'cada', contextualMeaning: 'each / every' },
        { surface: 'conversación', reading: null, baseForm: 'conversación', contextualMeaning: 'conversation' },
        { surface: 'revelaba', reading: null, baseForm: 'revelar', contextualMeaning: 'revealed' },
        { surface: 'una', reading: null, baseForm: 'un', contextualMeaning: 'a' },
        { surface: 'pieza', reading: null, baseForm: 'pieza', contextualMeaning: 'piece' },
        { surface: 'fundamental', reading: null, baseForm: 'fundamental', contextualMeaning: 'fundamental / key' },
        { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'of the' },
        { surface: 'misterio.', reading: null, baseForm: 'misterio', contextualMeaning: 'mystery' },
      ],
    },
  ],
};

/**
 * Creates a simplified (shorter, easier) or challenged (longer, more complex) version
 * of `baseChapter` offline when no Gemini API key is configured.
 */
export function createOfflineDifficultyVariant(baseChapter, level, profile) {
  const cleanBase = structuredClone(baseChapter);
  const baseId = (cleanBase.id || `${profile.id}-ch-${cleanBase.chapterNumber}`).replace(
    /__(simplify|maintain|challenge)$/,
    ''
  );

  if (level === 'maintain') {
    return {
      ...cleanBase,
      id: `${baseId}__maintain`,
      activeDifficulty: 'maintain',
      difficultyLabel: `${profile.cefrLevel} • Just Right (Standard)`,
    };
  }

  if (level === 'simplify') {
    // Simplify: keep 6 essential sentences (first 5 + closing sentence) so even simplified chapters are a substantial, engaging read
    const all = cleanBase.sentences || [];
    const coreSentences =
      all.length > 6
        ? [...all.slice(0, 5), all[all.length - 1]]
        : all.slice(0, Math.max(4, all.length));
    return {
      ...cleanBase,
      id: `${baseId}__simplify`,
      activeDifficulty: 'simplify',
      difficultyLabel: `${profile.cefrLevel} • Simplified (Shorter & Easier)`,
      sentences: coreSentences,
    };
  }

  // level === 'challenge': Keep all original sentences AND weave in longer, more complex extension sentences
  const extras = CHALLENGE_EXTENSION_BANK[profile.id] || CHALLENGE_EXTENSION_BANK.fr;
  return {
    ...cleanBase,
    id: `${baseId}__challenge`,
    activeDifficulty: 'challenge',
    difficultyLabel: `${profile.cefrLevel} • More Complex (Longer & Richer)`,
    sentences: [...cleanBase.sentences, ...structuredClone(extras)],
  };
}

/**
 * Generates or adapts a specific difficulty version ('simplify' | 'maintain' | 'challenge')
 * of the CURRENT chapter (`baseChapter`) so the user can switch back and forth between
 * difficulty levels within the exact same chapter!
 */
export async function generateChapterDifficultyVariant({
  profile,
  baseChapter,
  level = 'maintain',
  apiKey,
}) {
  if (level === 'maintain') {
    return createOfflineDifficultyVariant(baseChapter, 'maintain', profile);
  }

  if (!apiKey || !apiKey.trim()) {
    return createOfflineDifficultyVariant(baseChapter, level, profile);
  }

  const baseId = (baseChapter.id || `${profile.id}-ch-${baseChapter.chapterNumber}`).replace(
    /__(simplify|maintain|challenge)$/,
    ''
  );

  const originalSentencesText = (baseChapter.sentences || [])
    .map((s, i) => `${i + 1}. ${s.fullSentence} (${s.englishTranslation || ''})`)
    .join('\n');

  const rewriteDirective =
    level === 'simplify'
      ? `TASK — SIMPLIFY THIS CHAPTER ("Too Hard" -> Simpler Version):
Rewrite the exact fiction story of this chapter into a SIMPLER, EASIER-TO-READ version (6 clear, engaging sentences).
- Keep the exact same named characters, setting, plot events, and spoken dialogue as the original chapter below.
- Include at least 2 short lines of direct spoken dialogue between the characters.
- Use shorter sentences, simpler high-frequency vocabulary, and straightforward grammar strictly within ${profile.cefrLevel}.`
      : `TASK — EXPAND & DEEPEN THIS CHAPTER ("Too Easy" -> Longer & More Complex Version):
Rewrite and expand the exact fiction story of this chapter into a LONGER, RICHER, SLIGHTLY MORE COMPLEX version (10 to 12 longer sentences).
- Keep the exact same named characters, setting, and plot events as the original chapter below, but add richer atmospheric detail, deeper character dialogue, natural connectors (e.g. although, while, therefore), and expressive phrasing.`;

  const scriptSpecificRules =
    profile.id === 'ja'
      ? `JAPANESE RULES: Split into natural morphological word/particle tokens. Provide Hiragana "reading" ONLY for tokens containing Kanji (null for pure Hiragana/Katakana). Provide Hepburn Romaji in "romanisation".`

      : `LATIN SCRIPT RULES: Split into individual clickable word tokens. "reading" and "romanisation" MUST be null.`;

  const prompt = `You are an expert language teacher adapting Chapter ${baseChapter.chapterNumber} ("${baseChapter.chapterTitle}") in ${profile.name} (${profile.cefrLevel}).

ORIGINAL "JUST RIGHT" CHAPTER SENTENCES:
${originalSentencesText}

${rewriteDirective}

${scriptSpecificRules}

Every sentence MUST include "englishTranslation" and a 1-sentence plain-English "grammarNote". Keep the chapterTitle the same as "${baseChapter.chapterTitle}".`;

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: GEMINI_CHAPTER_RESPONSE_SCHEMA,
            temperature: 0.65,
          },
        }),
      }
    );

    if (!response.ok) {
      return createOfflineDifficultyVariant(baseChapter, level, profile);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    if (!Array.isArray(parsed?.sentences) || parsed.sentences.length === 0) {
      return createOfflineDifficultyVariant(baseChapter, level, profile);
    }

    return {
      ...baseChapter,
      id: `${baseId}__${level}`,
      activeDifficulty: level,
      difficultyLabel:
        level === 'simplify'
          ? `${profile.cefrLevel} • Simplified (Shorter & Easier)`
          : `${profile.cefrLevel} • More Complex (Longer & Richer)`,
      chapterTitle: baseChapter.chapterTitle,
      recycledWordsUsed: Array.isArray(parsed.recycledWordsUsed)
        ? parsed.recycledWordsUsed
        : baseChapter.recycledWordsUsed || [],
      sentences: parsed.sentences.map((s) => ({
        fullSentence: s.fullSentence || '',
        englishTranslation: s.englishTranslation || '',
        romanisation: profile.isCJK ? s.romanisation || null : null,
        grammarNote:
          s.grammarNote ||
          'Notice how the words group together to express a complete thought.',
        tokens: (s.tokens || []).map((t) => ({
          surface: t.surface || '',
          reading:
            profile.hasFurigana ? t.reading || null : null,
          baseForm: t.baseForm || t.surface || '',
          contextualMeaning: t.contextualMeaning || '',
        })),
      })),
    };
  } catch {
    return createOfflineDifficultyVariant(baseChapter, level, profile);
  }
}

