import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// passport

app.get("/health",(req,res) => {
    res.json({ status: "OK", message: "expense tracker api is running"})
})

// routes

app.use((req,res) => {
    res.status(404).json({ message: "route not found "});
})

app.use((err: any, req:express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(err,"error occured");
    res.status(err.status || 500).json({
        message: err.messge || "internal sever error"
    })
})


app.listen(PORT,() => {
    console.log(`server is running at port ${PORT}`)
})