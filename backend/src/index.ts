import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import {clerkMiddleware} from '@clerk/express';
import { clerkWebhookHandler } from './webhooks/clerk';
import { getEnv } from './lib/env';
import fs from "node:fs"
import path from "node:path"

const env = getEnv();

const app = express();

const rawJson = express.raw({type: 'application/json', limit: '1mb'});

// Clerk webhook handler before parsing in json cause we need that eventhandler before json parsing raw format
app.post('/webhooks/clerk', rawJson ,(req, res) => {
  // Handle Clerk webhook events here
  void clerkWebhookHandler(req, res);

})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(clerkMiddleware)


const publicDir = path.join(process.cwd(), "public")

if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir))

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}



app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT}`);
});
