import { AxiosError } from "axios";
import axios from "./axios";

interface Response<D> {
  success: boolean;
  message: string;
  data?: D;
}

type ErrorResponse = Response<undefined>;

interface Register {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  token: string;
}

export const register = async (form: Register) => {
  try {
    const response = await axios.post("/account/create", {
      username: form.username,
      email: form.email,
      password: form.password,
    });
    return response.data as Response<RegisterResponse>;
  } catch (error) {
    return {
      success: false,
      message: AxiosError.from(error).message,
    } as ErrorResponse;
  }
};
