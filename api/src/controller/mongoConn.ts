import mongoose from "mongoose";

export async function mongodbConnection(mongooseURI: string) {
    return new Promise<void>((resolve, reject) => {
        console.log(`Connecting to database...`)

        mongoose.connect(mongooseURI).then(() => {
            console.log(`Connection to the database has been successfully initialized!\n`)
            resolve()
        }).catch((e) => {
            reject(e)
            console.log('Something went wrong while connecting to the database:\n' + e.message)
        });

        mongoose.Promise = global.Promise;

        mongoose.connection.on("error", (err) => {
            console.log(`[Database] Mongoose connection error: ${err.stack}`);
        });
        mongoose.connection.on("disconnected", () => {
            console.log(`[Database] Mongoose connection lost`);
        });
    })
}