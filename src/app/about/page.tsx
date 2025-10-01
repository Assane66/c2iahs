
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center" prefetch={false}>
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-3 text-xl font-bold">Institut Al Housseynou</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary mb-8">
            À Propos de Notre Institut
          </h1>

          <div className="prose prose-invert lg:prose-xl text-gray-300 space-y-6">
            <p>
              Le Centre Imam Al Housseynou Sow est un lieu de croissance et d'épanouissement. Fondé en hommage à l'Imam Al Housseynou Sow, ce centre a pour vocation d'offrir une éducation complète dès les premières années du primaire, du C1 à la CM2. L'objectif est de poser les fondations solides qui soutiendront les enfants tout au long de leur vie.
            </p>
            <p>
              Ici, chaque année d'apprentissage est une étape essentielle. Les jeunes élèves commencent par explorer l'alphabet et les chiffres en français et en arabe. Au fur et à mesure qu'ils grandissent, ils construisent leurs compétences, gagnent en autonomie et découvrent la richesse de la culture islamique. C'est un voyage où ils apprennent à lire, à écrire, à calculer, mais aussi à être de meilleurs êtres humains. C'est l'école de la "Qualité" et du "Respect", où l'on cultive l'excellence scolaire et les valeurs morales.
            </p>

            <h2 className="text-3xl font-bold tracking-tighter text-primary pt-8">
              La Mission : Bâtir l'avenir, un enfant à la fois
            </h2>
            <p>
              La mission du Centre est de préparer chaque enfant non seulement pour la prochaine étape de sa scolarité, mais pour la vie entière.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3 mt-1">✔</span>
                <span>
                  <strong>Une éducation bilingue équilibrée :</strong> Nous proposons un programme qui allie les exigences du français (langue de la réussite académique et professionnelle) et de l'arabe (langue de la spiritualité et des valeurs). Nos élèves sortent en étant à l'aise dans les deux langues, avec une double culture.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3 mt-1">✔</span>
                <span>
                  <strong>"Qualité - Respect" :</strong> Cette devise est au cœur de tout ce que nous faisons. Nous nous engageons à offrir une éducation de qualité avec des enseignants compétents et des méthodes d'enseignement modernes. En parallèle, nous insistons sur le respect : le respect de soi, des autres, des aînés, des professeurs et des règles de la vie en communauté.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3 mt-1">✔</span>
                <span>
                  <strong>Le bon départ :</strong> Notre objectif est de donner à chaque enfant le "bon départ pour la vie". Cela signifie les équiper des connaissances essentielles, de la confiance en soi et des valeurs solides pour qu'ils puissent réussir au collège, dans leur future carrière et surtout, devenir des citoyens responsables et épanouis.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

       <footer className="bg-black py-12 mt-16">
        <div className="container mx-auto px-4 md:px-6 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Institut Imame Al Housseynou Sow. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

    