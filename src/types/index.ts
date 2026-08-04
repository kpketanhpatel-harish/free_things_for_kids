export type Activity = {
  id: string;
  title: string;
  summary: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  neighborhood: string;
  ageGroup: string;
  registrationRequired: boolean;
  sourceUrl: string;
};

export type RestaurantOffer = {
  id: string;
  restaurantName: string;
  neighborhood: string;
  eligibleDays: string[];
  eligibleHours: string;
  offerSummary: string;
  adultPurchaseRequired: boolean;
  maximumChildAge?: number;
  dineInOnly: boolean;
  confirmed: boolean;
};
