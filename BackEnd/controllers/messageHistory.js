const MessageHistory = require('../models/messageHistory');

async function handleCreateMessageHistory(req, res) {
    try {
        const {
            RideSharing,
            Sender,
            Receiver,
            Message,
            SendTime
        } = req.body;

        let messageHistory = new MessageHistory({
            RideSharing,
            Sender,
            Receiver,
            Message,
            SendTime
        });

        const doc = await messageHistory.save();
        return res.status(200).json({
            status: 'Success',
            message: 'Message history created successfully!',
            id: doc._id
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to create message history!'
        });
    }
}

async function handleGetAllMessageHistories(req, res) {
    const messageHistories = await MessageHistory.find();
    return res.json(messageHistories);
}

async function handleGetAllMessageHistoriesForRideSharing(req, res) {
    const { RideSharing } = req.body
    const messageHistories = await MessageHistory.find({RideSharing});
    return res.json(messageHistories);
}

async function handleGetMessageHistoryById(req, res) {
    const messageHistory = await MessageHistory.findById(req.params.id);
    if (!messageHistory) return res.status(404).json({
        error: 'Message history Not Found'
    });
    return res.json(messageHistory);
}

async function handleUpdateMessageHistoryById(req, res) {
    try {
        const {
            Message
        } = req.body;

        const messageHistory = await MessageHistory.findByIdAndUpdate(req.params.id, {
            Message
        });

        return res.json({
            status: 'Success',
            message: 'Message history updated successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update message history!'
        });
    }
}

async function handleDeleteMessageHistoryById(req, res) {
    try {
        await MessageHistory.findByIdAndDelete(req.params.id);
        return res.json({
            status: 'Success',
            message: 'Message history removed successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to remove message history!'
        });
    }
}

module.exports = {
    handleCreateMessageHistory,
    handleGetAllMessageHistories,
    handleGetAllMessageHistoriesForRideSharing,
    handleGetMessageHistoryById,
    handleUpdateMessageHistoryById,
    handleDeleteMessageHistoryById
};
