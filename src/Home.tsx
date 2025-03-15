
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
      <div className='w-full flex flex-row justify-center'>
      </div>
        
      <Modal selectedPokemon={selectedPokemon} />
      <div className='flex flex-row flex-wrap justify-center gap-6 w-full'>

        {/* call cards with id from 1 to 1000 */}
        {[...Array(50)].map((_, index) => (
          <Card key={index} id={index + 1} setSelectedID={setSelectedPokemon} />
        ))}
      </div>

      <button className='btn' onClick={fetchPokemon}>fetch</button>
    </div>
  )
}

export default Home
