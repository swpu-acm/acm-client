import { AxiosError } from "axios";
import axios from "@/scripts/axios";
import { handleAxiosError } from "@/scripts/utils";

export interface Response<D> {
  success: boolean;
  message: string;
  data?: D;
}

export type ErrorResponse = Response<undefined>;

interface Register {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
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
    return response.data as Response<AuthResponse>;
  } catch (error) {
    return handleAxiosError(AxiosError.from(error));
  }
};

interface UploadAvatar {
  id: string;
  token: string;
  file: File;
}

interface UploadAvatarResponse {
  uri: string;
}

export const uploadAvatar = async (form: UploadAvatar) => {
  try {
    const response = await axios.put("/account/content/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as Response<UploadAvatarResponse>;
  } catch (error) {
    return handleAxiosError(AxiosError.from(error));
  }
};

interface Profile {
  avatar?: string;
  signature?: string;
  links?: string[];
  nickname?: string;
  sex?: boolean;
  // birthday?: string;
  name?: string;
  student_id?: string;
  school?: string;
  college?: string;
  major?: string;
}

interface ProfileForm {
  id: string;
  token: string;
  profile: Profile;
}

export const updateProfile = async (form: ProfileForm) => {
  try {
    const response = await axios.post("/account/profile", form);
    return response.data as Response<undefined>;
  } catch (error) {
    return handleAxiosError(AxiosError.from(error));
  }
};

interface LoginForm {
  identity: string;
  password: string;
}

export const login = async (form: LoginForm) => {
  try {
    const response = await axios.post("/account/login", form);
    return response.data as Response<AuthResponse>;
  } catch (error) {
    return handleAxiosError(AxiosError.from(error));
  }
};

export const fetchProfile = async (form: AuthResponse) => {
  try {
    const response = await axios.post(`/account/profile/${form.id}`, {
      token: form.token,
    });
    return response.data as Response<Profile>;
  } catch (error) {
    return handleAxiosError(AxiosError.from(error));
  }
};
