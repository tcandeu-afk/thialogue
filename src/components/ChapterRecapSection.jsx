import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Puzzle,
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Award,
  Headphones,
  Languages,
  ListOrdered,
  Shuffle,
  MessageSquare,
  Scale,
  Eye,
  EyeOff,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { isProperNounOrNonLexicalToken } from '../services/storageService';
import { speakSingleWord } from '../services/audioService';

/**
 * Curated Adult SLA Transfer & Recombination Bank (540 unique exercises across 6 languages x 3 chapters).
 * Grounded in:
 *  1. Gianfranco Conti's EPI (Extensive Processing Instruction / MARSEARS) — Recombining story chunks in new contexts
 *  2. Bill VanPatten's Input Processing (IP) — Eliminating proper-noun/surface cues & using minimal-pair distractors
 *  3. Paul Nation's Four Strands — Meaning-focused input/output, form-focused instruction, and fluency
 *  4. Robert Bjork's Desirable Difficulties & Variability of Practice — 5 distinct cognitive modalities with zero verbatim sentence repetition
 */
const COURSE_RECAP_BANK = {
  "fr": {
    "1": {
      "subtitle": "Impersonal Weather, Prepositions of Place, Direct Question Frames & Immediate Promises",
      "vocabReuses": [
        {
          "word": "sous (under)",
          "storyContext": "« Regarde sous ta tasse ! »",
          "newPhrase": "J’ai trouvé mon passeport sous le journal ce matin.",
          "english": "I found my passport under the newspaper this morning."
        },
        {
          "word": "chercher (to look for)",
          "storyContext": "« Qu’est-ce qu’il cherche ? »",
          "newPhrase": "Nous cherchons une petite table calme près de la fenêtre.",
          "english": "We are looking for a quiet little table near the window."
        },
        {
          "word": "à voix basse (in a low voice)",
          "storyContext": "Le jeune serveur regarde autour de lui à voix basse.",
          "newPhrase": "Les voyageurs parlent à voix basse dans le train du matin.",
          "english": "The travelers speak in a low voice on the morning train."
        }
      ],
      "construction": {
        "patternName": "Spoken Question Frame: Qu’est-ce que + [Subject] + [Verb] ?",
        "formula": [
          "Qu’est-ce que / qu’",
          "+ Subject Pronoun",
          "+ Present Verb",
          "?"
        ],
        "explanation": "In everyday spoken French, instead of inverting the verb and pronoun, place « Qu’est-ce que » ('What is it that...') right before a normal subject + verb statement. Note that « que » contracts to « qu’ » before a vowel (il, elle, on).",
        "examples": [
          {
            "target": "Qu’est-ce que tu cherches dans ton sac ?",
            "english": "What are you looking for in your bag?",
            "highlight": "Qu’est-ce que tu cherches"
          },
          {
            "target": "Qu’est-ce qu’il prend avec son café ?",
            "english": "What is he having with his coffee?",
            "highlight": "Qu’est-ce qu’il prend"
          },
          {
            "target": "Qu’est-ce que nous faisons avant midi ?",
            "english": "What are we doing before noon?",
            "highlight": "Qu’est-ce que nous faisons"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "I left my house keys under the blue notebook.",
            "sentenceParts": [
              "J’ai laissé mes clés ",
              " le carnet bleu."
            ],
            "correctAnswer": "sous",
            "options": [
              "sous",
              "sans",
              "chez",
              "depuis"
            ],
            "explanation": "« Sous » means 'under / underneath', whereas « sans » means 'without' and « chez » means 'at the home of'."
          },
          {
            "promptEnglish": "It is raining hard this morning, so I am taking my umbrella.",
            "sentenceParts": [
              "Il ",
              " fort ce matin, alors je prends mon parapluie."
            ],
            "correctAnswer": "pleut",
            "options": [
              "pleut",
              "ouvre",
              "marche",
              "parle"
            ],
            "explanation": "« Il pleut » is the impersonal French expression for 'It is raining' (from pleuvoir)."
          },
          {
            "promptEnglish": "We always sit near the window when we drink coffee.",
            "sentenceParts": [
              "Nous nous asseyons toujours ",
              " la fenêtre quand nous buvons un café."
            ],
            "correctAnswer": "près de",
            "options": [
              "près de",
              "autour de",
              "avant de",
              "hors de"
            ],
            "explanation": "« Près de » means 'near / close to'."
          },
          {
            "promptEnglish": "Wait for me five minutes at the entrance of the station!",
            "sentenceParts": [
              "« ",
              " cinq minutes à l’entrée de la gare ! »"
            ],
            "correctAnswer": "Attends-moi",
            "options": [
              "Attends-moi",
              "Attendez-vous",
              "Attendons-le",
              "Attendre-moi"
            ],
            "explanation": "In affirmative imperatives, the object pronoun « moi » attaches after the verb with a hyphen: « Attends-moi ! »."
          },
          {
            "promptEnglish": "You must arrive at the restaurant before noon.",
            "sentenceParts": [
              "Vous devez arriver au restaurant ",
              " midi."
            ],
            "correctAnswer": "avant",
            "options": [
              "avant",
              "contre",
              "malgré",
              "selon"
            ],
            "explanation": "« Avant » + time expression means 'before' (avant midi = before noon)."
          },
          {
            "promptEnglish": "My friend puts her laptop into her bag with care.",
            "sentenceParts": [
              "Mon amie met son ordinateur dans son sac ",
              " soin."
            ],
            "correctAnswer": "avec",
            "options": [
              "avec",
              "pour",
              "entre",
              "vers"
            ],
            "explanation": "« Avec soin » means 'with care / carefully'."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Serveur : « Bonjour ! Il pleut beaucoup dehors. Où préférez-vous vous asseoir ? »",
            "speakerAEnglish": "Waiter: 'Hello! It is raining a lot outside. Where do you prefer to sit?'",
            "promptEnglish": "Tell the waiter you would like a small table near the window:",
            "correctAnswer": "Je voudrais une petite table près de la fenêtre, s’il vous plaît.",
            "options": [
              "Je voudrais une petite table près de la fenêtre, s’il vous plaît.",
              "Je cherche mon parapluie sous le comptoir depuis hier.",
              "Nous avons déjà fermé toutes les portes du restaurant.",
              "Il a oublié son manteau gris dans le train de midi."
            ],
            "explanation": "« Une petite table près de la fenêtre » directly answers the waiter's seating question using the chapter's spatial preposition « près de »."
          },
          {
            "speakerA": "Ami : « Tu regardes partout sous les coussins. Qu’est-ce que tu cherches ? »",
            "speakerAEnglish": "Friend: 'You are looking everywhere under the cushions. What are you looking for?'",
            "promptEnglish": "Reply that you are looking for the little golden key to your office:",
            "correctAnswer": "Je cherche la petite clé dorée de mon bureau.",
            "options": [
              "Je cherche la petite clé dorée de mon bureau.",
              "Tu cherches un café chaud avant de partir travailler.",
              "Ils cherchent la sortie de la gare centrale.",
              "Nous prenons le bus sous la pluie battante."
            ],
            "explanation": "When asked « Qu’est-ce que tu cherches ? », answer in the 1st person singular: « Je cherche... » (French « chercher » already includes 'for')."
          },
          {
            "speakerA": "Collègue : « Je vais chercher un café au bout de la rue. Tu restes ici ? »",
            "speakerAEnglish": "Colleague: 'I’m going to get a coffee down the street. Are you staying here?'",
            "promptEnglish": "Tell your colleague to wait two minutes because you are coming with them:",
            "correctAnswer": "Attends-moi deux minutes, je viens avec toi !",
            "options": [
              "Attends-moi deux minutes, je viens avec toi !",
              "Regarde sous ta tasse avant de boire ton thé !",
              "Il parle toujours à voix basse dans la bibliothèque.",
              "Elle est déjà partie sans son parapluie ce matin."
            ],
            "explanation": "« Attends-moi deux minutes, je viens avec toi ! » is the natural everyday way to join someone who is heading out."
          },
          {
            "speakerA": "Voyageur : « Excusez-moi, à quelle heure devons-nous être devant l’hôtel ? »",
            "speakerAEnglish": "Traveler: 'Excuse me, what time must we be in front of the hotel?'",
            "promptEnglish": "Reply politely: 'Come before noon so we don't miss the bus.'",
            "correctAnswer": "Venez avant midi pour ne pas manquer le bus.",
            "options": [
              "Venez avant midi pour ne pas manquer le bus.",
              "Allez derrière la fenêtre après minuit.",
              "Sortez sans votre manteau sous la pluie.",
              "Lisez ce carnet rouge pendant le dîner."
            ],
            "explanation": "« Venez avant midi » uses the polite imperative « Venez » + « avant midi » ('before noon')."
          },
          {
            "speakerA": "Bibliothécaire : « Chut ! Les étudiants travaillent dans cette salle. »",
            "speakerAEnglish": "Librarian: 'Shh! Students are working in this room.'",
            "promptEnglish": "Apologize and say you will speak in a low voice:",
            "correctAnswer": "Pardon, nous allons parler à voix basse.",
            "options": [
              "Pardon, nous allons parler à voix basse.",
              "Merci, nous allons courir sous la pluie.",
              "Bien sûr, je vais ouvrir toutes les fenêtres.",
              "D’accord, il a laissé une note sous la tasse."
            ],
            "explanation": "« Parler à voix basse » means 'to speak in a low voice / whisper'."
          },
          {
            "speakerA": "Serveuse : « Un monsieur a laissé cette enveloppe sur votre table avant de sortir. »",
            "speakerAEnglish": "Waitress: 'A gentleman left this envelope on your table before going out.'",
            "promptEnglish": "Ask her: 'Did he leave a message inside?'",
            "correctAnswer": "Est-ce qu’il a laissé un message à l’intérieur ?",
            "options": [
              "Est-ce qu’il a laissé un message à l’intérieur ?",
              "Pourquoi est-ce que tu fermes la porte à clé ?",
              "Combien coûte ce parapluie noir près de l’entrée ?",
              "Où achetez-vous vos croissants chaque matin ?"
            ],
            "explanation": "« Est-ce qu’il a laissé... ? » is the standard spoken French yes/no question structure."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Le serveur apporte deux cafés chauds et parle à voix basse près du comptoir.",
            "correctAnswer": "The waiter brings two hot coffees and speaks in a low voice near the counter.",
            "options": [
              "The waiter brings two hot coffees and speaks in a low voice near the counter.",
              "The waiter looks for two cold cups and calls out loudly behind the counter.",
              "The waiter forgets the hot tea and leaves the café before noon.",
              "The waiter puts two red notebooks under the counter without saying a word."
            ],
            "explanation": "Listen for « apporte deux cafés chauds » (brings two hot coffees) and « parle à voix basse près du comptoir » (speaks in a low voice near the counter)."
          },
          {
            "audioSentence": "Je range mes clés et mon carnet dans mon sac avant de sortir sous la pluie.",
            "correctAnswer": "I put my keys and my notebook away in my bag before going out in the rain.",
            "options": [
              "I put my keys and my notebook away in my bag before going out in the rain.",
              "I found my keys and my umbrella under the table after coming in from the rain.",
              "I left my bag and my coat on the chair near the window this morning.",
              "I am looking for my phone and my ticket inside my coat pocket right now."
            ],
            "explanation": "« Je range... dans mon sac avant de sortir sous la pluie » = I put away... in my bag before going out in the rain."
          },
          {
            "audioSentence": "Qu’est-ce que cet homme au manteau gris cherche autour de notre table ?",
            "correctAnswer": "What is that man in the grey coat looking for around our table?",
            "options": [
              "What is that man in the grey coat looking for around our table?",
              "Why is that man in the grey coat waiting behind the restaurant door?",
              "Where did that man in the grey coat buy his black umbrella this morning?",
              "When is that man in the grey coat leaving for the train station?"
            ],
            "explanation": "« Qu’est-ce que... cherche autour de notre table ? » asks 'What is... looking for around our table?'."
          },
          {
            "audioSentence": "Attends-moi près de la porte, je prends mon parapluie et j’arrive tout de suite.",
            "correctAnswer": "Wait for me near the door; I’m taking my umbrella and I’ll be right there.",
            "options": [
              "Wait for me near the door; I’m taking my umbrella and I’ll be right there.",
              "Wait for me inside the café; I’m finishing my coffee and reading the note.",
              "Meet me behind the station; I’m buying two tickets before noon.",
              "Look for me near the window; I’m wearing a grey coat and holding a book."
            ],
            "explanation": "« Attends-moi près de la porte, je prends mon parapluie... » = Wait for me near the door, I'm taking my umbrella."
          },
          {
            "audioSentence": "Regarde sous ton assiette, quelqu’un a écrit une adresse sur un papier rouge.",
            "correctAnswer": "Look under your plate; someone wrote an address on a red piece of paper.",
            "options": [
              "Look under your plate; someone wrote an address on a red piece of paper.",
              "Look inside your cup; someone left a golden key beside the spoon.",
              "Look behind your chair; someone dropped a leather wallet on the floor.",
              "Look near the window; someone is reading a red newspaper in the rain."
            ],
            "explanation": "« Regarde sous ton assiette » = Look under your plate; « une adresse sur un papier rouge » = an address on a red paper."
          },
          {
            "audioSentence": "Il pleut trop fort ce matin pour marcher sans parapluie jusqu’au bureau.",
            "correctAnswer": "It is raining too hard this morning to walk to the office without an umbrella.",
            "options": [
              "It is raining too hard this morning to walk to the office without an umbrella.",
              "It is snowing too much tonight to drive to the station without a coat.",
              "It is too late this morning to have a hot coffee before our meeting.",
              "It is too noisy in this café to read the letter in a low voice."
            ],
            "explanation": "« Il pleut trop fort ce matin pour marcher sans parapluie » = It is raining too hard this morning to walk without an umbrella."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "Choose the natural French way to ask: 'What is he looking for in this café?'",
            "correctAnswer": "Qu’est-ce qu’il cherche dans ce café ?",
            "options": [
              "Qu’est-ce qu’il cherche dans ce café ?",
              "Qu’est-ce que il cherche pour dans ce café ?",
              "Qu’est-ce qui il cherche dans ce café ?",
              "Que est-ce qu’il cherche à ce café ?"
            ],
            "explanation": "In French, 1) « que » elides to « qu’ » before « il », and 2) « chercher » already means 'to look for', so you never add « pour » after it!"
          },
          {
            "promptEnglish": "How do you say in French: 'Wait for me two minutes, I am coming with you!'?",
            "correctAnswer": "Attends-moi deux minutes, je viens avec toi !",
            "options": [
              "Attends-moi deux minutes, je viens avec toi !",
              "Attends pour moi deux minutes, je viens avec tu !",
              "Me attends deux minutes, je suis venir avec toi !",
              "Attends-je deux minutes, je viens chez toi !"
            ],
            "explanation": "« Attendre » includes 'for' (no 'pour'!), positive imperatives attach « -moi » after the verb, and after the preposition « avec » you must use the stressed pronoun « toi » (never « tu »)."
          },
          {
            "promptEnglish": "Select the grammatically correct sentence for: 'It is raining hard over the city this morning.'",
            "correctAnswer": "Il pleut fort sur la ville ce matin.",
            "options": [
              "Il pleut fort sur la ville ce matin.",
              "C’est pleuvant fort sur la ville ce matin.",
              "Il est pluie fort dans la ville ce matin.",
              "Elle pleut forte sur la ville ce matin."
            ],
            "explanation": "Weather verbs in French use the impersonal subject « Il » + simple present verb « pleut » (French does not have an 'is -ing' progressive tense)."
          },
          {
            "promptEnglish": "Which sentence correctly expresses: 'Look under your cup before leaving!'?",
            "correctAnswer": "Regarde sous ta tasse avant de partir !",
            "options": [
              "Regarde sous ta tasse avant de partir !",
              "Regardes sous ta tasse avant partir !",
              "Regarde sur ta tasse avant que partir !",
              "Regardez sous ta tasse devant de partir !"
            ],
            "explanation": "1) Regular -er verbs drop the final '-s' in the « tu » imperative (« Regarde »), and 2) 'before doing' is always « avant de + infinitive »."
          },
          {
            "promptEnglish": "How do you say: 'The waiter looks around him and speaks in a low voice'?",
            "correctAnswer": "Le serveur regarde autour de lui et parle à voix basse.",
            "options": [
              "Le serveur regarde autour de lui et parle à voix basse.",
              "Le serveur regarde autour d’il et parle en voix basse.",
              "Le serveur regarde autour lui et parle avec basse voix.",
              "Le serveur regarde sur de lui et parle à bas voix."
            ],
            "explanation": "After the prepositional phrase « autour de » ('around'), use the stressed pronoun « lui » (never « il »), and 'in a low voice' is the fixed expression « à voix basse »."
          },
          {
            "promptEnglish": "Choose the accurate translation for: 'We are looking for a quiet table near the window.'",
            "correctAnswer": "Nous cherchons une table calme près de la fenêtre.",
            "options": [
              "Nous cherchons une table calme près de la fenêtre.",
              "Nous cherchons pour une table calme près la fenêtre.",
              "Nous sommes cherchant une calme table proche la fenêtre.",
              "Nous cherchent une table calme à côté la fenêtre."
            ],
            "explanation": "1) « Chercher » takes a direct object without « pour », 2) descriptive adjectives like « calme » follow the noun, and 3) « près de » requires « de » before « la fenêtre »."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "I am looking for my keys under the newspaper this morning.",
            "chunks": [
              "je cherche",
              "mes clés",
              "sous le journal",
              "ce matin"
            ],
            "explanation": "Natural French order: Subject + Verb (« je cherche ») + Direct Object (« mes clés ») + Place (« sous le journal ») + Time (« ce matin »)."
          },
          {
            "promptEnglish": "Wait for me near the door, I am taking my umbrella.",
            "chunks": [
              "attends-moi",
              "près de la porte,",
              "je prends",
              "mon parapluie"
            ],
            "explanation": "Imperative clause (« attends-moi près de la porte ») followed by the coordinated main clause (« je prends mon parapluie »)."
          },
          {
            "promptEnglish": "What are you looking for inside your bag right now?",
            "chunks": [
              "qu’est-ce que",
              "tu cherches",
              "dans ton sac",
              "en ce moment ?"
            ],
            "explanation": "Question frame « qu’est-ce que » + subject & verb « tu cherches » + location « dans ton sac » + time « en ce moment ? »."
          },
          {
            "promptEnglish": "The waiter brings a hot coffee and speaks in a low voice.",
            "chunks": [
              "le serveur",
              "apporte",
              "un café chaud",
              "et parle à voix basse"
            ],
            "explanation": "Subject (« le serveur ») + verb + object (« apporte un café chaud ») + coordinated verb phrase (« et parle à voix basse »)."
          },
          {
            "promptEnglish": "Come before noon to the small bookshop near the station.",
            "chunks": [
              "venez",
              "avant midi",
              "à la petite librairie",
              "près de la gare"
            ],
            "explanation": "Polite command (« venez ») + time (« avant midi ») + destination (« à la petite librairie près de la gare »)."
          },
          {
            "promptEnglish": "It is raining hard outside when we enter the restaurant.",
            "chunks": [
              "il pleut fort",
              "dehors",
              "quand nous entrons",
              "dans le restaurant"
            ],
            "explanation": "Weather clause (« il pleut fort dehors ») + temporal conjunction (« quand nous entrons ») + place (« dans le restaurant »)."
          }
        ]
      }
    },
    "2": {
      "subtitle": "Accompaniment, Spatial Prepositions ('derrière'), Ongoing Duration ('depuis') & Polite Invitations",
      "vocabReuses": [
        {
          "word": "derrière (behind)",
          "storyContext": "Derrière une vieille porte rouge, ils trouvent une librairie.",
          "newPhrase": "Il y a un petit jardin très calme derrière la bibliothèque.",
          "english": "There is a very quiet little garden behind the library."
        },
        {
          "word": "depuis (since / for [ongoing])",
          "storyContext": "« J’attendais votre visite depuis longtemps. »",
          "newPhrase": "Nous habitons dans ce quartier tranquille depuis trois ans.",
          "english": "We have been living in this quiet neighborhood for three years."
        },
        {
          "word": "ensemble (together)",
          "storyContext": "Ensemble, ils marchent vite vers le quartier.",
          "newPhrase": "Prenons le métro ensemble pour aller au musée ce soir.",
          "english": "Let’s take the metro together to go to the museum tonight."
        }
      ],
      "construction": {
        "patternName": "Ongoing Action from the Past: [Present / Imperfect Verb] + depuis + [Duration]",
        "formula": [
          "J’attends / J’attendais",
          "+ depuis",
          "+ Time Period (longtemps / deux heures)"
        ],
        "explanation": "To express something you 'have been doing' (present) or 'had been doing' (past) for a period of time, French uses the simple present or imperfect tense + « depuis » ('for / since'). Never translate English 'have been waiting' with a past participle!",
        "examples": [
          {
            "target": "J’attends ton appel depuis ce matin.",
            "english": "I have been waiting for your call since this morning.",
            "highlight": "J’attends ... depuis"
          },
          {
            "target": "Nous cherchons cette rue depuis vingt minutes.",
            "english": "We have been looking for this street for twenty minutes.",
            "highlight": "Nous cherchons ... depuis"
          },
          {
            "target": "Il travaillait dans cette librairie depuis longtemps.",
            "english": "He had been working in this bookshop for a long time.",
            "highlight": "travaillait ... depuis longtemps"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "I take off my wet coat as soon as I enter the house.",
            "sentenceParts": [
              "J’",
              " mon manteau mouillé dès que j’entre dans la maison."
            ],
            "correctAnswer": "enlève",
            "options": [
              "enlève",
              "ajuste",
              "invite",
              "écoute"
            ],
            "explanation": "« Enlever » means 'to take off / remove' an item of clothing (un manteau, un tablier, des chaussures)."
          },
          {
            "promptEnglish": "You are not going there alone in this rain!",
            "sentenceParts": [
              "« Tu n’y vas pas ",
              " sous cette pluie ! »"
            ],
            "correctAnswer": "seule",
            "options": [
              "seule",
              "pleine",
              "ronde",
              "ancienne"
            ],
            "explanation": "« Seul / seule » means 'alone / by oneself'."
          },
          {
            "promptEnglish": "Together, we walk quickly toward the metro station.",
            "sentenceParts": [
              "Ensemble, nous marchons vite ",
              " la station de métro."
            ],
            "correctAnswer": "vers",
            "options": [
              "vers",
              "depuis",
              "contre",
              "parmi"
            ],
            "explanation": "« Vers » indicates movement 'toward / in the direction of' a place."
          },
          {
            "promptEnglish": "Behind the wooden bookshelves, there is a narrow staircase.",
            "sentenceParts": [
              "",
              " les étagères en bois, il y a un escalier étroit."
            ],
            "correctAnswer": "Derrière",
            "options": [
              "Derrière",
              "Depuis",
              "Pendant",
              "Malgré"
            ],
            "explanation": "« Derrière » means 'behind'."
          },
          {
            "promptEnglish": "I have been waiting for the bus for fifteen minutes.",
            "sentenceParts": [
              "J’attends le bus ",
              " quinze minutes."
            ],
            "correctAnswer": "depuis",
            "options": [
              "depuis",
              "avant",
              "vers",
              "chez"
            ],
            "explanation": "Present tense + « depuis » expresses an action that started in the past and is still continuing now."
          },
          {
            "promptEnglish": "He invites his friends to go up to the second floor.",
            "sentenceParts": [
              "Il invite ses amis ",
              " monter au deuxième étage."
            ],
            "correctAnswer": "à",
            "options": [
              "à",
              "de",
              "sur",
              "en"
            ],
            "explanation": "« Inviter quelqu’un à + infinitive » is the required preposition pattern for 'invite someone to do something'."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Ami : « Il fait nuit et il pleut très fort. Je vais rentrer à pied. »",
            "speakerAEnglish": "Friend: 'It is dark and raining very hard. I'm going to walk home.'",
            "promptEnglish": "Tell your friend firmly that they are not going alone and you are coming with them:",
            "correctAnswer": "Tu n’y vas pas seul sous cette pluie, je viens avec toi !",
            "options": [
              "Tu n’y vas pas seul sous cette pluie, je viens avec toi !",
              "J’ai acheté ces lunettes rondes dans une boutique ancienne.",
              "Le libraire a fermé la porte rouge hier après-midi.",
              "Mon tablier est resté derrière le comptoir de la cuisine."
            ],
            "explanation": "« Tu n’y vas pas seul(e)... je viens avec toi ! » uses the pronoun « y » ('there') and expresses solidarity."
          },
          {
            "speakerA": "Client : « Excusez-moi, où se trouve la section des livres d’histoire ? »",
            "speakerAEnglish": "Customer: 'Excuse me, where is the history books section?'",
            "promptEnglish": "Tell the customer it is upstairs, up the wooden staircase behind the bookshelves:",
            "correctAnswer": "Elle se trouve en haut du petit escalier en bois, derrière les étagères.",
            "options": [
              "Elle se trouve en haut du petit escalier en bois, derrière les étagères.",
              "Nous cherchons le numéro quatorze sous la pluie depuis midi.",
              "J’enlève mon manteau mouillé près de la fenêtre du salon.",
              "Vous avez trouvé cette clé dorée sur la table du café."
            ],
            "explanation": "Combines « escalier en bois » (wooden staircase) and « derrière les étagères » (behind the bookshelves)."
          },
          {
            "speakerA": "Voyageuse : « Pardon monsieur, est-ce que le train de Lyon est déjà passé ? »",
            "speakerAEnglish": "Traveler: 'Excuse me sir, has the train from Lyon already passed?'",
            "promptEnglish": "Reply that no, you have also been waiting for it for a long time:",
            "correctAnswer": "Non, je l’attends aussi depuis longtemps sur ce quai.",
            "options": [
              "Non, je l’attends aussi depuis longtemps sur ce quai.",
              "Oui, nous marchons vite vers la vieille porte rouge.",
              "Non, il ajuste ses lunettes rondes avant de lire.",
              "Oui, la salle est pleine de livres anciens et rares."
            ],
            "explanation": "« Je l’attends depuis longtemps » uses the present tense + « depuis longtemps » for 'I have been waiting for it for a long time'."
          },
          {
            "speakerA": "Hôte : « Entrez donc ! Vous êtes tout mouillés par l’orage ! »",
            "speakerAEnglish": "Host: 'Do come in! You are all wet from the storm!'",
            "promptEnglish": "Thank the host and say where you will put your black umbrella:",
            "correctAnswer": "Merci beaucoup, je pose mon parapluie noir près de la porte.",
            "options": [
              "Merci beaucoup, je pose mon parapluie noir près de la porte.",
              "De rien, je cherche une librairie silencieuse dans la rue.",
              "Pardon, nous montons l’escalier en bois sans parler.",
              "Bien sûr, j’observe cette vieille clé avec émotion."
            ],
            "explanation": "« Je pose mon parapluie noir près de la porte » is a natural polite guest response."
          },
          {
            "speakerA": "Passant : « Vous avez l’air pressés tous les deux ! Où allez-vous comme ça ? »",
            "speakerAEnglish": "Passerby: 'You two look in a hurry! Where are you going like that?'",
            "promptEnglish": "Explain that together you are walking quickly toward the old district to find a bookshop:",
            "correctAnswer": "Ensemble, nous marchons vite vers le vieux quartier pour trouver une librairie.",
            "options": [
              "Ensemble, nous marchons vite vers le vieux quartier pour trouver une librairie.",
              "Seul, je regarde la pluie tomber derrière la fenêtre du bureau.",
              "Hier, ils ont vendu toutes les étagères en bois du magasin.",
              "Demain, tu enlèveras ton tablier avant de fermer le café."
            ],
            "explanation": "Recombines « Ensemble, nous marchons vite vers... » with a purpose clause « pour + infinitive »."
          },
          {
            "speakerA": "Ami : « Que fait ce monsieur derrière son bureau ? »",
            "speakerAEnglish": "Friend: 'What is that gentleman doing behind his desk?'",
            "promptEnglish": "Say that he is adjusting his round glasses to examine an antique book:",
            "correctAnswer": "Il ajuste ses lunettes rondes pour examiner un livre ancien.",
            "options": [
              "Il ajuste ses lunettes rondes pour examiner un livre ancien.",
              "Il court sous la pluie battante sans son manteau.",
              "Il ferme la porte principale de la gare centrale.",
              "Il commande deux cafés chauds près de la fenêtre."
            ],
            "explanation": "Uses « ajuster ses lunettes rondes » (adjust his round glasses) and « un livre ancien » (an antique book)."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Derrière cette porte en bois se trouve une salle silencieuse pleine de livres anciens.",
            "correctAnswer": "Behind this wooden door is a quiet room full of antique books.",
            "options": [
              "Behind this wooden door is a quiet room full of antique books.",
              "In front of this wooden door is a noisy street full of small cafés.",
              "Above this wooden staircase is a bright office full of modern paintings.",
              "Under this wooden counter is a locked box full of old letters."
            ],
            "explanation": "« Derrière cette porte en bois » = Behind this wooden door; « une salle silencieuse pleine de livres anciens » = a quiet room full of antique books."
          },
          {
            "audioSentence": "Nous attendons l’ouverture de la librairie sous notre parapluie depuis vingt minutes.",
            "correctAnswer": "We have been waiting for the bookshop to open under our umbrella for twenty minutes.",
            "options": [
              "We have been waiting for the bookshop to open under our umbrella for twenty minutes.",
              "We walked toward the bookshop without our umbrella twenty minutes ago.",
              "We are going to leave the bookshop with our umbrella in twenty minutes.",
              "We looked for the bookshop behind the station for two hours yesterday."
            ],
            "explanation": "Present tense « Nous attendons » + « depuis vingt minutes » = We have been waiting for twenty minutes."
          },
          {
            "audioSentence": "Le libraire ajuste ses lunettes rondes et nous invite à monter l’escalier.",
            "correctAnswer": "The bookseller adjusts his round glasses and invites us to go up the stairs.",
            "options": [
              "The bookseller adjusts his round glasses and invites us to go up the stairs.",
              "The bookseller takes off his round glasses and asks us to wait near the door.",
              "The bookseller looks for his round glasses behind the wooden bookshelves.",
              "The bookseller cleans his round glasses and closes the shop for the night."
            ],
            "explanation": "« Ajuste ses lunettes rondes » = adjusts his round glasses; « nous invite à monter l’escalier » = invites us to go up the stairs."
          },
          {
            "audioSentence": "Tu n’y vas pas toute seule par ce mauvais temps, je marche avec toi jusqu’au métro.",
            "correctAnswer": "You are not going there all alone in this bad weather; I’m walking with you to the metro.",
            "options": [
              "You are not going there all alone in this bad weather; I’m walking with you to the metro.",
              "You should go there alone before the storm; I’m staying here at the café.",
              "You cannot find that street alone at night; take a taxi in front of the station.",
              "You are walking too fast in this rain; wait for me under the porch."
            ],
            "explanation": "« Tu n’y vas pas toute seule... je marche avec toi » = You're not going there alone... I'm walking with you."
          },
          {
            "audioSentence": "J’enlève mon manteau mouillé et je le pose sur une chaise près de l’entrée.",
            "correctAnswer": "I take off my wet coat and place it on a chair near the entrance.",
            "options": [
              "I take off my wet coat and place it on a chair near the entrance.",
              "I put on my warm coat and take my umbrella near the entrance.",
              "I forgot my wet umbrella and left it behind the entrance door.",
              "I am looking for my grey coat on the shelves near the entrance."
            ],
            "explanation": "« J’enlève mon manteau mouillé » = I take off my wet coat."
          },
          {
            "audioSentence": "Nous avons trouvé cette petite clé ancienne sur le trottoir devant votre boutique.",
            "correctAnswer": "We found this small antique key on the sidewalk in front of your shop.",
            "options": [
              "We found this small antique key on the sidewalk in front of your shop.",
              "We lost our small golden key on the stairs behind your shop.",
              "We are looking for a small antique box on the shelves inside your shop.",
              "We bought this old book yesterday morning in a shop across the street."
            ],
            "explanation": "« Nous avons trouvé cette petite clé ancienne » = We found this small antique key; « devant votre boutique » = in front of your shop."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in French: 'I have been waiting for your visit for a long time'?",
            "correctAnswer": "J’attends votre visite depuis longtemps.",
            "options": [
              "J’attends votre visite depuis longtemps.",
              "J’ai été attendant votre visite pour longtemps.",
              "Je suis attendu votre visite pendant longtemps.",
              "J’attends pour votre visite depuis long temps."
            ],
            "explanation": "Ongoing actions that started in the past and continue in the present use the simple present tense (« J’attends ») + « depuis longtemps »."
          },
          {
            "promptEnglish": "Choose the correct French sentence for: 'He invites us to climb a small wooden staircase.'",
            "correctAnswer": "Il nous invite à monter un petit escalier en bois.",
            "options": [
              "Il nous invite à monter un petit escalier en bois.",
              "Il invite nous de monter un petit bois escalier.",
              "Il nous invite pour monter un escalier de bois petit.",
              "Il invite à nous monter un petit escalier en bois."
            ],
            "explanation": "1) Object pronouns (« nous ») go before the verb, 2) « inviter » takes « à + infinitive », and 3) material is expressed with « en + noun » (« en bois »)."
          },
          {
            "promptEnglish": "How do you express: 'You are not going there alone!'?",
            "correctAnswer": "Tu n’y vas pas seule !",
            "options": [
              "Tu n’y vas pas seule !",
              "Tu ne vas pas là-bas seul pas !",
              "Tu y ne vas pas seule !",
              "Tu ne vas y pas toute seule !"
            ],
            "explanation": "The pronoun « y » ('there') goes directly before the conjugated verb « vas », and « ne ... pas » wraps around the pronoun + verb block: « n’y vas pas »."
          },
          {
            "promptEnglish": "Select the correct translation for: 'a quiet bookshop full of antique books'",
            "correctAnswer": "une librairie silencieuse pleine de livres anciens",
            "options": [
              "une librairie silencieuse pleine de livres anciens",
              "une bibliothèque silencieuse pleine des anciens livres",
              "un magasin de livres silencieux plein avec livres anciens",
              "une librairie silencieux plein de livres vieux"
            ],
            "explanation": "Notice the false friend: « une librairie » is a bookshop (whereas « une bibliothèque » is a library/bookshelf). Also, « pleine de » ('full of') takes « de » without an article before plural nouns."
          },
          {
            "promptEnglish": "Which sentence correctly uses the passé composé for: 'We found this golden key this morning'?",
            "correctAnswer": "Nous avons trouvé cette clé dorée ce matin.",
            "options": [
              "Nous avons trouvé cette clé dorée ce matin.",
              "Nous sommes trouvés cette dorée clé ce matin.",
              "Nous avons trouver ce clé doré ce matin.",
              "Nous trouvions cette clé d’or hier matin."
            ],
            "explanation": "« Trouver » forms the passé composé with the auxiliary « avoir » + past participle « trouvé », and « clé » is feminine (« cette clé dorée »)."
          },
          {
            "promptEnglish": "How do you say: 'Together, they walk quickly toward the old district'?",
            "correctAnswer": "Ensemble, ils marchent vite vers le vieux quartier.",
            "options": [
              "Ensemble, ils marchent vite vers le vieux quartier.",
              "Ensembles, ils marchent vitement à le quartier vieux.",
              "Ensemble, ils sont marchant vite envers le vieil quartier.",
              "Ensemble, ils marche rapide vers le quartier ancien."
            ],
            "explanation": "« Ensemble » and « vite » are invariable adverbs (never add '-s' or '-ment' to « vite »!), and « vers » means 'toward'."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "I have been waiting for your call for a long time.",
            "chunks": [
              "j’attends",
              "votre appel",
              "depuis",
              "longtemps"
            ],
            "explanation": "Subject + Verb (« j’attends ») + Object (« votre appel ») + Duration marker (« depuis longtemps »)."
          },
          {
            "promptEnglish": "Together, we walk quickly toward the quiet bookshop.",
            "chunks": [
              "ensemble,",
              "nous marchons vite",
              "vers",
              "la librairie silencieuse"
            ],
            "explanation": "Adverb (« ensemble ») + Subject & Verb (« nous marchons vite ») + Preposition + Destination (« vers la librairie silencieuse »)."
          },
          {
            "promptEnglish": "Behind the red door, they find a wooden staircase.",
            "chunks": [
              "derrière",
              "la porte rouge,",
              "ils trouvent",
              "un escalier en bois"
            ],
            "explanation": "Prepositional phrase of place (« derrière la porte rouge ») + Subject & Verb (« ils trouvent ») + Object (« un escalier en bois »)."
          },
          {
            "promptEnglish": "He takes off his wet coat near the entrance.",
            "chunks": [
              "il enlève",
              "son manteau mouillé",
              "près de",
              "l’entrée"
            ],
            "explanation": "Subject + Verb (« il enlève ») + Object (« son manteau mouillé ») + Location (« près de l’entrée »)."
          },
          {
            "promptEnglish": "The bookseller invites us to go up behind the bookshelves.",
            "chunks": [
              "le libraire",
              "nous invite",
              "à monter",
              "derrière les étagères"
            ],
            "explanation": "Subject (« le libraire ») + Pronoun & Verb (« nous invite ») + Infinitive phrase (« à monter derrière les étagères »)."
          },
          {
            "promptEnglish": "You are not going out alone in this heavy rain.",
            "chunks": [
              "tu ne sors pas",
              "toute seule",
              "sous",
              "cette forte pluie"
            ],
            "explanation": "Negated verb (« tu ne sors pas ») + Adjective (« toute seule ») + Prepositional phrase (« sous cette forte pluie »)."
          }
        ]
      }
    },
    "3": {
      "subtitle": "Past Ownership ('appartenir à'), Encouraging Commands ('Vas-y'), Reflexive Opening ('s’ouvrir') & Future Plans",
      "vocabReuses": [
        {
          "word": "appartenir à (to belong to)",
          "storyContext": "« Elle appartenait à votre mère. »",
          "newPhrase": "Ce jardin secret appartenait autrefois à un célèbre peintre.",
          "english": "This secret garden once belonged to a famous painter."
        },
        {
          "word": "vas-y (go ahead / go on!)",
          "storyContext": "« Vas-y, tourne la clé ! »",
          "newPhrase": "Vas-y, ouvre ton cadeau d’anniversaire maintenant !",
          "english": "Go ahead, open your birthday present now!"
        },
        {
          "word": "reconnaître (to recognize)",
          "storyContext": "Sur la vieille photo, elle reconnaît le visage souriant...",
          "newPhrase": "Je reconnais immédiatement la voix de mon ami au téléphone.",
          "english": "I immediately recognize my friend’s voice on the phone."
        }
      ],
      "construction": {
        "patternName": "Past State & Belonging (Imparfait): [Item] + appartenait à + [Owner]",
        "formula": [
          "Ce livre / Elle",
          "+ appartenait à (imperfect)",
          "+ Owner (ma mère / mon grand-père)"
        ],
        "explanation": "To describe who something belonged to in the past, French uses the imperfect tense (« l’imparfait ») of « appartenir » (« appartenait à ») because ownership is a continuous background state rather than a sudden one-off event.",
        "examples": [
          {
            "target": "Cette montre en argent appartenait à mon grand-père.",
            "english": "This silver watch belonged to my grandfather.",
            "highlight": "appartenait à"
          },
          {
            "target": "Ces carnets anciens appartenaient à un voyageur.",
            "english": "These antique notebooks belonged to a traveler.",
            "highlight": "appartenaient à"
          },
          {
            "target": "À qui appartenait cette petite maison devant la mer ?",
            "english": "Who did this little house in front of the sea belong to?",
            "highlight": "À qui appartenait"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "This wooden music box belonged to my grandmother.",
            "sentenceParts": [
              "Cette boîte à musique en bois ",
              " à ma grand-mère."
            ],
            "correctAnswer": "appartenait",
            "options": [
              "appartenait",
              "attendait",
              "reconnaissait",
              "expliquait"
            ],
            "explanation": "« Appartenait à » is the imperfect tense of « appartenir à » ('belonged to')."
          },
          {
            "promptEnglish": "Go ahead, turn the key gently in the lock!",
            "sentenceParts": [
              "« ",
              ", tourne doucement la clé dans la serrure ! »"
            ],
            "correctAnswer": "Vas-y",
            "options": [
              "Vas-y",
              "Allons-nous",
              "Va-le",
              "Vont-ils"
            ],
            "explanation": "« Vas-y ! » ('Go ahead! / Do it!') keeps the '-s' on « va » for pronunciation before the vowel pronoun « y »."
          },
          {
            "promptEnglish": "When the window opens, we hear a sweet melody.",
            "sentenceParts": [
              "Quand la fenêtre ",
              ", nous entendons une douce mélodie."
            ],
            "correctAnswer": "s’ouvre",
            "options": [
              "s’ouvre",
              "s’attend",
              "se part",
              "se sourit"
            ],
            "explanation": "French uses the reflexive verb « s’ouvrir » ('to open itself') when a door, box, or window opens on its own."
          },
          {
            "promptEnglish": "I bought two train tickets for the coast this afternoon.",
            "sentenceParts": [
              "J’ai acheté deux ",
              " de train pour la côte cet après-midi."
            ],
            "correctAnswer": "billets",
            "options": [
              "billets",
              "visages",
              "comptoirs",
              "manteaux"
            ],
            "explanation": "« Un billet de train » is a train ticket."
          },
          {
            "promptEnglish": "Do you recognize this sunny beach in front of the sea?",
            "sentenceParts": [
              "Est-ce que tu ",
              " cette plage ensoleillée devant la mer ?"
            ],
            "correctAnswer": "reconnais",
            "options": [
              "reconnais",
              "appartiens",
              "expliques",
              "poses"
            ],
            "explanation": "« Tu reconnais » is the present tense of « reconnaître » ('to recognize')."
          },
          {
            "promptEnglish": "So, are we leaving for the train station tonight?",
            "sentenceParts": [
              "« Alors, nous ",
              " pour la gare ce soir ? »"
            ],
            "correctAnswer": "partons",
            "options": [
              "partons",
              "posons",
              "tournons",
              "sourions"
            ],
            "explanation": "« Nous partons pour... » means 'we are leaving for...' (using the present tense for an immediate planned departure)."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Ami : « J’ai trouvé ce petit coffret fermé dans le grenier, mais j’hésite à l’ouvrir. »",
            "speakerAEnglish": "Friend: 'I found this small locked box in the attic, but I hesitate to open it.'",
            "promptEnglish": "Encourage your friend enthusiastically: 'Go ahead, turn the key and open it!'",
            "correctAnswer": "Vas-y, tourne la clé et ouvre-le !",
            "options": [
              "Vas-y, tourne la clé et ouvre-le !",
              "J’attends le prochain train depuis vingt ans.",
              "Il a posé ses lunettes sur le comptoir en bois.",
              "Nous partons pour la montagne demain matin."
            ],
            "explanation": "« Vas-y ! » is the natural everyday French expression for 'Go ahead! / Go for it!'."
          },
          {
            "speakerA": "Antiquaire : « Vous admirez cette vieille montre en or ? Elle a une longue histoire. »",
            "speakerAEnglish": "Antique dealer: 'Are you admiring this old gold watch? It has a long history.'",
            "promptEnglish": "Ask the dealer who the watch belonged to before:",
            "correctAnswer": "À qui est-ce qu’elle appartenait autrefois ?",
            "options": [
              "À qui est-ce qu’elle appartenait autrefois ?",
              "Pourquoi est-ce que le train part ce soir ?",
              "Comment s’ouvre la porte de la librairie ?",
              "Combien de billets avez-vous achetés à la gare ?"
            ],
            "explanation": "Since « appartenir » takes « à », 'Who did it belong to?' is « À qui est-ce qu’elle appartenait ? »."
          },
          {
            "speakerA": "Voyageur : « Regarde, j’ai deux billets de train pour le sud de la France ! »",
            "speakerAEnglish": "Traveler: 'Look, I have two train tickets for the south of France!'",
            "promptEnglish": "Ask excitedly if you are both leaving for the station tonight:",
            "correctAnswer": "C’est vrai ? Alors, nous partons pour la gare ce soir ?",
            "options": [
              "C’est vrai ? Alors, nous partons pour la gare ce soir ?",
              "Attention, la boîte à musique est restée sur l’étagère.",
              "Pardon, je ne reconnais pas cet homme au manteau gris.",
              "Bien sûr, j’ai attendu ce colis pendant deux semaines."
            ],
            "explanation": "« Alors, nous partons pour la gare ce soir ? » uses the present tense with future value for an immediate trip."
          },
          {
            "speakerA": "Cousine : « Regarde ce vieil album de famille que j’ai retrouvé dans l’armoire. »",
            "speakerAEnglish": "Cousin: 'Look at this old family album I found in the wardrobe.'",
            "promptEnglish": "Say that you recognize your uncle's smiling face in front of the sea:",
            "correctAnswer": "Je reconnais le visage souriant de mon oncle devant la mer !",
            "options": [
              "Je reconnais le visage souriant de mon oncle devant la mer !",
              "Je pose la boîte sculptée sur le comptoir de la boutique.",
              "Tu tournes la clé dorée avec beaucoup d’impatience.",
              "Nous écoutons une douce mélodie dans le salon."
            ],
            "explanation": "Combines « Je reconnais » (I recognize), « le visage souriant » (the smiling face), and « devant la mer » (in front of the sea)."
          },
          {
            "speakerA": "Employé : « Où voulez-vous que je dépose ce paquet fragile ? »",
            "speakerAEnglish": "Clerk: 'Where would you like me to set down this fragile package?'",
            "promptEnglish": "Ask them to place it gently on the wooden counter:",
            "correctAnswer": "Posez-le doucement sur le comptoir en bois, s’il vous plaît.",
            "options": [
              "Posez-le doucement sur le comptoir en bois, s’il vous plaît.",
              "Ouvrez-la rapidement devant la porte de la gare.",
              "Attendez-moi depuis vingt ans dans cette ville.",
              "Partez sans vos billets de train après le dîner."
            ],
            "explanation": "« Poser sur le comptoir en bois » = to set/place down on the wooden counter."
          },
          {
            "speakerA": "Ami : « Ton frère est déjà arrivé à la gare du Sud ? »",
            "speakerAEnglish": "Friend: 'Has your brother already arrived at the South station?'",
            "promptEnglish": "Reply yes, he is waiting for you in front of the main café:",
            "correctAnswer": "Oui, il m’attend devant le café principal de la gare.",
            "options": [
              "Oui, il m’attend devant le café principal de la gare.",
              "Non, elle appartenait à notre grand-père maternel.",
              "Oui, la boîte à musique joue une mélodie très douce.",
              "Non, je tourne la petite clé dans la serrure."
            ],
            "explanation": "« Il m’attend devant... » = He is waiting for me in front of... (with the direct object pronoun « m’ » before « attend »)."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Quand le petit coffret en bois s’ouvre, une douce mélodie joue dans la pièce.",
            "correctAnswer": "When the small wooden box opens, a sweet melody plays in the room.",
            "options": [
              "When the small wooden box opens, a sweet melody plays in the room.",
              "When the small wooden door closes, a loud bell rings in the street.",
              "Before the small wooden box opens, you must turn the silver key twice.",
              "Inside the small wooden box, we found an old watch that no longer works."
            ],
            "explanation": "« Quand le petit coffret en bois s’ouvre » = When the small wooden box opens; « une douce mélodie joue » = a sweet melody plays."
          },
          {
            "audioSentence": "Cette bague ancienne appartenait à ma grand-mère avant notre départ pour la côte.",
            "correctAnswer": "This antique ring belonged to my grandmother before our departure for the coast.",
            "options": [
              "This antique ring belonged to my grandmother before our departure for the coast.",
              "This antique ring is a gift for my grandmother when we arrive on the coast.",
              "This antique ring was lost by my grandmother on the train to the coast.",
              "This antique ring was bought by my grandmother in a small shop on the coast."
            ],
            "explanation": "« Appartenait à ma grand-mère » = belonged to my grandmother."
          },
          {
            "audioSentence": "J’ai posé les deux billets de train sur le comptoir à côté de tes lunettes.",
            "correctAnswer": "I placed the two train tickets on the counter next to your glasses.",
            "options": [
              "I placed the two train tickets on the counter next to your glasses.",
              "I looked for the two train tickets under the counter behind your bag.",
              "I forgot the two train tickets in the pocket of my grey coat.",
              "I bought the two train tickets at the station window this morning."
            ],
            "explanation": "« J’ai posé les deux billets de train sur le comptoir » = I placed the two train tickets on the counter."
          },
          {
            "audioSentence": "Sur cette image ancienne, je reconnais tout de suite le visage souriant de mon oncle.",
            "correctAnswer": "In this old picture, I immediately recognize the smiling face of my uncle.",
            "options": [
              "In this old picture, I immediately recognize the smiling face of my uncle.",
              "In this old picture, I cannot see the house where my uncle used to live.",
              "Behind this old picture, my uncle wrote a secret address in blue ink.",
              "Beside this old picture, my uncle kept his collection of rare stamps."
            ],
            "explanation": "« Je reconnais tout de suite le visage souriant de mon oncle » = I immediately recognize my uncle's smiling face."
          },
          {
            "audioSentence": "Vas-y, tourne la clé sans hésiter et regarde ce qu’il y a au fond du tiroir !",
            "correctAnswer": "Go ahead, turn the key without hesitating and look at what is at the bottom of the drawer!",
            "options": [
              "Go ahead, turn the key without hesitating and look at what is at the bottom of the drawer!",
              "Be careful, do not turn the key yet because the lock of the drawer is broken!",
              "Wait a moment, give me the key so I can lock the desk drawer before leaving!",
              "Look here, I found the key that opens the small drawer of the wooden table!"
            ],
            "explanation": "« Vas-y, tourne la clé sans hésiter » = Go ahead, turn the key without hesitating."
          },
          {
            "audioSentence": "Nos amis nous attendent devant la gare centrale, alors nous partons dès maintenant.",
            "correctAnswer": "Our friends are waiting for us in front of the central station, so we are leaving right now.",
            "options": [
              "Our friends are waiting for us in front of the central station, so we are leaving right now.",
              "Our friends arrived at the central station yesterday evening, so we will visit them tomorrow.",
              "Our friends called us from the central station because their train was delayed.",
              "Our friends bought our tickets at the central station before the counter closed."
            ],
            "explanation": "« Nos amis nous attendent devant la gare centrale, alors nous partons dès maintenant » = Our friends are waiting for us in front of the central station, so we are leaving right now."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in French: 'It belonged to your mother'?",
            "correctAnswer": "Elle appartenait à votre mère.",
            "options": [
              "Elle appartenait à votre mère.",
              "Elle a appartenu de votre mère.",
              "Elle était appartenant pour votre mère.",
              "Elle appartenait votre mère."
            ],
            "explanation": "« Appartenir » always requires the preposition « à » ('to belong to'), and uses the imperfect « appartenait » for past ownership."
          },
          {
            "promptEnglish": "Choose the correct French imperative for: 'Go ahead, turn the key!'",
            "correctAnswer": "Vas-y, tourne la clé !",
            "options": [
              "Vas-y, tourne la clé !",
              "Va-y, tournes la clé !",
              "Aller-y, tourne la clé !",
              "Vas-là, tourner la clé !"
            ],
            "explanation": "In the « tu » imperative, « va » keeps its '-s' before the pronoun « y » (« Vas-y »), while regular -er verbs like « tourner » do not take an '-s' (« tourne »)."
          },
          {
            "promptEnglish": "Select the natural French sentence for: 'When the box opens, a sweet melody plays.'",
            "correctAnswer": "Quand la boîte s’ouvre, une douce mélodie joue.",
            "options": [
              "Quand la boîte s’ouvre, une douce mélodie joue.",
              "Quand la boîte ouvre soi, une mélodie doux joue.",
              "Lorsque la boîte est ouvrir, une douce mélodie jouait.",
              "Quand s’ouvre la boîte, un doux mélodie jouent."
            ],
            "explanation": "In French, when an object opens by itself, use the pronominal form « s’ouvre »; « mélodie » is feminine, so « doux » becomes « douce »."
          },
          {
            "promptEnglish": "How do you say: 'He is waiting for you in front of the sea'?",
            "correctAnswer": "Il t’attend devant la mer.",
            "options": [
              "Il t’attend devant la mer.",
              "Il attend pour toi avant la mer.",
              "Il te attend en face la mer.",
              "Il est t’attendant devant de la mer."
            ],
            "explanation": "1) « Attendre » takes a direct object pronoun (« t’ » before a vowel, no 'pour'), and 2) 'in front of' (spatial) is « devant » (whereas « avant » is for time)."
          },
          {
            "promptEnglish": "Which sentence accurately says: 'I have been waiting for this moment for twenty years!'?",
            "correctAnswer": "J’attends ce moment depuis vingt ans !",
            "options": [
              "J’attends ce moment depuis vingt ans !",
              "J’ai attendu ce moment pour vingt ans !",
              "Je suis attendant ce moment depuis vingt années !",
              "J’attendais ce moment pendant vingt ans maintenant !"
            ],
            "explanation": "Because the waiting continues up to the present moment of discovery, French uses Present (« J’attends ») + « depuis vingt ans »."
          },
          {
            "promptEnglish": "Choose the correct way to say: 'two train tickets for the coast'",
            "correctAnswer": "deux billets de train pour la côte",
            "options": [
              "deux billets de train pour la côte",
              "deux train billets à la côte",
              "deux billets du train vers la côte",
              "deux billets en train pour le côte"
            ],
            "explanation": "Noun + « de » + Noun (« billets de train ») describes the type of ticket, and « pour » indicates the destination on a ticket."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "This carved music box belonged to my mother.",
            "chunks": [
              "cette boîte à musique",
              "sculptée",
              "appartenait",
              "à ma mère"
            ],
            "explanation": "Subject noun phrase (« cette boîte à musique sculptée ») + Imperfect verb (« appartenait ») + Indirect object (« à ma mère »)."
          },
          {
            "promptEnglish": "He places two train tickets on the wooden counter.",
            "chunks": [
              "il pose",
              "deux billets de train",
              "sur",
              "le comptoir en bois"
            ],
            "explanation": "Subject & Verb (« il pose ») + Direct Object (« deux billets de train ») + Location (« sur le comptoir en bois »)."
          },
          {
            "promptEnglish": "When the door opens, I recognize his smiling face.",
            "chunks": [
              "quand la porte",
              "s’ouvre,",
              "je reconnais",
              "son visage souriant"
            ],
            "explanation": "Temporal clause (« quand la porte s’ouvre ») + Main clause (« je reconnais son visage souriant »)."
          },
          {
            "promptEnglish": "Go ahead, turn the small key in the lock!",
            "chunks": [
              "vas-y,",
              "tourne",
              "la petite clé",
              "dans la serrure !"
            ],
            "explanation": "Encouragement (« vas-y ») + Imperative verb (« tourne ») + Object (« la petite clé ») + Location (« dans la serrure »)."
          },
          {
            "promptEnglish": "My uncle is waiting for us in front of the station tonight.",
            "chunks": [
              "mon oncle",
              "nous attend",
              "devant la gare",
              "ce soir"
            ],
            "explanation": "Subject (« mon oncle ») + Object pronoun & Verb (« nous attend ») + Place (« devant la gare ») + Time (« ce soir »)."
          },
          {
            "promptEnglish": "I have been waiting for this letter for twenty years.",
            "chunks": [
              "j’attends",
              "cette lettre",
              "depuis",
              "vingt ans"
            ],
            "explanation": "Present verb (« j’attends ») + Direct object (« cette lettre ») + Ongoing duration (« depuis vingt ans »)."
          }
        ]
      }
    }
  },
  "it": {
    "1": {
      "subtitle": "Spatial Prepositions, Reflexive Seating ('sedersi'), Immediate Actions ('subito') & Helping ('aiutare a')",
      "vocabReuses": [
        {
          "word": "dentro (inside)",
          "storyContext": "« Scusa, qualcosa brilla dentro quella pagina! »",
          "newPhrase": "Ho lasciato il mio passaporto dentro la borsa blu.",
          "english": "I left my passport inside the blue bag."
        },
        {
          "word": "subito (right away / immediately)",
          "storyContext": "Apre subito la prima pagina del libro.",
          "newPhrase": "Ti chiamo subito appena arrivo alla stazione centrale.",
          "english": "I’ll call you right away as soon as I arrive at the central station."
        },
        {
          "word": "fino a (all the way to / until)",
          "storyContext": "« Ti aiuterò a proteggere questa mappa fino a destinazione! »",
          "newPhrase": "Camminiamo insieme fino alla piazza principale.",
          "english": "Let’s walk together all the way to the main square."
        }
      ],
      "construction": {
        "patternName": "Helping Someone Do Something: aiutare + a + [Infinitive Verb]",
        "formula": [
          "Ti aiuterò / Mi aiuti",
          "+ a",
          "+ Infinitive Verb (proteggere / cercare)"
        ],
        "explanation": "In Italian, the verb « aiutare » ('to help') always connects to the following action with the preposition « a » before the infinitive verb.",
        "examples": [
          {
            "target": "Ti aiuterò a proteggere questa mappa antica.",
            "english": "I will help you protect this antique map.",
            "highlight": "Ti aiuterò a proteggere"
          },
          {
            "target": "Mi aiuti a cercare il binario giusto?",
            "english": "Will you help me look for the right platform?",
            "highlight": "Mi aiuti a cercare"
          },
          {
            "target": "Il controllore ci aiuta a trovare i nostri posti.",
            "english": "The conductor helps us find our seats.",
            "highlight": "ci aiuta a trovare"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "I always sit near the window when I travel by train.",
            "sentenceParts": [
              "Mi siedo sempre ",
              " al finestrino quando viaggio in treno."
            ],
            "correctAnswer": "vicino",
            "options": [
              "vicino",
              "dentro",
              "contro",
              "senza"
            ],
            "explanation": "« Vicino a » means 'near / next to' (combining with « il » to form « vicino al finestrino »)."
          },
          {
            "promptEnglish": "Excuse me, something is shining inside that old box!",
            "sentenceParts": [
              "« Scusa, qualcosa brilla ",
              " quella scatola antica! »"
            ],
            "correctAnswer": "dentro",
            "options": [
              "dentro",
              "prima",
              "invece",
              "intorno"
            ],
            "explanation": "« Dentro » means 'inside'."
          },
          {
            "promptEnglish": "The traveler immediately opens the compartment door.",
            "sentenceParts": [
              "Il viaggiatore apre ",
              " la porta dello scompartimento."
            ],
            "correctAnswer": "subito",
            "options": [
              "subito",
              "ieri",
              "troppo",
              "quasi"
            ],
            "explanation": "« Subito » means 'immediately / right away'."
          },
          {
            "promptEnglish": "Across from me on the train sits a kind university student.",
            "sentenceParts": [
              "",
              " a me sul treno si siede una studentessa gentile."
            ],
            "correctAnswer": "Di fronte",
            "options": [
              "Di fronte",
              "In mezzo",
              "A causa",
              "Prima"
            ],
            "explanation": "« Di fronte a » means 'across from / facing'."
          },
          {
            "promptEnglish": "Then I will help you carry these heavy bags all the way to the hotel!",
            "sentenceParts": [
              "« Allora ti aiuterò ",
              " queste valigie fino all’albergo! »"
            ],
            "correctAnswer": "a portare",
            "options": [
              "a portare",
              "di portare",
              "per portare",
              "da portare"
            ],
            "explanation": "« Aiutare » always requires the preposition « a » before an infinitive verb."
          },
          {
            "promptEnglish": "My grandfather used to work in an artisan workshop in the city center.",
            "sentenceParts": [
              "Mio nonno ",
              " in una bottega artigiana in centro."
            ],
            "correctAnswer": "lavorava",
            "options": [
              "lavorava",
              "lavorerà",
              "lavori",
              "lavorando"
            ],
            "explanation": "The imperfect tense « lavorava » expresses habitual past action ('used to work')."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Passeggero : « Scusi, questo posto vicino al finestrino è libero ? »",
            "speakerAEnglish": "Passenger: 'Excuse me, is this seat near the window free?'",
            "promptEnglish": "Reply politely that yes, it is free, and invite them to sit down:",
            "correctAnswer": "Sì, è libero, si sieda pure vicino al finestrino.",
            "options": [
              "Sì, è libero, si sieda pure vicino al finestrino.",
              "No, ho comprato un libro antico dalla copertina blu.",
              "Sì, qualcosa brilla dentro quella pagina gialla.",
              "No, mio nonno lavorava in questo mercato vecchio."
            ],
            "explanation": "« Sì, è libero... vicino al finestrino » naturally answers the passenger's seating question."
          },
          {
            "speakerA": "Amica : « Questa valigia è davvero pesante e il binario è lontano! »",
            "speakerAEnglish": "Friend: 'This suitcase is really heavy and the platform is far!'",
            "promptEnglish": "Offer to help her carry the suitcase all the way to the train:",
            "correctAnswer": "Non preoccuparti, ti aiuterò a portare la valigia fino al treno!",
            "options": [
              "Non preoccuparti, ti aiuterò a portare la valigia fino al treno!",
              "Guarda fuori dal finestrino e chiudi subito la porta!",
              "Ho trovato un biglietto giallo dentro la mia tasca.",
              "Dieci minuti dopo, il treno parte dalla stazione."
            ],
            "explanation": "Uses « ti aiuterò a + infinitive » and « fino al treno » ('all the way to the train')."
          },
          {
            "speakerA": "Compagno di viaggio : « Perché parli così sottovoce nello scompartimento ? »",
            "speakerAEnglish": "Travel companion: 'Why are you speaking in such a whisper in the compartment?'",
            "promptEnglish": "Explain that the other passengers are sleeping and you don't want to wake them:",
            "correctAnswer": "Parlo a bassa voce perché gli altri passeggeri dormono.",
            "options": [
              "Parlo a bassa voce perché gli altri passeggeri dormono.",
              "Compro subito una mappa segreta al mercato vecchio.",
              "Salgo sul treno delle otto con molta fretta.",
              "Apro la prima pagina del quaderno con coraggio."
            ],
            "explanation": "« A bassa voce » / « sottovoce » means 'in a low voice / in a whisper'."
          },
          {
            "speakerA": "Libraio : « Posso aiutarla a cercare qualcosa di speciale oggi ? »",
            "speakerAEnglish": "Bookseller: 'May I help you look for something special today?'",
            "promptEnglish": "Say you are looking for an antique book about the history of music:",
            "correctAnswer": "Sì, grazie, cerco un libro antico sulla storia della musica.",
            "options": [
              "Sì, grazie, cerco un libro antico sulla storia della musica.",
              "No, chiudo subito la porta dello scompartimento.",
              "Sì, mi siedo di fronte a te vicino all’uscita.",
              "No, ti aiuterò a proteggere il violino domani."
            ],
            "explanation": "« Cerco un libro antico... » directly answers the bookseller's offer."
          },
          {
            "speakerA": "Amico : « Hai visto dove ho messo i biglietti del treno ? »",
            "speakerAEnglish": "Friend: 'Did you see where I put the train tickets?'",
            "promptEnglish": "Tell your friend to look inside the first page of their blue notebook:",
            "correctAnswer": "Guarda dentro la prima pagina del tuo quaderno blu!",
            "options": [
              "Guarda dentro la prima pagina del tuo quaderno blu!",
              "Lavorava con un famoso artigiano molti anni fa!",
              "Sale sul treno regionale tra dieci minuti!",
              "Sorride con coraggio davanti alla stazione!"
            ],
            "explanation": "« Guarda dentro la prima pagina... » uses the imperative « Guarda » + « dentro »."
          },
          {
            "speakerA": "Controllore : « C’è molta corrente d’aria qui nel corridoio. »",
            "speakerAEnglish": "Conductor: 'There is a strong draft of air here in the corridor.'",
            "promptEnglish": "Say that you will close the compartment door right away:",
            "correctAnswer": "Chiudo subito la porta dello scompartimento.",
            "options": [
              "Chiudo subito la porta dello scompartimento.",
              "Compro subito un violino antico al mercato.",
              "racconto una lunga storia a bassa voce.",
              "Indico il palazzo storico fuori dalla stazione."
            ],
            "explanation": "« Chiudo subito la porta dello scompartimento » = I'll close the compartment door right away."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Salgo sul treno del mattino e mi siedo vicino al finestrino con un libro.",
            "correctAnswer": "I get on the morning train and sit down near the window with a book.",
            "options": [
              "I get on the morning train and sit down near the window with a book.",
              "I get off the evening train and wait near the station exit with a map.",
              "I buy a train ticket at the market and read a book in the square.",
              "I close the train window immediately and put the book inside my bag."
            ],
            "explanation": "« Salgo sul treno del mattino » = I get on the morning train; « mi siedo vicino al finestrino » = I sit down near the window."
          },
          {
            "audioSentence": "Di fronte a noi, un passeggero apre subito una busta gialla e legge sottovoce.",
            "correctAnswer": "Across from us, a passenger immediately opens a yellow envelope and reads in a whisper.",
            "options": [
              "Across from us, a passenger immediately opens a yellow envelope and reads in a whisper.",
              "Behind us, a passenger slowly closes a blue notebook and speaks loudly.",
              "Next to us, a passenger looks out the window and asks for the time.",
              "Across from us, a conductor checks the tickets and smiles kindly."
            ],
            "explanation": "« Di fronte a noi » = Across from us; « apre subito una busta gialla e legge sottovoce » = immediately opens a yellow envelope and reads in a whisper."
          },
          {
            "audioSentence": "Ti aiuterò a cercare la strada giusta fino all’ingresso del museo.",
            "correctAnswer": "I will help you look for the right street all the way to the museum entrance.",
            "options": [
              "I will help you look for the right street all the way to the museum entrance.",
              "I will wait for you inside the museum café until the rain stops.",
              "I asked him to show us the antique map before the museum closes.",
              "I bought two tickets for the museum exhibition at the old market."
            ],
            "explanation": "« Ti aiuterò a cercare la strada giusta fino a... » = I will help you look for the right street all the way to..."
          },
          {
            "audioSentence": "Qualcosa brilla dentro quella piccola scatola di legno sul tavolo.",
            "correctAnswer": "Something is shining inside that small wooden box on the table.",
            "options": [
              "Something is shining inside that small wooden box on the table.",
              "Someone left a small wooden key under the chair near the table.",
              "Nothing is written on the first page of that antique book on the table.",
              "Everything is ready inside the compartment before the train departs."
            ],
            "explanation": "« Qualcosa brilla dentro quella piccola scatola di legno » = Something is shining inside that small wooden box."
          },
          {
            "audioSentence": "Mio nonno lavorava in una bottega di strumenti musicali nel centro storico.",
            "correctAnswer": "My grandfather used to work in a musical instrument workshop in the historic center.",
            "options": [
              "My grandfather used to work in a musical instrument workshop in the historic center.",
              "My grandfather wants to buy an antique violin in the historic center tomorrow.",
              "My grandfather is waiting for us near the old market in the historic center.",
              "My grandfather wrote a letter about the concerts in the historic center."
            ],
            "explanation": "« Mio nonno lavorava in una bottega... » uses the imperfect « lavorava » ('used to work')."
          },
          {
            "audioSentence": "Chiudo subito la porta dello scompartimento per parlare in tranquillità.",
            "correctAnswer": "I immediately close the compartment door in order to speak in peace.",
            "options": [
              "I immediately close the compartment door in order to speak in peace.",
              "I slowly open the compartment window to look at the countryside.",
              "I knock on the compartment door before asking for a free seat.",
              "I leave the compartment right away to look for the conductor."
            ],
            "explanation": "« Chiudo subito la porta dello scompartimento per parlare... » = I immediately close the compartment door in order to speak..."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Italian: 'I will help you protect this map'?",
            "correctAnswer": "Ti aiuterò a proteggere questa mappa.",
            "options": [
              "Ti aiuterò a proteggere questa mappa.",
              "Ti aiuterò di proteggere questa mappa.",
              "Aiuterò te proteggere questa mappa.",
              "Ti aiuto per proteggendo questa mappa."
            ],
            "explanation": "« Aiutare » always links to the infinitive verb with the preposition « a » (« aiutare qualcuno a fare qualcosa »)."
          },
          {
            "promptEnglish": "Choose the correct Italian sentence for: 'He gets on the train and sits down near the window.'",
            "correctAnswer": "Sale sul treno e si siede vicino al finestrino.",
            "options": [
              "Sale sul treno e si siede vicino al finestrino.",
              "Sale nel treno e siede sé vicino il finestrino.",
              "Salisce sul treno e si sedere vicino a finestrino.",
              "Sale sopra treno e si siede prossimo dal finestrino."
            ],
            "explanation": "1) In Italian you get « sul treno » (on the train), 2) « sedersi » is reflexive (« si siede »), and 3) « vicino a + il » contracts to « vicino al »."
          },
          {
            "promptEnglish": "Select the accurate translation for: 'an antique book with a blue cover'",
            "correctAnswer": "un libro antico dalla copertina blu",
            "options": [
              "un libro antico dalla copertina blu",
              "un antico libro della blu copertina",
              "un libro vecchio a copertina azzurri",
              "uno libro antico con copertina di blu"
            ],
            "explanation": "Italian uses « da + article » (« dalla copertina blu ») to describe a distinguishing characteristic ('with a blue cover'), and « blu » is invariable."
          },
          {
            "promptEnglish": "How do you express habitual past action: 'My grandfather used to work here'?",
            "correctAnswer": "Mio nonno lavorava qui.",
            "options": [
              "Mio nonno lavorava qui.",
              "Il mio nonno ha lavorato qui sempre.",
              "Mio nonno usava lavorare qui.",
              "Mio nonno era lavorando qui."
            ],
            "explanation": "1) Singular family members do not take the article after a possessive (« Mio nonno », never *Il mio nonno), and 2) English 'used to [verb]' is expressed with the simple imperfect (« lavorava »)."
          },
          {
            "promptEnglish": "Which sentence correctly says: 'Across from him, a girl points at the book'?",
            "correctAnswer": "Di fronte a lui, una ragazza indica il libro.",
            "options": [
              "Di fronte a lui, una ragazza indica il libro.",
              "In fronte di lui, una ragazza indica al libro.",
              "Di fronte da egli, una ragazza punta il libro.",
              "Davanti di lui, una ragazza indicano il libro."
            ],
            "explanation": "« Di fronte a » ('across from / facing') takes the preposition « a » + stressed pronoun « lui », and « indicare » takes a direct object without « a »."
          },
          {
            "promptEnglish": "Choose the natural Italian phrase for: 'all the way to the central station'",
            "correctAnswer": "fino alla stazione centrale",
            "options": [
              "fino alla stazione centrale",
              "fino la centrale stazione",
              "verso di stazione centrale",
              "fino da stazione centrale"
            ],
            "explanation": "« Fino a » ('until / all the way to') combines with the feminine article « la » to form « fino alla »."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "I will help you protect this secret map.",
            "chunks": [
              "ti aiuterò",
              "a proteggere",
              "questa",
              "mappa segreta"
            ],
            "explanation": "Pronoun + Future verb (« ti aiuterò ») + Preposition & Infinitive (« a proteggere ») + Direct object (« questa mappa segreta »)."
          },
          {
            "promptEnglish": "He gets on the train and sits down near the window.",
            "chunks": [
              "sale sul treno",
              "e si siede",
              "vicino",
              "al finestrino"
            ],
            "explanation": "First action (« sale sul treno ») + Reflexive verb (« e si siede ») + Prepositional location (« vicino al finestrino »)."
          },
          {
            "promptEnglish": "Something is shining inside that old page!",
            "chunks": [
              "qualcosa",
              "brilla",
              "dentro",
              "quella pagina antica!"
            ],
            "explanation": "Subject (« qualcosa ») + Verb (« brilla ») + Preposition (« dentro ») + Object (« quella pagina antica! »)."
          },
          {
            "promptEnglish": "I immediately close the door of the compartment.",
            "chunks": [
              "chiudo subito",
              "la porta",
              "dello",
              "scompartimento"
            ],
            "explanation": "Verb + Adverb (« chiudo subito ») + Direct object (« la porta ») + Genitive (« dello scompartimento »)."
          },
          {
            "promptEnglish": "My grandfather used to work in an old workshop.",
            "chunks": [
              "mio nonno",
              "lavorava",
              "in una",
              "vecchia bottega"
            ],
            "explanation": "Subject (« mio nonno ») + Imperfect verb (« lavorava ») + Location (« in una vecchia bottega »)."
          },
          {
            "promptEnglish": "At the old market, I buy a book with a blue cover.",
            "chunks": [
              "al mercato vecchio,",
              "compro",
              "un libro",
              "dalla copertina blu"
            ],
            "explanation": "Location (« al mercato vecchio ») + Verb & Object (« compro un libro ») + Characteristic (« dalla copertina blu »)."
          }
        ]
      }
    },
    "2": {
      "subtitle": "Ongoing Action with 'da', Obligation ('dobbiamo'), Purpose Clauses ('per + infinitive') & Directions",
      "vocabReuses": [
        {
          "word": "dietro (behind)",
          "storyContext": "« Dobbiamo girare a sinistra, dietro la vecchia fontana! »",
          "newPhrase": "C’è una piccola libreria nascosta dietro il teatro.",
          "english": "There is a small hidden bookshop behind the theater."
        },
        {
          "word": "mentre (while)",
          "storyContext": "« Dove andiamo adesso? » chiede mentre guarda dietro di sé.",
          "newPhrase": "Ascolto sempre la radio italiana mentre preparo la colazione.",
          "english": "I always listen to Italian radio while I prepare breakfast."
        },
        {
          "word": "per nasconderci (in order to hide ourselves)",
          "storyContext": "« Entriamo in questo piccolo mercato dei fiori per nasconderci! »",
          "newPhrase": "Entriamo sotto i portici per ripararci dalla pioggia.",
          "english": "Let’s go under the porticoes to shelter ourselves from the rain."
        }
      ],
      "construction": {
        "patternName": "Purpose Clause with Reflexive Infinitive: per + [Infinitive + ci / mi / ti]",
        "formula": [
          "Entriamo / Corriamo",
          "+ per (in order to)",
          "+ Infinitive + Pronoun (nasconderci / ripararmi)"
        ],
        "explanation": "In Italian, to express 'in order to do X', use « per + infinitive ». When the verb is reflexive, drop the final '-e' of the infinitive and attach the reflexive pronoun matching the subject (-mi, -ti, -ci) directly to the end!",
        "examples": [
          {
            "target": "Entriamo nel mercato per nasconderci!",
            "english": "Let’s go into the market in order to hide!",
            "highlight": "per nasconderci"
          },
          {
            "target": "Corro sotto i portici per non bagnarmi.",
            "english": "I run under the porticoes so as not to get wet.",
            "highlight": "per non bagnarmi"
          },
          {
            "target": "Cerchiamo una panchina all’ombra per riposarci.",
            "english": "We look for a bench in the shade in order to rest.",
            "highlight": "per riposarci"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "We must turn left after the stone fountain.",
            "sentenceParts": [
              "",
              " girare a sinistra dopo la fontana di pietra."
            ],
            "correctAnswer": "Dobbiamo",
            "options": [
              "Dobbiamo",
              "Seguiamo",
              "Prendiamo",
              "Vediamo"
            ],
            "explanation": "« Dobbiamo » ('we must / we have to') is the « noi » form of « dovere » + infinitive."
          },
          {
            "promptEnglish": "Where are we going now while it rains outside?",
            "sentenceParts": [
              "« Dove andiamo adesso ",
              " piove fuori? »"
            ],
            "correctAnswer": "mentre",
            "options": [
              "mentre",
              "dietro",
              "sotto",
              "presto"
            ],
            "explanation": "« Mentre » means 'while' and links two simultaneous actions."
          },
          {
            "promptEnglish": "Let’s go into this café to shelter ourselves from the wind!",
            "sentenceParts": [
              "« Entriamo in questo caffè ",
              " dal vento! »"
            ],
            "correctAnswer": "per ripararci",
            "options": [
              "per ripararci",
              "di ripararci",
              "a riparare noi",
              "da ripariamo"
            ],
            "explanation": "« Per + infinitive » expresses purpose ('in order to'), with « -ci » attached for 'ourselves'."
          },
          {
            "promptEnglish": "Behind the pots of fragrant roses, we finally see the green gate.",
            "sentenceParts": [
              "",
              " i vasi di rose profumate, vediamo finalmente il portone verde."
            ],
            "correctAnswer": "Dietro",
            "options": [
              "Dietro",
              "Mentre",
              "Invece",
              "Presto"
            ],
            "explanation": "« Dietro » means 'behind'."
          },
          {
            "promptEnglish": "Walk fast! The bus leaves in two minutes!",
            "sentenceParts": [
              "« ",
              " veloce! L’autobus parte tra due minuti! »"
            ],
            "correctAnswer": "Cammina",
            "options": [
              "Cammina",
              "Cammini",
              "Camminiamo",
              "Camminate"
            ],
            "explanation": "For -are verbs, the informal « tu » imperative ends in « -a »: « Cammina veloce! »."
          },
          {
            "promptEnglish": "We have been waiting for this train since the morning.",
            "sentenceParts": [
              "Aspettiamo questo treno ",
              " mattina."
            ],
            "correctAnswer": "dalla",
            "options": [
              "dalla",
              "nella",
              "sulla",
              "colla"
            ],
            "explanation": "Present tense + « da » (contracted with « la » to « dalla ») expresses 'since / from' when an ongoing action started."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Turista : « Mi scusi, per arrivare al teatro antico devo andare dritto ? »",
            "speakerAEnglish": "Tourist: 'Excuse me, to get to the ancient theater must I go straight?'",
            "promptEnglish": "Tell the tourist they must turn left, behind the old stone fountain:",
            "correctAnswer": "No, deve girare a sinistra, dietro la vecchia fontana di pietra.",
            "options": [
              "No, deve girare a sinistra, dietro la vecchia fontana di pietra.",
              "Sì, quell’uomo con gli occhiali scuri ci segue dal mercato.",
              "No, compriamo due vasi di rose profumate in piazza.",
              "Sì, il treno arriva alla stazione centrale alle nove."
            ],
            "explanation": "Uses « girare a sinistra » (turn left) and « dietro la vecchia fontana di pietra » (behind the old stone fountain)."
          },
          {
            "speakerA": "Amica : « Comincia a piovere fortissimo! Dove andiamo adesso ? »",
            "speakerAEnglish": "Friend: 'It's starting to rain really hard! Where do we go now?'",
            "promptEnglish": "Suggest running under the long red porticoes of the historic center:",
            "correctAnswer": "Presto, corriamo sotto i lunghi portici rossi del centro storico!",
            "options": [
              "Presto, corriamo sotto i lunghi portici rossi del centro storico!",
              "Leggiamo la seconda pagina del libro sul treno!",
              "L’uomo alto osserva i viaggiatori dalla finestra!",
              "I vasi di fiori sono davanti al portone chiuso!"
            ],
            "explanation": "« Corriamo sotto i lunghi portici rossi... » uses the « noi » cohortative ('let's run') + « sotto i portici »."
          },
          {
            "speakerA": "Compagno : « Perché guardi continuamente dietro di te mentre camminiamo ? »",
            "speakerAEnglish": "Companion: 'Why do you keep looking behind you while we walk?'",
            "promptEnglish": "Whisper that someone with dark glasses has been following you since the station:",
            "correctAnswer": "Perché un uomo con gli occhiali scuri ci segue dalla stazione!",
            "options": [
              "Perché un uomo con gli occhiali scuri ci segue dalla stazione!",
              "Perché voglio comprare delle rose profumate al mercato!",
              "Perché abbiamo finalmente trovato il portone verde!",
              "Perché dobbiamo girare a destra dopo la piazza!"
            ],
            "explanation": "Present tense « ci segue » + « dalla stazione » expresses 'has been following us since the station'."
          },
          {
            "speakerA": "Amico : « Siamo stanchi di camminare al sole. Cosa proponi ? »",
            "speakerAEnglish": "Friend: 'We are tired of walking in the sun. What do you suggest?'",
            "promptEnglish": "Suggest going into this quiet garden in order to rest:",
            "correctAnswer": "Entriamo in questo giardino silenzioso per riposarci!",
            "options": [
              "Entriamo in questo giardino silenzioso per riposarci!",
              "Guardiamo dietro di noi prima di attraversare!",
              "Camminiamo velocemente verso la stazione dei treni!",
              "Prendiamo l’autobus affollato delle cinque!"
            ],
            "explanation": "« Entriamo in... per riposarci » demonstrates « per + reflexive infinitive (-ci) »."
          },
          {
            "speakerA": "Passante : « Cercate l’ingresso secondario del museo ? È un po’ nascosto. »",
            "speakerAEnglish": "Passerby: 'Are you looking for the side entrance of the museum? It's a bit hidden.'",
            "promptEnglish": "Ask if it is located behind the large flower pots:",
            "correctAnswer": "Si trova forse dietro i grandi vasi di fiori?",
            "options": [
              "Si trova forse dietro i grandi vasi di fiori?",
              "Avete letto la seconda pagina della guida?",
              "Quando arriva il prossimo treno da Firenze?",
              "Perché correte così veloce sotto i portici?"
            ],
            "explanation": "« Si trova dietro i grandi vasi di fiori? » asks where something is located using « dietro »."
          },
          {
            "speakerA": "Guida : « Ecco, siamo quasi arrivati alla fine del nostro percorso. »",
            "speakerAEnglish": "Guide: 'Here we are, we have almost arrived at the end of our route.'",
            "promptEnglish": "Exclaim happily that you finally see the green gate of the theater:",
            "correctAnswer": "Ecco, vediamo finalmente il portone verde del teatro!",
            "options": [
              "Ecco, vediamo finalmente il portone verde del teatro!",
              "Presto, nascondiamoci dentro il mercato del pesce!",
              "Attenzione, non girate a sinistra dopo il ponte!",
              "Scusi, ho dimenticato gli occhiali scuri sul treno!"
            ],
            "explanation": "« Vediamo finalmente il portone verde del teatro! » uses « finalmente » ('finally / at last')."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Dobbiamo girare a sinistra dietro la vecchia fontana di pietra per trovare l’ingresso.",
            "correctAnswer": "We must turn left behind the old stone fountain to find the entrance.",
            "options": [
              "We must turn left behind the old stone fountain to find the entrance.",
              "We must turn right in front of the modern fountain to find the station.",
              "We can wait together beside the stone fountain until the doors open.",
              "We saw two friends sitting near the stone fountain this afternoon."
            ],
            "explanation": "« Dobbiamo girare a sinistra dietro la vecchia fontana di pietra per trovare l’ingresso »."
          },
          {
            "audioSentence": "Entriamo subito in questo piccolo mercato dei fiori per nasconderci dalla folla.",
            "correctAnswer": "Let’s go right into this small flower market to hide from the crowd.",
            "options": [
              "Let’s go right into this small flower market to hide from the crowd.",
              "Let’s leave this crowded flower market and walk toward the square.",
              "Let’s buy some fragrant roses at this small flower market before dinner.",
              "Let’s wait outside the small flower market while our friends shop."
            ],
            "explanation": "« Entriamo subito in questo piccolo mercato dei fiori per nasconderci... » = Let's go right into this small flower market to hide."
          },
          {
            "audioSentence": "Mentre camminiamo sotto i portici rossi, guardo spesso dietro di me.",
            "correctAnswer": "While we walk under the red porticoes, I often look behind me.",
            "options": [
              "While we walk under the red porticoes, I often look behind me.",
              "Before we walk under the red porticoes, I put on my dark glasses.",
              "After we walk under the red porticoes, we stop at a small bookshop.",
              "When we run under the red porticoes, we finally see the train station."
            ],
            "explanation": "« Mentre camminiamo sotto i portici rossi, guardo spesso dietro di me »."
          },
          {
            "audioSentence": "Dietro i vasi di rose profumate, i viaggiatori vedono finalmente il portone verde.",
            "correctAnswer": "Behind the pots of fragrant roses, the travelers finally see the green gate.",
            "options": [
              "Behind the pots of fragrant roses, the travelers finally see the green gate.",
              "In front of the pots of fragrant roses, the travelers take a photograph.",
              "Under the arch of red roses, the travelers knock on the wooden door.",
              "Beside the pots of fragrant roses, the travelers read the secret map."
            ],
            "explanation": "« Dietro i vasi di rose profumate... vedono finalmente il portone verde »."
          },
          {
            "audioSentence": "Cammina veloce, perché quell’uomo con l’impermeabile ci segue dalla stazione!",
            "correctAnswer": "Walk fast, because that man in the raincoat has been following us since the station!",
            "options": [
              "Walk fast, because that man in the raincoat has been following us since the station!",
              "Walk slowly, because that man in the raincoat is waiting for us at the station!",
              "Turn around, because that man in the raincoat dropped his ticket at the station!",
              "Stop here, because that man in the raincoat knows the way to the theater!"
            ],
            "explanation": "« Cammina veloce... ci segue dalla stazione! » = Walk fast... has been following us since the station!"
          },
          {
            "audioSentence": "Quando il treno arriva in stazione, scendiamo subito e cerchiamo l’uscita nord.",
            "correctAnswer": "When the train arrives at the station, we get off right away and look for the north exit.",
            "options": [
              "When the train arrives at the station, we get off right away and look for the north exit.",
              "Before the train arrives at the station, we buy two coffees at the bar.",
              "When the train leaves the station, we sit down near the window and read.",
              "After the train arrives at the station, we wait inside the compartment for ten minutes."
            ],
            "explanation": "« Quando il treno arriva in stazione, scendiamo subito e cerchiamo l’uscita nord »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Italian: 'Let’s go into this market in order to hide!'?",
            "correctAnswer": "Entriamo in questo mercato per nasconderci!",
            "options": [
              "Entriamo in questo mercato per nasconderci!",
              "Entriamo a questo mercato per ci nascondere!",
              "Entriamo dentro questo mercato a nascondiamo!",
              "Andiamo in questo mercato da nascondersi!"
            ],
            "explanation": "Purpose is expressed with « per + infinitive », and the reflexive pronoun « ci » ('ourselves') attaches to the end of the infinitive: « nasconderci »."
          },
          {
            "promptEnglish": "Choose the correct Italian sentence for: 'That man has been following us since the market!'",
            "correctAnswer": "Quell’uomo ci segue dal mercato!",
            "options": [
              "Quell’uomo ci segue dal mercato!",
              "Quello uomo ha stato seguendo noi dal mercato!",
              "Quell’uomo segue ci da il mercato!",
              "Quel uomo è seguito noi fin dal mercato!"
            ],
            "explanation": "1) Before a vowel, « quello » becomes « quell’ », 2) object pronoun « ci » precedes the verb, and 3) ongoing action since a starting point uses Present (« segue ») + « dal » (da + il)."
          },
          {
            "promptEnglish": "Select the correct translation for: 'while she looks behind her'",
            "correctAnswer": "mentre guarda dietro di sé",
            "options": [
              "mentre guarda dietro di sé",
              "durante che guarda dietro lei",
              "mentre guardando dietro da sé",
              "intanto guarda dietro a ella"
            ],
            "explanation": "« Mentre » ('while') is followed by a conjugated verb, and 'behind oneself' uses « dietro di sé »."
          },
          {
            "promptEnglish": "How do you say: 'We must turn left behind the stone fountain'?",
            "correctAnswer": "Dobbiamo girare a sinistra dietro la fontana di pietra.",
            "options": [
              "Dobbiamo girare a sinistra dietro la fontana di pietra.",
              "Dobbiamo di girare in sinistra dietro la pietra fontana.",
              "Avete da girare alla sinistra dietro di fontana in pietra.",
              "Dobbiamo giriamo a sinistra dietro la fontana di pietra."
            ],
            "explanation": "Modal verb « dovere » (« Dobbiamo ») is followed directly by the infinitive (« girare ») without any preposition, and 'to the left' is « a sinistra »."
          },
          {
            "promptEnglish": "Which phrase correctly translates: 'under the long red porticoes'?",
            "correctAnswer": "sotto i lunghi portici rossi",
            "options": [
              "sotto i lunghi portici rossi",
              "sotto gli lunghi portici rossi",
              "sotto i lungi portichi rossi",
              "basso i portici lunghi rosso"
            ],
            "explanation": "« Lungo » and « portico » pluralize as « lunghi » (keeping the hard 'g' with 'h') and « portici », taking the masculine plural article « i »."
          },
          {
            "promptEnglish": "Choose the accurate Italian imperative to tell a friend: 'Walk fast!'",
            "correctAnswer": "Cammina veloce!",
            "options": [
              "Cammina veloce!",
              "Cammini velocemente tu!",
              "Camminare veloce!",
              "Camminate veloci!"
            ],
            "explanation": "For -are verbs, the informal singular (« tu ») positive imperative ends in « -a » (« Cammina! »), while « veloce » is commonly used adverbially in spoken Italian."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "We must turn left behind the stone fountain.",
            "chunks": [
              "dobbiamo",
              "girare a sinistra",
              "dietro",
              "la fontana di pietra"
            ],
            "explanation": "Modal verb (« dobbiamo ») + Infinitive phrase (« girare a sinistra ») + Preposition + Location (« dietro la fontana di pietra »)."
          },
          {
            "promptEnglish": "Let’s go into this flower market in order to hide!",
            "chunks": [
              "entriamo",
              "in questo",
              "mercato dei fiori",
              "per nasconderci!"
            ],
            "explanation": "Cohortative verb (« entriamo ») + Place (« in questo mercato dei fiori ») + Purpose clause (« per nasconderci! »)."
          },
          {
            "promptEnglish": "That man with dark glasses has been following us since the station.",
            "chunks": [
              "quell’uomo",
              "con gli occhiali scuri",
              "ci segue",
              "dalla stazione"
            ],
            "explanation": "Subject (« quell’uomo con gli occhiali scuri ») + Pronoun & Verb (« ci segue ») + Starting point (« dalla stazione »)."
          },
          {
            "promptEnglish": "The two friends run under the long red porticoes.",
            "chunks": [
              "i due amici",
              "corrono",
              "sotto",
              "i lunghi portici rossi"
            ],
            "explanation": "Subject (« i due amici ») + Verb (« corrono ») + Preposition & Place (« sotto i lunghi portici rossi »)."
          },
          {
            "promptEnglish": "Behind the rose pots, we finally see the green gate.",
            "chunks": [
              "dietro i vasi di rose,",
              "vediamo",
              "finalmente",
              "il portone verde"
            ],
            "explanation": "Spatial phrase (« dietro i vasi di rose ») + Verb & Adverb (« vediamo finalmente ») + Object (« il portone verde »)."
          },
          {
            "promptEnglish": "Where do we go now while he looks behind him?",
            "chunks": [
              "dove andiamo",
              "adesso",
              "mentre lui guarda",
              "dietro di sé?"
            ],
            "explanation": "Question clause (« dove andiamo adesso ») + Simultaneous clause (« mentre lui guarda dietro di sé? »)."
          }
        ]
      }
    },
    "3": {
      "subtitle": "Combined Pronouns ('glielo'), Locking ('chiudere a chiave'), Past Discovery & Future Celebrations",
      "vocabReuses": [
        {
          "word": "chiudere a chiave (to lock with a key)",
          "storyContext": "Il Maestro chiude la porta a chiave.",
          "newPhrase": "Ricordati di chiudere a chiave la porta di casa prima di uscire.",
          "english": "Remember to lock the front door before going out."
        },
        {
          "word": "in realtà (actually / in reality)",
          "storyContext": "« L’uomo con gli occhiali scuri è in realtà un ispettore! »",
          "newPhrase": "Pensavo fosse tardi, ma in realtà siamo in perfetto orario.",
          "english": "I thought it was late, but in reality we are right on time."
        },
        {
          "word": "festeggiare (to celebrate)",
          "storyContext": "« Stasera festeggiamo con una pizza calda in piazza! »",
          "newPhrase": "Domani sera festeggiamo il tuo compleanno nel nostro ristorante preferito.",
          "english": "Tomorrow evening we are celebrating your birthday at our favorite restaurant."
        }
      ],
      "construction": {
        "patternName": "Combined Indirect + Direct Pronouns: glielo / gliela + [Verb]",
        "formula": [
          "gli / le (to him / her / formal You)",
          "+ lo / la (it)",
          "= glielo / gliela + Verb"
        ],
        "explanation": "When combining an indirect object pronoun (« gli » = to him, « le » = to her / formal You) with a direct object pronoun (« lo / la » = it), Italian merges them into a single word before the verb: « glielo » ('it to him/her/You').",
        "examples": [
          {
            "target": "Glielo spieghiamo subito, professore!",
            "english": "We will explain it to you right away, professor!",
            "highlight": "Glielo spieghiamo"
          },
          {
            "target": "Hai il libro? Sì, glielo porto domani mattina.",
            "english": "Do you have the book? Yes, I’m bringing it to him/her tomorrow morning.",
            "highlight": "glielo porto"
          },
          {
            "target": "È una storia importante: gliela racconto stasera.",
            "english": "It’s an important story: I’ll tell it to him/her tonight.",
            "highlight": "gliela racconto"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "We will explain it to you right away, sir!",
            "sentenceParts": [
              "« ",
              " spieghiamo subito, signore! »"
            ],
            "correctAnswer": "Glielo",
            "options": [
              "Glielo",
              "Loro lo",
              "Ci la",
              "Se ne"
            ],
            "explanation": "« Glielo » combines « Le/gli » (to You/him) + « lo » (it) into a single word before the verb."
          },
          {
            "promptEnglish": "The shopkeeper locks the door before opening the safe.",
            "sentenceParts": [
              "Il negoziante chiude la porta ",
              " prima di aprire la cassaforte."
            ],
            "correctAnswer": "a chiave",
            "options": [
              "a chiave",
              "con chiave",
              "di chiave",
              "in chiave"
            ],
            "explanation": "The Italian idiom for 'to lock' is « chiudere a chiave »."
          },
          {
            "promptEnglish": "How did you two find this ancient manuscript at the market?",
            "sentenceParts": [
              "« Come ",
              " questo manoscritto antico al mercato? »"
            ],
            "correctAnswer": "avete trovato",
            "options": [
              "avete trovato",
              "siete trovati",
              "hai trovato",
              "hanno trovare"
            ],
            "explanation": "Addressing two people (« voi »), the passato prossimo of « trovare » is « avete trovato »."
          },
          {
            "promptEnglish": "That man is actually an inspector from the Venice museum!",
            "sentenceParts": [
              "« Quell’uomo è ",
              " un ispettore del museo di Venezia! »"
            ],
            "correctAnswer": "in realtà",
            "options": [
              "in realtà",
              "in fretta",
              "in angolo",
              "in mano"
            ],
            "explanation": "« In realtà » means 'actually / in reality'."
          },
          {
            "promptEnglish": "Thank you for your help! Now I will play a melody for you.",
            "sentenceParts": [
              "« Grazie per l’aiuto! Adesso ",
              " una melodia per voi. »"
            ],
            "correctAnswer": "suonerò",
            "options": [
              "suonerò",
              "suonavo",
              "suonate",
              "suonassi"
            ],
            "explanation": "« Suonerò » ('I will play') is the 1st-person singular future tense of « suonare »."
          },
          {
            "promptEnglish": "Tonight we celebrate our success with a hot pizza in the square!",
            "sentenceParts": [
              "« Stasera ",
              " il nostro successo con una pizza calda in piazza! »"
            ],
            "correctAnswer": "festeggiamo",
            "options": [
              "festeggiamo",
              "rubiamo",
              "chiudiamo",
              "salviamo"
            ],
            "explanation": "« Festeggiamo » ('we celebrate / we are celebrating') uses the present tense for tonight's plan."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Direttore : « Non capisco come sia successo questo problema. Chi me lo può spiegare ? »",
            "speakerAEnglish": "Director: 'I don't understand how this problem happened. Who can explain it to me?'",
            "promptEnglish": "Reply politely: 'We will explain it to you right away, Director!'",
            "correctAnswer": "Glielo spieghiamo subito noi, Direttore!",
            "options": [
              "Glielo spieghiamo subito noi, Direttore!",
              "Chiudiamo la porta a chiave dietro gli strumenti!",
              "Stasera festeggiamo con una pizza calda in piazza!",
              "Un ladro sul treno voleva rubare la valigia!"
            ],
            "explanation": "Uses « Glielo spieghiamo subito » ('We explain it to You right away')."
          },
          {
            "speakerA": "Collega : « Hai chiuso bene l’ufficio prima di scendere ? »",
            "speakerAEnglish": "Colleague: 'Did you close the office securely before coming down?'",
            "promptEnglish": "Confirm that yes, you locked the door and put the key in your bag:",
            "correctAnswer": "Sì, ho chiuso la porta a chiave e ho messo la chiave in borsa.",
            "options": [
              "Sì, ho chiuso la porta a chiave e ho messo la chiave in borsa.",
              "No, ho aperto la custodia di velluto rosso al sole.",
              "Sì, suonerò il violino d’oro per tutti gli ospiti.",
              "No, la bottega si trova nell’angolo della piazzetta."
            ],
            "explanation": "« Ho chiuso la porta a chiave » = I locked the door."
          },
          {
            "speakerA": "Amico : « Pensavo che quel signore fosse un turista smarrito! »",
            "speakerAEnglish": "Friend: 'I thought that gentleman was a lost tourist!'",
            "promptEnglish": "Reveal that he is actually an inspector from the art museum:",
            "correctAnswer": "Invece no, è in realtà un ispettore del museo d’arte!",
            "options": [
              "Invece no, è in realtà un ispettore del museo d’arte!",
              "Allora entriamo subito nella bottega silenziosa!",
              "Come avete trovato questa pagina antica al mercato?",
              "Prendi lo strumento musicale tra le mani con cura!"
            ],
            "explanation": "« È in realtà un ispettore... » means 'He is actually an inspector...'."
          },
          {
            "speakerA": "Maestro : « Avete riportato il quaderno antico sano e salvo! Come posso ringraziarvi ? »",
            "speakerAEnglish": "Master craftsman: 'You brought the antique notebook back safe and sound! How can I thank you?'",
            "promptEnglish": "Ask him if he will play a melody on his violin for you:",
            "correctAnswer": "Suonerà una melodia con il suo violino per noi?",
            "options": [
              "Suonerà una melodia con il suo violino per noi?",
              "Chiuderà l’armadio segreto dietro il tavolo?",
              "Ruberà la mappa antica sul treno del mattino?",
              "Comprerete una custodia di velluto rosso?"
            ],
            "explanation": "Uses the future tense « Suonerà... per noi? » ('Will you play... for us?')."
          },
          {
            "speakerA": "Amica : « Abbiamo finito tutti gli esami di italiano con un ottimo voto! »",
            "speakerAEnglish": "Friend: 'We finished all our Italian exams with a great grade!'",
            "promptEnglish": "Propose celebrating tonight with a hot pizza in the main square:",
            "correctAnswer": "Che bello! Stasera festeggiamo con una pizza calda nella piazza principale!",
            "options": [
              "Che bello! Stasera festeggiamo con una pizza calda nella piazza principale!",
              "Che peccato! Dobbiamo nasconderci dietro la vecchia fontana!",
              "Attenzione! Qualcuno vuole rubare i nostri appunti di storia!",
              "Scusa! Ho lasciato gli occhiali scuri dentro l’armadio!"
            ],
            "explanation": "« Stasera festeggiamo con una pizza calda... » is a natural celebratory invitation."
          },
          {
            "speakerA": "Visitatore : « Dove si trova il laboratorio di restauro dei violini ? »",
            "speakerAEnglish": "Visitor: 'Where is the violin restoration workshop located?'",
            "promptEnglish": "Say it is in the corner of the quiet little square:",
            "correctAnswer": "Si trova nell’angolo della piazzetta silenziosa.",
            "options": [
              "Si trova nell’angolo della piazzetta silenziosa.",
              "Si apre con una piccola chiave d’oro antica.",
              "Si legge sottovoce sul treno per la costa.",
              "Si compra al mercato dei fiori ogni mattina."
            ],
            "explanation": "« Nell’angolo della piazzetta silenziosa » = In the corner of the quiet little square."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "L’artigiano chiude la porta a chiave e apre un armadio segreto dietro il banco.",
            "correctAnswer": "The craftsman locks the door and opens a secret cabinet behind the workbench.",
            "options": [
              "The craftsman locks the door and opens a secret cabinet behind the workbench.",
              "The craftsman opens the front door and cleans the glass cabinet near the window.",
              "The craftsman leaves the key on the counter and closes the workshop early.",
              "The craftsman repairs an antique clock inside the cabinet behind the door."
            ],
            "explanation": "« Chiude la porta a chiave e apre un armadio segreto dietro il banco »."
          },
          {
            "audioSentence": "Glielo spieghiamo subito, ma prima dobbiamo mettere al sicuro questo documento.",
            "correctAnswer": "We will explain it to you right away, but first we must put this document in a safe place.",
            "options": [
              "We will explain it to you right away, but first we must put this document in a safe place.",
              "We already explained it to him yesterday, when we found the document on the train.",
              "We cannot explain it to you now, because we lost the document at the market.",
              "We will read it to you tonight, after we translate the last page of the document."
            ],
            "explanation": "« Glielo spieghiamo subito, ma prima dobbiamo... » = We will explain it to you right away, but first we must..."
          },
          {
            "audioSentence": "Quel signore distinto è in realtà un esperto d’arte del museo nazionale.",
            "correctAnswer": "That distinguished gentleman is actually an art expert from the national museum.",
            "options": [
              "That distinguished gentleman is actually an art expert from the national museum.",
              "That distinguished gentleman is looking for the director of the national museum.",
              "That distinguished gentleman donated a famous painting to the national museum.",
              "That distinguished gentleman used to work as a guard at the national museum."
            ],
            "explanation": "« È in realtà un esperto d’arte del museo nazionale » = is actually an art expert from the national museum."
          },
          {
            "audioSentence": "Il custode apre la custodia di velluto rosso e mostra lo strumento illuminato dal sole.",
            "correctAnswer": "The caretaker opens the red velvet case and shows the instrument lit by the sun.",
            "options": [
              "The caretaker opens the red velvet case and shows the instrument lit by the sun.",
              "The caretaker closes the black leather case and puts the instrument in the cabinet.",
              "The caretaker cleans the red velvet curtain and opens the window to the sun.",
              "The caretaker looks inside the empty case and realizes the instrument is missing."
            ],
            "explanation": "« Apre la custodia di velluto rosso e mostra lo strumento illuminato dal sole »."
          },
          {
            "audioSentence": "Grazie di cuore, avete salvato un capolavoro antico e adesso suonerò per voi!",
            "correctAnswer": "Thank you from the heart; you have saved an ancient masterpiece and now I will play for you!",
            "options": [
              "Thank you from the heart; you have saved an ancient masterpiece and now I will play for you!",
              "Thank you very much; you have found the right street and now we can visit the museum!",
              "Excuse me please; you have taken the wrong case and now we must return to the station!",
              "Congratulations to you both; you have passed the music exam and now we will celebrate!"
            ],
            "explanation": "« Avete salvato un capolavoro antico e adesso suonerò per voi! »."
          },
          {
            "audioSentence": "Dopo questa lunga giornata, stasera festeggiamo tutti insieme con una pizza calda in piazza.",
            "correctAnswer": "After this long day, tonight we are all celebrating together with a hot pizza in the square.",
            "options": [
              "After this long day, tonight we are all celebrating together with a hot pizza in the square.",
              "Before this long trip, today we are having a quick coffee near the train station.",
              "After the concert tonight, we will walk back to the hotel through the quiet square.",
              "During the afternoon break, we bought a slice of hot pizza at the bakery."
            ],
            "explanation": "« Stasera festeggiamo tutti insieme con una pizza calda in piazza »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Italian: 'We will explain it to you (formal) right away!'?",
            "correctAnswer": "Glielo spieghiamo subito!",
            "options": [
              "Glielo spieghiamo subito!",
              "Le lo spieghiamo subito!",
              "Lo gli spieghiamo subito!",
              "Spieghiamo a Lei esso subito!"
            ],
            "explanation": "When « Le » (to You) or « gli » (to him) precedes « lo/la/li/le », it becomes « glie- » and joins into one word: « Glielo spieghiamo »."
          },
          {
            "promptEnglish": "Choose the correct Italian phrase for: 'He locks the door.'",
            "correctAnswer": "Chiude la porta a chiave.",
            "options": [
              "Chiude la porta a chiave.",
              "Serratura la porta con chiave.",
              "Chiude a la porta di chiave.",
              "Blocca la porta per chiave."
            ],
            "explanation": "The natural Italian expression for locking a door is « chiudere la porta a chiave »."
          },
          {
            "promptEnglish": "Select the correct question: 'How did you (plural) find this page?'",
            "correctAnswer": "Come avete trovato questa pagina?",
            "options": [
              "Come avete trovato questa pagina?",
              "Come siete trovati questa pagina?",
              "Come avete trovata a questa pagina?",
              "Come trovaste voi a questa pagina?"
            ],
            "explanation": "Transitive verbs like « trovare » take the auxiliary « avere » in the passato prossimo (« avete trovato »)."
          },
          {
            "promptEnglish": "How do you say: 'You saved the golden violin, and now I will play for you'?",
            "correctAnswer": "Avete salvato il violino d’oro, e adesso suonerò per voi.",
            "options": [
              "Avete salvato il violino d’oro, e adesso suonerò per voi.",
              "Siete salvato il violino d’oro, e adesso gioco per voi.",
              "Avete salvati l’oro violino, e ora suonare per voi.",
              "Hai salvato il violino di oro, e adesso suonerò a voi."
            ],
            "explanation": "1) Musical instruments use « suonare » (never « giocare »!), 2) « suonerò » is the 1st-person future, and 3) material is « d’oro » ('of gold')."
          },
          {
            "promptEnglish": "Which sentence accurately translates: 'In the corner of the quiet little square'?",
            "correctAnswer": "Nell’angolo della piazzetta silenziosa",
            "options": [
              "Nell’angolo della piazzetta silenziosa",
              "In l’angolo di la piazzetta silenziosa",
              "Nello angolo dalla silenziosa piazzetta",
              "Al angolo del piazzetta silenzioso"
            ],
            "explanation": "« In + l’ » contracts to « Nell’ » before a vowel (« Nell’angolo »), and « di + la » contracts to « della »."
          },
          {
            "promptEnglish": "Choose the natural Italian sentence for: 'She takes the violin in her hands.'",
            "correctAnswer": "Prende il violino tra le mani.",
            "options": [
              "Prende il violino tra le mani.",
              "Prende il violino nelle sue mane.",
              "Piglia al violino fra i mani.",
              "Prende lo violino con le sue mano."
            ],
            "explanation": "« Mano » is feminine with an irregular plural « le mani », and Italian omits the possessive adjective with body parts when the owner is clear (« tra le mani »)."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "We will explain it to you right away, sir!",
            "chunks": [
              "glielo",
              "spieghiamo",
              "subito,",
              "signore!"
            ],
            "explanation": "Combined pronoun (« glielo ») + Present verb (« spieghiamo ») + Adverb (« subito ») + Vocative (« signore! »)."
          },
          {
            "promptEnglish": "The craftsman locks the door and opens a secret cabinet.",
            "chunks": [
              "l’artigiano",
              "chiude la porta a chiave",
              "e apre",
              "un armadio segreto"
            ],
            "explanation": "Subject (« l’artigiano ») + First action (« chiude la porta a chiave ») + Second action (« e apre un armadio segreto »)."
          },
          {
            "promptEnglish": "That man is actually an inspector from the Venice museum.",
            "chunks": [
              "quell’uomo",
              "è in realtà",
              "un ispettore",
              "del museo di Venezia"
            ],
            "explanation": "Subject (« quell’uomo ») + Verb & Adverbial (« è in realtà ») + Predicate (« un ispettore del museo di Venezia »)."
          },
          {
            "promptEnglish": "You saved the golden violin, and now I will play for you.",
            "chunks": [
              "avete salvato",
              "il violino d’oro,",
              "e adesso",
              "suonerò per voi"
            ],
            "explanation": "Past clause (« avete salvato il violino d’oro ») + Future clause (« e adesso suonerò per voi »)."
          },
          {
            "promptEnglish": "Tonight we celebrate with a hot pizza in the square!",
            "chunks": [
              "stasera",
              "festeggiamo",
              "con una pizza calda",
              "in piazza!"
            ],
            "explanation": "Time (« stasera ») + Verb (« festeggiamo ») + Accompaniment (« con una pizza calda ») + Place (« in piazza! »)."
          },
          {
            "promptEnglish": "How did you find this antique page at the market?",
            "chunks": [
              "come",
              "avete trovato",
              "questa pagina antica",
              "al mercato?"
            ],
            "explanation": "Interrogative (« come ») + Verb (« avete trovato ») + Object (« questa pagina antica ») + Location (« al mercato? »)."
          }
        ]
      }
    }
  },
  "es": {
    "1": {
      "subtitle": "Ongoing State ('llevar + participio'), Polite Advice ('no deberías'), Prepositions & Determination",
      "vocabReuses": [
        {
          "word": "frente a (in front of / facing)",
          "storyContext": "Bajó del autobús frente al puerto.",
          "newPhrase": "Te espero en la cafetería que está frente a la estación.",
          "english": "I’ll wait for you at the café that is facing the station."
        },
        {
          "word": "sin dudarlo (without hesitating)",
          "storyContext": "Sin dudarlo un segundo, introdujo la llave en la cerradura.",
          "newPhrase": "Cuando me ofrecieron el viaje, acepté sin dudarlo.",
          "english": "When they offered me the trip, I accepted without hesitating."
        },
        {
          "word": "llevar + participio (to have been [in a state] for...)",
          "storyContext": "« ¡Esa lámpara lleva apagada más de treinta años! »",
          "newPhrase": "Esta tienda antigua lleva cerrada desde el invierno pasado.",
          "english": "This old shop has been closed since last winter."
        }
      ],
      "construction": {
        "patternName": "Duration of a State: llevar + [Past Participle] + [Time Period]",
        "formula": [
          "Lleva / Llevan",
          "+ Past Participle (-ado / -ido)",
          "+ Time Duration (treinta años / dos días)"
        ],
        "explanation": "To express how long something 'has been' in a particular state (turned off, closed, broken, open), Spanish uses « llevar » + a past participle agreeing in gender and number with the subject + the time duration.",
        "examples": [
          {
            "target": "Esa lámpara lleva apagada más de treinta años.",
            "english": "That lamp has been turned off for more than thirty years.",
            "highlight": "lleva apagada"
          },
          {
            "target": "La puerta principal lleva abierta toda la mañana.",
            "english": "The main door has been open all morning.",
            "highlight": "lleva abierta"
          },
          {
            "target": "Mis amigos llevan sentados aquí media hora.",
            "english": "My friends have been seated here for half an hour.",
            "highlight": "llevan sentados"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "When I got off the bus in front of the harbor, a thick fog was covering the street.",
            "sentenceParts": [
              "Cuando ",
              " del autobús frente al puerto, una espesa niebla cubría la calle."
            ],
            "correctAnswer": "bajé",
            "options": [
              "bajé",
              "subí",
              "encendí",
              "dudé"
            ],
            "explanation": "In Spanish, 'to get off' a bus or train is « bajar de » (« bajé del autobús »)."
          },
          {
            "promptEnglish": "If you are looking for the old lighthouse, you shouldn't go up alone tonight.",
            "sentenceParts": [
              "« Si buscas el viejo faro, no ",
              " subir sola esta noche. »"
            ],
            "correctAnswer": "deberías",
            "options": [
              "deberías",
              "llevabas",
              "sabías",
              "abrías"
            ],
            "explanation": "The conditional « deberías » ('you should') softens advice politely: « no deberías subir » ('you shouldn't go up')."
          },
          {
            "promptEnglish": "That antique clock has been broken for more than ten years!",
            "sentenceParts": [
              "« ¡Ese reloj antiguo ",
              " estropeado más de diez años! »"
            ],
            "correctAnswer": "lleva",
            "options": [
              "lleva",
              "hace",
              "tiene",
              "es"
            ],
            "explanation": "« Llevar + participle + duration » expresses how long something has been in a state."
          },
          {
            "promptEnglish": "Without hesitating for a second, I inserted the key into the lock.",
            "sentenceParts": [
              "",
              " un segundo, introduje la llave en la cerradura."
            ],
            "correctAnswer": "Sin dudarlo",
            "options": [
              "Sin dudarlo",
              "Con saberlo",
              "Por cubrirlo",
              "Para bajarlo"
            ],
            "explanation": "« Sin + infinitive » means 'without doing' (« Sin dudarlo » = Without hesitating / doubting it)."
          },
          {
            "promptEnglish": "Give me the flashlight, please; we are going to discover the truth.",
            "sentenceParts": [
              "« ",
              " la linterna, por favor; vamos a descubrir la verdad. »"
            ],
            "correctAnswer": "Dame",
            "options": [
              "Dame",
              "Dime",
              "Date",
              "Damos"
            ],
            "explanation": "« Dame » combines the « tú » imperative of « dar » (« da ») + the indirect object pronoun « me » ('give me')."
          },
          {
            "promptEnglish": "Someone sent me an unsigned letter from the coast.",
            "sentenceParts": [
              "Alguien me envió una carta ",
              " desde la costa."
            ],
            "correctAnswer": "sin firma",
            "options": [
              "sin firma",
              "con niebla",
              "entre olas",
              "bajo llave"
            ],
            "explanation": "« Sin firma » means 'unsigned / without a signature'."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Vecino : « La noche está muy oscura y hay mucha niebla en el sendero. ¿Vas a salir ahora ? »",
            "speakerAEnglish": "Neighbor: 'The night is very dark and there is a lot of fog on the trail. Are you going out now?'",
            "promptEnglish": "Advise your friend that they shouldn't walk up to the cliff alone tonight:",
            "correctAnswer": "Tienes razón, no deberías subir sola al acantilado esta noche.",
            "options": [
              "Tienes razón, no deberías subir sola al acantilado esta noche.",
              "Bajé del autobús frente al mercado de pescado ayer.",
              "La puerta de madera se abrió lentamente con un crujido.",
              "Alguien escondió una moneda antigua debajo de la mesa."
            ],
            "explanation": "Uses « no deberías + infinitive » for caring advice."
          },
          {
            "speakerA": "Viajero : « ¡Mira! Hay una luz azul brillando en lo alto de aquella torre antigua. »",
            "speakerAEnglish": "Traveler: 'Look! There is a blue light shining at the top of that ancient tower.'",
            "promptEnglish": "Exclaim in surprise that it's impossible because that lamp has been turned off for thirty years:",
            "correctAnswer": "¡Imposible, esa lámpara lleva apagada más de treinta años!",
            "options": [
              "¡Imposible, esa lámpara lleva apagada más de treinta años!",
              "¡Qué bien, el autobús llega al puerto en cinco minutos!",
              "¡Claro, guardé la carta sin firma dentro de mi abrigo!",
              "¡Cuidado, las barcas de madera están junto al muelle!"
            ],
            "explanation": "« Lleva apagada más de treinta años » naturally expresses an ongoing state over a period of time."
          },
          {
            "speakerA": "Compañero : « No se ve nada en este pasillo tan oscuro. ¿Tienes algo para alumbrar ? »",
            "speakerAEnglish": "Companion: 'You can't see anything in this dark hallway. Do you have something for light?'",
            "promptEnglish": "Say that you have a flashlight in your bag and hand it over so you can move forward:",
            "correctAnswer": "Sí, toma mi linterna para iluminar el camino.",
            "options": [
              "Sí, toma mi linterna para iluminar el camino.",
              "No, el viento resuena con fuerza entre las olas.",
              "Sí, la cerradura de hierro está muy oxidada.",
              "No, bajamos del tren frente a la plaza mayor."
            ],
            "explanation": "Uses « linterna » (flashlight/lantern) and « iluminar » (to light up)."
          },
          {
            "speakerA": "Amiga : « ¿Cómo sabes que hay un documento histórico guardado en ese edificio ? »",
            "speakerAEnglish": "Friend: 'How do you know there is a historical document kept in that building?'",
            "promptEnglish": "Explain that someone sent you a message from here and you know your grandfather hid something there:",
            "correctAnswer": "Porque alguien me envió un mensaje desde aquí y sé que mi abuelo escondió algo allí.",
            "options": [
              "Porque alguien me envió un mensaje desde aquí y sé que mi abuelo escondió algo allí.",
              "Porque la espesa niebla cubre todas las barcas del puerto pesquero.",
              "Porque dimos un paso atrás con mucho asombro al ver el mar.",
              "Porque la pesada puerta de hierro lleva cerrada toda la semana."
            ],
            "explanation": "Recombines « alguien me envió un mensaje desde aquí » and « sé que mi abuelo escondió algo »."
          },
          {
            "speakerA": "Guía : « La cerradura parece muy antigua, pero esta llave de hierro debería funcionar. »",
            "speakerAEnglish": "Guide: 'The lock looks very old, but this iron key should work.'",
            "promptEnglish": "Say that without hesitating a second, you will try opening the heavy door:",
            "correctAnswer": "Sin dudarlo un segundo, voy a intentar abrir la pesada puerta.",
            "options": [
              "Sin dudarlo un segundo, voy a intentar abrir la pesada puerta.",
              "A través de la niebla, vimos las luces de la ciudad costera.",
              "Frente a la parada del autobús, compramos dos cafés calientes.",
              "Hace treinta años, los marineros construyeron este muelle."
            ],
            "explanation": "« Sin dudarlo un segundo » = Without hesitating for a second."
          },
          {
            "speakerA": "Amigo : « Se oye un ruido extraño en el piso de arriba. ¿Qué hacemos ? »",
            "speakerAEnglish": "Friend: 'A strange noise can be heard on the floor upstairs. What do we do?'",
            "promptEnglish": "Say with determination: 'Whoever it is that is upstairs, we are going to discover the truth!'",
            "correctAnswer": "¡Sea quien sea el que está arriba, vamos a descubrir la verdad!",
            "options": [
              "¡Sea quien sea el que está arriba, vamos a descubrir la verdad!",
              "¡Saca el billete de autobús del bolsillo de tu abrigo!",
              "¡La niebla espesa cubre la cúpula de cristal esta mañana!",
              "¡No camines tan rápido por la orilla de la playa!"
            ],
            "explanation": "« Sea quien sea » ('whoever it may be') uses the reduplicated present subjunctive of « ser »."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Cuando bajamos del autobús frente al puerto, una espesa niebla cubría el mar.",
            "correctAnswer": "When we got off the bus in front of the harbor, a thick fog was covering the sea.",
            "options": [
              "When we got off the bus in front of the harbor, a thick fog was covering the sea.",
              "When we got on the bus near the harbor, a bright sun was shining over the sea.",
              "Before we arrived at the harbor by train, a heavy storm started over the sea.",
              "While we waited for the bus at the harbor, the fishermen were repairing their boats."
            ],
            "explanation": "« Cuando bajamos del autobús frente al puerto, una espesa niebla cubría el mar »."
          },
          {
            "audioSentence": "Si buscas el sendero hacia el acantilado, no deberías caminar sin una buena linterna.",
            "correctAnswer": "If you are looking for the trail to the cliff, you shouldn’t walk without a good flashlight.",
            "options": [
              "If you are looking for the trail to the cliff, you shouldn’t walk without a good flashlight.",
              "If you find the key to the lighthouse, you should lock the iron door before leaving.",
              "When you reach the top of the cliff, you will see all the wooden boats in the bay.",
              "Since you know the trail to the cliff, you can guide the tourists this afternoon."
            ],
            "explanation": "« Si buscas el sendero hacia el acantilado, no deberías caminar sin una buena linterna »."
          },
          {
            "audioSentence": "Aquella casa de piedra junto a la costa lleva deshabitada más de veinte años.",
            "correctAnswer": "That stone house beside the coast has been uninhabited for more than twenty years.",
            "options": [
              "That stone house beside the coast has been uninhabited for more than twenty years.",
              "That stone house beside the coast was built by a sailor twenty years ago.",
              "That stone house beside the coast will be turned into a museum next year.",
              "That stone house beside the coast belongs to our family since last summer."
            ],
            "explanation": "« Lleva deshabitada más de veinte años » = has been uninhabited for more than twenty years."
          },
          {
            "audioSentence": "Sin dudarlo un segundo, introduje la llave antigua en la cerradura y abrí la puerta.",
            "correctAnswer": "Without hesitating for a second, I inserted the antique key into the lock and opened the door.",
            "options": [
              "Without hesitating for a second, I inserted the antique key into the lock and opened the door.",
              "After waiting for a long time, I knocked on the heavy door and called out loudly.",
              "Without making any noise, I left the antique key inside the envelope under the door.",
              "Before opening the iron door, I looked through the window with my flashlight."
            ],
            "explanation": "« Sin dudarlo un segundo, introduje la llave antigua en la cerradura... »."
          },
          {
            "audioSentence": "Alguien me envió esta carta sin firma para avisarme del peligro.",
            "correctAnswer": "Someone sent me this unsigned letter to warn me of the danger.",
            "options": [
              "Someone sent me this unsigned letter to warn me of the danger.",
              "Someone left a signed book on my desk to thank me for my help.",
              "Nobody answered the letter that I sent from the post office yesterday.",
              "Everyone in the village knows who wrote that mysterious message."
            ],
            "explanation": "« Alguien me envió esta carta sin firma para avisarme... » = Someone sent me this unsigned letter to warn me..."
          },
          {
            "audioSentence": "La pesada puerta de madera se abrió lentamente con un crujido profundo.",
            "correctAnswer": "The heavy wooden door opened slowly with a deep creak.",
            "options": [
              "The heavy wooden door opened slowly with a deep creak.",
              "The heavy wooden door closed suddenly because of the strong wind.",
              "The small iron window remained locked throughout the entire storm.",
              "The old wooden boat moved gently among the waves of the harbor."
            ],
            "explanation": "« La pesada puerta de madera se abrió lentamente con un crujido profundo »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Spanish: 'That lamp has been turned off for more than thirty years!'?",
            "correctAnswer": "¡Esa lámpara lleva apagada más de treinta años!",
            "options": [
              "¡Esa lámpara lleva apagada más de treinta años!",
              "¡Esa lámpara ha sido apagada por más que treinta años!",
              "¡Esa lámpara tiene apagada más de treinta años!",
              "¡Esa lámpara está apagando desde treinta años!"
            ],
            "explanation": "1) Ongoing states over a duration use « llevar + past participle » (« lleva apagada »), and 2) before numbers, 'more than' is « más de » (never « más que »!)."
          },
          {
            "promptEnglish": "Choose the correct Spanish translation for: 'When she got off the bus in front of the harbor'",
            "correctAnswer": "Cuando bajó del autobús frente al puerto",
            "options": [
              "Cuando bajó del autobús frente al puerto",
              "Cuando salió fuera el autobús en frente del puerto",
              "Cuando bajó desde autobús delante a puerto",
              "Cuando se bajaba al autobús frente el puerto"
            ],
            "explanation": "« Bajar de + el » contracts to « bajar del » ('to get off'), and « frente a + el » contracts to « frente al » ('in front of / facing')."
          },
          {
            "promptEnglish": "Select the accurate sentence for: 'Without hesitating for a second'",
            "correctAnswer": "Sin dudarlo un segundo",
            "options": [
              "Sin dudarlo un segundo",
              "Sin dudándolo por un segundo",
              "Sin dudar lo un segundo",
              "No dudando él un segundo"
            ],
            "explanation": "In Spanish, prepositions like « sin » are ALWAYS followed by the infinitive (never the -ndo gerund!), with the object pronoun « lo » attached to the end: « sin dudarlo »."
          },
          {
            "promptEnglish": "How do you express: 'Whoever it is that is upstairs, we are going to discover the truth'?",
            "correctAnswer": "Sea quien sea el que está arriba, vamos a descubrir la verdad.",
            "options": [
              "Sea quien sea el que está arriba, vamos a descubrir la verdad.",
              "Es quien es lo que es arriba, vamos descubrir la verdad.",
              "Sea quién es que está arriba, iremos a descubriendo la verdad.",
              "Esté quien esté quien es arriba, vamos por descubrir la verdad."
            ],
            "explanation": "« Sea quien sea » ('whoever it may be') uses the present subjunctive twice, and the near future is always « ir + a + infinitive » (« vamos a descubrir »)."
          },
          {
            "promptEnglish": "Which sentence correctly gives polite advice to a female friend: 'You shouldn't go up alone tonight'?",
            "correctAnswer": "No deberías subir sola esta noche.",
            "options": [
              "No deberías subir sola esta noche.",
              "No deberías a subir solo en esta noche.",
              "No debes que subir únicamente esta noche.",
              "No te deberías subiendo sola esta noche."
            ],
            "explanation": "« Deberías » (conditional of « deber ») takes a bare infinitive (« subir ») without a preposition, and « sola » agrees in gender with the person addressed."
          },
          {
            "promptEnglish": "Choose the natural Spanish way to say: 'The heavy door opened slowly.'",
            "correctAnswer": "La pesada puerta se abrió lentamente.",
            "options": [
              "La pesada puerta se abrió lentamente.",
              "La pesada puerta abrió sí misma lento.",
              "La puerta pesado fue abriendo lentamente.",
              "Se abrieron la pesada puerta lentamente."
            ],
            "explanation": "When an inanimate object opens without a mentioned agent, Spanish uses the reflexive/pronominal construction « se abrió »."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "That lamp has been turned off for more than thirty years!",
            "chunks": [
              "¡esa lámpara",
              "lleva apagada",
              "más de",
              "treinta años!"
            ],
            "explanation": "Subject (« ¡esa lámpara ») + State verb (« lleva apagada ») + Comparison before number (« más de ») + Duration (« treinta años! »)."
          },
          {
            "promptEnglish": "If you are looking for the lighthouse, you shouldn't go up alone.",
            "chunks": [
              "si buscas",
              "el faro,",
              "no deberías",
              "subir sola"
            ],
            "explanation": "Conditional clause (« si buscas el faro ») + Advice clause (« no deberías subir sola »)."
          },
          {
            "promptEnglish": "Without hesitating for a second, I opened the heavy door.",
            "chunks": [
              "sin dudarlo",
              "un segundo,",
              "abrí",
              "la pesada puerta"
            ],
            "explanation": "Prepositional infinitive phrase (« sin dudarlo un segundo ») + Preterite verb (« abrí ») + Direct object (« la pesada puerta »)."
          },
          {
            "promptEnglish": "Someone sent me this unsigned message from here.",
            "chunks": [
              "alguien",
              "me envió",
              "este mensaje",
              "sin firma desde aquí"
            ],
            "explanation": "Subject (« alguien ») + Pronoun & Verb (« me envió ») + Object (« este mensaje ») + Modifiers (« sin firma desde aquí »)."
          },
          {
            "promptEnglish": "Give me the flashlight, we are going to discover the truth.",
            "chunks": [
              "dame",
              "la linterna,",
              "vamos a",
              "descubrir la verdad"
            ],
            "explanation": "Imperative + Object (« dame la linterna ») + Near future (« vamos a descubrir la verdad »)."
          },
          {
            "promptEnglish": "When I got off the bus, a thick fog was covering the harbor.",
            "chunks": [
              "cuando bajé",
              "del autobús,",
              "una espesa niebla",
              "cubría el puerto"
            ],
            "explanation": "Preterite event (« cuando bajé del autobús ») + Imperfect background (« una espesa niebla cubría el puerto »)."
          }
        ]
      }
    },
    "2": {
      "subtitle": "Upon Arriving ('al + infinitive'), Impersonal Perception ('se oyen'), Composure & Past Expectations",
      "vocabReuses": [
        {
          "word": "al + infinitivo (upon doing / when doing)",
          "storyContext": "Al llegar a la cima, descubrieron que la puerta estaba entreabierta.",
          "newPhrase": "Al salir de la estación, vimos el mar brillando bajo el sol.",
          "english": "Upon leaving the station, we saw the sea shining under the sun."
        },
        {
          "word": "entreabierto/a (ajar / half-open)",
          "storyContext": "La pesada puerta de hierro estaba entreabierta.",
          "newPhrase": "Dejé la ventana entreabierta para que entrara la brisa fresca.",
          "english": "I left the window ajar so that the fresh breeze would come in."
        },
        {
          "word": "sin perder la calma (without losing one’s calm)",
          "storyContext": "Sin perder la calma, subió hacia el destello azul.",
          "newPhrase": "El piloto resolvió el problema técnico sin perder la calma.",
          "english": "The pilot solved the technical problem without losing his calm."
        }
      ],
      "construction": {
        "patternName": "Immediate Temporal Trigger: Al + [Infinitive Verb], [Main Past Action]",
        "formula": [
          "Al (a + el)",
          "+ Infinitive Verb (llegar / abrir)",
          "+ Preterite Main Clause"
        ],
        "explanation": "In Spanish, « al + infinitive » is a crisp, natural way to say 'upon doing X / right when doing X' without needing a full conjugated « cuando » clause.",
        "examples": [
          {
            "target": "Al llegar a la cima, vimos la puerta entreabierta.",
            "english": "Upon reaching the top, we saw the door ajar.",
            "highlight": "Al llegar"
          },
          {
            "target": "Al escuchar aquellos pasos, bajé la voz enseguida.",
            "english": "Upon hearing those footsteps, I lowered my voice right away.",
            "highlight": "Al escuchar"
          },
          {
            "target": "Al encender la linterna, encontramos el cuaderno de cuero.",
            "english": "Upon turning on the flashlight, we found the leather notebook.",
            "highlight": "Al encender"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "Come on, I will go with you along the cliff trail!",
            "sentenceParts": [
              "« ¡Vamos, yo te ",
              " por el sendero del acantilado! »"
            ],
            "correctAnswer": "acompaño",
            "options": [
              "acompaño",
              "susurro",
              "sostengo",
              "descubro"
            ],
            "explanation": "« Yo te acompaño » ('I'll go with you / accompany you') uses the present indicative for an immediate offer."
          },
          {
            "promptEnglish": "Upon reaching the top of the hill, we saw the old tower.",
            "sentenceParts": [
              "",
              " a la cima de la colina, vimos la vieja torre."
            ],
            "correctAnswer": "Al llegar",
            "options": [
              "Al llegar",
              "Del llegar",
              "En llegando",
              "Por llegado"
            ],
            "explanation": "« Al + infinitive » means 'upon doing / when doing'."
          },
          {
            "promptEnglish": "Wait a moment… footsteps can be heard upstairs on the spiral staircase!",
            "sentenceParts": [
              "« Espera un momento… ",
              " pasos arriba en la escalera de caracol. »"
            ],
            "correctAnswer": "se oyen",
            "options": [
              "se oyen",
              "se oye",
              "oyen se",
              "está oyendo"
            ],
            "explanation": "In passive « se » constructions, the verb agrees with the plural subject « pasos »: « se oyen pasos » ('footsteps are heard')."
          },
          {
            "promptEnglish": "Without losing my calm, I asked aloud: 'Who goes there?'",
            "sentenceParts": [
              "Sin perder la calma, pregunté ",
              ": « ¿Quién anda ahí? »"
            ],
            "correctAnswer": "en voz alta",
            "options": [
              "en voz alta",
              "a voz grande",
              "con alto sonido",
              "por alta voz"
            ],
            "explanation": "« En voz alta » means 'aloud / in a loud voice' (contrasting with « en voz baja »)."
          },
          {
            "promptEnglish": "I knew that you would have the courage to come here in the middle of the storm.",
            "sentenceParts": [
              "« Sabía que ",
              " el valor de venir hasta aquí en medio de la tormenta. »"
            ],
            "correctAnswer": "tendrías",
            "options": [
              "tendrías",
              "tengas",
              "tendrás",
              "teniendo"
            ],
            "explanation": "In past reported thought (« Sabía que... »), 'would have' is expressed with the conditional « tendrías »."
          },
          {
            "promptEnglish": "The old navigator was holding a leather notebook in his hands.",
            "sentenceParts": [
              "El viejo navegante ",
              " un cuaderno de cuero en las manos."
            ],
            "correctAnswer": "sostenía",
            "options": [
              "sostenía",
              "oía",
              "subía",
              "andaba"
            ],
            "explanation": "« Sostenía » is the imperfect tense of « sostener » ('was holding')."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Amigo : « El sendero hacia el mirador está muy oscuro y ventoso hoy. »",
            "speakerAEnglish": "Friend: 'The trail to the viewpoint is very dark and windy today.'",
            "promptEnglish": "Reassure your friend and offer to accompany them along the trail:",
            "correctAnswer": "No te preocupes, vamos juntos; yo te acompaño por el sendero.",
            "options": [
              "No te preocupes, vamos juntos; yo te acompaño por el sendero.",
              "El símbolo en la portada es un sello muy antiguo.",
              "Ese reloj de pared lleva veinte años apagado en el salón.",
              "Un anciano de barba blanca salió de la biblioteca."
            ],
            "explanation": "« Yo te acompaño por el sendero » is the natural Spanish way to offer to walk with someone."
          },
          {
            "speakerA": "Compañera : « ¿Por qué te detienes de repente en medio del pasillo ? »",
            "speakerAEnglish": "Companion: 'Why are you stopping suddenly in the middle of the hallway?'",
            "promptEnglish": "Lower your voice and say: 'Wait... footsteps can be heard upstairs on the spiral staircase!'",
            "correctAnswer": "Espera, baja la voz… se oyen pasos arriba en la escalera de caracol.",
            "options": [
              "Espera, baja la voz… se oyen pasos arriba en la escalera de caracol.",
              "Al llegar a la estación, compramos dos billetes de ida y vuelta.",
              "El cuaderno de cuero tiene las páginas amarillas por el tiempo.",
              "Mañana por la mañana caminaremos hasta la playa del norte."
            ],
            "explanation": "Combines « baja la voz » (lower your voice) and « se oyen pasos arriba en la escalera de caracol »."
          },
          {
            "speakerA": "Guardia : « ¿Estaba cerrada con llave la entrada del edificio cuando llegaron ? »",
            "speakerAEnglish": "Guard: 'Was the building entrance locked when you arrived?'",
            "promptEnglish": "Explain that upon reaching the entrance, you discovered that the heavy iron door was ajar:",
            "correctAnswer": "No, al llegar a la entrada descubrimos que la pesada puerta de hierro estaba entreabierta.",
            "options": [
              "No, al llegar a la entrada descubrimos que la pesada puerta de hierro estaba entreabierta.",
              "Sí, sabía que tendrías el valor de cruzar el puente durante la tormenta.",
              "No, levantamos la linterna para leer el mapa del puerto pesquero.",
              "Sí, una figura alta con capucha dio un paso adelante en silencio."
            ],
            "explanation": "Uses « al llegar a... » ('upon arriving at...') and « estaba entreabierta » ('was ajar')."
          },
          {
            "speakerA": "Hermano : « Hay alguien moviéndose detrás de aquella cortina oscura. ¿Qué hacemos ? »",
            "speakerAEnglish": "Brother: 'There is someone moving behind that dark curtain. What do we do?'",
            "promptEnglish": "Say that without losing your calm, you will ask aloud who is there:",
            "correctAnswer": "Sin perder la calma, voy a preguntar en voz alta: « ¿Quién anda ahí? »",
            "options": [
              "Sin perder la calma, voy a preguntar en voz alta: « ¿Quién anda ahí? »",
              "Con mucha prisa, voy a apagar todas las luces del comedor.",
              "En medio de la lluvia, olvidé mi paraguas en el autobús.",
              "Desde la ventana, vemos las barcas de madera en el muelle."
            ],
            "explanation": "« Sin perder la calma » + « en voz alta » + « ¿Quién anda ahí? » ('Who goes there?')."
          },
          {
            "speakerA": "Anfitrión : « ¡Qué tormenta tan fuerte! Pensé que cancelarías tu visita de esta tarde. »",
            "speakerAEnglish": "Host: 'What a strong storm! I thought you would cancel your visit this afternoon.'",
            "promptEnglish": "Reply warmly: 'You knew I would have the courage to come all the way here!'",
            "correctAnswer": "¡Sabías que tendría el valor de venir hasta aquí a pesar de la lluvia!",
            "options": [
              "¡Sabías que tendría el valor de venir hasta aquí a pesar de la lluvia!",
              "¡Se oyen muchos pasos rápidos en la escalera de madera!",
              "¡La puerta del jardín estaba completamente cerrada ayer!",
              "¡Sostuve la linterna mientras buscábamos la llave!"
            ],
            "explanation": "Demonstrates the sequence of tenses: « Sabías que tendría el valor de venir hasta aquí »."
          },
          {
            "speakerA": "Amiga : « Mira este grabado dorado en la tapa del libro antiguo. ¿Qué significa ? »",
            "speakerAEnglish": "Friend: 'Look at this golden engraving on the cover of the antique book. What does it mean?'",
            "promptEnglish": "Say excitedly that that symbol on the cover is the secret seal of the family:",
            "correctAnswer": "¡Ese símbolo en la portada es el sello secreto de la familia!",
            "options": [
              "¡Ese símbolo en la portada es el sello secreto de la familia!",
              "¡El viento sopla con fuerza en la cima del acantilado!",
              "¡Yo te acompaño hasta la parada del autobús nocturno!",
              "¡Baja la voz antes de entrar en la sala de lectura!"
            ],
            "explanation": "« Ese símbolo en la portada es el sello secreto... » uses « portada » ('book cover')."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Al llegar a la cima entre el viento y la niebla, vimos que la puerta estaba entreabierta.",
            "correctAnswer": "Upon reaching the top amid the wind and fog, we saw that the door was ajar.",
            "options": [
              "Upon reaching the top amid the wind and fog, we saw that the door was ajar.",
              "Before climbing to the top in the rain, we locked the iron gate behind us.",
              "Upon leaving the house in the morning, we noticed that the window was broken.",
              "While walking down the trail in the fog, we lost our way near the beach."
            ],
            "explanation": "« Al llegar a la cima... vimos que la puerta estaba entreabierta »."
          },
          {
            "audioSentence": "Bajé la voz enseguida porque se oían pasos lentos en la escalera de caracol.",
            "correctAnswer": "I lowered my voice right away because slow footsteps could be heard on the spiral staircase.",
            "options": [
              "I lowered my voice right away because slow footsteps could be heard on the spiral staircase.",
              "I called out loudly because my friend was waiting upstairs on the spiral staircase.",
              "I turned on the flashlight because the spiral staircase was completely dark.",
              "I ran up the spiral staircase because the rain was coming through the roof."
            ],
            "explanation": "« Bajé la voz enseguida porque se oían pasos lentos en la escalera de caracol »."
          },
          {
            "audioSentence": "Sabía que tendrías el valor de venir hasta aquí en medio de esta tormenta.",
            "correctAnswer": "I knew that you would have the courage to come all the way here in the middle of this storm.",
            "options": [
              "I knew that you would have the courage to come all the way here in the middle of this storm.",
              "I hoped that you would wait for me at the harbor until the storm passed.",
              "I thought that you had already read the leather notebook before tonight.",
              "I doubt that anyone will be able to cross the bay during this storm."
            ],
            "explanation": "« Sabía que tendrías el valor de venir hasta aquí en medio de esta tormenta »."
          },
          {
            "audioSentence": "Sin perder la calma, pregunté en voz alta quién caminaba por el pasillo.",
            "correctAnswer": "Without losing my calm, I asked aloud who was walking down the hallway.",
            "options": [
              "Without losing my calm, I asked aloud who was walking down the hallway.",
              "Filled with fear, I hid behind the curtain when someone entered the hallway.",
              "Without making a sound, I closed the wooden door at the end of the hallway.",
              "In a whisper, I told my companion to wait near the entrance of the hallway."
            ],
            "explanation": "« Sin perder la calma, pregunté en voz alta quién caminaba por el pasillo »."
          },
          {
            "audioSentence": "Levantamos la linterna y vimos un cuaderno de cuero con un símbolo antiguo en la portada.",
            "correctAnswer": "We raised the flashlight and saw a leather notebook with an ancient symbol on the cover.",
            "options": [
              "We raised the flashlight and saw a leather notebook with an ancient symbol on the cover.",
              "We turned off the flashlight and hid the leather notebook under the wooden stairs.",
              "We dropped the flashlight and lost the key to the cabinet in the shadows.",
              "We found a bronze compass inside a wooden box beside the large glass window."
            ],
            "explanation": "« Levantamos la linterna y vimos un cuaderno de cuero con un símbolo antiguo en la portada »."
          },
          {
            "audioSentence": "Vamos, yo te acompaño por el sendero iluminado hasta la entrada del pueblo.",
            "correctAnswer": "Come on, I’ll go with you along the lit trail all the way to the village entrance.",
            "options": [
              "Come on, I’ll go with you along the lit trail all the way to the village entrance.",
              "Wait here, I’ll go alone down the trail to look for help in the village.",
              "Be careful, do not take the cliff trail because the bridge is closed tonight.",
              "Hurry up, the last bus to the village leaves from the harbor in ten minutes."
            ],
            "explanation": "« Vamos, yo te acompaño por el sendero iluminado hasta la entrada del pueblo »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Spanish: 'Upon reaching the top, they discovered the door was ajar'?",
            "correctAnswer": "Al llegar a la cima, descubrieron que la puerta estaba entreabierta.",
            "options": [
              "Al llegar a la cima, descubrieron que la puerta estaba entreabierta.",
              "En llegando a la cima, descubrieron que la puerta era entreabierta.",
              "A llegar en la cima, han descubierto que la puerta estuvo entreabierta.",
              "Al llegaron a la cima, descubrían que la puerta estaba entreabierto."
            ],
            "explanation": "1) « Al + infinitive » expresses 'upon doing', and 2) temporary/resulting states like 'ajar' (« entreabierta ») require « estar » (« estaba entreabierta »)."
          },
          {
            "promptEnglish": "Choose the correct impersonal/passive Spanish sentence for: 'Footsteps can be heard upstairs.'",
            "correctAnswer": "Se oyen pasos arriba.",
            "options": [
              "Se oyen pasos arriba.",
              "Se oye pasos arriba.",
              "Son oídos pasos en arriba.",
              "Se escuchan a pasos arribas."
            ],
            "explanation": "With « se » passive/impersonal perceptions of plural nouns (« pasos »), the verb must be 3rd-person plural: « Se oyen pasos »."
          },
          {
            "promptEnglish": "Select the correct sequence of tenses: 'I knew that you would have the courage to come.'",
            "correctAnswer": "Sabía que tendrías el valor de venir.",
            "options": [
              "Sabía que tendrías el valor de venir.",
              "Sabía que tendrás el valor para venir.",
              "Supe que tenías el valor a venir.",
              "Sabía que tuvieras el valor de viniendo."
            ],
            "explanation": "When a past verb like « Sabía » ('I knew') introduces a future-in-the-past ('would have'), Spanish uses the conditional « tendrías » + « el valor de + infinitive »."
          },
          {
            "promptEnglish": "How do you ask in natural Spanish: 'Who is walking around there / Who goes there?'?",
            "correctAnswer": "¿Quién anda ahí?",
            "options": [
              "¿Quién anda ahí?",
              "¿Quién es caminando allá?",
              "¿A quién anda por ahí?",
              "¿Cuál persona anda ahí?"
            ],
            "explanation": "« ¿Quién anda ahí? » (literally 'Who walks/goes there?') is the classic idiomatic Spanish expression when you hear someone in the dark."
          },
          {
            "promptEnglish": "Which phrase accurately translates: 'an old navigator with a white beard'?",
            "correctAnswer": "un viejo navegante de barba blanca",
            "options": [
              "un viejo navegante de barba blanca",
              "un navegante viejo desde blanca barba",
              "un anciano navegante en barba blanco",
              "uno viejo navegante a barba blanca"
            ],
            "explanation": "Spanish uses « de + physical feature » (« de barba blanca ») to describe someone's appearance ('with a white beard')."
          },
          {
            "promptEnglish": "Choose the accurate translation for: 'without losing her calm, she spoke aloud'",
            "correctAnswer": "sin perder la calma, habló en voz alta",
            "options": [
              "sin perder la calma, habló en voz alta",
              "sin perdiendo su calma, habló a voz alta",
              "no perder la calma, hablaba con voz alto",
              "sin pérdida la calma, habló en alta voz"
            ],
            "explanation": "« Sin » is always followed by an infinitive (« sin perder la calma »), and 'aloud' is the fixed phrase « en voz alta »."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "Upon reaching the top, we saw that the door was ajar.",
            "chunks": [
              "al llegar",
              "a la cima,",
              "vimos que la puerta",
              "estaba entreabierta"
            ],
            "explanation": "Temporal trigger (« al llegar a la cima ») + Main clause (« vimos que la puerta estaba entreabierta »)."
          },
          {
            "promptEnglish": "Wait a moment, footsteps can be heard on the spiral staircase.",
            "chunks": [
              "espera un momento,",
              "se oyen",
              "pasos",
              "en la escalera de caracol"
            ],
            "explanation": "Imperative (« espera un momento ») + Passive perception (« se oyen pasos ») + Location (« en la escalera de caracol »)."
          },
          {
            "promptEnglish": "I knew that you would have the courage to come all the way here.",
            "chunks": [
              "sabía que",
              "tendrías",
              "el valor de",
              "venir hasta aquí"
            ],
            "explanation": "Past mental state (« sabía que ») + Conditional verb (« tendrías ») + Noun phrase + Infinitive (« el valor de venir hasta aquí »)."
          },
          {
            "promptEnglish": "Come on, I’ll go with you along the cliff trail.",
            "chunks": [
              "vamos,",
              "yo te acompaño",
              "por el sendero",
              "del acantilado"
            ],
            "explanation": "Encouragement (« vamos ») + Subject, Pronoun & Verb (« yo te acompaño ») + Path (« por el sendero del acantilado »)."
          },
          {
            "promptEnglish": "Without losing her calm, she asked aloud who was there.",
            "chunks": [
              "sin perder la calma,",
              "preguntó",
              "en voz alta",
              "quién estaba ahí"
            ],
            "explanation": "Manner phrase (« sin perder la calma ») + Verb & Adverbial (« preguntó en voz alta ») + Indirect question (« quién estaba ahí »)."
          },
          {
            "promptEnglish": "That symbol on the cover is the secret seal of the family.",
            "chunks": [
              "ese símbolo",
              "en la portada",
              "es el sello secreto",
              "de la familia"
            ],
            "explanation": "Subject (« ese símbolo en la portada ») + Copula & Predicate (« es el sello secreto de la familia »)."
          }
        ]
      }
    },
    "3": {
      "subtitle": "Indirect Requests ('pidió que + Imperfect Subjunctive'), Future Time Clauses ('en cuanto se despeje') & Pluperfect",
      "vocabReuses": [
        {
          "word": "pedir que + subjuntivo (to ask someone to do)",
          "storyContext": "« Tu abuelo me pidió que cuidara su diario secreto. »",
          "newPhrase": "El profesor nos pidió que leyéramos el capítulo antes del lunes.",
          "english": "The professor asked us to read the chapter before Monday."
        },
        {
          "word": "en cuanto + subjuntivo (as soon as)",
          "storyContext": "« En cuanto se despeje la niebla al amanecer, zarparemos juntos. »",
          "newPhrase": "Te llamaré por teléfono en cuanto llegue al aeropuerto.",
          "english": "I will call you on the phone as soon as I arrive at the airport."
        },
        {
          "word": "más allá de (beyond)",
          "storyContext": "« ¡Señalan una isla oculta más allá del acantilado! »",
          "newPhrase": "Hay un pueblo precioso más allá de aquellas montañas.",
          "english": "There is a lovely village beyond those mountains."
        }
      ],
      "construction": {
        "patternName": "Future Time Clause: En cuanto + [Present Subjunctive], [Future Main Verb]",
        "formula": [
          "En cuanto (As soon as)",
          "+ Present Subjunctive (se despeje / lleguemos)",
          "+ Future (zarparemos / te avisaré)"
        ],
        "explanation": "When talking about a future plan, time conjunctions like « en cuanto » ('as soon as') or « cuando » ALWAYS trigger the **present subjunctive** because the action has not happened yet!",
        "examples": [
          {
            "target": "En cuanto se despeje la niebla, zarparemos juntos.",
            "english": "As soon as the fog clears, we will set sail together.",
            "highlight": "En cuanto se despeje ... zarparemos"
          },
          {
            "target": "En cuanto abran el puerto, compraremos los pasajes.",
            "english": "As soon as they open the harbor, we will buy the tickets.",
            "highlight": "En cuanto abran ... compraremos"
          },
          {
            "target": "Te enviaré las coordenadas en cuanto encuentre el mapa.",
            "english": "I will send you the coordinates as soon as I find the map.",
            "highlight": "en cuanto encuentre"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "My grandfather asked me to guard his secret logbook.",
            "sentenceParts": [
              "Mi abuelo me pidió que ",
              " su diario secreto."
            ],
            "correctAnswer": "cuidara",
            "options": [
              "cuidara",
              "cuidaba",
              "cuidaré",
              "cuidar"
            ],
            "explanation": "In Spanish, « pedir que » ('to ask someone to') in the past requires the imperfect subjunctive (« cuidara »)—never an infinitive!"
          },
          {
            "promptEnglish": "Look at these coordinates! They point to a hidden island beyond the cliff!",
            "sentenceParts": [
              "« ¡Mira estas coordenadas! ¡Señalan una isla oculta ",
              " del acantilado! »"
            ],
            "correctAnswer": "más allá",
            "options": [
              "más allá",
              "más acá",
              "sin embargo",
              "a través"
            ],
            "explanation": "« Más allá de » means 'beyond / further than'."
          },
          {
            "promptEnglish": "As soon as the fog clears at dawn, we will set sail together!",
            "sentenceParts": [
              "« En cuanto se ",
              " la niebla al amanecer, zarparemos juntos. »"
            ],
            "correctAnswer": "despeje",
            "options": [
              "despeje",
              "despeja",
              "despejará",
              "despejando"
            ],
            "explanation": "After « en cuanto » referring to a future event, Spanish requires the present subjunctive (« se despeje »)."
          },
          {
            "promptEnglish": "He spread out on the table an ancient bronze compass that had belonged to the captain.",
            "sentenceParts": [
              "Extendió sobre la mesa un antiguo compás de bronce que ",
              " al capitán."
            ],
            "correctAnswer": "había pertenecido",
            "options": [
              "había pertenecido",
              "ha pertenecido",
              "pertenecerá",
              "perteneciendo"
            ],
            "explanation": "The pluperfect « había pertenecido » ('had belonged') marks an action prior to the past narrative."
          },
          {
            "promptEnglish": "I put the notebook away in my waterproof bag while the sun was rising.",
            "sentenceParts": [
              "Guardé el cuaderno en mi bolso ",
              " mientras salía el sol."
            ],
            "correctAnswer": "impermeable",
            "options": [
              "impermeable",
              "entreabierto",
              "oxidado",
              "oculto"
            ],
            "explanation": "« Impermeable » means 'waterproof / rainproof'."
          },
          {
            "promptEnglish": "We went down toward the pier determined to begin the adventure.",
            "sentenceParts": [
              "Bajamos hacia el muelle ",
              " a comenzar la aventura."
            ],
            "correctAnswer": "decididos",
            "options": [
              "decididos",
              "apagados",
              "ocultos",
              "escondidos"
            ],
            "explanation": "« Decididos a + infinitive » means 'determined to / resolved to do something'."
          }
        ],
        "dialogue": [
          {
            "speakerA": "Amigo : « ¿Por qué guardaste esa brújula antigua durante tantos años en tu casa ? »",
            "speakerAEnglish": "Friend: 'Why did you keep that antique compass for so many years in your house?'",
            "promptEnglish": "Explain calmly that her grandfather asked you to guard his secret diary and compass:",
            "correctAnswer": "Porque tu abuelo me pidió que cuidara su diario secreto y su brújula.",
            "options": [
              "Porque tu abuelo me pidió que cuidara su diario secreto y su brújula.",
              "Porque la puerta de hierro del faro estaba entreabierta anoche.",
              "Porque bajamos del autobús frente al puerto con mucha niebla.",
              "Porque se oyen pasos rápidos arriba en la escalera de caracol."
            ],
            "explanation": "Uses « me pidió que cuidara » (preterite of « pedir » + imperfect subjunctive « cuidara »)."
          },
          {
            "speakerA": "Marinero : « El barco ya está preparado en el muelle, pero todavía hay mucha niebla. »",
            "speakerAEnglish": "Sailor: 'The boat is already prepared at the pier, but there is still a lot of fog.'",
            "promptEnglish": "Promise that as soon as the fog clears at dawn, you will set sail together:",
            "correctAnswer": "En cuanto se despeje la niebla al amanecer, zarparemos juntos.",
            "options": [
              "En cuanto se despeje la niebla al amanecer, zarparemos juntos.",
              "Esa lámpara antigua lleva apagada más de treinta años.",
              "Alguien me envió una carta sin firma desde la costa.",
              "Sabía que tendrías el valor de subir por el sendero."
            ],
            "explanation": "Demonstrates « En cuanto se despeje... zarparemos juntos »."
          },
          {
            "speakerA": "Compañera : « Acabo de abrir la bitácora de cuero sobre la mesa. ¡Hay un mapa dentro! »",
            "speakerAEnglish": "Companion: 'I just opened the leather logbook on the table. There is a map inside!'",
            "promptEnglish": "Point out excitedly that the coordinates point to a hidden island beyond the cliff:",
            "correctAnswer": "¡Mira estas coordenadas! ¡Señalan una isla oculta más allá del acantilado!",
            "options": [
              "¡Mira estas coordenadas! ¡Señalan una isla oculta más allá del acantilado!",
              "¡Cuidado con el escalón al bajar del autobús nocturno!",
              "¡No deberías caminar sola por la playa cuando llueve!",
              "¡Cerré la puerta principal sin dudarlo un segundo!"
            ],
            "explanation": "Uses « Señalan una isla oculta más allá del acantilado »."
          },
          {
            "speakerA": "Historiadora : « ¿Qué encontraron los exploradores en aquella bahía lejana ? »",
            "speakerAEnglish": "Historian: 'What did the explorers find in that distant bay?'",
            "promptEnglish": "Explain that on that hidden island they discovered the remains of a galleon full of manuscripts:",
            "correctAnswer": "En esa isla escondida descubrieron los restos de un galeón lleno de manuscritos.",
            "options": [
              "En esa isla escondida descubrieron los restos de un galeón lleno de manuscritos.",
              "Junto a la ventana encendieron una lámpara que producía un destello azul.",
              "En el bolsillo del abrigo guardaron un billete de tren para mañana.",
              "Por la escalera de madera subieron sin perder la calma."
            ],
            "explanation": "Recombines « descubrieron los restos de un galeón lleno de manuscritos »."
          },
          {
            "speakerA": "Viajero : « Empieza a llover otra vez y no quiero que se mojen los mapas antiguos. »",
            "speakerAEnglish": "Traveler: 'It's starting to rain again and I don't want the antique maps to get wet.'",
            "promptEnglish": "Tell them to put the logbook away in your waterproof bag right now:",
            "correctAnswer": "Guarda la bitácora en mi bolso impermeable ahora mismo.",
            "options": [
              "Guarda la bitácora en mi bolso impermeable ahora mismo.",
              "Extiende el mapa de papel sobre la roca mojada.",
              "Pregunta en voz alta quién anda por el muelle.",
              "Espera a que los primeros rayos de sol tiñan el mar."
            ],
            "explanation": "Uses « guardar en mi bolso impermeable » ('keep/put away in my waterproof bag')."
          },
          {
            "speakerA": "Capitán : « El mar está tranquilo y los primeros rayos de sol ya iluminan el horizonte. »",
            "speakerAEnglish": "Captain: 'The sea is calm and the first rays of sun are already lighting up the horizon.'",
            "promptEnglish": "Say that you are all going down toward the pier determined to begin the greatest adventure:",
            "correctAnswer": "Vamos a bajar hacia el muelle decididos a comenzar la mayor aventura.",
            "options": [
              "Vamos a bajar hacia el muelle decididos a comenzar la mayor adventure.",
              "Vamos a bajar hacia el muelle decididos a comenzar la mayor aventura.",
              "Vamos a esconder la llave oxidada debajo de la alfombra.",
              "Vamos a apagar la linterna antes de entrar en la cueva."
            ],
            "explanation": "« Bajamos / Vamos a bajar hacia el muelle decididos a comenzar la mayor aventura »."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "Mi abuelo me pidió que cuidara su diario secreto hasta que tú llegaras.",
            "correctAnswer": "My grandfather asked me to guard his secret diary until you arrived.",
            "options": [
              "My grandfather asked me to guard his secret diary until you arrived.",
              "My grandfather told me that he had lost his secret diary during the voyage.",
              "My grandfather wrote this secret diary before he bought his first boat.",
              "My grandfather wants us to publish his secret diary in the city newspaper."
            ],
            "explanation": "« Mi abuelo me pidió que cuidara su diario secreto hasta que tú llegaras »."
          },
          {
            "audioSentence": "En cuanto se despeje la niebla al amanecer, zarparemos juntos hacia la isla.",
            "correctAnswer": "As soon as the fog clears at dawn, we will set sail together toward the island.",
            "options": [
              "As soon as the fog clears at dawn, we will set sail together toward the island.",
              "Because the fog is so thick at dawn, we cannot leave the harbor today.",
              "When we returned from the island at dawn, the fog was covering the pier.",
              "Before the sun sets behind the island, we must anchor the boat in the bay."
            ],
            "explanation": "« En cuanto se despeje la niebla al amanecer, zarparemos juntos hacia la isla »."
          },
          {
            "audioSentence": "Sobre la mesa de madera extendimos un mapa que había pertenecido a un antiguo navegante.",
            "correctAnswer": "On the wooden table we spread out a map that had belonged to an ancient navigator.",
            "options": [
              "On the wooden table we spread out a map that had belonged to an ancient navigator.",
              "Under the wooden table we hid a chest that contained gold coins and letters.",
              "On the wooden shelf we found a compass that was broken during the storm.",
              "Beside the wooden table we placed a lamp that lit up the entire cabin."
            ],
            "explanation": "« Extendimos un mapa que había pertenecido a un antiguo navegante »."
          },
          {
            "audioSentence": "Estas coordenadas señalan una cala oculta más allá de los acantilados del norte.",
            "correctAnswer": "These coordinates point to a hidden cove beyond the northern cliffs.",
            "options": [
              "These coordinates point to a hidden cove beyond the northern cliffs.",
              "These coordinates show the exact depth of the water inside the main harbor.",
              "These letters describe a dangerous storm near the southern lighthouse.",
              "These maps belong to the maritime museum in the center of the city."
            ],
            "explanation": "« Estas coordenadas señalan una cala oculta más allá de los acantilados del norte »."
          },
          {
            "audioSentence": "Guardé los documentos en mi bolso impermeable mientras los primeros rayos de sol teñían el cielo.",
            "correctAnswer": "I put the documents away in my waterproof bag while the first rays of sun tinted the sky.",
            "options": [
              "I put the documents away in my waterproof bag while the first rays of sun tinted the sky.",
              "I read the documents by the light of the lantern while the rain fell on the roof.",
              "I dried my wet coat near the fireplace while the captain prepared hot coffee.",
              "I left my waterproof bag on the pier while we climbed up to the old tower."
            ],
            "explanation": "« Guardé los documentos en mi bolso impermeable mientras los primeros rayos de sol teñían el cielo »."
          },
          {
            "audioSentence": "Bajamos hacia el muelle decididos a comenzar el viaje más importante de nuestras vidas.",
            "correctAnswer": "We went down toward the pier determined to begin the most important trip of our lives.",
            "options": [
              "We went down toward the pier determined to begin the most important trip of our lives.",
              "We walked back from the pier tired after working on the boat all afternoon.",
              "We waited on the pier hoping to see the ship arrive before nightfall.",
              "We ran away from the pier afraid of the big waves and the cold wind."
            ],
            "explanation": "« Bajamos hacia el muelle decididos a comenzar el viaje más importante de nuestras vidas »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Spanish: 'Your grandfather asked me to guard his secret diary'?",
            "correctAnswer": "Tu abuelo me pidió que cuidara su diario secreto.",
            "options": [
              "Tu abuelo me pidió que cuidara su diario secreto.",
              "Tu abuelo me pidió a cuidar su diario secreto.",
              "Tu abuelo preguntó a mí que cuidaba su diario secreto.",
              "Tu abuelo me pidió para cuidar su secreto diario."
            ],
            "explanation": "1) 'To ask someone to do something' is « pedir que + subjunctive » (never « preguntar », which is only for asking questions!), and 2) after past « pidió », use the imperfect subjunctive « cuidara »."
          },
          {
            "promptEnglish": "Choose the correct Spanish sentence for: 'As soon as the fog clears, we will set sail together.'",
            "correctAnswer": "En cuanto se despeje la niebla, zarparemos juntos.",
            "options": [
              "En cuanto se despeje la niebla, zarparemos juntos.",
              "En cuanto se despeja la niebla, zarparemos juntos.",
              "En cuanto se despejará la niebla, zarpamos juntos.",
              "Tan pronto que despeje la niebla, vamos zarpar juntos."
            ],
            "explanation": "Future time clauses introduced by « en cuanto » ('as soon as') ALWAYS require the present subjunctive (« se despeje »), never the present or future indicative!"
          },
          {
            "promptEnglish": "Select the accurate pluperfect clause for: 'an ancient compass that had belonged to my grandfather'",
            "correctAnswer": "un antiguo compás que había pertenecido a mi abuelo",
            "options": [
              "un antiguo compás que había pertenecido a mi abuelo",
              "un antiguo compás que hubo pertenecido de mi abuelo",
              "un compás antiguo quien era pertenecido a mi abuelo",
              "un antiguo compás que había perteneciendo con mi abuelo"
            ],
            "explanation": "The Spanish pluperfect is formed with the imperfect of « haber » (« había ») + the past participle (« pertenecido ») + « a »."
          },
          {
            "promptEnglish": "How do you say: 'They point to a hidden island beyond the cliff'?",
            "correctAnswer": "Señalan una isla oculta más allá del acantilado.",
            "options": [
              "Señalan una isla oculta más allá del acantilado.",
              "Señalan a una oculta isla más lejos que el acantilado.",
              "Apuntan una isla ocultado más allá al acantilado.",
              "Señalan una isla oculta afuera del acantilado."
            ],
            "explanation": "« Más allá de » ('beyond') combines with « el » to form « más allá del acantilado »."
          },
          {
            "promptEnglish": "Which sentence accurately translates: 'determined to begin the greatest adventure of their lives'?",
            "correctAnswer": "decididos a comenzar la mayor aventura de sus vidas",
            "options": [
              "decididos a comenzar la mayor aventura de sus vidas",
              "decididos de comenzar la más grande aventura en sus vidas",
              "determinados para comenzando la mayor aventura de su vida",
              "decidido a comenzar el mayor aventura de sus vidas"
            ],
            "explanation": "« Decidido/a/os/as » takes the preposition « a » before an infinitive (« decididos a comenzar »), and « la mayor aventura » means 'the greatest adventure'."
          },
          {
            "promptEnglish": "Choose the natural Spanish sentence for: 'Upon opening the leather notebook, she exclaimed...'",
            "correctAnswer": "Al abrir el cuaderno de cuero, exclamó...",
            "options": [
              "Al abrir el cuaderno de cuero, exclamó...",
              "En abriendo el cuaderno de cuero, exclamó...",
              "Al abriendo el cuero cuaderno, exclamaba...",
              "Por abrir el cuaderno en cuero, ha exclamado..."
            ],
            "explanation": "« Al + infinitive » (« Al abrir ») expresses 'Upon opening', and material is always « de + noun » (« de cuero »)."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "As soon as the fog clears, we will set sail together.",
            "chunks": [
              "en cuanto",
              "se despeje la niebla,",
              "zarparemos",
              "juntos"
            ],
            "explanation": "Conjunction (« en cuanto ») + Subjunctive clause (« se despeje la niebla ») + Future verb & Adjective (« zarparemos juntos »)."
          },
          {
            "promptEnglish": "Your grandfather asked me to guard his secret logbook.",
            "chunks": [
              "tu abuelo",
              "me pidió",
              "que cuidara",
              "su diario secreto"
            ],
            "explanation": "Subject (« tu abuelo ») + Main verb (« me pidió ») + Subjunctive clause (« que cuidara su diario secreto »)."
          },
          {
            "promptEnglish": "These coordinates point to a hidden island beyond the cliff.",
            "chunks": [
              "estas coordenadas",
              "señalan",
              "una isla oculta",
              "más allá del acantilado"
            ],
            "explanation": "Subject (« estas coordenadas ») + Verb (« señalan ») + Object (« una isla oculta ») + Location (« más allá del acantilado »)."
          },
          {
            "promptEnglish": "That bronze compass had belonged to an old navigator.",
            "chunks": [
              "aquel compás de bronce",
              "había pertenecido",
              "a un",
              "viejo navegante"
            ],
            "explanation": "Subject (« aquel compás de bronce ») + Pluperfect verb (« había pertenecido ») + Indirect object (« a un viejo navegante »)."
          },
          {
            "promptEnglish": "I put the logbook away in my waterproof bag.",
            "chunks": [
              "guardé",
              "la bitácora",
              "en mi",
              "bolso impermeable"
            ],
            "explanation": "Preterite verb (« guardé ») + Direct object (« la bitácora ») + Location (« en mi bolso impermeable »)."
          },
          {
            "promptEnglish": "We went down toward the pier determined to begin the voyage.",
            "chunks": [
              "bajamos",
              "hacia el muelle",
              "decididos",
              "a comenzar el viaje"
            ],
            "explanation": "Verb & Direction (« bajamos hacia el muelle ») + Participial phrase (« decididos a comenzar el viaje »)."
          }
        ]
      }
    }
  },
  "ja": {
    "1": {
      "subtitle": "Polite Requests ('〜てください'), Asking Reason ('どうして〜のですか'), Sequence ('〜てから') & Invitations ('〜ましょう')",
      "vocabReuses": [
        {
          "word": "〜てから (after doing...)",
          "storyContext": "店の奥をちらりと見てから、静かに木の扉を閉めました。",
          "newPhrase": "手を洗ってから、みんなで晩ごはんを食べましょう。",
          "english": "After washing our hands, let’s eat dinner together."
        },
        {
          "word": "〜んです / 〜のですか (explanatory tone)",
          "storyContext": "「どうしてこの時計の針は反対に動いているのですか？」",
          "newPhrase": "電車が止まっていますが、何かあったんですか。",
          "english": "The train is stopped—did something happen?"
        },
        {
          "word": "小さな声で (in a quiet / low voice)",
          "storyContext": "「この時計を隠してください！」と小さな声で言いました。",
          "newPhrase": "図書館の中では小さな声で話してください。",
          "english": "Please speak in a quiet voice inside the library."
        }
      ],
      "construction": {
        "patternName": "Sequential Action: [Te-Form Verb] + から、[Main Action]",
        "formula": [
          "Verb Te-Form (見て / 閉めて)",
          "+ から (after doing),",
          "+ Second Past/Polite Verb"
        ],
        "explanation": "Be careful not to confuse the two uses of « から »! After a conjugated clause (〜ですから), it means 'because'. After a **Te-form verb** (〜てから), it means **'after doing X, [then do Y]'**!",
        "examples": [
          {
            "target": "店の奥を見てから、静かに木の扉を閉めました。",
            "english": "After looking toward the back of the shop, he quietly closed the wooden door.",
            "highlight": "見てから、... 閉めました"
          },
          {
            "target": "切符を買ってから、駅のホームへ行きましょう。",
            "english": "After buying the ticket, let’s go to the station platform.",
            "highlight": "買ってから、... 行きましょう"
          },
          {
            "target": "この手紙を読んでから、返事を書きます。",
            "english": "After reading this letter, I will write a reply.",
            "highlight": "読んでから、... 書きます"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "Please hide this silver key inside your pocket!",
            "sentenceParts": [
              "「お願いです、この銀色の鍵をポケットに",
              "！」"
            ],
            "correctAnswer": "隠してください",
            "options": [
              "隠してください",
              "隠さないで",
              "隠しましょうか",
              "隠すからです"
            ],
            "explanation": "« Te-form (隠して) + ください » makes a polite request ('Please hide...')."
          },
          {
            "promptEnglish": "Why are the hands of this mysterious clock moving backward?",
            "sentenceParts": [
              "「どうしてこの不思議な時計の針は反対に動いて",
              "？」"
            ],
            "correctAnswer": "いるのですか",
            "options": [
              "いるのですか",
              "くださいませんか",
              "からですか",
              "ましょうか"
            ],
            "explanation": "« どうして ... のですか / んですか » asks for an explanation of something you observe right in front of you."
          },
          {
            "promptEnglish": "After glancing toward the back of the shop, he quietly closed the door.",
            "sentenceParts": [
              "店の奥をちらりと",
              "、静かに扉を閉めました。"
            ],
            "correctAnswer": "見てから",
            "options": [
              "見てから",
              "見るから",
              "見たから",
              "見ながら"
            ],
            "explanation": "« Te-form + から » (« 見てから ») means 'after looking', whereas « 見るから / 見たから » means 'because he looks/looked'."
          },
          {
            "promptEnglish": "This watch is a special watch that my grandfather made.",
            "sentenceParts": [
              "「この時計は僕のおじいさんが",
              "特別な時計なんです。」"
            ],
            "correctAnswer": "作った",
            "options": [
              "作った",
              "作って",
              "作ろう",
              "作り"
            ],
            "explanation": "In Japanese, a past relative clause modifying a noun (« 特別な時計 ») uses the plain past « た » form: « おじいさんが作った特別な時計 »."
          },
          {
            "promptEnglish": "At that moment, the sound of a car was heard outside the shop.",
            "sentenceParts": [
              "その時、店の外に車の音が",
              "、二人は顔を見合わせました。"
            ],
            "correctAnswer": "聞こえて",
            "options": [
              "聞こえて",
              "聞いて",
              "聞かせて",
              "聞こえ"
            ],
            "explanation": "When a sound naturally reaches your ears ('was heard / could be heard'), use the intransitive « 聞こえる » with particle « が » (« 音が聞こえて »)."
          },
          {
            "promptEnglish": "Let’s quickly go through the back alley toward the river!",
            "sentenceParts": [
              "「早く裏の路地から川の方へ",
              "！」"
            ],
            "correctAnswer": "行きましょう",
            "options": [
              "行きましょう",
              "行きました",
              "行きません",
              "行くんです"
            ],
            "explanation": "« 〜ましょう » expresses 'Let's [do]!'."
          }
        ],
        "dialogue": [
          {
            "speakerA": "店員 : 「お客様、こちらは静かな読書室ですので、お電話はご遠慮ください。」",
            "speakerAEnglish": "Staff: 'Customer, since this is a quiet reading room, please refrain from phone calls.'",
            "promptEnglish": "Apologize and say you will speak in a quiet voice outside the door:",
            "correctAnswer": "すみません、扉の外で小さな声で話します。",
            "options": [
              "すみません、扉の外で小さな声で話します。",
              "よかった、まだ銀色の時計を持っていますね。",
              "放課後、古い路地で時計屋を見つけました。",
              "どうして時計の針が反対に動いているのですか。"
            ],
            "explanation": "Uses « 小さな声で話す » ('speak in a quiet voice')."
          },
          {
            "speakerA": "友人 : 「わあ、とても美しい懐中時計ですね！どこで買ったのですか？」",
            "speakerAEnglish": "Friend: 'Wow, what a very beautiful pocket watch! Where did you buy it?'",
            "promptEnglish": "Explain that you didn't buy it—it is a special watch that your grandfather made:",
            "correctAnswer": "買ったのではありません。僕のおじいさんが作った特別な時計なんです。",
            "options": [
              "買ったのではありません。僕のおじいさんが作った特別な時計なんです。",
              "早く裏の路地から駅の方へ一緒に逃げましょう。",
              "店の奥をちらりと見てから、木の窓を閉めました。",
              "外の通りで黒い車の大きな音が聞こえました。"
            ],
            "explanation": "Demonstrates the explanatory « 〜なんです » and past relative clause « おじいさんが作った特別な時計 »."
          },
          {
            "speakerA": "同僚 : 「もうすぐ会議が始まりますが、資料の準備はできましたか？」",
            "speakerAEnglish": "Colleague: 'The meeting is starting soon; are the materials ready?'",
            "promptEnglish": "Say that after checking the back room, you will bring the notebooks right away:",
            "correctAnswer": "奥の部屋を確認してから、すぐにノートを持って行きます。",
            "options": [
              "奥の部屋を確認してから、すぐにノートを持って行きます。",
              "この古い手紙をポケットの中に隠してください。",
              "どうして電車のドアがまだ開かないのですか。",
              "二人は驚いて静かに顔を見合わせました。"
            ],
            "explanation": "Uses « Te-form + から » (« 確認してから » = after checking)."
          },
          {
            "speakerA": "旅人 : 「表の通りはバスや車でとても混んでいますね。」",
            "speakerAEnglish": "Traveler: 'The front street is very crowded with buses and cars, isn't it.'",
            "promptEnglish": "Suggest walking toward the river through the quiet back alley:",
            "correctAnswer": "ええ、静かな裏の路地から川の方へ歩きましょう！",
            "options": [
              "ええ、静かな裏の路地から川の方へ歩きましょう！",
              "はい、おじいさんが古い木の箱を開けました！",
              "いいえ、時計の針はぜんぜん動いていません！",
              "あのう、急いで店員さんのそばへ行きました！"
            ],
            "explanation": "Recombines « 静かな裏の路地から川の方へ歩きましょう »."
          },
          {
            "speakerA": "友人 : 「えっ、急いでどこへ行くのですか？何かあったのですか？」",
            "speakerAEnglish": "Friend: 'Wait, where are you hurrying to? Did something happen?'",
            "promptEnglish": "Say that the sound of thunder was heard outside, so you are going to close the windows:",
            "correctAnswer": "外で雷の音が聞こえたので、窓を閉めに行くんです。",
            "options": [
              "外で雷の音が聞こえたので、窓を閉めに行くんです。",
              "放課後、駅の近くで新しい本屋を見つけました。",
              "この大切な鍵をかばんの中に隠してください。",
              "赤い鳥居の前で五分だけ待ってください。"
            ],
            "explanation": "Uses « 音が聞こえた » ('sound was heard') and explanatory « 〜んです »."
          },
          {
            "speakerA": "店員 : 「このガラスの箱はとても壊れやすいですよ。」",
            "speakerAEnglish": "Shop clerk: 'This glass box is very fragile.'",
            "promptEnglish": "Reassure them that you will put it inside your bag carefully:",
            "correctAnswer": "わかりました、気をつけてかばんの中に入れます。",
            "options": [
              "わかりました、気をつけてかばんの中に入れます。",
              "驚いて聞きましたが、誰も答えませんでした。",
              "黒い車が店の前に止まってから出かけました。",
              "どうして反対の方向へ走っているのですか。"
            ],
            "explanation": "Natural polite reassurance in a shop context."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "店の奥をちらりと見てから、職人は静かに木の扉を閉めました。",
            "correctAnswer": "After glancing toward the back of the shop, the craftsman quietly closed the wooden door.",
            "options": [
              "After glancing toward the back of the shop, the craftsman quietly closed the wooden door.",
              "Because the back of the shop was dark, the craftsman opened the wooden window wide.",
              "While working at the back of the shop, the craftsman heard someone knocking on the door.",
              "Before entering the back of the shop, the craftsman locked the front door with a silver key."
            ],
            "explanation": "« 店の奥をちらりと見てから、職人は静かに木の扉を閉めました »."
          },
          {
            "audioSentence": "どうしてこの古い時計の針は反対の方向に動いているのですか。",
            "correctAnswer": "Why are the hands of this old clock moving in the opposite direction?",
            "options": [
              "Why are the hands of this old clock moving in the opposite direction?",
              "When did the hands of this old clock stop moving completely?",
              "Where can I repair the broken glass of this antique pocket watch?",
              "Who made this special clock that chimes every hour in the shop?"
            ],
            "explanation": "« どうしてこの古い時計の針は反対の方向に動いているのですか »."
          },
          {
            "audioSentence": "この懐中時計は私の祖父が若い頃に作った特別な時計なんです。",
            "correctAnswer": "This pocket watch is a special watch that my grandfather made when he was young.",
            "options": [
              "This pocket watch is a special watch that my grandfather made when he was young.",
              "This pocket watch was bought by my grandfather at a quiet market fifty years ago.",
              "This silver watch will be given to my younger brother when he graduates.",
              "This antique clock has been hanging on the wall of our living room for many years."
            ],
            "explanation": "« 私の祖父が若い頃に作った特別な時計なんです »."
          },
          {
            "audioSentence": "その時、建物の外で車の音が聞こえて、私たちは驚いて顔を見合わせました。",
            "correctAnswer": "At that moment, the sound of a car was heard outside the building, and we looked at each other in surprise.",
            "options": [
              "At that moment, the sound of a car was heard outside the building, and we looked at each other in surprise.",
              "After a while, the rain stopped outside the building, and we walked out into the alley.",
              "At that moment, the telephone rang inside the office, and the manager answered right away.",
              "Before dark, we parked our car behind the building and entered through the back door."
            ],
            "explanation": "« 建物の外で車の音が聞こえて、私たちは驚いて顔を見合わせました »."
          },
          {
            "audioSentence": "お願いですから、この大切な手紙を上着のポケットに隠してください。",
            "correctAnswer": "Please, hide this important letter inside your coat pocket.",
            "options": [
              "Please, hide this important letter inside your coat pocket.",
              "Please, read this important letter aloud before everyone leaves the room.",
              "Please, do not forget your coat when you get off the train at the next station.",
              "Please, hand this envelope to the receptionist at the front desk."
            ],
            "explanation": "« この大切な手紙を上着のポケットに隠してください »."
          },
          {
            "audioSentence": "雨が強くなる前に、早く裏の路地から川の方へ歩きましょう。",
            "correctAnswer": "Before the rain gets heavy, let’s quickly walk through the back alley toward the river.",
            "options": [
              "Before the rain gets heavy, let’s quickly walk through the back alley toward the river.",
              "Because the rain is so heavy, let’s wait inside this small café near the river.",
              "After the rain stops, let’s take a walk across the stone bridge over the river.",
              "While walking along the river, we found a quiet teahouse in a narrow alley."
            ],
            "explanation": "« 早く裏の路地から川の方へ歩きましょう »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Japanese: 'After looking toward the back of the shop, he closed the door'?",
            "correctAnswer": "店の奥を見てから、扉を閉めました。",
            "options": [
              "店の奥を見てから、扉を閉めました。",
              "店の奥を見るから、扉を閉めました。",
              "店の奥を見たから、扉を閉めました。",
              "店の奥を見ってから、扉を閉めました。"
            ],
            "explanation": "« Te-form + から » (« 見てから ») means 'after looking'. Using plain present/past (« 見るから / 見たから ») changes the meaning to 'because he looks/looked'!"
          },
          {
            "promptEnglish": "Choose the correct Japanese sentence for: 'This is a special watch that my grandfather made.'",
            "correctAnswer": "これはおじいさんが作った特別な時計です。",
            "options": [
              "これはおじいさんが作った特別な時計です。",
              "これはおじいさんが作りました特別な時計です。",
              "これはおじいさんの作ったの特別時計です。",
              "これはおじいさんが作って特別な時計です。"
            ],
            "explanation": "Verbs modifying a noun (« 時計 ») MUST be in plain form (« 作った »), never polite « -ました » form, and na-adjectives like « 特別 » require « な » before a noun."
          },
          {
            "promptEnglish": "Select the natural sentence for: 'The sound of a black car was heard outside.'",
            "correctAnswer": "外に黒い車の音が聞こえました。",
            "options": [
              "外に黒い車の音が聞こえました。",
              "外に黒い車の音を聞きました。",
              "外で黒い車の音が聞かれました。",
              "外に黒い車の音で聞こえました。"
            ],
            "explanation": "When a sound naturally reaches your ears without deliberate listening, Japanese uses the potential/spontaneous verb « 聞こえる » with the subject marker « が » (« 音が聞こえました »)."
          },
          {
            "promptEnglish": "How do you ask for an explanation: 'Why are the hands moving backward?'",
            "correctAnswer": "どうして針は反対に動いているのですか。",
            "options": [
              "どうして針は反対に動いているのですか。",
              "どうして針は反対に動くますか。",
              "なぜ針を反対で動いていますか。",
              "どうして針は反対へ動いたことですか。"
            ],
            "explanation": "Ongoing movement uses « 動いている », and asking 'why is it that...' uses the explanatory « のですか » after the plain form."
          },
          {
            "promptEnglish": "Which sentence accurately says: 'Please hide this watch in your pocket!'?",
            "correctAnswer": "この時計をポケットに隠してください！",
            "options": [
              "この時計をポケットに隠してください！",
              "この時計をポケットで隠すください！",
              "この時計がポケットに隠してください！",
              "この時計をポケットへ隠してなさい！"
            ],
            "explanation": "« 隠す » (to hide something) takes the direct object marker « を », the destination pocket takes « に », and the te-form of -su verbs ends in « -して » (« 隠してください »)."
          },
          {
            "promptEnglish": "Choose the correct invitation: 'Let’s quickly escape toward the river!'",
            "correctAnswer": "早く川の方へ逃げましょう！",
            "options": [
              "早く川の方へ逃げましょう！",
              "早い川の方へ逃げられます！",
              "早くで川の方を逃げましょう！",
              "早いに川の方へ逃げるでしょう！"
            ],
            "explanation": "i-adjectives drop « -い » and add « -く » to become adverbs (« 早い → 早く »), and « 〜の方へ » marks direction ('toward')."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "After looking toward the back of the shop, he quietly closed the door.",
            "chunks": [
              "店の奥を",
              "見てから、",
              "静かに",
              "扉を閉めました"
            ],
            "explanation": "Object (« 店の奥を ») + Te-form + kara (« 見てから、 ») + Adverb (« 静かに ») + Main clause (« 扉を閉めました »)."
          },
          {
            "promptEnglish": "This watch is a special watch that my grandfather made.",
            "chunks": [
              "この時計は",
              "おじいさんが作った",
              "特別な",
              "時計なんです"
            ],
            "explanation": "Topic (« この時計は ») + Relative clause (« おじいさんが作った ») + Na-adjective (« 特別な ») + Predicate (« 時計なんです »)."
          },
          {
            "promptEnglish": "Please hide this silver watch in your pocket!",
            "chunks": [
              "この",
              "銀色の時計を",
              "ポケットに",
              "隠してください！"
            ],
            "explanation": "Demonstrative & Object (« この銀色の時計を ») + Destination (« ポケットに ») + Polite request (« 隠してください！ »)."
          },
          {
            "promptEnglish": "Why are the hands of this watch moving backward?",
            "chunks": [
              "どうして",
              "この時計の針は",
              "反対に",
              "動いているのですか？"
            ],
            "explanation": "Question word (« どうして ») + Topic (« この時計の針は ») + Direction (« 反対に ») + Explanatory verb (« 動いているのですか？ »)."
          },
          {
            "promptEnglish": "Let’s quickly escape through the back alley toward the river!",
            "chunks": [
              "早く",
              "裏の路地から",
              "川の方へ",
              "逃げましょう！"
            ],
            "explanation": "Adverb (« 早く ») + Route (« 裏の路地から ») + Direction (« 川の方へ ») + Invitation (« 逃げましょう！ »)."
          },
          {
            "promptEnglish": "After school, I found a small old clock shop in a quiet alley.",
            "chunks": [
              "放課後、",
              "静かな路地で",
              "小さな古い時計屋を",
              "見つけました"
            ],
            "explanation": "Time (« 放課後、 ») + Location (« 静かな路地で ») + Object (« 小さな古い時計屋を ») + Past verb (« 見つけました »)."
          }
        ]
      }
    },
    "2": {
      "subtitle": "Resulting State ('〜てあります'), Ability ('〜ことができます'), Restriction ('〜しか〜ません') & Trying ('〜てみましょう')",
      "vocabReuses": [
        {
          "word": "〜てあります (has been done / is in a prepared state)",
          "storyContext": "「ふたの中に赤い鳥居の地図が描いてありますよ！」",
          "newPhrase": "黒板に今日の宿題が書いてあります。",
          "english": "Today’s homework is written on the blackboard."
        },
        {
          "word": "〜ことができます (can do / is able to)",
          "storyContext": "「実は、その時計は時間を五分だけ戻すことができます。」",
          "newPhrase": "このカードで図書館の本を五冊まで借りることができます。",
          "english": "With this card, you can borrow up to five library books."
        },
        {
          "word": "〜しか + Negative Verb (only)",
          "storyContext": "「時計のボタンは一日に一度しか使うことができません。」",
          "newPhrase": "出発まであと十分しかありません。",
          "english": "There are only ten minutes left until departure."
        }
      ],
      "construction": {
        "patternName": "Strict Limitation ('Only'): [Quantity / Time] + しか + [Negative Verb]",
        "formula": [
          "一日に一度 (once a day)",
          "+ しか (only)",
          "+ Negative Verb (使うことができません / ありません)"
        ],
        "explanation": "While « だけ » ('just/only') is used with affirmative verbs, « しか » emphasizes that a quantity or frequency is strictly limited and **MUST always be followed by a negative verb** ('cannot be used more than once a day').",
        "examples": [
          {
            "target": "このボタンは一日に一度しか使うことができません。",
            "english": "This button can only be used once a day.",
            "highlight": "一度しか ... できません"
          },
          {
            "target": "財布の中に千円しか入っていません。",
            "english": "There is only one thousand yen in my wallet.",
            "highlight": "千円しか ... いません"
          },
          {
            "target": "この特別列車は朝に一回しか走りません。",
            "english": "This special train only runs once in the morning.",
            "highlight": "一回しか走りません"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "Look, a map of a red shrine gate is drawn inside the lid!",
            "sentenceParts": [
              "「見て、ふたの中に赤い鳥居の地図が",
              "よ！」"
            ],
            "correctAnswer": "描いてあります",
            "options": [
              "描いてあります",
              "描いています",
              "描くことです",
              "描いたからです"
            ],
            "explanation": "« Te-form + あります » (« 描いてあります ») describes the resulting state of something someone purposely drew or wrote."
          },
          {
            "promptEnglish": "Actually, this ticket can be used on both buses and subways.",
            "sentenceParts": [
              "「実は、この切符はバスでも地下鉄でも使う",
              "。」"
            ],
            "correctAnswer": "ことができます",
            "options": [
              "ことができます",
              "ことにします",
              "ことがあります",
              "ところでした"
            ],
            "explanation": "« Dictionary verb + ことができます » means 'can do / is able to do'."
          },
          {
            "promptEnglish": "However, this special button can only be used once a day.",
            "sentenceParts": [
              "「でも、この特別なボタンは一日に一度しか",
              "。」"
            ],
            "correctAnswer": "使うことができません",
            "options": [
              "使うことができません",
              "使うことができます",
              "使ってあります",
              "使ってみましょう"
            ],
            "explanation": "« しか » ('only') ALWAYS requires a negative verb at the end of the sentence (« できません »)."
          },
          {
            "promptEnglish": "On the back of the watch, small letters were engraved.",
            "sentenceParts": [
              "時計の裏側には、小さな文字が",
              "いました。"
            ],
            "correctAnswer": "彫られて",
            "options": [
              "彫られて",
              "戻して",
              "沈んで",
              "走って"
            ],
            "explanation": "« 彫られていました » is the passive state of « 彫る » ('were engraved / carved')."
          },
          {
            "promptEnglish": "Before the evening sun sets, let’s try going to the shrine on the hill!",
            "sentenceParts": [
              "「夕日が",
              "前に、丘の上の神社へ行ってみましょう！」"
            ],
            "correctAnswer": "沈む",
            "options": [
              "沈む",
              "沈んだ",
              "沈んで",
              "沈みます"
            ],
            "explanation": "Before « 前に » ('before doing'), Japanese ALWAYS uses the plain dictionary (present) form of the verb: « 夕日が沈む前に »."
          },
          {
            "promptEnglish": "Thank goodness, you still have the key in your bag!",
            "sentenceParts": [
              "「",
              "、まだかばんの中に鍵を持っていますね！」"
            ],
            "correctAnswer": "よかった",
            "options": [
              "よかった",
              "しまった",
              "困った",
              "違った"
            ],
            "explanation": "« よかった！ » expresses relief ('Thank goodness! / I'm glad!')."
          }
        ],
        "dialogue": [
          {
            "speakerA": "友人 : 「この古い木の箱のふたを開けてみましたが、中に何かありますか？」",
            "speakerAEnglish": "Friend: 'I tried opening the lid of this old wooden box; is there anything inside?'",
            "promptEnglish": "Say that a map of a red shrine gate is drawn inside the lid:",
            "correctAnswer": "ええ、ふたの中に赤い鳥居の地図が描いてありますよ！",
            "options": [
              "ええ、ふたの中に赤い鳥居の地図が描いてありますよ！",
              "はい、一日に一度しかボタンを押すことができません！",
              "いいえ、夕日が沈む前に急いで山を降りました！",
              "実は、冷たいガラスのふたをポケットに入れました！"
            ],
            "explanation": "Uses « 〜が描いてあります » ('is drawn [and remains visible]')."
          },
          {
            "speakerA": "旅行者 : 「この美術館の特別展示室には、何回でも入ることができますか？」",
            "speakerAEnglish": "Traveler: 'Can we enter the special exhibition room of this museum any number of times?'",
            "promptEnglish": "Warn them politely that with this ticket, you can only enter once a day:",
            "correctAnswer": "いいえ、この切符では一日に一度しか入ることができません。",
            "options": [
              "いいえ、この切符では一日に一度しか入ることができません。",
              "はい、橋の上で古い懐中時計のふたを開けました。",
              "ええ、時計の裏側に小さな文字が彫られていました。",
              "よかった、まだ電車の切符をポケットに持っていますね。"
            ],
            "explanation": "Demonstrates « 一日に一度しか + negative verb (入ることができません) »."
          },
          {
            "speakerA": "友人 : 「もうすぐ夕方になりますが、これからどこへ行きますか？」",
            "speakerAEnglish": "Friend: 'It will be evening soon; where shall we go from here?'",
            "promptEnglish": "Suggest trying to go to the shrine on the hill before the evening sun sets:",
            "correctAnswer": "夕日が沈む前に、丘の上の神社へ行ってみましょう！",
            "options": [
              "夕日が沈む前に、丘の上の神社へ行ってみましょう！",
              "時間を五分だけ後ろに戻すことができました！",
              "真剣な顔でガラスの時計をじっと見つめました！",
              "裏の路地から静かな川の橋まで走って来ました！"
            ],
            "explanation": "Combines « 夕日が沈む前に » and « 行ってみましょう »."
          },
          {
            "speakerA": "同僚 : 「あ、大変！会議室の鍵をどこかに落としてしまったかもしれません！」",
            "speakerAEnglish": "Colleague: 'Oh no! I might have dropped the meeting room key somewhere!'",
            "promptEnglish": "Point to their desk and say: 'Thank goodness, you still have it on your desk!'",
            "correctAnswer": "よかった、まだ机の上に持っていますよ！",
            "options": [
              "よかった、まだ机の上に持っていますよ！",
              "実は、一日に一度しか使うことができません！",
              "どうして時計の針が反対に動いているのですか！",
              "店の奥を見てから静かに扉を閉めました！"
            ],
            "explanation": "Uses « よかった、まだ ... 持っていますよ »."
          },
          {
            "speakerA": "観光客 : 「このお寺の古い鐘には、何か文字がありますか？」",
            "speakerAEnglish": "Tourist: 'Are there any letters on the old bell of this temple?'",
            "promptEnglish": "Explain that on the back of the bell, old letters are engraved:",
            "correctAnswer": "はい、鐘の裏側には古い文字が彫られています。",
            "options": [
              "はい、鐘の裏側には古い文字が彫られています。",
              "いいえ、ポケットから銀色の時計を出しました。",
              "ええ、今から五分だけ時間を戻してみましょう。",
              "はい、夕日が沈む前に駅へ走って行きました。"
            ],
            "explanation": "Uses « 裏側には ... 彫られています » ('are engraved on the back')."
          },
          {
            "speakerA": "学生 : 「この古い辞書は漢字が難しそうですね。読めますか？」",
            "speakerAEnglish": "Student: 'The kanji in this old dictionary look difficult. Can you read them?'",
            "promptEnglish": "Say that actually, with this app you can look up the meaning right away:",
            "correctAnswer": "実は、このアプリを使えばすぐに意味を調べることができます。",
            "options": [
              "実は、このアプリを使えばすぐに意味を調べることができます。",
              "でも、この辞書は一週間に一度しか読むことができません。",
              "よかった、橋の上で友達と会うことができました。",
              "早く、赤い鳥居の地図をノートに描いてください。"
            ],
            "explanation": "Uses « 実は ... 調べることができます »."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "静かな橋の上で古い箱のふたを開けると、中に赤い鳥居の地図が描いてありました。",
            "correctAnswer": "When I opened the lid of the old box on the quiet bridge, a map of a red shrine gate was drawn inside.",
            "options": [
              "When I opened the lid of the old box on the quiet bridge, a map of a red shrine gate was drawn inside.",
              "When I crossed the quiet bridge in the evening, I saw a red shrine gate on top of the hill.",
              "Before crossing the quiet bridge, I put the silver watch back inside the wooden box.",
              "Under the quiet bridge by the river, I found a notebook with a red cover."
            ],
            "explanation": "« ふたを開けると、中に赤い鳥居の地図が描いてありました »."
          },
          {
            "audioSentence": "実は、この不思議な時計は時間を五分だけ戻すことができます。",
            "correctAnswer": "Actually, this mysterious watch can turn time back by just five minutes.",
            "options": [
              "Actually, this mysterious watch can turn time back by just five minutes.",
              "Actually, this antique watch is five minutes slow every morning.",
              "However, it takes only five minutes to walk from the bridge to the shrine.",
              "Actually, we can only wait here for five minutes before the gate closes."
            ],
            "explanation": "« 時間を五分だけ戻すことができます » = can turn time back by just five minutes."
          },
          {
            "audioSentence": "でも、この時計の上のボタンは一日に一度しか使うことができません。",
            "correctAnswer": "However, the button on top of this watch can only be used once a day.",
            "options": [
              "However, the button on top of this watch can only be used once a day.",
              "Therefore, you must press the button on top of this watch twice every day.",
              "However, nobody knows how to repair the button on top of this watch.",
              "Fortunately, the button on top of this watch still works very well."
            ],
            "explanation": "« 一日に一度しか使うことができません » = can only be used once a day."
          },
          {
            "audioSentence": "夕日が沈む前に、丘の上にある古い神社へ行ってみましょう。",
            "correctAnswer": "Before the evening sun sets, let’s try going to the old shrine on top of the hill.",
            "options": [
              "Before the evening sun sets, let’s try going to the old shrine on top of the hill.",
              "After the evening sun sets, the stone steps of the shrine become very dark.",
              "While watching the evening sun set from the hill, we drank warm tea together.",
              "Every morning before sunrise, many people walk up to the shrine on the hill."
            ],
            "explanation": "« 夕日が沈む前に、丘の上にある古い神社へ行ってみましょう »."
          },
          {
            "audioSentence": "時計の裏側をよく見ると、神社の名前と小さな文字が彫られていました。",
            "correctAnswer": "When I looked closely at the back of the watch, the name of the shrine and small letters were engraved.",
            "options": [
              "When I looked closely at the back of the watch, the name of the shrine and small letters were engraved.",
              "When I cleaned the glass cover of the watch, the hands started moving again.",
              "On the first page of the notebook, the history of the old shrine was written.",
              "Beside the entrance of the shrine, a stone monument was built a hundred years ago."
            ],
            "explanation": "« 時計の裏側をよく見ると、神社の名前と小さな文字が彫られていました »."
          },
          {
            "audioSentence": "友人が走って来て、「よかった、まだその大切な鍵を持っていますね！」と微笑みました。",
            "correctAnswer": "My friend came running and smiled: 'Thank goodness, you still have that precious key!'",
            "options": [
              "My friend came running and smiled: 'Thank goodness, you still have that precious key!'",
              "My friend called out from the bridge: 'Wait for me, I found the key to the box!'",
              "My friend looked inside his pocket and said: 'Oh no, I lost the key on the stairs!'",
              "My friend handed me the map and said: 'Please keep this safe until tomorrow morning!'"
            ],
            "explanation": "« よかった、まだその大切な鍵を持っていますね！ »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Japanese: 'The button can only be used once a day'?",
            "correctAnswer": "ボタンは一日に一度しか使うことができません。",
            "options": [
              "ボタンは一日に一度しか使うことができません。",
              "ボタンは一日に一度しか使うことができます。",
              "ボタンは一日に一度だけ使うことができません。",
              "ボタンは一日に一度しか使ってできます。"
            ],
            "explanation": "« しか » ('only / nothing but') MUST always be paired with a negative verb (« 使うことができません »)."
          },
          {
            "promptEnglish": "Choose the correct Japanese sentence for: 'A map is drawn inside the lid.'",
            "correctAnswer": "ふたの中に地図が描いてあります。",
            "options": [
              "ふたの中に地図が描いてあります。",
              "ふたの中に地図を描いています。",
              "ふたの中で地図が描いていきます。",
              "ふたの中に地図が描くあります。"
            ],
            "explanation": "When describing the resulting state of a deliberate transitive action ('someone drew a map and it is there now'), Japanese uses « が + Te-form + あります » (« 地図が描いてあります »)."
          },
          {
            "promptEnglish": "Select the accurate translation for: 'Before the evening sun sets, let’s try going!'",
            "correctAnswer": "夕日が沈む前に、行ってみましょう！",
            "options": [
              "夕日が沈む前に、行ってみましょう！",
              "夕日が沈んだ前に、行ってみましょう！",
              "夕日が沈んで前に、行くみましょう！",
              "夕日を沈む前に、行ってみます！"
            ],
            "explanation": "1) Before « 前に », verbs are always in the non-past dictionary form (« 沈む前に », never *沈んだ前に), and 2) 'let's try going' is « 行ってみましょう »."
          },
          {
            "promptEnglish": "How do you say: 'That watch can turn time back by just five minutes'?",
            "correctAnswer": "その時計は時間を五分だけ戻すことができます。",
            "options": [
              "その時計は時間を五分だけ戻すことができます。",
              "その時計は時間が五分だけ戻るできます。",
              "その時計は時間を五分しか戻すことができます。",
              "その時計は時間を五分だけ戻してことができます。"
            ],
            "explanation": "1) 'To turn time back' is transitive « 時間を戻す » (whereas « 時間が戻る » is intransitive), 2) affirmative 'just five minutes' uses « 五分だけ », and 3) « ことができます » follows the dictionary form."
          },
          {
            "promptEnglish": "Which sentence accurately says: 'Small letters were engraved on the back of the watch'?",
            "correctAnswer": "時計の裏側には小さな文字が彫られていました。",
            "options": [
              "時計の裏側には小さな文字が彫られていました。",
              "時計の裏側には小さな文字を彫っていました。",
              "時計の裏側で小さな文字が彫るでした。",
              "時計の裏側には小さな文字に彫られました。"
            ],
            "explanation": "Passive state in the past is expressed with the passive te-form + « いました » (« 彫られていました » = 'had been engraved / were engraved')."
          },
          {
            "promptEnglish": "Choose the natural Japanese phrase for: 'He came running there and smiled.'",
            "correctAnswer": "そこへ走って来て、微笑みました。",
            "options": [
              "そこへ走って来て、微笑みました。",
              "そこへ走る来て、微笑みました。",
              "そこで走って行って、微笑みました。",
              "そこへ走ってから来て、微笑むました。"
            ],
            "explanation": "« 走って来る » (te-form of « 走る » + « 来る ») means 'to come running' toward the speaker/scene."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "A map of a red shrine gate is drawn inside the lid.",
            "chunks": [
              "ふたの中に",
              "赤い鳥居の",
              "地図が",
              "描いてあります"
            ],
            "explanation": "Location (« ふたの中に ») + Noun modifier (« 赤い鳥居の ») + Subject (« 地図が ») + Resulting state (« 描いてあります »)."
          },
          {
            "promptEnglish": "That watch can turn time back by just five minutes.",
            "chunks": [
              "その時計は",
              "時間を",
              "五分だけ",
              "戻すことができます"
            ],
            "explanation": "Topic (« その時計は ») + Object (« 時間を ») + Extent (« 五分だけ ») + Ability (« 戻すことができます »)."
          },
          {
            "promptEnglish": "The button can only be used once a day.",
            "chunks": [
              "ボタンは",
              "一日に",
              "一度しか",
              "使うことができません"
            ],
            "explanation": "Topic (« ボタンは ») + Time frame (« 一日に ») + Limitation (« 一度しか ») + Negative ability (« 使うことができません »)."
          },
          {
            "promptEnglish": "Before the evening sun sets, let’s try going to the shrine!",
            "chunks": [
              "夕日が",
              "沈む前に、",
              "神社へ",
              "行ってみましょう！"
            ],
            "explanation": "Time clause (« 夕日が沈む前に、 ») + Destination (« 神社へ ») + Invitation (« 行ってみましょう！ »)."
          },
          {
            "promptEnglish": "On the back of the watch, small letters were engraved.",
            "chunks": [
              "時計の",
              "裏側には、",
              "小さな文字が",
              "彫られていました"
            ],
            "explanation": "Location topic (« 時計の裏側には、 ») + Subject (« 小さな文字が ») + Passive state (« 彫られていました »)."
          },
          {
            "promptEnglish": "Thank goodness, you still have that silver watch!",
            "chunks": [
              "よかった、",
              "まだ",
              "その銀色の時計を",
              "持っていますね！"
            ],
            "explanation": "Exclamation (« よかった、 ») + Adverb (« まだ ») + Object (« その銀色の時計を ») + Ongoing state (« 持っていますね！ »)."
          }
        ]
      }
    },
    "3": {
      "subtitle": "Conditional 'と' ('When/Whenever'), Simultaneous '〜ながら', Compound '〜きる' & Gratitude ('〜のおかげで')",
      "vocabReuses": [
        {
          "word": "〜のおかげで (thanks to...)",
          "storyContext": "「おかげで、おじいさんの大切な宝物を守ることができました！」",
          "newPhrase": "優しい先生のおかげで、日本語の会話が楽しくなりました。",
          "english": "Thanks to my kind teacher, Japanese conversation has become fun."
        },
        {
          "word": "〜ながら (while doing simultaneously)",
          "storyContext": "笑いながら、別の秘密の階段を走りました。",
          "newPhrase": "毎朝、音楽を聴きながら公園を散歩します。",
          "english": "Every morning, I take a walk in the park while listening to music."
        },
        {
          "word": "登りきる (to climb all the way to the top)",
          "storyContext": "秘密の階段を登りきると、静かな庭が現れました。",
          "newPhrase": "長い石段を登りきると、美しい海が見えました。",
          "english": "When we finished climbing the long stone steps, the beautiful sea came into view."
        }
      ],
      "construction": {
        "patternName": "Expressing Gratitude for a Positive Outcome: [Person / Noun] + のおかげで、[Positive Result]",
        "formula": [
          "Noun / Person (あなた / 地図)",
          "+ のおかげで (thanks to),",
          "+ Positive Past Result (〜ることができました)"
        ],
        "explanation": "In Japanese, « 〜のおかげで » ('thanks to X') explicitly attributes a positive result to someone's help or a fortunate circumstance, often paired with « 〜ることができました » ('was able to...').",
        "examples": [
          {
            "target": "あなたのおかげで、大切な宝物を守ることができました！",
            "english": "Thanks to you, I was able to protect the precious treasure!",
            "highlight": "おかげで ... 守ることができました"
          },
          {
            "target": "この古い地図のおかげで、秘密の階段を見つけました。",
            "english": "Thanks to this old map, we found the secret staircase.",
            "highlight": "地図のおかげで"
          },
          {
            "target": "友達の手伝いのおかげで、時間通りに終わりました。",
            "english": "Thanks to my friend’s help, we finished on time.",
            "highlight": "手伝いのおかげで"
          }
        ]
      },
      "drills": {
        "cloze": [
          {
            "promptEnglish": "At dusk, when we climbed the stone steps, a quiet garden appeared.",
            "sentenceParts": [
              "夕方、石段を",
              "、静かな庭が現れました。"
            ],
            "correctAnswer": "登ると",
            "options": [
              "登ると",
              "登れば",
              "登るなら",
              "登っても"
            ],
            "explanation": "« Dictionary form + と » (« 登ると ») marks an immediate natural discovery ('when/upon climbing, X happened')."
          },
          {
            "promptEnglish": "She ran up the secret staircase while laughing happily.",
            "sentenceParts": [
              "彼女は楽しく",
              "、秘密の階段を走りました。"
            ],
            "correctAnswer": "笑いながら",
            "options": [
              "笑いながら",
              "笑ってから",
              "笑ったあと",
              "笑うまえに"
            ],
            "explanation": "Attach « ながら » to the masu-stem (« 笑い + ながら ») to express 'while laughing'."
          },
          {
            "promptEnglish": "When we climbed all the way to the top of the stairs, a large cedar tree appeared.",
            "sentenceParts": [
              "階段を",
              "と、大きな杉の木が現れました。"
            ],
            "correctAnswer": "登りきる",
            "options": [
              "登りきる",
              "登りすぎる",
              "登りわすれる",
              "登りなおす"
            ],
            "explanation": "Attaching « 〜きる » to a verb stem (« 登りきる ») means 'to do completely / all the way to the end'."
          },
          {
            "promptEnglish": "At the base of the tree, a small wooden box had been placed.",
            "sentenceParts": [
              "木の根元には、小さな木の箱が",
              "ありました。"
            ],
            "correctAnswer": "置いて",
            "options": [
              "置いて",
              "置かれて",
              "置く",
              "置いた"
            ],
            "explanation": "« 置いてありました » (Te-form + ありました) shows that someone had purposely placed the box there beforehand."
          },
          {
            "promptEnglish": "When I opened the box, inside were a letter and a blueprint.",
            "sentenceParts": [
              "箱を開けると、中には手紙と設計図が",
              "いました。"
            ],
            "correctAnswer": "入って",
            "options": [
              "入って",
              "入れて",
              "入り",
              "入る"
            ],
            "explanation": "Intransitive « 入っていました » means 'were inside / contained within'."
          },
          {
            "promptEnglish": "Thanks to your help, I was able to protect my grandfather's treasure!",
            "sentenceParts": [
              "「あなたの",
              "、おじいさんの宝物を守ることができました！」"
            ],
            "correctAnswer": "おかげで",
            "options": [
              "おかげで",
              "せいで",
              "ために",
              "わりに"
            ],
            "explanation": "« 〜のおかげで » expresses gratitude for a positive outcome ('thanks to you'), whereas « せいで » is used for blame."
          }
        ],
        "dialogue": [
          {
            "speakerA": "友人 : 「この神社の長い石段を最後まで登ると、何がありますか？」",
            "speakerAEnglish": "Friend: 'When you climb the long stone steps of this shrine to the end, what is there?'",
            "promptEnglish": "Say that when you finish climbing the stairs, a quiet garden and a large cedar tree appear:",
            "correctAnswer": "階段を登りきると、静かな庭と大きな杉の木が現れますよ。",
            "options": [
              "階段を登りきると、静かな庭と大きな杉の木が現れますよ。",
              "時計の上のボタンを一日に一度しか押すことができません。",
              "黒い服の男が店の外で車の音を聞いていました。",
              "おじいさんが作った懐中時計をポケットに隠しました。"
            ],
            "explanation": "Uses « 階段を登りきると、... が現れます »."
          },
          {
            "speakerA": "同僚 : 「今日のプロジェクトが無事に成功して本当によかったですね！」",
            "speakerAEnglish": "Colleague: 'It is truly great that today's project succeeded safely!'",
            "promptEnglish": "Thank them warmly: 'Thanks to you, we were able to protect our important plan!'",
            "correctAnswer": "あなたのおかげで、大切な計画を守ることができました！",
            "options": [
              "あなたのおかげで、大切な計画を守ることができました！",
              "不思議な光が光って、五分前の場所へ戻りました！",
              "杉の木の根元に古い手紙が置いてありました！",
              "笑いながら別の秘密の階段を急いで走りました！"
            ],
            "explanation": "Demonstrates « あなたのおかげで、... 守ることができました！ »."
          },
          {
            "speakerA": "案内人 : 「あの大きな杉の木の根元を見てください。何か見えませんか？」",
            "speakerAEnglish": "Guide: 'Please look at the base of that large cedar tree. Don't you see something?'",
            "promptEnglish": "Say that a small wooden box that someone hid has been placed there:",
            "correctAnswer": "本当ですね！誰かが隠した小さな木の箱が置いてあります！",
            "options": [
              "本当ですね！誰かが隠した小さな木の箱が置いてあります！",
              "すごいですね！本当に時間が五分だけ戻りました！",
              "危ないですね！その時計の上のボタンを押してください！",
              "きれいですね！夕日が沈む前に橋を渡りましょう！"
            ],
            "explanation": "Combines past relative modifier « 誰かが隠した » and resulting state « 置いてあります »."
          },
          {
            "speakerA": "友人 : 「その古い木の箱を開けると、中には何が入っていましたか？」",
            "speakerAEnglish": "Friend: 'When you opened that old wooden box, what was inside?'",
            "promptEnglish": "Explain that inside were your grandfather's letter and the blueprint for a pocket watch:",
            "correctAnswer": "中にはおじいさんの手紙と懐中時計の設計図が入っていました。",
            "options": [
              "中にはおじいさんの手紙と懐中時計の設計図が入っていました。",
              "裏側には古い神社の名前と小さな文字が彫られていました。",
              "ふたの中には赤い鳥居の地図がきれいに描いてありました。",
              "店の奥には若い職人が一人で静かに立っていました。"
            ],
            "explanation": "Uses « 中には ... が入っていました » ('inside were...')."
          },
          {
            "speakerA": "家族 : 「休日の朝はいつもどんなふうに過ごしていますか？」",
            "speakerAEnglish": "Family member: 'How do you usually spend your holiday mornings?'",
            "promptEnglish": "Say that you walk through the quiet garden while listening to your favorite music:",
            "correctAnswer": "好きな音楽を聴きながら、静かな庭を歩いています。",
            "options": [
              "好きな音楽を聴きながら、静かな庭を歩いています。",
              "石段を登りきってから、大きな杉の木を見ました。",
              "時計のボタンを押すと、不思議な光が光りました。",
              "大切な宝物を守るために、鍵をポケットに入れました。"
            ],
            "explanation": "Uses simultaneous action « 音楽を聴きながら » ('while listening to music')."
          },
          {
            "speakerA": "仲間 : 「大変です！前の道が閉まっています！どうしましょうか？」",
            "speakerAEnglish": "Teammate: 'Oh no! The road ahead is closed! What shall we do?'",
            "promptEnglish": "Point to the side and say: 'Now! Let's run up that other secret staircase!'",
            "correctAnswer": "今です！あの別の秘密の階段を走って登りましょう！",
            "options": [
              "今です！あの別の秘密の階段を走って登りましょう！",
              "よかった！五分前の鳥居の下に無事に戻りました！",
              "実は！このボタンは一日に一度しか使えません！",
              "すごい！箱の中に美しい設計図が入っていました！"
            ],
            "explanation": "Uses « 今です！ » and « 別の秘密の階段 »."
          }
        ],
        "audio_comprehension": [
          {
            "audioSentence": "秘密の石段を登りきると、私たちの前に静かな庭と大きな杉の木が現れました。",
            "correctAnswer": "When we finished climbing the secret stone steps, a quiet garden and a large cedar tree appeared before us.",
            "options": [
              "When we finished climbing the secret stone steps, a quiet garden and a large cedar tree appeared before us.",
              "Before climbing the stone steps of the shrine, we rested under a large cedar tree in the garden.",
              "While walking down the stone steps at dusk, we met an old man wearing black clothes.",
              "Behind the large cedar tree in the garden, we found a locked wooden gate."
            ],
            "explanation": "« 秘密の石段を登りきると、私たちの前に静かな庭と大きな杉の木が現れました »."
          },
          {
            "audioSentence": "大きな杉の木の根元には、祖父が隠した小さな木の箱が置いてありました。",
            "correctAnswer": "At the base of the large cedar tree, a small wooden box that my grandfather had hidden had been placed.",
            "options": [
              "At the base of the large cedar tree, a small wooden box that my grandfather had hidden had been placed.",
              "On the branch of the large cedar tree, a small bird was singing in the evening light.",
              "Under the wooden floor of the shrine, my grandfather found an antique silver watch.",
              "Inside the small wooden box, there was a map showing the location of the cedar tree."
            ],
            "explanation": "« 大きな杉の木の根元には、祖父が隠した小さな木の箱が置いてありました »."
          },
          {
            "audioSentence": "木の箱を開けると、中には古い手紙と美しい懐中時計の設計図が入っていました。",
            "correctAnswer": "When I opened the wooden box, inside were an old letter and the blueprint for a beautiful pocket watch.",
            "options": [
              "When I opened the wooden box, inside were an old letter and the blueprint for a beautiful pocket watch.",
              "When I locked the wooden box, I put the old letter and the blueprint into my drawer.",
              "Although I opened the wooden box carefully, there was nothing left inside it.",
              "Before opening the wooden box, I read my grandfather’s letter beside the window."
            ],
            "explanation": "« 木の箱を開けると、中には古い手紙と美しい懐中時計の設計図が入っていました »."
          },
          {
            "audioSentence": "あなたのおかげで、おじいさんの大切な宝物を無事に守ることができました。",
            "correctAnswer": "Thanks to you, I was able to safely protect my grandfather’s precious treasure.",
            "options": [
              "Thanks to you, I was able to safely protect my grandfather’s precious treasure.",
              "Because of the heavy rain, we could not reach my grandfather’s house before dusk.",
              "For my grandfather’s birthday, I repaired the antique clock that he treasured.",
              "With my friend’s help, I translated all the old letters in the library."
            ],
            "explanation": "« あなたのおかげで、おじいさんの大切な宝物を無事に守ることができました »."
          },
          {
            "audioSentence": "不思議な光が光って、私たちは五分前の赤い鳥居の下に戻りました。",
            "correctAnswer": "A mysterious light flashed, and we returned to the bottom of the red shrine gate five minutes earlier.",
            "options": [
              "A mysterious light flashed, and we returned to the bottom of the red shrine gate five minutes earlier.",
              "The evening sun shone brightly, and we took a photograph in front of the red shrine gate.",
              "A cold wind blew through the alley, and the lantern under the shrine gate went out.",
              "After waiting for five minutes under the shrine gate, we saw our friend running toward us."
            ],
            "explanation": "« 不思議な光が光って、私たちは五分前の赤い鳥居の下に戻りました »."
          },
          {
            "audioSentence": "「本当に時間が戻ったわ！」と笑いながら、私たちは別の階段を走りました。",
            "correctAnswer": "Laughing, 'Time really turned back!', we ran up another staircase.",
            "options": [
              "Laughing, 'Time really turned back!', we ran up another staircase.",
              "Whispering, 'Please do not make a sound!', we hid behind the stone staircase.",
              "Asking, 'What time does the shrine close?', we walked slowly up the stairs.",
              "Shouting, 'Press the button on the watch now!', he stood in front of the stairs."
            ],
            "explanation": "« 「本当に時間が戻ったわ！」と笑いながら、私たちは別の階段を走りました »."
          }
        ],
        "grammar_contrast": [
          {
            "promptEnglish": "How do you say in Japanese: 'Thanks to you, I was able to protect the precious treasure!'?",
            "correctAnswer": "あなたのおかげで、大切な宝物を守ることができました！",
            "options": [
              "あなたのおかげで、大切な宝物を守ることができました！",
              "あなたのせいで、大切な宝物を守ることができました！",
              "あなたのおかげに、大切な宝物が守るできました！",
              "あなたのおかげで、大切な宝物を守ったことでした！"
            ],
            "explanation": "« 〜のおかげで » expresses gratitude for a positive result ('thanks to you'), whereas « 〜のせいで » expresses blame for a negative result."
          },
          {
            "promptEnglish": "Choose the correct Japanese sentence for: 'She ran up another staircase while laughing.'",
            "correctAnswer": "笑いながら、別の階段を走りました。",
            "options": [
              "笑いながら、別の階段を走りました。",
              "笑うながら、別の階段を走りました。",
              "笑ってながら、別の階段に走りました。",
              "笑ったながら、別の階段で走りました。"
            ],
            "explanation": "« 〜ながら » ('while doing') attaches directly to the **masu-stem** of the verb (« 笑います → 笑いながら »), never the dictionary or te-form."
          },
          {
            "promptEnglish": "Select the accurate translation for: 'When we finished climbing the secret stairs, a quiet garden appeared.'",
            "correctAnswer": "秘密の階段を登りきると、静かな庭が現れました。",
            "options": [
              "秘密の階段を登りきると、静かな庭が現れました。",
              "秘密の階段を登りきったらば、静かな庭を現しました。",
              "秘密の階段に登ってきると、静かな庭が現れました。",
              "秘密の階段を登りきるから、静かな庭が現れます。"
            ],
            "explanation": "1) Compound verb « 登りきる » ('climb all the way') + « と » marks what naturally came into view next, and 2) intransitive « 現れる » takes « が » (« 庭が現れました »)."
          },
          {
            "promptEnglish": "How do you say: 'Inside the box were a letter and a blueprint'?",
            "correctAnswer": "箱の中には手紙と設計図が入っていました。",
            "options": [
              "箱の中には手紙と設計図が入っていました。",
              "箱の中には手紙と設計図を入れていました。",
              "箱の中で手紙と設計図が入ってありました。",
              "箱の中には手紙や設計図を入られました。"
            ],
            "explanation": "To state what was contained inside a box, Japanese uses the intransitive « 入っていました » ('were inside') with « が »."
          },
          {
            "promptEnglish": "Which sentence accurately says: 'A small wooden box that my grandfather had hidden had been placed there'?",
            "correctAnswer": "おじいさんが隠した小さな木の箱が置いてありました。",
            "options": [
              "おじいさんが隠した小さな木の箱が置いてありました。",
              "おじいさんが隠す小さな木の箱を置いていました。",
              "おじいさんの隠した小さな木の箱が置いていました。",
              "おじいさんが隠して小さな木の箱を置いてありました。"
            ],
            "explanation": "« 置いてありました » (with subject « が ») indicates that the box had been purposely placed there and remained there waiting."
          },
          {
            "promptEnglish": "Choose the correct urgent request: 'Press the button on top of that watch!'",
            "correctAnswer": "その時計の上のボタンを押してください！",
            "options": [
              "その時計の上のボタンを押してください！",
              "その時計の上でボタンに押してください！",
              "その時計の上のボタンを押すください！",
              "その時計の上にボタンが押してください！"
            ],
            "explanation": "Noun modifier chain « その時計の上のボタン » ('the button on top of that watch') + direct object « を » + te-form request « 押してください »."
          }
        ],
        "sentence_order": [
          {
            "promptEnglish": "Thanks to you, I was able to protect my grandfather’s precious treasure!",
            "chunks": [
              "あなたのおかげで、",
              "おじいさんの",
              "大切な宝物を",
              "守ることができました！"
            ],
            "explanation": "Gratitude phrase (« あなたのおかげで、 ») + Possessive & Object (« おじいさんの大切な宝物を ») + Past ability (« 守ることができました！ »)."
          },
          {
            "promptEnglish": "When we finished climbing the stairs, a quiet garden appeared.",
            "chunks": [
              "階段を",
              "登りきると、",
              "静かな庭が",
              "現れました"
            ],
            "explanation": "Object + Compound verb + to (« 階段を登りきると、 ») + Subject (« 静かな庭が ») + Intransitive verb (« 現れました »)."
          },
          {
            "promptEnglish": "She ran up another secret staircase while laughing.",
            "chunks": [
              "彼女は",
              "笑いながら、",
              "別の秘密の階段を",
              "走りました"
            ],
            "explanation": "Topic (« 彼女は ») + Simultaneous action (« 笑いながら、 ») + Path object (« 別の秘密の階段を ») + Verb (« 走りました »)."
          },
          {
            "promptEnglish": "At the base of the cedar tree, a small wooden box had been placed.",
            "chunks": [
              "杉の木の",
              "根元には、",
              "小さな木の箱が",
              "置いてありました"
            ],
            "explanation": "Location topic (« 杉の木の根元には、 ») + Subject (« 小さな木の箱が ») + Resulting state (« 置いてありました »)."
          },
          {
            "promptEnglish": "When I opened the box, inside were a letter and a blueprint.",
            "chunks": [
              "箱を開けると、",
              "中には",
              "手紙と設計図が",
              "入っていました"
            ],
            "explanation": "Trigger clause (« 箱を開けると、 ») + Location (« 中には ») + Subject (« 手紙と設計図が ») + State verb (« 入っていました »)."
          },
          {
            "promptEnglish": "Press the button on top of that watch right now!",
            "chunks": [
              "今すぐ",
              "その時計の",
              "上のボタンを",
              "押してください！"
            ],
            "explanation": "Time (« 今すぐ ») + Modifier (« その時計の ») + Object (« 上のボタンを ») + Polite command (« 押してください！ »)."
          }
        ]
      }
    }
  }
};

/**
 * Deterministic shuffle helper so multiple-choice options and sentence-order tiles
 * never put the correct answer in a predictable slot.
 */
function deterministicShuffle(array, seedNum) {
  const arr = [...array];
  let s = (seedNum || 1) * 9301 + 49297;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Strips character names from dynamic fallback sentences (for AI-generated Chapters 4+)
 * so learners can never cheat by matching character names between English and the target language.
 */
const CHARACTER_NAME_REPLACEMENTS = [
  { regex: /\b(Clara|Sofia|Elena)\b/g, target: 'Mon amie', en: 'My friend' },
  { regex: /\b(Lucas|Henri|Paul|Marco|Mateo)\b/g, target: 'Mon ami', en: 'My friend' },
  { regex: /민호|지수/g, target: '친구', en: 'My friend' },
  { regex: /遥|蓮/g, target: '友人', en: 'My friend' },
  { regex: /เลียม|พลอย|สมชาย/g, target: 'เพื่อนของฉัน', en: 'My friend' }
];

function anonymizeCharacterNames(text, mode = 'en') {
  if (!text) return '';
  let result = text;
  for (const rule of CHARACTER_NAME_REPLACEMENTS) {
    result = result.replace(rule.regex, mode === 'en' ? rule.en : rule.target);
  }
  return result;
}

/**
 * Interleaves the 5 cognitive modalities (6 items each = 30 total) into a balanced sequence.
 * - First 15 exercises: 3 of each modality (Cloze, Pragmatic Dialogue, Blind Audio, Grammar Contrast, Sentence Assembly)
 * - Full 30 exercises: All 6 of each modality
 * Every single exercise uses a 100% unique sentence — zero repetition across the entire checkpoint!
 */
function buildInterleavedExerciseSet(curatedData, chapter, languageCode, chapterNum) {
  const seedBase = (chapterNum || 1) * 37 + (languageCode?.charCodeAt(0) || 100);
  const drills = curatedData?.drills;

  if (drills && drills.cloze && drills.dialogue && drills.audio_comprehension && drills.grammar_contrast && drills.sentence_order) {
    const clozeList = drills.cloze.map((q, idx) => ({
      id: `cloze-${idx}`,
      type: 'cloze',
      badgeLabel: 'Context Transfer (Cloze)',
      promptEnglish: q.promptEnglish,
      sentenceParts: q.sentenceParts,
      correctAnswer: q.correctAnswer,
      options: deterministicShuffle(q.options, seedBase + idx * 11 + 1),
      fullSentence: `${q.sentenceParts[0]}${q.correctAnswer}${q.sentenceParts[1]}`,
      explanation: q.explanation
    }));

    const dialogueList = drills.dialogue.map((q, idx) => ({
      id: `dialogue-${idx}`,
      type: 'dialogue',
      badgeLabel: 'Pragmatic Mini-Dialogue',
      speakerA: q.speakerA,
      speakerAEnglish: q.speakerAEnglish,
      promptEnglish: q.promptEnglish,
      correctAnswer: q.correctAnswer,
      options: deterministicShuffle(q.options, seedBase + idx * 13 + 2),
      fullSentence: q.correctAnswer,
      explanation: q.explanation
    }));

    const audioList = drills.audio_comprehension.map((q, idx) => ({
      id: `audio-${idx}`,
      type: 'audio_comprehension',
      badgeLabel: 'Blind Audio Decoding',
      promptEnglish: 'Listen to the spoken sentence (without reading!) and choose the exact meaning:',
      audioSentence: q.audioSentence,
      correctAnswer: q.correctAnswer,
      options: deterministicShuffle(q.options, seedBase + idx * 17 + 3),
      fullSentence: q.audioSentence,
      explanation: q.explanation
    }));

    const grammarList = drills.grammar_contrast.map((q, idx) => ({
      id: `grammar-${idx}`,
      type: 'grammar_contrast',
      badgeLabel: 'Form-Focused Pattern Check',
      promptEnglish: q.promptEnglish,
      correctAnswer: q.correctAnswer,
      options: deterministicShuffle(q.options, seedBase + idx * 19 + 4),
      fullSentence: q.correctAnswer,
      explanation: q.explanation
    }));

    const orderList = drills.sentence_order.map((q, idx) => {
      let shuffled = deterministicShuffle(q.chunks, seedBase + idx * 23 + 5);
      if (shuffled.every((c, i) => c === q.chunks[i]) && shuffled.length > 1) {
        shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
      }
      return {
        id: `order-${idx}`,
        type: 'sentence_order',
        badgeLabel: 'Interactive Sentence Assembly',
        promptEnglish: q.promptEnglish,
        correctChunks: q.chunks,
        shuffledChunks: shuffled,
        correctAnswer: q.chunks.join(' '),
        fullSentence: q.chunks.join(' '),
        explanation: q.explanation
      };
    });

    const interleaved = [];
    for (let round = 0; round < 6; round++) {
      if (clozeList[round]) interleaved.push(clozeList[round]);
      if (dialogueList[round]) interleaved.push(dialogueList[round]);
      if (audioList[round]) interleaved.push(audioList[round]);
      if (grammarList[round]) interleaved.push(grammarList[round]);
      if (orderList[round]) interleaved.push(orderList[round]);
    }
    return interleaved;
  }

  return buildDynamicFallbackExercises(chapter, seedBase);
}

function buildDynamicFallbackExercises(chapter, seedBase) {
  const sentences = chapter?.sentences || [];
  const allLexicalTokens = [];
  sentences.forEach((s) => {
    (s.tokens || []).forEach((tok) => {
      if (
        tok?.surface &&
        tok.surface.length >= 2 &&
        !isProperNounOrNonLexicalToken(tok) &&
        tok.contextualMeaning
      ) {
        allLexicalTokens.push(tok);
      }
    });
  });

  const exercises = [];
  sentences.forEach((s, idx) => {
    const rawTarget = s.fullSentence || s.target || '';
    const rawEn = s.englishTranslation || s.english || '';
    const cleanTarget = anonymizeCharacterNames(rawTarget, 'target');
    const cleanEn = anonymizeCharacterNames(rawEn, 'en');
    const validTokens = (s.tokens || []).filter(
      (tok) => tok?.surface && tok.surface.length >= 2 && !isProperNounOrNonLexicalToken(tok)
    );
    if (validTokens.length >= 3) {
      const targetTok = validTokens[Math.floor(validTokens.length / 2)];
      const answer = targetTok.surface;
      const distractors = allLexicalTokens
        .map((t) => t.surface)
        .filter((w, i, self) => w.toLowerCase() !== answer.toLowerCase() && self.indexOf(w) === i)
        .slice(idx, idx + 3);
      while (distractors.length < 3) distractors.push(`mot-${distractors.length + 1}`);
      const parts = cleanTarget.split(answer);
      if (parts.length >= 2) {
        exercises.push({
          id: `dyn-cloze-${idx}`,
          type: 'cloze',
          badgeLabel: 'Context Transfer (Cloze)',
          promptEnglish: cleanEn,
          sentenceParts: [parts[0], parts.slice(1).join(answer)],
          correctAnswer: answer,
          options: deterministicShuffle([answer, ...distractors.slice(0, 3)], seedBase + idx),
          fullSentence: cleanTarget,
          explanation: `« ${answer} » means '${targetTok.contextualMeaning || ''}'.`
        });
      }
    }
  });
  return exercises;
}

export default function ChapterRecapSection({
  profile,
  languageCode: propLangCode,
  chapter,
  chapterIndex = 0,
  totalChapters = 3,
  onSelectChapterIndex,
  onGenerateNextChapter,
  isGeneratingChapter = false,
  onPlaySentenceAudio: propPlaySentenceAudio,
  onNextChapter: propNextChapter,
  hasNextChapter: propHasNextChapter,
  onGenerateChapter: propGenerateChapter
}) {
  const languageCode = propLangCode || profile?.id || 'fr';
  const bcp47 = profile?.bcp47 || 'fr-FR';
  const chapterNum = chapter?.chapterNumber || chapter?.number || (chapterIndex ?? 0) + 1;
  const langBank = COURSE_RECAP_BANK[languageCode] || {};
  const curatedData = langBank[chapterNum];

  const hasNextChapter =
    propHasNextChapter !== undefined
      ? propHasNextChapter
      : (chapterIndex ?? 0) + 1 < (totalChapters || 1);

  const onNextChapter =
    propNextChapter ||
    (() => {
      if (onSelectChapterIndex) {
        onSelectChapterIndex((chapterIndex ?? 0) + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

  const onGenerateChapter = propGenerateChapter || onGenerateNextChapter;

  const onPlaySentenceAudio =
    propPlaySentenceAudio ||
    ((text, speed = 1.0) => {
      speakSingleWord(text, bcp47, speed);
    });

  const allExercises = useMemo(
    () => buildInterleavedExerciseSet(curatedData, chapter, languageCode, chapterNum),
    [curatedData, chapter, languageCode, chapterNum]
  );

  const [exerciseCountMode, setExerciseCountMode] = useState(15); // 15 or 30
  const [viewMode, setViewMode] = useState('focused'); // 'focused' (1 card at a time) or 'list' (all cards)
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [assembledTiles, setAssembledTiles] = useState({});
  const [revealedTranscripts, setRevealedTranscripts] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [showMethodologyInfo, setShowMethodologyInfo] = useState(false);

  // Reset state when chapter or language changes
  useEffect(() => {
    setSelectedAnswers({});
    setAssembledTiles({});
    setRevealedTranscripts({});
    setExerciseCountMode(15);
    setFilterType('all');
    setCurrentStepIdx(0);
  }, [languageCode, chapterNum]);

  const activeExercises = useMemo(() => {
    const sliced = allExercises.slice(0, exerciseCountMode);
    if (filterType === 'all') return sliced;
    return sliced.filter((q) => q.type === filterType);
  }, [allExercises, exerciseCountMode, filterType]);

  // Keep currentStepIdx in bounds when switching filter or 15/30 mode
  useEffect(() => {
    if (currentStepIdx >= activeExercises.length) {
      setCurrentStepIdx(0);
    }
  }, [activeExercises.length, currentStepIdx]);

  const totalQuestions = Math.min(exerciseCountMode, allExercises.length);
  const activeSlice = allExercises.slice(0, totalQuestions);
  const answeredCount = activeSlice.filter((q) => selectedAnswers[q.id] !== undefined).length;
  const correctCount = activeSlice.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
  const allCompleted = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectOption = (qId, option) => {
    if (selectedAnswers[qId] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleTileClick = (q, tileText, sourceIdx) => {
    if (selectedAnswers[q.id] !== undefined) return;
    const currentList = assembledTiles[q.id] || [];
    if (currentList.some((item) => item.sourceIdx === sourceIdx)) return;

    const updated = [...currentList, { text: tileText, sourceIdx }];
    setAssembledTiles((prev) => ({ ...prev, [q.id]: updated }));

    if (updated.length === q.correctChunks.length) {
      const candidate = updated.map((t) => t.text).join(' ');
      setSelectedAnswers((prev) => ({ ...prev, [q.id]: candidate }));
    }
  };

  const handleRemovePlacedTile = (q, placedIdx) => {
    if (selectedAnswers[q.id] !== undefined) return;
    const currentList = assembledTiles[q.id] || [];
    const updated = currentList.filter((_, idx) => idx !== placedIdx);
    setAssembledTiles((prev) => ({ ...prev, [q.id]: updated }));
  };

  const handleResetQuestion = (qId) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setAssembledTiles((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setAssembledTiles({});
    setRevealedTranscripts({});
    setCurrentStepIdx(0);
  };

  const toggleTranscriptHint = (qId) => {
    setRevealedTranscripts((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'cloze':
        return {
          icon: Puzzle,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          accent: 'text-emerald-600'
        };
      case 'dialogue':
        return {
          icon: MessageSquare,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          accent: 'text-blue-600'
        };
      case 'audio_comprehension':
        return {
          icon: Headphones,
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          accent: 'text-purple-600'
        };
      case 'grammar_contrast':
        return {
          icon: Scale,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          accent: 'text-amber-600'
        };
      case 'sentence_order':
        return {
          icon: ListOrdered,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          accent: 'text-rose-600'
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          accent: 'text-stone-600'
        };
    }
  };

  const vocabReuses = curatedData?.vocabReuses || [];
  const construction = curatedData?.construction || null;
  const subtitle =
    curatedData?.subtitle ||
    'Contextual Recombination, Sentence Patterns & Multi-Modal Active Recall';

  const exercisesToRender =
    viewMode === 'focused'
      ? activeExercises.slice(currentStepIdx, currentStepIdx + 1)
      : activeExercises;

  return (
    <section
      className="mt-10 pt-8 border-t border-[#E2E7E4]"
      aria-label="Chapter Consolidation & Active Recall"
    >
      {/* Streamlined Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#FDF8F3] via-[#FAF6F0] to-[#F5F7F6] border border-[#E8D7C3] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-800 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Chapter {chapterNum} Consolidation &amp; Transfer Lab</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#181D1B] tracking-tight">
              Beyond the Story: Recombine &amp; Master
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5550] leading-relaxed">
              <span className="font-semibold text-[#181D1B]">Grammar &amp; Lexical Focus:</span>{' '}
              {subtitle}
            </p>
          </div>

          {/* Score Pill */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#DCE2DF] shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">
              {correctCount}/{totalQuestions}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Recall Progress
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#181D1B]">
                {allCompleted
                  ? correctCount === totalQuestions
                    ? 'Perfect Mastery!'
                    : 'Checkpoint Complete!'
                  : `${answeredCount} of ${totalQuestions} completed`}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Expandable SLA Methodology Note */}
        <div className="mt-4 pt-3 border-t border-[#E8D7C3]/70">
          <button
            type="button"
            onClick={() => setShowMethodologyInfo((v) => !v)}
            className="flex items-center justify-between w-full text-left text-xs font-semibold text-[#4A5550] hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Adult SLA Methodology: Why these exercises use fresh contexts &amp; blind audio
              </span>
            </span>
            {showMethodologyInfo ? (
              <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
            )}
          </button>

          {showMethodologyInfo && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 bg-white rounded-xl p-4 border border-[#E8D7C3]">
              <div className="space-y-1">
                <div className="font-bold text-stone-800">
                  1. Chunk Recombination (Conti’s EPI)
                </div>
                <p className="leading-relaxed">
                  Instead of repeating the same story lines, all 30 drills transplant the chapter’s vocabulary into fresh everyday scenarios so you build flexible mental schemas.
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-stone-800">
                  2. Anti-Shortcut Design (VanPatten’s IP)
                </div>
                <p className="leading-relaxed">
                  Character names are stripped from all exercises and options share the same grammatical subject so you can never guess by matching names.
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-stone-800">
                  3. Blind Audio Decoding First
                </div>
                <p className="leading-relaxed">
                  In Listening exercises, the written transcript stays hidden until you answer—training your ear to decode spoken streams at 1.0x or 0.8x speed.
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-stone-800">
                  4. Multi-Modal Retrieval (Nation &amp; Bjork)
                </div>
                <p className="leading-relaxed">
                  Cycles through Context Cloze, Pragmatic Mini-Dialogues, Blind Audio, Pattern Checks, and Interactive Sentence Assembly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* STEP 1: VOCABULARY IN FRESH CONTEXTS (CLEAN 2-COLUMN COMPARISON ROWS) */}
      {/* ===================================================================== */}
      {vocabReuses.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#181D1B]">
                Vocabulary in Fresh Contexts
              </h3>
              <p className="text-xs text-[#5C6661]">
                See how key expressions from the story transfer into everyday life
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {vocabReuses.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#DCE2DF] p-4 shadow-sm"
              >
                {/* Top Row: Expression Badge + Audio Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FDF8EE] border border-[#E8D7B4] text-[#7C581E] font-semibold text-xs">
                    {item.word}
                  </span>
                  {onPlaySentenceAudio && (
                    <button
                      type="button"
                      onClick={() => onPlaySentenceAudio(item.newPhrase, 1.0)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F1F6FA] hover:bg-[#E3EEF5] border border-[#C9DCE8] text-[#1E3F54] text-xs font-semibold transition-colors cursor-pointer"
                      title="Listen to the new everyday sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#234E68]" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>

                {/* 2-Column Comparison: Story vs. New Everyday Context */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                  <div className="sm:col-span-5 rounded-lg bg-[#F8FAF9] border border-[#E6ECE9] p-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737F79] mb-1">
                      In the Story
                    </span>
                    <p className="text-xs sm:text-sm text-[#4A5550] italic font-serif leading-relaxed">
                      {item.storyContext}
                    </p>
                  </div>

                  <div className="sm:col-span-7 rounded-lg bg-[#FFFDF9] border border-[#F2E3C9] p-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-1">
                      New Everyday Context
                    </span>
                    <p className="text-sm sm:text-base font-serif font-semibold text-[#181D1B] leading-snug">
                      {item.newPhrase}
                    </p>
                    <p className="text-xs text-[#5C6661] mt-1 leading-relaxed">
                      {item.english}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: SENTENCE BLUEPRINT & PATTERN NOTICING (FULL-WIDTH READABILITY)*/}
      {/* ===================================================================== */}
      {construction && (
        <div className="mt-9">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#181D1B]">
                Sentence Blueprint &amp; Pattern Noticing
              </h3>
              <p className="text-xs text-[#5C6661]">
                Master one reusable grammatical building block from this chapter
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE2DF] p-5 sm:p-6 shadow-sm">
            {/* Full-Width Stacked Pattern Title + Explanation + Formula Bar (Never squeezed side-by-side!) */}
            <div className="space-y-3 pb-5 border-b border-[#E8ECEA]">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-700">
                <Lightbulb className="w-4 h-4 shrink-0 text-orange-600" />
                <span>{construction.patternName}</span>
              </div>

              <p className="text-sm sm:text-[15px] text-[#333D38] leading-relaxed">
                {construction.explanation}
              </p>

              {/* Dedicated Full-Width Formula Blueprint Bar */}
              <div className="pt-1">
                <div className="inline-flex flex-wrap items-center gap-2 bg-[#F8FAF9] px-3.5 py-2.5 rounded-xl border border-[#DCE2DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6661] mr-1">
                    Formula:
                  </span>
                  {construction.formula.map((part, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D0D9D4] text-xs font-mono font-semibold text-[#181D1B] shadow-sm">
                        {part}
                      </span>
                      {idx < construction.formula.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#737F79] shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Variations Rendered as Clean Full-Width Rows for Effortless Reading */}
            <div className="mt-4 divide-y divide-[#E8ECEA]">
              {construction.examples.map((ex, idx) => {
                const parts = ex.highlight ? ex.target.split(ex.highlight) : [ex.target];
                return (
                  <div
                    key={idx}
                    className="py-3.5 first:pt-1 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F2F4F3] text-[#5C6661]">
                          Example {idx + 1}
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-serif font-medium text-[#181D1B] leading-snug pt-0.5">
                        {parts.length > 1 ? (
                          <>
                            {parts[0]}
                            <span className="underline decoration-orange-500 decoration-2 underline-offset-4 font-bold text-orange-950 bg-orange-100/75 px-1 rounded">
                              {ex.highlight}
                            </span>
                            {parts.slice(1).join(ex.highlight)}
                          </>
                        ) : (
                          ex.target
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-[#5C6661]">
                        {ex.english}
                      </p>
                    </div>

                    {onPlaySentenceAudio && (
                      <button
                        type="button"
                        onClick={() => onPlaySentenceAudio(ex.target, 1.0)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] hover:bg-[#E5EFF6] border border-[#DCE2DF] text-xs font-semibold text-[#234E68] transition-colors shrink-0 cursor-pointer mt-1"
                        title="Listen to example"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Listen</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 3: ACTIVE-RECALL TRANSFER CHECKPOINT (FOCUSED DECK + LIST TOGGLE)*/}
      {/* ===================================================================== */}
      <div className="mt-9">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#181D1B]">
                Active-Recall Transfer Checkpoint ({totalQuestions} Exercises)
              </h3>
              <p className="text-xs text-[#5C6661]">
                5 cognitive modalities • Zero repeated story lines • Zero character-name shortcuts
              </p>
            </div>
          </div>

          {/* Controls: 15 vs 30 Toggle + Focused vs List View + Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 15 vs 30 Questions */}
            <div className="inline-flex items-center bg-[#EEF2F0] p-1 rounded-xl border border-[#DCE2DF]">
              <button
                type="button"
                onClick={() => setExerciseCountMode(15)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  exerciseCountMode === 15
                    ? 'bg-white text-[#181D1B] shadow-sm'
                    : 'text-[#5C6661] hover:text-[#181D1B]'
                }`}
              >
                15 Standard
              </button>
              <button
                type="button"
                onClick={() => setExerciseCountMode(30)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  exerciseCountMode === 30
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-[#5C6661] hover:text-[#181D1B]'
                }`}
              >
                <Shuffle className="w-3 h-3" />
                <span>30 Deep</span>
              </button>
            </div>

            {/* Step-by-Step Card vs All List Toggle */}
            <div className="inline-flex items-center bg-[#EEF2F0] p-1 rounded-xl border border-[#DCE2DF]">
              <button
                type="button"
                onClick={() => setViewMode('focused')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'focused'
                    ? 'bg-white text-[#181D1B] shadow-sm'
                    : 'text-[#5C6661] hover:text-[#181D1B]'
                }`}
              >
                One-by-One
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#181D1B] shadow-sm'
                    : 'text-[#5C6661] hover:text-[#181D1B]'
                }`}
              >
                All ({ activeExercises.length })
              </button>
            </div>

            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#DCE2DF] text-xs font-semibold text-[#5C6661] hover:text-[#181D1B] transition-colors cursor-pointer"
                title="Reset all answers"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Modality Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {[
            { id: 'all', label: `All Modalities (${totalQuestions})` },
            { id: 'cloze', label: 'Context Cloze' },
            { id: 'dialogue', label: 'Mini-Dialogue' },
            { id: 'audio_comprehension', label: 'Blind Audio' },
            { id: 'grammar_contrast', label: 'Pattern Check' },
            { id: 'sentence_order', label: 'Sentence Assembly' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilterType(tab.id);
                setCurrentStepIdx(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                filterType === tab.id
                  ? 'bg-[#234E68] text-white border-[#234E68]'
                  : 'bg-white text-[#5C6661] border-[#DCE2DF] hover:border-[#234E68]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Numbered Progress Bar (in Focused One-by-One Mode) */}
        {viewMode === 'focused' && activeExercises.length > 0 && (
          <div className="mb-4 bg-white rounded-xl border border-[#DCE2DF] p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#5C6661] mb-2">
              <span className="font-semibold text-[#181D1B]">
                Exercise {currentStepIdx + 1} of {activeExercises.length}
              </span>
              <span>
                Click any number to jump • Green = Correct, Red = Needs retry
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeExercises.map((item, idx) => {
                const ans = selectedAnswers[item.id];
                const isDone = ans !== undefined;
                const isRight = ans === item.correctAnswer;
                const isCurrent = idx === currentStepIdx;

                let pillStyle =
                  'bg-[#F7F9F8] text-[#5C6661] border-[#DCE2DF] hover:border-stone-400';
                if (isDone) {
                  pillStyle = isRight
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-rose-600 text-white border-rose-600 font-bold';
                }
                if (isCurrent) {
                  pillStyle += ' ring-2 ring-orange-500 ring-offset-1';
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`w-7 h-7 rounded-lg border text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${pillStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions Render Area */}
        <div className="space-y-4">
          {exercisesToRender.map((q) => {
            const globalIdx = activeExercises.findIndex((item) => item.id === q.id);
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctAnswer;
            const styleInfo = getTypeStyle(q.type);
            const BadgeIcon = styleInfo.icon;
            const placedList = assembledTiles[q.id] || [];
            const isTranscriptShown = isAnswered || !!revealedTranscripts[q.id];

            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  !isAnswered
                    ? 'bg-white border-[#DCE2DF] shadow-sm'
                    : isCorrect
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                    : 'bg-rose-50/40 border-rose-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-3.5">
                  {/* Question Header + Modality Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5C6661]">
                          Exercise {globalIdx + 1} of {activeExercises.length}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleInfo.bg}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{q.badgeLabel}</span>
                        </span>
                      </div>

                      {/* Prompt */}
                      <div className="text-sm sm:text-[15px] text-[#333D38] font-medium leading-relaxed">
                        {q.promptEnglish}
                      </div>

                      {/* 1. CLOZE SENTENCE DISPLAY */}
                      {q.type === 'cloze' && q.sentenceParts && (
                        <p className="text-lg sm:text-xl font-serif font-semibold text-[#181D1B] leading-relaxed pt-1">
                          {q.sentenceParts[0]}
                          <span
                            className={`inline-block min-w-[96px] text-center mx-1.5 px-3 py-0.5 rounded-lg border-b-2 font-bold transition-colors ${
                              !isAnswered
                                ? 'bg-amber-50 border-orange-400 text-orange-700'
                                : isCorrect
                                ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                                : 'bg-rose-100 border-rose-600 text-rose-900'
                            }`}
                          >
                            {isAnswered ? q.correctAnswer : '_______'}
                          </span>
                          {q.sentenceParts[1]}
                        </p>
                      )}

                      {/* 2. PRAGMATIC MINI-DIALOGUE DISPLAY */}
                      {q.type === 'dialogue' && (
                        <div className="mt-2 rounded-xl bg-[#F8FAF9] border border-[#DCE2DF] p-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#234E68]">
                              Conversational Partner
                            </span>
                            {onPlaySentenceAudio && (
                              <button
                                type="button"
                                onClick={() => onPlaySentenceAudio(q.speakerA, 1.0)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#234E68] hover:text-orange-600 cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </button>
                            )}
                          </div>
                          <p className="text-base sm:text-lg font-serif font-semibold text-[#181D1B] leading-snug">
                            {q.speakerA}
                          </p>
                          <p className="text-xs sm:text-sm text-[#5C6661] italic">
                            {q.speakerAEnglish}
                          </p>
                        </div>
                      )}

                      {/* 3. BLIND AUDIO DECODING DISPLAY */}
                      {q.type === 'audio_comprehension' && (
                        <div className="pt-2 space-y-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {onPlaySentenceAudio && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onPlaySentenceAudio(q.audioSentence, 1.0)}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                                >
                                  <Volume2 className="w-4 h-4 shrink-0" />
                                  <span>Play Spoken Sentence (1.0x)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onPlaySentenceAudio(q.audioSentence, 0.8)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  <Headphones className="w-3.5 h-3.5 shrink-0" />
                                  <span>Listen Slow (0.8x)</span>
                                </button>
                              </>
                            )}

                            {!isAnswered && (
                              <button
                                type="button"
                                onClick={() => toggleTranscriptHint(q.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F2F4F3] hover:bg-[#E4E9E6] text-[#4A5550] text-xs font-semibold transition-colors cursor-pointer"
                              >
                                {isTranscriptShown ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                                    <span>Hide Written Hint</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5 shrink-0" />
                                    <span>Show Transcript Hint</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {isTranscriptShown ? (
                            <div className="rounded-xl bg-purple-50/70 border border-purple-200 px-4 py-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                                {isAnswered ? 'Spoken Target Sentence' : 'Transcript Hint'}
                              </span>
                              <p className="text-base sm:text-lg font-serif font-semibold text-[#181D1B]">
                                « {q.audioSentence} »
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-[#F8FAF9] border border-dashed border-[#C5D1CB] px-4 py-2.5 text-xs text-[#5C6661] flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-purple-600 shrink-0" />
                              <span>
                                Written sentence hidden so your ear decodes the spoken stream first.
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. INTERACTIVE CLICK-TO-BUILD SENTENCE ASSEMBLY */}
                      {q.type === 'sentence_order' && (
                        <div className="pt-2 space-y-3">
                          <div className="min-h-[56px] rounded-xl bg-[#F8FAF9] border-2 border-dashed border-[#C5D1CB] p-3 flex flex-wrap items-center gap-2">
                            {placedList.length === 0 && !isAnswered ? (
                              <span className="text-xs text-[#737F79] select-none">
                                Click the phrase tiles below in order to assemble the sentence...
                              </span>
                            ) : (
                              placedList.map((item, pIdx) => (
                                <button
                                  key={`${item.sourceIdx}-${pIdx}`}
                                  type="button"
                                  disabled={isAnswered}
                                  onClick={() => handleRemovePlacedTile(q, pIdx)}
                                  className={`px-3 py-1.5 rounded-lg text-sm sm:text-base font-serif font-semibold border transition-all ${
                                    !isAnswered
                                      ? 'bg-white border-rose-300 text-[#181D1B] shadow-sm hover:bg-rose-50 cursor-pointer'
                                      : isCorrect
                                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                                      : 'bg-rose-100 border-rose-500 text-rose-950'
                                  }`}
                                  title={!isAnswered ? 'Click to remove tile' : ''}
                                >
                                  {item.text}
                                </button>
                              ))
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(q.shuffledChunks || []).map((chunk, sIdx) => {
                              const isUsed = placedList.some((item) => item.sourceIdx === sIdx);
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  disabled={isUsed || isAnswered}
                                  onClick={() => handleTileClick(q, chunk, sIdx)}
                                  className={`px-3.5 py-2 rounded-xl text-sm sm:text-base font-serif font-semibold border transition-all ${
                                    isUsed
                                      ? 'bg-stone-100 border-stone-200 text-stone-300 opacity-50 cursor-not-allowed'
                                      : 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200 text-[#181D1B] shadow-sm cursor-pointer'
                                  }`}
                                >
                                  {chunk}
                                </button>
                              );
                            })}

                            {!isAnswered && placedList.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleResetQuestion(q.id)}
                                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5C6661] hover:text-[#181D1B] cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Clear Tray</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Play Full Answer Audio Button (once answered) */}
                    {isAnswered && onPlaySentenceAudio && q.fullSentence && (
                      <button
                        type="button"
                        onClick={() => onPlaySentenceAudio(q.fullSentence, 1.0)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCE2DF] text-xs font-semibold text-[#234E68] hover:border-orange-300 hover:text-orange-600 transition-colors shrink-0 cursor-pointer shadow-sm"
                        title="Listen to the complete sentence"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Play Audio</span>
                      </button>
                    )}
                  </div>

                  {/* Multiple Choice Options Grid */}
                  {q.type !== 'sentence_order' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = chosen === opt;
                        const isOptionCorrect = opt === q.correctAnswer;

                        let btnClass =
                          'bg-[#F8FAF9] hover:bg-orange-50/70 border-[#DCE2DF] hover:border-orange-300 text-[#181D1B]';
                        if (isAnswered) {
                          if (isOptionCorrect) {
                            btnClass =
                              'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm';
                          } else if (isSelected && !isOptionCorrect) {
                            btnClass = 'bg-rose-600 border-rose-600 text-white font-semibold';
                          } else {
                            btnClass =
                              'bg-stone-100/70 border-stone-200/60 text-stone-400 opacity-70';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2 text-left ${
                              !isAnswered ? 'cursor-pointer' : 'cursor-default'
                            } ${btnClass}`}
                          >
                            <span className="leading-snug">{opt}</span>
                            {isAnswered && isOptionCorrect && (
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                            )}
                            {isAnswered && isSelected && !isOptionCorrect && (
                              <XCircle className="w-4 h-4 shrink-0 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Pedagogical Feedback Explanation after answering */}
                  {isAnswered && (
                    <div
                      className={`mt-1 pt-3 border-t text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCorrect
                          ? 'border-emerald-200 text-emerald-950'
                          : 'border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="leading-relaxed">
                        <span className="font-bold mr-1.5">
                          {isCorrect ? 'Spot on!' : `Correct answer: « ${q.correctAnswer} » —`}
                        </span>
                        <span>{q.explanation}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {!isCorrect && (
                          <button
                            type="button"
                            onClick={() => handleResetQuestion(q.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-800 font-semibold text-xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Focused Deck Prev / Next Navigation Footer */}
                  {viewMode === 'focused' && activeExercises.length > 1 && (
                    <div className="mt-2 pt-3 border-t border-[#E8ECEA] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={currentStepIdx <= 0}
                        onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE2DF] bg-[#F8FAF9] text-xs font-semibold text-[#4A5550] hover:text-[#181D1B] disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <span className="text-xs font-medium text-[#737F79]">
                        {answeredCount} of {totalQuestions} answered
                      </span>

                      <button
                        type="button"
                        disabled={currentStepIdx >= activeExercises.length - 1}
                        onClick={() =>
                          setCurrentStepIdx((i) => Math.min(activeExercises.length - 1, i + 1))
                        }
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 ${
                          isAnswered
                            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm'
                            : 'border border-[#DCE2DF] bg-[#F8FAF9] text-[#181D1B] hover:bg-[#EEF2F0]'
                        }`}
                      >
                        <span>Next Exercise</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CHAPTER COMPLETION / NEXT CHAPTER CTA                                 */}
      {/* ===================================================================== */}
      <div className="mt-8 rounded-2xl bg-[#181D1B] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-serif font-bold text-white">
              {allCompleted
                ? `Great job completing Chapter ${chapterNum}'s Transfer Lab!`
                : `Ready for the next part of the story?`}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
              {allCompleted
                ? `You scored ${correctCount} out of ${totalQuestions} across all 5 active-recall modalities.`
                : exerciseCountMode === 15
                ? `Step through the 15 exercises above or toggle "30 Deep" for 15 extra transfer drills.`
                : `Complete all 30 multi-style transfer exercises above to lock in this chapter's patterns.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
          {hasNextChapter ? (
            <button
              type="button"
              onClick={onNextChapter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue to Chapter {chapterNum + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            onGenerateChapter && (
              <button
                type="button"
                onClick={onGenerateChapter}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Chapter {chapterNum + 1} with AI</span>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
