# Startsida – Specifikation (TKMMDI)

Denna fil definierar struktur, design och adminstyrning för hela startsidan.

## 🎨 Design & stil
- Bakgrundsfärg: #a1c798 och #f6f2e0 (varannan sektion)
- Typsnitt:
  - Rubriker: **Lobster (bold)** Färg #000000
  - Brödtext: modernt sans-serif, lättläst
- Accentfärger: vitt, #f6f2e0, knappar svarta eller #56c5c5
- Allt redigerbart via admin: färger, antal kort, texter, typsnitt, bakgrunder

## ⚙️ Adminkontroll
- Varje sektion kan “tändas/släckas” (visa/dölj)
- Sektioner utan innehåll göms automatiskt
- Nya flöden kan skapas (“tändas upp”) via admin
- Admin kan:
  - redigera rubrik/underrubrik
  - ändra färger, antal kort, layout
  - lägga till eller ta bort annonsytor (kan tändas/släckas)
  - styra flödenas ordning

## 🧭 Filter & Geo
- Ovanför varje flöde finns val: “Visa i mitt område”
- Ovanför “På spisen nu” finns också en checkbox per veckodag (max 7 dagar framåt)
- Bockar kunden i checkbox "måndag" då syns endast maträtter som tillagas på måndag osv.
- Geo-filtrering jämför kundens plats med kockens avstånd

## 🌟 Sektioner (uppifrån och ner)
1. **Bildkarusell** – stora bilder, klickbara, kan länkas till kampanjer
2. **Hero-sektion**"– tre kort:
   - “Hitta käk” → “Mata mig” / “Filtrera själv”
   - “Utforska kassar” → “Matlådekassar” / “Laga-själv-kit” / “Prenumerera”
   - “Boka en kock” → “Hyr en kock” / “Catering”
   - Text: “Välkommen till Sveriges hungrigaste webbplats!”
4. **På spisen nu** – rätter med datum, tider, antal kvar
5. **Populärt käk** – toppsäljare
6. **Nytt på menyn** – nyskapade (< 30 dagar)
7. **Kylskåpsmeny** – matlådekassar, laga-själv-kit, prenumerationer
8. **Veckans kockar** – roterande kockprofiler
9. **Schyssta deals** – kampanjer och rabatter (nedräkning)
10. **Smaketiketter** – flöde baserat på smak-taggar (silver/guld-kockar)
11. **Tävlingar** – pågående med countdown
12. **Testkäka & Tyck till** – feedbackrätter
13. **Önska käk** – kunder önskar rätter (kockar kan gilla/kommentera)
14. **Evenemang** – rätter kopplade till events, med “Kommer / Kanske”
15. **Tjuvkik i köket** – reels/videos
16. **Kock i fokus** – utvald kock
17. **Humörkäk** – filtrering baserad på humör-taggar
18. **Bli en Kitchen-kock** – rekrytering CTA
19. **Hälsokäk** – artiklar (scrollbart 4–5 kort, leads till redaktionellt)
20. **En sked för mamma** – artiklar med scrollbara kort
21. **Horoskop** – klickbart stjärnteckenkort som vänder sig vid klick

## 🧩 Funktionsregler
- Kunder kan Gilla, Dela, Favorit på alla kort
- Kommentar aktiveras i Tävlingar & Evenemang
- Countdown i Deals & Tävlingar (eventuellt i Event)
- Geo- och datumfilter gäller alltid
- Auto-hide för tomma flöden

## ⚙️ Kodstruktur
- Startsidan monteras i `Home.tsx`
- Varje sektion är en separat komponent (t.ex. `PopularDishesSection.tsx`)
- Korttyper från `/components/cards/`

## 🪄 Adminfält
- Bakgrundsfärg, rubrik, underrubrik, layout, visningsantal, annonser, färger
