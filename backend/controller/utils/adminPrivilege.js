
const checkPrivilegeLevel = async (user, privilegeLevel) => {
    // Check if user and user privileges exist
    if (user && (user[privilegeLevel] === 1 || user[privilegeLevel] === true)) {
      // Check if the requested privilege is present and set to true
      return true;
    } else {
      // Handle cases where user or user privileges are missing
      console.error('Invalid user data or missing privileges.');
      return false;
    }
  };

  module.exports = {checkPrivilegeLevel}