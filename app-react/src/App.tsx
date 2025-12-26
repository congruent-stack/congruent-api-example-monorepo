import { useState, useEffect, useCallback } from 'react'
import './App.css'

import { pokedexApiContract } from '@congruent-stack/example-monorepo-contract';
import type { Pokemon, CreatePokemon, PokemonType } from '@congruent-stack/example-monorepo-contract';
import { createFetchClient } from '@congruent-stack/congruent-api-fetch';

const pokedexApi = createFetchClient(pokedexApiContract, {
  baseUrl: 'http://localhost:3000'
});

const HEADERS = { 'x-my-secret-header': 'my-secret-value' };

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [filterType, setFilterType] = useState<PokemonType | ''>('');
  
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
  const [patchingPokemon, setPatchingPokemon] = useState<Pokemon | null>(null);
  
  const [newPokemon, setNewPokemon] = useState<CreatePokemon>({
    name: '',
    type: 'fire',
    description: ''
  });

  // GET /pokemons - Fetch list of pokemons
  const fetchPokemons = useCallback(async () => {
    try {
      const response = await pokedexApi.pokemons.GET({
        headers: HEADERS,
        query: {
          take,
          skip,
          ...(filterType && { type: filterType as PokemonType })
        }
      });
      setPokemons(response.body.list);
      setTotal(response.body.total);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    }
  }, [take, skip, filterType]);

  // GET /pokemons/:id - Fetch single pokemon
  const fetchPokemonById = async (id: number) => {
    try {
      const response = await pokedexApi.pokemons.id(id).GET({
        headers: HEADERS
      });
      if (response.code === 200) {
        setSelectedPokemon(response.body);
        console.log('Fetched pokemon:', response.body);
      }
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      alert('Pokemon not found!');
    }
  };

  // POST /pokemons - Create new pokemon
  const createPokemon = async () => {
    try {
      const response = await pokedexApi.pokemons.POST({
        headers: HEADERS,
        body: newPokemon
      });
      console.log('Created pokemon with ID:', response.body);
      console.log('Location:', response.headers.location);
      setNewPokemon({ name: '', type: 'fire', description: '' });
      fetchPokemons();
    } catch (error) {
      console.error('Error creating pokemon:', error);
    }
  };

  // PUT /pokemons/:id - Full update
  const updatePokemon = async () => {
    if (!editingPokemon) return;
    try {
      const response = await pokedexApi.pokemons.id(editingPokemon.id).PUT({
        headers: HEADERS,
        body: editingPokemon
      });
      console.log('Updated pokemon:', response.body);
      setEditingPokemon(null);
      fetchPokemons();
    } catch (error) {
      console.error('Error updating pokemon:', error);
      alert('Pokemon not found!');
    }
  };

  // PATCH /pokemons/:id - Partial update
  const patchPokemon = async () => {
    if (!patchingPokemon) return;
    try {
      await pokedexApi.pokemons.id(patchingPokemon.id).PATCH({
        headers: HEADERS,
        body: { description: patchingPokemon.description }
      });
      console.log('Patched pokemon description');
      setPatchingPokemon(null);
      fetchPokemons();
    } catch (error) {
      console.error('Error patching pokemon:', error);
      alert('Pokemon not found!');
    }
  };

  // DELETE /pokemons/:id - Delete pokemon
  const deletePokemon = async (id: number) => {
    if (!confirm(`Delete pokemon #${id}?`)) return;
    try {
      await pokedexApi.pokemons.id(id).DELETE({
        headers: HEADERS
      });
      console.log('Deleted pokemon:', id);
      fetchPokemons();
    } catch (error) {
      console.error('Error deleting pokemon:', error);
      alert('Pokemon not found!');
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Pokédex Manager</h1>

      {/* CREATE - POST /pokemons */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '2px solid #4CAF50', borderRadius: '8px' }}>
        <h2>Create New Pokemon (POST /pokemons)</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            placeholder="Name"
            value={newPokemon.name}
            onChange={(e) => setNewPokemon({ ...newPokemon, name: e.target.value })}
          />
          <select
            value={newPokemon.type}
            onChange={(e) => setNewPokemon({ ...newPokemon, type: e.target.value as PokemonType })}
          >
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="grass">Grass</option>
          </select>
          <input
            placeholder="Description"
            value={newPokemon.description}
            onChange={(e) => setNewPokemon({ ...newPokemon, description: e.target.value })}
          />
          <button onClick={createPokemon}>Create</button>
        </div>
      </section>

      {/* LIST - GET /pokemons */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '2px solid #2196F3', borderRadius: '8px' }}>
        <h2>Pokemon List (GET /pokemons)</h2>
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Filter by type:</label>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value as PokemonType | ''); setSkip(0); }}>
            <option value="">All</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="grass">Grass</option>
          </select>
          <label>Take:</label>
          <input type="number" value={take} onChange={(e) => setTake(Number(e.target.value))} style={{ width: '60px' }} />
          <button onClick={() => setSkip(Math.max(0, skip - take))}>Previous</button>
          <button onClick={() => setSkip(skip + take)}>Next</button>
          <span>Showing {skip + 1}-{Math.min(skip + take, total)} of {total}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Description</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pokemons.map((pokemon) => (
              <tr key={pokemon.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{pokemon.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{pokemon.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{pokemon.type}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{pokemon.description}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <button onClick={() => fetchPokemonById(pokemon.id)} style={{ marginRight: '5px' }}>View</button>
                  <button onClick={() => setEditingPokemon(pokemon)} style={{ marginRight: '5px' }}>Edit</button>
                  <button onClick={() => setPatchingPokemon(pokemon)} style={{ marginRight: '5px' }}>Patch</button>
                  <button onClick={() => deletePokemon(pokemon.id)} style={{ background: '#f44336', color: 'white' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SINGLE VIEW - GET /pokemons/:id */}
      {selectedPokemon && (
        <section style={{ marginBottom: '30px', padding: '20px', border: '2px solid #9C27B0', borderRadius: '8px' }}>
          <h2>Selected Pokemon (GET /pokemons/{selectedPokemon.id})</h2>
          <div>
            <p><strong>ID:</strong> {selectedPokemon.id}</p>
            <p><strong>Name:</strong> {selectedPokemon.name}</p>
            <p><strong>Type:</strong> {selectedPokemon.type}</p>
            <p><strong>Description:</strong> {selectedPokemon.description}</p>
            <button onClick={() => setSelectedPokemon(null)}>Close</button>
          </div>
        </section>
      )}

      {/* FULL UPDATE - PUT /pokemons/:id */}
      {editingPokemon && (
        <section style={{ marginBottom: '30px', padding: '20px', border: '2px solid #FF9800', borderRadius: '8px' }}>
          <h2>Edit Pokemon (PUT /pokemons/{editingPokemon.id})</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              placeholder="Name"
              value={editingPokemon.name}
              onChange={(e) => setEditingPokemon({ ...editingPokemon, name: e.target.value })}
            />
            <select
              value={editingPokemon.type}
              onChange={(e) => setEditingPokemon({ ...editingPokemon, type: e.target.value as PokemonType })}
            >
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              <option value="grass">Grass</option>
            </select>
            <input
              placeholder="Description"
              value={editingPokemon.description}
              onChange={(e) => setEditingPokemon({ ...editingPokemon, description: e.target.value })}
            />
            <button onClick={updatePokemon}>Save (PUT)</button>
            <button onClick={() => setEditingPokemon(null)}>Cancel</button>
          </div>
        </section>
      )}

      {/* PARTIAL UPDATE - PATCH /pokemons/:id */}
      {patchingPokemon && (
        <section style={{ marginBottom: '30px', padding: '20px', border: '2px solid #00BCD4', borderRadius: '8px' }}>
          <h2>Patch Pokemon Description (PATCH /pokemons/{patchingPokemon.id})</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              placeholder="Description"
              value={patchingPokemon.description}
              onChange={(e) => setPatchingPokemon({ ...patchingPokemon, description: e.target.value })}
              style={{ flex: 1 }}
            />
            <button onClick={patchPokemon}>Save (PATCH)</button>
            <button onClick={() => setPatchingPokemon(null)}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
