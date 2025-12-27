import { describe, it, expect } from 'vitest';
import { reg, container } from './setup.js';
import { createInProcApiClient, HttpStatusCode, pokedexApiContract, Pokemon, route } from '@congruent-stack/example-monorepo-contract'
// import { LoggerService } from './logger_svc.js';
import { PokemonService } from './pokemon_svc.js';
import "./pokemons_routes.js";

describe("Get single pokemon by ID", () => {
  class MockLoggerService {
    log(_msg: string): void {
      // no-op
    }
  }

  class MockPokemonService {
    getPokemon(id: number): Pokemon | null {
      if (id === 1) {
        return { id: 1, name: "Bulbasaur", type: "grass", description: "A grass-type Pokémon with a seed on its back." };
      }
      return null;
    }
  }

  it("should fetch a pokemon that exists", async () => {
    const response = await route(reg, 'GET /pokemons/:id').trigger({
      getLoggerSvc: () => new MockLoggerService(),
      getPokemonSvc: () => new MockPokemonService() as PokemonService,
    }, {
      headers: { "x-my-secret-header": "test-header" },
      pathParams: { id: "1" },
      query: null,
      body: null
    });

    if (response.code !== HttpStatusCode.OK_200) {
      expect.fail(`Expected 200 OK but got ${response.code}`);
      return;
    }
    
    expect(response.body).toEqual({ id: 1, name: "Bulbasaur", type: "grass", description: "A grass-type Pokémon with a seed on its back." });
  });

  it("should return 404 for a pokemon that does not exist", async () => {
    const response = await route(reg, 'GET /pokemons/:id').trigger({
      getLoggerSvc: () => new MockLoggerService(),
      getPokemonSvc: () => new MockPokemonService() as PokemonService,
    }, {
      headers: { "x-my-secret-header": "test-header" },
      pathParams: { id: "999" },
      query: null,
      body: null
    });

    if (response.code !== HttpStatusCode.NotFound_404) {
      expect.fail(`Expected 404 Not Found but got ${response.code}`);
      return;
    }
    
    expect(response.body).toEqual({ userMessage: `Pokemon with ID 999 not found` });
  });
});

describe("E2E Get single pokemon by ID", () => {
  const testContainer = container.createTestClone()
    .override('LoggerSvc', () => {
      const prefix = '[LOG-TEST]: ';
      return ({
        log: (msg: string) => { 
          return `${prefix}${msg}`;
        }
      });
    }) // the register override order does not matter
    .override('PokemonSvc', (c) => new PokemonService(c.getLoggerSvc()));

  const client = createInProcApiClient(pokedexApiContract, testContainer, reg);

  it("should fetch a pokemon that exists", async () => {
    const response = await client.pokemons.id(1).GET({
      headers: { "x-my-secret-header": "my-secret-xxx" }
    })

    if (response.code !== HttpStatusCode.OK_200) {
      expect.fail(`Expected 200 OK but got ${response.code}: ${response.body.userMessage}`);
      return;
    }

    expect(response.body.id).toBe(1);
  });

  it("should return 404 for a pokemon that does not exist", async () => {
    const response = await client.pokemons.id(999).GET({
      headers: { "x-my-secret-header": "my-secret-xxx" }
    });

    if (response.code !== HttpStatusCode.NotFound_404) {
      expect.fail(`Expected 404 Not Found but got ${response.code}: ${JSON.stringify(response.body)}`);
      return;
    }

    expect(response.body.userMessage).toEqual(`Pokemon with ID 999 not found`);
  });
});

describe("E2E Create new pokemon with role check", () => {
  const testContainer = container.createTestClone()
    .override('LoggerSvc', () => {
      const prefix = '[LOG-TEST]: ';
      return ({
        log: (msg: string) => {
          return `${prefix}${msg}`;
        }
      });
    }) // the register override order does not matter
    .override('PokemonSvc', (c) => new PokemonService(c.getLoggerSvc()));

  const client = createInProcApiClient(pokedexApiContract, testContainer, reg);

  it("should return 403 Forbidden when creating a pokemon without editor role", async () => {
    const response = await client.pokemons.POST({
      headers: { "x-my-secret-header": "my-secret-viewer" },
      body: {
        name: "Charizard",
        type: "fire",
        description: "A fire-type Pokémon that breathes fire."
      }
    });
    if (response.code !== HttpStatusCode.Forbidden_403) {
      expect.fail(`Expected 403 Forbidden but got ${response.code}: ${JSON.stringify(response.body)}`);
      return;
    }
    expect(response.body.userMessage).toEqual("Insufficient role to access this resource");
  });

  it("should create a new pokemon when editor role is provided", async () => {
    const response = await client.pokemons.POST({
      headers: { "x-my-secret-header": "my-secret-editor" },
      body: {
        name: "Charmander",
        type: "fire",
        description: "A fire-type Pokémon that has a flame on its tail."
      }
    });
    if (response.code !== HttpStatusCode.Created_201) {
      expect.fail(`Expected 201 Created but got ${response.code}: ${JSON.stringify(response.body)}`);
      return;
    }
    expect(response.headers?.location).toBeDefined();
  });
});