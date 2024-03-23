const RideSharing = require('../models/rideSharing');

async function handleCreateRideSharing(req, res) {
    try {
        const {
            Ride,Provider,
            Pickup,DropOff,
            PickupLocation,DropOffLocation,
            Distance,Duration,
        } = req.body;

        var data = {Ride, Provider, Distance, Duration}
        data.Pickup = {text : Pickup, cord : { lon : PickupLocation[0], lat : PickupLocation[1] }}
        data.DropOff = {text : DropOff, cord : { lon : DropOffLocation[0], lat : DropOffLocation[1] }}
        data.Seeker = req.userId
        data.Status = 'Pending'

        let rideSharing = new RideSharing(data);

        const doc = await rideSharing.save();
        return res.status(200).json({
            status: 'Success',
            message: 'Ride sharing created successfully!',
            id: doc._id
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to create ride sharing!'
        });
    }
}

async function handleGetAllRideSharings(req, res) {
    const rideSharings = await RideSharing.find();
    return res.json(rideSharings);
}

async function handleGetAllRideSharingsForSeeker(req, res) {
    const rideSharings = await RideSharing.find({Seeker: req.userId}).populate('Ride').sort('-createdAt');;
    return res.json(rideSharings);
}

async function handleGetAllRideSharingsForProvider(req, res) {
    const rideSharings = await RideSharing.find({Provider: req.userId}).populate('Ride').sort('-createdAt');;
    return res.json(rideSharings);
}

async function handleGetRideSharingById(req, res) {
    const rideSharing = await RideSharing.findById(req.params.id);
    if (!rideSharing) return res.status(404).json({
        error: 'Ride sharing Not Found'
    });
    return res.json(rideSharing);
}

async function handleUpdateRideSharingById(req, res) {
    try {

        const {
            Pickup,DropOff,
            PickupLocation,DropOffLocation,
            Distance,Duration,
            Status
        } = req.body;

        var data = {Distance, Duration, Status}
        data.Pickup = {text : Pickup, cord : { lon : PickupLocation[0], lat : PickupLocation[1] }}
        data.DropOff = {text : DropOff, cord : { lon : DropOffLocation[0], lat : DropOffLocation[1] }}

        await RideSharing.findByIdAndUpdate(req.params.id, data);

        return res.json({
            status: 'Success',
            message: 'Ride sharing updated successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update ride sharing!'
        });
    }
}

async function handleUpdateRideSharingStatusById(req, res) {
    try {
        const {
            Status,
        } = req.body;

        var data = {Status}

        await RideSharing.findByIdAndUpdate(req.params.id, data);
        
        return res.json({
            status: 'Success',
            message: 'Ride sharing status successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update ride sharing!'
        });
    }
}

async function handleDeleteRideSharingById(req, res) {
    try {
        await RideSharing.findByIdAndDelete(req.params.id);
        return res.json({
            status: 'Success',
            message: 'Ride sharing removed successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to remove ride sharing!'
        });
    }
}

module.exports = {
    handleCreateRideSharing,
    handleGetAllRideSharings,
    handleGetAllRideSharingsForSeeker,
    handleGetAllRideSharingsForProvider,
    handleGetRideSharingById,
    handleUpdateRideSharingById,
    handleDeleteRideSharingById,
    handleUpdateRideSharingStatusById
};
