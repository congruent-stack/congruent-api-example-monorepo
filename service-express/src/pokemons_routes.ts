import { HttpStatusCode, route } from '@congruent-stack/example-monorepo-contract';
import { reg } from './setup.js';

route(reg, 'GET /pokemons/:id')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`tenant id from x-tenant-id header = ${req.headers["x-tenant-id"]}`);
    const pokemon = ctx.pokemonSvc.getPokemon(parseInt(req.pathParams.id, 10));
    if (!pokemon) {
      return { code: HttpStatusCode.NotFound_404, body: { userMessage: `Pokemon with ID ${req.pathParams.id} not found` } };
    }
    return {
      code: HttpStatusCode.OK_200,
      body: pokemon
    };
  });

route(reg, 'POST /pokemons')
  .inject((scope) => ({
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`ROUTE HANDLER: tenant id from x-tenant-id header = ${req.headers['x-tenant-id']}, body tenant id = ${req.body.tenantId}`);
    return {
      code: HttpStatusCode.Created_201,
      headers: { location: '999' },
      body: 999
    };
  });