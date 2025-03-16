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
      const pokemonList = response.data.results.map((pokemon: Pokemon, index: number) => ({
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
    <>
      <div className='p-12'>
        <div className='flex flex-col-reverse sm:flex-row-reverse justify-center gap-8 sm:gap-0'>
          <Modal selectedPokemon={selectedPokemon} />

          {/* CARDS SECTION */}
          <section className='flex flex-wrap justify-center gap-6 flex-[2]'>
            {filteredPokemon.slice(0, 10).map(pokemon => (
              <Card key={pokemon.id} id={pokemon.id} setSelectedID={setSelectedPokemon} />
            ))}
          </section>

          {/* FILTER CONTROLS */}
          <section className='flex flex-col justify-center h-fit bg-pokered glass card rounded-3xl shadow-lg text-white p-8 gap-5 grow min-w-[300px] max-w-[400px]'>
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
      <footer className="footer footer-horizontal footer-center bg-pokedarkred text-primary-content p-10">
        <aside className="text-center">
          <p className="font-bold">
            Old St. Labs Internship Technical Assessment
            <br />
            Developed by @montyreon
          </p>
          <p>
            Pokémon images and data © {new Date().getFullYear()} Pokémon. <br />
            Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and Creatures. <br />
            This webpage uses data from <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="underline">PokéAPI</a>.
          </p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a href="https://github.com/montyreon" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.207 11.385.6.113.793-.258.793-.577 0-.285-.011-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.083-.729.083-.729 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.805 1.304 3.49.997.108-.776.42-1.305.764-1.605-2.665-.3-5.467-1.332-5.467-5.926 0-1.31.467-2.38 1.235-3.22-.124-.303-.535-1.523.116-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.002-.403c1.018.004 2.042.138 3.002.403 2.292-1.552 3.3-1.23 3.3-1.23.653 1.653.243 2.873.119 3.176.77.84 1.234 1.91 1.234 3.22 0 4.608-2.807 5.624-5.48 5.92.432.37.823 1.103.823 2.222 0 1.606-.014 2.902-.014 3.296 0 .321.192.694.798.576 4.765-1.586 8.2-6.084 8.2-11.386 0-6.627-5.373-12-12-12">
                </path>
              </svg>
            </a>
          </div>
        </nav>
      </footer>
    </>
  );
}

export default Home;