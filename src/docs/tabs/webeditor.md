Webbsidan – Redigeringsinstruktioner (Adminpanel)

Detta dokument definierar alla regler, komponenter, strukturer och standarder som ska användas när vi bygger adminverktygen för att redigera webbsidans layout, startsida och statiska sidor.

All utveckling av “Webbsidan”-fliken i adminpanelen måste följa denna fil.

-----------------------------------------------------
🎯 1. Syfte
-----------------------------------------------------

Syftet med dessa instruktioner är att skapa:

En enhetlig redigeringsupplevelse för alla delar av webbsidan

Standardiserade komponenter som används för ALLA sektioner

Skalbarhet för framtida sektioner och kampanjmoduler

Ett konsekvent designsystem

Klara gränser mellan statiskt innehåll och dynamiska sektioner

All framtida utveckling av startsidan, statiska sidor, navigation och sidfot ska följa denna standard.

-----------------------------------------------------
🎨 2. Designsystem & färgstandard
-----------------------------------------------------

Alla färgval i systemet (background, card, text, links, etc.) ska använda en custom color picker med förvalda färger från The Kitchen.

🎨 Globala färg-presets (måste alltid ligga överst):

#a1c798 (Mintgrön)

#f6f2e0 (Beige)

#56c5c5 (Turkos)

#ffffff (Vit)

#000000 (Svart)

Color pickern ska kunna:

Visa presets överst

Tillåta valfri färg (manual input)

Visa senaste använda färger (valfritt)

-----------------------------------------------------
🧱 3. Standardkomponent: “Sektion-editor”
-----------------------------------------------------

Alla redigerbara sektioner på startsidan måste använda exakt samma komponentstruktur, oavsett funktionalitet.

Sektion-editor UI-uppbyggnad:
1. Header

Sektionens namn

Kort beskrivning

Toggle: Visa på startsidan

Förhandsvisning / preview-komponent (alltid högst upp)

2. Innehållsinställningar

Fält (alla sektioner ska ha dessa):

Rubrik (textfält)

Underrubrik (textfält)

Beskrivning (textfält)

Slug / ID ( används av frontend )

Antal objekt (t.ex. antal produkter/kockar som ska visas)

3. Designinställningar (obligatoriskt i alla sektioner)
Bakgrund

backgroundColor

möjlighet till backgroundImage

padding: small / medium / large

rounded: none / sm / md / lg

Kortdesign (standard för sektioner som visar kort)

cardBackgroundColor

cardBorderColor

cardTextColor

cardHeadingColor

cardRadius

cardShadow (none / soft / elevated)

Text & typografi

headingColor

textColor

linkColor
(Dessa kan overridas per sektion även om globala typsnitt finns.)

4. Layoutinställningar

Varje sektion måste stödja:

layoutType: grid / carousel / list / featured / collage

antal kolumner (för grid)

card-size presets (small / medium / large)

5. Datakälla (dataSource)

Alla sektioner ska definiera hur innehållet fylls.

Typer:

Manuell

Admin väljer specifika objekt:

produkter

kockar

recept

blogginlägg

deals

Automatisk

Systemet hämtar baserat på regler:

nyaste

mest sålda

högst betyg

efter kategori/tagg

kampanjstyrt

Hybrid

automatisk lista

admin kan “pinna” objekt överst

6. Synlighet & planering

Varje sektion måste ha:

toggle: Visible

visibleFrom (valfritt)

visibleTo (valfritt)

Så admin kan tidsstyra kampanjer.

-----------------------------------------------------
📄 4. Statiska sidor – standardmall
-----------------------------------------------------

Alla statiska sidor (Om oss, Kontakta oss, Samarbeten, Guldskeden etc.) ska använda samma redigeringsmall.

Fält:

Rubrik

Underrubrik

Ingress

Innehåll (WYSIWYG, TipTap eller motsvarande)

Hero-bild (valfri)

Sidikon (valfri)

SEO-titel

SEO-beskrivning

URL-slug

Toggle: Visa / Dölj

Alla statiska sidor ska laddas från tabellen: static_pages.

-----------------------------------------------------
🧭 5. Struktur för “Webbsidan”-fliken i adminpanelen
-----------------------------------------------------

Huvudflik: Webbsidan

Underflikar:

A) Layout & Navigation

Topbar

Header & Navigationsmeny

Sidfot

Färger & typsnitt (globala designregler)

B) Startsidan
1. Ordning & synlighet

Drag & drop av sektionernas ordning

Visa/dölj per sektion

Snabb vy av aktiva/inaktiva

2. Sektioner

Alla följande sektioner får varsin sida med samma “Sektion-editor”-komponent:

Bildspel

Hero

Nyheter

På spisen nu

Populärt käk

Bråttomkäk

Nytt på menyn

Kylskåpsmeny

Veckans kockar

Schyssta deals

Tjuvkik i köket

Hälsokäk

Humörkäk

Önska käk

Testkäka & Tyck till

Bli en kitchen-kock

Så tycker våra kunder

Horoskop

Evenemang

Kock i fokus

Tävlingar

Blogg-modulen

C) Sidor (statiska sidor)

Om oss

Kontakta oss

Guldskeden

Våra kockar

FAQ

Policys & villkor

Så funkar det

Samarbeten

Press

Blogg & kategorier

Alla ska använda samma sid-editor.

-----------------------------------------------------
🧩 6. Databasstruktur
-----------------------------------------------------
site_sections

Lagrar alla sektioner på startsidan.

Kolumner:

id

name

slug

settings JSON (rubrik, antal objekt osv.)

design JSON (färger, layout, bakgrund)

dataSourceType (manual/automatic/hybrid)

dataSourceConfig JSON

orderIndex

visible (bool)

static_pages

Kolumner:

id

title

slug

ingress

content

heroImage

seoTitle

seoDescription

visible

-----------------------------------------------------
🔧 7. API-regler (måste följas)
-----------------------------------------------------
Sektioner:

GET /api/site/sections
PATCH /api/site/sections/:id

Sidor:

GET /api/site/pages
PATCH /api/site/pages/:id

Bolt får INTE skapa specialendpoints för enskilda sektioner.
Allt ska gå genom dessa.

-----------------------------------------------------
🧠 8. Utvecklingsregler för Bolt
-----------------------------------------------------

Återanvänd alltid Sektion-editor-komponenten för alla sektioner.

Återanvänd alltid sid-editorn för statiska sidor.

Alla sektioner ska ha identisk struktur för settings och design.

Alla färgval ska använda The Kitchens färgpalett som presets.

Gör inga hårdkodade sektioner — allt ska vara dynamiskt.

Alla preview-komponenter ska ligga i toppen av redigeringssidan.

Alla visuella ändringar i admin ska omedelbart reflekteras i preview.

-----------------------------------------------------
✨ 9. Slutord
-----------------------------------------------------

Denna fil är den enda källan för sanning kring hur Webbsidan-fliken ska byggas.
Alla komponenter, API:er, databastabeller och sidor ska följa denna standard.