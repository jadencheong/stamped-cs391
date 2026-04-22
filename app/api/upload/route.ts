import { NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

/* created by Alen */
/* this is the api call route for uploading images for posts */

//this is just everything to connect the cloudinary account
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        //formData will read the images since images are binary data
        //form data is read then the file is taken from it
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({error: 'No file was provided'}, {status: 400});
        }

        // allowed types
        // we agreed on jpeg and png, but I went ahead and added heic because ik many smartphones use heic
        // I imported a convertor to make this work
        const allowedTypes = ['image/png', 'image/jpeg', 'image/heic'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {error: 'Only JPG, PNG and HEIC files are allowed'},
                {status: 400}
            );
        }

        //cloudinary takes images as base64 strings
        let base64: string;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: 'stamped',
            format: 'jpg',
            //this will be in a folder in cloudinary dashboard and in the format of jpg
        });

        return NextResponse.json({url: result.secure_url});

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed'}, { status: 500 })
    }
}