const express = require("express");
const router = express.Router();
const companyController = require("../../controllers/company");

//@route --post api/company/createCompany
//@description --create a new company
//@access --public
router.post("/create_company", companyController.createCompany);

//@route --post api/company/getAllCompanies
//@description --get all companies
//@access --public
router.get("/get_all_companies", companyController.getAllCompanies);

module.exports = router;
