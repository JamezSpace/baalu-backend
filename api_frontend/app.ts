import express, { Application, Request, Response} from 'express';
import cors from 'cors';
import { client, compileEmail, notifyAdmin } from './utils';
import { NotificationType } from './types';
import { Collection } from 'mongodb';


const app: Application = express()

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/contact', async (req: Request, res: Response) => {
    await compileEmail(NotificationType.CONTACT, req.body);
    await notifyAdmin();
})

app.post('/quote', async (req:Request, res: Response) => {
    const { name, email, company_name, order_management, items_per_order, skus, additional_info } = req.body;

    const clients: Collection = client.db("baalu").collection("clients");
    const requests: Collection = client.db("baalu").collection("requests");

    const saved_client = await clients.insertOne({
        name: name,
        email: email,
        company_name: company_name,
        created_at: new Date().toISOString()
    })

    if(!saved_client.acknowledged) {
        res.status(500).json({ success: false, msg: "Error saving up client details" })
        return
    }

    const saved_request = await requests.insertOne({
        client_id: saved_client.insertedId,
        order_management: order_management,
        items_per_order: items_per_order,
        skus : skus,
        additional_information: additional_info,
        created_at: new Date().toISOString()
    })

    if(!saved_request.acknowledged) {
        res.status(500).json({ success: false, msg: "Error saving request!" })
    }
    
    await compileEmail(NotificationType['REQUEST QUOTE'], req.body)
    await notifyAdmin()

    res.status(200).json({success: true})
})

app.use((req: Request, res: Response) => {
    res.status(404).send('Route Not Found');
})

app.listen(process.env.PORT, () => {
    console.log('Server open on port', process.env.PORT)
})