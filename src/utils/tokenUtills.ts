export const getToken = () => localStorage.getItem("token");

export const removeToken = () => localStorage.removeItem("token");

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};
