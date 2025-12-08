uild spec: Kockpanel → Marknadsföring → Schyssta deals
Mål

Bygg en sida där kocken kan:

Skapa, redigera och hantera “Schyssta deals” – rabatter/kampanjer på sina befintliga produkter.

Ange rabatt, giltighetstid, och valfri nedräkningstimer.

Förhandsgranska sin deal.

Boosta dealen direkt.

Visa aktiva deals i två flöden:

Startsidan → flödet “Schyssta deals”

Kockens egen kökssida → under knappen “Schyssta deals” i knapplisten.

Routing

Sökväg: /chef/marketing/deals

Titel i fliken: Schyssta deals

🎨 Design & färgtema

Håll hela sidan i vårt tema:

Huvudfärger:

Grön #a1c798 (primär)

Beige #f6f2e0 (huvudbakgrund)

Komplementfärger:

Turkos #56c5c5 (sekundära knappar, badges, detaljer)

Svart #000000 (text)

Vit #ffffff (kort, fält, produktbakgrunder)

Stilregler:

Grön = primär knapp

Turkos = sekundär knapp

Beige = sidbakgrund

Vit = textfält och kort

Svart = text

Rundade hörn (rounded-2xl), mjuka skuggor, luftig layout

Ingen annan färg används.

Steg 1 – Välj produkt

Lista alla kockens aktiva produkter som kan rabatteras (alla typer utom event/tävling).

Visa: bild, namn, ordinarie pris, typ, status.

Kocken klickar “Skapa deal” → öppnar formulär.

Steg 2 – Skapa deal (formulär)

Fält:

Rubrik: produktens namn (redigerbar).

Kort kampanjtext: t.ex. “Veckans deal – prova min signaturrätt till specialpris!”

Rabatt: välj mellan:

Procent (%)

Fast belopp (kr)

Nytt pris: beräknas automatiskt.

Startdatum & slutdatum: kalender (Europe/Stockholm).

Antal tillgängliga produkter (valfritt) – begränsa kampanjen.

Visa nedräkningstimer: checkbox

Om vald → nedräkning syns publikt med timer (“Slutar om X dagar/timmar”).

Visa i flöde “Schyssta deals” (checkbox, alltid vald som standard).

Förhandsgranska dealen (knapp med produktkort-preview).

Vid sparning:

Deal lagras i products (se DB längre ner).

is_discounted = true aktiveras → produkten visas i båda flödena:

Startsidan → Schyssta deals

Kockens kökssida → sektion “Schyssta deals”

Steg 3 – Hantera befintliga deals

Tabell med alla aktiva och kommande deals:

| Produkt | Ord. pris | Rabatt | Nytt pris | Giltig fr.o.m | t.o.m | Nedräkning | Status | Åtgärder |
|----------|------------|---------|------------|----------------|--------|-------------|----------|
| … | … | … | … | … | … | Ja/Nej | aktiv/planerad/avslutad | Redigera / Stoppa / Boosta |

Åtgärder:

Redigera: öppnar formulär med befintliga värden.

Stoppa deal: sätter is_discounted = false.

Boosta: öppnar Boost-modal (förifyllt flöde: Schyssta deals).

Databas (Supabase)

Använd befintliga tabeller, komplettera med följande fält i products:

products

id (uuid)

chef_id (uuid)

price (numeric)

discount_price (numeric)

discount_percent (numeric)

discount_start (date)

discount_end (date)

discount_description (text)

is_discounted (boolean)

discount_limit (int, optional)

show_countdown (boolean default false)

boost_products

Uppdatera logik: alla produkter med is_discounted = true kopplas automatiskt till boost-flödet DEALS (Schyssta deals).

Logik & regler

Min rabatt: 5%

Max rabatt: 70%

Max giltighet: 30 dagar framåt

Endast en aktiv deal per produkt samtidigt

Deal syns i “Schyssta deals”-flöden om:

is_discounted = true

dagens datum mellan discount_start och discount_end

När giltighet löper ut → is_discounted ändras till false automatiskt (cron eller trigger).

Om show_countdown = true → visa dynamisk timer (dagar/timmar/minuter kvar).

Steg 4 – Boosta direkt (koppling)

Efter att en deal sparats:

“Vill du boosta denna deal i flödet Schyssta deals?”

Klick → öppnar Boost-modal:

Förinställd flödestyp: Schyssta deals

Förinställd produkt-id

Pris enligt boostprislista för deals

Kocken väljer platsnivå (Top-2 / 3+), period och startdatum.

Presentation på plattformen

1. Startsidan → Flöde “Schyssta deals”

Visar deals från alla kockar med is_discounted = true.

Sortera efter rabattstorlek (störst först) och giltighetstid.

Dealkort visar:

Bild

Produktnamn

Ordinarie pris (genomstruket)

Nytt pris

Rabattbadge (“🔥 –25%”)

Countdown-timer om show_countdown = true.

2. Kockens kökssida → knapp “Schyssta deals”

Visar kockens egna aktuella deals i samma kortformat.

Om inga aktiva: visa tomtext “Inga aktiva deals just nu”.

UX & design

Badge-färg: turkos #56c5c5

Rabattpris: grön #a1c798

Ordinarie pris: svart text med genomstrykning

Countdown: liten ikon ⏳ + turkos text

Kort: vit bakgrund, rundade hörn, skugga

Acceptanstest

✅ Kocken kan skapa, spara, redigera, stoppa deal.
✅ Timer kan aktiveras/avaktiveras.
✅ Deal visas i både startsidans och kockens flöde.
✅ Boostning fungerar och öppnar korrekt modal.
✅ Deal stängs automatiskt vid slutdatum.
✅ Layout följer färgtema.