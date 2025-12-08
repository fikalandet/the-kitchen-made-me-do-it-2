CARD-SPEC – Instruktionsfil till Bolt (Kurrr/TKMMDI)

Syfte: Detta dokument beskriver exakt hur alla kortkomponenter ska utformas och bete sig i plattformen. Använd som källa i Bolt-promptar. Följ prioriteringsordning: Globala regler → Återanvändbara element → Kortvarianter → Data/props → Villkor.

1) Globala regler (gäller alla kort)

Bakgrund & form

Bakgrund: vit (#FFFFFF) som standard. (Admin ska kunna override:a kortbakgrund per sektion/korttyp via CMS/Admin, se §7.)

Hörn: rundade 16px (desktop & mobil).

Skugga: 0 3px 10px rgba(0,0,0,0.10).

Hover: skala 1.02 + skugga 0 6px 16px rgba(0,0,0,0.12) (transition 160ms ease-out). Cursor: pointer.

Ytpadding: 12–16px under bildytan (ej över bild).

Bild & media

Primär bild placeras överst och spänner full bredd (edge-to-edge).

Ratio: 16:9 på stående kort. För liggande (kassar/prenumeration), se respektive sektion.

Overlay-ikoner renderas på bilden:

Share/Dela (övre högra hörnet, vänster om Favorit)

Favorit ♥ (övre högra hörnet, ytterst)

Fler-bilder-ikon (nedre högra hörnet)

Rund kockprofilbild med statusram (diameter 40px, position: nedre vänstra hörnet av bilden, 6px offset från kant).

Statusram runt kockens profilbild (live/öppet-status)

Öppet: #a1c798

Öppnar snart / Stänger snart: gult (#F6C445 – om ej definierad hex, använd denna)

Stängt: ljusgrå (#D9D9D9)

Typografi

Rättnamn (title): Lobster-typsnitt, semibold/bold. Fallback: cursive.

Brödtext: Inter/System UI.

Priser: semi-bold för standardpris, bold + färg #56c5c5 för nedsatt pris (aldrig rött).

Centrala sektionsrubriker i korten (t.ex. ”Tillgänglig”, ”Tillagas på spisen”): center, caps/små caps ok, vikt 600.

Knappar

Primär svart CTA: bakgrund #000000, text #FFFFFF, rundning 12px, height 40px.

Sekundär grön CTA (”Mer info”): bakgrund #a1c798, text #0B2B13 (95% black overlay ok), rundning 12px, height 40px.

Ikon + label tillåtet. Min 44x44px tappyta.

Badges

Basstil: rundning 12px, padding 4px 10px, text 12–13px, medium weight.

Färger:

”I frysen”: #56c5c5 (badge) + antal visas under badgen i 11–12px regular.

”Förbeställ”: ljusare ton av #a1c798 (t.ex. #cfe5d2).

”Prenumerera”: svart (#000000), vit text. Visas endast för guldkockar; döljs annars.

”Kort datum” (Bråttomkäk): #56c5c5.

Guldpoäng (”gp”)

Ikon: ⭐ eller 🥄 (konsekvent inom appen).

Placering: sista raden i knappsektionen.

Admin kan sätta/ändra gp-värde per korttyp/kampanj i Adminpanelen.

Tillgänglighetsregler

Alla ikoner har aria-labels.

Kontraster uppfyller WCAG AA på text & knappar.

2) Återanvändbara element (kompositionsbyggstenar)

<CardHeader>

Innehåller bildyta + overlay-ikoner + kockprofil med statusram.

Props: { imageUrl, hasGallery, onShare, onFavToggle, isFaved, chef: {name, avatarUrl, status} }.

<RatingRow>

Stjärnor (0–5, steg 0.5) centrerat under bilden. Props: { value, count? }.

<TitlePriceRow>

Vänster: rättnamn (Lobster, bold). Höger: pris. Props: { title, price, discountedPrice?, currency }.

Om discountedPrice finns: visa ordinarie i grå med genomstrykning, nedsatt i bold #56c5c5.

<PackagePriceSubrow>

Mindre text under pris (högerjusterad). Props: { packageLabel? } (t.ex. ”Paketpris från 79 kr/port”).

<CenteredSectionLabel>

Mittrad rubrik (t.ex. ”Tillgänglig”, ”Tillagas på spisen”). Props: { label }.

<AvailabilityBadges>

Rad med 1–3 badges: I frysen, Förbeställ, Prenumerera. Props: { frozenCount?, preOrder?, subscribeAvailable? }.

Prenumerera visas endast om chef.membership === 'gold'.

<LogisticsRow>

Ikonlist: ”Upphämtning”, ”Utkörning”. Nästa rad: klockslag för respektive.

Props: { pickup: {enabled, hours}, delivery: {enabled, hours} }.

<CTAGroup>

Vänster: ”Mer info”-knapp (grön). Mitten/höger: Primär köpknapp (svart). Höger om knappar: gp-ikon + värde.

Props: { onInfo, infoLabel='Mer info', onPrimary, primaryLabel, gp }.

3) Kortvarianter (exakt layout & innehåll)
3.1 ”På spisen nu” (Startsida → flöde)

Ordning (uppifrån & ned):

CardHeader:

Bild fullbredd.

Overlay: Dela & Favorit (övre höger). Fler-bilder (nedre höger). Kockprofil (nedre vänster) med statusram enligt §1.

RatingRow (centrerad).

TitlePriceRow (namn vänster/fet Lobster, pris höger).

PackagePriceSubrow (om finns: under priset, mindre storlek, högerjusterad).

CenteredSectionLabel: ”Tillagas på spisen”.

Rad: Dag/Datum + tidsintervall (t.ex. ”Tis 12 nov, 17:30–19:00”).

Rad: Antal portioner som tillagas + hur många bokade (t.ex. ”12 tillagas – 7 bokade”).

LogisticsRow: leveranssätt (Upphämtning/Utkörning) + närmast följande tider på nästa rad.

CTAGroup: infoLabel='Mer info', primaryLabel='Köp', gp='20 gp'.

3.2 ”Populärt käk” / ”Nytt på menyn” / ”Humörkäk” (Startsida → flöden)

Ordning:

CardHeader (som ovan).

RatingRow (centrerad).

TitlePriceRow (Lobster + pris).

PackagePriceSubrow (vid behov).

CenteredSectionLabel: ”Tillgänglig”.

AvailabilityBadges:

I frysen-badge (#56c5c5) + antal visas under badgen.

Förbeställ-badge (ljusare #a1c798).

Prenumerera-badge (svart) endast guldkock.

LogisticsRow (sätt + tider på nästa rad).

CTAGroup: primaryLabel='Köp/beställ', gp='20 gp'.

3.3 ”Bråttomkäk” (Startsida → flöde)

Ordning:

CardHeader med extra badge ”Kort datum” (placeras övre vänster på bilden, färg #56c5c5).

Övriga overlay-ikoner som standard.

RatingRow (centrerad).

TitlePriceRow där nedsatt pris visas tydligt i bold #56c5c5 (ordinarie grått & struket om finns).

PackagePriceSubrow (vid behov).

CenteredSectionLabel: ”Tillgänglig”.

Badgerad: ”I frysen” + antal (under).

LogisticsRow (sätt + tider nästa rad).

CTAGroup: primaryLabel='Köp/beställ', gp='30 gp'.

3.4 ”Smaketikett” (Startsida → flöde ”Smaketiketter”)

Ordning:

CardHeader + Smaketikett som banderoll diagonalt över övre vänstra hörnet på bilden.

Smaketikett-text skrivs av kocken (ex. ”För ostfantaster!”, ”Extra mkt vitlök”).

Tillåtet endast för silver- och guldkockar (döljs annars).

RatingRow (centrerad).

TitlePriceRow med tydligt nedsatt pris (bold #56c5c5) om nedsatt.

PackagePriceSubrow (vid behov).

CenteredSectionLabel: ”Tillgänglig”.

AvailabilityBadges: I frysen (+ antal under), Förbeställ, Prenumerera (svart, endast guldkock).

LogisticsRow.

CTAGroup: primaryLabel='Köp/beställ', gp='30 gp'.

3.5 ”Matlådekasse” / ”Laga-själv-kit”

Placering: Startsida → ”Kylskåpsmeny”, Hero ”Utforska kassar”, samt på kockens kökssida under knapparna ”Matlådekassar” / ”Laga-själv-kit”.

Layout: Liggande rektangel (ratio ca 2:1), rundade hörn 16px.

Vänster: omslagsbild/kollage (50–56% av bredd).

Höger: all text/fakta.

Overlay-ikoner & kockprofil ligger ovanpå vänstra bildytan (samma positioner som stående kort).

Ordning i högerspalt:

Titel (Lobster) + pris i samma rad (pris högerjusterat).

”En beskrivande text” (1–2 rader, truncation efter ~120–140 tecken på mobil).

Tillgänglighet: badgerad rad (I frysen, Förbeställ, Prenumerera (svart, endast guldkock)).

Leveranssätt: Upphämtning/utkörning + tider under.

CTAGroup: primaryLabel='Köp/beställ', gp='60 gp'.

3.6 ”Prenumerera”

Placering: Startsida → ”Kylskåpsmeny”, Hero ”Utforska kassar”, samt kockens kökssida under knappen ”Prenumerera”.

Layout: Liggande rektangel som §3.5 (bild vänster, fakta höger).

Ordning i högerspalt:

Plan-namn (Lobster) + pris i samma rad.

Typ-rad: ”Enskild maträtt” / ”Matlådekasse” / ”Laga-själv-kit”.

Tillgänglighet: vilka dagar det finns platser kvar.

Leveranssätt & tider (upph/utkörning).

CTAGroup: primaryLabel='Prenumerera', gp='100 gp'.

Viktigt: Denna korttyp och Prenumerera-badge får bara visas för guldkockar. Om kock inte är guldkock → visa inte prenumerationskort i flödena & dölja prenumerera-badgen i andra kort.

3.7 ”Testkäka & Tyck till”

Placering: Startsida → flöde.

Ordning:

CardHeader.

TitlePriceRow (nedsatt pris om finns: bold #56c5c5).

CenteredSectionLabel: ”Tillgänglig”.

Rad: Antal portioner tillgängliga för testare.

CTAGroup: primaryLabel='Anmäl intresse', gp='30 gp'.

Klick öppnar modal med ”Så funkar det”-text (static content från CMS/Admin).

3.8 ”Evenemang”

Placering: Startsida → ”Evenemang”, samt på kockens kökssida under knappen ”Evenemang”.

Layout: Variantlayout (för att bryta av från maträttskort):

Bild/kollage överst (kan vara 21:9 eller 16:9), kockens runda profilbild (statusram) överlagrad nedre vänster.

Under bild:

Eventnamn (Lobster)

Beskrivning (2–3 rader)

Pris

Antal platser

Ort + Lokal plats

Datum + Tidpunkt

Knapp-rad: Dela, Favorit, Kommentar, Kommer, Kanske kommer (alla som små svarta knappar; aktiv state fyller svart, inaktiv outline svart).

3.9 ”Veckans kockar”

Placering: Startsida → flöde.

Layout & innehåll:

Stor rund kockbild (diameter 96–120px) med vit ram (statusram enligt §1).

Admin-alternativ: fyrkantig bild med vit ram (toggla via CMS/Admin).

Under bilden: kökets namn (title weight 600).

Under köksnamn: prefix ”The Kitchen-kommentar:” följt av en textrad från Admin.

Nederst: svart knapp ”Till kockens kök”.

4) Villkorslogik & medlemskap

Prenumerera-(badge/kort/CTA) renderas endast om chef.membership === 'gold'.

Smaketikett (diagonal banderoll) renderas endast om chef.membership ∈ { 'silver', 'gold' }.

Profilringsfärg styrs av chef.openStatus ∈ { 'open', 'soon', 'closed' } → färger enligt §1.

Nedsatt pris → visa originalPrice (grå & struken) och discountedPrice i bold #56c5c5.

5) Data/Props-kontrakt (exempel per kort)

Bas-entity (delas av de flesta kort):

type Chef = {
  id: string
  name: string
  avatarUrl: string
  membership: 'free' | 'silver' | 'gold'
  openStatus: 'open' | 'soon' | 'closed'
}


type Logistics = {
  pickup: { enabled: boolean; hours?: string }
  delivery: { enabled: boolean; hours?: string }
}


type Price = {
  currency: 'SEK'
  price: number
  originalPrice?: number // om finns → nedsatt
}


type CommonProps = {
  id: string
  imageUrl: string
  hasGallery?: boolean
  title: string // Lobster i UI
  rating?: { value: number; count?: number }
  price: Price
  packageLabel?: string
  chef: Chef
  logistics: Logistics
  gp?: number
}

Variant: På spisen nu

type OnStoveNowProps = CommonProps & {
  schedule: { dateLabel: string; timeRange: string } // ex: "Tis 12 nov", "17:30–19:00"
  portions: { planned: number; booked: number }
}

Variant: Populärt/Nytt/Humörkäk

type AvailableDishProps = CommonProps & {
  availability: { frozenCount?: number; preOrder?: boolean; subscribe?: boolean }
}

Variant: Bråttomkäk

type RushDishProps = AvailableDishProps & { shortDate: boolean }

Variant: Smaketikett

type FlavorTagDishProps = AvailableDishProps & {
  flavorTag?: string // endast silver/guld, annars ignorera i UI
}

Variant: Matlådekasse/Laga-själv-kit (liggande)

type BundleProps = CommonProps & {
  description?: string
  availability: { frozenCount?: number; preOrder?: boolean; subscribe?: boolean }
}

Variant: Prenumerera (liggande, endast guldkock)

type SubscriptionProps = CommonProps & {
  planType: 'dish' | 'bundle' | 'diy'
  availabilityDays: string[] // ex: ['Tis', 'Tors']
}

Variant: Testkäka & Tyck till

type TestEatProps = CommonProps & {
  testPortions: number
}

Variant: Evenemang

type EventCardProps = {
  id: string
  imageUrl: string
  title: string
  chef: Chef
  description?: string
  price?: Price
  seats?: number
  city?: string
  venue?: string
  date: string
  time: string
}

Variant: Veckans kockar

type ChefOfWeekProps = {
  chef: Chef
  kitchenName: string
  adminComment: string
  imageShape?: 'round' | 'square' // styrs i Admin
}
6) Adminpanel – styrbara fält

Kortbakgrundsfärg per sektion/korttyp (global override över vit standard).

Guldpoäng (gp) per korttyp och/eller enskild post.

Kommentar till ”Veckans kockar”.

”Så funkar det”-text (modal) för ”Testkäka & Tyck till”.

Prenumerationssynlighet kopplad till kockens medlemsnivå (sätts av system/medlemsmodul, ej manuellt flaggat).

7) Renderingsregler (sammanfattning)

Om chef.membership !== 'gold' → dölj Prenumerera-badge och rendera aldrig prenumerationskort.

Om chef.membership === 'free' → dölj Smaketikett.

Om price.originalPrice finns → visa prisrad med ordinarie grå & struken, nedsatt i bold #56c5c5.

”I frysen” visar antal under badgen (centrerad, liten text).

Leveranssätt och tider renderas som två rader:

Rad 1: ikoner + ”Upphämtning”/”Utkörning” (endast de som är enabled)

Rad 2: tider för aktiva leveranssätt.

8) Interaktionsdetaljer

Favorit togglar hjärta-ikon och skickar event. Share öppnar nativ delning (Web Share API) fallback modal.

Fler-bilder öppnar galleriviewer (lightbox).

”Anmäl intresse” (Testkäka) öppnar modal med CMS-text + formulär.

”Kommer/Kanske kommer” (Event) fungerar som togglande knappar (inkl. aria-pressed).

9) Snabb visuell checklista per variant

På spisen nu: Live-schema (datum+tid), portionsrad (planerade/bokade), label ”Tillagas på spisen”.

Populärt/Nytt/Humör: label ”Tillgänglig”, badges (frys/preorder/prenumerera*).

Bråttomkäk: ”Kort datum”-badge (#56c5c5), nedsatt pris i bold #56c5c5.

Smaketikett: diagonal banderoll med text (silver/guld only).

Kasse/DIY (liggande): bild vänster, fakta höger, gp 60.

Prenumerera (liggande): endast guldkock; typ-rad + dagar med plats; gp 100.

Testkäka: antal testportioner + modal CTA ”Anmäl intresse”; gp 30.

Evenemang: eventdata + knapprad (Dela/Fav/Kommentar/Kommer/Kanske).

Veckans kockar: stor bild (rund/fyrkant, vit ram), köksnamn, admin-kommentar, svart CTA.

10) Implementationsnoter till Bolt

Skapa en CardKit-mapp med subkomponenterna i §2 och varianter i §3.

Säkerställ att Lobster-fonten laddas globalt (via Google Fonts eller lokalt). Fallback cursive.

Alla färgkoder definieras i en central tokens.ts/theme.ts så Admin-overrides kan injiceras från CMS.

Lägg conditional rendering baserat på chef.membership och chef.openStatus (se §4).

Lägg jest/storybook stories per variant med snapshot + a11y checks.

Kvalitetskrav: identisk layout mellan mobil/desktop (anpassad bredd), inga kraschande props, tydlig skeleton-state när data laddar.