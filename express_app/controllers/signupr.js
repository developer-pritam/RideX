const ethCrypto = require('eth-crypto');
const fs = require("fs");
const HDwalletprovider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const session = require("express-session");
var mongoose = require('mongoose');

const abi = require("../user_contract").abi2;
const address = require("../user_contract").address2;

// const cookie=require("cookie-parser");

//const abi=require("../family_tree_details").abi;
//const address=require("../family_tree_details").address;
//const byteCode=require("../family_tree_details").bytecode;
const createIdentity = require("./create_identity");
const Profiles = require('../models/Profiles');

require("dotenv").config();

module.exports = (app) => {

    app.get("/signupr", (req, res) => {
        if (req.session.username !== undefined) {
            res.redirect("/homer");
        }
        else {
            res.render("signupr", { message: null });
        }
    });

    app.post("/signupr", async (req, res) => {
        const name = req.body.name;
        const phno = req.body.phno;
        const username = req.body.email;
        const password = req.body.password;
        const userType = 'Rider';
        const vehicle = "";
        const vehicleNo = "";
        // Creating identity
        var identity = createIdentity();

        console.log(identity);
        const publicKey = identity.publicKey;
        const privateKey = identity.privateKey;
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



        req.session.username = username;
        req.session.privateKey = privateKey;
        req.session.userType = userType;

        res.redirect("/homer");

    });

}