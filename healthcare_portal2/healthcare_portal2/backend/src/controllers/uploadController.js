// Handles uploading PDFs to Cloudinary (called after multer middleware)
exports.uploadPdf = async (req, res, next) => {
    try {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "File upload failed." });
      }
  
      // req.file.path contains Cloudinary URL after multer-storage-cloudinary upload
      res.json({ url: req.file.path });
    } catch (err) {
      next(err);
    }
  };
  