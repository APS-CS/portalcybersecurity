# Portal Cybersecurity — webbplats

Källkoden till Portal Cybersecuritys publika webbplats: en minimalistisk, statisk
sajt med landningssida, artiklar och integritetspolicy. Byggd i ren HTML, CSS och
JavaScript — utan ramverk, byggsteg, databaser eller externa beroenden.

---

## Tanken bakom sajten

Portal Cybersecurity hjälper små verksamheter att höja sin cybersäkerhet. Då ska
den egna webbplatsen hålla samma standard som råden vi ger. Sajten är därför
byggd utifrån tre principer:

**1. Minimal attackyta.** Ingen backend, inga formulär, inga tredjepartsskript
och noll beroenden. Det som inte finns kan varken angripas, gå sönder eller
läcka. Hela sajten är statiska filer som kan serveras var som helst.

**2. Integritet på riktigt.** Inga kakor, ingen spårning, ingen besöksstatistik.
Typsnitten är self-hostade i `fonts/` — inte ens ett typsnittsanrop lämnar den
egna domänen när någon besöker sidorna. Detaljerna finns i
[integritetspolicyn](integritetspolicy.html).

**3. Enkelt att underhålla.** Gemensamma delar (sidhuvud, sidfot, CTA-band)
definieras på ett enda ställe i `js/partials.js`. En ny artikel är en kopierad
mall plus en rad data. Färger och typografi styrs av variabler överst i
`css/style.css`.

Designen är medvetet avskalad — mycket luft, få färger, tydlig typografi — för
att signalera samma sak som tjänsterna: ordning, lugn och inga onödiga rörliga
delar.

## Säkerhetsåtgärder i koden

Sajten är härdad enligt principen defense-in-depth, med OWASP Top 10 och
MITRE ATT&CK som utgångspunkt:

| Skydd | Vad det gör |
|---|---|
| Strikt Content-Security-Policy på varje sida | Allt innehåll får bara laddas från egna domänen; `connect-src 'none'` gör att inte ens injicerad kod kan skicka data någonstans |
| Trusted Types (`portal-html`-policy) | Webbläsaren blockerar all HTML-skrivning till DOM som inte går via sajtens egen policy — eliminerar DOM-XSS-klassen i stödda webbläsare |
| Escaping + URL-validering (`esc`/`safeUrl` i `js/main.js`) | All artikeldata escapas innan rendering; endast `https:`/`mailto:` och relativa länkar släpps igenom |
| Self-hostade typsnitt | Ingen leveranskedje-exponering mot tredje part och inget IP-läckage till typsnittsleverantörer |
| Referrer-Policy + clickjacking-spärr | Begränsar informationsläckage och inramning av sajten |
| `_headers` | Färdigt HTTP-headerpaket (HSTS, X-Frame-Options m.m.) som aktiveras automatiskt vid drift på en host med header-stöd |
| `.well-known/security.txt` + `SECURITY.md` | Tydlig kanal för att rapportera sårbarheter (RFC 9116) |

Hittar du ett säkerhetsproblem? Se [SECURITY.md](SECURITY.md).

## Struktur

```
├── index.html                ← Startsidan
├── artiklar.html             ← Artikelöversikt med kategorifilter
├── integritetspolicy.html    ← Så här behandlar vi dina uppgifter
├── css/
│   └── style.css             ← All design. Varumärkesfärger + typsnitt överst.
├── js/
│   ├── partials.js           ← Sidhuvud, sidfot och CTA — definieras EN gång här
│   ├── articles.js           ← Artikeldata. Nya artiklar registreras här.
│   └── main.js               ← Meny, artikelrendering, filter, animationer
├── artiklar/
│   ├── _mall.html            ← Mall: kopiera denna för varje ny artikel
│   └── *.html                ← Publicerade artiklar
├── fonts/                    ← Self-hostade typsnitt (woff2)
├── bilder/                   ← Logotyper (SVG)
├── .well-known/security.txt  ← Säkerhetskontakt (RFC 9116)
├── _headers                  ← HTTP-säkerhetsheaders (för host med header-stöd)
├── .nojekyll                 ← Publicera filerna råa, utan Jekyll-behandling
└── SECURITY.md               ← Hur sårbarheter rapporteras
```

## Köra lokalt

Sajten måste köras via en webbserver (CSP, typsnitt och partials fungerar inte
om `index.html` öppnas direkt från filsystemet):

```bash
python3 -m http.server 8000
# öppna http://localhost:8000
```

## Lägga till en artikel

1. **Kopiera mallen.** Duplicera `artiklar/_mall.html`, döp om den
   (t.ex. `artiklar/min-nya-artikel.html`) och fyll i innehållet. CTA-bandets
   text sätts per artikel via `data-titel` och `data-text` på
   `<div data-include="cta">`.

2. **Registrera artikeln.** Lägg till ett objekt högst upp i `js/articles.js`
   (nyast först):

   ```js
   {
     titel:    "Min nya artikel",
     utdrag:   "En mening om vad artikeln handlar om.",
     kategori: "Cyberhygien",          // blir automatiskt en filterknapp
     datum:    "2026-07-12",           // ÅÅÅÅ-MM-DD
     lasetid:  "4 min",
     url:      "artiklar/min-nya-artikel.html"
   },
   ```

3. **Klart.** Artikeln visas automatiskt på startsidan och i artikelöversikten.

## Ändra meny, sidfot eller CTA

Allt gemensamt ligger i `js/partials.js`. Menyn definieras i `NAV`-listan och
används av både sidhuvud och sidfot — en ändring där slår igenom på alla sidor.
Skriv aldrig HTML till DOM utanför `tt()`-policyn och lägg aldrig
`style="..."`-attribut i markup (CSP:n blockerar dem) — använd klasser i
`css/style.css`.

## Varumärke

Färgerna ligger som variabler överst i `css/style.css` (marinblå `--navy` som
primär, babyblå `--babyblue` som accent). Logotypvarianterna finns i `bilder/`
(`logo.svg` horisontell, `logo-stacked.svg` stående, `logo-icon.svg` enbart
symbolen). Ikoner, delningsbild och webbmanifest ligger i rotmappen.
