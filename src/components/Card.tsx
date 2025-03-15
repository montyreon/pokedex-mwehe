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

    // lookup table for type badg background colors
    const typeColors: { [key: string]: string } = {
        normal: "bg-gray-400",
        fire: "bg-red-500",
        water: "bg-blue-500",
        electric: "bg-yellow-500",
        grass: "bg-green-500",
        ice: "bg-blue-300",
        fighting: "bg-red-800",
        poison: "bg-purple-500",
        ground: "bg-yellow-800",
        flying: "bg-blue-300",
        psychic: "bg-purple-900",
        bug: "bg-green-800",
        rock: "bg-yellow-600",
        ghost: "bg-indigo-700",
        dark: "bg-gray-800",
        dragon: "bg-blue-800",
        steel: "bg-gray-600",
        fairy: "bg-pink-500",
    }

    return (
        <div className="card rounded-4xl bg-base-100 w-96 shadow-sm p-8 px-4 basis-1/5 min-w-80 hover:-translate-y-2 duration-300 transition hover:cursor-pointer hover:shadow-xl">
            <figure>
                <img
                    src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                    className="drop-shadow-xl" />
            </figure>
            <div className="card-body p-4">
                {/* POKEMON ID */}
                <h3 className="text-gray-500">#{pokeID}</h3>
                {/* relocate this to expanded view */}
                {/* remove unkown character */}
                {/* <p>{pokemonDescription.replace("", "")}</p> */}

                {/* POKEMON TYPE BADGE */}
                <div className="flex flex-row justify-between gap-4">
                    <h2 className="card-title">{pokemonDetails?.name.toUpperCase()}</h2>

                    <div className="flex flex-row gap-2 justify-end w-full">
                        {pokemonDetails?.types.map((type, index) =>
                            <span key={index} className={"text-white rounded-full badge shadow-sm h-8 w-fit p-3 border-0  " + typeColors[type.type.name]}>
                                {type.type.name}
                            </span>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Card;