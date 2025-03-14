import { StatusCodes } from "http-status-codes";
import CarHireBooking from "../models/CarHireBooking.js";
// import CarHire from "../models/CarHire.js";
import CarHire from "../models/carHire.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Generate a unique booking ID
const generateBookingId = () => {
    return "BK" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
};

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const {
            carId,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            pickupTime,
            returnDate,
            returnTime,
            driverOption,
            totalDays,
            totalPrice,
            customerDetails,
            paymentMethod,
        } = req.body;

        // Validate required fields
        if (
            !carId ||
            !pickupLocation ||
            !dropoffLocation ||
            !pickupDate ||
            !pickupTime ||
            !returnDate ||
            !returnTime ||
            !totalDays ||
            !totalPrice ||
            !customerDetails
        ) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "All required fields must be provided" });
        }

        // Check if car exists and is available
        const car = await CarHire.findById(carId);
        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        if (car.status !== "available") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Car is not available for booking" });
        }

        // Create a new booking
        const bookingId = generateBookingId();
        const newBooking = new CarHireBooking({
            bookingId,
            car: carId,
            customer: req.user.id,
            customerDetails,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            pickupTime,
            returnDate,
            returnTime,
            driverOption: driverOption || "self",
            totalDays,
            totalPrice,
            status: "confirmed", // Assuming payment is successful
            paymentStatus: "paid", // Assuming payment is successful
            paymentMethod: paymentMethod || "card",
            paymentDetails: {
                transactionId: uuidv4(),
                paymentDate: new Date(),
                paymentReference: `REF-${Date.now()}`,
            },
        });

        await newBooking.save();

        // Update car status to booked
        car.status = "booked";
        car.bookings += 1;
        await car.save();

        // Send confirmation email (in a real app)
        // This is a placeholder for email sending logic
        /*
        const transporter = nodemailer.createTransport({
          // Configure your email provider here
        });
    
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: customerDetails.email,
          subject: `Booking Confirmation - ${bookingId}`,
          html: `<p>Your booking has been confirmed. Booking ID: ${bookingId}</p>`,
        });
        */

        res.status(StatusCodes.CREATED).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error creating booking",
            error: error.message,
        });
    }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const { status, date } = req.query;

        // Build filter object based on query parameters
        const filter = {};
        if (status) filter.status = status;

        // Filter by date if provided
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            filter.pickupDate = { $gte: startDate, $lte: endDate };
        }

        // For regular users, only show their own bookings
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            filter.customer = req.user.id;
        }

        const bookings = await CarHireBooking.find(filter)
            .populate("car", "name images price")
            .sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching bookings",
            error: error.message,
        });
    }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await CarHireBooking.findById(req.params.id)
            .populate("car", "name images price type transmission fuelType")
            .populate("customer", "name email phone");

        if (!booking) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Booking not found" });
        }

        // Check if the user is authorized to view this booking
        if (
            req.user.role !== "admin" &&
            req.user.role !== "superadmin" &&
            booking.customer._id.toString() !== req.user.id
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "You are not authorized to view this booking" });
        }

        res.status(StatusCodes.OK).json({ booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching booking",
            error: error.message,
        });
    }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Status is required" });
        }

        const booking = await CarHireBooking.findById(req.params.id);

        if (!booking) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Booking not found" });
        }

        // Only admins can update booking status
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "You are not authorized to update this booking" });
        }

        booking.status = status;

        // If booking is cancelled, update car status back to available
        if (status === "cancelled") {
            const car = await CarHire.findById(booking.car);
            if (car) {
                car.status = "available";
                await car.save();
            }
        }

        // If booking is completed, update car status back to available
        if (status === "completed") {
            const car = await CarHire.findById(booking.car);
            if (car) {
                car.status = "available";
                await car.save();
            }
        }

        await booking.save();

        res.status(StatusCodes.OK).json({
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating booking status",
            error: error.message,
        });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentDetails } = req.body;

        if (!paymentStatus) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Payment status is required" });
        }

        const booking = await CarHireBooking.findById(req.params.id);

        if (!booking) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Booking not found" });
        }

        // Only admins can update payment status
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "You are not authorized to update this booking" });
        }

        booking.paymentStatus = paymentStatus;

        if (paymentDetails) {
            booking.paymentDetails = {
                ...booking.paymentDetails,
                ...paymentDetails,
            };
        }

        await booking.save();

        res.status(StatusCodes.OK).json({
            message: "Payment status updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating payment status",
            error: error.message,
        });
    }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
    try {
        const booking = await CarHireBooking.findById(req.params.id);

        if (!booking) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Booking not found" });
        }

        // Check if the user is authorized to cancel this booking
        if (
            req.user.role !== "admin" &&
            req.user.role !== "superadmin" &&
            booking.customer.toString() !== req.user.id
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ message: "You are not authorized to cancel this booking" });
        }

        // Check if booking is already completed
        if (booking.status === "completed") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Cannot cancel a completed booking" });
        }

        // Update booking status to cancelled
        booking.status = "cancelled";

        // If payment was made, update payment status to refunded
        if (booking.paymentStatus === "paid") {
            booking.paymentStatus = "refunded";
        }

        await booking.save();

        // Update car status back to available
        const car = await CarHire.findById(booking.car);
        if (car) {
            car.status = "available";
            await car.save();
        }

        res.status(StatusCodes.OK).json({
            message: "Booking cancelled successfully",
            booking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error cancelling booking",
            error: error.message,
        });
    }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
    try {
        // Get total bookings count
        const totalBookings = await CarHireBooking.countDocuments();

        // Get bookings by status
        const confirmedBookings = await CarHireBooking.countDocuments({ status: "confirmed" });
        const pendingBookings = await CarHireBooking.countDocuments({ status: "pending" });
        const completedBookings = await CarHireBooking.countDocuments({ status: "completed" });
        const cancelledBookings = await CarHireBooking.countDocuments({ status: "cancelled" });

        // Get bookings by payment status
        const paidBookings = await CarHireBooking.countDocuments({ paymentStatus: "paid" });
        const pendingPayments = await CarHireBooking.countDocuments({ paymentStatus: "pending" });
        const refundedBookings = await CarHireBooking.countDocuments({ paymentStatus: "refunded" });

        // Get total revenue
        const revenueResult = await CarHireBooking.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get recent bookings
        const recentBookings = await CarHireBooking.find()
            .populate("car", "name images price")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(StatusCodes.OK).json({
            totalBookings,
            statusCounts: {
                confirmed: confirmedBookings,
                pending: pendingBookings,
                completed: completedBookings,
                cancelled: cancelledBookings,
            },
            paymentCounts: {
                paid: paidBookings,
                pending: pendingPayments,
                refunded: refundedBookings,
            },
            totalRevenue,
            recentBookings,
        });
    } catch (error) {
        console.error("Error fetching booking stats:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching booking stats",
            error: error.message,
        });
    }
};

// Get car hire analytics
export const getCarHireAnalytics = async (req, res) => {
    try {
        // Get total cars count
        const totalCars = await CarHire.countDocuments();

        // Get cars by status
        const availableCars = await CarHire.countDocuments({ status: "available" });
        const bookedCars = await CarHire.countDocuments({ status: "booked" });
        const maintenanceCars = await CarHire.countDocuments({ status: "maintenance" });

        // Get cars by location
        const osogboCars = await CarHire.countDocuments({ location: "Osogbo" });
        const akureCars = await CarHire.countDocuments({ location: "Akure" });

        // Get cars by type
        const sedanCars = await CarHire.countDocuments({ type: "Sedan" });
        const suvCars = await CarHire.countDocuments({ type: "SUV" });
        const busCars = await CarHire.countDocuments({ type: "Bus" });
        const truckCars = await CarHire.countDocuments({ type: "Truck" });
        const convertibleCars = await CarHire.countDocuments({ type: "Convertible" });
        const pickupCars = await CarHire.countDocuments({ type: "Pick-up" });

        // Get cars that need maintenance soon (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const maintenanceSoonCars = await CarHire.countDocuments({
            nextMaintenance: { $lte: thirtyDaysFromNow, $gte: new Date() }
        });

        // Get most booked cars
        const mostBookedCars = await CarHire.find()
            .sort({ bookings: -1 })
            .limit(5);

        res.status(StatusCodes.OK).json({
            totalCars,
            statusCounts: {
                available: availableCars,
                booked: bookedCars,
                maintenance: maintenanceCars,
            },
            locationCounts: {
                Osogbo: osogboCars,
                Akure: akureCars,
            },
            typeCounts: {
                Sedan: sedanCars,
                SUV: suvCars,
                Bus: busCars,
                Truck: truckCars,
                Convertible: convertibleCars,
                "Pick-up": pickupCars,
            },
            maintenanceSoonCars,
            mostBookedCars,
        });
    } catch (error) {
        console.error("Error fetching car hire analytics:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching car hire analytics",
            error: error.message,
        });
    }
};