const docSchema = require("../schemas/docModel");
const userSchema = require("../schemas/userModel");
const appointmentSchema = require("../schemas/appointmentModel");

const getAllUsersControllers = async (req, res) => {
   try {
      const users = await userSchema.find({});
      return res.status(200).send({
         message: "Users data list",
         success: true,
         data: users,
      });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "something went wrong", success: false });
   }
};

const getAllDoctorsControllers = async (req, res) => {
   try {
      const docUsers = await docSchema.find({});
      return res.status(200).send({
         message: "doctor Users data list",
         success: true,
         data: docUsers,
      });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "something went wrong", success: false });
   }
};

const getStatusApproveController = async (req, res) => {
   try {
      const { doctorId, status, userid } = req.body;
      const allowedStatuses = ["approved", "rejected"];
      if (!allowedStatuses.includes(status)) {
         return res.status(400).send({ message: "Invalid status", success: false });
      }

      const doctor = await docSchema.findOneAndUpdate({ _id: doctorId }, { status });
      if (!doctor) {
         return res.status(404).send({ message: "Doctor not found", success: false });
      }

      const user = await userSchema.findOne({ _id: userid });
      if (!user) {
         return res.status(404).send({ message: "User not found", success: false });
      }

      user.notification.push({
         type: "doctor-account-status-change",
         message: `Your Doctor account has ${status}`,
         onClickPath: "/notification",
      });
      user.isdoctor = status === "approved";
      await user.save();
      await doctor.save();

      return res.status(200).send({
         message: "Successfully updated approve status of the doctor!",
         success: true,
         data: doctor,
      });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "something went wrong", success: false });
   }
};

const getStatusRejectController = async (req, res) => {
   try {
      const { doctorId, status, userid } = req.body;
      const doctor = await docSchema.findOneAndUpdate({ _id: doctorId }, { status });
      if (!doctor) {
         return res.status(404).send({ message: "Doctor not found", success: false });
      }

      const user = await userSchema.findOne({ _id: userid });
      if (!user) {
         return res.status(404).send({ message: "User not found", success: false });
      }

      user.notification.push({
         type: "doctor-account-status-change",
         message: `Your Doctor account has ${status}`,
         onClickPath: "/notification",
      });
      await user.save();
      await doctor.save();

      return res.status(200).send({
         message: "Successfully updated Rejected status of the doctor!",
         success: true,
         data: doctor,
      });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "something went wrong", success: false });
   }
};

const displayAllAppointmentController = async (req, res) => {
   try {
      const allAppointments = await appointmentSchema.find();
      if (!allAppointments.length) {
         return res.status(200).send({ message: "No appointments found", success: true, data: [] });
      }
      return res.status(200).send({
         success: true,
         message: "Successfully fetched all appointments",
         data: allAppointments,
      });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "something went wrong", success: false });
   }
};

module.exports = {
   getAllDoctorsControllers,
   getAllUsersControllers,
   getStatusApproveController,
   getStatusRejectController,
   displayAllAppointmentController,
};
