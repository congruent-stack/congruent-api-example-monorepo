import z from "zod";
import { apiContract, endpoint, response, HttpStatusCode as s } from "@congruent-stack/congruent-api";

export * from '@congruent-stack/congruent-api';

export const CommonHeadersSchema = z.object({
  'x-tenant-id': z.string(),
});

export const BaseRequestBodySchema = z.object({
  tenantId: z.string(),
});

export const PokemonSchema = BaseRequestBodySchema.extend({
  id: z.number().int().min(1),
  name: z.string(),
  type: z.union([
    z.literal('fire'),
    z.literal('water'),
    z.literal('grass'),
  ]),
  description: z.string().optional(),
});

export type Pokemon = z.output<typeof PokemonSchema>;

export const CreatePokemonSchema = PokemonSchema.omit({ id: true });

export type CreatePokemon = z.output<typeof CreatePokemonSchema>;

export const NotFoundSchema = z.object({
  userMessage: z.string(),
});

export const pokedexApiContract = apiContract({
  pokemons: {
    GET: endpoint({
      headers: CommonHeadersSchema,
      query: z.object({
        take: z.union([z.number(), z.string()]) // z.input
                .transform((v) => Number(v))
                .pipe(z.number().int().min(0).max(25)) // z.output
                .default(10),
        skip: z.union([z.number(), z.string()])
                .transform((v) => Number(v))
                .pipe(z.number().int().min(0))
                .default(10),
        type: PokemonSchema.shape.type.optional(),
      }),
      responses: {
        [s.OK_200]: response({
          body: z.object({
            list: z.array(PokemonSchema),
            total: z.number().int(),
          })
        }),
      }
    }),
    POST: endpoint({
      headers: CommonHeadersSchema,
      body: CreatePokemonSchema,
      responses: {
        [s.Created_201]: response({ 
          headers: z.object({
            location: z.url().describe("URL of the created resource")
          }),
          body: z.number().int() 
        }),
      }
    }),
    [':id']: {
      GET: endpoint({
        headers: CommonHeadersSchema,
        responses: {
          [s.OK_200]: response({ body: PokemonSchema }),
          [s.NotFound_404]: response({ body: NotFoundSchema }),
        },
      }),
      DELETE: endpoint({
        headers: CommonHeadersSchema,
        responses: {
          [s.NoContent_204]: response({  }),
          [s.NotFound_404]: response({ body: NotFoundSchema }),
        }
      }),
      PUT: endpoint({
        headers: CommonHeadersSchema,
        body: PokemonSchema,
        responses: {
          [s.OK_200]: response({ body: PokemonSchema }),
          [s.NotFound_404]: response({ body: NotFoundSchema }),
        }
      }),
      PATCH: endpoint({
        headers: CommonHeadersSchema,
        body: PokemonSchema.partial(),
        responses: {
          [s.NoContent_204]: response({  }),
          [s.NotFound_404]: response({ body: NotFoundSchema }),
        }
      }),
    }
  },
});

