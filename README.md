# Portal Cybersecurity — webbplats

En statisk webbplats (landningssida + artiklar/blogg) byggd i ren HTML, CSS och
JavaScript. Inga byggsteg, inga databaser, inga beroenden att installera. Den
laddas upp direkt till **GitHub Pages**.

---

## Innehåll

```
portal-cybersecurity/
├── index.html        ← Startsidan (landningssidan)
├── artiklar.html     ← Artikel-/bloggöversikten
├── css/
│   └── style.css     ← All design. VARUMÄRKESFÄRGERNA ligger högst upp här.
├── js/
│   ├── articles.js   ← Listan över artiklar. Lägg till nya artiklar här.
│   └── main.js       ← Meny, animationer och rendering av artikelkort.
├── artiklar/
│   ├── _mall.html    ← MALL: kopiera denna när du skapar en ny artikel.
│   ├── cyberhygien-fem-vanor.html
│   ├── losenordshanterare-kom-igang.html
│   └── projektlogg-denna-sajt.html
├── bilder/           ← Lägg din logga och andra bilder här.
└── .nojekyll         ← Säger åt GitHub att publicera filerna som de är.
```

---

## 1. Publicera på GitHub Pages

### Enklaste vägen (via webbläsaren, ingen kod)

1. Skapa ett konto på <https://github.com> om du inte redan har ett.
2. Klicka **New repository**. Döp det till t.ex. `portal-cybersecurity` och välj
   **Public**. Klicka **Create repository**.
3. På repo-sidan: klicka **Add file → Upload files**.
4. Dra in **alla filer och mappar** från den här mappen (inklusive `index.html`,
   `css/`, `js/`, `artiklar/`, `bilder/` och den dolda `.nojekyll`). Klicka
   **Commit changes**.
5. Gå till **Settings → Pages**.
6. Under **Build and deployment → Source**, välj **Deploy from a branch**.
   Välj branch **main** och mapp **/ (root)**. Klicka **Save**.
7. Vänta någon minut. Din sida ligger sedan på:
   `https://<ditt-användarnamn>.github.io/portal-cybersecurity/`

> Tips: Om du vill att adressen ska bli `https://<användarnamn>.github.io/`
> (utan mappnamn på slutet) döper du istället repot till exakt
> `<ditt-användarnamn>.github.io`.

### Via Git (om du föredrar terminalen)

```bash
cd portal-cybersecurity
git init
git add .
git commit -m "Första versionen av sajten"
git branch -M main
git remote add origin https://github.com/<användarnamn>/portal-cybersecurity.git
git push -u origin main
```
Aktivera sedan Pages enligt steg 5–6 ovan.

---

## 2. Färger (din varumärkesprofil)

Sajten använder Portal Cybersecuritys riktiga färger, hämtade ur logotyp-paketet.
Allt ligger samlat högst upp i **`css/style.css`** under "DIN VARUMÄRKESPROFIL":

```css
--navy:     #0d2d5e;   /* Marinblå – primärfärg (PORTAL, rubriker, knappar) */
--babyblue: #6aacdb;   /* Babyblå – sekundär accent (siffror, detaljer) */
```

Marinblått används för rubriker, knappar och länkar. Babyblått används för
detaljer som tjänste-numren (01/02/03) och bockarna under "Arbetssätt". Vill du
justera nyanser ändrar du bara här, så uppdateras hela sajten.

---

## 3. Logotypen

Din riktiga logotyp är inlagd och används i sidhuvud och sidfot på alla sidor.
Logotyp-filerna ligger i mappen `bilder/`:

| Fil | Variant |
|-----|---------|
| `bilder/logo.svg` | Primär, horisontell (används i sidhuvudet) |
| `bilder/logo-stacked.svg` | Stående/staplad version |
| `bilder/logo-icon.svg` | Endast portal-symbolen |

Vill du byta storlek på loggan i sidhuvudet ändrar du `.logo-img { height: 32px }`
i `css/style.css`. Vill du byta till en annan variant byter du sökvägen i
`<img class="logo-img" src="bilder/logo.svg">` på sidorna.

---

## Varumärkesresurser (ikoner & delningsbild)

Logotyp och färg är inlagda enligt best practices. Dessa resurser används:

| Fil | Används till |
|-----|--------------|
| `favicon.svg` / `favicon.ico` | Ikonen i webbläsarens flik (från ditt logopaket) |
| `apple-touch-icon.png` | Ikon när sajten sparas på hemskärmen (iOS) |
| `icon-192.png` / `icon-512.png` | Hemskärms-ikon (Android) + appläge |
| `site.webmanifest` | Gör att sajten kan "läggas till på hemskärmen" |
| `og-image.png` | Förhandsbild när länken delas (sociala medier, chatt) |
| `bilder/logo-icon.svg` | Fristående portal-symbol att återanvända |
| `<meta name="theme-color">` | Färgar mobilens adressfält i marinblått |

**Byter du logga eller färg senare?** Lägg de nya filerna i `bilder/`, uppdatera
färgkoderna i `css/style.css`, och hör av dig så genererar jag nya ikoner
(favicon, app-ikoner, delningsbild) åt dig.

> **Obs:** Ikoner och typsnitt visas bara när sajten *körs via en server*
> (GitHub Pages eller lokal server) — inte om du dubbelklickar på `index.html`
> direkt, eftersom webbläsaren då blockerar externa resurser.

## 4. Lägg till en ny artikel

Tre enkla steg:

1. **Kopiera mallen.** Duplicera `artiklar/_mall.html` och döp om kopian, t.ex.
   `artiklar/min-nya-artikel.html`. Fyll i innehållet (allt inom `[HAKPARENTESER]`).

2. **Lägg till artikeln i listan.** Öppna `js/articles.js` och lägg till ett nytt
   objekt **högst upp** i listan (nyast först):

   ```js
   {
     titel:    "Min nya artikel",
     utdrag:   "En mening om vad artikeln handlar om.",
     kategori: "Cyberhygien",          // blir automatiskt en filterknapp
     datum:    "2026-06-10",           // format: ÅÅÅÅ-MM-DD
     lasetid:  "4 min",
     url:      "artiklar/min-nya-artikel.html"
   },
   ```

3. **Klart.** Artikeln dyker nu upp automatiskt både på startsidan och på
   artikelsidan. Ladda upp de ändrade filerna till GitHub så går den live.

---

## 5. Egen domän (valfritt)

Om du köper en domän (t.ex. `portalcybersecurity.se`):

1. Gå till **Settings → Pages → Custom domain**, skriv in domänen och spara.
2. Peka domänen mot GitHub hos din domänleverantör (GitHub visar vilka
   DNS-poster som behövs).
3. Kryssa i **Enforce HTTPS** när det blivit tillgängligt.

Glöm inte att uppdatera e-postadressen `hej@portalcybersecurity.se` i sidfoten
och kontaktknappen till din riktiga adress.

---

## Bra att veta

- **Inga lösenord eller känsliga uppgifter** ska någonsin läggas i koden – allt
  här är publikt.
- Sajten fungerar även om man öppnar `index.html` lokalt, men artikellistan och
  menyn fungerar bäst när den körs via GitHub Pages (eller en lokal server).
- Designen är responsiv och fungerar på mobil, surfplatta och dator.
