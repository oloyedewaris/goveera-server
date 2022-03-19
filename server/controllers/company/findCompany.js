const { Company } = require("../../models/Company")

const findCompany = () => {
  Company.find()
    .sort({ timestamp: -1 })
    .then(companies => res.status(200).json(companies))
    .catch(err => res.status(400).json(err));
}

module.exports = { findCompany }