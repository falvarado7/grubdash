import Header from "../components/Header";
import DashboardOrders from "../components/DashboardOrders";
import DashboardDishes from "../components/DashboardDishes";

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 space-y-6">
        <DashboardOrders />
        <DashboardDishes />
      </main>
    </>
  );
}