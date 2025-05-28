import express from "express";
import { searchContacts, getContactsForDMList, getAllContacts} from "../controllers/ContactsController.js"
import { verifyToken } from "../middleware/AuthMiddleware.js";

const contactsRoutes = express.Router();

contactsRoutes.post("/api/contacts/search", verifyToken, searchContacts);
contactsRoutes.get("/api/contacts/get-contacts-for-dm", verifyToken, getContactsForDMList);
contactsRoutes.get("/api/contacts/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;
