import { useParams, Link } from 'react-router-dom';
import { AdminCard } from '../../components';
import { ArrowLeft } from 'lucide-react';
import SectionEditor from '../components/SectionEditor';

export default function SektionEditor() {
  const { sectionSlug } = useParams<{ sectionSlug: string }>();

  const sectionNames: Record<string, string> = {
    'bildspel': 'Bildspel',
    'hero': 'Hero',
    'nyheter': 'Nyheter',
    'pa-spisen-nu': 'På spisen nu',
    'populart-kak': 'Populärt käk',
    'brattomkak': 'Bråttomkäk',
    'nytt-pa-menyn': 'Nytt på menyn',
    'kylskapsmeny': 'Kylskåpsmeny',
    'veckans-kockar': 'Veckans kockar',
    'schyssta-deals': 'Schyssta deals',
    'tjuvkik-i-koket': 'Tjuvkik i köket',
    'halsokak': 'Hälsokäk',
    'humorkak': 'Humörkäk',
    'onska-kak': 'Önska käk',
    'testkaka-tyck-till': 'Testkäka & Tyck till',
    'bli-kitchen-kock': 'Bli en kitchen-kock',
    'kundernas-tyckande': 'Så tycker våra kunder',
    'horoskop': 'Horoskop',
    'evenemang': 'Evenemang',
    'kock-i-fokus': 'Kock i fokus',
    'tavlingar': 'Tävlingar',
    'blogg': 'Blogg'
  };

  const sectionName = sectionSlug ? sectionNames[sectionSlug] || sectionSlug : '';

  return (
    <div>
      <Link
        to="/admin/webb/startsida/sektioner"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka till sektioner
      </Link>

      {sectionSlug === 'bildspel' ? (
        <SectionEditor slug="bildspel" displayName="Bildspel" />
      ) : sectionSlug === 'hero' ? (
        <SectionEditor slug="hero" displayName="Hero" />
      ) : sectionSlug === 'pa-spisen-nu' ? (
        <SectionEditor slug="pa-spisen-nu" displayName="På spisen nu" />
      ) : sectionSlug === 'populart-kak' ? (
        <SectionEditor slug="populart-kak" displayName="Populärt käk" />
      ) : sectionSlug === 'nytt-pa-menyn' ? (
        <SectionEditor slug="nytt-pa-menyn" displayName="Nytt på menyn" />
      ) : sectionSlug === 'kylskapsmeny' ? (
        <SectionEditor slug="kylskapsmeny" displayName="Kylskåpsmeny" />
      ) : sectionSlug === 'veckans-kockar' ? (
        <SectionEditor slug="veckans-kockar" displayName="Veckans kockar" />
      ) : sectionSlug === 'brattomkak' ? (
        <SectionEditor slug="brattomkak" displayName="Bråttomkäk" />
      ) : sectionSlug === 'schyssta-deals' ? (
        <SectionEditor slug="schyssta-deals" displayName="Schyssta deals" />
      ) : sectionSlug === 'evenemang' ? (
        <SectionEditor slug="evenemang" displayName="Evenemang" />
      ) : sectionSlug === 'tavlingar' ? (
        <SectionEditor slug="tavlingar" displayName="Tävlingar" />
      ) : sectionSlug === 'tjuvkik-i-koket' ? (
        <SectionEditor slug="tjuvkik-i-koket" displayName="Tjuvkik i köket" />
      ) : sectionSlug === 'onska-kak' ? (
        <SectionEditor slug="onska-kak" displayName="Önska käk" />
      ) : sectionSlug === 'testkaka-tyck-till' ? (
        <SectionEditor slug="testkaka-tyck-till" displayName="Testkäka & Tyck till" />
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sektion: {sectionName}</h2>
          <p className="text-gray-600 mb-6">Kommer snart</p>

          <AdminCard>
            <div className="text-center py-12">
              <p className="text-gray-500">
                Här ska Sektion-editor-komponenten användas enligt webeditor.md. Ingen logik implementerad ännu.
              </p>
            </div>
          </AdminCard>
        </>
      )}
    </div>
  );
}
