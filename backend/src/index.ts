import express from "express"
import { db } from "./db/db";
const app = express();


app.listen(3001,()=>{
    console.log("Server is up and running on port 3001")
})