Instruktion för produkttyper och formulär

Syfte:
Denna fil definierar vad varje produkttyp ska innehålla i formuläret Min försäljning → Översikt → +Skapa ny produkt.
Bolt ska inte bygga om det befintliga flödet, utan endast säkerställa att rätt fält, logik och struktur finns för varje typ.

Alla produkter ska kunna hanteras via samma grundsystem för försäljning, publicering, synlighet och statistik.

👨‍🍳 Produkttyp: Hyra kock

Syfte:
Kunden hyr kocken för privat tillställning, event eller middag hemma.

Fält	Typ	Beskrivning
Tjänstetitel	Text	Ex. “Hemma hos-middag med 3 rätter”
Typ av tillfälle	Dropdown	Middag, Fest, Bröllop, Företagsevent, Annat
Antal gäster (min–max)	Numeriskt	För kapacitetsplanering
Prisstruktur	Alternativ	Pris per person / fast totalpris
Plats	Text / karta	Adress eller område (t.ex. “inom 2 mil från Stockholm”)
Tillgång till kök	Checkbox	Kunden har kök / Kocken tar med utrustning
Menyalternativ / exempelmeny	Textfält	Kocken kan lägga in menyförslag
Allergener / anpassning	Checkboxar	Samma EU-allergener som i recept
Tidsåtgång	Text	Ex. “Ca 4 timmar inklusive servering”
Förberedelser / krav	Text	Ex. “Tillgång till ugn och rinnande vatten krävs”
Tillval	Checkbox	Ex: dryckespaket, dessert, dukning
Resekostnad	Numeriskt	Pris per km eller fast avgift
Tillgängliga datum	Datumväljare	Kocken kan ange specifika dagar
Kontaktmöjlighet	Automatisk	Kunden kan skicka förfrågan via meddelandesystemet
🍽️ Produkttyp: Catering

Syfte:
Kocken erbjuder färdiglagad mat till grupper, företag eller event.

Fält	Typ	Beskrivning
Cateringtitel	Text	Ex. “Buffé med smaker från Medelhavet”
Typ av catering	Dropdown	Buffé, Lunchlådor, Plockmat, Fika, Dryck, Annat
Antal portioner (min–max)	Numeriskt	Standardintervall
Pris per portion / person	Numeriskt	
Menyalternativ	Textfält	Lista över rätter, ingredienser, alternativ
Leveranstyp	Checkbox	Upphämtning / Utkörning
Utkörningskostnad	Numeriskt	Per km eller fastpris
Förbeställningstid	Numeriskt	Antal dagar i förväg
Allergener / märkning	Checkboxar	EU-allergener
Förpackning / servering	Textfält	Hur maten levereras
Tillval	Text / lista	Ex. dryck, efterrätt, extra portioner
Tillgängliga datum	Datumväljare	
Kontaktknapp	Automatisk	“Skicka förfrågan” via meddelandesystemet
🎥 Produkttyp: Matlagningsvideos

Syfte:
Kocken säljer eller delar instruktionsvideos – digitala matlagningslektioner eller tipsfilmer.

Fält	Typ	Beskrivning
Videotitel	Text	Namn på videon
Videotyp	Dropdown	Tipsvideo, Instruktion, Receptvideo, Kurs
Beskrivning / innehåll	Textfält	Kort presentation av videon
Video-uppladdning / länk	Uppladdning eller URL	Direkt fil eller inbäddad video (YouTube, Vimeo)
Videolängd (minuter)	Numeriskt	
Pris (vid försäljning)	Numeriskt	Valfritt – gratis eller betald
Tillgångsnivå	Dropdown	Gratis, Silver, Guld
Receptkoppling	Länk	Kocken kan koppla till befintligt recept
Förhandsvisning (15 sek)	Automatisk generering	(Valfritt) kort intro
Taggar / tema	Text	T.ex. "Bakning", "Grill", "Sparsmakad"
Kommentarer / feedback	Valbart	Kan stängas av per video
📦 Produkttyp: Prenumerationer

Syfte:
Kunden prenumererar på färdig mat, matlådor eller temakassar.

Fält	Typ	Beskrivning
Prenumerationstitel	Text	Ex. “Veckans nyttiga lunchlådor”
Typ av prenumeration	Dropdown	Matlådor, Kassar, Frukostboxar, Receptlådor
Pris per vecka / månad	Numeriskt	
Minsta bindningstid	Dropdown	1, 3, 6, 12 månader
Innehåll	Text	Lista över rätter eller teman
Leveransalternativ	Checkbox	Upphämtning / Utkörning
Frekvens	Dropdown	Varje vecka / varannan vecka / varje månad
Allergener / anpassningar	Checkboxar	EU-allergener
Avbokningsvillkor	Textfält	Kort info
Bild / video	Uppladdning	
Taggar	Textfält	För sökning
Tillgänglighet	Checkbox	Publik / Dold
🧑‍🍳 Produkttyp: Laga själv-kit

Syfte:
Kocken säljer råvaror + instruktioner till en rätt kunden lagar själv hemma.

Fält	Typ	Beskrivning
Kit-namn	Text	Ex. “Pasta Carbonara-kit”
Rätt / Recept	Länk	Koppling till kockens eget recept
Portioner (antal)	Numeriskt	
Pris	Numeriskt	per kit
Ingredienslista	Text / lista	Förifylld från recept om kopplat
Instruktioner	Textområde	Kortfattad guide för tillagning
Allergener / märkning	Checkboxar	EU-allergener
Hållbarhetstid / bäst före	Datum	
Förpackningsinfo	Text	
Upphämtning / utkörning	Checkbox	Valbart
Utkörningskostnad	Numeriskt	
Bild / video	Uppladdning	
Tillgänglighet	Checkbox	Publik / Dold
✅ Viktigt

Samtliga formulär ska följa samma visuella struktur och stil som befintliga produkter.

Bolt ska endast lägga till eller justera fält enligt denna fil.

Routing, data, uppladdning och produktlogik ska inte påverkas.

Denna fil fungerar som referensspecifikation för alla produktformulär i Min försäljning.