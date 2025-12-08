# Mitt kök–inställningar (huvudflik)

## Syfte
Här hanterar kocken alla grundinställningar för sitt kök: hur profilen visas utåt, öppettider, leveransalternativ, betalning, medlemsnivå och provisioner.

## Underflikar (ordning)
1. Visa mitt kök  
2. Köksinfo  
3. Kontaktuppgifter  
4. Öppettider  
5. Leveranssätt  
6. Bank & Företag  
7. Medlemskap & Provision

## Funktion per underflik
### 1. Visa mitt kök
- Förhandsvisning av kockens publika profilsida (som kunder ser).  
- Visar profilbild, banner, beskrivning, video, produkter och betyg.  
- “Uppdatera info”-knapp leder till respektive underflik.  
- Ingen redigering här.

### 2. Köksinfo
- Fält: Kökets namn, Beskrivning, Profilbild, Bannerbild, Välkomstvideo.  
- Validering: namn 2–60 tecken, minst en bild krävs.  
- Preview direkt vid uppladdning.

### 3. Kontaktuppgifter
- Fält: Adress, Postnummer, Ort, Telefon, E-post, Sociala medier (Instagram, TikTok, Facebook).  
- Visa på kartvy (Mapbox).  
- Tillåt fritext för “Övrig kontaktinformation”.

### 4. Öppettider
- Sätt öppet/stängt per veckodag.  
- Lägg till avvikande datum (t.ex. helgdagar).  
- Mini-kalender där kocken markerar datum som “fullbokat / öppet / stängt”.  
- Kundens beställningsvy ska visa dessa statusar.

### 5. Leveranssätt
- Välj: Upphämtning, Utkörning eller Både och.  
- Vid utkörning: ställ in maxavstånd (km) och pris per avstånd.  
- Fritextfält: “Kommentar till kunder” (t.ex. leveransvillkor).  
- Visa tydlig lista över aktiva leveranssätt.

### 6. Bank & Företag
- Ange: F-skatt eller Egenanställningsföretag (t.ex. Frilans Finans).  
- Vid F-skatt: org.nr, företagsnamn, kontonummer (IBAN, Swish, Klarna).  
- Vid egenanställning: välj företag ur lista + ID-nummer.  
- Validering att minst ett giltigt alternativ finns innan försäljning aktiveras.

### 7. Medlemskap & Provision
- Visa aktuell medlemsnivå (Free/Silver/Guld) och kostnad.  
- Möjlighet att uppgradera eller nedgradera medlemskap.  
- Fakta om vad varje nivå innehåller.  
- Visa aktuell provision (%), tidigare provisioner, tillfälliga kampanjprovisioner.  
- Sektion “Återbetalning av livsmedelsregistrering via provision” + “Så funkar det”.

## Routes & komponenter
- Base route: `/chef/settings`
- Subroutes:
  - `/chef/settings/preview` → `<KitchenPreviewTab />`
  - `/chef/settings/info` → `<KitchenInfoTab />`
  - `/chef/settings/contact` → `<KitchenContactTab />`
  - `/chef/settings/hours` → `<KitchenHoursTab />`
  - `/chef/settings/delivery` → `<KitchenDeliveryTab />`
  - `/chef/settings/banking` → `<KitchenBankTab />`
  - `/chef/settings/membership` → `<KitchenMembershipTab />`

## UI-regler
- Vänsterställd tabb-list utan ikoner.  
- Aktiv flik markeras med färg `#fcc4d9`.  
- Spara-knapp disabled tills ändringar upptäcks.  
- “Sparat”-toast efter lyckad uppdatering.

## Datakällor
- `kitchens`, `profiles`, `opening_hours`, `delivery_options`, `payout_accounts`, `memberships`, `provision_history`  
- RLS: endast kockens eget `user_id` får läsa/skriva.

## QA-punkter
- Alla underflikar laddar utan spinner-häng.  
- Navigering bevarar osparade fält med varning.  
- Felaktig access (403) → redirect till login.  
- Ändring sparas och visas korrekt på “Visa mitt kök”.

## Instruktion till Bolt
1. Använd **lov-view** innan ändringar.  
2. Kontrollera routing i `ChefSettingsRoutes.tsx`.  
3. Lös endast fel kopplade till denna flik.  
4. Gör minimala ändringar, inga refactors.
