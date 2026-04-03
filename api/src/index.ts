import 'dotenv/config';
import express, {Request, Response} from 'express';
import cors from 'cors'
import { mongodbConnection } from './controller/mongoConn';
import timeTracker from './schemas/timeSchema';
import authReq from './middlewares/auth';
const port = process.env.PORT || 3000
const app = express();
const robuxFund = 0.0011111111111111;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

(async () => {
    await mongodbConnection(process.env.MONGODB_LINK!)
})()

app.get("/", async (req:Request, res:Response) => {
    res.sendStatus(200);
})

app.post('/', authReq, async (req:Request, res:Response) => {
    const body = req.body;
    const username = body.username;
    const userId = body.userId;
    const time = body.minutes;
    const funds = time * robuxFund;
    const isUser = await timeTracker.findOne({ userId })

    if(!username || !userId || !time) return res.status(400).send('Bad Request')

    if(isUser){
        isUser.time += time;
        isUser.funds += funds;
        isUser.save();
    }else {
        try{
            let newUser = new timeTracker({ username, userId, time, funds })
            newUser.save();
        }catch(err){
            res.status(500).send("Error")
            console.log(err)
        }
    }

    console.log(body)
})

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`)
})