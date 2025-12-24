import { Pokemon } from "@congruent-stack/example-monorepo-contract";
import { LoggerService } from "./logger_svc.js";

export class PokemonService {

  constructor(
    private readonly logger: LoggerService
  ) {}

  getPokemon(id: number): Pokemon | null {
    this.logger.log(`Fetching Pokemon with ID: ${id}`);
    return {
      tenantId: 'XXX',
      id,
      name: "Bulbasaur",
      type: "grass",
      description: "A grass-type Pokémon."
    };
  }
}