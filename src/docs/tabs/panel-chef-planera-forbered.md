Instruktionsfil till Bolt – Fliken “Planera & förbered” (v2 – komplett)
🛑 VIKTIGT – GENERELLA REGLER

Använd alltid lov-view för att läsa befintliga filer innan du gör ändringar.

Gör minimala ändringar – ändra bara det som står här.

Om du ser import-relaterade fel: kontrollera att filerna finns och att routing är korrekt.

Bygg inte om något från början om det redan existerar.

Ändra ingenting utanför detta scope.

🎯 MÅL MED FLIKEN “PLANERA & FÖRBERED”

Denna flik är kockens allt-i-ett-verktyg för att:

Planera sin dags-, veckoplan och uppdrag.

Se sina missions visualiserade i dagskort (via “Mitt schema”).

Ställa in sin kapacitetsgräns (“ork”).

Få ett rent, enhetligt och tydligt gränssnitt för planering.

👉 Fliken ska kännas som en kökstavla – enkel, varm, organiserad.

📌 UNDERFLIKAR (i ordning)

Min planering

Mitt schema

Mina gränser

Ta bort alla tidigare felaktiga underflikar som:

“Utförande”

“Evenemangs-styrning”

“Rapporter”

“Inköpslistor”
…och liknande. Endast ovanstående tre ska existera.

1️⃣ UNDERFLIK: MIN PLANERING

Här ska kocken kunna skapa olika “missions”.

Visa fem block (kort eller knappar) – ENKEL layout, klickbar, kollapsar nedåt:

🍳 På spisen nu

🧊 Batch-tillagning

🚗 Utkörning

🎀 Event / Catering / Kockuppdrag

🛒 Inköp av mat ← NYTT

När kocken klickar på ett av blocken:
→ Öppnas en kollapsande flik (accordion) med formulär för att skapa ett mission.

🟢 Behåll existerande accordion-layout – ändra endast utseende & logik enligt nedan.

⚙ CORE LOGIK FÖR ALLA MISSIONS
Gemensamma fält:

Datum (obligatoriskt)

Tid eller start–slut (beroende på mission)

Noteringar (valfritt)

Färglogik – flikar

När minst ett mission är sparat i en flik → fliken ska få en färgad bakgrund:

Missiontyp	Färg (svag version)
På spisen nu	svagare #a1c798
Batch-tillagning	svagare #56c5c5
Utkörning	varm ljusgul
Event/Catering	varm ljusrosa
Inköp av mat	#f6f2e0

Lagra missions per kock, och kolla antal per typ för att styra färg.

Missionkort:

Missionslistan i varje flik ska ha vita kort med färgad border enligt ovan.

Då syns kategorin visuellt även i expand-läget.

🚫 ÖVERLAPPANDE REGLER

❗ Inga missions får överlappa varandra i tid (oavsett typ):

Om "Batch-tillagning" är 09:00–11:00 den 17 november
→ då ska man inte kunna skapa "Utkörning" samma tid.

✔ Man får planera flera av samma missiontyp samma dag, men inte med överlappande tider.

🔁 Vid försök att överlappa:
→ visa delikat felmeddelande, t.ex.:

❌ "Den här tiden krockar med ett annat uppdrag. Justera tiden."

🔄 STATUS & FEEDBACK

Visa tydlig feedback när ett mission sparas:

Grön ikon eller text “Sparad”

Alternativt en liten toast-notis

“Ej sparad” missions ska inte ha grön statusikon.

Gör det lätt att radera missions:

En “Ta bort”-knapp eller ikon på varje missionskort.

Bekräftelse → ta bort i DB → UI uppdateras direkt.

🧾 MODALER – VID KLICK PÅ MISSION I “MITT SCHEMA”

När man klickar på ett mission i “Mitt schema” → öppna en modal.
Innehåll och knappar ska variera beroende på missiontyp.

Typ	Visa i modal	Knappar längst ner
🍳 På spisen nu	Maträtt, antal portioner, tid, datum, bokade portioner	Inköpslista (#f6f2e0), Redigera (#a1c798), Ta bort (svart)
🧊 Batch-tillagning	Maträtter, tid, datum, antal portioner	Inköpslista, Fyll på i frysen (#56c5c5), Tillagat & klart (#a1c798), Ta bort
🚗 Utkörning	(Behåll nuvarande design)	(Redan korrekt)
🎀 Event/Catering	Typ (event/catering/kockuppdrag), tid, antal gäster, plats, maträtter	Mer info, Redigera, Ta bort
🛒 Inköp av mat	Datum, tid, recept, portionsantal, och sammanställd inköpslista (ingredient × antal) – checkboxar “Har hemma”	Inköpslista (#f6f2e0), Redigera (#a1c798), Ta bort (svart)

Modalens accentfärg ska matcha missiontypen (t.ex. border, header).

💾 MISSIONS-TABELLER OCH RECEPT (ENDAST OM DET SAKNAS)

Missiontyp "Inköp av mat" behöver en egen tabell om den inte redan finns:

create table if not exists kitchen_purchase_missions (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chefs(id) on delete cascade,
  recipe_id uuid,
  recipe_name text,
  portions integer,
  ingredients jsonb,
  planned_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


Hämta ingredienslistor från recepten och bygg inköpslistan så här:

summera per ingrediens, multiplicera med portionsantal

skapa lista med: Namn, Mängd, Enhet, Checkbox “har hemma”

tillåt ändring av mängder, borttagning eller tillägg av rader

2️⃣ UNDERFLIK: MITT SCHEMA

Automatiskt schema för veckan – visar missions per dag.

Varje mission ska visas som ett litet färgat kort (full färg):

På spisen nu – #a1c798

Batch-tillagning – #56c5c5

Utkörning – gul

Event/Catering – rosa

Inköp av mat – #f6f2e0

🟢 Klick → öppna modal enligt specifikationen ovan.

🛑 Mockdata i korten ska tas bort helt. Endast data från Supabase får användas.

3️⃣ UNDERFLIK: MINA GRÄNSER

Här sätter kocken sin ork (ex. max missions eller antal portioner per dag).
Finns ingen förändring i denna fil just nu.

🧪 EFTER ÄNDRINGAR → TEST CHECKLISTA

Skapa minst 1 mission av varje typ.

Flikar får färg när minst 1 mission finns.

Missions visas korrekt på “Mitt schema”.

Krockande tider blockeras och ger fel.

“Ta bort” tar bort både från Planering & Schema.

Modal visar korrekt innehåll & knappar beroende på missiontype.

Inköpslista genereras korrekt.

Inga mockdata syns längre.