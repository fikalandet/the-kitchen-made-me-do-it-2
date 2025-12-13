Webbsidan – Redigeringsinstruktioner (Adminpanel)

Version 2.0 – Gäller från nu

Detta dokument definierar regler, principer, strukturer och standarder för hur adminverktygen för Webbsidan ska byggas, vidareutvecklas och underhållas.

Alla förändringar i fliken Webbsidan i adminpanelen måste följa denna fil.

🎯 1. Syfte

Syftet med dessa instruktioner är att säkerställa:

En enhetlig men flexibel redigeringsupplevelse

Ett skalbart system för nya sektioner och redaktionellt innehåll

Ett konsekvent design- och typografisystem

Tydlig separation mellan:

sektionslogik

kortlogik

innehållslogik

Att adminpanelen är tydlig, begriplig och visuell

Viktig princip:
Sektion-editorn är ett ramverk, inte en fast mall.
Alla sektioner följer samma grundstruktur – men får ha egna redigeringskort, visningslägen och logik.

🎨 2. Designsystem & färgstandard

Alla färgval i systemet (bakgrunder, kort, text, knappar, overlays etc.) ska använda en custom color picker med The Kitchens färgpalett.

🎨 Globala färg-presets (ska alltid visas överst)

#a1c798 – Mintgrön

#f6f2e0 – Beige

#56c5c5 – Turkos

#ffffff – Vit

#000000 – Svart

Color pickern ska:

Visa presets överst

Tillåta manuell färgkod

(Valfritt) visa nyligen använda färger

Viktigt

Färg- och typografival kan förekomma på:

sektionsnivå

kortnivå

innehållsnivå

Bolt ska inte anta att design alltid är global per sektion.

🧱 3. Standardkomponent: Sektion-editor (uppdaterad)

Alla redigerbara sektioner på startsidan ska använda samma grundram, men innehållet i editorn är sektion-specifikt.

3.1 Sektion-editor – Grundram (ALLTID)

Varje sektion ska alltid innehålla:

1. Sektion-header

Sektionens namn

Kort beskrivning

Toggle: Visa på startsidan

Preview (alltid högst upp)

2. Redigeringskort (dynamiska)

Varje sektion definierar själv:

vilka kort som finns

i vilken ordning de visas

Exempel på vanliga kort:

Bakgrund

Huvudrubrik

Textrader

Visningsläge

Innehåll

Preview

Alla sektioner måste inte ha samma kort.

🧩 4. Kort-nivå-redigering (viktig princip)

Sektioner som visar kort eller objekt (t.ex. Nyheter, Redaktionella kategorier, Produktflöden):

Ska visa en lista med kort

Varje kort redigeras via penn-ikon

Allt som är specifikt för ett kort ska redigeras där

Exempel på per-kort-inställningar:

Rubrik + typografi

Text + typografi

Bild

Knapp (text, färg, stil, placering)

Featured-status

Accentfärg

Design ska inte ligga på sektionsnivå om den gäller ett enskilt kort.

📐 5. Visningslägen (ersätter statiska layouttyper)

Varje sektion kan ha ett eller flera visningslägen.

Ett visningsläge beskriver:

hur innehållet renderas i frontend

vilka inställningar som visas i admin

vilka fält som är aktiva

Exempel på visningslägen:

Stor bild & text

Kortflöde

Små kort

Grid

Slider

Collage

Redaktionell hero

Bolt ska inte låsa sektioner till fasta layouttyper som grid/carousel –
visningslägen är den överordnade modellen.

🗂 6. Datakällor
6.1 Dynamiska sektioner (produkter, kockar etc.)

Kan använda:

Manuell

Automatisk

Hybrid

6.2 Redaktionella sektioner

Redaktionellt innehåll är alltid manuellt.

Exempel:

Redaktionella kategorier

Artiklar

Blogg

Story-sektioner

Bolt ska inte försöka auto-generera eller auto-hämta redaktionellt innehåll.

📄 7. Statiska sidor – standardmall

Alla statiska sidor ska använda samma sid-editor.

Fält:

Rubrik

Underrubrik

Ingress

Innehåll (WYSIWYG)

Hero-bild (valfri)

Sidikon (valfri)

SEO-titel

SEO-beskrivning

URL-slug

Toggle: Visa / Dölj

Datakälla:

Tabell: static_pages

🧭 8. Struktur för “Webbsidan”-fliken
Huvudflik: Webbsidan
A) Layout & Navigation

Header / navigation

Sidfot

Globala färger & typsnitt

B) Startsidan

Ordning & synlighet (drag & drop)

Sektioner (varje sektion = egen sida med Sektion-editor)

Exempel på sektioner:

Nyheter

Redaktionella kategorier (hub)

Produktflöden

Kampanjer

Community-sektioner

Redaktionella teman (Hälsokäk, En sked för mamma etc.) ska inte vara egna sektioner –
de hanteras som kategorier i den redaktionella hubben.

C) Redaktionellt

Redaktionella kategorier

Artiklar per kategori

D) Sidor

Alla statiska sidor

🧩 9. Databasstruktur (utökad)
site_sections

id

name

slug

settings (JSON)

design (JSON)

orderIndex

visible

editorial_categories

id

title

slug

settings (JSON: bild, texter, knappar, typografi)

orderIndex

visible

editorial_articles

id

categoryId

title

ingress

content

image

orderIndex

visible

static_pages

(se tidigare struktur)

🔧 10. API-regler

Bolt får inte skapa special-endpoints per sektion.

Tillåtna endpoints:

GET /api/site/sections

PATCH /api/site/sections/:id

GET /api/site/pages

PATCH /api/site/pages/:id

Redaktionella kategorier och artiklar ska följa samma princip (centrala endpoints).

🧠 11. Utvecklingsregler för Bolt

Bolt ska alltid:

Återanvända Sektion-editor-ramen

Avgöra om en inställning hör hemma på:

sektionsnivå

kortnivå

Prioritera:

tydlighet

visuell gruppering

att fält inte “flyter ihop”

Säkerställa att:

preview alltid uppdateras direkt

admin ser vad som händer visuellt

Aldrig hårdkoda sektioner eller innehåll

✨ 12. Slutord

Denna fil ersätter alla tidigare instruktioner för Webbsidan-fliken.

All utveckling ska utgå från denna modell:

Ramverk först

Sektionens behov styr

Redaktionellt innehåll är manuellt

Adminpanelen ska vara tydlig, visuell och trygg att använda