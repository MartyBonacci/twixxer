import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup?/:username", "routes/signup.tsx"),
  route("verify", "routes/verify.tsx"),
  route("resend-verification", "routes/resend-verification.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("feed", "routes/feed.tsx"),
  route("profile/:username?", "routes/profile.tsx"),
] satisfies RouteConfig;
