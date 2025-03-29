import { configDotenv } from "dotenv";
import { createTransport, SendMailOptions } from 'nodemailer';
import { NotificationType } from './types';
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Collection } from 'mongodb';
import { MongoClient, ServerApiVersion } from "mongodb";

configDotenv()

const password = encodeURIComponent(process.env?.DB_PASSWORD || ""),
    uri = `mongodb+srv://${process.env?.DB_USER}:${password}@freecluster.jdr5d.mongodb.net/?retryWrites=true&w=majority&appName=FreeCluster`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client: MongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const email_service: Collection = client.db("baalu").collection("email_service");
let retry_count = -1,
    mail_details: SendMailOptions = {
        from: "System Alert",
        to: process.env.BAALU_EMAIL
    }

export const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.PROGRAMMATIC_EMAIL,
        pass: process.env.PROGRAMMATIC_EMAIL_PASSWORD
    }
})

export async function compileEmail(type: NotificationType, req_body: any) {
    if (type === NotificationType.CONTACT) mail_details.subject = 'Someone Reached Out Via Your Contact Form'
    else if (type === NotificationType['REQUEST QUOTE']) mail_details.subject = 'New Quote Requested'

    const base_path = path.resolve(__dirname, './'),
        email_html_path = path.resolve(
            base_path,
            "email_templates",
            type === NotificationType.CONTACT ? "contact.html" : "quote_request.html");

    let email_template = await readFile(email_html_path, { encoding: 'utf-8' })

    email_template = email_template.replace("{{senders_name}}", req_body.name)
    email_template = email_template.replace("{{senders_email}}", req_body.email)

    if(req_body.message) email_template = email_template.replace("{{message}}", req_body.message)

    if (req_body.skus) {
        email_template = email_template.replace("{{company}}", req_body.company_name)
        email_template = email_template.replace("{{order}}", req_body.order_management)
        email_template = email_template.replace("{{items}}", req_body.items_per_order)
        email_template = email_template.replace("{{skus}}", req_body.skus)
        email_template = email_template.replace("{{info}}", req_body.additional_info || 'No additional information')
    }

    mail_details.html = email_template
}

export const notifyAdmin = async () => {
    retry_count += 1;

    if (!(retry_count <= 3)) {
        console.log(`Error sending email after ${retry_count} times`);
        return;
    }

    try {
        const response_object = await transporter.sendMail(mail_details)

        console.log("Email sent \n", response_object);

        await email_service.insertOne({
            from: mail_details.from,
            to: mail_details.to,
            response: response_object.response
        })
    } catch (error) {
        console.error(error);
    }
}