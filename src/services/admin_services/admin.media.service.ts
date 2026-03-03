import axios from "axios";
import { API_BASE } from "@/configs/api-configs";

/**
 * Upload an image file to Cloudinary via the backend.
 * @param file  The File object from an <input type="file"> or drag-drop
 * @param folder  Cloudinary folder name (default "campaigns")
 * @returns  The secure CDN URL of the uploaded image
 */
export async function uploadImage(file: File, folder = "campaigns"): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await axios.post<{ url: string }>(
    `${API_BASE}/api/admin/media/upload?folder=${encodeURIComponent(folder)}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data.url;
}
