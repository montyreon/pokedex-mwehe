import Card from './components/Card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './components/Modal';
import { Pokemon } from './model/types';
import pokeball from './assets/pokeball.png';
import { Search, StickyNote } from 'lucide-react';

function Home() {

  // POKEMON DATA FUNCTIONS  ========================================
  const [initialFetch, setInitialFetch] = useState<boolean>(true);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]); // stores the full pokemon catalog
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<number>(1);

  // fetch the full pokemon list (only names and ids)
  useEffect(() => {
    const fetchAllPokemon = async () => {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
      const pokemonList = response.data.results.map((pokemon: Pokemon, index: number) => ({
        id: index + 1,
        name: pokemon.name,
      }));
      setAllPokemon(pokemonList);
      // initially display all pokemon
      setFilteredPokemon(pokemonList);
      // this is for displaying the appropriate skeleton cards for the initial load
      setInitialFetch(false);
    };

    fetchAllPokemon();
  }, []);


  // FILTERING & SORTING FUNCTIONS ========================================

  // input fields for user typing (not applied yet)
  const [tempSearchName, setTempSearchName] = useState<string>('');
  const [tempSearchId, setTempSearchId] = useState<string>('');
  const [previewCount, setPreviewCount] = useState<number>(10);
  const [sortOption, setSortOption] = useState<string>('name-asc');

  // applied filter values
  const [searchName, setSearchName] = useState<string>('');
  const [searchId, setSearchId] = useState<string>('');

  // apply filters only when "apply" is clicked
  const applyFilters = () => {
    // apply sorting
    let sorted = [...allPokemon];
    switch (sortOption) {
      case 'name-asc':
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted = sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'id-asc':
        sorted = sorted.sort((a, b) => a.id - b.id);
        break;
      case 'id-desc':
        sorted = sorted.sort((a, b) => b.id - a.id);
        break;
      case 'type-asc':
        sorted = sorted.sort((a, b) => a.types[0].type.name.localeCompare(b.types[0].type.name));
        break;
      case 'type-desc':
        sorted = sorted.sort((a, b) => b.types[0].type.name.localeCompare(a.types[0].type.name));
        break;
      default:
        break;
    }
    setAllPokemon(sorted);
    setSearchName(tempSearchName);
    setSearchId(tempSearchId);
  };

  // update the displayed pokemon when filters change
  useEffect(() => {
    let filtered = allPokemon.filter(pokemon =>
      (searchName === '' || pokemon.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (searchId === '' || pokemon.id.toString().includes(searchId))
    );
    setFilteredPokemon(filtered);
  }, [searchName, searchId, allPokemon]);

  // clear all filters
  const clearFilters = () => {
    setTempSearchName('');
    setTempSearchId('');
    setSearchName('');
    setSearchId('');
    setSortOption('name-asc');
  };


  // SCROLL TO TOP BUTTON MECHANISM ========================================
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      // show scroll up button when not at the top
      setShowScrollButton(window.scrollY > 100);
      // hide button again when at the very bottom
      setShowScrollButton(window.scrollY < document.body.scrollHeight - window.innerHeight - 100); // 100px from bottom
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* NAVIGATION BAR */}
      <nav className="navbar sticky top-0 z-50 backdrop-blur-2xl glass px-12 shadow-lg">
        <img src={pokeball} alt="pokeball" className='h-10' />
        <div className="flex-1">
          <a className="text-xl font-bold">Pokédex</a>
        </div>
      </nav>
      <div className='p-8 sm:p-12'>
        <div className='flex flex-col-reverse md:flex-row-reverse justify-center items-center md:items-start gap-8'>
          {/* MODAL FOR DETAILED PREVIEW */}
          <Modal selectedPokemon={selectedPokemon} />

          {/* CARDS SECTION */}
          <section className='flex flex-wrap justify-center md:justify-start gap-6 flex-[2]'>
            {filteredPokemon.slice(0, previewCount).map(pokemon => (
              <Card key={pokemon.id} id={pokemon.id} setSelectedID={setSelectedPokemon} />
            ))}

            {/* conditional no pokemon found message */}
            {filteredPokemon.length === 0 && !initialFetch &&
              <div className='flex flex-col items-center justify-center gap-4 p-4'>
                <h1 className='text-4xl font-bold text-pokered'>No Pokémon found</h1>
                <p className='text-gray-800'>Try clearing the filters or check your search terms.</p>
              </div>
            }

            {/* click to load more (blank card) */}
            <div className={"card rounded-4xl bg-base-100 shadow-sm p-8 px-4 basis-1/5 min-w-64 hover:-translate-y-2 duration-300 transition hover:cursor-pointer hover:shadow-xl hover:outline-4 overflow-hidden hover:scale-[1.02] grow sm:grow-0 " + (previewCount > 10 ? "hidden" : "block")}
              // uncap the preview count to show at most 100 pokemons
              onClick={() => { setPreviewCount(100) }}
            >
              <figure>
                <div className="skeleton w-28 h-64 rounded-3xl bg-gray-100 text-gray-500 grow flex flex-col justify-center items-center">
                  Click to load more...
                </div>
              </figure>
              <div className="card-body p-4 pb-0 z-10">
                <h3 className="text-gray-200">#----</h3>
                <div className="flex flex-row justify-between gap-4 flex-wrap">
                  <h2 className="card-title skeleton bg-gray-100 w-24 min-h-6 rounded-full"></h2>

                  <div className="flex flex-row gap-2 justify-end w-full">
                    <span className='badge skeleton text-gray-100 w-16'></span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* FILTER CONTROLS CARD */}
          <section className='flex flex-col justify-center h-fit bg-pokered glass card rounded-3xl shadow-lg text-white p-8 gap-5 grow min-w-[300px] sm:max-w-[400px]'>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pokémon_logo.svg/1200px-International_Pokémon_logo.svg.png" alt="" />
            <div className="flex flex-row items-center justify-between p-4 pb-0 pr-0 gap-4">
              <h3 className="font-bold text-2xl sm:text-4xl"> Filter by:</h3>
              <button
                className='btn bg-pokedarkred/50 text-white border-0 shadow-md shadow-red-900 rounded-full'
                onClick={clearFilters}>
                clear
              </button>
            </div>

            {/* FILTER INPUTS */}
            <div className="card bg-pokedarkred/30 rounded-2xl flex flex-col gap-1 text-gray-800 p-6 gap-2">
              {/* name search input */}
              <label className="input w-full">
                <Search className='text-gray-400' strokeWidth={1.75} />
                <input
                  type="search"
                  className="grow"
                  placeholder="name"
                  value={tempSearchName}
                  onChange={(e) => setTempSearchName(e.target.value)}
                />
              </label>
              {/* pokemon id search input */}
              <label className="input w-full">
                <StickyNote className='text-gray-400' strokeWidth={1.75} />
                <input
                  type="number"
                  className="grow"
                  placeholder="pokemon id"
                  value={tempSearchId}
                  onChange={(e) => setTempSearchId(e.target.value)}
                />
              </label>
              <div className="w-full card flex flex-row justify-between items-center bg-pokedarkred/50 px-3 py-1">
                <p className='text-white line-clamp-1 grow w-min'>Sort by: </p>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1 flex flex-row font-normal justify-center items-center grow min-w-2/5 max-w-32 bg-pokeblue shadow-sm shadow-gray-600 text-gray-900 border-none ">
                    <p className='line-clamp-1'>
                      {sortOption === 'name-asc' ? '⬆️ Name' :
                        sortOption === 'name-desc' ? '⬇️ Name' :
                          sortOption === 'id-asc' ? '⬆️ ID' :
                            sortOption === 'id-desc' ? '⬇️ ID' :
                              sortOption === 'type-asc' ? '⬆️ Type' :
                                sortOption === 'type-desc' ? '⬇️ Type' : '⬆️ Name'}
                    </p>
                  </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li><a className={sortOption === 'name-asc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('name-asc'); (document.activeElement as HTMLElement)?.blur(); }}>⬆️ Name</a></li>
                    <li><a className={sortOption === 'name-desc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('name-desc'); (document.activeElement as HTMLElement)?.blur(); }}>⬇️ Name</a></li>
                    <li><a className={sortOption === 'id-asc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('id-asc'); (document.activeElement as HTMLElement)?.blur(); }}>⬆️ ID</a></li>
                    <li><a className={sortOption === 'id-desc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('id-desc'); (document.activeElement as HTMLElement)?.blur(); }}>⬇️ ID</a></li>
                    <li><a className={sortOption === 'type-asc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('type-asc'); (document.activeElement as HTMLElement)?.blur(); }}>⬆️ Type</a></li>
                    <li><a className={sortOption === 'type-desc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('type-desc'); (document.activeElement as HTMLElement)?.blur(); }}>⬇️ Type</a></li>
                    </ul>
                </div>
              </div>
            </div>



            {/* apply filters button */}
            <div className="flex justify-center w-full">
              <button
                className='btn rounded-full bg-pokeyellow text-gray-800 border-0 shadow-md shadow-yellow-900 w-4/5'
                onClick={() => {
                  applyFilters();
                  // also disable the "click to load more" card
                  setPreviewCount(100);
                }}>
                apply
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* BACK TO TOP BUTTON (STICKY AND FLOATING)*/}
      <button
        className={"btn border-0 text-base fixed bottom-8 left-1/2 transform -translate-x-1/2 py-4 sm:py-2 px-4 z-50 bg-pokeyellow text-gray-800 rounded-full shadow-md hover:bg-yellow-500 transition-all duration-300 " + (showScrollButton ? "" : "opacity-0 z-[-1]")}
        onClick={scrollToTop}
      >
        ↑ back to top
      </button>

      <footer className="footer footer-horizontal footer-center bg-pokedarkred text-primary-content p-10 glass">
        <aside className="text-center">
          <p className="font-bold">
            Old St. Labs Internship Technical Assessment
            <br />
            Developed by @montyreon
          </p>
          <p>
            Pokémon images and data © {new Date().getFullYear()} Pokémon. <br />
            Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and Creatures. <br />
            This webpage uses data from <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="underline">PokeAPI</a>.
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