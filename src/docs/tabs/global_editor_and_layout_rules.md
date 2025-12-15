1. Syfte

Denna fil definierar globala regler för:

admin-redigering

layout

typografi

UX-mönster

Reglerna gäller alla redigerbara sidor, oavsett sidtyp.
Sid-specifika regler får endast vara tillägg, aldrig ersättningar.

2. Gemensamma redigeringsblock (gäller ALLA sidor)

Alla redigerbara sektioner ska kunna hantera:

Bakgrund (färg / ev. bild)

Rubrik

Textrad

Beskrivning / ingress

CTA (valfri)

Dessa block ska vara konsekventa i både:

admin-utseende

datamodell

frontend-rendering

3. Typografi – global standard

Typsnitt

Poppins (måste alltid finnas)

Lobster (måste alltid finnas)

Fler typsnitt är tillåtna, men:

ska komma från en gemensam lista

ska användas konsekvent överallt

Stil (UI-språk: svenska)

Normal

Fet

Kursiv (om tillgängligt)

Övrigt

Storlek

Färg

Placering

4. Inline-styling (KRAV)

Alla textfält (rubrik, textrad, ingress, korttext) ska stödja:

markering av enskilda ord/frases

fet

kursiv

annan färg

Detta är valfritt per text, men alltid möjligt.

5. Admin-UX – kontrollrader

Alla textfält ska ha:

textfältet först

kontrollrad direkt under fältet som styr:

typsnitt

stil

storlek

färg

placering

Samma mönster överallt.
Inga avvikelser utan uttryckligt skäl.

6. Datakoppling (ej förhandlingsbart)

Admin skriver till ett schema

Frontend läser från samma schema

Det är förbjudet att skapa UI som sparar data som inte används

7. Förbjudet

Dubbla editorer för samma sida

Olika UI-mönster för samma typ av inställning

Engelska labels i admin

Slumpmässiga nya typsnitt

8. Arbetsregel

Innan ändring:

Kontrollera denna fil

Återanvänd befintliga mönster

Om osäker – fråga, gissa inte