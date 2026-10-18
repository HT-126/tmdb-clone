import {
  Navigate,
  useLocation,
} from "react-router-dom";

import useMe from "../hooks/useMe";

import LoadingScreen from "./LoadingScreen";

// Shows its children only to a logged-in user; everybody else goes to /login
// (and comes back to this page after logging in).
function RequireAuth({ children }) {
  const { data: user, isPending } = useMe();
  const location = useLocation();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

export default RequireAuth;
