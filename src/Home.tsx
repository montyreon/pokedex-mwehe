import Card from './components/Card';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [pokemonObjects, setPokemonObjects] = useState([]);

  useEffect(() => {

  }, []);
  let number = 1;

  const fetchPokemon = async () => {
    const details = await axios.get(`https://pokeapi.co/api/v2/pokemon/${number}`);
    console.log(details.data);
    setPokemonObjects(details.data);
    
  }

  

  return (
    <>
    <div className='flex flex-row flex-wrap justify-start gap-4'>

      {/* call cards with id from 1 to 10 */}
      {[...Array(1000)].map((_, index) => (
        <Card key={index} id={index + 1} />
      ))}
    </div>

      <button className='btn' onClick={fetchPokemon}>fetch</button>
    </>
  )
}

export default Home
