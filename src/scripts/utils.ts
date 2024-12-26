/*****************************************************************************
 * AlgoHub: Cross-platform online judge cilent based on Tauri
 * Copyright (C) 2024 Association of Computing Machinery affiliated SWPU
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *****************************************************************************/

import { AxiosError } from "axios";
import type { ErrorResponse } from "@/scripts/api";
import { config } from "@/config";
import { useAccountStore } from "./store";

export const handleAxiosError = (error: AxiosError) => {
  const data = error.response?.data as ErrorResponse;
  const status = error.response?.status;
  const accountStore = useAccountStore();
  if (status === 401) {
    accountStore.logout();
    return {
      success: false,
      message: "Unauthorized: " + (data?.message ?? "Invalid token"),
    } as ErrorResponse;
  }
  return {
    success: false,
    message:
      AxiosError.from(error).message +
      ": " +
      (data?.message || "Unknown error"),
  } as ErrorResponse;
};

export const withoutHeadSlash = (url: string) => {
  return url.startsWith("/") && url.length > 1 ? url.slice(1) : url;
};

export const expandUrl = (url?: string) => {
  return config.base + withoutHeadSlash(url ?? "");
};

export const expandAssetUrl = (url: string) => {
  return config.base + withoutHeadSlash(`asset/${url}`);
};
