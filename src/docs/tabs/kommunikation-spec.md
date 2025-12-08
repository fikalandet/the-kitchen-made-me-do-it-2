Struktur i huvudfliken “Kommunikation”

Huvudfliken består av två underflikar:

Meddelanden – allt manuellt meddelandeutbyte mellan kock, kunder och TKMDDI.

Automatiska meddelanden – mallhantering för automatiska svar (endast Silver & Guld).

Därtill finns en global indikator (#56c5c5) som visar antalet nya meddelanden, synlig oavsett var i kockpanelen användaren befinner sig.

💬 1. Meddelanden
Flikar inom Meddelanden

När kocken klickar på Meddelanden visas tre flikar högst upp i innehållsområdet:

Från kunder

Lista med alla konversationer från kunder.

Kolumner: Kundnamn, Typ (Förfrågan / Önskemål / Beställning / Klagomål), Senaste aktivitet, Status, Öppna.

Filter: Typ, Status, Sökfält (kundnamn, ordernummer).

Antal olästa konversationer visas i en liten turkos cirkel (#56c5c5) bredvid fliknamnet.

Från TKMDDI

Lista över alla meddelanden från TKMDDI-teamet (Info, Systeminfo, Tävling, Feedback, Personligt).

Samma layout och indikatorlogik som ovan.

Skriv nytt meddelande

Formulär för att skapa ny konversation.

Fält:

Mottagare (kund / TKMDDI)

Typ (Förfrågan, Önskemål, Klagomål, Annat)

Ämne

Meddelandetext

Bifoga fil

Knapp: Skicka

Efter skickat visas bekräftelse:

“Meddelandet har skickats – du får en notis när du får svar.”

Konversationsfönster

När kocken klickar på en tråd öppnas ett stort konversationsfönster i huvudytan.

Layout:

Bubblor i chattform:

Kund/TKMDDI till vänster, kock till höger.

Ovanför varje bubbla: Namn · Datum/tid · Typikon.

I bubblans hörn: tagg [Förfrågan], [Önskemål], [Beställning], [Klagomål], [Info], [Systeminfo], [Tävling], [Feedback], [Personligt].

Under varje bubbla: leveransstatus (Skickat, Mottaget, Levererat, Läst, Misslyckat).

Skrivfält:

Textfält, emoji, bifoga-knapp, AI-förslag (“Föreslå svar”).

Enter = skicka, Shift+Enter = ny rad.

Status på tråd:

Ej läst | Pågående | Väntar på kund | Väntar på kock | Avslutad

Snabbknappar i toppen: “Markera som avslutad”, “Väntar på kund”, “Väntar på kock”.

💡 2. Global meddelandeindikator (#56c5c5)
Syfte

Kocken ska direkt vid inloggning se hur många nya meddelanden som finns, utan att behöva klicka sig fram.

Placeringar

På kockens startsida (dashboard):

En rund cirkel med siffran för antal olästa meddelanden visas bredvid texten “Meddelanden”.

Klick leder direkt till Kommunikation → Meddelanden.

Tooltip (hover): “Du har X nya meddelanden.”

I sidomenyn (vid Kommunikation):

Samma indikator (#56c5c5) visas i menyn bredvid texten “Kommunikation”.

Visas på alla sidor i panelen.

Inne på fliken “Meddelanden”:

På flikraden:

“Från kunder (2)”

“Från TKMDDI (1)”

Antalet uppdateras i realtid.

Design
Element	Specifikation
Bakgrundsfärg	#56c5c5
Textfärg	#ffffff
Storlek	14x14px (justeras vid tvåsiffrigt tal)
Rundning	50%
Typsnittsstorlek	11px
Position	Övre högra hörnet av text eller ikon
Animation	Mjuk fade vid uppdatering
Tooltip	“Du har X nya meddelanden.”
Funktionell logik

Systemet räknar alla olästa meddelanden där:

recipient_id = current_user_id AND delivery_status != 'read'


Indikatorn uppdateras automatiskt via Supabase real-time subscription.

När kocken öppnar en konversation markeras den som läst → siffran uppdateras direkt.

Vid ny inkommande konversation ökar siffran direkt.

⚙️ 3. Automatiska meddelanden (Silver & Guld)
Syfte

Låta kockar på Silver- och Guldkonto aktivera färdiga meddelandemallar som skickas automatiskt vid särskilda händelser.

Layout

Direkt översikt över alla meddelandetyper (triggers) i tabell- eller kortform.

Varje rad visar:

Typnamn (t.ex. “Order mottagen”)

Kort beskrivning

Antal varianter

Status (Aktiv / Inaktiv)

Knapp: “Visa varianter”

Vid klick på typ:

Lista över tillgängliga varianter visas.

Kocken väljer vilken variant som ska användas (radio/dropdown).

Endast admin (TKMDDI) kan redigera texterna.

Förhandsvisning visas med variabler insatta.

Triggers:

Order mottagen, Order bekräftad, Tillagas, Klar för upphämtning, Levererad, Försenad, Avbokad, Tack & recension, Förfrågan mottagen, Prenumeration på gång, Prenumeration pausad.

Variabler:

{{customer_first_name}}, {{order_number}}, {{dish_name}}, {{pickup_time}}, {{delivery_eta}}, {{kitchen_name}}, {{review_link}}, {{order_link}}, {{support_link}}.

🗄️ 4. Databasstruktur (Supabase)

Tables:

message_threads – id, party_a_id, party_b_id, type, order_id, status, last_activity_at

messages – id, thread_id, sender_id, body, type, channel, delivery_status, read_at, created_at

auto_message_templates – id, kitchen_id, trigger, subject, body, channels, delay_minutes, enabled, locale

canned_replies – id, kitchen_id, title, body, locale

Enums:

thread_type: customer_request | customer_wish | order | complaint | tkm_info | tkm_system | tkm_competition | tkm_feedback | tkm_personal

thread_status: unread | open | waiting_customer | waiting_cook | closed

delivery_status: sent | received | delivered | read | failed

🪜 Sammanfattning
Underflik	Syfte	Viktiga element
Meddelanden	Samlad chatt för kunder & TKMDDI	Tre interna flikar, tydlig chattlayout, statusmarkeringar
Automatiska meddelanden	Händelsestyrda mallar	Valbara varianter, adminredigering
Global indikator	Direkt synlighet	Turkos (#56c5c5) siffermarkör på startsida & meny