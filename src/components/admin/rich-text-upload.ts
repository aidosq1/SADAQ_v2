import { validateNewsImage, withImageExtension } from "@/lib/news-image";

// Загружает фото для текста новости и возвращает его адрес; текст ошибки — в Error.message
export async function uploadEditorImage(file: File, folder: string): Promise<string> {
  const validationError = validateNewsImage(file);
  if (validationError) throw new Error(validationError);

  const formData = new FormData();
  formData.append("file", file, withImageExtension(file.name, file.type));
  formData.append("folder", folder);

  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || "Ошибка загрузки");
  }
  return data.data.url as string;
}
