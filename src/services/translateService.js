/**
 * Built-in Google Translate & Dictionary service for translating and looking up words/sentences
 * across French (fr), Italian (it), Korean (ko), Japanese (ja), Spanish (es), Thai (th), and English (en).
 */
export async function translateToEnglish(text, sourceLang = 'auto', targetLang = 'en') {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { translatedText: '', detectedSourceLang: sourceLang };
  }

  const effectiveTarget = targetLang || (sourceLang === 'en' ? 'pt' : 'en');

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(effectiveTarget)}&dt=t&q=${encodeURIComponent(trimmed)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const translatedText = segments
    .map((segment) => (Array.isArray(segment) ? segment[0] : ''))
    .join('');

  const detectedSourceLang = data?.[2] || sourceLang;

  return {
    translatedText: translatedText || trimmed,
    detectedSourceLang,
  };
}

/**
 * Rich Dictionary & Phrase Lookup using Google Translate's dictionary (`dt=bd`) and
 * phonetic transliteration (`dt=rm`) endpoints. Supports both TargetLang -> English
 * and English -> TargetLang lookups!
 */
export async function lookupDictionaryWordOrPhrase({
  query,
  sourceLang = 'fr',
  targetLang = 'en',
}) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return null;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(
    trimmed
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Dictionary lookup failed (HTTP ${response.status})`);
  }

  const data = await response.json();

  // 1. Primary translation (data[0])
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const primaryTranslation = segments
    .filter((seg) => Array.isArray(seg) && typeof seg[0] === 'string')
    .map((seg) => seg[0])
    .join('');

  // 2. Phonetic reading / transliteration (often in the last element of data[0])
  let phonetic = null;
  for (const seg of segments) {
    if (Array.isArray(seg) && (seg[3] || seg[2])) {
      phonetic = seg[3] || seg[2];
    }
  }

  // 3. Dictionary parts of speech & alternative meanings (data[1])
  const dictionaryEntries = [];
  if (Array.isArray(data?.[1])) {
    data[1].forEach((posBlock) => {
      const partOfSpeech = posBlock?.[0] || 'term';
      const terms = Array.isArray(posBlock?.[1]) ? posBlock[1].slice(0, 5) : [];
      const detailedRows = Array.isArray(posBlock?.[2])
        ? posBlock[2].slice(0, 4).map((row) => ({
            word: row?.[0] || '',
            reverseTranslations: Array.isArray(row?.[1]) ? row[1].slice(0, 3) : [],
          }))
        : [];
      dictionaryEntries.push({
        partOfSpeech,
        terms,
        detailedRows,
      });
    });
  }

  return {
    query: trimmed,
    sourceLang,
    targetLang,
    primaryTranslation: primaryTranslation || trimmed,
    phonetic,
    dictionaryEntries,
  };
}

/**
 * Curated everyday usage, false-friend warnings, preposition nuances, and real-life examples
 * across all 5 courses (en, fr, it, ja, es).
 */
const WORD_USAGE_GUIDE_DB = {
  en: {
    cafe: {
      nuanceNote:
        'Atenção (Falso Cognato): Em inglês britânico, "café" (ou "cafe") significa CAFETERIA ou lanchonete — e NÃO a bebida! Para pedir a bebida café, diga sempre "coffee".',
      variations: [
        'café / coffee shop = cafeteria (o local)',
        'coffee = café (a bebida)',
        'a cup of coffee = uma xícara de café',
      ],
      examples: [
        {
          target: 'Let’s meet at the café on the corner for a cup of coffee.',
          translation: 'Vamos nos encontrar na cafeteria da esquina para tomar uma xícara de café.',
        },
        {
          target: 'This small café serves warm scones and fresh tea.',
          translation: 'Esta pequena cafeteria serve scones quentinhos e chá fresco.',
        },
        {
          target: 'Would you like a black coffee or tea with milk?',
          translation: 'Você gostaria de um café puro ou chá com leite?',
        },
      ],
    },
    coffee: {
      nuanceNote:
        'Uso no Dia a Dia: "Coffee" é sempre a bebida (café). O lugar onde você senta para tomar café é um "café" ou "coffee shop".',
      variations: [
        'black coffee = café puro / sem leite',
        'white coffee (UK) = café com leite',
        'a cup of coffee = uma xícara de café',
      ],
      examples: [
        {
          target: 'Can I have a large coffee with oat milk, please?',
          translation: 'Pode me vê um café grande com leite de aveia, por favor?',
        },
        {
          target: 'She drinks a hot cup of coffee every morning.',
          translation: 'Ela bebe uma xícara de café quente todas as manhãs.',
        },
      ],
    },
    on: {
      nuanceNote:
        'Dica Essencial ("ON" vs "IN"): "On" significa "em cima de" uma superfície (on the table), em dias da semana (on Monday), e também "DENTRO DE" transportes grandes onde você pode caminhar ou subir (on a plane, on a bus, on a train, on a ship)!',
      variations: [
        'on the table / on the chair = em cima da mesa / na cadeira',
        'on the plane / on the bus / on the train / on a ship = no avião / no ônibus / no trem / no navio',
        'on Monday / on Friday morning = na segunda-feira / na sexta de manhã',
        'on the left / on the right = à esquerda / à direita',
      ],
      examples: [
        {
          target: 'We are already on the plane to London.',
          translation: 'Nós já estamos no (dentro do) avião para Londres.',
        },
        {
          target: 'She left her blue notebook on the bus.',
          translation: 'Ela deixou o caderno azul dela no ônibus.',
        },
        {
          target: 'Your cup of tea is on the wooden table.',
          translation: 'Sua xícara de chá está em cima da mesa de madeira.',
        },
      ],
    },
    in: {
      nuanceNote:
        'Dica Essencial ("IN" vs "ON" vs "AT"): Use "in" para lugares fechados, cidades, países, meses do ano, e também para carros e táxis (in a car, in a taxi — diferente de "on a bus / on a plane").',
      variations: [
        'in London / in Brazil = em Londres / no Brasil',
        'in the morning / in the afternoon = de manhã / à tarde',
        'in a car / in a taxi = dentro de um carro / no táxi',
        'in my bag / in the pocket = na minha bolsa / no bolso',
      ],
      examples: [
        {
          target: 'My daughter lives in London.',
          translation: 'Minha filha mora em Londres.',
        },
        {
          target: 'They are waiting in a taxi outside the station.',
          translation: 'Eles estão esperando dentro de um táxi fora da estação.',
        },
        {
          target: 'It is often cold in the morning.',
          translation: 'Costuma fazer frio de manhã.',
        },
      ],
    },
    at: {
      nuanceNote:
        'Dica Essencial: Use "at" para horários exatos (at 8 o’clock), pontos específicos (at the door, at the bus stop) e locais de atividade (at home, at work, at the station).',
      variations: [
        'at the door / at the window = na porta / na janela',
        'at seven o’clock / at night = às sete horas / à noite',
        'at home / at work = em casa / no trabalho',
      ],
      examples: [
        {
          target: 'Let’s meet at the train station at ten o’clock.',
          translation: 'Vamos nos encontrar na estação de trem às dez horas.',
        },
        {
          target: 'Helena looks at the menu near the door.',
          translation: 'Helena olha para o cardápio perto da porta.',
        },
      ],
    },
    for: {
      nuanceNote:
        'Uso no Dia a Dia: "For" indica finalidade/destinatário ("para você" = for you), duração de tempo ("por duas horas" = for two hours) ou troca/preço ("por cinco libras" = for five pounds).',
      variations: [
        'for you / for my daughter = para você / para minha filha',
        'look for = procurar por',
        'wait for = esperar por',
      ],
      examples: [
        {
          target: 'This small gift is for my daughter.',
          translation: 'Este pequeno presente é para a minha filha.',
        },
        {
          target: 'Are you looking for your blue notebook?',
          translation: 'Você está procurando pelo seu caderno azul?',
        },
      ],
    },
    to: {
      nuanceNote:
        'Dica ("TO" vs "FOR"): Use "to" para indicar movimento ou direção para algum lugar (go to London, walk to the café) ou antes de verbos no infinitivo (want to drink).',
      variations: [
        'go to / walk to = ir para / caminhar até',
        'give to someone = dar para alguém',
        'want to / need to = querer / precisar (+ verbo)',
      ],
      examples: [
        {
          target: 'We are going to Portobello Market this morning.',
          translation: 'Nós vamos para o Mercado Portobello esta manhã.',
        },
        {
          target: 'She wants to drink a cup of hot tea.',
          translation: 'Ela quer beber uma xícara de chá quente.',
        },
      ],
    },
    look: {
      nuanceNote:
        'Verbo Muito Versátil: O significado de "look" muda bastante conforme a preposição que vem depois dele (look at, look for, look after).',
      variations: [
        'look at = olhar para algo específico',
        'look for = procurar algo',
        'look like = parecer com',
        'Have a look! = Dê uma olhada!',
      ],
      examples: [
        {
          target: 'Look at that beautiful old building!',
          translation: 'Olhe para aquele lindo prédio antigo!',
        },
        {
          target: 'I am looking for my keys.',
          translation: 'Estou procurando minhas chaves.',
        },
      ],
    },
    tea: {
      nuanceNote:
        'Cultura Britânica (UK): No Reino Unido, "tea" significa tanto a bebida (chá) quanto uma refeição leve no fim da tarde ("afternoon tea").',
      variations: [
        'a cup of tea / a cuppa (informal UK) = uma xícara de chá',
        'tea with milk = chá com leite (muito comum no Reino Unido)',
        'herbal tea = chá de ervas',
      ],
      examples: [
        {
          target: 'Would you like a cup of hot tea with milk?',
          translation: 'Você aceita uma xícara de chá quente com leite?',
        },
        {
          target: 'Oliver brings two cups of tea to the table.',
          translation: 'Oliver traz duas xícaras de chá para a mesa.',
        },
      ],
    },
    morning: {
      nuanceNote:
        'Atenção à Preposição: Em inglês dizemos "IN the morning" (de manhã), mas quando falamos de um dia específico usamos "ON" (on Monday morning).',
      variations: [
        'Good morning! = Bom dia!',
        'in the morning = de manhã / pela manhã',
        'this morning = hoje de manhã / esta manhã',
        'every morning = todas as manhãs',
      ],
      examples: [
        {
          target: 'It is a cold and sunny morning in London.',
          translation: 'É uma manhã fria e ensolarada em Londres.',
        },
        {
          target: 'I always drink coffee in the morning.',
          translation: 'Eu sempre tomo café de manhã.',
        },
      ],
    },
    table: {
      nuanceNote:
        'Uso em Restaurantes e Cafés: Para pedir uma mesa em inglês, diga "A table for two, please" (Uma mesa para dois, por favor).',
      variations: [
        'a table for two = uma mesa para dois',
        'on the table = em cima da mesa',
        'at the table = sentado à mesa',
      ],
      examples: [
        {
          target: 'They sit at a small table near the window.',
          translation: 'Eles se sentam a uma mesa pequena perto da janela.',
        },
        {
          target: 'There is a blue notebook under the table.',
          translation: 'Há um caderno azul debaixo da mesa.',
        },
      ],
    },
    want: {
      nuanceNote:
        'Dica de Educação (Politeness): "I want" significa "eu quero", mas em cafés e lojas no Reino Unido é muito mais educado dizer "I would like..." (Eu gostaria de...) ou "Can I have...?".',
      variations: [
        'I want + substantivo = Eu quero...',
        'I want to + verbo = Eu quero (fazer algo)',
        'I would like (mais educado) = Eu gostaria de...',
      ],
      examples: [
        {
          target: 'She wants a cup of hot tea to warm up.',
          translation: 'Ela quer uma xícara de chá quente para se aquecer.',
        },
        {
          target: 'Do you want to walk to the market with me?',
          translation: 'Você quer caminhar até o mercado comigo?',
        },
      ],
    },
  },
  fr: {
    café: {
      nuanceNote:
        'Dual Meaning in French: Unlike English, "un café" in French means BOTH the drink (an espresso / coffee) AND the place (a café / coffee shop)!',
      variations: [
        'un café = an espresso / a coffee OR a café (place)',
        'un café au lait / un café crème = coffee with milk',
        'prendre un café = to have/grab a coffee',
      ],
      examples: [
        {
          target: 'On se retrouve au café du coin à dix heures ?',
          translation: 'Shall we meet at the corner café at ten o’clock?',
        },
        {
          target: 'Je voudrais un café bien chaud, s’il vous plaît.',
          translation: 'I would like a nice hot coffee, please.',
        },
      ],
    },
    sur: {
      nuanceNote:
        'Preposition Nuance ("SUR" vs "DANS"): "Sur" means "on / on top of" a surface (sur la table) or a street/square (sur la place). However, for transport like planes, trains, or buses, French uses "DANS" (dans l’avion, dans le bus) instead of "sur"!',
      variations: [
        'sur la table = on the table',
        'sur la place / sur le trottoir = on the square / on the pavement',
        'Note: dans le bus / dans l’avion = on the bus / on the plane',
      ],
      examples: [
        {
          target: 'Il y a une petite clé ancienne sur la table.',
          translation: 'There is a small antique key on the table.',
        },
        {
          target: 'Quelques passants marchent sur le trottoir.',
          translation: 'A few passersby walk on the pavement.',
        },
      ],
    },
    dans: {
      nuanceNote:
        'Everyday Usage: "Dans" means "in / inside" a physical space (dans la boîte, dans ma poche), inside vehicles (dans le train, dans l’avion), and also "in + time from now" (dans dix minutes = in ten minutes).',
      variations: [
        'dans la poche / dans le sac = in the pocket / in the bag',
        'dans le train / dans le bus = on the train / on the bus',
        'dans dix minutes = in ten minutes’ time',
      ],
      examples: [
        {
          target: 'Clara garde la clé dans sa poche.',
          translation: 'Clara keeps the key in her pocket.',
        },
        {
          target: 'Le train part dans cinq minutes.',
          translation: 'The train leaves in five minutes.',
        },
      ],
    },
    chercher: {
      nuanceNote:
        'Key Grammar Tip: "Chercher" already includes the meaning of "for" — so NEVER say "chercher pour"! Simply say "Je cherche mes clés" (I am looking for my keys).',
      variations: [
        'chercher quelque chose = to look for something',
        'aller chercher = to go and fetch / pick up',
        'venir chercher = to come and pick up',
      ],
      examples: [
        {
          target: 'Excusez-moi, vous cherchez cette clé ?',
          translation: 'Excuse me, are you looking for this key?',
        },
        {
          target: 'Je vais chercher du pain à la boulangerie.',
          translation: 'I am going to get some bread at the bakery.',
        },
      ],
    },
  },
  it: {
    caffè: {
      nuanceNote:
        'Italian Culture Tip: In Italy, ordering "un caffè" at the counter ("al banco") always gets you a single shot of espresso! The café venue itself is usually called "un bar".',
      variations: [
        'un caffè = an espresso',
        'un caffè macchiato = espresso with a dash of steamed milk',
        'prendere un caffè al bar = to grab a coffee at the café',
      ],
      examples: [
        {
          target: 'Prendiamo un caffè caldo insieme?',
          translation: 'Shall we have a hot coffee together?',
        },
        {
          target: 'Marco beve il suo caffè vicino alla finestra.',
          translation: 'Marco drinks his coffee near the window.',
        },
      ],
    },
    su: {
      nuanceNote:
        'Preposition Tip: "Su" means "on / upon", and usually combines with the definite article ("sul tavolo" = su + il tavolo, "sulla sedia" = su + la sedia, "sull’autobus" = on the bus).',
      variations: [
        'sul tavolo (su + il) = on the table',
        'sulla mappa (su + la) = on the map',
        'sull’autobus / sul treno = on the bus / on the train',
      ],
      examples: [
        {
          target: 'La scatola di legno è sul tavolo.',
          translation: 'The wooden box is on the table.',
        },
        {
          target: 'Siamo già sul treno per Firenze.',
          translation: 'We are already on the train to Florence.',
        },
      ],
    },
  },
  es: {
    café: {
      nuanceNote:
        'Double Meaning in Spanish: "El café" means both the drink (coffee) and a traditional café/coffeehouse ("una cafetería" is also very common for the place).',
      variations: [
        'un café solo = a black coffee / espresso',
        'un café con leche = coffee with milk',
        'una cafetería / un café = a coffee shop',
      ],
      examples: [
        {
          target: 'Tomamos un café con leche por la mañana.',
          translation: 'We have a coffee with milk in the morning.',
        },
        {
          target: 'Te espero en el café de la plaza.',
          translation: 'I’ll wait for you at the café on the square.',
        },
      ],
    },
    en: {
      nuanceNote:
        'Super Versatile Preposition: In Spanish, "en" covers English "in" (en Madrid), "on" a surface (en la mesa), AND "by / on" transport (en avión, en autobús, en tren)!',
      variations: [
        'en la mesa = on the table',
        'en la costa / en casa = on the coast / at home',
        'en avión / en autobús / en tren = by plane / on the bus / by train',
      ],
      examples: [
        {
          target: 'El viejo cuaderno está en la mesa.',
          translation: 'The old notebook is on the table.',
        },
        {
          target: 'Viajamos a Valencia en tren.',
          translation: 'We travel to Valencia by train.',
        },
      ],
    },
  },
  ja: {
    に: {
      nuanceNote:
        'Essential Particle ("NI" vs "DE"): Use に (ni) for a point in time (七時に = at 7 o’clock), a destination (京都に行く = go to Kyoto), where something exists (机の上にある = is on the desk), and boarding transport (バスに乗る = get on a bus).',
      variations: [
        '場所 + に 行く / 来る = go / come to a place',
        '電車 / バス + に 乗る = get on a train / bus',
        '時間 + に = at a specific time',
      ],
      examples: [
        {
          target: '健太は古い喫茶店に入ります。',
          translation: 'Kenta enters the old coffee shop.',
        },
        {
          target: '毎朝八時に電車に乗ります。',
          translation: 'Every morning at eight o’clock I get on the train.',
        },
      ],
    },
    で: {
      nuanceNote:
        'Essential Particle ("DE"): Use で (de) to mark the place where an action happens (カフェで飲む = drink at a café) OR the means of transport/tool used (電車で行く = go by train, 飛行機で行く = go by plane).',
      variations: [
        '場所 + で (action) = do something at/in a place',
        '電車 / バス / 飛行機 + で 行く = go by train / bus / plane',
      ],
      examples: [
        {
          target: '窓の近くの席でコーヒーを飲みます。',
          translation: 'I drink coffee at a seat near the window.',
        },
        {
          target: '京都まで新幹線で行きます。',
          translation: 'I go to Kyoto by bullet train.',
        },
      ],
    },
  },
};

/**
 * Builds a rich everyday usage & variations card for any clicked word in the Chapter Word Table.
 * Combines curated false-friend / preposition / collocation notes with chapter occurrences
 * and live dictionary alternatives.
 */
export function getCuratedWordUsageData(wordItem, chapter, profile) {
  const langId = profile?.id || 'fr';
  const isPtBr = langId === 'en';
  const rawSurface = (wordItem?.surface || '').trim();
  const rawBase = (wordItem?.baseForm || rawSurface).trim();

  const cleanSurfaceKey = rawSurface
    .toLowerCase()
    .replace(/[.,!?;:«»"“”'’()[\]{}]/g, '')
    .trim();
  const cleanBaseKey = rawBase
    .toLowerCase()
    .replace(/[.,!?;:«»"“”'’()[\]{}]/g, '')
    .trim();
  const asciiSurfaceKey = cleanSurfaceKey
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const asciiBaseKey = cleanBaseKey
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const langDb = WORD_USAGE_GUIDE_DB[langId] || {};
  const curated =
    langDb[cleanSurfaceKey] ||
    langDb[cleanBaseKey] ||
    langDb[asciiSurfaceKey] ||
    langDb[asciiBaseKey] ||
    null;

  // Find sentences in the current chapter where this word appears
  const chapterMatches = [];
  (chapter?.sentences || []).forEach((s) => {
    const hasToken = (s.tokens || []).some((t) => {
      const tSurf = (t.surface || '')
        .toLowerCase()
        .replace(/[.,!?;:«»"“”'’()[\]{}]/g, '')
        .trim();
      const tBase = (t.baseForm || tSurf)
        .toLowerCase()
        .replace(/[.,!?;:«»"“”'’()[\]{}]/g, '')
        .trim();
      return (
        tSurf === cleanSurfaceKey ||
        tBase === cleanBaseKey ||
        tSurf === cleanBaseKey ||
        tBase === cleanSurfaceKey
      );
    });
    if (hasToken && chapterMatches.length < 3) {
      chapterMatches.push({
        target: s.fullSentence,
        translation: s.englishTranslation,
        grammarNote: s.grammarNote || null,
      });
    }
  });

  // Generate helpful everyday templates if not in the static curated table
  const fallbackExamples = [];
  if (!curated) {
    if (isPtBr) {
      fallbackExamples.push(
        {
          target: `How do you use "${rawBase}" in everyday conversation?`,
          translation: `Como você usa "${rawBase}" (${wordItem?.contextualMeaning || ''}) na conversa do dia a dia?`,
        },
        {
          target: `Can you give me an example with "${rawSurface}"?`,
          translation: `Você pode me dar um exemplo com "${rawSurface}"?`,
        }
      );
    } else if (langId === 'fr') {
      fallbackExamples.push({
        target: `C’est un mot très utile au quotidien : « ${rawSurface} ».`,
        translation: `It is a very useful everyday word: "${rawSurface}" (${wordItem?.contextualMeaning || ''}).`,
      });
    } else if (langId === 'it') {
      fallbackExamples.push({
        target: `Usiamo spesso la parola «${rawSurface}» nella vita quotidiana.`,
        translation: `We often use the word "${rawSurface}" (${wordItem?.contextualMeaning || ''}) in everyday life.`,
      });
    } else if (langId === 'es') {
      fallbackExamples.push({
        target: `Usamos mucho la palabra «${rawSurface}» en el día a día.`,
        translation: `We use the word "${rawSurface}" (${wordItem?.contextualMeaning || ''}) a lot in everyday life.`,
      });
    } else if (langId === 'ja') {
      fallbackExamples.push({
        target: `日常会話で「${rawSurface}」をよく使います。`,
        translation: `We often use "${rawSurface}" (${wordItem?.contextualMeaning || ''}) in everyday conversation.`,
      });
    }
  }

  return {
    nuanceNote:
      curated?.nuanceNote ||
      (chapterMatches[0]?.grammarNote
        ? chapterMatches[0].grammarNote
        : isPtBr
        ? `No capítulo, "${rawSurface}" significa "${wordItem?.contextualMeaning}". Veja abaixo como essa palavra aparece na história e outras variações de uso no dia a dia.`
        : `In this chapter, "${rawSurface}" means "${wordItem?.contextualMeaning}". Explore how it is used in the story and across everyday contexts below.`),
    variations: curated?.variations || [],
    examples: curated?.examples || fallbackExamples,
    chapterMatches,
  };
}

export function buildGoogleTranslateWebUrl(text, sourceLang = 'auto', targetLang = 'en') {
  return `https://translate.google.com/?sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(
    text || ''
  )}&op=translate`;
}
