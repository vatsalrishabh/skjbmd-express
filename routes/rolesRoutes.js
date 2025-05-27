const express = require('express');
const router = express.Router();
const { giveRoleToMember  ,
    removeFromRole} = require("../controllers/rolesChangeController");


    router.post(`/giveRoleToMember`, giveRoleToMember);
    router.post(`/removeFromRole`, removeFromRole);



module.exports= router;