import express, { type Application, type Request, type Response } from 'express'
import { issueRoute } from './modules/issue/issue.route';
import { userRoute } from './modules/users/user.route';
const app : Application = express()


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res : Response) => {
  res.status(200).json({ "message": 'devPulse server is running',
   } )
   })

   app.use('/api/issues' , issueRoute)
   app.use('/api/users' , userRoute)


   export default app;
