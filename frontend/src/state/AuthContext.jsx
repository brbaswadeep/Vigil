import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  let role = 'Guest';
  if (currentUser) {
    if (currentUser.uid === 'ApbIQGFmy0deWSDHiRZDTR2SvtL2') {
      role = 'Expert Analyst';
    } else if (currentUser.uid === 'BaOpadJijgYFIooYIisjgw7EBnt2') {
      role = 'Regular Analyst';
    } else {
      role = 'Analyst';
    }
  }

  const value = {
    currentUser,
    role,
    isRegular: role === 'Regular Analyst'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
