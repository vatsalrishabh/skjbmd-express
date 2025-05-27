const User = require('../models/User');
const { handleErrorWrapper } = require('../middleware/errorHandler');


//@desc- take username, sent otp, 
//@ method POST api/admin/giveRoleToMember
//@ access - PUBLIC
const giveRoleToMember = handleErrorWrapper(async (req, res) => {
    console.log(req.body)

   const { userId, targetRole, padKaNaam } = req.body;
 
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    user.role = targetRole;
    user.padKaNaam = padKaNaam;
    await user.save();

    res.status(200).json({ message: "Role assigned successfully." });
 
});


//@desc- take username, sent otp, 
//@ method POST api/admin/removeFromRole
//@ access - PUBLIC
const removeFromRole = handleErrorWrapper(async (req, res) => {
    console.log(req.body)

   const { userId, targetRole, padKaNaam } = req.body;
 
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    user.role = targetRole;
    user.padKaNaam = padKaNaam;
    await user.save();

    res.status(200).json({ message: "Role assigned successfully." });
 
});



module.exports= {
    giveRoleToMember,
    removeFromRole,
}