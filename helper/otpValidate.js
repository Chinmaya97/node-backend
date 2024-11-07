const oneMinuteExpiry = async (otpTime) => {
  try {
    console.log("Time stamp is " + otpTime);
    const c_date_time = new Date();
    var differenceValue = (otpTime - c_date_time.getTime()) / 1000;
    differenceValue /= 60;
    console.log("expire minute: " + Math.abs(differenceValue));
    if (Math.abs(differenceValue) > 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};
const threeMinuteExpiry = async (otpTime) => {
  try {
    console.log("Time stamp is " + otpTime);
    const c_date_time = new Date();
    var differenceValue = (otpTime - c_date_time.getTime()) / 1000;
    differenceValue /= 60;
    console.log("expire minute: " + Math.abs(differenceValue));
    if (Math.abs(differenceValue) > 3) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  oneMinuteExpiry,
  threeMinuteExpiry
};
