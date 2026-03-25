/**
 * Sujets par défaut - Conseils de vie, exhortation, etc.
 */

const defaultTopics = [
  {
    title: 'Conseils de la vie quotidienne',
    content: `#theme:SANTE|Sport & Bien-etre
Bienvenue dans cet espace de partage. Voici quelques conseils pour mieux vivre au quotidien :

• Bougez même un peu : une marche de 10 à 20 minutes peut aider à l’énergie et à l’humeur.
• Respirez avant de réagir : quelques secondes de calme évitent bien des tensions.
• Hydratez-vous : l’eau est un allié simple pour le corps et la clarté.
• Cultivez la constance : de petites habitudes valent souvent mieux que de grands changements.
• Demandez du soutien : parler n’enlève rien à votre force, au contraire.

Vous n’êtes pas seul. N’hésitez pas à utiliser le chat pour échanger avec nous.`,
  },
  {
    title: 'Réseaux : apprendre sans se perdre',
    content: `#theme:INFORMATIQUE|Reseaux
Les réseaux peuvent sembler compliqués. Voici une méthode simple pour progresser :

• Comprendre les bases : IP, DNS, routeurs, et qu’est-ce qu’un “protocole”.
• Visualiser : imaginez le trajet d’une “demande” de votre appareil jusqu’au serveur.
• Pratiquer : testez (chez vous) avec des outils simples et lisez les retours.
• Faire des liens : chaque notion sert à expliquer un comportement réel.

Posez vos questions en commentaire : on avance ensemble.`,
  },
  {
    title: 'IA responsable : comment l’utiliser avec bon sens',
    content: `#theme:INFORMATIQUE|IA & Data
L’IA peut être une aide précieuse, mais il faut garder un esprit critique :

• Vérifiez les informations : ne prenez pas une réponse comme vérité absolue.
• Utilisez l’IA pour structurer : brouillons, idées, reformulations.
• Respectez la vie privée : évitez de partager des données sensibles.
• Testez : comparez plusieurs sources et observez les incohérences.

Partagez vos expériences et vos bonnes pratiques en commentaire.`,
  },
  {
    title: 'Quand consulter ? repères sur les symptômes',
    content: `#theme:MEDECINE|Diagnostic & Symptomes
Ce post ne remplace pas un avis médical. L’objectif ici est de vous aider à comprendre des repères :

• Consultez rapidement si vos symptômes s’aggravent ou si vous avez des signes inquiétants.
• Surveillez l’évolution : durée, intensité, déclencheurs, facteurs aggravants.
• Notez vos informations : antécédents, traitements, allergies.
• N’hésitez pas à demander de l’aide : mieux vaut poser une question tôt.

Écrivez ce que vous vivez (sans détails sensibles) pour obtenir des retours et du soutien.`,
  },
  {
    title: 'Prévention : habitudes qui protègent',
    content: `#theme:MEDECINE|Preventions
La prévention, c’est agir avant que ça ne devienne urgent :

• Sommeil : viser une régularité et écouter vos besoins.
• Activité physique : progressif, adapté à votre rythme.
• Alimentation : privilégier le “simple et durable”.
• Suivi : vaccins et bilans quand c’est recommandé.

Quel est votre objectif de prévention pour ce mois ?`,
  },
  {
    title: 'Gérer le stress et améliorer son sommeil',
    content: `#theme:SANTE|Sommeil & Stress
Le stress et le sommeil sont liés. Voici quelques pistes :

• Réduire les écrans avant le coucher (au moins 30 minutes).
• Respiration lente : 3 à 5 minutes suffisent parfois à calmer le corps.
• Écrire ce qui tourne en boucle : “vider” son cerveau aide à dormir.
• Routine : horaires réguliers, même le week-end.

Partagez ce qui vous aide le plus. Vous n’êtes pas seul.`,
  },
  {
    title: 'Spiritualité : trouver la paix intérieure',
    content: `#theme:RELIGION|Spiritualite
La spiritualité peut aider à trouver du sens et de la paix, quelle que soit la tradition :

• Pratiquer sans pression : même 5 minutes comptent.
• Rester bienveillant envers soi : progresser en douceur.
• Chercher des repères : lecture, prières, méditation, réflexion.
• Écouter : demander conseil à des personnes de confiance.

Qu’est-ce qui vous apporte de la force dans les moments difficiles ?`,
  },
  {
    title: 'Questions de sens : comment avancer ?',
    content: `#theme:RELIGION|Questions existentielles
Quand la vie devient lourde, on cherche parfois “pourquoi”. Quelques idées :

• Ramener le présent : une action petite mais réelle aujourd’hui.
• Parler : partager avec quelqu’un peut alléger le poids.
• Se former : apprendre, lire, écouter, approfondir.
• Accueillir les émotions : elles sont des signaux, pas des ennemies.

Posez votre question : on échange avec respect.`,
  },
  {
    title: 'Langues & traditions : apprendre autrement',
    content: `#theme:CULTURE|Langues & Traditions
La culture, c’est une façon de se comprendre.

• Partagez une tradition de votre région et son histoire.
• Quel mot vous touche ? Expliquez ce qu’il signifie.
• Apprendre une langue : commencez par de petites phrases utiles.
• Encourager : tout le monde progresse à son rythme.

Quels trésors culturels voulez-vous partager ?`,
  },
  {
    title: 'Musique & arts : créer du lien',
    content: `#theme:CULTURE|Musique & Arts
La musique et les arts rassemblent. Voici comment transformer une découverte en partage :

• Partagez un morceau (ou un artiste) qui vous a aidé.
• Expliquez pourquoi : l’émotion, le souvenir, la leçon.
• Lancez une discussion : que fait cet art en vous ?
• Respectez les goûts : chacun a son chemin.

Quel est votre “chanson de soutien” ?`,
  },
  {
    title: 'Santé sexuelle : consentement et respect',
    content: `#theme:SANTE SEXUELLE|Consentement & Relations
Ici, on parle avec respect et sans jugement.

• Le consentement est clair, libre et réversible.
• La communication est essentielle : demander, écouter, vérifier.
• La prévention (selon recommandations) protège.
• En cas de doute, cherchez des informations fiables et posez des questions.

Partagez vos conseils et ressources utiles en commentaire.`,
  },
  {
    title: 'Amitié : trouver sa place dans la communauté',
    content: `#theme:AMITIE|Rencontres
L’amitié se construit. Quelques idées pour démarrer :

• Soyez authentique : partagez vos centres d’intérêt.
• Commencez petit : un message, un commentaire, une question.
• Respectez les rythmes : tout le monde ne réagit pas pareil.
• Soutenez : les encouragements comptent vraiment.

Qu’est-ce que vous aimez partager avec les autres ?`,
  },
];

module.exports = defaultTopics;
