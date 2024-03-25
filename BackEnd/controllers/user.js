const User = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../config');

async function handleCreateUser(req, res){
    try {
        const {firstName, lastName, email, phone, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({firstName, lastName, email, phone, password:hashedPassword});
        const doc = await user.save();
        return res.status(200).json({status:'Success', message:'Account created successfully!',id:doc._id});
    } catch (error) {
        return res.status(500).json({status:'Error', message:'Registration failed!'});
    }
}

async function handleUserLogin(req, res){
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status:'Error', message: 'Authentication failed!' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ status:'Error', message: 'Authentication failed' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
            expiresIn: '5h',
        });
        return res.status(200).json({ status:'Success', message:'Authentication successfully!', token, user });

    } catch (error) {
        return res.status(500).json({status:'Error', message:'Registration failed!'});
    }
}

async function handleGetAllUser(req, res){
    const docs = await User.find();
    return res.json(docs);
}

async function handleGetUserById(req, res){
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({error:'User Not Found'});
    return res.json(user);
}

async function handleUpdateUserById(req, res){
    const {firstName, lastName, email, password} = req.body;
    var userInfo = {firstName, lastName, email}
    if(password){
        const hashedPassword = await bcrypt.hash(password, 10);
        userInfo['password'] = hashedPassword;
    }
    await User.findByIdAndUpdate(req.params.id, userInfo);
    return res.json({status:'Success', message:'Account updated successfully!'});
}

async function handleDeleteUserById(req, res){
    await User.findByIdAndDelete(req.params.id);
    return res.json({status:'Success', message:'Account removed successfully!'});
}


module.exports = {
    handleCreateUser,
    handleUserLogin,
    handleGetAllUser,
    handleGetUserById,
    handleUpdateUserById,
    handleDeleteUserById
}