import {
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function Dashboard() {
  const stats = [
    {
      title: "Total Sales",
      value: "$12,345",
      icon: ChartBarIcon,
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Active Orders",
      value: "25",
      icon: ShoppingCartIcon,
      change: "+5",
      changeType: "increase",
    },
    {
      title: "Products",
      value: "156",
      icon: CubeIcon,
      change: "+3",
      changeType: "increase",
    },
    {
      title: "Users",
      value: "2,456",
      icon: UsersIcon,
      change: "+15%",
      changeType: "increase",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold text-neutral-darkGray mt-1">
                  {stat.value}
                </h3>
              </div>
              <stat.icon className="h-8 w-8 text-primary-blue" />
            </div>
            <p
              className={`mt-2 text-sm ${
                stat.changeType === "increase"
                  ? "text-green-600"
                  : "text-highlight-red"
              }`}
            >
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((order) => (
                <tr key={order} className="text-gray-600">
                  <td className="py-3">ORD-{2024000 + order}</td>
                  <td>John Doe</td>
                  <td>
                    <span className="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td>${(Math.random() * 500).toFixed(2)}</td>
                  <td>Mar {order + 10}, 2024</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
