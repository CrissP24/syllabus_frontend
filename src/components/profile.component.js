import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const Profile = () => {
  const [redirect, setRedirect] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      setRedirect("/home");
    } else {
      setCurrentUser(user);
      setUserReady(true);
    }
  }, []);

  if (redirect) return <Navigate to={redirect} />;

  return (
    <div className="container py-5">
      {userReady && currentUser && (
        <div className="card shadow p-4">
          <h3 className="mb-4">
            Perfil de <strong>{currentUser.username}</strong>
          </h3>
          <p>
            <strong>Token:</strong>{" "}
            {currentUser.accessToken?.substring(0, 20)}...
            {currentUser.accessToken?.substring(currentUser.accessToken.length - 20)}
          </p>
          <p>
            <strong>ID:</strong> {currentUser.id}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <div>
            <strong>Roles:</strong>
            <ul>
              {currentUser.roles?.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
