import { AxiosError } from "axios";
import type { ErrorResponse } from "@/scripts/api";

export const handleAxiosError = (error: AxiosError) => {
  const data = error.response?.data as ErrorResponse;
  return {
    success: false,
    message:
      AxiosError.from(error).message + ": " + data?.message || "Unknown error",
  } as ErrorResponse;
};
