import mongoose from "mongoose";


export const connentDB = () => {
    mongoose.connect(process.env.MONGO_URL , {
        dbName : "librento"
    })
    .then( () => console.log(`Database connected successfully`))
    .catch( (err) => {console.log(`Error while connecting to DB ${err}`)});
}
