import { Pokemon, PokemonType, CreatePokemon } from "@congruent-stack/example-monorepo-contract";
import { LoggerService } from "./logger_svc.js";
import { DATA_POKEMONS } from "./pokemon_db.js";

export class PokemonService {
  private readonly logger: LoggerService;
  
  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  getPokemon(id: number): Pokemon | null {
    this.logger.log(`Fetching Pokemon with ID: ${id}`);
    const pokemon = DATA_POKEMONS.find(p => p.id === id);
    return pokemon || null;
  }

  getPokemons(take: number, skip: number, type?: PokemonType): { list: Pokemon[], total: number } {
    this.logger.log(`Fetching Pokemons - take: ${take}, skip: ${skip}, type: ${type}`);
    
    let filtered = DATA_POKEMONS;
    if (type) {
      filtered = DATA_POKEMONS.filter(p => p.type === type);
    }
    
    const total = filtered.length;
    const list = filtered.slice(skip, skip + take);
    
    return { list, total };
  }

  createPokemon(pokemon: CreatePokemon): number {
    this.logger.log(`Creating Pokemon: ${pokemon.name}`);
    
    const newPokemon: Pokemon = {
      ...pokemon,
      id: DATA_POKEMONS.map(p => p.id).reduce((a, b) => Math.max(a, b), 0) + 1
    };
    
    DATA_POKEMONS.push(newPokemon);
    return newPokemon.id;
  }

  updatePokemon(id: number, pokemon: Pokemon): Pokemon | null {
    this.logger.log(`Updating Pokemon with ID: ${id}`);
    
    const index = DATA_POKEMONS.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    
    DATA_POKEMONS[index] = { ...pokemon, id };
    return DATA_POKEMONS[index];
  }

  patchPokemon(id: number, partialPokemon: Partial<Pokemon>): boolean {
    this.logger.log(`Patching Pokemon with ID: ${id}`);
    
    const index = DATA_POKEMONS.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    
    DATA_POKEMONS[index] = { ...DATA_POKEMONS[index], ...partialPokemon, id };
    return true;
  }

  deletePokemon(id: number): boolean {
    this.logger.log(`Deleting Pokemon with ID: ${id}`);
    
    const index = DATA_POKEMONS.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    
    DATA_POKEMONS.splice(index, 1);
    return true;
  }
}