import "dotenv/config"
import express from "express"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express";

import { getEnv } from "./lib/env";
import { clerkWebhookHandler } from "./webhook/clerk";


const env = getEnv();
const app = express();

const rawJson = express.raw({type :"application/json",limit : "1mb"});


// dont oatse the event data , it should be un raw format 
app.post("/webhooks/clerk",rawJson,(req,res)=>{
    void clerkWebhookHandler(req,res);
})
 
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.listen(env.PORT,()=>{
    console.log(`Server is up and running on port ${env.PORT}`)
})