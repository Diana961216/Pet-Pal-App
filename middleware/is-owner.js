const Pet = require('../models/pet');

async function isOwner(req, res, next) {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      console.log(" No pet found");
      return res.redirect('/pets');
    }

    if (pet.owner.toString() !== req.session.user._id.toString()) {
      console.log("You are not the owner of this pet.");
      return res.redirect('/pets');
    }

    next();
  } catch (err) {
    console.error(err);
    res.redirect('/pets');
  }
}

module.exports = isOwner;
