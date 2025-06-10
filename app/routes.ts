import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    route("SignUp", "routes/register.tsx"),
    route("Login", "routes/loginRoute.tsx"),
    layout("routes/layout.tsx", [
      index("routes/home.tsx"),
      //route("Home", "routes/home.tsx"),
      route("product", "routes/product.tsx"),
      route("customer", "routes/customer.tsx"),
      route("order", "routes/order.tsx"), 
      route("cart", "routes/cart.tsx")
    ])
] satisfies RouteConfig;
