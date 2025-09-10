import { cookies } from "next/headers";
import { AuthProvider } from "../providers/AuthProvider";
import { COOKIE_KEYS } from "../utils/cookieUtils";

interface ServerAuthWrapperProps {
  children: React.ReactNode;
}

export default async function ServerAuthWrapper({
  children,
}: ServerAuthWrapperProps) {
  const cookieStore = await cookies();

  // Read authentication cookies on the server
  const authToken = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  const isLoggedIn =
    cookieStore.get(COOKIE_KEYS.IS_LOGGED_IN)?.value === "true";
  const userDataCookie = cookieStore.get(COOKIE_KEYS.USER_DATA)?.value;

  // Parse user data if it exists
  let userData = null;
  if (userDataCookie) {
    try {
      userData = JSON.parse(userDataCookie);
    } catch (error) {
      console.error("Error parsing user data cookie:", error);
    }
  }

  // Determine initial auth state
  const initialAuth = !!(authToken && isLoggedIn);

  return (
    <AuthProvider
      initialAuth={initialAuth}
      initialToken={authToken}
      initialUserData={userData}
    >
      {children}
    </AuthProvider>
  );
}
