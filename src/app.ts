import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import { issueRoute } from './modules/issue/issue.route';
import logger from './middleware/logger';
import { authRoute } from './modules/auth/auth.route';
const app : Application = express()
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { globalErrorHandler } from './middleware/globalErrorHandlier';


app.use(cookieparser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));


const corsOptions = {
  origin: 'http://localhost:3000'
}
app.use(cors(corsOptions))

app.use(logger);



app.get('/', (req: Request, res : Response) => {
  res.status(200).json({ "message": 'devPulse server is running',
   } )
   })

   app.use('/api/issues' , issueRoute)
   app.use('/api/auth' , authRoute )


   // Global Error Handling Middleware
app.use(globalErrorHandler);

   export default app;
