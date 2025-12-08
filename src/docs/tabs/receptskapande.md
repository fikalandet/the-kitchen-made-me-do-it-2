Instruktion för skapande av recept

Syfte:
Denna fil definierar funktioner, fält och inställningar som ska finnas när en kock skapar ett nytt recept via
Min försäljning → Översikt → +Skapa ny produkt → Recept.

Bolt ska inte bygga om något, utan endast säkerställa att funktionerna finns och beter sig enligt denna specifikation.
All routing och datahantering ska behållas.

🧱 Receptmallar

När kocken väljer att skapa ett nytt recept ska hen få möjlighet att välja en mall att utgå ifrån.

Gratis-kockar: ingen mall tillgänglig.

Silver-kockar: tillgång till 10 receptmallar.

Guld-kockar: tillgång till 20 receptmallar.

Receptmallarna kan innehålla förifyllda sektioner, layout eller exempeltexter (t.ex. “Middag för två”, “Barnvänligt”, “Snabbt & enkelt”).
Kocken kan alltid redigera allt innehåll i mallen efter att den valts.

Om kocken erbjuder recept till försäljning ska dessa visas under knappen “Recept & videos” på kökssidan (Visa mitt kök).

🧾 Grundinformation
Fält	Typ	Beskrivning
När kocken väljer Produkttyp: Recept i skapaflödet ska fältet “Produktnamn” automatiskt byta namn till “Recepttitel”.
Duplicerat fält längre ner i formuläret tas bort för att undvika förvirring.

Och under sektionen Mattyp, Huvudingredienser, Matkultur, Tillagningssätt, Matpreferenser,
lägg till en mening i slutet:

Alternativen i dessa fält ska vara identiska med dem som används när kocken skapar en maträtt, eftersom de kopplas till sök- och filtreringssystemet på startsidan.
Recepttitel	Text	Namn på rätten. Kort, tydlig, lockande.
Kategori	Dropdown	Förrätt, Huvudrätt, Efterrätt, Dryck, Veganskt, etc.
Mattyp	Dropdown	T.ex. Soppa, Gryta, Sallad, Smårätt, Dessert.
Huvudingredienser	Flera valbara	Ex. Kyckling, Fisk, Nötkött, Tofu, Svamp, Baljväxter.
Matkultur	Dropdown	Svenskt, Italienskt, Asiatisk fusion, Medelhav, Afrikanskt, Sydamerikanskt etc.
Tillagningssätt	Dropdown	Stekt, Ugnsbakad, Grillad, Rå, Sous vide, Friterad etc.
Matpreferenser	Flera valbara	Glutenfri, Laktosfri, Vegansk, Vegetarisk, Proteinrik, Lågkolhydrat, Barnvänlig etc.
Beskrivning / Story	Textfält	Kort text om receptets bakgrund eller känsla.
Svårighetsgrad	Väljare	Enkel / Medel / Avancerad
Tillagningstid	Numeriskt	I minuter eller timmar.
Antal portioner	Numeriskt	Standard: 4
Pris (vid försäljning)	Numeriskt	Valfritt – endast vid premiumrecept.
Synlighet	Checkbox	“Synligt för alla” eller “Endast utkast”.
🥣 Ingredienser

Kocken kan lägga till obegränsat antal ingredienser.
Varje rad innehåller:

Fält	Typ	Exempel
Mängd	Text/numeriskt	2 dl, 1 msk, 300 g
Enhet	Dropdown	g, ml, msk, tsk, st
Ingrediens	Text + autokomplettering	Smör, Ägg, Vetemjöl
Kategori (valfritt)	Dropdown	Bas, Grönsak, Kött, Krydda
Kommentar / tillval	Text	“Rumsvarmt”, “ekologiskt”, “kan bytas mot olivolja”

➡️ Kopplas till ingrediensdatabasen för autokomplettering, näringsdata och allergeninfo.

👨‍🍳 Steg-för-steg-instruktioner

Kocken kan lägga till flera steg:

Fält	Typ	Exempel
Stegnummer	Automatisk	1, 2, 3 …
Instruktion	Textfält	“Smält smöret och vispa ner mjölet.”
Bild eller video	Uppladdning	(Valfritt) bild på momentet.
Tidsangivelse per steg	Numeriskt	“5 min”
Tips / varning	Textfält	“Rör inte för länge – då blir det segt.”
🍎 Näringsvärden (valfritt)

Om kopplat till ingrediensdatabas fylls dessa automatiskt, men kan justeras:

Värde	Enhet
Energi	kcal per portion
Protein	g
Fett	g
Kolhydrater	g
Fiber	g
Socker	g
Salt	g
⚠️ Allergener (EU:s 14 lagstadgade)

Kocken ska kunna markera vilka allergener som ingår.
Listan ska följa EU:s officiella allergenlista:

Spannmål som innehåller gluten (vete, råg, korn, havre m.fl.)

Skaldjur

Ägg

Fisk

Jordnötter

Sojabönor

Mjölk (inkl. laktos)

Nötter (mandel, hassel, valnöt, cashew, pecan, paranöt, pistasch, macadamia)

Selleri

Senap

Sesamfrön

Svaveldioxid och sulfit (>10 mg/kg)

Lupin

Blötdjur (musslor, sniglar, ostron etc.)

Kocken markerar via checkboxar; dessa visas som allergenikoner på receptsidan.

📸 Media & presentation
Fält	Typ	Beskrivning
Huvudbild	Uppladdning	Visas i receptlistan.
Extra bilder	Flera uppladdningar	För steg eller presentation.
Video (valfritt)	Uppladdning	Maxlängd 60 sekunder.
Thumbnail / miniatyr	Automatgenereras	Används i listor och flöden.
🏷️ Taggar & metadata
Fält	Typ	Exempel
Taggar / nyckelord	Flera textfält	“snabbt”, “billigt”, “barnvänligt”
Säsong / tema	Dropdown	Jul, Sommar, Höst, etc.
Passar till	Dropdown	Lunch, Middag, Fika, Buffé

Fälten för Mattyp, Huvudingredienser, Matkultur, Tillagningssätt och Matpreferenser ska kopplas till sök- och filtreringssystemet på startsidan (Hero-sektion → kort “Recept”) så att kunder kan filtrera recept utifrån dessa.

💬 Interaktivitet & publicering
Funktion	Beskrivning
Förhandsgranskning av recept	Kocken kan öppna en förhandsvisning av receptet innan publicering.
Dela	Möjlighet att dela direkt till sociala medier.
Publicera / Spara som utkast	Två separata knappar.
Kommentarer	Kan tillåtas eller stängas av per recept.
🧠 AI-assistans (framtida tillägg)

Förslag på ingredienser och mängder.

Automatiska steg baserat på råvaror.

Näringsvärde-beräkning via ingrediensdatabas.

Generering av rubrik och kort beskrivning.

✅ Viktigt

Ändra inget i befintlig routing.

Recepten ska visas under “Recept & videos” på Visa mitt kök.

Denna fil fungerar som referensspecifikation för receptskapande och publicering.