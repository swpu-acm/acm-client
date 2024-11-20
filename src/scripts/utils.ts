import { AxiosError } from "axios";
import type { ErrorResponse } from "@/scripts/api";
import { config } from "@/config";

export const handleAxiosError = (error: AxiosError) => {
  const data = error.response?.data as ErrorResponse;
  return {
    success: false,
    message:
      AxiosError.from(error).message + ": " + data?.message || "Unknown error",
  } as ErrorResponse;
};

export const withoutHeadSlash = (url: string) => {
  return url.startsWith("/") && url.length > 1 ? url.slice(1) : url;
};

export const expandUrl = (url?: string) => {
  return config.base + withoutHeadSlash(url ?? "");
};
