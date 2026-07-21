import type { Lang } from "./types";

/** Long-form bilingual marketing content (source: StayOn advantage sheets). */

type Bi = Record<Lang, string>;
const bi = (en: string, fr: string): Bi => ({ en, fr });

export interface Feature {
  icon: string;
  title: Bi;
  points: Bi[];
}

/** How it works — 4 steps after the scan. */
export const STEPS: { n: string; title: Bi; text: Bi }[] = [
  {
    n: "01",
    title: bi("Scan", "Scanner"),
    text: bi(
      "The guest scans the discreet QR plaque in the room. No app to download.",
      "Le voyageur scanne la plaque QR discrète dans la chambre. Aucune app à télécharger."
    ),
  },
  {
    n: "02",
    title: bi("Choose", "Choisir"),
    text: bi(
      "Extend a night, pick a late checkout, or book a cleaning. Prices shown upfront.",
      "Prolonger d’une nuit, choisir un départ tardif, ou réserver un ménage. Prix affichés d’emblée."
    ),
  },
  {
    n: "03",
    title: bi("Pay", "Payer"),
    text: bi(
      "Secure payment in seconds — Apple Pay, Google Pay or card, powered by Stripe.",
      "Paiement sécurisé en quelques secondes — Apple Pay, Google Pay ou carte, via Stripe."
    ),
  },
  {
    n: "04",
    title: bi("Confirmed", "Confirmé"),
    text: bi(
      "Instant confirmation. No front desk, no messages, no friction.",
      "Confirmation immédiate. Pas de réception, pas de messages, zéro friction."
    ),
  },
];

/** Guest benefits (from AVANTAGES GUEST). */
export const GUEST_BENEFITS: Feature[] = [
  {
    icon: "◷",
    title: bi("Effortless", "Simplicité"),
    points: [
      bi("Extend in a few seconds via a QR code.", "Prolonger en quelques secondes via un QR code."),
      bi("Intuitive interface, no app to download.", "Interface intuitive, aucune app à télécharger."),
      bi("No paperwork, no complex exchanges.", "Aucune démarche administrative ni échange complexe."),
    ],
  },
  {
    icon: "⇌",
    title: bi("Maximum flexibility", "Flexibilité maximale"),
    points: [
      bi("Decide to stay at the last minute.", "Décider de prolonger à la dernière minute."),
      bi("A few hours or several days, as you wish.", "Quelques heures ou plusieurs jours selon vos besoins."),
      bi("No scramble to find another place.", "Plus besoin de chercher un autre logement en urgence."),
    ],
  },
  {
    icon: "☾",
    title: bi("Comfort & continuity", "Confort et continuité"),
    points: [
      bi("Stay in the same place, no repacking.", "Rester dans le même logement sans refaire ses bagages."),
      bi("No stress, no pointless move.", "Pas de stress, pas de déménagement inutile."),
      bi("Enjoy it fully until the last moment.", "Profiter pleinement jusqu’au dernier moment."),
    ],
  },
  {
    icon: "€",
    title: bi("Clear, fair pricing", "Tarification claire"),
    points: [
      bi("Prices shown right at extension.", "Prix affichés directement lors de la prolongation."),
      bi("No hidden fees or extra commission.", "Pas de frais cachés ni de commissions."),
      bi("Secure online payment.", "Paiement sécurisé en ligne."),
    ],
  },
  {
    icon: "✦",
    title: bi("High-end experience", "Expérience haut de gamme"),
    points: [
      bi("Premium service matching the home.", "Service premium qui reflète le standing du logement."),
      bi("A feeling of freedom and control.", "Sensation de liberté et de contrôle du séjour."),
      bi("An elegant, reassuring brand.", "Marque élégante et rassurante, digne des meilleurs hôtels."),
    ],
  },
];

/** Host & agency benefits (from AVANTAGES HOTE). */
export const HOST_BENEFITS: Feature[] = [
  {
    icon: "↗",
    title: bi("Extra revenue, no effort", "Revenu supplémentaire sans effort"),
    points: [
      bi("Extra nights booked straight from the room.", "Nuits supplémentaires réservées directement depuis le logement."),
      bi("100% collected by the host or agency.", "100 % du montant encaissé par l’hôte ou l’agence."),
      bi("Occupancy optimised, zero extra management.", "Taux d’occupation optimisé sans gestion supplémentaire."),
    ],
  },
  {
    icon: "⚡",
    title: bi("Zero logistics friction", "Zéro friction logistique"),
    points: [
      bi("Booking confirmed in seconds.", "Réservation confirmée en quelques secondes."),
      bi("No human intervention needed.", "Aucune intervention humaine nécessaire."),
      bi("Secure payment, terms set in advance.", "Paiement sécurisé, conditions définies à l’avance."),
    ],
  },
  {
    icon: "✦",
    title: bi("Brand elevation", "Valorisation de la marque"),
    points: [
      bi("A designed, discreet in-room object.", "Élément physique design et discret dans le logement."),
      bi("High-end, innovative positioning.", "Positionnement haut de gamme et innovant."),
      bi("A smooth, memorable guest experience.", "Expérience client fluide et mémorable."),
    ],
  },
  {
    icon: "◆",
    title: bi("Immediate edge", "Avantage concurrentiel"),
    points: [
      bi("Differentiating tech to win new guests.", "Technologie différenciante pour séduire de nouveaux clients."),
      bi("Stronger offer vs. classic platforms.", "Renforce l’attractivité face aux plateformes classiques."),
      bi("Exclusive marketing content.", "Contenu marketing exclusif à valoriser."),
    ],
  },
  {
    icon: "⚙",
    title: bi("Full control", "Contrôle total"),
    points: [
      bi("Set price, rules and times freely.", "Définir librement tarif, règles et horaires."),
      bi("Instant activation / deactivation.", "Activation/désactivation instantanée."),
      bi("Simple for staff to run.", "Gestion simplifiée pour le personnel."),
    ],
  },
  {
    icon: "⛓",
    title: bi("OTA independence", "Indépendance vis-à-vis des OTA"),
    points: [
      bi("Extend without Airbnb, Booking, etc.", "Prolonger sans passer par Airbnb, Booking, etc."),
      bi("Fewer commissions to pay out.", "Réduction des commissions à reverser."),
      bi("A direct relationship with the guest.", "Relation directe avec le client."),
    ],
  },
];

export interface Testimonial {
  quote: Bi;
  name: string;
  role: Bi;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: bi(
      "We added €2,300 in a single month across 14 apartments — with zero extra work.",
      "On a ajouté 2 300 € en un mois sur 14 appartements — sans aucun travail en plus."
    ),
    name: "Élodie M.",
    role: bi("Concierge agency · Paris", "Agence de conciergerie · Paris"),
  },
  {
    quote: bi(
      "Guests love it. Extending is now a one-tap decision instead of a phone call.",
      "Les voyageurs adorent. Prolonger, c’est un tap au lieu d’un appel."
    ),
    name: "Marco B.",
    role: bi("Superhost · 9 listings", "Superhost · 9 logements"),
  },
  {
    quote: bi(
      "The plaque looks premium in the room. It reflects our standing perfectly.",
      "La plaque fait vraiment premium dans la chambre. Elle reflète parfaitement notre standing."
    ),
    name: "Nina & Paul",
    role: bi("Boutique aparthotel", "Aparthôtel boutique"),
  },
];

export const PRICING = {
  free: {
    name: bi("Free for hosts & agencies", "Gratuit pour hôtes & agences"),
    price: "€0",
    per: bi("no monthly fee, ever", "aucun abonnement, jamais"),
    features: [
      bi("Unlimited apartments", "Logements illimités"),
      bi("Unique QR + printable plaque per apartment", "QR unique + plaque imprimable par logement"),
      bi("Full dashboard & real bookings", "Dashboard complet & vraies réservations"),
      bi("iCal / PMS availability sync", "Synchro dispo iCal / PMS"),
      bi("Secure Stripe payments", "Paiements sécurisés Stripe"),
    ],
    cta: bi("Start free", "Commencer gratuitement"),
  },
  commission: bi(
    "StayOn only earns a small commission on each booking — nothing to set up, and nothing unless you earn.",
    "StayOn se rémunère uniquement via une petite commission sur chaque réservation — rien à l'installation, rien tant que vous ne gagnez pas."
  ),
};

export function pick(b: Bi, lang: Lang) {
  return b[lang];
}
