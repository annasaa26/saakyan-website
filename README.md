# saakyan.ai — Produktions-Build

Statische Ausgabe für den Live-Betrieb. Ordnerinhalt einfach auf den Webspace
hochladen, `index.html` ist die Startseite. Kein Build-Schritt, kein Node, kein
Framework.

## Inhalt

```
index.html            fertiges HTML, alle Inhalte im Quelltext
styles.css            Designtokens, Schriften und alle Seitenstile in einer Datei
app.js                ~4 KB eigenes JavaScript (Szenario-Umschalter, Menü)
assets/fonts/*.woff2  10 Schriftdateien, lokal eingebunden
assets/*.png          Favicon und Apple-Touch-Icon
assets/anna-saakyan.jpg  Businessfoto (840×1040)
```

## Keine Drittanbieter zur Laufzeit

Beim Seitenaufruf entsteht **keine** Verbindung nach außen. Geprüft im
laufenden Aufruf: die Liste der geladenen Ressourcen enthält keinen fremden
Host, `window.React` und `window.Babel` sind nicht vorhanden, und die einzige
eingebundene Skriptdatei ist `app.js`.

- Kein React, kein Babel — die Seite ist vorgerendert. Der frühere Aufbau
  übersetzte JSX im Browser und lud drei Bibliotheken von `unpkg.com`.
- Kein Google Fonts. Die drei Familien liegen als WOFF2 im Projekt und werden
  über lokale `@font-face`-Regeln mit `font-display: swap` geladen.
- Nur die genutzten Schnitte und die Subsets `latin` und `latin-ext`:
  Newsreader (variabel, normal + kursiv), Instrument Sans (variabel),
  IBM Plex Mono 400 und 500. Zusammen rund 540 KB.

## Interaktion ohne Framework

`app.js` erledigt zwei Dinge in reinem JavaScript: den Umschalter unter
„So entsteht ein System" (inklusive Tastaturbedienung mit den Pfeiltasten) und
das Aufklappmenü auf schmalen Bildschirmen. Alle Hover-Zustände laufen jetzt
über CSS statt über JavaScript. Ohne JavaScript bleibt die Seite vollständig
lesbar; nur der Szenario-Wechsel entfällt, das erste Szenario steht im
Quelltext.

## Noch zu ergänzen

- **Impressum und Datenschutz**: Die Fußzeile verweist auf `impressum.html` und
  `datenschutz.html`. Beide Seiten fehlen noch.

## Verhältnis zu den Entwurfsdateien

Dieser Ordner ist die Ausgabe. Gestaltet wird weiter im Design System
(`ui_kits/website/`, React-Entwurf mit Live-Vorschau). Änderungen dort müssen
hier nachgezogen werden — die beiden Fassungen sind nicht automatisch
gekoppelt.
