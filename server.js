import { app } from "./app.js";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLIENT_NAME,
  api_key: process.env.CLOUDNARY_CLIENT_API,
  api_secret: process.env.CLOUDNARY_CLIENT_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
