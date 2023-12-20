const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();

// Import du modèle Offer
const Project = require("../models/Project");

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");

// ----------- ROUTE CREATE PROJECT ------------

router.post(
  "/project/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      console.log(req.user);

      const {
        title,
        description,
        order,
        tag,
        repoback,
        repofront,
        figma,
        url,
        front,
        back,
        database,
        server,
        packages,
      } = req.body;

      const preview = req.files?.preview;
      const images = req.files?.images;

      const newProject = new Project({
        title: title,
        description: description,
        order: order,
        tag: tag,
        repoback: repoback,
        repofront: repofront,
        figma: figma,
        url: url,
        details: [
          {
            front: front,
          },
          {
            back: back,
          },
          {
            database: database,
          },
          {
            server: server,
          },
          {
            packages: packages,
          },
        ],
        owner: req.user,
      });

      if (preview) {
        // Je transforme mon image en une string lisible par cloudinary
        const transformedPicture = convertToBase64(preview);

        // Je fais une requête à cloudinary afin qu'il stocke mon image
        const result = await cloudinary.uploader.upload(transformedPicture, {
          folder: `portfolio/projects/${newProject._id}`,
        });
        newProject.preview = result;
      }

      if (images) {
        const picturesToUpload = images;
        // Ici, je crée, avec la méthode map, un tableau de promesses non résolues qui correspondent à l'upload de mes images sur cloudinary
        const arrayOfPromises = picturesToUpload.map((image) => {
          const transformedPicture = convertToBase64(image);
          return cloudinary.uploader.upload(transformedPicture, {
            folder: `portfolio/projects/${newProject._id}/images`,
          });
        });
        // Je donne ce tableau en argument à Promise.all. Cette dernière renvoie une Promesse
        // J'utilise await pour attendre la résolution de Promise.all et stocker ce que renvoie cette résolution dans ma variable result. Cette dernière contiendra un tableau contenant les réponses de cloudinary à l'upload de mes images.
        const result = await Promise.all(arrayOfPromises);

        newProject.images = result;
      }

      await newProject.save();

      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ----------- ROUTE UPDATE OFFER ------------

// router.put(
//   "/offer/update/:id",
//   fileUpload(),
//   isAuthenticated,
//   async (req, res) => {
//     try {
//       const offerToUpdate = await Offer.findById(req.params.id);
//       console.log(offerToUpdate);

//       // const { title, description, price, condition, city, brand, size, color } =
//       //   req.body;

//       // // Je transforme mon image en une string lisible par cloudinary
//       // const transformedPicture = convertToBase64(req.files.picture);

//       offerToUpdate.title = title;
//       offerToUpdate.description = description;
//       offerToUpdate.price = price;
//       offerToUpdate.condition = condition;
//       offerToUpdate.city = city;
//       offerToUpdate.brand = brand;
//       offerToUpdate.size = size;
//       offerToUpdate.color = color;
//       offerToUpdate.picture = picture;

//       res.status(201).json("Ok");
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// ----------- ROUTE DELETE OFFER ------------

// ----------- ROUTE SORT OFFER ------------

// router.get("/offers", async (req, res) => {
//   try {
//     const { search, priceMin, priceMax, sort, page, displayedOffers } =
//       req.query;

//     const searchRegexp = new RegExp(search, "i"); // Permet de créer une RegExp

//     let findQueries = {};
//     let sortQuery = {};
//     let skipNum = 0;
//     let limitNum = 3;
//     let pageToSend = 1;

//     if (search) {
//       findQueries.product_name = searchRegexp;
//       findQueries.product_description = searchRegexp;
//       // findQueries.product_details = searchRegexp;
//     }
//     if (priceMin) {
//       findQueries.product_price = { $gte: +priceMin };
//     }
//     if (priceMax) {
//       if (priceMin && priceMax) {
//         findQueries.product_price["$lte"] = +priceMax;
//       } else {
//         findQueries.product_price = { $lte: +priceMax };
//       }
//     }
//     if (sort) {
//       sortQuery.product_price = sort;
//     }

//     if (page) {
//       pageToSend = page;
//       if (displayedOffers) {
//         limitNum = +displayedOffers;
//         skipNum = limitNum * (pageToSend - 1);
//       }
//     }
//     console.log(skipNum);
//     const offers = await Offer.find(findQueries)
//       .sort(sortQuery)
//       .skip(skipNum)
//       .limit(limitNum)
//       .select("product_name product_price");

//     const numberOfOffers = await Offer.countDocuments(findQueries);

//     res.json({ count: numberOfOffers, offers });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// ----------- SET UP ------------
// Export du router qui contient mes routes
module.exports = router;
