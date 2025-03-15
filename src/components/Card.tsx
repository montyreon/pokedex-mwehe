import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";

function Card({ id, setSelectedID }: { id: number; setSelectedID: React.Dispatch<React.SetStateAction<number>> }) {

    const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>();
    const [pokemonDescription, setPokemonDescription] = useState<String>("");

    // upon load of card, fetch the pokemon details
    useEffect(() => {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then(response => {
            setPokemonDetails(response.data);
        });

        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`).then(response => {
            let i = 0;
            for (i = 0; i < response.data.flavor_text_entries.length; i++) {
                if (response.data.flavor_text_entries[i].language.name === "en") {
                    break;
                }
            }
            setPokemonDescription(response.data.flavor_text_entries[i].flavor_text);
        });
    }, []);

    // construct image URL
    let pokeID = id.toString();
    while (pokeID.length < 3) pokeID = "0" + pokeID;

    // lookup table for type badge background colors
    const typeColors: { [key: string]: string } = {
        normal: "#A8A878",
        fire: "#F08030",
        water: "#6890F0",
        electric: "#F8D030",
        grass: "#78C850",
        ice: "#98D8D8",
        fighting: "#C03028",
        poison: "#A040A0",
        ground: "#E0C068",
        flying: "#A890F0",
        psychic: "#F85888",
        bug: "#A8B820",
        rock: "#B8A038",
        ghost: "#705898",
        dark: "#705848",
        dragon: "#7038F8",
        steel: "#B8B8D0",
        fairy: "#EE99AC",
    };

    // Function to convert hex to RGBA with transparency for washed-out effect
    const hexToRGBA = (hex: string, alpha: number) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Get the primary type color for both text background and badge
    const firstType = pokemonDetails?.types?.[0]?.type?.name || "normal";
    const bgColor = hexToRGBA(typeColors[firstType], 0.1); // Lighter, transparent version for the text background

    return (
        <div className="card rounded-4xl bg-base-100 w-96 shadow-sm p-8 px-4 basis-1/5 min-w-80 hover:-translate-y-2 duration-300 transition hover:cursor-pointer hover:shadow-xl hover:outline-4 overflow-hidden hover:scale-[1.02]"
            onClick={() => { 
                (document.getElementById('my_modal_2') as HTMLDialogElement).showModal();
                setSelectedID(id); 
            }}>
            <div className="relative">
                {/* Washed-out background Pokémon name */}
                <p className="text-9xl absolute -translate-x-36 translate-y-36 font-bold w-fit"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
                <p className="text-9xl absolute -translate-x-5 translate-y-8 font-bold w-fit"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
            </div>
            <figure>
                <img
                    src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                    className="drop-shadow-sm hover:translate-y-2 duration-500 hover:scale-105 hover:drop-shadow-xl" />
            </figure>
            <div className="card-body p-4 z-10">
                {/* Pokémon ID */}
                <h3 className="text-gray-500">#{pokeID}</h3>

                {/* Pokémon Type Badge */}
                <div className="flex flex-row justify-between gap-4">
                    <h2 className="card-title">{pokemonDetails?.name.toUpperCase()}</h2>

                    <div className="flex flex-row gap-2 justify-end w-full">
                        {pokemonDetails?.types.map((type, index) => (
                            <span key={index} 
                                className="text-white rounded-full badge shadow-sm h-8 w-fit p-3 border-0"
                                style={{ backgroundColor: typeColors[type.type.name] }}>
                                {type.type.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;