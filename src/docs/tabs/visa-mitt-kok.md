Instruktion för sidan Visa mitt kök

Syfte:
Denna fil definierar den visuella och funktionella layouten för kockens offentliga kökssida (“Visa mitt kök”).
Bolt ska inte bygga om något, utan endast säkerställa att sidan följer denna struktur och design.

🖼️ Övre sektionen (Banner + Profil)
Bannerbild

Sträcker sig från vänster till höger över hela sidans bredd.

Används som bakgrund högst upp på sidan.

Profilbild

Rund och placerad helt uppe på bannerbilden, i vänstra delen.

Profilbilden ska alltså överlappa bannerbilden, inte ligga under den.

Storleken ska vara proportionerlig mot bannerhöjden (inte för stor).

Knappar på bannerbilden (vertikalt på höger sida)

Dela-knapp

Favorit-knapp

Båda visas längst till höger på bannerbilden.

Statusindikator (öppet/stängt)

Ligger i direkt anslutning till profilbildens nederkant, centrerad under bilden.

Bakgrund: vit (inte färgad).

Endast indikator-pricken är färgad:

🟢 Grön = Öppet

🟡 Gul = Öppnar snart / Stänger snart

🔴 Röd = Stängt

🔘 Knapplist (under bannerbilden)

Knapplisten ska ligga direkt under bannerbildens nederkant, med endast några millimeter padding.

Ligger centrerat direkt under bannerbilden.

Innehåller rundade knappar i en horisontell rad.

Text och knappar ska vara mindre i storlek för en mer balanserad layout.

Knapparnas synlighet styrs av kockens inställningar och medlemsnivå.

🧭 Visningslogik

Alla knappar i knapplisten ska alltid vara synliga – oavsett om de innehåller något eller kockens medlemsnivå.

Om knappen saknar innehåll eller kocken inte har tillgång till funktionen på sin medlemsnivå, ska den visas som gråad och ej klickbar, men aldrig döljas.

Detta gäller hela listan:
Välkomstvideo, Schyssta deals, Min meny, Kassar & prenumerationer, Recept & videos, Boka mig, Tävling & Events.

Knappar i ordning

Välkomstvideo – alltid längst till vänster (endast Silver & Guld)

Schyssta deals (Silver- och Guld)

Min meny

Kassar & prenumerationer (Silver- och Guld)

Recept & videos (Silver- och Guld)

Boka mig (Silver- och Guld)

Tävling & Events (Silver- och Guld)

Färgregler

Aktiva knappar (funktion aktiv): #ffffff med svart text

Inaktiva knappar (funktion ej aktiv): gråade, ej klickbara

Vald knapp: #56c5c5

⚠️ OBS-rad (valfri notifiering under knapplisten)

Kan aktiveras av kocken via inställningen i underfliken “Köksinfo” under “Mitt kök-inställningar”.

Ligger precis under knapplisten.

Används för att flagga aktuella händelser, t.ex.:

“På spisen nu”-datum

Käk med kort datum

Aktiva tävlingar

Utdelning av guldpoäng

Innehåll: Rubrik (fet) över Text (normal).

Emoji före och emoji efter renderas på varsin sida om rubrik+text (om angivna).

Bakgrundsfärg: använd kockens val (ljusrosa, svart, svagare #56c5c5, ljusgul, ljusblå, ljuslila).

Rad visas endast om Synlig är ibockad i Köksinfo.

🧩 Layoutstruktur under bannerbilden

Innehållet under bannerbilden delas upp i två kolumner:

📗 Vänsterspalt (statisk information)

Placeras direkt under profilbilden och innehåller följande kort i denna ordning:

Kökets namn + betygsstjärnor

Hos mig kan du önska käk – ett vitt kort med rundade hörn, innehållande en knapp i färgen #56c5c5 med texten “Skriv & önska”.

Visas endast om kocken har bockat i “Hos mig kan du önska käk!” i Köksinfo.

När kunden klickar på “Skriv & önska” ska en modal öppnas.

I modalen visas en informationsrad högst upp (om kocken har skrivit något i Köksinfo-inställningen för detta).

Under informationsraden finns ett textfält där kunden kan skriva sin önskan.

Kocken ska kunna svara på önskningen, ange pris och eventuell ytterligare information.

Kocken ska kunna svara, ange pris och övrig information.

Kort om mig – text från fältet Beskrivning i Köksinfo-inställningar

Hitta hit – adress + GPS-knapp i färg #56c5c5

Leverans – information om upphämtning/utkörning och kostnad

Öppettider – visar de dagar och tider kocken valt att visa i fliken Öppettider

Sociala medier – visar länkar/ikoner till kockens angivna sociala medier från fliken Kontaktuppgifter

Skicka meddelande – en knapp som leder till formulär (formuläret öppnas separat; visas inte direkt på kökssidan)

Alla dessa kort ligger vertikalt, i vita boxar med rundade hörn.

📘 Högerspalt (dynamiskt innehåll)

Till höger om vänsterspalten visas innehållet som hör till vald knapp i knapplisten.
Exempel:

Klickar man på “Min meny” visas rätterna här.

Klickar man på “Kassar & prenumerationer” visas kockens erbjudanden där, osv.

✏️ Stil & typografi

Bakgrund: #a1c798

Kort: vita med rundade hörn

Rubriker: fet (bold) Lobster

Text: svart

Knappar: svarta eller #56c5c5

Textstorlek

Minska textstorlek generellt i alla sektionskort.

Rubriker ska alltid vara fetstilta.

✅ Viktigt

Ändra endast om något inte stämmer mot denna instruktion.

Behåll all routing och data oförändrad.

Denna fil fungerar som referensspecifikation för “Visa mitt kök”-sidan.