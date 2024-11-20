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
    return {
      success: false,
      message: AxiosError.from(error).message,
    } as ErrorResponse;
  }
};

interface Profile {
  avatar?: string;
  signature?: string;
  links?: string[];
  nickname?: string;
  sex?: boolean;
  birthday?: string;
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
    return {
      success: false,
      message: AxiosError.from(error).message,
    };
  }
};
