const express = require('express');
const {handleCreateUser, handleUserLogin, handleGetAllUser, handleGetUserById, handleUpdateUserById, handleDeleteUserById} = require('../controllers/user');
const { verifyToken } = require('../middleware');

const router = express.Router();

router.get('/',handleGetAllUser)

router.post('/signup',handleCreateUser)
router.post('/login',handleUserLogin)

router.post('/verify-token',verifyToken,(req, res)=>{
    return res.status(200).json({ status:'Success', message:'Token Verifed Successfully!'});
});

router
.route("/:id")
.all(verifyToken)
.get(handleGetUserById)
.patch(handleUpdateUserById)
.delete(handleDeleteUserById);

module.exports = router;