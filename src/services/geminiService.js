import { GEMINI_CHAPTER_RESPONSE_SCHEMA } from '../types/schema';
import { getPriorityLearningWords } from './storageService';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const DIFFICULTY_INSTRUCTIONS = {
  maintain: {
    label: 'Standard Text',
    promptDirective:
      'Write a standard-length chapter (8 sentences) at the current CEFR level following Stephen Krashen’s Comprehensible Input principle: 95% familiar structures with gentle, natural forward plot momentum.',
  },
  challenge: {
    label: 'Longer Text',
    promptDirective:
      'Keep the EXACT same CEFR difficulty level (do NOT make the grammar harder), but write a LONGER, expanded text (14 to 16 sentences) so the learner goes deeper into the chapter’s vocabulary, dialogue, and everyday situations.',
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
  en: [
    {
      title: 'Afternoon Tea with Mrs. Miller (Chá da Tarde com a Sra. Miller)',
      summary: 'A Sra. Miller convida Helena e sua filha Julia para o jardim atrás da floricultura para tomar um tradicional chá inglês com bolo de maçã caseiro.',
      recycled: ['morning', 'notebook', 'would', 'looking'],
      sentences: [
        {
          fullSentence: 'Behind the flower shop, Mrs. Miller opens a small green door to a quiet garden.',
          englishTranslation: 'Atrás da floricultura, a Sra. Miller abre uma pequena porta verde para um jardim tranquilo.',
          romanisation: null,
          grammarNote: 'Em inglês, os adjetivos vêm sempre antes do substantivo: "a small green door" (uma pequena porta verde) e "a quiet garden" (um jardim tranquilo).',
          tokens: [
            { surface: 'Behind', reading: null, baseForm: 'behind', contextualMeaning: 'atrás de' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
            { surface: 'flower', reading: null, baseForm: 'flower', contextualMeaning: 'de flores' },
            { surface: 'shop,', reading: null, baseForm: 'shop', contextualMeaning: 'loja (floricultura)' },
            { surface: 'Mrs.', reading: null, baseForm: 'Mrs.', contextualMeaning: 'Sra.' },
            { surface: 'Miller', reading: null, baseForm: 'Miller', contextualMeaning: 'Miller' },
            { surface: 'opens', reading: null, baseForm: 'open', contextualMeaning: 'abre' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'uma' },
            { surface: 'small', reading: null, baseForm: 'small', contextualMeaning: 'pequena' },
            { surface: 'green', reading: null, baseForm: 'green', contextualMeaning: 'verde' },
            { surface: 'door', reading: null, baseForm: 'door', contextualMeaning: 'porta' },
            { surface: 'to', reading: null, baseForm: 'to', contextualMeaning: 'para' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'um' },
            { surface: 'quiet', reading: null, baseForm: 'quiet', contextualMeaning: 'tranquilo / silencioso' },
            { surface: 'garden.', reading: null, baseForm: 'garden', contextualMeaning: 'jardim' },
          ],
        },
        {
          fullSentence: '"Would you like a cup of hot English tea and a piece of apple cake?" Mrs. Miller asks.',
          englishTranslation: '— Vocês gostariam de uma xícara de chá inglês quente e um pedaço de bolo de maçã? — pergunta a Sra. Miller.',
          romanisation: null,
          grammarNote: '"Would you like...?" (Você gostaria de...?) é a estrutura fundamental para oferecer comida ou bebida com educação.',
          tokens: [
            { surface: '"Would', reading: null, baseForm: 'would', contextualMeaning: 'gostariam (com like)' },
            { surface: 'you', reading: null, baseForm: 'you', contextualMeaning: 'vocês' },
            { surface: 'like', reading: null, baseForm: 'like', contextualMeaning: 'gostar (would like = gostariam de)' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'uma' },
            { surface: 'cup', reading: null, baseForm: 'cup', contextualMeaning: 'xícara' },
            { surface: 'of', reading: null, baseForm: 'of', contextualMeaning: 'de' },
            { surface: 'hot', reading: null, baseForm: 'hot', contextualMeaning: 'quente' },
            { surface: 'English', reading: null, baseForm: 'English', contextualMeaning: 'inglês' },
            { surface: 'tea', reading: null, baseForm: 'tea', contextualMeaning: 'chá' },
            { surface: 'and', reading: null, baseForm: 'and', contextualMeaning: 'e' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'um' },
            { surface: 'piece', reading: null, baseForm: 'piece', contextualMeaning: 'pedaço / fatia' },
            { surface: 'of', reading: null, baseForm: 'of', contextualMeaning: 'de' },
            { surface: 'apple', reading: null, baseForm: 'apple', contextualMeaning: 'de maçã' },
            { surface: 'cake?"', reading: null, baseForm: 'cake', contextualMeaning: 'bolo' },
            { surface: 'Mrs.', reading: null, baseForm: 'Mrs.', contextualMeaning: 'Sra.' },
            { surface: 'Miller', reading: null, baseForm: 'Miller', contextualMeaning: 'Miller' },
            { surface: 'asks.', reading: null, baseForm: 'ask', contextualMeaning: 'pergunta' },
          ],
        },
        {
          fullSentence: 'Helena smiles happily and replies: "Yes, please! That sounds wonderful!"',
          englishTranslation: 'Helena sorri alegremente e responde: — Sim, por favor! Isso parece maravilhoso!',
          romanisation: null,
          grammarNote: '"That sounds wonderful!" (Isso soa/parece maravilhoso!) é uma expressão muito natural para reagir positivamente a um convite.',
          tokens: [
            { surface: 'Helena', reading: null, baseForm: 'Helena', contextualMeaning: 'Helena' },
            { surface: 'smiles', reading: null, baseForm: 'smile', contextualMeaning: 'sorri' },
            { surface: 'happily', reading: null, baseForm: 'happily', contextualMeaning: 'alegremente' },
            { surface: 'and', reading: null, baseForm: 'and', contextualMeaning: 'e' },
            { surface: 'replies:', reading: null, baseForm: 'reply', contextualMeaning: 'responde' },
            { surface: '"Yes,', reading: null, baseForm: 'yes', contextualMeaning: 'sim' },
            { surface: 'please!', reading: null, baseForm: 'please', contextualMeaning: 'por favor' },
            { surface: 'That', reading: null, baseForm: 'that', contextualMeaning: 'isso' },
            { surface: 'sounds', reading: null, baseForm: 'sound', contextualMeaning: 'soa / parece' },
            { surface: 'wonderful!"', reading: null, baseForm: 'wonderful', contextualMeaning: 'maravilhoso' },
          ],
        },
        {
          fullSentence: 'Mrs. Miller opens the blue notebook and shows Helena the secret recipe for the cake.',
          englishTranslation: 'A Sra. Miller abre o caderno azul e mostra para Helena a receita secreta do bolo.',
          romanisation: null,
          grammarNote: '"Shows Helena" significa "mostra para Helena". No presente simples com "Mrs. Miller" (ela), os verbos terminam em "-s": "opens" e "shows".',
          tokens: [
            { surface: 'Mrs.', reading: null, baseForm: 'Mrs.', contextualMeaning: 'Sra.' },
            { surface: 'Miller', reading: null, baseForm: 'Miller', contextualMeaning: 'Miller' },
            { surface: 'opens', reading: null, baseForm: 'open', contextualMeaning: 'abre' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'o' },
            { surface: 'blue', reading: null, baseForm: 'blue', contextualMeaning: 'azul' },
            { surface: 'notebook', reading: null, baseForm: 'notebook', contextualMeaning: 'caderno' },
            { surface: 'and', reading: null, baseForm: 'and', contextualMeaning: 'e' },
            { surface: 'shows', reading: null, baseForm: 'show', contextualMeaning: 'mostra' },
            { surface: 'Helena', reading: null, baseForm: 'Helena', contextualMeaning: 'para Helena' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
            { surface: 'secret', reading: null, baseForm: 'secret', contextualMeaning: 'secreta' },
            { surface: 'recipe', reading: null, baseForm: 'recipe', contextualMeaning: 'receita' },
            { surface: 'for', reading: null, baseForm: 'for', contextualMeaning: 'de / para' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'o' },
            { surface: 'cake.', reading: null, baseForm: 'cake', contextualMeaning: 'bolo' },
          ],
        },
        {
          fullSentence: 'Inside the back cover of the notebook, Julia notices two golden tickets for a concert tonight.',
          englishTranslation: 'Dentro da contracapa do caderno, Julia nota dois ingressos dourados para um concerto hoje à noite.',
          romanisation: null,
          grammarNote: '"Tonight" significa "hoje à noite" em uma única palavra, sem precisar de preposição antes.',
          tokens: [
            { surface: 'Inside', reading: null, baseForm: 'inside', contextualMeaning: 'dentro de' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
            { surface: 'back', reading: null, baseForm: 'back', contextualMeaning: 'de trás (back cover = contracapa)' },
            { surface: 'cover', reading: null, baseForm: 'cover', contextualMeaning: 'capa' },
            { surface: 'of', reading: null, baseForm: 'of', contextualMeaning: 'de' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'o' },
            { surface: 'notebook,', reading: null, baseForm: 'notebook', contextualMeaning: 'caderno' },
            { surface: 'Julia', reading: null, baseForm: 'Julia', contextualMeaning: 'Julia' },
            { surface: 'notices', reading: null, baseForm: 'notice', contextualMeaning: 'nota / percebe' },
            { surface: 'two', reading: null, baseForm: 'two', contextualMeaning: 'dois' },
            { surface: 'golden', reading: null, baseForm: 'golden', contextualMeaning: 'dourados' },
            { surface: 'tickets', reading: null, baseForm: 'ticket', contextualMeaning: 'ingressos' },
            { surface: 'for', reading: null, baseForm: 'for', contextualMeaning: 'para' },
            { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'um' },
            { surface: 'concert', reading: null, baseForm: 'concert', contextualMeaning: 'concerto / show' },
            { surface: 'tonight.', reading: null, baseForm: 'tonight', contextualMeaning: 'hoje à noite' },
          ],
        },
        {
          fullSentence: '"My husband cannot go tonight, so please take these two tickets and enjoy the music!" Mrs. Miller says warmly.',
          englishTranslation: '— Meu marido não pode ir hoje à noite, então por favor levem estes dois ingressos e aproveitem a música! — diz a Sra. Miller calorosamente.',
          romanisation: null,
          grammarNote: '"Cannot" (ou "can\'t") significa "não pode" e é seguido diretamente pelo verbo principal ("cannot go" = não pode ir).',
          tokens: [
            { surface: '"My', reading: null, baseForm: 'my', contextualMeaning: 'meu' },
            { surface: 'husband', reading: null, baseForm: 'husband', contextualMeaning: 'marido' },
            { surface: 'cannot', reading: null, baseForm: 'cannot', contextualMeaning: 'não pode' },
            { surface: 'go', reading: null, baseForm: 'go', contextualMeaning: 'ir' },
            { surface: 'tonight,', reading: null, baseForm: 'tonight', contextualMeaning: 'hoje à noite' },
            { surface: 'so', reading: null, baseForm: 'so', contextualMeaning: 'então / por isso' },
            { surface: 'please', reading: null, baseForm: 'please', contextualMeaning: 'por favor' },
            { surface: 'take', reading: null, baseForm: 'take', contextualMeaning: 'levem / peguem' },
            { surface: 'these', reading: null, baseForm: 'these', contextualMeaning: 'estes' },
            { surface: 'two', reading: null, baseForm: 'two', contextualMeaning: 'dois' },
            { surface: 'tickets', reading: null, baseForm: 'ticket', contextualMeaning: 'ingressos' },
            { surface: 'and', reading: null, baseForm: 'and', contextualMeaning: 'e' },
            { surface: 'enjoy', reading: null, baseForm: 'enjoy', contextualMeaning: 'aproveitem' },
            { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
            { surface: 'music!"', reading: null, baseForm: 'music', contextualMeaning: 'música' },
            { surface: 'Mrs.', reading: null, baseForm: 'Mrs.', contextualMeaning: 'Sra.' },
            { surface: 'Miller', reading: null, baseForm: 'Miller', contextualMeaning: 'Miller' },
            { surface: 'says', reading: null, baseForm: 'say', contextualMeaning: 'diz' },
            { surface: 'warmly.', reading: null, baseForm: 'warmly', contextualMeaning: 'calorosamente' },
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
  const existingTitles = new Set(
    baseChapters.map((c) => (c.chapterTitle || '').toLowerCase())
  );

  offlineRegenerateCounter += 1;

  // 1. First pick any unused bonus scene from BONUS_SCENE_BANK
  const unusedBonusIdx = langBank.findIndex(
    (scene) =>
      !Array.from(existingTitles).some((t) =>
        t.includes(scene.title.toLowerCase())
      ) &&
      (!currentChapter?.chapterTitle ||
        !currentChapter.chapterTitle.includes(scene.title))
  );

  if (unusedBonusIdx !== -1) {
    const pickedScene = langBank[unusedBonusIdx];
    const extraSentences = CHALLENGE_EXTENSION_BANK[profile.id] || [];
    const combinedSentences =
      pickedScene.sentences.length < 6 && extraSentences.length > 0
        ? [...pickedScene.sentences, ...extraSentences]
        : pickedScene.sentences;

    return {
      id: `${profile.id}-ch-${chapterNum}-${Date.now()}`,
      preRenderedAudioId: `${profile.id}-bonus-${unusedBonusIdx}`,
      chapterNumber: chapterNum,
      difficultyLabel:
        profile.id === 'en'
          ? 'A1 Iniciante • Nova História e Vocabulário'
          : `${profile.cefrLevel} • Fresh Story & Vocabulary`,
      chapterTitle:
        profile.id === 'en'
          ? `Capítulo ${chapterNum}: ${pickedScene.title}`
          : `Chapter ${chapterNum} : ${pickedScene.title}`,
      updatedArcSummary: pickedScene.summary,
      recycledWordsUsed: pickedScene.recycled,
      sentences: structuredClone(combinedSentences),
    };
  }

  // 2. If all built-in bonus scenes have been used, recombine distinct story sentences + extension scenes
  //    into a unique progressive episode so it never duplicates the previous chapter verbatim!
  const allSentencesPool = [];
  langBank.forEach((scene) => {
    (scene.sentences || []).forEach((s) => allSentencesPool.push(s));
  });
  (CHALLENGE_EXTENSION_BANK[profile.id] || []).forEach((s) =>
    allSentencesPool.push(s)
  );
  baseChapters.forEach((ch) => {
    if (ch.id !== currentChapter?.id) {
      (ch.sentences || []).forEach((s) => allSentencesPool.push(s));
    }
  });

  const episodeOffset = (chapterNum * 3 + offlineRegenerateCounter * 2) % Math.max(1, allSentencesPool.length);
  const pickedSentences = [];
  for (let i = 0; i < Math.min(7, allSentencesPool.length); i++) {
    const candidate = allSentencesPool[(episodeOffset + i * 2) % allSentencesPool.length];
    if (!pickedSentences.some((p) => p.fullSentence === candidate.fullSentence)) {
      pickedSentences.push(structuredClone(candidate));
    }
  }

  const episodeTitles = {
    fr: `Nouvelle Piste à Paris — Épisode ${chapterNum} (New Clue in Paris — Episode ${chapterNum})`,
    it: `Nuovo Indizio in Città — Episodio ${chapterNum} (New Clue in Town — Episode ${chapterNum})`,
    ja: `第${chapterNum}章：新たな手掛かり (New Clue — Episode ${chapterNum})`,
    es: `Nueva Pista en la Costa — Episodio ${chapterNum} (New Clue on the Coast — Episode ${chapterNum})`,
    en: `A New Day in London — Episode ${chapterNum} (Um Novo Dia em Londres — Episódio ${chapterNum})`,
  };

  return {
    id: `${profile.id}-ch-${chapterNum}-${Date.now()}`,
    chapterNumber: chapterNum,
    difficultyLabel:
      profile.id === 'en'
        ? `A1 Iniciante • Episódio ${chapterNum}`
        : `${profile.cefrLevel} • Episode ${chapterNum}`,
    chapterTitle:
      profile.id === 'en'
        ? `Capítulo ${chapterNum}: ${episodeTitles[profile.id]}`
        : `Chapter ${chapterNum} : ${episodeTitles[profile.id] || `Episode ${chapterNum}`}`,
    updatedArcSummary:
      profile.id === 'en'
        ? `${profile.storyArcSummary} No Capítulo ${chapterNum}, novas conversas em inglês continuam a história.`
        : `${profile.storyArcSummary} In Chapter ${chapterNum}, new clues and conversations deepen the investigation.`,
    recycledWordsUsed: (profile.vocabBank || []).slice(0, 4).map((w) => w.baseForm),
    sentences: pickedSentences,
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

  const translationLanguageRules =
    profile.id === 'en'
      ? `BRITISH ENGLISH (UK) & BRAZILIAN PORTUGUESE TRANSLATION RULES (CRITICAL FOR ENGLISH COURSE FOR BRAZILIANS):
- The target story sentences ("fullSentence") MUST be written in natural A1 Beginner BRITISH ENGLISH (UK spelling, vocabulary, and usage: e.g. "colourful", "practises" as verb, "mum", "favourite", "neighbour", "centre", "chemist's", "autumn", "holiday", "underground", "shop"). NEVER use American spellings or Americanisms!
- Every token's "contextualMeaning" MUST be written in clear Brazilian Portuguese (Português do Brasil).
- Every sentence's "englishTranslation" field MUST contain the natural BRAZILIAN PORTUGUESE translation of the English sentence (so a Brazilian Portuguese speaker can read the translation in Portuguese).
- Every sentence's "grammarNote" MUST be written in friendly, plain-language BRAZILIAN PORTUGUESE explaining the English sentence pattern for a Brazilian beginner.
- In "recapModule", write "subtitle", "construction.patternName", "construction.explanation", and all "english" translation fields in BRAZILIAN PORTUGUESE while keeping target sentences/phrases in British English.`
      : `ENGLISH TRANSLATION & GRAMMAR NOTE RULES:
- Every sentence MUST include "englishTranslation" with a clear, natural British English translation of the full sentence.
- Every sentence MUST include a "grammarNote" consisting of a single, plain-English sentence explaining the core recurring sentence pattern used in that sentence, avoiding dense academic jargon.`;

  const systemPrompt = `You are a bestselling fiction author and master graded-reader creator trained in Stephen Krashen's Comprehensible Input (i+1) hypothesis and Olly Richards' StoryLearning method.

Write Chapter ${nextChapterNumber} of the ongoing serial story "${profile.storyTitle}" in ${profile.nativeName || profile.name}, strictly calibrated for ${profile.cefrLevel}.

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

${translationLanguageRules}

CHAPTER LENGTH & LEARNING MODULE:
- Write 8 to 9 cohesive, character-and-dialogue-driven sentences with fresh, practical vocabulary that advance the plot naturally.
- In "recapModule", generate a complete Chapter Consolidation & Transfer Lab tailored to this chapter:
  1. "subtitle": brief summary of the grammar and lexical focus of this chapter.
  2. "vocabReuses": 3 key expressions from this chapter, showing "storyContext" (the sentence from the story) and "newPhrase" + "english" (a brand-new everyday sentence transferring that expression into a fresh real-life context).
  3. "construction": 1 core grammatical pattern from this chapter ("patternName", plain-language "explanation", 3-4 chip "formula", and 3 fresh "examples" each with "target", "english", and "highlight").`;

  const requestBody = JSON.stringify({
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
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
  } catch {
    clearTimeout(timeoutId);
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
  }

  let parsedChapter;
  try {
    parsedChapter = JSON.parse(rawText);
  } catch {
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
  }

  if (!Array.isArray(parsedChapter.sentences) || parsedChapter.sentences.length === 0) {
    return generateOfflineBonusChapter(
      profile,
      adjustment,
      nextChapterNumber,
      currentChapter
    );
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
    recapModule: parsedChapter.recapModule || null,
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
 * Substantial, same-level extension sentences (6 sentences per course) so the "Longer Text"
 * version of a chapter is always noticeably longer (~75% more text) while keeping the exact same
 * accessible difficulty level and deepening the chapter's vocabulary and concepts.
 */
const CHALLENGE_EXTENSION_BANK = {
  fr: [
    {
      fullSentence: 'Clara ouvre son carnet et relit attentivement la petite note rouge près de la fenêtre.',
      englishTranslation: 'Clara opens her notebook and carefully rereads the small red note near the window.',
      romanisation: null,
      grammarNote: 'Adding "re-" before a verb like "lire" (to read) forms "relire" (to reread / read again).',
      tokens: [
        { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
        { surface: 'ouvre', reading: null, baseForm: 'ouvrir', contextualMeaning: 'opens' },
        { surface: 'son', reading: null, baseForm: 'son', contextualMeaning: 'her' },
        { surface: 'carnet', reading: null, baseForm: 'carnet', contextualMeaning: 'notebook' },
        { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
        { surface: 'relit', reading: null, baseForm: 'relire', contextualMeaning: 'rereads' },
        { surface: 'attentivement', reading: null, baseForm: 'attentivement', contextualMeaning: 'carefully' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'petite', reading: null, baseForm: 'petit', contextualMeaning: 'small' },
        { surface: 'note', reading: null, baseForm: 'note', contextualMeaning: 'note' },
        { surface: 'rouge', reading: null, baseForm: 'rouge', contextualMeaning: 'red' },
        { surface: 'près', reading: null, baseForm: 'près de', contextualMeaning: 'near' },
        { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'fenêtre.', reading: null, baseForm: 'fenêtre', contextualMeaning: 'window' },
      ],
    },
    {
      fullSentence: '« Est-ce que tu connais déjà cette adresse dans le vieux quartier ? » demande-t-elle à Lucas.',
      englishTranslation: '"Do you already know this address in the old neighbourhood?" she asks Lucas.',
      romanisation: null,
      grammarNote: 'Use "connaître" ("tu connais") when talking about being familiar with a place, street, or person.',
      tokens: [
        { surface: '« Est-ce', reading: null, baseForm: 'est-ce que', contextualMeaning: 'do (question)' },
        { surface: 'que', reading: null, baseForm: 'que', contextualMeaning: 'that' },
        { surface: 'tu', reading: null, baseForm: 'tu', contextualMeaning: 'you' },
        { surface: 'connais', reading: null, baseForm: 'connaître', contextualMeaning: 'know' },
        { surface: 'déjà', reading: null, baseForm: 'déjà', contextualMeaning: 'already' },
        { surface: 'cette', reading: null, baseForm: 'ce', contextualMeaning: 'this' },
        { surface: 'adresse', reading: null, baseForm: 'adresse', contextualMeaning: 'address' },
        { surface: 'dans', reading: null, baseForm: 'dans', contextualMeaning: 'in' },
        { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'the' },
        { surface: 'vieux', reading: null, baseForm: 'vieux', contextualMeaning: 'old' },
        { surface: 'quartier ? »', reading: null, baseForm: 'quartier', contextualMeaning: 'neighbourhood' },
        { surface: 'demande-t-elle', reading: null, baseForm: 'demander', contextualMeaning: 'she asks' },
        { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'to' },
        { surface: 'Lucas.', reading: null, baseForm: 'Lucas', contextualMeaning: 'Lucas' },
      ],
    },
    {
      fullSentence: 'Lucas boit une gorgée de son café chaud et regarde sa montre avec calme.',
      englishTranslation: 'Lucas drinks a sip of his hot coffee and looks at his watch calmly.',
      romanisation: null,
      grammarNote: '"Une gorgée de café" means "a sip of coffee" — quantity nouns are always followed by "de".',
      tokens: [
        { surface: 'Lucas', reading: null, baseForm: 'Lucas', contextualMeaning: 'Lucas' },
        { surface: 'boit', reading: null, baseForm: 'boire', contextualMeaning: 'drinks' },
        { surface: 'une', reading: null, baseForm: 'une', contextualMeaning: 'a' },
        { surface: 'gorgée', reading: null, baseForm: 'gorgée', contextualMeaning: 'sip' },
        { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
        { surface: 'son', reading: null, baseForm: 'son', contextualMeaning: 'his' },
        { surface: 'café', reading: null, baseForm: 'café', contextualMeaning: 'coffee' },
        { surface: 'chaud', reading: null, baseForm: 'chaud', contextualMeaning: 'hot' },
        { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
        { surface: 'regarde', reading: null, baseForm: 'regarder', contextualMeaning: 'looks at' },
        { surface: 'sa', reading: null, baseForm: 'son', contextualMeaning: 'his' },
        { surface: 'montre', reading: null, baseForm: 'montre', contextualMeaning: 'watch' },
        { surface: 'avec', reading: null, baseForm: 'avec', contextualMeaning: 'with' },
        { surface: 'calme.', reading: null, baseForm: 'calme', contextualMeaning: 'calm' },
      ],
    },
    {
      fullSentence: '« Oui, c’est une petite rue tranquille derrière la place principale, à dix minutes d’ici, » répond-il.',
      englishTranslation: '"Yes, it is a quiet little street behind the main square, ten minutes from here," he replies.',
      romanisation: null,
      grammarNote: '"À dix minutes d’ici" ("ten minutes from here") uses the preposition "à" to express distance in time or space.',
      tokens: [
        { surface: '« Oui,', reading: null, baseForm: 'oui', contextualMeaning: 'yes' },
        { surface: 'c’est', reading: null, baseForm: 'ce + être', contextualMeaning: 'it is' },
        { surface: 'une', reading: null, baseForm: 'une', contextualMeaning: 'a' },
        { surface: 'petite', reading: null, baseForm: 'petit', contextualMeaning: 'small / little' },
        { surface: 'rue', reading: null, baseForm: 'rue', contextualMeaning: 'street' },
        { surface: 'tranquille', reading: null, baseForm: 'tranquille', contextualMeaning: 'quiet' },
        { surface: 'derrière', reading: null, baseForm: 'derrière', contextualMeaning: 'behind' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'place', reading: null, baseForm: 'place', contextualMeaning: 'square' },
        { surface: 'principale,', reading: null, baseForm: 'principal', contextualMeaning: 'main' },
        { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'at' },
        { surface: 'dix', reading: null, baseForm: 'dix', contextualMeaning: 'ten' },
        { surface: 'minutes', reading: null, baseForm: 'minute', contextualMeaning: 'minutes' },
        { surface: 'd’ici, »', reading: null, baseForm: 'ici', contextualMeaning: 'from here' },
        { surface: 'répond-il.', reading: null, baseForm: 'répondre', contextualMeaning: 'he replies' },
      ],
    },
    {
      fullSentence: 'Dehors, la pluie commence enfin à ralentir et quelques passants marchent sur le trottoir.',
      englishTranslation: 'Outside, the rain finally begins to slow down and a few passersby walk on the pavement.',
      romanisation: null,
      grammarNote: '"Commencer à + infinitive" ("commence à ralentir") means "to begin to do something".',
      tokens: [
        { surface: 'Dehors,', reading: null, baseForm: 'dehors', contextualMeaning: 'outside' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'pluie', reading: null, baseForm: 'pluie', contextualMeaning: 'rain' },
        { surface: 'commence', reading: null, baseForm: 'commencer', contextualMeaning: 'begins' },
        { surface: 'enfin', reading: null, baseForm: 'enfin', contextualMeaning: 'finally' },
        { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'to' },
        { surface: 'ralentir', reading: null, baseForm: 'ralentir', contextualMeaning: 'slow down' },
        { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
        { surface: 'quelques', reading: null, baseForm: 'quelque', contextualMeaning: 'a few' },
        { surface: 'passants', reading: null, baseForm: 'passant', contextualMeaning: 'passersby' },
        { surface: 'marchent', reading: null, baseForm: 'marcher', contextualMeaning: 'walk' },
        { surface: 'sur', reading: null, baseForm: 'sur', contextualMeaning: 'on' },
        { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'the' },
        { surface: 'trottoir.', reading: null, baseForm: 'trottoir', contextualMeaning: 'pavement / sidewalk' },
      ],
    },
    {
      fullSentence: 'Clara garde précieusement la clé dans sa poche et se prépare à découvrir la suite du mystère.',
      englishTranslation: 'Clara carefully keeps the key in her pocket and gets ready to discover the rest of the mystery.',
      romanisation: null,
      grammarNote: '"Se préparer à + infinitive" ("se prépare à découvrir") means "to get ready to do something".',
      tokens: [
        { surface: 'Clara', reading: null, baseForm: 'Clara', contextualMeaning: 'Clara' },
        { surface: 'garde', reading: null, baseForm: 'garder', contextualMeaning: 'keeps' },
        { surface: 'précieusement', reading: null, baseForm: 'précieusement', contextualMeaning: 'carefully / safely' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'clé', reading: null, baseForm: 'clé', contextualMeaning: 'key' },
        { surface: 'dans', reading: null, baseForm: 'dans', contextualMeaning: 'in' },
        { surface: 'sa', reading: null, baseForm: 'son', contextualMeaning: 'her' },
        { surface: 'poche', reading: null, baseForm: 'poche', contextualMeaning: 'pocket' },
        { surface: 'et', reading: null, baseForm: 'et', contextualMeaning: 'and' },
        { surface: 'se', reading: null, baseForm: 'se', contextualMeaning: 'herself' },
        { surface: 'prépare', reading: null, baseForm: 'préparer', contextualMeaning: 'gets ready' },
        { surface: 'à', reading: null, baseForm: 'à', contextualMeaning: 'to' },
        { surface: 'découvrir', reading: null, baseForm: 'découvrir', contextualMeaning: 'discover' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'suite', reading: null, baseForm: 'suite', contextualMeaning: 'continuation / rest' },
        { surface: 'du', reading: null, baseForm: 'du', contextualMeaning: 'of the' },
        { surface: 'mystère.', reading: null, baseForm: 'mystère', contextualMeaning: 'mystery' },
      ],
    },
  ],
  it: [
    {
      fullSentence: 'Marco apre di nuovo la scatola di legno per guardare bene il piccolo biglietto antico.',
      englishTranslation: 'Marco opens the wooden box again to look closely at the small antique note.',
      romanisation: null,
      grammarNote: '"Di nuovo" means "again", and "per + infinitive" ("per guardare") expresses purpose ("in order to look").',
      tokens: [
        { surface: 'Marco', reading: null, baseForm: 'Marco', contextualMeaning: 'Marco' },
        { surface: 'apre', reading: null, baseForm: 'aprire', contextualMeaning: 'opens' },
        { surface: 'di', reading: null, baseForm: 'di nuovo', contextualMeaning: 'again (part 1)' },
        { surface: 'nuovo', reading: null, baseForm: 'nuovo', contextualMeaning: 'again (part 2)' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'scatola', reading: null, baseForm: 'scatola', contextualMeaning: 'box' },
        { surface: 'di', reading: null, baseForm: 'di', contextualMeaning: 'of' },
        { surface: 'legno', reading: null, baseForm: 'legno', contextualMeaning: 'wood' },
        { surface: 'per', reading: null, baseForm: 'per', contextualMeaning: 'to / in order to' },
        { surface: 'guardare', reading: null, baseForm: 'guardare', contextualMeaning: 'look at' },
        { surface: 'bene', reading: null, baseForm: 'bene', contextualMeaning: 'well / closely' },
        { surface: 'il', reading: null, baseForm: 'il', contextualMeaning: 'the' },
        { surface: 'piccolo', reading: null, baseForm: 'piccolo', contextualMeaning: 'small' },
        { surface: 'biglietto', reading: null, baseForm: 'biglietto', contextualMeaning: 'note / ticket' },
        { surface: 'antico.', reading: null, baseForm: 'antico', contextualMeaning: 'antique / old' },
      ],
    },
    {
      fullSentence: '« Conosci questa vecchia strada vicino alla stazione ? » chiede Marco alla sua amica Sofia.',
      englishTranslation: '"Do you know this old street near the station?" Marco asks his friend Sofia.',
      romanisation: null,
      grammarNote: '"Chiedere a qualcuno" ("chiede alla sua amica") means "to ask someone".',
      tokens: [
        { surface: '« Conosci', reading: null, baseForm: 'conoscere', contextualMeaning: 'do you know' },
        { surface: 'questa', reading: null, baseForm: 'questo', contextualMeaning: 'this' },
        { surface: 'vecchia', reading: null, baseForm: 'vecchio', contextualMeaning: 'old' },
        { surface: 'strada', reading: null, baseForm: 'strada', contextualMeaning: 'street' },
        { surface: 'vicino', reading: null, baseForm: 'vicino a', contextualMeaning: 'near' },
        { surface: 'alla', reading: null, baseForm: 'alla', contextualMeaning: 'the' },
        { surface: 'stazione ? »', reading: null, baseForm: 'stazione', contextualMeaning: 'station' },
        { surface: 'chiede', reading: null, baseForm: 'chiedere', contextualMeaning: 'asks' },
        { surface: 'Marco', reading: null, baseForm: 'Marco', contextualMeaning: 'Marco' },
        { surface: 'alla', reading: null, baseForm: 'alla', contextualMeaning: 'to the' },
        { surface: 'sua', reading: null, baseForm: 'suo', contextualMeaning: 'his' },
        { surface: 'amica', reading: null, baseForm: 'amica', contextualMeaning: 'friend' },
        { surface: 'Sofia.', reading: null, baseForm: 'Sofia', contextualMeaning: 'Sofia' },
      ],
    },
    {
      fullSentence: 'Sofia sorride con calma e indica l’orologio grande sopra l’ingresso della piazza.',
      englishTranslation: 'Sofia smiles calmly and points to the big clock above the entrance to the square.',
      romanisation: null,
      grammarNote: '"Sopra" means "above / over" and connects directly to the following noun.',
      tokens: [
        { surface: 'Sofia', reading: null, baseForm: 'Sofia', contextualMeaning: 'Sofia' },
        { surface: 'sorride', reading: null, baseForm: 'sorridere', contextualMeaning: 'smiles' },
        { surface: 'con', reading: null, baseForm: 'con', contextualMeaning: 'with' },
        { surface: 'calma', reading: null, baseForm: 'calma', contextualMeaning: 'calm' },
        { surface: 'e', reading: null, baseForm: 'e', contextualMeaning: 'and' },
        { surface: 'indica', reading: null, baseForm: 'indicare', contextualMeaning: 'points to' },
        { surface: 'l’orologio', reading: null, baseForm: 'orologio', contextualMeaning: 'the clock' },
        { surface: 'grande', reading: null, baseForm: 'grande', contextualMeaning: 'big' },
        { surface: 'sopra', reading: null, baseForm: 'sopra', contextualMeaning: 'above' },
        { surface: 'l’ingresso', reading: null, baseForm: 'ingresso', contextualMeaning: 'the entrance' },
        { surface: 'della', reading: null, baseForm: 'della', contextualMeaning: 'of the' },
        { surface: 'piazza.', reading: null, baseForm: 'piazza', contextualMeaning: 'square' },
      ],
    },
    {
      fullSentence: '« Sì, ci passo ogni settimana quando vado a comprare i libri nuovi, » risponde Sofia.',
      englishTranslation: '"Yes, I pass by there every week when I go to buy new books," Sofia replies.',
      romanisation: null,
      grammarNote: 'The little pronoun "ci" means "there" ("ci passo" = I pass by there).',
      tokens: [
        { surface: '« Sì,', reading: null, baseForm: 'sì', contextualMeaning: 'yes' },
        { surface: 'ci', reading: null, baseForm: 'ci', contextualMeaning: 'there' },
        { surface: 'passo', reading: null, baseForm: 'passare', contextualMeaning: 'I pass by' },
        { surface: 'ogni', reading: null, baseForm: 'ogni', contextualMeaning: 'every' },
        { surface: 'settimana', reading: null, baseForm: 'settimana', contextualMeaning: 'week' },
        { surface: 'quando', reading: null, baseForm: 'quando', contextualMeaning: 'when' },
        { surface: 'vado', reading: null, baseForm: 'andare', contextualMeaning: 'I go' },
        { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'to' },
        { surface: 'comprare', reading: null, baseForm: 'comprare', contextualMeaning: 'buy' },
        { surface: 'i', reading: null, baseForm: 'il', contextualMeaning: 'the' },
        { surface: 'libri', reading: null, baseForm: 'libro', contextualMeaning: 'books' },
        { surface: 'nuovi, »', reading: null, baseForm: 'nuovo', contextualMeaning: 'new' },
        { surface: 'risponde', reading: null, baseForm: 'rispondere', contextualMeaning: 'replies' },
        { surface: 'Sofia.', reading: null, baseForm: 'Sofia', contextualMeaning: 'Sofia' },
      ],
    },
    {
      fullSentence: 'Intanto il profumo del caffè caldo arriva dal piccolo bar all’angolo della piazza.',
      englishTranslation: 'Meanwhile, the aroma of hot coffee drifts over from the small café at the corner of the square.',
      romanisation: null,
      grammarNote: '"Dal" is the contraction of "da + il" ("from the"), and "all’angolo" means "at the corner".',
      tokens: [
        { surface: 'Intanto', reading: null, baseForm: 'intanto', contextualMeaning: 'meanwhile' },
        { surface: 'il', reading: null, baseForm: 'il', contextualMeaning: 'the' },
        { surface: 'profumo', reading: null, baseForm: 'profumo', contextualMeaning: 'aroma / scent' },
        { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'of the' },
        { surface: 'caffè', reading: null, baseForm: 'caffè', contextualMeaning: 'coffee' },
        { surface: 'caldo', reading: null, baseForm: 'caldo', contextualMeaning: 'hot' },
        { surface: 'arriva', reading: null, baseForm: 'arrivare', contextualMeaning: 'arrives / comes' },
        { surface: 'dal', reading: null, baseForm: 'dal', contextualMeaning: 'from the' },
        { surface: 'piccolo', reading: null, baseForm: 'piccolo', contextualMeaning: 'small' },
        { surface: 'bar', reading: null, baseForm: 'bar', contextualMeaning: 'café' },
        { surface: 'all’angolo', reading: null, baseForm: 'angolo', contextualMeaning: 'at the corner' },
        { surface: 'della', reading: null, baseForm: 'della', contextualMeaning: 'of the' },
        { surface: 'piazza.', reading: null, baseForm: 'piazza', contextualMeaning: 'square' },
      ],
    },
    {
      fullSentence: 'Insieme mettono la scatola nella borsa e camminano con entusiasmo verso la prossima tappa.',
      englishTranslation: 'Together they put the box into the bag and walk with enthusiasm toward the next stop.',
      romanisation: null,
      grammarNote: '"Verso" means "toward" and is used for both physical directions and time.',
      tokens: [
        { surface: 'Insieme', reading: null, baseForm: 'insieme', contextualMeaning: 'together' },
        { surface: 'mettono', reading: null, baseForm: 'mettere', contextualMeaning: 'they put' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'scatola', reading: null, baseForm: 'scatola', contextualMeaning: 'box' },
        { surface: 'nella', reading: null, baseForm: 'nella', contextualMeaning: 'in the' },
        { surface: 'borsa', reading: null, baseForm: 'borsa', contextualMeaning: 'bag' },
        { surface: 'e', reading: null, baseForm: 'e', contextualMeaning: 'and' },
        { surface: 'camminano', reading: null, baseForm: 'camminare', contextualMeaning: 'they walk' },
        { surface: 'con', reading: null, baseForm: 'con', contextualMeaning: 'with' },
        { surface: 'entusiasmo', reading: null, baseForm: 'entusiasmo', contextualMeaning: 'enthusiasm' },
        { surface: 'verso', reading: null, baseForm: 'verso', contextualMeaning: 'toward' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'prossima', reading: null, baseForm: 'prossimo', contextualMeaning: 'next' },
        { surface: 'tappa.', reading: null, baseForm: 'tappa', contextualMeaning: 'stop / stage' },
      ],
    },
  ],
  ja: [
    {
      fullSentence: '遥は小さな懐中時計をもう一度見て、裏側の文字をゆっくり読みました。',
      englishTranslation: 'Haruka looked at the small pocket watch once more and slowly read the letters on the back.',
      romanisation: 'Haruka wa chiisana kaichuudokei wo mou ichido mite, uragawa no moji wo yukkuri yomimashita.',
      grammarNote: '「もう一度」 ("mou ichido") means "once more / again", and the -て form 「見て」 connects two sequential actions.',
      tokens: [
        { surface: '遥', reading: 'はるか', baseForm: '遥', contextualMeaning: 'Haruka' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: '小さな', reading: 'ちいさな', baseForm: '小さい', contextualMeaning: 'small' },
        { surface: '懐中時計', reading: 'かいちゅうどけい', baseForm: '懐中時計', contextualMeaning: 'pocket watch' },
        { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
        { surface: 'もう一度', reading: 'もういちど', baseForm: 'もう一度', contextualMeaning: 'once more' },
        { surface: '見て、', reading: 'みて、', baseForm: '見る', contextualMeaning: 'looking at,' },
        { surface: '裏側', reading: 'うらがわ', baseForm: '裏側', contextualMeaning: 'the back side' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: 'of' },
        { surface: '文字', reading: 'もじ', baseForm: '文字', contextualMeaning: 'letters / inscription' },
        { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
        { surface: 'ゆっくり', reading: null, baseForm: 'ゆっくり', contextualMeaning: 'slowly' },
        { surface: '読みました。', reading: 'よみました。', baseForm: '読む', contextualMeaning: 'read' },
      ],
    },
    {
      fullSentence: '「この古い地図の場所を知っていますか？」と遥は隣の蓮に聞きました。',
      englishTranslation: '"Do you know the place on this old map?" Haruka asked Ren beside her.',
      romanisation: '“Kono furui chizu no basho wo shitte imasu ka?” to Haruka wa tonari no Ren ni kikimashita.',
      grammarNote: '「知っていますか」 ("shitte imasu ka") is the polite way to ask "Do you know?".',
      tokens: [
        { surface: '「この', reading: null, baseForm: 'この', contextualMeaning: 'this' },
        { surface: '古い', reading: 'ふるい', baseForm: '古い', contextualMeaning: 'old' },
        { surface: '地図', reading: 'ちず', baseForm: '地図', contextualMeaning: 'map' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: 'on / of' },
        { surface: '場所', reading: 'ばしょ', baseForm: '場所', contextualMeaning: 'place' },
        { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
        { surface: '知って', reading: 'しって', baseForm: '知る', contextualMeaning: 'knowing' },
        { surface: 'いますか？」', reading: null, baseForm: 'いる', contextualMeaning: 'do you?' },
        { surface: 'と', reading: null, baseForm: 'と', contextualMeaning: '(quote)' },
        { surface: '遥', reading: 'はるか', baseForm: '遥', contextualMeaning: 'Haruka' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: '隣', reading: 'となり', baseForm: '隣', contextualMeaning: 'next to / beside' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: '(modifier)' },
        { surface: '蓮', reading: 'れん', baseForm: '蓮', contextualMeaning: 'Ren' },
        { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'to' },
        { surface: '聞きました。', reading: 'ききました。', baseForm: '聞く', contextualMeaning: 'asked' },
      ],
    },
    {
      fullSentence: '蓮は少し考えてから、「ええ、駅の近くの静かな通りですよ」と答えました。',
      englishTranslation: 'After thinking for a moment, Ren answered: "Yes, it is a quiet street near the station."',
      romanisation: 'Ren wa sukoshi kangaete kara, “Ee, eki no chikaku no shizuka na toori desu yo,” to kotaemashita.',
      grammarNote: '「〜てから」 ("kangaete kara") means "after doing ~" ("after thinking").',
      tokens: [
        { surface: '蓮', reading: 'れん', baseForm: '蓮', contextualMeaning: 'Ren' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: '少し', reading: 'すこし', baseForm: '少し', contextualMeaning: 'a little / a moment' },
        { surface: '考えてから、', reading: 'かんがえてから、', baseForm: '考える', contextualMeaning: 'after thinking,' },
        { surface: '「ええ、', reading: null, baseForm: 'ええ', contextualMeaning: 'yes,' },
        { surface: '駅', reading: 'えき', baseForm: '駅', contextualMeaning: 'station' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: '’s' },
        { surface: '近く', reading: 'ちかく', baseForm: '近く', contextualMeaning: 'near' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: 'of' },
        { surface: '静かな', reading: 'しずかな', baseForm: '静か', contextualMeaning: 'quiet' },
        { surface: '通り', reading: 'とおり', baseForm: '通り', contextualMeaning: 'street' },
        { surface: 'ですよ」', reading: null, baseForm: 'です', contextualMeaning: 'it is!' },
        { surface: 'と', reading: null, baseForm: 'と', contextualMeaning: '(quote)' },
        { surface: '答えました。', reading: 'こたえました。', baseForm: '答える', contextualMeaning: 'answered' },
      ],
    },
    {
      fullSentence: '外の雨は少しずつ弱くなり、石畳の道がきれいに光っています。',
      englishTranslation: 'The rain outside grows weaker little by little, and the cobblestone road is shining brightly.',
      romanisation: 'Soto no ame wa sukoshizutsu yowaku nari, ishidatami no michi ga kirei ni hikatte imasu.',
      grammarNote: '「少しずつ」 ("sukoshizutsu") means "little by little / gradually".',
      tokens: [
        { surface: '外', reading: 'そと', baseForm: '外', contextualMeaning: 'outside' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: '’s' },
        { surface: '雨', reading: 'あめ', baseForm: '雨', contextualMeaning: 'rain' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: '少しずつ', reading: 'すこしずつ', baseForm: '少しずつ', contextualMeaning: 'little by little' },
        { surface: '弱く', reading: 'よわく', baseForm: '弱い', contextualMeaning: 'weaker / lighter' },
        { surface: 'なり、', reading: null, baseForm: 'なる', contextualMeaning: 'becomes,' },
        { surface: '石畳', reading: 'いしだたみ', baseForm: '石畳', contextualMeaning: 'cobblestone' },
        { surface: 'の', reading: null, baseForm: 'の', contextualMeaning: 'of' },
        { surface: '道', reading: 'みち', baseForm: '道', contextualMeaning: 'road / path' },
        { surface: 'が', reading: null, baseForm: 'が', contextualMeaning: '(subject)' },
        { surface: 'きれいに', reading: null, baseForm: 'きれい', contextualMeaning: 'beautifully / brightly' },
        { surface: '光って', reading: 'ひかって', baseForm: '光る', contextualMeaning: 'shining' },
        { surface: 'います。', reading: null, baseForm: 'いる', contextualMeaning: 'is' },
      ],
    },
    {
      fullSentence: '二人は温かいお茶を飲んでから、大切な時計をかばんに入れました。',
      englishTranslation: 'After the two of them drank warm tea, they put the precious watch into the bag.',
      romanisation: 'Futari wa atatakai ocha wo nonde kara, taisetsu na tokei wo kaban ni iremashita.',
      grammarNote: '「〜を…に入れました」 ("tokei wo kaban ni iremashita") means "put [object] into [place]".',
      tokens: [
        { surface: '二人', reading: 'ふたり', baseForm: '二人', contextualMeaning: 'the two of them' },
        { surface: 'は', reading: null, baseForm: 'は', contextualMeaning: '(topic)' },
        { surface: '温かい', reading: 'あたたかい', baseForm: '温かい', contextualMeaning: 'warm' },
        { surface: 'お茶', reading: 'おちゃ', baseForm: 'お茶', contextualMeaning: 'green tea' },
        { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
        { surface: '飲んでから、', reading: 'のんでから、', baseForm: '飲む', contextualMeaning: 'after drinking,' },
        { surface: '大切な', reading: 'たいせつな', baseForm: '大切', contextualMeaning: 'precious / important' },
        { surface: '時計', reading: 'とけい', baseForm: '時計', contextualMeaning: 'watch' },
        { surface: 'を', reading: null, baseForm: 'を', contextualMeaning: '(object)' },
        { surface: 'かばん', reading: null, baseForm: 'かばん', contextualMeaning: 'bag' },
        { surface: 'に', reading: null, baseForm: 'に', contextualMeaning: 'into' },
        { surface: '入れました。', reading: 'いれました。', baseForm: '入れる', contextualMeaning: 'put in' },
      ],
    },
  ],
  es: [
    {
      fullSentence: 'Elena abre de nuevo el diario antiguo sobre la mesa de madera para revisar el mapa.',
      englishTranslation: 'Elena opens the old journal again on the wooden table to check the map.',
      romanisation: null,
      grammarNote: '"De nuevo" means "again", and "para + infinitive" ("para revisar") expresses purpose ("in order to check").',
      tokens: [
        { surface: 'Elena', reading: null, baseForm: 'Elena', contextualMeaning: 'Elena' },
        { surface: 'abre', reading: null, baseForm: 'abrir', contextualMeaning: 'opens' },
        { surface: 'de', reading: null, baseForm: 'de nuevo', contextualMeaning: 'again (part 1)' },
        { surface: 'nuevo', reading: null, baseForm: 'nuevo', contextualMeaning: 'again (part 2)' },
        { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'diario', reading: null, baseForm: 'diario', contextualMeaning: 'journal' },
        { surface: 'antiguo', reading: null, baseForm: 'antiguo', contextualMeaning: 'old / ancient' },
        { surface: 'sobre', reading: null, baseForm: 'sobre', contextualMeaning: 'on' },
        { surface: 'la', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'mesa', reading: null, baseForm: 'mesa', contextualMeaning: 'table' },
        { surface: 'de', reading: null, baseForm: 'de', contextualMeaning: 'of' },
        { surface: 'madera', reading: null, baseForm: 'madera', contextualMeaning: 'wood' },
        { surface: 'para', reading: null, baseForm: 'para', contextualMeaning: 'in order to' },
        { surface: 'revisar', reading: null, baseForm: 'revisar', contextualMeaning: 'check / review' },
        { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'mapa.', reading: null, baseForm: 'mapa', contextualMeaning: 'map' },
      ],
    },
    {
      fullSentence: '« ¿Conoces bien ese sendero cerca del acantilado? » le pregunta Elena a Mateo.',
      englishTranslation: '"Do you know that path near the cliff well?" Elena asks Mateo.',
      romanisation: null,
      grammarNote: 'Use "conocer" ("¿conoces?") when asking if someone is familiar with a place or route.',
      tokens: [
        { surface: '« ¿Conoces', reading: null, baseForm: 'conocer', contextualMeaning: 'do you know' },
        { surface: 'bien', reading: null, baseForm: 'bien', contextualMeaning: 'well' },
        { surface: 'ese', reading: null, baseForm: 'ese', contextualMeaning: 'that' },
        { surface: 'sendero', reading: null, baseForm: 'sendero', contextualMeaning: 'path / trail' },
        { surface: 'cerca', reading: null, baseForm: 'cerca de', contextualMeaning: 'near' },
        { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'the' },
        { surface: 'acantilado? »', reading: null, baseForm: 'acantilado', contextualMeaning: 'cliff' },
        { surface: 'le', reading: null, baseForm: 'le', contextualMeaning: 'to him' },
        { surface: 'pregunta', reading: null, baseForm: 'preguntar', contextualMeaning: 'asks' },
        { surface: 'Elena', reading: null, baseForm: 'Elena', contextualMeaning: 'Elena' },
        { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'to' },
        { surface: 'Mateo.', reading: null, baseForm: 'Mateo', contextualMeaning: 'Mateo' },
      ],
    },
    {
      fullSentence: 'Mateo asiente con calma mientras prepara una linterna grande y dos abrigos.',
      englishTranslation: 'Mateo nods calmly while he prepares a big lantern and two coats.',
      romanisation: null,
      grammarNote: '"Mientras" ("while") connects two simultaneous actions in the present tense.',
      tokens: [
        { surface: 'Mateo', reading: null, baseForm: 'Mateo', contextualMeaning: 'Mateo' },
        { surface: 'asiente', reading: null, baseForm: 'asentir', contextualMeaning: 'nods' },
        { surface: 'con', reading: null, baseForm: 'con', contextualMeaning: 'with' },
        { surface: 'calma', reading: null, baseForm: 'calma', contextualMeaning: 'calm' },
        { surface: 'mientras', reading: null, baseForm: 'mientras', contextualMeaning: 'while' },
        { surface: 'prepara', reading: null, baseForm: 'preparar', contextualMeaning: 'prepares' },
        { surface: 'una', reading: null, baseForm: 'una', contextualMeaning: 'a' },
        { surface: 'linterna', reading: null, baseForm: 'linterna', contextualMeaning: 'lantern / torch' },
        { surface: 'grande', reading: null, baseForm: 'grande', contextualMeaning: 'big' },
        { surface: 'y', reading: null, baseForm: 'y', contextualMeaning: 'and' },
        { surface: 'dos', reading: null, baseForm: 'dos', contextualMeaning: 'two' },
        { surface: 'abrigos.', reading: null, baseForm: 'abrigo', contextualMeaning: 'coats' },
      ],
    },
    {
      fullSentence: '« Sí, caminamos por allí todas las semanas cuando bajamos hacia el puerto, » responde él.',
      englishTranslation: '"Yes, we walk that way every week when we go down toward the harbour," he replies.',
      romanisation: null,
      grammarNote: '"Todas las semanas" means "every week", and "hacia" indicates movement "toward" a destination.',
      tokens: [
        { surface: '« Sí,', reading: null, baseForm: 'sí', contextualMeaning: 'yes' },
        { surface: 'caminamos', reading: null, baseForm: 'caminar', contextualMeaning: 'we walk' },
        { surface: 'por', reading: null, baseForm: 'por', contextualMeaning: 'along / through' },
        { surface: 'allí', reading: null, baseForm: 'allí', contextualMeaning: 'there' },
        { surface: 'todas', reading: null, baseForm: 'todo', contextualMeaning: 'every / all' },
        { surface: 'las', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'semanas', reading: null, baseForm: 'semana', contextualMeaning: 'weeks' },
        { surface: 'quando', reading: null, baseForm: 'cuando', contextualMeaning: 'when' },
        { surface: 'bajamos', reading: null, baseForm: 'bajar', contextualMeaning: 'we go down' },
        { surface: 'hacia', reading: null, baseForm: 'hacia', contextualMeaning: 'toward' },
        { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'puerto, »', reading: null, baseForm: 'puerto', contextualMeaning: 'harbour' },
        { surface: 'responde', reading: null, baseForm: 'responder', contextualMeaning: 'replies' },
        { surface: 'él.', reading: null, baseForm: 'él', contextualMeaning: 'he' },
      ],
    },
    {
      fullSentence: 'Afuera, el viento del mar sopla suavemente y las gaviotas vuelan sobre el agua.',
      englishTranslation: 'Outside, the sea wind blows gently and the seagulls fly over the water.',
      romanisation: null,
      grammarNote: 'Adverbs ending in "-mente" like "suavemente" ("gently") are formed from the feminine adjective ("suave").',
      tokens: [
        { surface: 'Afuera,', reading: null, baseForm: 'afuera', contextualMeaning: 'outside' },
        { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'viento', reading: null, baseForm: 'viento', contextualMeaning: 'wind' },
        { surface: 'del', reading: null, baseForm: 'del', contextualMeaning: 'from the' },
        { surface: 'mar', reading: null, baseForm: 'mar', contextualMeaning: 'sea' },
        { surface: 'sopla', reading: null, baseForm: 'soplar', contextualMeaning: 'blows' },
        { surface: 'suavemente', reading: null, baseForm: 'suavemente', contextualMeaning: 'gently' },
        { surface: 'y', reading: null, baseForm: 'y', contextualMeaning: 'and' },
        { surface: 'las', reading: null, baseForm: 'la', contextualMeaning: 'the' },
        { surface: 'gaviotas', reading: null, baseForm: 'gaviota', contextualMeaning: 'seagulls' },
        { surface: 'vuelan', reading: null, baseForm: 'volar', contextualMeaning: 'fly' },
        { surface: 'sobre', reading: null, baseForm: 'sobre', contextualMeaning: 'over' },
        { surface: 'el', reading: null, baseForm: 'el', contextualMeaning: 'the' },
        { surface: 'agua.', reading: null, baseForm: 'agua', contextualMeaning: 'water' },
      ],
    },
  ],
  en: [
    {
      fullSentence: 'Helena opens her bag and puts the small blue notebook carefully inside.',
      englishTranslation: 'Helena abre sua bolsa e coloca o pequeno caderno azul com cuidado lá dentro.',
      romanisation: null,
      grammarNote: 'Em inglês, os adjetivos de tamanho e cor vêm antes do substantivo: "the small blue notebook" (o pequeno caderno azul).',
      tokens: [
        { surface: 'Helena', reading: null, baseForm: 'Helena', contextualMeaning: 'Helena' },
        { surface: 'opens', reading: null, baseForm: 'open', contextualMeaning: 'abre' },
        { surface: 'her', reading: null, baseForm: 'her', contextualMeaning: 'sua / dela' },
        { surface: 'bag', reading: null, baseForm: 'bag', contextualMeaning: 'bolsa' },
        { surface: 'and', reading: null, baseForm: 'and', contextualMeaning: 'e' },
        { surface: 'puts', reading: null, baseForm: 'put', contextualMeaning: 'coloca' },
        { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'o' },
        { surface: 'small', reading: null, baseForm: 'small', contextualMeaning: 'pequeno' },
        { surface: 'blue', reading: null, baseForm: 'blue', contextualMeaning: 'azul' },
        { surface: 'notebook', reading: null, baseForm: 'notebook', contextualMeaning: 'caderno' },
        { surface: 'carefully', reading: null, baseForm: 'carefully', contextualMeaning: 'com cuidado' },
        { surface: 'inside.', reading: null, baseForm: 'inside', contextualMeaning: 'lá dentro' },
      ],
    },
    {
      fullSentence: '“Would you like a biscuit with your tea, Madam?” asks Oliver with a warm smile.',
      englishTranslation: '“Você gostaria de um biscoito com o seu chá, Senhora?” pergunta Oliver com um sorriso acolhedor.',
      romanisation: null,
      grammarNote: 'No inglês britânico, usa-se a palavra "biscuit" para biscoito/bolacha doce acompanhando o chá, e "Would you like...?" para oferecer algo com educação.',
      tokens: [
        { surface: '“Would', reading: null, baseForm: 'would', contextualMeaning: '(gostaria)' },
        { surface: 'you', reading: null, baseForm: 'you', contextualMeaning: 'você' },
        { surface: 'like', reading: null, baseForm: 'like', contextualMeaning: 'gostaria de' },
        { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'um' },
        { surface: 'biscuit', reading: null, baseForm: 'biscuit', contextualMeaning: 'biscoito (UK)' },
        { surface: 'with', reading: null, baseForm: 'with', contextualMeaning: 'com' },
        { surface: 'your', reading: null, baseForm: 'your', contextualMeaning: 'o seu' },
        { surface: 'tea,', reading: null, baseForm: 'tea', contextualMeaning: 'chá' },
        { surface: 'Madam?”', reading: null, baseForm: 'madam', contextualMeaning: 'Senhora' },
        { surface: 'asks', reading: null, baseForm: 'ask', contextualMeaning: 'pergunta' },
        { surface: 'Oliver', reading: null, baseForm: 'Oliver', contextualMeaning: 'Oliver' },
        { surface: 'with', reading: null, baseForm: 'with', contextualMeaning: 'com' },
        { surface: 'a', reading: null, baseForm: 'a', contextualMeaning: 'um' },
        { surface: 'warm', reading: null, baseForm: 'warm', contextualMeaning: 'acolhedor / caloroso' },
        { surface: 'smile.', reading: null, baseForm: 'smile', contextualMeaning: 'sorriso' },
      ],
    },
    {
      fullSentence: '“Yes, please! Everything here is lovely,” says Helena.',
      englishTranslation: '“Sim, por favor! Tudo aqui é encantador,” diz Helena.',
      romanisation: null,
      grammarNote: 'No Reino Unido, "lovely" (encantador / ótimo / muito bom) é uma das palavras mais usadas no dia a dia para elogiar algo.',
      tokens: [
        { surface: '“Yes,', reading: null, baseForm: 'yes', contextualMeaning: 'sim' },
        { surface: 'please!', reading: null, baseForm: 'please', contextualMeaning: 'por favor' },
        { surface: 'Everything', reading: null, baseForm: 'everything', contextualMeaning: 'tudo' },
        { surface: 'here', reading: null, baseForm: 'here', contextualMeaning: 'aqui' },
        { surface: 'is', reading: null, baseForm: 'be', contextualMeaning: 'é' },
        { surface: 'lovely,”', reading: null, baseForm: 'lovely', contextualMeaning: 'encantador / ótimo' },
        { surface: 'says', reading: null, baseForm: 'say', contextualMeaning: 'diz' },
        { surface: 'Helena.', reading: null, baseForm: 'Helena', contextualMeaning: 'Helena' },
      ],
    },
    {
      fullSentence: 'Outside the window, people walk past the red buses on the busy London street.',
      englishTranslation: 'Do lado de fora da janela, as pessoas passam caminhando pelos ônibus vermelhos na movimentada rua de Londres.',
      romanisation: null,
      grammarNote: '"People" (as pessoas) é sempre plural em inglês, por isso o verbo não leva "-s": "people walk" (as pessoas caminham).',
      tokens: [
        { surface: 'Outside', reading: null, baseForm: 'outside', contextualMeaning: 'do lado de fora de' },
        { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
        { surface: 'window,', reading: null, baseForm: 'window', contextualMeaning: 'janela' },
        { surface: 'people', reading: null, baseForm: 'people', contextualMeaning: 'as pessoas' },
        { surface: 'walk', reading: null, baseForm: 'walk', contextualMeaning: 'caminham' },
        { surface: 'past', reading: null, baseForm: 'past', contextualMeaning: 'passando por' },
        { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'os' },
        { surface: 'red', reading: null, baseForm: 'red', contextualMeaning: 'vermelhos' },
        { surface: 'buses', reading: null, baseForm: 'bus', contextualMeaning: 'ônibus' },
        { surface: 'on', reading: null, baseForm: 'on', contextualMeaning: 'na' },
        { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'a' },
        { surface: 'busy', reading: null, baseForm: 'busy', contextualMeaning: 'movimentada' },
        { surface: 'London', reading: null, baseForm: 'London', contextualMeaning: 'de Londres' },
        { surface: 'street.', reading: null, baseForm: 'street', contextualMeaning: 'rua' },
      ],
    },
    {
      fullSentence: 'While she drinks her warm tea, Helena reads the new English words in her notebook.',
      englishTranslation: 'Enquanto ela bebe seu chá quentinho, Helena lê as novas palavras em inglês no seu caderno.',
      romanisation: null,
      grammarNote: '"While" significa "enquanto" e liga duas ações no presente: "While she drinks... Helena reads..." (Enquanto ela bebe... Helena lê...).',
      tokens: [
        { surface: 'While', reading: null, baseForm: 'while', contextualMeaning: 'enquanto' },
        { surface: 'she', reading: null, baseForm: 'she', contextualMeaning: 'ela' },
        { surface: 'drinks', reading: null, baseForm: 'drink', contextualMeaning: 'bebe' },
        { surface: 'her', reading: null, baseForm: 'her', contextualMeaning: 'seu / dela' },
        { surface: 'warm', reading: null, baseForm: 'warm', contextualMeaning: 'quentinho / morno' },
        { surface: 'tea,', reading: null, baseForm: 'tea', contextualMeaning: 'chá' },
        { surface: 'Helena', reading: null, baseForm: 'Helena', contextualMeaning: 'Helena' },
        { surface: 'reads', reading: null, baseForm: 'read', contextualMeaning: 'lê' },
        { surface: 'the', reading: null, baseForm: 'the', contextualMeaning: 'as' },
        { surface: 'new', reading: null, baseForm: 'new', contextualMeaning: 'novas' },
        { surface: 'English', reading: null, baseForm: 'English', contextualMeaning: 'em inglês' },
        { surface: 'words', reading: null, baseForm: 'word', contextualMeaning: 'palavras' },
        { surface: 'in', reading: null, baseForm: 'in', contextualMeaning: 'em / no' },
        { surface: 'her', reading: null, baseForm: 'her', contextualMeaning: 'seu / dela' },
        { surface: 'notebook.', reading: null, baseForm: 'notebook', contextualMeaning: 'caderno' },
      ],
    },
    {
      fullSentence: 'She practises each sentence quietly so she can speak with confidence.',
      englishTranslation: 'Ela pratica cada frase baixinho para poder falar com confiança.',
      romanisation: null,
      grammarNote: 'No inglês britânico, o verbo "praticar" escreve-se com "s" ("practises"), e "so she can speak" significa "para que ela possa falar".',
      tokens: [
        { surface: 'She', reading: null, baseForm: 'she', contextualMeaning: 'ela' },
        { surface: 'practises', reading: null, baseForm: 'practise', contextualMeaning: 'pratica' },
        { surface: 'each', reading: null, baseForm: 'each', contextualMeaning: 'cada' },
        { surface: 'sentence', reading: null, baseForm: 'sentence', contextualMeaning: 'frase' },
        { surface: 'quietly', reading: null, baseForm: 'quietly', contextualMeaning: 'baixinho / calmamente' },
        { surface: 'so', reading: null, baseForm: 'so', contextualMeaning: 'para que' },
        { surface: 'she', reading: null, baseForm: 'she', contextualMeaning: 'ela' },
        { surface: 'can', reading: null, baseForm: 'can', contextualMeaning: 'possa / consiga' },
        { surface: 'speak', reading: null, baseForm: 'speak', contextualMeaning: 'falar' },
        { surface: 'with', reading: null, baseForm: 'with', contextualMeaning: 'com' },
        { surface: 'confidence.', reading: null, baseForm: 'confidence', contextualMeaning: 'confiança' },
      ],
    },
  ],
};

/**
 * Creates the Standard ('maintain') or Longer Text ('challenge') version
 * of `baseChapter` offline or as a guaranteed fallback.
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
      difficultyLabel:
        profile.id === 'en'
          ? 'A1 Iniciante • Texto Padrão'
          : `${profile.cefrLevel} • Standard Text`,
    };
  }

  // level === 'challenge': Keep all original sentences AND append 5-6 same-level extension sentences
  const extras = CHALLENGE_EXTENSION_BANK[profile.id] || CHALLENGE_EXTENSION_BANK.fr;
  return {
    ...cleanBase,
    id: `${baseId}__challenge`,
    activeDifficulty: 'challenge',
    difficultyLabel:
      profile.id === 'en'
        ? 'A1 Iniciante • Texto Mais Longo'
        : `${profile.cefrLevel} • Longer Text`,
    sentences: [...cleanBase.sentences, ...structuredClone(extras)],
  };
}

/**
 * Generates or adapts the Longer Text ('challenge') or Standard ('maintain') version
 * of the CURRENT chapter (`baseChapter`) while keeping the same CEFR difficulty level.
 * Uses the built-in curated extension bank so switching between Standard and Longer Text
 * is 100% instantaneous (0ms) and reliable across all courses.
 */
export async function generateChapterDifficultyVariant({
  profile,
  baseChapter,
  level = 'maintain',
}) {
  return createOfflineDifficultyVariant(baseChapter, level, profile);
}

