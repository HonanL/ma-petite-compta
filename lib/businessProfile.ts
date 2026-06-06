export type BusinessProfile =
  | "Assemblage de meubles"
  | "Nettoyage"
  | "Livraison"
  | "Services informatiques"
  | "Vente en ligne"
  | "Autre";

export type BusinessProfileDefinition = {
  profile: BusinessProfile;
  revenues: string[];
  expenses: string[];
  examples: string[];
};

export const defaultBusinessProfile: BusinessProfile = "Autre";

export const businessProfiles: BusinessProfileDefinition[] = [
  {
    profile: "Assemblage de meubles",
    revenues: ["Revenus d'assemblage", "Revenus de service", "Pourboires", "Frais de déplacement facturés"],
    expenses: ["Outils", "Quincaillerie", "Équipement", "Transport", "Essence / déplacement", "Publicité", "Téléphone", "Assurance"],
    examples: ["Assemblage meuble IKEA", "Installation étagère", "Achat quincaillerie", "Transport chez client", "Achat perceuse"]
  },
  {
    profile: "Nettoyage",
    revenues: ["Revenus de nettoyage", "Revenus de service", "Contrats réguliers", "Pourboires"],
    expenses: ["Produits de nettoyage", "Transport", "Main-d'œuvre", "Publicité", "Équipement", "Assurance"],
    examples: ["Nettoyage bureau client", "Achat produits de nettoyage", "Transport vers client", "Achat aspirateur", "Publicité locale"]
  },
  {
    profile: "Livraison",
    revenues: ["Revenus de livraison", "Pourboires", "Bonus"],
    expenses: ["Essence", "Entretien véhicule", "Téléphone / internet", "Assurance", "Frais de plateforme"],
    examples: ["Paiement livraison client", "Achat essence", "Entretien véhicule", "Facture téléphone", "Assurance véhicule"]
  },
  {
    profile: "Services informatiques",
    revenues: ["Revenus de réparation", "Revenus de service", "Consultation", "Support technique"],
    expenses: ["Pièces informatiques", "Logiciels", "Outils", "Équipement", "Matériel informatique", "Internet", "Publicité", "Formation"],
    examples: ["Réparation ordinateur client", "Achat pièce de rechange", "Abonnement logiciel", "Achat outils", "Support technique"]
  },
  {
    profile: "Vente en ligne",
    revenues: ["Ventes de produits", "Frais d'expédition facturés"],
    expenses: ["Inventaire", "Emballage", "Expédition", "Publicité", "Frais de plateforme"],
    examples: ["Vente produit en ligne", "Achat inventaire", "Achat emballage", "Frais d'expédition", "Frais de plateforme"]
  },
  {
    profile: "Autre",
    revenues: ["Revenus de service", "Ventes", "Pourboires"],
    expenses: ["Fournitures", "Transport", "Publicité", "Téléphone", "Assurance", "Frais de plateforme"],
    examples: ["Paiement client", "Achat fournitures", "Transport", "Publicité", "Frais de plateforme"]
  }
];

export const businessProfileNames = businessProfiles.map((definition) => definition.profile);

export const isBusinessProfile = (value: unknown): value is BusinessProfile =>
  typeof value === "string" && businessProfileNames.includes(value as BusinessProfile);

export const getBusinessProfileDefinition = (profile: BusinessProfile) =>
  businessProfiles.find((definition) => definition.profile === profile) ??
  businessProfiles.find((definition) => definition.profile === defaultBusinessProfile)!;
