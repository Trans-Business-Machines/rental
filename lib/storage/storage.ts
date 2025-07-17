import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export class StorageService {
	async upload({
		fileBuffer,
		fileName,
		mimeType,
		folder,
	}: {
		fileBuffer: Buffer;
		fileName: string;
		mimeType: string;
		folder: string;
	}) {
		const key = `${folder}/${Date.now()}-${fileName}`;
		await s3.send(
			new PutObjectCommand({
				Bucket: BUCKET,
				Key: key,
				Body: fileBuffer,
				ContentType: mimeType,
			})
		);
		return {
			key,
			url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
		};
	}

	async delete(key: string) {
		await s3.send(
			new DeleteObjectCommand({
				Bucket: BUCKET,
				Key: key,
			})
		);
	}

	async getSignedUrl(key: string, expiresIn = 3600) {
		const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
		return getSignedUrl(s3, command, { expiresIn });
	}
}
