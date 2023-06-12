import express from "express";
const router = express.Router();
import fetchuser from "../middleware/fetchuser.js";
import Notes from "../models/Notes.js";
import { body, validationResult } from "express-validator";

// ROUTE 1: Get all the Notes using: GET "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server error");
  }
});

// ROUTE 2: Add a new Note using: POST "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, tag } = req.body;
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 3: Update and existing Note using: PUT "/api/notes/updatenote". Login required
router.put(
  "/updatenote/:id", fetchuser, async (req, res) => {
    const {title, description, tag} = req.body;

    try {
      // Create a newNote object
      const newNote = {};
      if(title){newNote.title = title};
      if(description){newNote.description = description};
      if(tag){newNote.tag = tag};
  
      // Find the node to be updated and update it
      // const note = Notes.findByIdAndUpdate()
      let note = await Notes.findById(req.params.id);
      if(!note){
        return res.status(404).send("Not Found");
      }
  
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }
  
      note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
      res.json({note});   
    }catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server error");
    }

    

  })

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete(
  "/deletenote/:id", fetchuser, async (req, res) => {
    try {  
      // Find the node to be deleted and delete it
      let note = await Notes.findById(req.params.id);
      if(!note){
        return res.status(404).send("Not Found");
      }
      // Allow deletion only if user owns this Note
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }
  
      note = await Notes.findByIdAndDelete(req.params.id);
      res.json({"Success": "Note has been deleted", note: note});  
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server error");
    }

  })

export default router;
