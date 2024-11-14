const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
} = require("../controllers/doctorC");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Route to update doctor profile, uses authMiddleware for token validation
router.post("/updateprofile", authMiddleware, updateDoctorProfileController);

// Route to get all appointments for the doctor, uses authMiddleware for token validation
router.get(
  "/getdoctorappointments",
  authMiddleware,
  getAllDoctorAppointmentsController
);

// Route to handle doctor status updates (approval/rejection), uses authMiddleware for token validation
router.post("/handlestatus", authMiddleware, handleStatusController);

// Route to download a document, uses authMiddleware for token validation
router.get(
  "/getdocumentdownload",
  authMiddleware,
  documentDownloadController
);

module.exports = router;
