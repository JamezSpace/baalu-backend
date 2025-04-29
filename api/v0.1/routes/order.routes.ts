import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function orderPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', async (req: FastifyRequest, response: FastifyReply) => {
        return response.send('Got all Orders')
    })
}

export default fastifyPlugin(orderPlugin);