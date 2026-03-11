import { useState, useEffect } from "react";

export interface LoggedInUser {
  token?: string;
  username: string;
  crn_type?: string;
  crn_id?: string;
  other?: {
    m_v?: boolean | string;
    e_v?: boolean | string;
    c_p?: boolean | string;
  };
  [key: string]: unknown;
}

export function useUser() {
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedinUser");
    if (storedUser) {
      try {
        const decoded = atob(storedUser);
        if (decoded) setUser(JSON.parse(decoded));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const saveUser = (userData: LoggedInUser | null) => {
    if (userData) {
      localStorage.setItem("loggedinUser", btoa(JSON.stringify(userData)));
      setUser(userData);
    } else {
      localStorage.removeItem("loggedinUser");
      setUser(null);
    }
  };

  const clearUser = () => {
    localStorage.removeItem("loggedinUser");
    setUser(null);
  };

  return { user, saveUser, clearUser };
}
