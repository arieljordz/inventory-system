import multer from "multer";

// Accept only Excel (.xlsx, .xls) and CSV (.csv) files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
    "application/csv", // sometimes used for CSVs
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed."), false);
  }
};

// Memory-based multer storage
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // optional: max 5MB
  },
});

export default memoryUpload;
