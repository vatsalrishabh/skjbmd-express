const express = require('express');
const router = express.Router();
const {  getAllServices,
    editAllServices,
    postNewService,
    deleteService, } = require('../controllers/serviceController');
const { authenticateJWT, authorizeRoles } = require('../middleware/rbacMiddleware')

// Register user
router.get('/getAllServices',authenticateJWT,authorizeRoles('user','admin'), getAllServices); // api/auth/registerUser

router.post('/editAllServices',authenticateJWT,authorizeRoles('admin'), editAllServices); // api/auth/registerUser

router.post('/postNewService', postNewService); // api/auth/registerUser

router.delete('/deleteService',authenticateJWT,authorizeRoles('admin'), deleteService); // api/auth/registerUser




module.exports = router;
