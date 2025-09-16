export const normDish = (d:any) => ({
  id: d.id ?? d.Id,
  name: d.name ?? d.Name,
  description: d.description ?? d.Description ?? "",
  price: d.price ?? d.Price ?? 0,
  image_url: d.image_url ?? d.Image_Url ?? "",
});

export const normOrder = (o:any) => ({
  id: o.id ?? o.Id,
  deliverTo: o.deliverTo ?? o.DeliverTo,
  mobileNumber: o.mobileNumber ?? o.MobileNumber,
  status: o.status ?? o.Status ?? "pending",
  dishes: (o.dishes ?? o.Dishes ?? []).map((d:any)=>({
    ...normDish(d),
    quantity: Number(d.quantity ?? d.Quantity ?? 1),
  }))
});