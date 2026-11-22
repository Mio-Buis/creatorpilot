/* KI-SCHNITTSTELLE (anbieterunabhängig)
   Vertrag: provider.generate(task, input) → Promise<{ items: string[], hashtags?: string[] }>
     task  = 'ideas' | 'titles' | 'descriptions' | 'translate'
     input = { topic, platform } bzw. { text, from, to } bei 'translate'
   Eigene KI anschließen: Provider mit CP.AI.register(...) registrieren und
   CP.config.provider umstellen. API-Schlüssel gehören NIE in diesen Code,
   sondern ausschließlich in dein Backend. */
window.CP = window.CP || {};
CP.config = { provider: 'demo', backendUrl: '/api/ai' };

CP.AI = {
  providers: {},
  register(name, provider) { this.providers[name] = provider; },
  current() { return this.providers[CP.config.provider] || this.providers.demo; },
  run(task, input) { return this.current().generate(task, input); }
};

/* Provider 1: Lokaler Demonstrationsmodus – nur vorbereitete Vorlagen, KEINE KI. */
(() => {
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const FORMAT = { YouTube: 'Langvideo', TikTok: 'Kurzvideo', Instagram: 'Reel' };
  const TAGS = { YouTube: ['#youtube', '#youtuber'], TikTok: ['#fyp', '#tiktok'], Instagram: ['#reels', '#instagram'] };
  const T = {
    ideas: [
      n => `5 Fehler, die fast jeder bei „${n}“ macht`,
      n => `${n}: Das hätte ich vor einem Jahr gern gewusst`,
      n => `24 Stunden nur ${n} – der Selbsttest`,
      n => `Anfänger vs. Profi: ${n} im Vergleich`,
      n => `Die 7 besten Tools für ${n}`,
      n => `Mythen über ${n} – was wirklich stimmt`,
      n => `Mein kompletter ${n}-Ablauf Schritt für Schritt`,
      n => `Ich habe 30 Tage ${n} ausprobiert – das ist passiert`
    ],
    titles: [
      n => `${n}: Die ehrliche Wahrheit`,
      n => `So klappt ${n} wirklich (in 5 Schritten)`,
      n => `Warum dir bei ${n} niemand die Wahrheit sagt`,
      n => `${n} für Anfänger – einfach erklärt`,
      n => `Das ändert alles bei ${n}`,
      n => `Ich zeige dir ${n} – ohne Vorkenntnisse`,
      n => `Stop! Mach das nicht bei ${n}`
    ],
    descriptions: [
      n => `In diesem Video dreht sich alles um ${n}. Du erfährst Schritt für Schritt, worauf es wirklich ankommt.\n\nGefällt dir das Video? Dann abonniere den Kanal und lass einen Kommentar da.`,
      n => `${n} – kompakt erklärt. Am Ende weißt du, wie du direkt starten kannst.\n\nWelche Frage zu ${n} soll ich als Nächstes beantworten? Schreib es in die Kommentare.`,
      n => `Alles Wichtige zu ${n} in einem Video: Grundlagen, typische Fehler und praktische Tipps.\n\nMehr Inhalte wie diese findest du auf meinem Kanal.`
    ]
  };
  /* Mini-Wörterbuch: Deutsch / Englisch / Rumänisch (nur Demo, keine echte Übersetzung) */
  const LANG = { de: 0, en: 1, ro: 2 };
  const DICT = [
    ['hallo', 'hello', 'salut'], ['danke', 'thanks', 'mulțumesc'], ['video', 'video', 'video'],
    ['ja', 'yes', 'da'], ['nein', 'no', 'nu'], ['willkommen', 'welcome', 'bun venit'],
    ['neu', 'new', 'nou'], ['heute', 'today', 'azi'], ['und', 'and', 'și'], ['gut', 'good', 'bun'],
    ['tipps', 'tips', 'sfaturi'], ['wie', 'how', 'cum'], ['du', 'you', 'tu'],
    ['abonnieren', 'subscribe', 'abonează-te'], ['kanal', 'channel', 'canal']
  ];

  CP.AI.register('demo', {
    label: 'Lokaler Demonstrationsmodus',
    isDemo: true,
    async generate(task, input) {
      await new Promise(r => setTimeout(r, 350));
      if (task === 'translate') {
        const f = LANG[input.from], t = LANG[input.to];
        const out = input.text.replace(/[\p{L}-]+/gu, w => {
          const row = DICT.find(r => r[f] === w.toLowerCase());
          return row ? row[t] : w;
        });
        return { items: [out] };
      }
      const topic = (input.topic || '').trim(), pf = input.platform;
      const items = shuffle(T[task]).slice(0, task === 'descriptions' ? 3 : 6).map(fn => fn(topic));
      if (task === 'ideas') return { items: items.map(i => `[${FORMAT[pf] || 'Video'} · ${pf}] ${i}`) };
      if (task === 'descriptions') {
        const words = topic.toLowerCase().split(/\s+/).map(w => w.replace(/[^\p{L}\p{N}]/gu, '')).filter(w => w.length > 2);
        return { items, hashtags: [...new Set([...words.map(w => '#' + w), ...(TAGS[pf] || []), '#creator'])] };
      }
      return { items };
    }
  });

  /* Provider 2: Vorlage für dein eigenes Backend (z. B. /api/ai). */
  CP.AI.register('backend', {
    label: 'Eigenes KI-Backend',
    isDemo: false,
    async generate(task, input) {
      const r = await fetch(CP.config.backendUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, input })
      });
      if (!r.ok) throw new Error('Backend antwortet mit Status ' + r.status);
      return r.json();
    }
  });
})();
