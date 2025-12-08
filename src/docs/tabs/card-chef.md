# Kortspecifikation – Kockvyn (TKMMDI)

Detta dokument definierar utseende, beteende och funktion för alla **kort i kockpanelen**.  
Korten ger kocken översikt över rätter, kampanjer, evenemang, tävlingar, beställningar och statistik.

---

## 🍲 PRODUKTKORT (Mina maträtter)

### 🎨 Layout & innehåll
1. **Bild (4:3)** + 📸-indikator om fler bilder finns + badge: “Aktiv”, “Pausad”, “Slut”, “Dold”, “Kort datum”, “Ny”
2. **Info:** Titel (fet), Pris, ev. Paketpris, Kategori, Betyg
3. **Statusrad:** Tillagningspass aktivt, Portioner i frys, Prenumeration aktiv (ja/nej)
4. **Actions:** ✏️ Redigera · 📦 Duplicera · 👁️ Visa · 🚫 Dölj/Återaktivera · 🗑️ Ta bort · 📊 Statistik
5. **Snabbdata:** Visningar 30d, Köp, Snittbetyg, Intäkter (Guld), Trend

### ⚙️ Datakopplingar
- `dishes`, `chef_schedule`, `orders`, `reviews`
- Status: `is_visible`, `stock_remaining`
- Statistik: `dish_views`, `orders`, `avg(reviews.rating)`

---

## 💥 KAMPANJKORT (Deals)

### 🎨 Layout
- Bild (4:3), Titel (fet), Kort beskrivning  
- Rabatt/typ (badge, orange #ff8a00)  
- Giltighet (start–slut)  
- **Nedräkning (valbar toggle)** → countdown till `ends_at`
- Status: Aktiv / Planerad / Avslutad  
- Knappar: Visa detaljer · Redigera · Avsluta · Statistik

### 📊 Statistik
- Visningar, Köp under kampanj, Konvertering, Omsättning, Toppsäljare

### ⚙️ Datakopplingar
- `promotions(title, discount_percent, starts_at, ends_at, views, sales_count)`
- `show_countdown: boolean` (nytt fält)

---

## 🎉 EVENEMANGSKORT (Event)

### 🎨 Layout
- Bild/thumbnail, Titel (fet), Datum/tid, Plats  
- **Pris** (tal eller “Gratis”)  
- Platser: `bokade / totalt` + **badge “Fullbokat”** vid fullt  
- **Nedräkning (valbar toggle)** → countdown till `start_time`
- **Deltagarstatus (för startsidan):** “X kommer · Y kanske”  
- Knappar: Redigera · Visa deltagare · Avbryt · Kommentarer · Statistik

### 📊 Statistik
- Deltagare totalt, Eventintäkter, Kommentarer, Medelbetyg (om aktivt)

### ⚙️ Datakopplingar
- `events(title, description, price, location, start_time, end_time, seats_total, seats_booked)`
- `event_bookings(status in ['yes','maybe'])` → räknar **Kommer/Kanske**
- `show_countdown: boolean`
- Extra toggles: “Gratis event”, “Tillåt Kommer/Kanske”, “Visa Kommer/Kanske på startsidan”

---

## 🏆 TÄVLINGSKORT (Contests)

### 🎨 Layout
- Bild/banner, Titel (fet), Beskrivning, Deadline (countdown), Pris (“Kitchenpoäng”), Deltagare, Status
- Knappar: Visa tävling · Visa deltagare · Statistik

### 📊 Statistik
- Deltagare totalt, Kockar som deltar, Röster (om voting), Engagemang, Placering (Guld)

### ⚙️ Datakopplingar
- `contests`, `contest_entries`, `contest_comments`
- Countdown → `deadline_at`

---

## 📦 BESTÄLLNINGSKORT (Orders)

### 🎨 Layout
- Kund, Maträtt, Datum/tid  
- Status: “Under tillagning” / “Redo” / “Utkörd” / “Slutförd”  
- Knappar: Visa detaljer · Kontakta kund · Markera som klar · Problemrapport

### ⚙️ Datakopplingar
- `orders`, `customers`

---

## 📊 STATISTIKKORT

### 🎨 Layout
- Rubrik (ex. Försäljning, Visningar, Betyg, Kunder, Eventintäkter)
- Huvudvärde + underrad “Senaste 30 dagarna”
- Mini-graf (trend)
- Klick öppnar detaljerad vy

---

## 🧭 GEMENSAMT (alla kockkort)

| Funktion | Beskrivning |
|---|---|
| Status-badge | Aktiv · Pausad · Avslutad |
| Hover-info | Snabbdata (lager, visningar etc.) |
| Redigera | Modal eller separat vy |
| Statistik | Mini-panel eller full vy |
| Auto-hide | Dölj irrelevanta kort |
| Färgkodning | Grön=aktiv · Grå=pausad · Röd=avslutad |
| **Countdown** | Toggle i Deals & Event |
| **Pris (Event)** | Nummerfält eller “Gratis” |
| **Kommer/Kanske (Event)** | Räknas från `event_bookings` och visas även på startsidan |

---

## ⚙️ NIVÅSTYRNING (Free/Silver/Guld)

| Funktion | Free | Silver | Guld |
|---|---|---|---|
| Visningar | ✅ | ✅ | ✅ |
| Försäljning | ✅ | ✅ | ✅ |
| Intäkter | ❌ | ✅ | ✅ |
| Trender/grafer | ❌ | ❌ | ✅ |
| Export | ❌ | ❌ | ✅ |
| Kampanjer | ❌ | ✅ | ✅ |
| Event | ❌ | ✅ | ✅ |
| Tävlingar | ❌ | ❌ | ✅ |

---

## 🧩 KOMPONENTER

| Korttyp | Komponent |
|---|---|
| Produkt | `ChefDishCard` |
| Kampanj | `ChefDealCard` |
| Event | `ChefEventCard` |
| Tävling | `ChefContestCard` |
| Order | `ChefOrderCard` |
| Statistik | `ChefStatsCard` |

---

## 📱 RESPONSIVITET
- Mobil: en kolumn, nyckelinfo först  
- Tablet: två kolumner  
- Desktop: 3–4 kolumner  
- Hover visar dolda actions  
- Knappar staplas på mobil, i rad på desktop
