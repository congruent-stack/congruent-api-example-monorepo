import { Pokemon, PokemonType, CreatePokemon } from "@congruent-stack/example-monorepo-contract";
import { LoggerService } from "./logger_svc.js";

export class PokemonService {
  private pokemons: Pokemon[] = [];
  private nextId: number = 1;
  
  constructor(
    private readonly logger: LoggerService
  ) {
    // Initialize with some sample data
    this.pokemons = [
      { id: 1, name: "Bulbasaur", type: "grass", description: "A grass-type Pokémon with a seed on its back." },
      { id: 2, name: "Charmander", type: "fire", description: "A fire-type Pokémon with a flame on its tail." },
      { id: 3, name: "Squirtle", type: "water", description: "A water-type Pokémon with a tough shell." },
      { id: 4, name: "Pikachu", type: "fire", description: "An electric-type Pokémon (simulated as fire)." },
      { id: 5, name: "Ivysaur", type: "grass", description: "An evolved grass-type Pokémon." },
    ];
    this.nextId = 6;
  }

  getPokemon(id: number): Pokemon | null {
    this.logger.log(`Fetching Pokemon with ID: ${id}`);
    const pokemon = this.pokemons.find(p => p.id === id);
    return pokemon || null;
  }

  getPokemons(take: number, skip: number, type?: PokemonType): { list: Pokemon[], total: number } {
    this.logger.log(`Fetching Pokemons - take: ${take}, skip: ${skip}, type: ${type}`);
    
    let filtered = this.pokemons;
    if (type) {
      filtered = this.pokemons.filter(p => p.type === type);
    }
    
    const total = filtered.length;
    const list = filtered.slice(skip, skip + take);
    
    return { list, total };
  }

  createPokemon(pokemon: CreatePokemon): number {
    this.logger.log(`Creating Pokemon: ${pokemon.name}`);
    
    const newPokemon: Pokemon = {
      ...pokemon,
      id: this.nextId++,
    };
    
    this.pokemons.push(newPokemon);
    return newPokemon.id;
  }

  updatePokemon(id: number, pokemon: Pokemon): Pokemon | null {
    this.logger.log(`Updating Pokemon with ID: ${id}`);
    
    const index = this.pokemons.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    
    this.pokemons[index] = { ...pokemon, id };
    return this.pokemons[index];
  }

  patchPokemon(id: number, partialPokemon: Partial<Pokemon>): boolean {
    this.logger.log(`Patching Pokemon with ID: ${id}`);
    
    const index = this.pokemons.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    
    this.pokemons[index] = { ...this.pokemons[index], ...partialPokemon, id };
    return true;
  }

  deletePokemon(id: number): boolean {
    this.logger.log(`Deleting Pokemon with ID: ${id}`);
    
    const index = this.pokemons.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    
    this.pokemons.splice(index, 1);
    return true;
  }
}