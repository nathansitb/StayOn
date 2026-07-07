import { LegalShell, Section } from "@/components/ui/LegalShell";

export const metadata = { title: "Mentions légales — StayOn" };

/**
 * ⚠️ CONFIG — le SEUL endroit à modifier.
 *
 * MODE = "individual"  → personne physique (avant création de la société).
 * MODE = "company"     → société créée : passe MODE à "company" et remplis le
 *                        bloc `company` avec tes vraies infos (SIREN, etc.).
 */
const MODE: "individual" | "company" = "individual";

const LEGAL = {
  // Commun
  editorEmail: "contact@stay-on.app",
  publicationDirector: "Nathan Sitbon",
  // Hébergeur (Vercel — à ne pas modifier sauf changement d'hébergeur)
  hostName: "Vercel Inc.",
  hostAddress: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
  hostSite: "https://vercel.com",

  // Mode "individual" (personne physique)
  individual: {
    name: "Nathan Sitbon",
    status: "Personne physique — activité en cours de création",
  },

  // Mode "company" — À REMPLIR le jour où la société existe
  company: {
    name: "[Dénomination sociale — ex. StayOn SAS]",
    form: "[Forme juridique — ex. SAS, SASU, micro-entreprise / EI]",
    capital: "[Capital social — ex. 1 000 € — ou « — »]",
    address: "[Adresse du siège — n°, rue, code postal, ville]",
    siren: "[SIREN / SIRET]",
    rcs: "[Ville du RCS — ou « — » si micro-entreprise]",
    vat: "[N° TVA intracommunautaire — ou « Non assujetti à la TVA »]",
  },
};

export default function MentionsLegalesPage() {
  return (
    <LegalShell title="Mentions légales" updated="Juillet 2026">
      <p>
        Conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la
        confiance dans l&apos;économie numérique (LCEN), les présentes mentions légales
        sont portées à la connaissance des utilisateurs du site{" "}
        <a href="https://stay-on.app" className="text-gold">stay-on.app</a>.
      </p>

      <Section title="Éditeur du site">
        <p>Le site StayOn est édité par :</p>
        {MODE === "individual" ? (
          <p>
            <b>{LEGAL.individual.name}</b>
            <br />
            Statut : {LEGAL.individual.status}
            <br />
            Contact :{" "}
            <a href={`mailto:${LEGAL.editorEmail}`} className="text-gold">
              {LEGAL.editorEmail}
            </a>
          </p>
        ) : (
          <p>
            <b>{LEGAL.company.name}</b>
            <br />
            Forme juridique : {LEGAL.company.form}
            <br />
            Capital social : {LEGAL.company.capital}
            <br />
            Siège social : {LEGAL.company.address}
            <br />
            SIREN / SIRET : {LEGAL.company.siren}
            <br />
            RCS : {LEGAL.company.rcs}
            <br />
            TVA intracommunautaire : {LEGAL.company.vat}
            <br />
            Email :{" "}
            <a href={`mailto:${LEGAL.editorEmail}`} className="text-gold">
              {LEGAL.editorEmail}
            </a>
          </p>
        )}
      </Section>

      <Section title="Directeur de la publication">
        <p>{LEGAL.publicationDirector}</p>
      </Section>

      <Section title="Hébergeur">
        <p>
          Le site est hébergé par :
          <br />
          <b>{LEGAL.hostName}</b>
          <br />
          {LEGAL.hostAddress}
          <br />
          <a href={LEGAL.hostSite} className="text-gold" target="_blank" rel="noreferrer">
            {LEGAL.hostSite}
          </a>
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site (marque StayOn, logo, textes,
          interface, code) est protégé par le droit de la propriété
          intellectuelle et reste la propriété exclusive de l&apos;éditeur, sauf
          mention contraire. Toute reproduction ou représentation, totale ou
          partielle, sans autorisation écrite préalable, est interdite.
        </p>
      </Section>

      <Section title="Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans notre{" "}
          <a href="/privacy" className="text-gold">Politique de confidentialité</a>.
          Conformément au RGPD et à la loi « Informatique et Libertés », vous
          disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et
          d&apos;opposition sur vos données, en écrivant à{" "}
          <a href="mailto:privacy@stay-on.app" className="text-gold">privacy@stay-on.app</a>.
          Vous pouvez également introduire une réclamation auprès de la CNIL
          (<a href="https://www.cnil.fr" className="text-gold" target="_blank" rel="noreferrer">cnil.fr</a>).
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Le site utilise uniquement des cookies strictement nécessaires à son
          fonctionnement (authentification, sécurité). Il n&apos;utilise pas de
          cookies publicitaires ni de traceurs. Voir la{" "}
          <a href="/privacy" className="text-gold">Politique de confidentialité</a>.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations
          diffusées sur le site, sans pouvoir en garantir l&apos;exhaustivité. Le
          paiement est traité de manière sécurisée par Stripe ; StayOn ne conserve
          aucune donnée de carte bancaire.
        </p>
      </Section>
    </LegalShell>
  );
}
