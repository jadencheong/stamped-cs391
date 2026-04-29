import { NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

/* created by Alen */
/* this is the api call route for uploading images for posts */

/**
 * uploads to Cloudinary are returns the hosted URL
 * URL is saved in the post's images array in MongoDB
 *
 * Cloudinary was used because if we load MongoDB with image files we will likely run out of space
 * Cloudinary hosts the files and just gives us back a URL
 * MongoDB only has to sore the URL string
 *
 * major companies such as Adidas use cloudinary and their free tier is generous
 * I believe we have up to 25gb of image and video uploads per 30 days
 */
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
        // cloudinary should handle heic conversion server side
        const allowedTypes = ['image/png', 'image/jpeg', 'image/heic'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {error: 'Only JPG, PNG and HEIC files are allowed'},
                {status: 400}
            );
        }

        //cloudinary takes images as base64 strings
        //arrayBuffer() reads the raw binary data
        //Buffer.from() converts it to a Node.js buffer
        // toString('base64') will encode it as a base64 string
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        //upload to cloudinary and let it convert everything to jpg format
        const result = await cloudinary.uploader.upload(base64, {
            folder: 'stamped',
            format: 'jpg',
            //this will be in a folder in cloudinary dashboard and in the format of jpg
        });

        // return the Cloudinary hosted url to be saved in mongo
        // secure_url is always https
        return NextResponse.json({url: result.secure_url});

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed'}, { status: 500 })
    }
}