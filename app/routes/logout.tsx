import { redirect } from "react-router";
import { logout } from "~/utils/auth";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}

export function loader({}: Route.LoaderArgs) {
  return redirect("/");
}
