declare module 'browser-image-compression' {
  export interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    exifOrientation?: number;
    fileType?: string;
    quality?: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  }

  /**
   * Compress an image file
   * @param file The image file to compress
   * @param options Compression options
   * @returns A Promise that resolves to the compressed file
   */
  export default function imageCompression(
    file: File,
    options: Options
  ): Promise<File>;

  /**
   * Get the orientation of an image file
   * @param file The image file
   * @returns A Promise that resolves to the orientation
   */
  export function getExifOrientation(file: File): Promise<number>;

  /**
   * Draw an image on a canvas with the specified orientation
   * @param context The canvas context
   * @param img The image element
   * @param orientation The orientation
   * @param x The x coordinate
   * @param y The y coordinate
   * @param width The width
   * @param height The height
   */
  export function drawImageInCanvas(
    context: CanvasRenderingContext2D,
    img: HTMLImageElement,
    orientation?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ): Promise<void>;

  /**
   * Convert a canvas to a file
   * @param canvas The canvas element
   * @param fileType The file type
   * @param fileName The file name
   * @param quality The quality
   * @returns A Promise that resolves to the file
   */
  export function canvasToFile(
    canvas: HTMLCanvasElement,
    fileType: string,
    fileName: string,
    quality?: number
  ): Promise<File>;
}
