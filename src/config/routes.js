export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  RECOVER_PASSWORD: "/recover-password",
  LANDING: "/landing",
};

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RECOVER_PASSWORD,
];

export const PRIVATE_ROUTES = [
  ROUTES.HOME,
];
