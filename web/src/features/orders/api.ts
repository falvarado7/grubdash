import { api } from "../../lib/api";

export const listOrders = async () => (await api.get("/orders")).data;         // { data: [...] }
export const createOrder = async (payload:any) => (await api.post("/orders", payload)).data; // raw (not {data:{}})
export const updateOrder = async (id:number, payload:any) => (await api.put(`/orders/${id}`, payload)).data;
export const deleteOrder = async (id:number) => (await api.delete(`/orders/${id}`)).data;