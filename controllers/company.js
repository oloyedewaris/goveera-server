const Company = require("../models/Company");
const User = require("../models/User");

exports.createCompany = (req, res) => {
  const { name, userId, address, about } = req.body;

  const newCompany = new Company({
    name,
    about,
    address,
    companyLead: userId,
    timestamp: new Date().getTime()
  })

  newCompany
    .save()
    .then((company) => {
      User.findByIdAndUpdate(
        userId,
        { $set: { company: company._id, position: "CEO" } },
        { new: true, populate: { path: 'company' } },
        (err, user) => {
          if (err)
            res.status(400).json(err)
          res.status(200).json({ success: true, user })
        }
      )
    })
    .catch(err => res.status(400).json(err));
}

exports.getAllCompanies = (req, res) => {
  Company
    .find()
    .populate('company')
    .sort({ timestamp: -1 })
    .then((companies) => res.status(200).json(companies))
    .catch(err => res.status(400).json(err))
}