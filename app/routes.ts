import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "routes/signup.tsx"),
  route("verify", "routes/verify.tsx"),
  route("resend-verification", "routes/resend-verification.tsx")
] satisfies RouteConfig;
