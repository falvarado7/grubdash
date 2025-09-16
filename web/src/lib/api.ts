import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function getJSON<T>(url: string): Promise<T> {
  const res = await api.get(url);
  return (res.data?.data ?? res.data) as T; // handles both {data:…} and raw
}

export async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await api.post(url, body);
  return (res.data?.data ?? res.data) as T;
}

export async function putJSON<T>(url: string, body: any): Promise<T> {
  const res = await api.put(url, body);
  return (res.data?.data ?? res.data) as T;
}

export async function delJSON<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return (res.data?.data ?? res.data) as T;
}