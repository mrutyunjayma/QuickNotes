const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//  ROUTE-1:craete all notes using : GET "api/notes/fetchallnotes".Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
});

//  ROUTE-2:add  notes using : POST "api/notes/addnotes".Login required
router.post("/addnotes",fetchuser, [
    body("title", "enter a valid title").isLength({ min: 3 }),
    body("description", "description most contain 5 latter").isLength({min: 5, }), ], 
    async (req, res) => {
    
    try {
      const { title, description, tag } = req.body;

      //if any error there ,return bad error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({ title,description,tag,user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message)
      res.status(500).send("some error occured")
    }
  }
);

//  ROUTE-3:upadted   notes using : put "api/notes/updatenote".Login required
router.put("/updatenote/:id",fetchuser,async (req, res) => {
  const { title, description, tag } = req.body;
  //craete new note object 
    const newNote = {};
    if(title){newNote.title=title}
    if(description){newNote.description=description}
    if(tag){newNote.tag=tag}

    // find the  notes updated  and update it
    let note = await Note.findById(req.params.id);
    if(!note){ return res.status(404).send ("Not found")}

  // if userId is not found
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote},{new:true})
    res.json({note});
  })
  
//  ROUTE-4:delete existing    notes using : DELETE "api/notes/deletenote".Login required
router.delete("/deletenote/:id",fetchuser,async (req, res) => {
  const { title, description, tag } = req.body;

    // find the  notes updated  and update it
    let note = await Note.findById(req.params.id);
    if(!note){ return res.status(404).send ("Not found")}

  // if userId is not found
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"success":"your note has been deleted"});
  })

module.exports = router;
