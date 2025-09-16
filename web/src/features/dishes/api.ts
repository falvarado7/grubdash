import { getJSON, postJSON, putJSON, delJSON } from "../../lib/api";


export type Dish = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
};
export type DishInput = Omit<Dish, "id">;

export const listDishes = () => getJSON<Dish[]>("/dishes");
export const createDish = (payload: DishInput) => postJSON<Dish>("/dishes", payload);
export const updateDish = (id: number, payload: DishInput) => putJSON<Dish>(`/dishes/${id}`, payload);
export const deleteDish = (id: number) => delJSON<void>(`/dishes/${id}`);
