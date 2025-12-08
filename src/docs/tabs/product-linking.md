Instruktion för koppling mellan produkter och kockens kökssida

Syfte:
Denna fil beskriver hur alla produkter och innehåll som kocken skapar i sin panel ska kopplas och visas på rätt plats på den publika sidan “Visa mitt kök”.
Bolt ska använda denna fil som referensspecifikation och inte bygga om något utanför dessa instruktioner.

🔗 Grundprincip

Allt som kocken skapar under huvudfliken “Min försäljning” (underflik “Översikt”, knappen “+ Skapa ny produkt”) ska automatiskt kopplas till kockens kökssida.

Kopplingen sker via kockens chef_id (eller motsvarande fält som identifierar köket).
Alla produkter som har samma chef_id ska synas på rätt plats under respektive knapp på Visa mitt kök.

📦 Kopplingar per produkttyp
Produkttyp (skapad av kocken)	Visas under knapp på kökssidan
Maträtt	➡️ “Min meny”
Matlådekasse	➡️ “Kassar & prenumerationer”
Gör det själv-kit	➡️ “Kassar & prenumerationer”
Prenumeration	➡️ “Kassar & prenumerationer”
Hyra kock	➡️ “Boka mig”
Catering	➡️ “Boka mig”
Recept	➡️ “Recept & videos”
🎥 Välkomstvideo

Om kocken laddar upp en välkomstvideo under:

Huvudflik: Mitt kök-inställningar
Underflik: Köksinfo
Sektion: Välkomstvideo

…ska videon automatiskt visas under knappen “Välkomstvideo” på kökssidan.
(Maxlängd 60 sekunder gäller – detta ska framgå i uppladdningsvyn.)

📈 Synlighet & uppdatering

Alla produkter ska uppdateras i realtid eller vid nästa sidladdning när kocken sparar, redigerar eller tar bort något i Min försäljning.

Endast produkter med status Aktiv ska visas på kökssidan.

Om en produkt flyttas till “Fryst”, “Schysst deal” eller liknande, ska den visas i respektive sektion eller flaggas med sin status.

Samtliga bilder, priser, titlar och beskrivningar ska hämtas direkt från produktens databasfält.

✅ Viktigt

Varje produktpost måste ha en relation till kocken via chef_id (eller kitchen_id).

Inga produkter ska visas på någon annan kocks sida.

Behåll befintlig routing, komponenter och data.

Denna fil används som referensspecifikation för hur produkterna kopplas till och visas på “Visa mitt kök”.