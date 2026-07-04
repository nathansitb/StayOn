export interface DbApartment {
  id: string;
  public_code: string;
  name: string;
  location: string | null;
  image_url: string | null;
  extend_price: number;
  extra_night: boolean;
  late_checkout: boolean;
  cleaning: boolean;
  ical_url: string | null;
  agency_id: string;
}
