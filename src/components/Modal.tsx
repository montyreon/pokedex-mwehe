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
    const [previewedPokemon, setPreviewedPokemon] = useState<number>(selectedPokemon);

    useEffect(() => {
        setPreviewedPokemon(selectedPokemon); // sync previewedPokemon when selectedPokemon changes
    }, [selectedPokemon]);

    useEffect(() => {
        // fetch pokemon details
        axios.get(`https://pokeapi.co/api/v2/pokemon/${previewedPokemon}`).then(response => {
            setPokemonDetails(response.data);
        });

        // fetch pokemon species details (for description, category, and evolution chain url)
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${previewedPokemon}/`).then(response => {
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
    }, [previewedPokemon]);

    // function to extract evolution chain names & ids recursively
    const extractEvolutionChain = (chain: any): { name: string; id: number }[] => {
        let evolutionStages: { name: string; id: number }[] = [];

        const traverseChain = (node: any) => {
            if (!node) return;
            const speciesURL = node.species.url;
            const id = parseInt(speciesURL.split("/").slice(-2, -1)[0]); // extract id from url
            evolutionStages.push({ name: node.species.name, id });

            node.evolves_to.forEach(traverseChain); // handle multiple evolutions
        };

        traverseChain(chain);
        return evolutionStages;
    };

    // construct image URL
    let pokeID = previewedPokemon.toString().padStart(3, "0");

    const changePokemon = (newID: number) => {
        if (newID > 0 && newID < 1010) {
            setPreviewedPokemon(newID);
        }
    };

    return (
        <dialog id="my_modal_2" className="modal w-auto">
            <div className="modal-box max-w-[1080px] rounded-4xl p-10 bg-pokered glass max-h-[90vh] overflow-y-auto">
                <div className="flex flex-row gap-8">
                    {/* POKEMON CARD */}
                    <section className="flex flex-col items-center gap-6">
                        <figure className="bg-yellow-50 border-8 border-pokeyellow rounded-3xl px-2 basis-1/3">
                            <img
                                src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                                className="drop-shadow-sm hover:translate-y-2 duration-500 hover:scale-105 hover:drop-shadow-xl"
                            />
                        </figure>
                        {/* height & weight */}
                        <div className="stats bg-pokedarkred text-white shadow">
                            <div className="stat">
                                <div className="stat-title text-white">Height</div>
                                <div className="stat-value text-2xl"> {pokemonDetails?.height ? pokemonDetails.height / 10 : "n/a"} m</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title text-white">Weight</div>
                                <div className="stat-value text-2xl"> {pokemonDetails?.weight ? pokemonDetails.weight / 10 : "n/a"} kg</div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button onClick={() => changePokemon(previewedPokemon - 1)} className="btn bg-gray-800 text-white border-0">◀</button>
                            <div className="bg-gray-50 rounded-2xl drop-shadow-lg">
                                <img className="drop-shadow-md" src={pokemonDetails?.sprites.front_default} alt={"sprite of " + pokemonDetails?.name} />
                            </div>
                            <button onClick={() => changePokemon(previewedPokemon + 1)} className="btn bg-gray-800 text-white border-0">▶</button>
                        </div>
                        <div className="flex flex-row grow justify-center items-end w-full gap-2">
                            <div className="text-white text-sm text-center">
                                Click anywhere outside or press <kbd className="kbd text-black">esc</kbd> to exit.
                            </div>
                        </div>
                    </section>

                    {/* POKEMON DETAILS */}
                    <section className="flex flex-col card shadow-sm rounded-4xl bg-pokedarkred/50 p-4 text-white gap-4 basis-2/3">
                        <div className="flex card bg-pokedarkred p-4 px-6 rounded-3xl">

                            {/* pokemon name & id */}
                            <div className="flex flex-row justify-between">
                                <h3 className="font-bold text-4xl"> {pokemonDetails?.name.toUpperCase()}</h3>
                                <div className="flex flex-col justify-start">
                                    <p className="text-lg">#{previewedPokemon}</p>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between gap-3 items-center mt-1">

                                {/* pokemon category */}
                                <p className="text-pokeyellow text-xl italic">{pokemonCategory}</p>
                                {/* pokemon types */}

                                <div className="flex items-start gap-2">
                                    {pokemonDetails?.types.map((type, index) => (
                                        <span key={index} className="text-white rounded-full px-3 py-1 text-md font-semibold"
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
                        <div className="card p-4 bg-pokedarkred rounded-3xl flex flex-col gap-1 px-6">
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
                        <div className="w-full card card-body text-white bg-pokedarkred rounded-3xl gap-0 pt-4">
                            <h4 className="font-bold text-lg">Base Stats</h4>
                            <ul className="list-none">
                                {pokemonDetails?.stats.map((stat, index) => {
                                    const normalizedValue = (stat.base_stat / 255) * 100; // normalize stat before graphing
                                    return (
                                        <li key={index} className="flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="capitalize">{stat.stat.name.replace("-", " ")}:</span>
                                                <span className="font-bold">{stat.base_stat}</span>
                                            </div>
                                            <progress className="progress progress-accent" value={normalizedValue} max="100"></progress>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* evolution chain with images */}
                        <div className="card card-body pt-2 gap-1">
                            <h4 className="font-bold text-lg text-center">Evolution Chain</h4>
                            {evolutionChain.length > 0 ? (
                                <div className="flex flex-row justify-center items-center mt-2">
                                    {evolutionChain.map((evolution, index) => (
                                        <div key={index} className="flex flex-row items-center justify-center">
                                            {/* evolution image */}
                                            <div className="flex flex-col">
                                                <div className={"rounded-full p-3 glass drop-shadow-md" + (pokemonDetails?.name === evolution.name ? " bg-pokeyellow" : " bg-pokeblue")}>

                                                    <img
                                                        src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(evolution.id).padStart(3, "0")}.png`}
                                                        alt={evolution.name}
                                                        className="w-20 h-20 object-contain drop-shadow-md"
                                                    />
                                                </div>
                                                {/* evolution name */}
                                                <p className={"capitalize text-sm text-center mt-1 " + (pokemonDetails?.name === evolution.name ? " font-bold drop-shadow-sm" : " ")}>{evolution.name}</p>
                                            </div>
                                            {/* arrow if there's a next evolution */}
                                            {index < evolutionChain.length - 1 && <span className="text-xl px-2">→</span>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2">no evolution data</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}