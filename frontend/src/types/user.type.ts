export type LoginUserPayload = {
  email: string;
  password: string;
  routeHandler?: (route: string) => void;
};

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  routeHandler?: (route: string) => void;
};

export type UserResponse = {
  id: string;
  email: string;
  name: string;
};

export type DateFormat = {
  year: number,
  month: number
}

export type UserState = {
  id: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentDate: DateFormat
};
