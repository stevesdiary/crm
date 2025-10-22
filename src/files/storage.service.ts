import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private s3: S3;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.B2_BUCKET_NAME || 'crm-files';
    this.s3 = new S3({
      endpoint: process.env.B2_ENDPOINT || 's3.us-west-002.backblazeb2.com',
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APPLICATION_KEY,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadFile(file: any, tenantId: string): Promise<string> {
    const fileKey = this.generateFileKey(file.originalname, tenantId);
    
    await this.s3.putObject({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        tenantId,
      },
    }).promise();
    
    return fileKey;
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const response = await this.s3.getObject({
      Bucket: this.bucketName,
      Key: fileKey,
    }).promise();
    
    return response.Body as Buffer;
  }

  async deleteFile(fileKey: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: fileKey,
    }).promise();
  }

  getSignedUrl(fileKey: string, expiresIn: number = 3600): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: expiresIn,
    });
  }

  private generateFileKey(originalName: string, tenantId: string): string {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    return `${tenantId}/${timestamp}-${hash}.${extension}`;
  }
}