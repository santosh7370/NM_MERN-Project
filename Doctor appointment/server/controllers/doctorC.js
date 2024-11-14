const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");
const userSchema = require("../schemas/userModel");
const fs = require("fs");
const path = require("path");

// Controller to update doctor profile
const updateDoctorProfileController = async (req, res) => {
  console.log(req.body);
  try {
    const doctor = await docSchema.findOneAndUpdate(
      { userId: req.userId },  // Use userId from the middleware for authentication
      req.body,
      { new: true }  // Return the updated document
    );

    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
        success: false,
      });
    }

    return res.status(200).send({
      success: true,
      data: doctor,
      message: "Successfully updated profile",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
    });
  }
};

// Controller to get all doctor appointments
const getAllDoctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await docSchema.findOne({ userId: req.userId });  // Use userId from the middleware

    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
        success: false,
      });
    }

    const allAppointments = await appointmentSchema.find({
      doctorId: doctor._id,
    });

    return res.status(200).send({
      message: "All appointments are listed below.",
      success: true,
      data: allAppointments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
    });
  }
};

// Controller to handle status updates for appointments
const handleStatusController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    // Ensure appointmentId and status are provided
    if (!appointmentId || !status) {
      return res.status(400).send({
        message: "Appointment ID and status are required",
        success: false,
      });
    }

    const appointment = await appointmentSchema.findOneAndUpdate(
      { _id: appointmentId },
      { status: status },
      { new: true } // Get the updated appointment
    );

    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
        success: false,
      });
    }

    const user = await userSchema.findOne({ _id: appointment.userId });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // Add notification to the user
    user.notification.push({
      type: "status-updated",
      message: `Your appointment status is now ${status}`,
    });

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Successfully updated the appointment status",
      data: appointment,  // Return updated appointment details
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Something went wrong",
      success: false,
    });
  }
};

// Controller for downloading documents related to appointments
const documentDownloadController = async (req, res) => {
  const appointId = req.query.appointId;
  try {
    const appointment = await appointmentSchema.findById(appointId);

    if (!appointment) {
      return res.status(404).send({ message: "Appointment not found", success: false });
    }

    // Check if the document exists in the appointment data
    const documentUrl = appointment.document?.path;

    if (!documentUrl || typeof documentUrl !== "string") {
      return res.status(404).send({
        message: "Document URL is invalid or not available",
        success: false,
      });
    }

    // Construct the absolute file path
    const absoluteFilePath = path.join(__dirname, "..", documentUrl);

    // Check if the file exists before sending for download
    fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ message: "File not found", success: false });
      }

      // Set headers for downloading the file
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(absoluteFilePath)}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      // Create a file stream to read the file and send it in the response
      const fileStream = fs.createReadStream(absoluteFilePath);

      fileStream.on("error", (error) => {
        console.log(error);
        return res.status(500).send({
          message: "Error reading the document",
          success: false,
          error: error,
        });
      });

      // Pipe the file stream to the response
      fileStream.pipe(res);

      // Close the response after the file is completely sent
      fileStream.on("end", () => {
        console.log("File download completed.");
        res.end();
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Something went wrong while downloading the document",
      success: false,
    });
  }
};

module.exports = {
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
};
