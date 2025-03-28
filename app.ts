import express, { Application, Request, Response} from 'express';

const app: Application = express()

app.listen(process.env.PORT, () => {
    console.log('Server open on port', process.env.PORT)
})