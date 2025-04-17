const otpSixGenerator = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Should be 900000 not 90000
  return otp;
};

module.exports = {
  otpSixGenerator,
};
