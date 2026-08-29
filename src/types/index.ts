export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type Activity = {
  id: string;
  title: string;
  summary: string;
  icon: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  address?: string;
  neighborhood: string;
  ageGroup: string;
  registrationRequired: boolean;
  sourceUrl: string;
  sourceName?: string;
  createdAt?: string;
};

export type RestaurantOffer = {
  id: string;
  restaurantName: string;
  neighborhood: string;
  eligibleDays: DayOfWeek[];
  eligibleHours: string;
  offerSummary: string;
  adultPurchaseRequired: boolean;
  maximumChildAge?: number;
  dineInOnly: boolean;
  confirmed: boolean;
  address?: string;
  website?: string;
  sourceUrl?: string;
  sourceName?: string;
  notes?: string;
  lastChecked?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
};

export type ConstructionSite = {
  id: string;
  siteId: string;
  title: string;
  summary?: string;
  address?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  projectType?: string;
  likelyMachinery?: string;
  activityStatus?: string;
  evidenceClass?: string;
  activeStart?: string;
  activeEnd?: string;
  viewingSuitability?: string;
  viewingSuitabilityScore?: number;
  kidInterestScore?: number;
  confidenceScore?: number;
  permitProjectIds?: string;
  sourceUrl?: string;
  sourceRecordDate?: string;
  lastChecked?: string;
  workDescription?: string;
  contractorAgency?: string;
  notes?: string;
};
