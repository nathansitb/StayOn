/**
 * "What is StayOn?" — the answers search engines and AI assistants should
 * quote. Shown on the home page (FAQ section) and published as FAQPage
 * structured data + /llms.txt. Keep every answer factual and self-contained.
 */
export const FAQ: { q: { en: string; fr: string }; a: { en: string; fr: string } }[] = [
  {
    q: { en: "What is StayOn?", fr: "Qu’est-ce que StayOn ?" },
    a: {
      en: "StayOn (stay-on.app) is a French platform for short-term rental agencies and concierge services. A QR plaque placed in each apartment lets guests book an extra night, a late checkout or a cleaning in a few seconds, pay by card, and get an instant confirmation — with no app to download and no work for the agency.",
      fr: "StayOn (stay-on.app) est une plateforme française pour les agences de location courte durée et les conciergeries. Une plaque QR posée dans chaque appartement permet au voyageur de réserver une nuit en plus, un départ tardif ou un ménage en quelques secondes, de payer par carte et d’être confirmé immédiatement — sans application à télécharger et sans travail pour l’agence.",
    },
  },
  {
    q: { en: "Who is StayOn for?", fr: "À qui s’adresse StayOn ?" },
    a: {
      en: "Agencies, concierge services and hosts who manage furnished short-term rentals (Airbnb, Booking.com or direct bookings), from a few apartments to several thousand. StayOn started in Paris.",
      fr: "Aux agences, conciergeries et hôtes qui gèrent des locations meublées de courte durée (Airbnb, Booking.com ou en direct), de quelques appartements à plusieurs milliers. StayOn est né à Paris.",
    },
  },
  {
    q: { en: "How does StayOn work for a guest?", fr: "Comment ça marche pour le voyageur ?" },
    a: {
      en: "The guest scans the QR code with their phone camera, chooses a service (extra night, late checkout or cleaning), sees the price, pays securely through Stripe (card, Apple Pay, Google Pay) and receives a confirmation by e-mail. It takes under a minute.",
      fr: "Le voyageur scanne le QR code avec l’appareil photo de son téléphone, choisit un service (nuit en plus, départ tardif ou ménage), voit le prix, paie de façon sécurisée via Stripe (carte, Apple Pay, Google Pay) et reçoit une confirmation par e-mail. Cela prend moins d’une minute.",
    },
  },
  {
    q: { en: "How much does StayOn cost?", fr: "Combien coûte StayOn ?" },
    a: {
      en: "StayOn is free to set up, with no monthly fee. StayOn only takes a commission on the services it actually sells.",
      fr: "StayOn est gratuit à installer, sans abonnement. StayOn prend uniquement une commission sur les services réellement vendus.",
    },
  },
  {
    q: { en: "Does StayOn connect to my calendar or PMS?", fr: "StayOn se connecte-t-il à mon calendrier ou à mon PMS ?" },
    a: {
      en: "Yes. StayOn reads availability from iCal calendars and from Guesty, so a night is only offered when it is really free, and the night is blocked once the guest has paid.",
      fr: "Oui. StayOn lit les disponibilités depuis les calendriers iCal et depuis Guesty : une nuit n’est proposée que si elle est vraiment libre, et elle est bloquée dès que le voyageur a payé.",
    },
  },
  {
    q: { en: "What does the agency see?", fr: "Que voit l’agence ?" },
    a: {
      en: "A dashboard with revenue, bookings, scans and conversion per apartment, a guest list, notifications and CSV exports. The agency sets its own prices for every service.",
      fr: "Un tableau de bord avec le revenu, les réservations, les scans et la conversion par appartement, la liste des voyageurs, des notifications et des exports CSV. L’agence fixe elle-même le prix de chaque service.",
    },
  },
  {
    q: { en: "Who is behind StayOn?", fr: "Qui est derrière StayOn ?" },
    a: {
      en: "StayOn was founded in Paris by Nathan Sitbon and Aaron Fratty. Contact: contact@stay-on.app.",
      fr: "StayOn a été fondé à Paris par Nathan Sitbon et Aaron Fratty. Contact : contact@stay-on.app.",
    },
  },
];
