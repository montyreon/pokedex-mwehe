import Card from './components/Card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './components/Modal';
import { Pokemon } from './model/types';

function Home() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]); // stores the full pokémon catalog
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]); // stores filtered pokémon
  const [selectedPokemon, setSelectedPokemon] = useState<number>(1);

  // input fields for user typing (not applied yet)
  const [tempSearchName, setTempSearchName] = useState('');
  const [tempSearchId, setTempSearchId] = useState('');

  // applied filter values
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');

  // fetch the full pokémon list (only names and ids)
  useEffect(() => {
    const fetchAllPokemon = async () => {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
      const pokemonList = response.data.results.map((pokemon:Pokemon, index:number) => ({
        id: index + 1,
        name: pokemon.name,
      }));
      setAllPokemon(pokemonList);
      setFilteredPokemon(pokemonList); // initially display all pokémon
    };

    fetchAllPokemon();
  }, []);

  // apply filters only when "apply" is clicked
  const applyFilters = () => {
    setSearchName(tempSearchName);
    setSearchId(tempSearchId);
  };

  // update the displayed pokémon when filters change
  useEffect(() => {
    setFilteredPokemon(
      allPokemon.filter(pokemon =>
        (searchName === '' || pokemon.name.toLowerCase().includes(searchName.toLowerCase())) &&
        (searchId === '' || pokemon.id.toString().includes(searchId))
      )
    );
  }, [searchName, searchId, allPokemon]);

  // clear all filters
  const clearFilters = () => {
    setTempSearchName('');
    setTempSearchId('');
    setSearchName('');
    setSearchId('');
  };

  return (
    <div className='p-12'>
      <div className=' flex flex-row justify-center gap-6 h-screen'>
        <Modal selectedPokemon={selectedPokemon} />

        {/* card section */}
        <section className='flex flex-wrap justify-center gap-6 flex-[2]'>
          {filteredPokemon.slice(0, 50).map(pokemon => (
            <Card key={pokemon.id} id={pokemon.id} setSelectedID={setSelectedPokemon} />
          ))}
        </section>

        {/* filter controls */}
        <section className='flex flex-col justify-center h-fit bg-pokered glass card rounded-3xl shadow-lg text-white p-8 gap-5 grow min-w-[300px] max-w-[500px]'>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pokémon_logo.svg/1200px-International_Pokémon_logo.svg.png" alt="" />
          <div className="flex flex-row items-center justify-between p-4 pb-0 pr-0 gap-4">
            <h3 className="font-bold text-4xl"> filter by:</h3>
            <button 
              className='btn bg-pokedarkred/50 text-white border-0 shadow-md shadow-red-900 rounded-full'
              onClick={clearFilters}
            >
              clear
            </button>
          </div>

          <div className="card bg-pokedarkred/30 rounded-2xl flex flex-col gap-1 text-gray-800 p-6">
            <label className="input w-full">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
              <input 
                type="search" 
                className="grow" 
                placeholder="name"
                value={tempSearchName}
                onChange={(e) => setTempSearchName(e.target.value)}
              />
            </label>
            <label className="input w-full">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></g></svg>
              <input 
                type="number" 
                className="grow" 
                placeholder="pokemon id"
                value={tempSearchId}
                onChange={(e) => setTempSearchId(e.target.value)}
              />
            </label>
          </div>

          <div className="flex justify-center w-full">
            <button 
              className='btn rounded-full bg-pokeyellow text-gray-800 border-0 shadow-md shadow-yellow-900 w-4/5'
              onClick={applyFilters}
            >
              apply
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;