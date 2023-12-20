const express = require("express");
// Je ne peux pas utiliser app et je ne peux pas le recréer car ça créerait un serveur dans mon serveur, j'utilise donc express.Router pour déclarer mes routes.
const router = express.Router();
const fileUpload = require("express-fileupload");

// Import du modèle User
const User = require("../models/User");

const uid2 = require("uid2"); // Package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");

// ----------- ROUTE CREATE / SIGNUP -----------
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const avatar = req.files?.avatar;

    // Aller regarder dans la collection si je trouve un utilisateur avec cet email
    const userFound = await User.findOne({ email: email });
    // Si on en trouve un utilisateur => erreur
    if (userFound !== null) {
      // error 409 = conflit
      return res.status(409).json({
        message: "User already exists",
      });
    }
    // On vérifie que le nom d'utilisateur a bien était passé en body
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    // On génère un salt
    const salt = uid2(16);
    // console.log("salt =>>>>   ", salt);
    // On génère un hash
    const hash = SHA256(password + salt).toString(encBase64);
    // console.log("hash    ", hash);
    // On génère un token
    const token = uid2(64);
    // console.log("token    ", token);

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      hash: hash,
      salt: salt,
      token: token,
    });

    if (avatar) {
      // Je transforme mon image en une string lisible par cloudinary
      const transformedPicture = convertToBase64(avatar);

      // Je fais une requête à cloudinary afin qu'il stocke mon image
      const result = await cloudinary.uploader.upload(transformedPicture, {
        folder: `portfolio/avatars/${newUser._id}`,
      });
      newUser.account.avatar = result;
    }

    // J'enregistre toutes les infos qu'on a créées et reçues en BDD SAUF LE MOT DE PASSE
    await newUser.save();

    const displayUser = {
      _id: newUser["_id"],
      email: newUser["email"],
      account: {
        username: newUser["account"]["username"],
      },
      token: newUser["token"],
    };
    // Je répond à l'utilisateur tout sauf le SALT et le HASH car ce sont des données sensibles

    res.status(201).json(displayUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------- ROUTE SIGNIN -----------
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body.email);
    // Aller regarder dans la collection si je trouve un utilisateur avec cet email
    const userFound = await User.findOne({ email: email });
    // console.log(userFound);
    // userFound = array
    // On extrait l'objet user du tableau userFound
    // On verifie que userFound existe dans la BDD
    if (!userFound) {
      // si ce n'est pas le cas on retourne un message d'erreur
      return res.status(400).json({
        message: "User doesn't exist. Please sign up.",
      });
    }
    // si c'est le cas on continue

    // on construit le hash avec le mot de passe reçu et le salt de l'utilisateur trouvé
    const hashReceived = SHA256(password + userFound.salt).toString(encBase64);

    // on compare le hash de l'utilisateur trouvé avec le hash obtenu
    if (hashReceived !== userFound.hash) {
      // Je répond une erreur
      return res.status(400).json({
        message: "Email or Password doesn't match",
      });
    } else {
      const displayUser = {
        _id: userFound["_id"],
        account: {
          username: userFound["account"]["username"],
        },
        token: userFound["token"],
      };
      // Je répond OK au client
      res.status(201).json(displayUser);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------- ROUTE READ USERS ------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------- SET UP ------------
// Export du router qui contient mes routes
module.exports = router;
