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
  startTime: string;
  endTime?: string;
  venue: string;
  address: string;
  neighborhood: string;
  ageGroup: string;
  registrationRequired: boolean;
  sourceUrl: string;
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
};
