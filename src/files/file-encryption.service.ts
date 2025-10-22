import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class FileEncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor() {
    const encryptionKey = process.env.FILE_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(buffer: Buffer): { encrypted: Buffer; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  decrypt(encrypted: Buffer, iv: string): Buffer {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
