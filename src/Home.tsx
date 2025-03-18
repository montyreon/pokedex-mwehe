import Card from './components/Card';
import { useState, useEffect, use } from 'react';
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
  const [sortOption, setSortOption] = useState<string>('id-asc');
  const [displayLimit, setdisplayLimit] = useState<number>(25);

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
    setSortOption('id-asc');
    setdisplayLimit(25);
  };

  useEffect(() => {
    applyFilters();
  }, [searchName, searchId, sortOption]);

  useEffect(() => {
    const limit = displayLimit === 1025 ? allPokemon.length : displayLimit;
    setFilteredPokemon(allPokemon.slice(0, limit));
  }, [displayLimit, allPokemon]);

  // SCROLL TO TOP BUTTON MECHANISM ========================================
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      // show scroll up button when not at the top
      setShowScrollButton(window.scrollY > 100);
      // hide button again when at the very bottom
      setShowScrollButton(window.scrollY < document.body.scrollHeight - window.innerHeight - 100); // 100px from bottom
      // hide button when at the top
      if (window.scrollY === 0) setShowScrollButton(false);
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
      <nav className="sticky top-0 z-50 px-12 shadow-lg navbar backdrop-blur-2xl glass">
        <img src={pokeball} alt="pokeball" className='h-10' />
        <div className="flex-1">
          <a className="text-xl font-bold">Pokédex</a>
        </div>
      </nav>
      <div className='min-h-screen p-8 sm:p-12'>
        <div className='flex flex-col-reverse items-center justify-center max-w-full gap-8 md:flex-row-reverse md:items-start'>
          {/* MODAL FOR DETAILED PREVIEW */}
          <Modal selectedPokemon={selectedPokemon} />

          {/* CARDS SECTION */}
          <section className='flex flex-wrap justify-center md:justify-start gap-6 flex-[2] max-w-full'>
            {filteredPokemon.slice(0, previewCount).map(pokemon => (
              <Card key={pokemon.id} id={pokemon.id} setSelectedID={setSelectedPokemon} />
            ))}

            {/* conditional no pokemon found message */}
            {filteredPokemon.length === 0 && !initialFetch &&
              <div className='flex flex-col items-center justify-center w-full gap-4 p-4 my-16 text-center'>
                <h1 className='text-4xl font-bold text-pokered'>No Pokémon found</h1>
                <p className='text-gray-800'>Try clearing the filters or check your search terms.</p>
              </div>
            }

            {/* click to load more (blank card) */}
            <div className={"card rounded-4xl bg-base-100 shadow-sm p-8 px-4 basis-1/5 min-w-64 hover:-translate-y-2 duration-300 transition hover:cursor-pointer hover:shadow-xl hover:outline-4 overflow-hidden hover:scale-[1.02] grow sm:grow-1 sm:max-h-[120rem] max-w-[30rem] " + (previewCount > 10 ? "hidden" : "block")}
              // uncap the preview count to show at most 100 pokemons
              onClick={() => { setPreviewCount(100) }
              }
            >
              <figure className="flex flex-col items-center justify-center w-full text-gray-500 bg-gray-100 grow min-h-64 skeleton rounded-3xl">
                <div className="">
                  Click to load more...
                </div>
              </figure>
              <div className="z-10 flex-col justify-between p-4 pb-0 card-body">
                <div>
                  <h3 className="text-gray-200">#----</h3>
                  <h2 className="w-24 bg-gray-100 rounded-full card-title skeleton min-h-6"></h2>
                </div>
                <div className="flex flex-row flex-wrap justify-between gap-4">
                  <div className="flex flex-row justify-end w-full gap-2">
                    <span className='w-16 text-gray-100 rounded-full badge skeleton'></span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* FILTER CONTROLS CARD */}
          <section className='flex flex-col justify-center h-fit bg-pokered glass card rounded-3xl shadow-lg text-white p-4 sm:p-8 gap-5 grow min-w-[300px] sm:max-w-[400px]'>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pokémon_logo.svg/1200px-International_Pokémon_logo.svg.png" alt="" />
            <div className="flex flex-row items-center justify-between gap-4 p-4 pb-0 pr-0">
              <h3 className="text-2xl font-bold sm:text-4xl"> Filter by:</h3>
              <button
                className='text-white border-0 rounded-full shadow-md btn bg-pokedarkred/50 shadow-red-900'
                onClick={clearFilters}>
                clear
              </button>
            </div>

            {/* FILTER INPUTS */}
            <div className="flex flex-col gap-2 p-2 text-gray-800 card bg-pokedarkred/50 rounded-2xl">
              {/* name search input */}
              <label className="w-full rounded-lg input rounded-t-xl">
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
              <label className="w-full rounded-lg input">
                <StickyNote className='text-gray-400' strokeWidth={1.75} />
                <input
                  type="number"
                  className="grow"
                  placeholder="pokemon id"
                  value={tempSearchId}
                  onChange={(e) => setTempSearchId(e.target.value)}
                />
              </label>
                <div className="flex flex-row items-center justify-between w-full px-3 py-1 mt-2 card bg-pokedarkred/50 rounded-xl">
                <p className='text-white line-clamp-1 grow w-min'>Sort by: </p>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="flex flex-row items-center justify-center m-1 font-normal text-white border-none shadow-sm btn grow min-w-2/5 max-w-32 bg-pokeblue shadow-gray-600 ">
                  <p className='line-clamp-1'>
                    {sortOption === 'name-asc' ? '⬆️ Name' :
                    sortOption === 'name-desc' ? '⬇️ Name' :
                      sortOption === 'id-asc' ? '⬆️ ID' :
                      sortOption === 'id-desc' ? '⬇️ ID'
                      : '↕️ Sort'}
                  </p>
                  {/* dropdown for sort options */}
                  </div>
                  <ul tabIndex={0} className="p-2 shadow-sm dropdown-content menu bg-base-100 rounded-box z-1 w-52">
                  <li><a className={sortOption === 'name-asc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('name-asc'); (document.activeElement as HTMLElement)?.blur(); }}>⬆️ Name</a></li>
                  <li><a className={sortOption === 'name-desc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('name-desc'); (document.activeElement as HTMLElement)?.blur(); }}>⬇️ Name</a></li>
                  <li><a className={sortOption === 'id-asc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('id-asc'); (document.activeElement as HTMLElement)?.blur(); }}>⬆️ ID</a></li>
                  <li><a className={sortOption === 'id-desc' ? 'bg-gray-200' : ''} onClick={() => { setSortOption('id-desc'); (document.activeElement as HTMLElement)?.blur(); }}>⬇️ ID</a></li>
                  </ul>
                </div>
                </div>

                <div className="flex flex-row items-center justify-between w-full px-3 py-1 card bg-pokedarkred/50 rounded-xl">
                <p className='text-white line-clamp-1 grow w-min'>Display count: </p>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="flex flex-row items-center justify-center m-1 font-normal text-white border-none shadow-sm btn grow min-w-2/5 max-w-32 bg-pokeblue shadow-gray-600 ">
                  <p className='line-clamp-1'>
                    {displayLimit}
                  </p>
                  {/* dropdown for display count options */}
                  </div>
                  <ul tabIndex={0} className="p-2 shadow-sm dropdown-content menu bg-base-100 rounded-box z-1 w-52">
                  <li><a className={displayLimit === 10 ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(10); (document.activeElement as HTMLElement)?.blur(); }}>10</a></li>
                  <li><a className={displayLimit === 25 ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(25); (document.activeElement as HTMLElement)?.blur(); }}>25</a></li>
                  <li><a className={displayLimit === 50 ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(50); (document.activeElement as HTMLElement)?.blur(); }}>50</a></li>
                  <li><a className={displayLimit === 100 ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(100); (document.activeElement as HTMLElement)?.blur(); }}>100</a></li>
                  <li><a className={displayLimit === 200 ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(200); (document.activeElement as HTMLElement)?.blur(); }}>200</a></li>
                  <li><a className={displayLimit === allPokemon.length ? 'bg-gray-200' : ''} onClick={() => { setdisplayLimit(allPokemon.length); (document.activeElement as HTMLElement)?.blur(); }}>All</a></li>
                  </ul>
                </div>
                </div>
            </div>



            {/* apply filters button */}
            <div className="flex justify-center w-full">
              <button
                className='w-4/5 text-gray-800 border-0 rounded-full shadow-md btn bg-pokeyellow shadow-yellow-900'
                onClick={() => {
                  applyFilters();
                  // also disable the "click to load more" card
                  setPreviewCount(displayLimit);
                }}>
                apply
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* BACK TO TOP BUTTON (STICKY AND FLOATING)*/}
      <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none bottom-8">
        <button
          className={"pointer-events-auto btn border-0 text-base py-4 sm:py-2 px-4 bg-pokeyellow text-gray-800 rounded-full shadow-md hover:bg-yellow-500 transition-all duration-300 transform " + (showScrollButton ? "" : "opacity-0 z-[-1]")}
          onClick={() => {
            scrollToTop();
            // query the button to add a small animation
            const button = document.querySelector('.pointer-events-auto');
            if (button) {
              button.classList.add('translate-x-5');
              setTimeout(() => button.classList.remove('translate-x-5'), 300);
            }
          }}
        >
          ↑ back to top
        </button>
      </div>

      <footer className="p-10 footer footer-horizontal footer-center bg-pokedarkred text-primary-content glass">
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