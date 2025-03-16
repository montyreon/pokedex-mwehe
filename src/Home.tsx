
import Card from './components/Card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from './components/Modal';

function Home() {
  const [pokemonObjects, setPokemonObjects] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState<number>(1);

  useEffect(() => {

  }, []);
  let number = 1;

  const fetchPokemon = async () => {
    const details = await axios.get(`https://pokeapi.co/api/v2/pokemon/${number}`);
    console.log(details.data);
    setPokemonObjects(details.data);

  }



  return (
    <div className='p-12'>
      <div className='bg-green-300 flex flex-row justify-center gap-6 h-screen'>
        <Modal selectedPokemon={selectedPokemon} />

        {/* CARD SECTION */}
        <section className='flex flex-row flex-wrap justify-center gap-6 flex-[2]'>
          {/* call cards with id from 1 to 50 */}
          {[...Array(50)].map((_, index) => (
            <Card key={index} id={index + 1} setSelectedID={setSelectedPokemon} />
          ))}
        </section>

        {/* FILTER CONTROLS */}
        <section className='flex flex-col justify-center h-fit bg-pokered glass card rounded-3xl shadow-lg text-white p-8 gap-5 flex-1'>
          <div className="flex flex-row items-center justify-between p-4 pb-0 pr-0 gap-4">
            <h3 className="font-bold text-2xl xl:text-4xl"> Filter by:</h3>
            <div className="flex flex-row gap-2">
              <button className='btn bg-pokedarkred/50 text-white border-0 shadow-md shadow-red-900 rounded-full'>Clear</button>

            </div>
          </div>

          <div className="card bg-pokedarkred/30 rounded-2xl flex flex-col gap-1 text-gray-800 p-6">
            {/* <div className="card p-4 bg-pokedarkred/50 rounded-2xl flex flex-col gap-1 text-gray-800"> */}
              <label className="input w-full">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                <input type="search" className="grow" placeholder="Name" />
              </label>
              <label className="input w-full">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></g></svg>
                <input type="number" className="grow" placeholder="Pokemon id" />
              </label>
            {/* </div> */}
          </div>
          <div className="flex justify-center w-full">
          <button className='btn rounded-full bg-pokeyellow text-gray-800 border-0 shadow-md shadow-yellow-900 w-4/5'>Apply</button>
          </div>

        </section>
      </div>
    </div>
  )
}

export default Home
