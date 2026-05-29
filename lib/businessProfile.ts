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
};

export const defaultBusinessProfile: BusinessProfile = "Autre";

export const businessProfiles: BusinessProfileDefinition[] = [
  {
    profile: "Assemblage de meubles",
    revenues: ["Revenus de service", "Pourboires", "Frais de déplacement facturés"],
    expenses: ["Outils", "Fournitures", "Essence / déplacement", "Publicité", "Téléphone", "Assurance", "Frais de plateforme"]
  },
  {
    profile: "Nettoyage",
    revenues: ["Revenus de service", "Contrats réguliers", "Pourboires"],
    expenses: ["Produits de nettoyage", "Transport", "Publicité", "Équipement", "Assurance"]
  },
  {
    profile: "Livraison",
    revenues: ["Revenus de livraison", "Pourboires", "Bonus"],
    expenses: ["Essence", "Entretien véhicule", "Téléphone", "Assurance", "Frais de plateforme"]
  },
  {
    profile: "Services informatiques",
    revenues: ["Revenus de service", "Consultation", "Support technique"],
    expenses: ["Logiciels", "Matériel informatique", "Internet", "Publicité", "Formation"]
  },
  {
    profile: "Vente en ligne",
    revenues: ["Ventes de produits", "Frais d'expédition facturés"],
    expenses: ["Inventaire", "Emballage", "Expédition", "Publicité", "Frais de plateforme"]
  },
  {
    profile: "Autre",
    revenues: ["Revenus de service", "Ventes", "Pourboires"],
    expenses: ["Fournitures", "Transport", "Publicité", "Téléphone", "Assurance", "Frais de plateforme"]
  }
];

export const businessProfileNames = businessProfiles.map((definition) => definition.profile);

export const isBusinessProfile = (value: unknown): value is BusinessProfile =>
  typeof value === "string" && businessProfileNames.includes(value as BusinessProfile);

export const getBusinessProfileDefinition = (profile: BusinessProfile) =>
  businessProfiles.find((definition) => definition.profile === profile) ??
  businessProfiles.find((definition) => definition.profile === defaultBusinessProfile)!;
