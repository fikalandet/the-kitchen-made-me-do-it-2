# Kortspecifikation – Kundvyn (TKMMDI)

Definierar utseende, beteende och funktion för alla produktkort i **kundvyn**.  
Används i startsidans flöden (rätter, deals, events, tävlingar).  
Alla kort stöder Gilla, Dela, Favorit och Kommentar där det är aktivt.

---

## 🧱 STANDARDKORT FÖR MATRÄTT

### 🎨 Layout & innehåll
1. **Bild (4:3)** + 📸-ikon om fler bilder finns  
   - Badge: “Ny”, “Vegansk”, “GF”, “Kort datum”, “Populär”  
   - Rund **kock-avatar (64 px)** nere till vänster över bilden
2. **Betyg** (5 stjärnor under bilden)
3. **Titel & pris** – samma rad (flex-row justify-between items-center)
4. **Prenumerations-badge** – #56c5c5 “Prenumerera – {platser_kvar} kvar” om tillgängligt
5. **Tillgänglighetssektion**
   - “🧊 I frysen” + antal
   - **Förbeställ** (kalender)
   - **Prenumerera** (öppnar flöde)
6. **Leveransrad**
   - “Upphämtning” + “Utkörning” horisontellt, centrerat
   - Ikon + tider + avgift (vid utkörning)
7. **Knapprad**
   - “Mer info” och **“Köp/Boka”** – horisontellt centrerade nederst
8. **Sociala ikoner**
   - Dela · Favorit (centrerade, med tooltip/aria)

---

### 🛒 Köp/Boka-flöde
0. Välj “Boka datum” (kalender) eller “Köp nu” (tider som visas)
1. Portionsstorlek
2. Fryst/Uppvärmd
3. Leveransmetod (upph./utkörn.)
4. Tid inom valt datum eller befintligt intervall
5. Bekräftelse (pris + avgifter)

---

## 🍳 PÅ SPISEN NU
Som standardkort men utan tillgänglighetssektion.  
Visar datum, tider, antal kvar, hämtning/utkörning.  
Prenumerations-pill (#56c5c5) under priset.

---

## ⏰ BRÅTTOMKÄK
Som standardkort utan tillgänglighetssektion.  
Visar rabatt-badge (orange #ff8a00), kort datum, antal kvar.  
Prenumerations-pill om platser finns.

---

## 💥 SCHYSSTA DEALS
- Rabatt-badge orange #ff8a00  
- Countdown till `ends_at`  
- Ordinarie pris överstruket, nytt pris rött/orange  
- “Antal kvar till detta pris”  
- **Köp nu**, Dela, Favorit

---

## 🎉 EVENEMANG
- Bild/video-thumbnail  
- Datum/tid-badge  
- Titel, beskrivning, plats, **pris**  
- Deltagarstatus: “X kommer · Y kanske”  
- “Mer info”, “Boka plats”, “Kommentera”, Dela, Favorit  
- Countdown (valfritt)  
- Badge “Fullbokat”

---

## 🏆 TÄVLINGAR
- Bild/banner  
- Countdown till `deadline_at`  
- Titel, beskrivning, pris (“Kitchenpoäng”)  
- Delta · Visa deltagare · Kommentera · Dela · Favorit  
- Badge “Avslutad” efter deadline

---

## 🚚 GEMENSAM LEVERANSLOGIK
- Upphämtning om aktivt i kockprofil  
- Utkörning om aktivt (avgift = distans × taxa)
- Auto-hide ej tillgängliga val

---

## ⭐ GEMENSAMMA ELEMENT
- Kock-avatar 64 px rund nere till vänster över bilden  
- Pris + namn på samma rad, högerjusterat  
- Upphämtning/Utkörning horisontellt, centrerat  
- “Mer info” + “Köp/Boka” centrerade nederst  
- Tooltip + aria på Dela/Favorit/Kommentera  
- Countdown i Deals, Bråttomkäk, Tävlingar (ev. Evenemang)  
- Auto-hide tomma kort  

---

## 📦 DATAKOPPLINGAR
`dishes`, `chef_schedule`, `orders`, `subscriptions_plans`, `promotions`,  
`events`, `event_bookings`, `event_comments`, `contests`, `reviews`, `favorites`, `likes`

Prenumeration: `seats_left = plan.capacity - plan.subscribers_count`  
Visa pill om `seats_left > 0`.

---

## ⚙️ ADMIN-REDIGERBART
- Visa prenumerations-badge (på/av, textmall)  
- Countdown (på/av per flöde)  
- Visa betyg (på/av)  
- Antal kort per rad  
- Färgtema per flöde  
- Rubriker & underrader redigerbara

---

## 🧩 KOMPONENTER
| Typ | Komponent |
|------|-----------|
| Standard | `DishCard` |
| På spisen nu | `LiveDishCard` |
| Bråttomkäk | `UrgentDishCard` |
| Deals | `DealCard` |
| Evenemang | `EventCard` |
| Tävlingar | `ContestCard` |

---

## 📱 RESPONSIVITET
- Mobil: 1 kolumn  
- Tablet: 2 kolumner  
- Desktop: 3–4 kolumner  
- Knappar vertikalt på mobil, horisontellt på desktop

---

## 🔮 KOMMANDE VERSIONER
- “Visa liknande rätter” i Mer info  
- “Lägg till i matkasse”  
- “Följ kocken”  
- Dynamisk etikett: “Ny vecka – Ny smak”
