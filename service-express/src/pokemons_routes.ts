import { HttpStatusCode, middleware, route, CommonHeadersSchema, BaseRequestBodySchema, response, UnauthorizedResponseBodySchema } from '@congruent-stack/example-monorepo-contract';
import { reg } from './setup.js';
import { RoleCheckDecorator } from './role_check_decorator.js';

middleware(reg, '/pokemons')
  .inject((c) => ({
    loggerSvc: c.getLoggerSvc()
  }))
  .register({
    headers: CommonHeadersSchema,
    body: BaseRequestBodySchema.optional(),
    responses: {
      [HttpStatusCode.Unauthorized_401]: response({ body: UnauthorizedResponseBodySchema })
    }
  }, async (req, ctx) => {
    if (!req.headers['x-my-secret-header']) {
      return {
        code: HttpStatusCode.Unauthorized_401,
        body: { userMessage: 'Missing http header: x-my-secret-header' }
      };
    }

    if (req.headers['x-my-secret-header'].startsWith('my-secret') == false) {
      return {
        code: HttpStatusCode.Unauthorized_401,
        body: { userMessage: 'Invalid http header: x-my-secret-header' }
      };
    }
    await ctx.next();
  })

// List pokemons with pagination and optional filtering
route(reg, 'GET /pokemons')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const { take, skip, type } = req.query;
    const result = ctx.pokemonSvc.getPokemons(take, skip, type);
    return {
      code: HttpStatusCode.OK_200,
      body: result
    };
  });

// Create a new pokemon
route(reg, 'POST /pokemons')
  .decorateWith(RoleCheckDecorator, { roles: ['editor'] })
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const id = ctx.pokemonSvc.createPokemon(req.body);
    return {
      code: HttpStatusCode.Created_201,
      headers: { location: `http://localhost:3000/pokemons/${id}` },
      body: id
    };
  });

// Get a single pokemon by ID
route(reg, 'GET /pokemons/:id')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const pokemon = ctx.pokemonSvc.getPokemon(parseInt(req.pathParams.id, 10));
    if (!pokemon) {
      return { code: HttpStatusCode.NotFound_404, body: { userMessage: `Pokemon with ID ${req.pathParams.id} not found` } };
    }
    return {
      code: HttpStatusCode.OK_200,
      body: pokemon
    };
  });

// Full update of a pokemon
route(reg, 'PUT /pokemons/:id')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const id = parseInt(req.pathParams.id, 10);
    const updatedPokemon = ctx.pokemonSvc.updatePokemon(id, req.body);
    if (!updatedPokemon) {
      return { code: HttpStatusCode.NotFound_404, body: { userMessage: `Pokemon with ID ${req.pathParams.id} not found` } };
    }
    return {
      code: HttpStatusCode.OK_200,
      body: updatedPokemon
    };
  });

// Partial update of a pokemon
route(reg, 'PATCH /pokemons/:id')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const id = parseInt(req.pathParams.id, 10);
    const success = ctx.pokemonSvc.patchPokemon(id, req.body);
    if (!success) {
      return { code: HttpStatusCode.NotFound_404, body: { userMessage: `Pokemon with ID ${req.pathParams.id} not found` } };
    }
    return {
      code: HttpStatusCode.NoContent_204
    };
  });

// Delete a pokemon
route(reg, 'DELETE /pokemons/:id')
  .inject((scope) => ({
    pokemonSvc: scope.getPokemonSvc(),
    loggerSvc: scope.getLoggerSvc(),
  }))
  .register(async (req, ctx) => {
    ctx.loggerSvc.log(`secret header = ${req.headers["x-my-secret-header"]}`);
    const id = parseInt(req.pathParams.id, 10);
    const success = ctx.pokemonSvc.deletePokemon(id);
    if (!success) {
      return { code: HttpStatusCode.NotFound_404, body: { userMessage: `Pokemon with ID ${req.pathParams.id} not found` } };
    }
    return {
      code: HttpStatusCode.NoContent_204
    };
  });