import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import passport from "passport";
import { AppDataSource } from "./config/database";
import { passportStrategy } from './config/passport';
import authRoutes from "./routes/auth.routes"
import expenseRouter from "./routes/expense.routes";
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin : process.env.FRONTEND_URL,
    credentials: true,
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(passport.initialize());
passport.use('jwt',passportStrategy);

app.get("/health",(req: express.Request, res: express.Response) => {
    res.json({ status: "OK", message: "expense tracker api is running"})
})

app.use('/api/auth',authRoutes)
app.use('/api/expense',expenseRouter)

app.use((req: express.Request, res: express.Response) => {
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
