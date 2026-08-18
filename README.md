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
Typografin använder besökarens egna systemtypsnitt — inga typsnittsfiler laddas
ner över huvud taget, varken från oss eller någon tredje part. Detaljerna finns i
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
| Strikt Content-Security-Policy på varje sida | Allt innehåll får bara laddas från egen domän. `connect-src 'none'` stänger fetch, XHR, WebSocket och beacon, alltså de vanliga vägarna att skicka ut data i bakgrunden. Navigering går inte att stänga med CSP, det finns inget direktiv för det som webbläsare implementerar. |
| Trusted Types (`portal-html`-policy) | I webbläsare med stöd vägrar DOM ta emot HTML som inte gått genom sajtens namngivna policy. All HTML-skrivning samlas därmed på ett fåtal granskningsbara ställen i `js/`. Policyn sanerar inte, den släpper igenom det den får. Skyddet mot främmande kod ligger i `script-src 'self'`, skyddet mot inbäddad markup i artikeldata i `esc()` på raden nedan. |
| Escaping + URL-validering (`esc`/`safeUrl` i `js/main.js`) | All artikeldata escapas innan rendering; endast `https:`/`mailto:` och relativa länkar släpps igenom |
| Systemtypsnitt — inga typsnittsfiler | Besökaren laddar ingenting; CSP:n sätter `font-src 'none'` |
| Referrer-Policy + clickjacking-spärr | Begränsar informationsläckage och inramning av sajten |
| `.htaccess` | HTTP-säkerhetsheaders (HSTS, `frame-ancestors`, `nosniff` m.m.), blockering av interna filer och avstängd kataloglistning — aktiv i produktion på Loopia (Apache 2.4) |
| `.well-known/security.txt` + `SECURITY.md` | Tydlig kanal för att rapportera sårbarheter (RFC 9116) |

Hittar du ett säkerhetsproblem? Se [SECURITY.md](SECURITY.md).

## Struktur

```
├── index.html                     ← Startsidan
├── artiklar.html                  ← Artikelöversikt med kategorifilter
├── integritetspolicy.html         ← Så här behandlar vi dina uppgifter
├── leverantorsinfo.html           ← Information till potentiella kunder/partners
├── sarbarhetsrapportering.html    ← Villkor för att rapportera sårbarheter i webbplatsen
├── css/
│   └── style.css                  ← All design. Varumärkesfärger + typsnitt överst.
├── js/
│   ├── partials.js                ← Sidhuvud, sidfot och CTA — definieras EN gång här
│   ├── articles.js                ← Artikeldata. Nya artiklar registreras här.
│   └── main.js                    ← Meny, artikelrendering, filter, animationer
├── artiklar/
│   └── *.html                     ← Publicerade artiklar
├── bilder/                        ← ALLA bilder: logotyper, favicon, ikoner, delningsbild
├── site.webmanifest               ← PWA-manifest (ikonsökvägar pekar in i bilder/)
├── .well-known/security.txt       ← Säkerhetskontakt (RFC 9116)
├── .htaccess                      ← Apache-konfiguration: headers, blockeringar, cache
├── 404.html                       ← Egen felsida (rotabsoluta länkar, fungerar på alla djup)
├── robots.txt                     ← Indexeringsregler + pekare till sitemap
├── sitemap.xml                    ← De sidor som ska indexeras — inget annat
└── SECURITY.md                    ← Hur sårbarheter rapporteras (endast repo, laddas ej upp)
```

## Drift

Sajten driftas på **Loopia** (UNIX-plattformen, Apache 2.4) under
**portalcs.se**. Det här repot är enbart versionshantering — GitHub
publicerar ingenting.

Vid uppdatering: ladda upp ändrade filer till `public_html/` via Loopias
filhanterare eller SFTP. Tre filer hör hemma i repot men ska **inte**
laddas upp: `README.md`, `SECURITY.md` och `artiklar/_mall.html`
(`.htaccess` blockerar dem som skyddsnät om de ändå råkar följa med).

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
primär, babyblå `--babyblue` som accent). 

Samtliga bilder ligger i `bilder/`.
Logotypvarianterna finns i `bilder/`
(`logo.svg` horisontell, `logo-stacked.svg` stående, `logo-icon.svg` enbart
symbolen). 


Läggs det till en bild: refereras relativt (`bilder/...` från roten,
`../bilder/...` från en artikel) eller rotabsolut (`/bilder/...`) på felsidan.
Sökvägarna i `site.webmanifest` tolkas relativt manifestets plats i roten,
alltså `bilder/ikon.png` utan inledande snedstreck.
