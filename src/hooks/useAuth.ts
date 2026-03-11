const useAuth = () => {
  const token = localStorage.getItem("token");
  const loggedinUser = localStorage.getItem("loggedinUser");
  return !!token || !!loggedinUser;
};

export default useAuth;
