
import Card from './components/Card';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Current selected ID: {selectedPokemon}</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className='flex flex-row flex-wrap justify-center gap-6 w-full'>

        {/* call cards with id from 1 to 1000 */}
        {[...Array(20)].map((_, index) => (
          <Card key={index} id={index + 1} setSelectedID={setSelectedPokemon} />
        ))}
      </div>

      <button className='btn' onClick={fetchPokemon}>fetch</button>
    </div>
  )
}

export default Home
