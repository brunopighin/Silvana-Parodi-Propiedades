const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Limitar threads de Sharp para hosting compartido
sharp.concurrency(1);

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

const videosDir = path.join(__dirname, '../../uploads/videos');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG y WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

// Procesar imagen con Sharp y guardar en disco local
const processImage = async (buffer) => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

  const name = `${uuidv4()}.webp`;
  const thumbName = `thumb_${name}`;
  const fullPath = path.join(uploadsDir, name);
  const thumbPath = path.join(thumbnailsDir, thumbName);

  await sharp(buffer)
    .resize(1920, 1440, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(fullPath);

  await sharp(buffer)
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  return {
    url: `/uploads/${name}`,
    thumbnailUrl: `/uploads/thumbnails/${thumbName}`,
    filename: name,
  };
};

// Procesar imagen con Sharp y subir a Supabase Storage
const processWithSupabase = async (buffer, folder = 'properties') => {
  const supabaseAdmin = require('../lib/supabase');
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET;

  const name = `${uuidv4()}.webp`;
  const thumbName = `thumb_${name}`;

  const mainBuffer = await sharp(buffer)
    .resize(1920, 1440, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  const thumbBuffer = await sharp(buffer)
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const { error: mainError } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(`${folder}/${name}`, mainBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (mainError) throw mainError;

  const { error: thumbError } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(`${folder}/thumbnails/${thumbName}`, thumbBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (thumbError) throw thumbError;

  const { data: mainData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(`${folder}/${name}`);

  const { data: thumbData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(`${folder}/thumbnails/${thumbName}`);

  return {
    url: mainData.publicUrl,
    thumbnailUrl: thumbData.publicUrl,
    publicId: `${folder}/${name}`,
  };
};

// Procesar con Cloudinary si está configurado (legacy)
const processWithCloudinary = async (buffer, folder = 'properties') => {
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 900, crop: 'limit', quality: 'auto:good', fetch_format: 'webp' },
        ],
        eager: [
          { width: 400, height: 300, crop: 'fill', quality: 'auto:low', fetch_format: 'webp' },
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

const useSupabase = () =>
  !!(process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_STORAGE_BUCKET);

const useCloudinary = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);

const processUploadedImages = async (files, folder = 'properties') => {
  const results = [];

  for (const file of files) {
    let result;
    if (useSupabase()) {
      result = await processWithSupabase(file.buffer, folder);
    } else if (useCloudinary()) {
      result = await processWithCloudinary(file.buffer, folder);
    } else {
      result = await processImage(file.buffer);
    }
    results.push(result);
  }

  return results;
};

const deleteImage = async (url, publicId) => {
  if (useSupabase() && publicId && !publicId.startsWith('http')) {
    const supabaseAdmin = require('../lib/supabase');
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;

    await supabaseAdmin.storage.from(bucketName).remove([publicId]);

    // Eliminar thumbnail
    const parts = publicId.split('/');
    const filename = parts.pop();
    const folder = parts.join('/');
    const thumbId = `${folder}/thumbnails/thumb_${filename}`;
    await supabaseAdmin.storage.from(bucketName).remove([thumbId]);

  } else if (useCloudinary() && publicId) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.uploader.destroy(publicId);
  } else if (url && url.startsWith('/uploads/')) {
    const filename = path.basename(url);
    const fullPath = path.join(__dirname, '../../uploads', filename);
    const thumbPath = path.join(__dirname, '../../uploads/thumbnails', `thumb_${filename}`);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }
};

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    if (VIDEO_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten videos MP4, WebM, MOV y AVI'), false);
  },
  limits: { fileSize: MAX_VIDEO_SIZE },
});

const deleteVideo = (url) => {
  if (!url) return;
  const filename = path.basename(url);
  const fullPath = path.join(videosDir, filename);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

module.exports = { upload, processUploadedImages, deleteImage, videoUpload, deleteVideo };
