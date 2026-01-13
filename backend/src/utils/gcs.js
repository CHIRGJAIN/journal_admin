const { Storage } = require('@google-cloud/storage');
const path = require('path');

const gcsKeyPath = path.join(__dirname, '../config/gcs-key.json');
const storage = new Storage({ keyFilename: gcsKeyPath });


const bucketName = process.env.GCS_BUCKET_NAME || 'your-bucket-name'; // Replace with your default bucket name if needed
const bucket = storage.bucket(bucketName);

async function uploadFileToGCS(file, destination) {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(destination);
    const blobStream = blob.createWriteStream({ resumable: false });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
}

module.exports = { uploadFileToGCS };
