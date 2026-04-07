const express = require ("express");
const router = express.Router();
const Country = require("../Models/schemas");


router.get("/:id", async (req, res) =>{
    try{
        const foundItem = await Country.findById(req.params.id)
        if(!foundItem){
            return res.send("Item was not found");
        }

        const purchaseInfo = {
            id: foundItem._id,
            picture: foundItem.filename,
            galleryName: foundItem.filename.split(".")[0],
            description: foundItem.description,
            price: foundItem.price
        }

        res.render("purchase", {data: purchaseInfo});
    }

    catch (err){
        console.log(err);
        res.send ("Error in loading your Country");
    }

});

router.post("/", async (req,res) =>{
    try {
        const findItem = await Country.findOneAndUpdate({_id: req.body.id},{$set:{status:"S"}});
        res.redirect("/");
    }
    
    catch (err){
        console.log(err);
        res.send("Error purchasing your Country");
    }
})

router.post("/backFromPurchase", async (req,res)=>{
    try{
            const items = await Country.find({ status: "A" });
            let buttonOptions = items.map(item => {
                return {
                    id: item._id,
                    name: item.filename.split(".")[0],
                    fileName: item.filename,
                };
            });
            
            let displayPicture = req.body.picture;
            let displayName = req.body.galleryName;
            let id = req.body.id

            let galInfo = {
                options: buttonOptions,
                picture:displayPicture ||"Canada.jpg",
                username:req.LoginCookie.user,
                galleryName:displayName,
                id: id
            };
            
            res.render("handlebars",{
                data: galInfo
            });
        } catch (err){
            console.log(err);
            res.send("Error Loading gallery");
        } 
})

module.exports = router;