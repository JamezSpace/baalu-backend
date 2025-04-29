import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, fastify } from "fastify";
import orderPlugin from './routes/order.routes';
import { configDotenv } from "dotenv";

configDotenv()
const fast = fastify({ logger: true })

// api scopes
// To prefix all endpoints with 'api', I created a general scopes function that houses the base endpoint and all other endpoints in their respective plugins
async function scopes(scope: FastifyInstance) {
    scope.get('/', async (_req: FastifyRequest, response: FastifyReply) => {
        return response.send('Hit the base endpoint!')
    })

    // register plugins
    scope.register(orderPlugin, { prefix: 'orders' })
}

// register the global the api scope
fast.register(scopes, { prefix: '/api' })


// spin up the server
fast.listen({ port: Number(process.env?.PORT) || 4200 }, (err, address) => {
    if (err) {
        fast.log.error(err)
        process.exit(1)
    }

    fast.log.info(`Server running on port ${address}!`)
})