import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import passport from "passport";
import { AppDataSource } from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(passport.initialize());

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


AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  });
