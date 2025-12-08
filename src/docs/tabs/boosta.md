Build spec: Chefpanel – Boosting (Marknadsföring + Min försäljning)
Mål

Implementera en komplett Boost-funktion för kockar som låter dem:

Välja vad som boostas (produkt/event/tävling/kockprofil).

Välja var det ska synas (flöde), platsnivå (Top-2 eller 3+) och period (vardag 1 dygn, mån–tors, fre, lör, sön, fre–sön).

Se pris, medlemsrabatt, behörighetskrav och regler (ålder, betyg, rabatt osv).

Betala & schemalägga samt hantera sina boostar.

Ingångar (routing & UI)

Kockpanel → Marknadsföring → Boosta

Route: /chef/marketing/boost

Sida: “Boosta” (stegvis UI, se nedan).

Kockpanel → Min försäljning → Översikt → tabell “Alla produkter” → kolumn Åtgärder (…/rullgardin) → “Boosta”

Action öppnar modal “Boosta denna produkt” med förifyllt val i steg 1 och länk “Öppna full boost-sida” → /chef/marketing/boost?productId=....

Stegvis UI (sida & modal)

Steg 1: Vad ska boostas

Tabs: Produkt | Kockprofil | Event | Tävling

Produkt: filter/sök + kort (Titel, Typ, badges: Ny ≤30d, ≥4★, Deal, Smaketikett, Video).

Kockprofil: visa kockens profil.

Event/Tävling: lista kockens event/tävlingar.

Steg 2: Var ska det synas (flöden)

Checkbox-lista. Endast giltiga/behöriga val är klickbara (övriga disabled med tooltip varför).

Steg 3: Plats & Period

Platsnivå: Top-2 eller Plats 3+

Period: 1 vardagsdygn (mån–tors) | mån–tors | fredag | lördag | söndag | fre–sön

Startdatum: datepicker (Europe/Stockholm). Lås till kommande giltiga datum.

Steg 4: Pris & Medlemskap

Visa pris per val (summa) + Silver −10%, Guld −20%; momsinfo.

Varningar/krav (t.ex. “Äldre än 30 dagar → ej tillåtet i Nytt på menyn”).

Steg 5: Förhandsgranskning

Visa kort hur det renderas i vald sektion + badge “Top-2” eller “3+”.

Steg 6: Betalning & bekräftelse

Knapp: Köp & schemalägg.

Kvitto/ordernr + länk till “Mina boostar”.

Mina boostar (tab på sidan):

Tabell: Objekt, Flöde, Plats, Period, Start, Status (schemalagd/aktiv/avslutad), Pris, Kvitto.

Åtgärder: Avboka kommande (policy nedan), Duplicera, Ändra datum (om ledigt).

Regler per flöde (eligibility)

PA_SPISEN (På spisen nu): endast dish.

BRATTOMKAK (Bråttomkäk): dish | meal_bag | diy_kit.

NYTT (Nytt på menyn): dish | meal_bag | diy_kit AND created_at ≤ 30 dagar.

POPULART (Populärt käk): dish AND avg_rating ≥ 4.0 AND num_reviews ≥ 3.

KYLSKAP (Kylskåpsmeny): meal_bag | diy_kit | subscription.

DEALS (Schyssta deals): vilken typ som helst AND is_discounted = true.

EVENT (Evenemang): event only.

SMAKETIKETTER (Smaketiketter): dish | meal_bag AND has_taste_tag = true AND membership ≥ silver.

TAVLINGAR (Tävlingar): competition only AND membership = gold.

TJUVKIK (Tjuvkik i köket): video only AND membership ≥ silver.

VECKANS_KOCKAR: chef_profile.

Slots, kapacitet & konflikter

Varje flöde har Top-2 = max 2 objekt per dag. Plats 3+ = obegränsat.

Period → datointervall i Sweden TZ. Lagra UTC, visa Europe/Stockholm.

Bokningsregel: först betald vinner.

Konflikt: om Top-2 full → visa alternativ: (a) närmaste lediga dag, (b) nedgradera till 3+ (re-price), (c) byt flöde.

Avbokning (policy): gratis ≥24h innan start, annars ingen återbetalning (kan parameterstyras).

Priser (defaults + seed)

Standardpriser för alla flöden med slots (om inget annat angetts):

weekday_1day (mån–tors): Top-2: 49, 3+: 29

mon_thu: Top-2: 149, 3+: 99

friday: Top-2: 79, 3+: 49

saturday: Top-2: 99, 3+: 59

sunday: Top-2: 99, 3+: 59

fri_sun: Top-2: 249, 3+: 149

Följ dessa nivåer för: Evenemang, Schyssta deals, Tävlingar, Veckans kockar (profil).
(För “På spisen nu”, “Populärt”, “Bråttomkäk”, “Kylskåpsmeny”, “Nytt på menyn”, “Hälsokäk”, “En sked för mamma”, “Tjuvkik i köket” – använd dina befintliga priser. Om saknas i DB, fallback till default ovan.)

Kock i fokus (reportage) – separat editorial produkt (utan slots):

reportage_week (mån–tors): 399 SEK

reportage_weekend (fre–sön): 599 SEK

Medlemsrabatter:

free: 0%, silver: 10%, gold: 20% (tillämpas på totalsumma).

Sociala medier-paket (era kanaler)

IG/FB Inlägg/Reels: Prime 149 / Mellan 99 / Off-peak 49

IG/FB Stories: Prime 99 / Mellan 69 / Off-peak 39

TikTok Video/Reel: Prime 249 / Mellan 149 / Off-peak 99

Volymtillägg 4–10 media: +50

Addon länk/pin 24h: +49

Medlemsbonus: Silver −10% + 1 gratis Off-peak/story/mån; Guld −20% + 1 gratis Mellantid IG-inlägg + 1 gratis TikTok Off-peak/mån.

Databas (Skapa om saknas)

feeds

id (pk, text) — ex: PA_SPISEN, BRATTOMKAK, NYTT, POPULART, KYLSKAP, DEALS, EVENT, SMAKETIKETTER, TAVLINGAR, TJUVKIK, VECKANS_KOCKAR, KOCK_I_FOKUS

title, description

requires_membership enum: none|silver|gold

allowed_types jsonb

extra_rules jsonb (ex: { "max_age_days":30, "min_rating":4.0, "min_reviews":3 })

boost_products (objekt som kan boostas)

id (uuid pk)

type enum: dish|meal_bag|diy_kit|recipe|subscription|catering|hire_me|video|event|competition|chef_profile

ref_id (uuid/text, fk mot respektive tabell där det finns)

chef_id (uuid fk profiles)

boost_orders

id (uuid pk)

chef_id fk

status enum: pending|paid|cancelled|refunded

amount numeric, currency text (SEK)

membership_level_at_purchase enum: free|silver|gold

created_at timestamptz default now()

boost_reservations (en rad per flöde/dag/slot)

id (uuid pk), order_id fk, product_id fk, feed_id fk

slot_tier enum: top2|slot3plus

period_type enum: weekday_1day|mon_thu|friday|saturday|sunday|fri_sun

start_date date, end_date date

status enum: scheduled|active|completed|cancelled

Index: (feed_id,start_date,slot_tier), (product_id,status)

feed_slot_caps

feed_id, slot_tier, max_per_day (Top-2 = 2, 3+ = null/0 = obegränsat)

prices

id pk, feed_id, period_type, slot_tier, price_sek numeric, active bool

membership_discounts

level enum: free|silver|gold, boost_discount_pct numeric

ratings_summary (vy/agg)

product_id, avg_rating numeric, num_reviews int

product_meta (komplement om saknas)

product_id, created_at timestamptz, is_discounted bool, has_taste_tag bool, is_video bool

RLS (kärnprinciper)

Kock får endast se/boosta egna objekt: chef_id = auth.uid() via profiles.

Insert på boost_reservations kräver:

medlemsnivå uppfyller feeds.requires_membership

type ∈ allowed_types

extra_rules (ålder, betyg, rabatt, video) passerar validering (se RPC).

Slot-kapacitet: avvisa insert om top2 redan har >= max_per_day för (feed_id, date).

RPC (serversida – specifikation)

Skapa en RPC: create_boost_reservations(product_id uuid, feed_id text, slot_tier text, period_type text, start_date date) returns jsonb som:

Hämtar chef_id och medlemsnivå för aktuell user.

Validerar eligibility mot feeds + product_meta + ratings_summary.

Normaliserar datumintervall utifrån period_type (Europe/Stockholm → konvertera till UTC för lagring).

Kontrollerar slot-kapacitet per dag (för top2), annars föreslår alternativ.

Beräknar pris: sum(prices) × antal dagar × (1 − medlemsrabatt).

Skapar boost_orders (pending) + boost_reservations (scheduled) och returnerar breakdown (prislista, ev. varningar).

Betalningsflöde kopplar om ordern till paid → reservationer förblir scheduled.

Konflikthantering & fallback

Om top2 fullt: returnera suggestions: {next_free_date, allow_downgrade_to_3plus}; UI ska visa val.

Om pris saknas i prices: använd defaulttabellen ovan.

Om objekt tappar eligibility (t.ex. rabatt upphör mitt i period): visa regel “låsa rabatt under period” eller pro-rata avbokning (config-flagga).

Policies (text i UI)

“Avbokning: kostnadsfritt ≥24h innan start. <24h: ingen återbetalning.”

“Tidszon: alla tider visas i Europe/Stockholm; lagras i UTC.”

“Top-2 garanterar position 1–2; 3+ garanterar listning men ej exakt position.”

Acceptanskriterier (snabbtest)

Kan starta boosting från båda ingångarna.

Otillåtna flöden är disabled med tydlig förklaring.

Nytt på menyn blockerar objekt >30 dagar; Populärt kräver ≥4.0 & ≥3 reviews.

Top-2 begränsas till 2 per dag/flöde.

Pris beräknas korrekt, med medlemsrabatt.

Preview visar korrekt “Top-2” eller “3+”.

“Mina boostar” listar, kan avboka framtida, duplicera, byta datum (om ledigt).

Kör! Använd Tailwind, tydliga kort/badges, stepper-UI. Lagra allt i Supabase, skapa tabeller om saknas, och implementera den lilla modalen för “Boosta” på produktlistan (Min försäljning → Översikt).

Design & Färgtema (obligatoriskt)

Hela sidan ska följa vårt färgsystem:

Huvudfärger:

Grön: #a1c798 → används som primär bakgrundsfärg på knappar, rubriker, highlights.

Beige: #f6f2e0 → används som huvudbakgrund på sidor och sektioner.

Kompletterande färger:

Turkos: #56c5c5 → används till sekundära knappar, länkar, ikoner och accentdetaljer.

Svart: #000000 → används till text på ljusa bakgrunder.

Vitt: #ffffff → används till kort, textfält och ytor med innehåll (t.ex. produktkort, formulär).

Stilregler:

Layout ska kännas ljus, ren och luftig.

Alla kort ska ha vit bakgrund, mjuk skugga och rundade hörn (rounded-2xl).

Använd grön för primära knappar, turkos för sekundära.

Text ska vara svart på ljus bakgrund, vit på knappar.

Ingen annan färg får användas.

Samma färgsättning ska gälla både för Boost-sidan och Boost-modalen under "Min försäljning".