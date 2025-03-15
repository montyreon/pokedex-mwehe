import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";
import { typeColors } from "../common/typeColors";
import { getWeakness } from "../common/weakness";

export function Modal({ selectedPokemon }: { selectedPokemon: number }) {
    const [pokemonDescription, setPokemonDescription] = useState<string>("");
    const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>(null);
    const [pokemonCategory, setPokemonCategory] = useState<string>("");
    const [evolutionChain, setEvolutionChain] = useState<{ name: string; id: number }[]>([]);

    useEffect(() => {
        // fetch pokemon details
        axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon}`).then(response => {
            setPokemonDetails(response.data);
        });

        // fetch pokemon species details (for description, category, and evolution chain url)
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${selectedPokemon}/`).then(response => {
            const data = response.data;

            // find the first english description
            const descriptionEntry = data.flavor_text_entries.find((entry: any) => entry.language.name === "en");
            setPokemonDescription(descriptionEntry ? descriptionEntry.flavor_text.replace(/[\f\n\r]/g, " ") : "no description available.");

            // find the first english genus (category)
            const genusEntry = data.genera.find((entry: any) => entry.language.name === "en");
            setPokemonCategory(genusEntry ? genusEntry.genus : "unknown");

            // fetch the evolution chain
            if (data.evolution_chain?.url) {
                axios.get(data.evolution_chain.url).then(evolutionResponse => {
                    const chain = extractEvolutionChain(evolutionResponse.data.chain);
                    setEvolutionChain(chain);
                });
            }
        });
    }, [selectedPokemon]);

    // function to extract evolution chain names & ids recursively
    const extractEvolutionChain = (chain: any): { name: string; id: number }[] => {
        let evolutionStages: { name: string; id: number }[] = [];
        let currentStage = chain;

        while (currentStage) {
            const speciesURL = currentStage.species.url;
            const id = parseInt(speciesURL.split("/").slice(-2, -1)[0]); // extract id from url
            evolutionStages.push({ name: currentStage.species.name, id });

            if (currentStage.evolves_to.length > 0) {
                currentStage = currentStage.evolves_to[0]; // take the first evolution path
            } else {
                break;
            }
        }

        return evolutionStages;
    };

    // construct image URL
    let pokeID = selectedPokemon.toString();
    while (pokeID.length < 3) pokeID = "0" + pokeID;


    return (
        <dialog id="my_modal_2" className="modal w-auto">

            <div className="modal-box max-w-[1080px] rounded-4xl p-10 bg-pokered max-h-[90vh] overflow-y-auto">
                <div className="flex flex-row gap-8">
                    {/* POKEMON CARD */}
                    <div className="flex flex-col items-center gap-6">
                        <figure className="bg-yellow-50 border-8 border-pokeyellow rounded-3xl px-2">
                            <img
                                src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                                className="drop-shadow-sm hover:translate-y-2 duration-500 hover:scale-105 hover:drop-shadow-xl" />
                        </figure>
                        {/* height & weight */}
                        <div className="stats bg-pokedarkred text-white shadow">
                            <div className="stat">
                                <div className="stat-figure text-primary">

                                </div>
                                <div className="stat-title text-white">Height</div>
                                <div className="stat-value text-2xl"> {pokemonDetails?.height ? pokemonDetails.height / 10 : "n/a"} m</div>
                            </div>

                            <div className="stat">
                                <div className="stat-figure text-secondary">

                                </div>
                                <div className="stat-title text-white">Weight</div>
                                <div className="stat-value text-2xl"> {pokemonDetails?.weight ? pokemonDetails.weight / 10 : "n/a"} kg</div>
                            </div>

                        </div>
                    </div>

                    {/* POKEMON DETAILS */}
                    <div className="flex flex-col card shadow-sm rounded-4xl bg-pokedarkred/50 p-4 text-white gap-4">
                        <div className="flex card bg-pokedarkred p-4 rounded-3xl">

                            {/* pokemon name & id */}
                            <h3 className="font-bold text-4xl">#{selectedPokemon} {pokemonDetails?.name.toUpperCase()}</h3>

                            <div className="flex flex-row justify-start gap-3 items-center mt-1">

                                {/* pokemon category */}
                                <p className="text-pokeyellow text-xl italic">{pokemonCategory}</p>
                                {/* pokemon types */}

                                <div className="flex gap-2">
                                    {pokemonDetails?.types.map((type, index) => (
                                        <span key={index} className="text-white rounded-full px-3 py-1 text-sm font-semibold"
                                            style={{ backgroundColor: typeColors[type.type.name] }}>
                                            {type.type.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* pokemon description */}
                            <p className="pt-2">{pokemonDescription}</p>
                        </div>



                        {/* weaknesses */}
                        <div className="card p-4 bg-pokedarkred rounded-3xl flex flex-col gap-1">
                            <h4 className="font-bold text-lg">Weaknesses</h4>
                            <div className="flex flex-row gap-2 px-2">
                                {/* convert the Types[] to array first; also rearrange alphabetically */}
                                {pokemonDetails?.types && getWeakness(pokemonDetails.types.map((t) => t.type.name)).sort().map((weakness) => (

                                    <span className="text-white rounded-full px-3 py-1 text-sm font-semibold"
                                        style={{ backgroundColor: typeColors[weakness] }}>{weakness}</span>
                                ))}
                            </div>
                        </div>



                        {/* Stats */}
                        <div className="mt-4 w-min card card-body text-white">
                            <h4 className="font-bold text-lg">Base Stats</h4>
                            <ul className="list-none mt-2">
                                {pokemonDetails?.stats.map((stat, index) => {
                                    const normalizedValue = (stat.base_stat / 255) * 100; // normalize stat before graphing
                                    return (
                                        <li key={index} className="flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="capitalize">{stat.stat.name.replace("-", " ")}:</span>
                                                <span className="font-bold">{stat.base_stat}</span>
                                            </div>
                                            <progress className="progress progress-accent w-56" value={normalizedValue} max="100"></progress>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* evolution chain with images */}
                        <div className="mt-4">
                            <h4 className="font-bold text-lg">evolution chain</h4>
                            {evolutionChain.length > 0 ? (
                                <div className="flex flex-row items-center gap-4 mt-2">
                                    {evolutionChain.map((evolution, index) => (
                                        <div key={index} className="flex flex-row items-center">
                                            {/* evolution image */}
                                            <div className="flex flex-col">

                                                <img
                                                    src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(evolution.id).padStart(3, "0")}.png`}
                                                    alt={evolution.name}
                                                    className="w-20 h-20 object-contain"
                                                />
                                                {/* evolution name */}
                                                <p className="capitalize text-sm">{evolution.name}</p>
                                            </div>
                                            {/* arrow if there's a next evolution */}
                                            {index < evolutionChain.length - 1 && <span className="text-xl">→</span>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2">no evolution data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* close button */}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}