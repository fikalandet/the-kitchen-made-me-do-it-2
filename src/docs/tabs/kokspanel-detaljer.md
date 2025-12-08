Instruktion för detaljerade inställningar i kockpanelen

Syfte:
Denna fil specificerar hur vissa befintliga flikar i Mitt kök-inställningar ska uppdateras.
Bolt ska inte bygga om flikarna, utan endast justera och lägga till funktioner enligt nedan.
All routing, data och layout ska förbli oförändrad.

🎨 Fliken Köksinfo
OBS!-rad (inställningar)

Kocken ska kunna ställa in hur OBS!-raden på kökssidan ser ut.

Tillgängliga val:

Rubrik (fet stil) – textfält

Text (normal stil) – textfält

Bakgrundsfärg – färgval med följande alternativ i bokstavsordning:

Blå

Gul

Lila

Rosa

Svart

Turkos

Vit

Färgtonerna ska vara exakt desamma som tidigare, endast namnen uppdateras.

Förhandsvisning (live preview) ska visas direkt i panelen.

Möjlighet att välja emojis före/efter tas bort.

Allt sparas till samma datakälla som övrig Köksinfo och visas på kökssidan enligt inställningarna.

🌐 Fliken Kontaktuppgifter

Om kocken fyller i länkar till sina sociala medier (Facebook, Instagram, TikTok):

Dessa ska automatiskt visas på kökssidan “Visa mitt kök” som klickbara ikoner (symboler).

Ikonerna ska ligga i kortet “Sociala medier” i vänsterspalten.

Klick på en ikon öppnar motsvarande sida i ny flik.

Endast ikoner för ifyllda fält ska visas.

Placera dem horisontellt på en rad, med samma färgstil som övriga ikoner i systemet.

💰 Fliken Medlemskap & Provision
Grundprincip

Kocken ska här kunna se sin egen provision – inte TKMDDI:s andel.

Standardnivåer:

Gratiskock → 80% provision

Silverkock → 80% provision

Guldkock → 85% provision

Avsnitt: Aktuell provision

Överst i fliken ska tydligt stå:

Aktuell provision: [procenttal]

Om kocken har en tillfällig provision (t.ex. för återbetalning av livsmedelsregistrering eller tävlingsvinst) ska det stå:

TILLFÄLLIG PROVISION
Gäller: [startdatum – slutdatum]

Denna sektion ska även kunna visa noteringar från admin, t.ex. “Vinst tävling” eller “Återbetalning livsmedelregistrering”.

Avsnitt: Återbetalning av livsmedelregistrering

Om admin har lagt in en summa (t.ex. 1500 kr), ska detta hanteras så här:

Kocken får tillfällig 100% provision tills summan är återbetald.

Återbetalningen sker via den överskjutande procenten (t.ex. 20% för en gratiskock).

En progress bar ska tydligt visa hur mycket av summan som är återbetald och hur mycket som återstår.

När hela beloppet är återbetalt återgår provisionen automatiskt till ordinarie nivå.

Avsnitt: Historik

Under aktuell provision ska kocken kunna se en lista med tidigare provisioner:

Period	Provision	Notering
2025-02-01 – 2025-03-01	100%	Återbetalning livsmedelregistrering
2024-12-01 – 2025-01-01	85%	Vinst tävling
Avsnitt: Läs om våra medlemskap

Längst ner i fliken ska finnas en knapp:

Läs om våra medlemskap

När man klickar på den öppnas en matris eller modal som visar en fullständig översikt över vad som ingår i Gratis, Silver och Guld – hämtad från medlemskapsstrukturen i systemet.

Avsnitt: Info-ruta (längst ner)

Uppdatera så att den beskriver detta korrekt:

Här ser du din aktuella provision, tillfälliga justeringar och eventuell återbetalning av livsmedelsregistrering.
Provisionen uppdateras automatiskt varje gång du får en utbetalning.

✅ Viktigt

Ändra inget i befintlig routing, datamodeller eller komponentstruktur.

Denna fil är en referensspecifikation för finjusteringar i Köksinfo, Kontaktuppgifter och Medlemskap & Provision.

Bolt ska endast lägga till eller uppdatera det som nämns här.