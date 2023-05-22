const ethCrypto = require('eth-crypto');
const fs = require("fs");
const HDwalletprovider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const session = require("express-session");
var mongoose = require('mongoose');
// const cookie=require("cookie-parser");

const abi = require("../user_contract").abi2;
const address = require("../user_contract").address2;


const createIdentity = require("./create_identity");
const Profiles = require('../models/Profiles');

require("dotenv").config();

module.exports = (app) => {

    app.get("/signupd", (req, res) => {
        if (req.session.identity !== undefined) {
            res.redirect("/homed");
        }
        else {
            res.render("signupd", { message: null });
        }
    });

    app.post("/signupd", async (req, res) => {
        var name = req.body.name;
        var phno = req.body.phno;
        var username = req.body.email;
        var password = req.body.password;
        var vehicle = req.body.vehicle;
        var vehicleNo = req.body.vehicle_num;
        var userType = 'Driver';

        // Creating identity
        var identity = createIdentity();

        console.log(identity);
        const publicKey = identity.publicKey;
        const privateKey = identity.privateKey;
        console.log(publicKey, privateKey);
        const newCompressed = ethCrypto.publicKey.compress(
            publicKey
        );
        identity.compressed = newCompressed;



        // Setting provider and web3
        const provider = new HDwalletprovider("TODO: add mnemonic", `https://rpc-mumbai.maticvigil.com/v1/4f48dec4fef45b44589e62a8c1748ca78dcd773a`);


        const web = new Web3(provider);
        const accounts = await web.eth.getAccounts();
        console.log("STEP 1");
        const contract = new web.eth.Contract(abi, address);
        console.log("STEP 2");

        const response = await contract.methods.set(name, username, phno, vehicle, vehicleNo, userType, password, privateKey).send({
            from: "TODO: add public key",
            chainId: 80001,
        });

        console.log(response);

        console.log("STEP 3");



        // --------------------------------------------------------------------------------------------------

        req.session.username = username;
        req.session.privateKey = privateKey;
        req.session.userType = userType;
        res.redirect("/homed");

    });


}