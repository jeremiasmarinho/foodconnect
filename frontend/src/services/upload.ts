import { apiClient } from "../api/client";
import { ApiResponse } from "../types";

export interface UploadResponse {
  filename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

export class UploadService {
  // Upload de imagem única
  static async uploadImage(
    imageUri: string,
    type: "avatar" | "post" = "post"
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();

      // Criar objeto de arquivo para upload
      const file = {
        uri: imageUri,
        type: "image/jpeg",
        name: `image_${Date.now()}.jpg`,
      } as any;

      formData.append("file", file);

      const endpoint =
        type === "avatar" ? "/upload/avatar" : "/upload/post-image";

      const response = await apiClient.post<UploadResponse>(
        endpoint,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Erro ao fazer upload da imagem",
      };
    }
  }

  // Upload de múltiplas imagens
  static async uploadMultipleImages(
    imageUris: string[]
  ): Promise<ApiResponse<UploadResponse[]>> {
    try {
      const formData = new FormData();

      imageUris.forEach((uri, index) => {
        const file = {
          uri,
          type: "image/jpeg",
          name: `image_${Date.now()}_${index}.jpg`,
        } as any;

        formData.append("files", file);
      });

      const response = await apiClient.post<UploadResponse[]>(
        "/upload/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Erro ao fazer upload das imagens",
      };
    }
  }

  // Upload para restaurante
  static async uploadRestaurantImage(
    imageUri: string
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();

      const file = {
        uri: imageUri,
        type: "image/jpeg",
        name: `restaurant_${Date.now()}.jpg`,
      } as any;

      formData.append("file", file);

      const response = await apiClient.post<UploadResponse>(
        "/upload/restaurant-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erro ao fazer upload da imagem do restaurante",
      };
    }
  }

  // Obter metadados de upload
  static async getUploadMetadata(): Promise<
    ApiResponse<{ maxFileSize: number; allowedTypes: string[] }>
  > {
    try {
      const response = await apiClient.get<{
        maxFileSize: number;
        allowedTypes: string[];
      }>("/upload/metadata");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao obter metadados",
      };
    }
  }

  // Deletar arquivo
  static async deleteFile(filename: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/upload/${filename}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar arquivo",
      };
    }
  }

  // Verificar se arquivo é uma imagem válida
  static isValidImage(uri: string): boolean {
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const lowerUri = uri.toLowerCase();
    return validExtensions.some((ext) => lowerUri.includes(ext));
  }

  // Redimensionar URI de imagem (se disponível no backend)
  static getResizedImageUrl(
    originalUrl: string,
    width: number,
    height?: number
  ): string {
    if (!originalUrl) return "";

    // Se for uma URL do nosso backend, adicionar parâmetros de redimensionamento
    if (
      originalUrl.includes("localhost:3001") ||
      originalUrl.includes("upload/")
    ) {
      const separator = originalUrl.includes("?") ? "&" : "?";
      let params = `${separator}w=${width}`;
      if (height) {
        params += `&h=${height}`;
      }
      return `${originalUrl}${params}`;
    }

    return originalUrl;
  }

  // Obter thumbnail
  static getThumbnailUrl(originalUrl: string): string {
    return this.getResizedImageUrl(originalUrl, 300, 300);
  }

  // Obter versão WebP (se suportada)
  static getWebPUrl(originalUrl: string): string {
    if (!originalUrl) return "";

    if (
      originalUrl.includes("localhost:3001") ||
      originalUrl.includes("upload/")
    ) {
      const separator = originalUrl.includes("?") ? "&" : "?";
      return `${originalUrl}${separator}format=webp`;
    }

    return originalUrl;
  }
}
