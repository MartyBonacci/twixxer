import { redirect } from "react-router";
import { logout } from "~/utils/auth";

// Since we don't have type generation yet
type RouteArgs = any;
type Route = {
  ActionArgs: RouteArgs;
};

export async function action({ request }: Route["ActionArgs"]) {
  return logout(request);
}

export function loader() {
  return redirect("/");
}