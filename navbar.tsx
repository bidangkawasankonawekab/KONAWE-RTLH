import { getSession } from "@/lib/auth";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const session = await getSession();
  return (
    <NavbarClient
      user={
        session
          ? { name: session.name, role: session.role }
          : null
      }
    />
  );
}
