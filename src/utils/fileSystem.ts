interface FileSystemOptions {
  baseDirectory?: string;
  maxFileSize?: number;
  allowedExtensions?: string[];
}

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
  isDirectory: boolean;
}

class FileSystemManager {
  private static instance: FileSystemManager;
  private options: FileSystemOptions;

  private constructor(options: FileSystemOptions = {}) {
    this.options = {
      baseDirectory: options.baseDirectory || 'recordings',
      maxFileSize: options.maxFileSize || 1024 * 1024 * 1024, // 1GB
      allowedExtensions: options.allowedExtensions || ['mp4', 'gif', 'webm'],
    };
  }

  static getInstance(options?: FileSystemOptions): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager(options);
    }
    return FileSystemManager.instance;
  }

  // File operations
  async saveFile(file: Blob, filename: string): Promise<string> {
    try {
      // Validate file size
      if (file.size > this.options.maxFileSize!) {
        throw new Error(`File size exceeds maximum allowed size of ${this.options.maxFileSize} bytes`);
      }

      // Validate file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      if (!extension || !this.options.allowedExtensions!.includes(extension)) {
        throw new Error(`File extension not allowed. Allowed extensions: ${this.options.allowedExtensions!.join(', ')}`);
      }

      // Create directory if it doesn't exist
      await this.createDirectory(this.options.baseDirectory!);

      // Generate unique filename
      const uniqueFilename = await this.generateUniqueFilename(filename);
      const filePath = `${this.options.baseDirectory}/${uniqueFilename}`;

      // Save file
      const buffer = await file.arrayBuffer();
      await window.electron.saveFile(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async loadFile(filePath: string): Promise<Blob> {
    try {
      const buffer = await window.electron.loadFile(filePath);
      return new Blob([buffer]);
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await window.electron.deleteFile(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Directory operations
  async createDirectory(path: string): Promise<void> {
    try {
      await window.electron.createDirectory(path);
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  async listDirectory(path: string): Promise<FileInfo[]> {
    try {
      return await window.electron.listDirectory(path);
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  }

  async deleteDirectory(path: string): Promise<void> {
    try {
      await window.electron.deleteDirectory(path);
    } catch (error) {
      console.error('Error deleting directory:', error);
      throw error;
    }
  }

  // File information operations
  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      return await window.electron.getFileInfo(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  async getDirectorySize(path: string): Promise<number> {
    try {
      return await window.electron.getDirectorySize(path);
    } catch (error) {
      console.error('Error getting directory size:', error);
      throw error;
    }
  }

  // File system utilities
  private async generateUniqueFilename(filename: string): Promise<string> {
    const extension = filename.split('.').pop();
    const baseName = filename.slice(0, -(extension!.length + 1));
    let counter = 1;
    let uniqueFilename = filename;

    while (await this.fileExists(uniqueFilename)) {
      uniqueFilename = `${baseName}_${counter}.${extension}`;
      counter++;
    }

    return uniqueFilename;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.getFileInfo(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // File system validation
  validateFilePath(filePath: string): boolean {
    // Check for path traversal
    if (filePath.includes('..')) {
      return false;
    }

    // Check for allowed extensions
    const extension = filePath.split('.').pop()?.toLowerCase();
    if (!extension || !this.options.allowedExtensions!.includes(extension)) {
      return false;
    }

    return true;
  }

  validateDirectoryPath(path: string): boolean {
    // Check for path traversal
    if (path.includes('..')) {
      return false;
    }

    return true;
  }

  // File system cleanup
  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = `${this.options.baseDirectory}/temp`;
      if (await this.fileExists(tempDir)) {
        await this.deleteDirectory(tempDir);
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      throw error;
    }
  }

  // File system monitoring
  async watchDirectory(path: string, callback: (event: string, filePath: string) => void): Promise<void> {
    try {
      await window.electron.watchDirectory(path, callback);
    } catch (error) {
      console.error('Error watching directory:', error);
      throw error;
    }
  }

  async unwatchDirectory(path: string): Promise<void> {
    try {
      await window.electron.unwatchDirectory(path);
    } catch (error) {
      console.error('Error unwatching directory:', error);
      throw error;
    }
  }
}

export const fileSystemManager = FileSystemManager.getInstance(); 