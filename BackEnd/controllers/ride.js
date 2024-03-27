const { GEOAPIFY_API_KEY } = require('../config');
const Ride = require('../models/ride');
const RideSharing = require('../models/rideSharing');
const fetch = require('node-fetch');

async function handleCreateRide(req, res) {
    try {
        const {
            Source,
            SourceLocation,
            Destination,
            DestinationLocation,
            Distance,
            ChargePerMile,
            AvailableSeat,
            StartDateTime,
            Duration
        } = req.body;

        var data = {Distance, ChargePerMile,AvailableSeat,StartDateTime:new Date(StartDateTime), Duration}
        data.Source = {text : Source, cord : { lon : SourceLocation[0], lat : SourceLocation[1] }}
        data.Destination = {text : Destination, cord : { lon : DestinationLocation[0], lat : DestinationLocation[1] }}
        data.User = req.userId
        data.Status = 'Not Started'

        let ride = new Ride(data);

        const doc = await ride.save();
        return res.status(200).json({
            status: 'Success',
            message: 'Ride created successfully!',
            id: doc._id
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to create ride!'
        });
    }
}

async function handleGetAllRides(req, res) {
    const rides = await Ride.find({User:req.userId}).sort('-createdAt');
    return res.json(rides);
}

async function handleGetRideById(req, res) {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({
        error: 'Ride Not Found'
    });
    return res.json(ride);
}

async function handleGetRidePlanning(req, res) {

    const rides = await Ride.find({Status:'Not Started', User:{$ne: req.userId}, AvailableSeat:{$gt: 0}});

    const {
        PickupLocation,
        DropOffLocation,
    } = req.body;

    var SourceLocation = PickupLocation;
    var DestinationLocation = DropOffLocation;

    // console.log('handleGetRidePlanning :: ',SourceLocation);
    // console.log('handleGetRidePlanning :: ',DestinationLocation);

    // First check client source is with in distance of rider source and destination 
    // Then check client destination is with in distance of rider source and destination
    
    var validTargetFromSource = await calculateDistanceMatrix(rides, SourceLocation, DestinationLocation, 'Source');
    var validTargetFromDestination = await calculateDistanceMatrix(rides, SourceLocation, DestinationLocation, 'Destination');

    var extractCommonTarget = validTargetFromSource['validTarget'].filter(element => validTargetFromDestination['validTargetIndex'].includes(element['index']));
    var validRideForRoute = []

    extractCommonTarget.forEach(item => {
        var temp = JSON.parse(JSON.stringify(rides[item['index']]))
        var ActualDistance = item.distanceToDestination - item.distanceToSource;
        var ActualTime = item.timeToDestination - item.timeToSource;

        // console.log(ActualDistance, ActualTime);

        validRideForRoute.push({...temp, ActualDistance, ActualTime})
    });

    return res.status(200).json({
        status: 'Success',
        message: `${validRideForRoute.length == 0 ? 'No matching ride found!' : (validRideForRoute.length+' rides matching your route!!')} `,
        rides: validRideForRoute
    });
}

async function calculateDistanceMatrix(rides, SourceLocation, DestinationLocation, type) {
    var data = {
        "mode":"drive",
        "sources":[{"location":[...SourceLocation]}, {"location":[...DestinationLocation]}],
        "targets":[
            // {"location":[73.1942567, 22.2973142]}
        ]
    }

    rides.forEach(item => {
        // console.log(JSON.stringify([item.Source.cord.lon,item.Source.cord.lat]));
        data.targets.push(
            {"location":[item[type].cord.lon,item[type].cord.lat]}
        )
    });

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(data);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw
    };

    var routeMatrixPromise = await fetch(`https://api.geoapify.com/v1/routematrix?apiKey=${GEOAPIFY_API_KEY}`, requestOptions)
    var routeMatrixResult = await routeMatrixPromise.json();

    var validTarget = [];
    var validTargetIndex = [];

    if(
        routeMatrixResult && 
        'sources_to_targets' in routeMatrixResult && 
        routeMatrixResult.sources_to_targets.length
    ){
        routeMatrixResult?.sources_to_targets[0]?.forEach(source => {
            var rideDistance = rides[source.target_index].Distance
            if(source.distance <= rideDistance){
                validTargetIndex.push(source.target_index)
                validTarget.push({
                    'index':source.target_index,
                    'distanceToSource':source.distance,
                    'timeToSource':source.time
                });
            }
        });
    }
    
    
    if(
        routeMatrixResult && 
        'sources_to_targets' in routeMatrixResult && 
        routeMatrixResult.sources_to_targets.length && 
        routeMatrixResult.sources_to_targets.length > 1 
    ){
        routeMatrixResult?.sources_to_targets[1]?.forEach(destination => {
            var rideDistance = rides[destination.target_index].Distance
            var findTargetExistsIndex = validTarget.findIndex((item) => item.index == destination.target_index)
            if(destination.distance > rideDistance){
                if(findTargetExistsIndex >= 0){
                    validTarget.splice(findTargetExistsIndex, 1);
                    validTargetIndex.splice(findTargetExistsIndex, 1);
                }
            }else{
                if(findTargetExistsIndex >= 0){
                    validTarget[findTargetExistsIndex]['distanceToDestination'] = destination.distance;
                    validTarget[findTargetExistsIndex]['timeToDestination'] = destination.time;
                }
            }
        });
    }

    return {validTarget, validTargetIndex};
    
}


async function handleUpdateRideById(req, res) {
    try {
        const {
            Source,
            SourceLocation,
            Destination,
            DestinationLocation,
            Distance,
            ChargePerMile,
            AvailableSeat,
            Status,
            StartDateTime,
            Duration
        } = req.body;

        var data = {ChargePerMile,AvailableSeat,Status,StartDateTime:new Date(StartDateTime),Duration}
        data.Source = {text : Source, cord : { lon : SourceLocation[0], lat : SourceLocation[1] }}
        data.Destination = {text : Destination, cord : { lon : DestinationLocation[0], lat : DestinationLocation[1] }}
        data.User = req.userId
        data.Distance = 100

        await Ride.findByIdAndUpdate(req.params.id, data);
        
        return res.json({
            status: 'Success',
            message: 'Ride updated successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update ride!'
        });
    }
}

async function handleUpdateRideStatusById(req, res) {
    try {
        const {
            Status,
        } = req.body;

        var data = {Status}

        await Ride.findByIdAndUpdate(req.params.id, data);
        
        return res.json({
            status: 'Success',
            message: 'Ride status successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update ride!'
        });
    }
}

async function handleUpdateRideSeekerCount(req, res) {
    try {
        const {
            RideSharingId
        } = req.body;

        var rideSharingRecord = await RideSharing.findById(RideSharingId).populate('Ride')

        await Ride.findByIdAndUpdate(rideSharingRecord.Ride._id,{
            SeekerCount:rideSharingRecord.Ride.SeekerCount+1,
            AvailableSeat:rideSharingRecord.Ride.AvailableSeat-1
        })

        return res.json({
            status: 'Success',
            message: 'Ride seeker-count updated successfully!',
            rideSharingRecord
        });

    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update ride seeker-count!'
        });
    }
}

async function handleDeleteRideById(req, res) {
    try {
        await Ride.findByIdAndDelete(req.params.id);
        return res.json({
            status: 'Success',
            message: 'Ride removed successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to remove ride!'
        });
    }
}

module.exports = {
    handleCreateRide,
    handleGetAllRides,
    handleGetRideById,
    handleUpdateRideById,
    handleDeleteRideById,
    handleUpdateRideStatusById,
    handleGetRidePlanning,
    handleUpdateRideSeekerCount
};
