import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";
import { typeColors } from "../common/typeColors";

function Card({ id, setSelectedID }: { id: number; setSelectedID: React.Dispatch<React.SetStateAction<number>> }) {

    const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>();
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // upon load of card, fetch the pokemon details
    useEffect(() => {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then(response => {
            setPokemonDetails(response.data);
            setIsDataLoading(false);
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
            // open modal on click of card
            onClick={() => {
                setSelectedID(id);
                (document.getElementById('mowdal') as HTMLDialogElement).showModal();
            }}>
            <div className={"relative " + (isImageLoading ? "hidden" : "block")}>
                {/* washed-out background Pokemon name */}
                <p className="absolute font-bold text-9xl -translate-x-36 translate-y-36 w-fit line-clamp-1"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
                <p className="absolute font-bold -translate-x-5 translate-y-8 text-9xl w-fit line-clamp-1"
                    style={{ color: bgColor, padding: "5px 10px", borderRadius: "10px" }}>
                    {pokemonDetails?.name.toUpperCase()}
                </p>
            </div>
            <figure>
                {isImageLoading && (
                    <div className="bg-gray-100 h- skeleton w-28 rounded-3xl grow"></div>
                )}
                <img
                    src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                    className={`drop-shadow-sm hover:translate-y-2 duration-500 hover:scale-105 hover:drop-shadow-xl grow ${isImageLoading ? "hidden" : "block"}`}
                    onLoad={() => setIsImageLoading(false)} // hide skeleton when image loads
                />
            </figure>
            <div className="z-10 p-4 pb-0 card-body">
                {/* POKEMON ID */}
                {isDataLoading ? (
                    <div className="w-16 h-6 bg-gray-100 rounded skeleton"></div>
                ) : (
                    <h3 className="text-gray-500">#{pokeID}</h3>
                )}

                {/* POKEMON TYPE BADGE */}
                <div className="flex flex-row flex-wrap justify-between gap-4">
                    {isDataLoading ? (
                        <div className="w-24 h-8 bg-gray-100 rounded skeleton"></div>
                    ) : (
                        <h2 className="card-title">{pokemonDetails?.name.toUpperCase()}</h2>
                    )}

                    <div className="flex flex-row justify-end w-full gap-2">
                        {isDataLoading ? (
                            <div className="w-16 h-8 bg-gray-100 rounded skeleton"></div>
                        ) : (
                            pokemonDetails?.types.map((type, index) => (
                                <span key={index}
                                    className="h-8 p-3 text-white border-0 rounded-full shadow-sm badge w-fit"
                                    style={{ backgroundColor: typeColors[type.type.name] }}>
                                    {type.type.name}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;