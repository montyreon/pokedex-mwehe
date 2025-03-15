import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";

function Card({ id }: { id: number }) {

    const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>();
    const [pokemonDescription, setPokemonDescription] = useState<String>("");


    // upon load of card, fetch the pokemon details
    useEffect(() => {
        const getPokemonDetails = () => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        getPokemonDetails().then((response) => {
            setPokemonDetails(response.data);
            // console.log(response.data);
        });

        // const description = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
        // // setPokemonDescription(description.data.flavor_text_entries[0].flavor_text);
        // console.log(description.data.flavor_text_entries[0].flavor_text);

        const getPokemonDescription = () => axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
        getPokemonDescription().then((response) => {
            // find the index of the first english description
            let i = 0;
            for (i = 0; i < response.data.flavor_text_entries.length; i++) {
                if (response.data.flavor_text_entries[i].language.name === "en") {
                    break;
                }
            }

            setPokemonDescription(response.data.flavor_text_entries[i].flavor_text);
            console.log(response.data.flavor_text_entries[i].flavor_text);
        });
    }, []);

    // construct image url
    let pokeID = id.toString();

    // add padding 0s to the id if needed
    while (pokeID.length < 3)
        pokeID = "0" + pokeID;

    const imgUrl = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`

    return (
        <div className="card bg-base-100 w-96 shadow-sm">
            <figure>
                <img
                    src={imgUrl}
                    alt="Shoes" />
            </figure>
            <div className="card-body">
                <h3 className="">#{pokeID}</h3>
                <h2 className="card-title">{pokemonDetails?.name.toUpperCase()}</h2>
                {/* remove unkown character */}
                <p>{pokemonDescription.replace("","")}</p> 

            </div>
        </div>
    );
}

export default Card;