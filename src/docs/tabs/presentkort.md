Build spec: Kockpanel → Min försäljning → Presentkort (v4 – slutlig version)
🎯 Mål

Bygg en komplett funktion där:

Endast guldkockar kan erbjuda presentkort.

Kocken gör inga redigeringar i själva presentkortet.

Kunden kan köpa ett presentkort direkt på kockens kökssida via en modal.

Kunden kan där välja mall, belopp, hälsning, mottagare och rubrik.

Systemet hanterar hela utskicket via e-post eller SMS.

Betalningen delas automatiskt:

85 % till kocken

15 % till TKMMDI

Köpta presentkort blir synliga inne på kockens panel → Min försäljning → Presentkort.

Alla kort ska märkas med logotypen “The Kitchen made me do it” i originalfärg och originalstorlek (ej transparent).

🔗 Routing & placering

Ny placering: under huvudfliken “Min försäljning”

Sökväg: /chef/sales/giftcards

Titel i fliken: Presentkort

🎨 Design & färgtema

Följ alltid varumärkets färgsystem:

Typ	Färg	Användning
Primär	#a1c798	Grön mall, knappar, highlights
Sekundär	#f6f2e0	Beige mall, bakgrund
Accent	#56c5c5	För köpknappar, länkar
Text	#000000	Rubriker och brödtext
Vit	#ffffff	Kort, fält, kontraster
💻 Kundens flöde (frontend)

När kunden klickar på “Presentkort” i knapplisten på en guldkocks kökssida:

Modal-fönster öppnas

Kunden får följande val i en snygg steg-för-steg-modal:

Välj mall

Grön (#a1c798)

Beige (#f6f2e0)

Fyll i presentkortets uppgifter:

Belopp (valfritt, min 50 kr)

Personlig hälsning (valfritt)

Mottagarens e-postadress eller telefonnummer (för SMS)

Välj rubrik (dropdown med två alternativ):

Rubrik: Gratis är alltid godast!
Undertext: Grattis, du har precis fått ett presentkort på gratis käk hos kocken [kockens köksnamn] på The Kitchen made me do it.

Rubrik: Presentkort på The Kitchen-käk!
Undertext: Grattis, du har precis fått ett presentkort på gratis käk hos kocken [kockens köksnamn] på The Kitchen made me do it.

Klicka på [KÖP]

Kunden genomför betalningen via Swish, Klarna eller annan aktiv betalmetod.

Efter betalning:

Summan splittras automatiskt (85 % till kocken, 15 % till TKMMDI).

Ett unikt presentkort genereras och skickas till mottagaren.

Presentkortet blir synligt i kockens panel → Min försäljning → Presentkort.

🖋️ Kortlayout
-----------------------------------------
🍽️  Presentkort på gott käk!  (Lobster Bold, 3xl, centrerad)
Kockens profilbild + köksnamn

Värde: 500 kr
Personlig hälsning kommer här...

📅  Giltigt t.o.m: 2026-11-05
💳  Kod: GIFT-XXXX-YYYY
──────────────────────────────
[QR-kod]                         [Logotyp]
-----------------------------------------

Detaljer:

Kortformat: rektangulärt 3:2 (ca 600×400 px)

Rundade hörn: rounded-2xl

Vit ram (8–12 px)

Mjuk skugga (shadow-lg)

Svag diagonal gradient:
bg-gradient-to-br from-[#a1c798] to-[#91b987]

Rubrik: Lobster Bold 3xl, centrerad, svart text

Brödtext: Inter eller Montserrat, text-base, text-gray-800

Kodrad: monospace med border-t border-gray-300 mt-2 pt-2

QR-kod: nere till vänster

Logotyp: “The Kitchen made me do it” nere till höger

Full storlek, originalfärg (inte transparent, inte nedskalad)

För grönt kort: logotyp_plattformen_grön.png

För beige kort: logotyp_plattformen_beige.png

Hover-effekt: hover:scale-[1.02] hover:shadow-xl

🧾 Databas (Supabase)

giftcards

kolumn	typ	beskrivning
id	uuid	primärnyckel
chef_id	uuid	FK till profiles
name	text	namn
amount	numeric	belopp
validity_months	int	giltighet
template	text	Green / Beige
is_active	boolean	aktiv/inaktiv
created_at	timestamptz	skapad
expires_at	date	giltighetsdatum
logo_url	text	/public/logotyp_plattformen_grön.png eller beige.png
preview_image_url	text	förhandsvisning
share_url	text	publik länk

giftcard_redemptions

kolumn	typ	beskrivning
id	uuid	primärnyckel
giftcard_id	uuid	FK till giftcards
code	text	unik kod
qr_code_url	text	QR-bildlänk
sent_to	text	mottagarens e-post/telefon
delivery_method	text	email/sms
redeemed	boolean	om kortet är inlöst
redeemed_at	timestamptz	tidpunkt
redeemed_by	uuid	kockens id
link_url	text	webblänk till kortet
📤 Utskick (efter betalning)
✉️ E-post

Ämnesrad:
🎁 Presentkort hos The Kitchen made me do it!

Meddelande:

Grattis!
Du har precis fått ett presentkort på riktigt gott käk hos vår kock [kockens köksnamn] på The Kitchen made me do it.
Klicka här för att visa ditt presentkort: [Visa presentkort-knapp]

Knapp: “Visa presentkort” → länkar till unik presentkortssida.

📱 SMS (via Sinch eller Twilio)

🎁 Grattis! Du har precis fått ett presentkort på riktigt gott käk hos vår kock [kockens köksnamn] på The Kitchen made me do it.
Visa ditt presentkort här: [länk]

🔍 Inlösen (för kocken)

Underflik: Läs in presentkort

Kocken kan:

Skanna QR-kod (kamera eller mobil).

Ange kod manuellt.

Systemet kontrollerar:

Om koden finns och är giltig.

Om kortet redan är inlöst.

Om giltigt → visa belopp, giltighet och knapp “Markera som inlöst”
Efter inlösen: redeemed = true.

⚙️ Logik & regler

Kod och QR genereras vid köp.

När giltighet löper ut → is_active = false.

Vid inlösen → redeemed = true.

Kocken kan endast se egna sålda presentkort.

Logotypen The Kitchen made me do it är obligatorisk, ej transparent, ej redigerbar.

Designen ska vara responsiv och elegant på alla enheter.

Split payment vid köp:

85 % → kockens konto

15 % → TKMMDI

✅ Acceptanstest

✅ Modal öppnas korrekt vid klick på “Presentkort” på guldkocks kökssida.
✅ Kunden kan välja mall, belopp, hälsning, mottagare och rubrik.
✅ Köpet fungerar med automatisk betalningssplit (85/15).
✅ Systemet skickar presentkort via e-post och SMS med rätt text.
✅ Kocken ser sålda presentkort under Min försäljning → Presentkort.
✅ QR-inlösen fungerar korrekt.
✅ Design följer varumärkets tema och logotypen är i originalstorlek.