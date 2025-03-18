import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";
import { typeColors } from "../common/typeColors";

function Card({ id, setSelectedID }: { id: number; setSelectedID: React.Dispatch<React.SetStateAction<number>> }) {

    const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>();
    const [isImageLoading, setIsImageLoading] = useState(true);

    // upon load of card, fetch the pokemon details
    useEffect(() => {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then(response => {
            setPokemonDetails(response.data);
        });

    }, []);

    // construct image URL
    let pokeID = id.toString();
    while (pokeID.length < 3) pokeID = "0" + pokeID;

    // convert hex to RGBA with transparency for washed-out effect
    const hexToRGBA = (hex: string, alpha: number) => {
        // convert hex to RGB
        const r = parseInt(hex.substring(1, 3), 16); // first two characters after # is red
        const g = parseInt(hex.substring(3, 5), 16); // next 2 chars for green
        const b = parseInt(hex.substring(5, 7), 16); // last 2 chars for blue
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // get the primary type color for both text background and badge
    const firstType = pokemonDetails?.types?.[0]?.type?.name || "normal";
    const bgColor = hexToRGBA(typeColors[firstType], 0.1); // light opacity

    return (
        <div className="card rounded-4xl bg-base-100 shadow-sm p-8 px-4 basis-1/5 min-w-64 hover:-translate-y-2 duration-300 transition hover:cursor-pointer hover:shadow-xl hover:outline-4 overflow-hidden hover:scale-[1.02] grow sm:grow-0"
            onClick={() => {
                (document.getElementById('mowdal') as HTMLDialogElement).showModal();
                setSelectedID(id);
            }}>
            <div className={"relative " + (isImageLoading ? "hidden" : "block")}>
                {/* washed-out background Pokemon name */}
                <p className="text-9xl absolute -translate-x-36 translate-y-36 font-bold w-fit line-clamp-1"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
                <p className="text-9xl absolute -translate-x-5 translate-y-8 font-bold w-fit line-clamp-1"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
            </div>
            <figure>
                {isImageLoading && (
                    <div className="skeleton w-28 h-64 rounded-3xl bg-gray-100 grow"></div>
                )}
                <img

                    src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                    className={`drop-shadow-sm hover:translate-y-2 duration-500 hover:scale-105 hover:drop-shadow-xl grow ${isImageLoading ? "hidden" : "block"}`}
                    onLoad={() => setIsImageLoading(false)} // hide skeleton when image loads
                />
            </figure>
            <div className="card-body p-4 pb-0 z-10">
                {/* POKEMON ID */}
                <h3 className="text-gray-500">#{pokeID}</h3>

                {/* POKEMON TYPE BADGE */}
                <div className="flex flex-row justify-between gap-4 flex-wrap">
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