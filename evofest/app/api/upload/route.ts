import { NextResponse } from 'next/server';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import  cloudinary  from '../../../lib/config/cloudinary'

function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadResults: string[] = [];

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed with no error or result'));
          }
        );
        bufferToStream(buffer).pipe(stream);
      });

      if (result.secure_url) {
        uploadResults.push(result.secure_url);
      }
    }

    return NextResponse.json({ 
        success: true,
        urls: uploadResults,
        message: 'Images & Videos are uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
        success: false,
        message: 'Failed to upload files' 
    });
  }
}
