import { City } from "./city.model";
import { IUser } from "./user.model";

export interface IFavorite {
  id?: { user_id: number, city_id: number};
  user_id?: number;
  city_id?: number;
  city_name?: string;
  city_state?: string;
  city?: City
}

export interface FavoriteTableItem {
  city_name: string;
  actions: string;
  city_state: string;
}
