import { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon } from "../model/types";
import { typeColors } from "../common/typeColors";
import { getWeakness } from "../common/weakness";
import { Weight, Ruler } from "lucide-react";

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

        // recursive function to iterate thru the evolution chain
        const traverseChain = (node: any) => {
            if (!node) return;
            const speciesURL = node.species.url;
            // extract id from url, slice the last 2 elements, and convert to number
            const id = parseInt(speciesURL.split("/").slice(-2, -1)[0]);
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
        <dialog id="mowdal" className="w-auto modal">

            <div className="modal-box max-w-[1080px] rounded-4xl p-8 px-4 pt-0 sm:p-10 bg-pokered glass max-h-[90vh] overflow-y-auto shadow-xl">
                {/* close button */}
                <div className="sticky z-50 flex flex-row justify-end top-10 sm:hidden">
                    <button
                        onClick={() => (document.getElementById('mowdal') as HTMLDialogElement).close()}
                        className="rounded-full shadow-md btn outline-0 shadow-black/40 outline-transparent">X</button>
                </div>
                <div className="flex flex-col gap-8 sm:flex-row">
                    {/* POKEMON CARD PREVIEW */}
                    <section className="flex flex-col items-center gap-6 h-fit">
                        <figure className="w-full px-2 border-8 bg-yellow-50 border-pokeyellow rounded-3xl basis-1/3">
                            <img
                                src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokeID}.png`}
                                className="duration-500 drop-shadow-sm hover:translate-y-2 hover:scale-105 hover:drop-shadow-xl"
                            />
                        </figure>
                        {/* height & weight */}
                        <div className="text-white shadow stats bg-pokedarkred">
                            <div className="stat">
                                <div className="text-white stat-title">Height</div>
                                <div className="text-xl stat-value sm:text-2xl"> {pokemonDetails?.height ? pokemonDetails.height / 10 : "n/a"} m</div>
                                <div className="stat-figure">
                                    <Weight size={30} />
                                </div>
                            </div>
                            <div className="stat">
                                <div className="text-white stat-title">Weight</div>
                                <div className="text-xl stat-value sm:text-2xl"> {pokemonDetails?.weight ? pokemonDetails.weight / 10 : "n/a"} kg</div>
                                <div className="stat-figure">
                                    <Ruler size={30} />
                                </div>
                            </div>
                        </div>
                        {/* LEFT RIGHT NAVIGATION */}
                        <div className="flex flex-row items-center justify-center gap-4">
                            <button onClick={() => changePokemon(previewedPokemon - 1)} className="text-white bg-gray-800 border-0 btn">◀</button>
                            <div className="bg-gray-50 rounded-2xl drop-shadow-lg">
                                <img className="drop-shadow-md min-h-24 min-w-24" src={pokemonDetails?.sprites.front_default} alt={"sprite of " + pokemonDetails?.name} />
                            </div>
                            <button onClick={() => changePokemon(previewedPokemon + 1)} className="text-white bg-gray-800 border-0 btn">▶</button>
                        </div>
                        <div className="flex flex-row items-end justify-center w-full gap-2 grow">
                            <div className="hidden text-sm text-center text-white sm:block">
                                Click anywhere outside or press <kbd className="text-black kbd"
                                    onClick={() => (document.getElementById('mowdal') as HTMLDialogElement).close()}
                                >esc</kbd> to exit.
                            </div>
                        </div>
                    </section>

                    {/* POKEMON DETAILS */}
                    <section className="flex flex-col gap-4 p-2 text-white shadow-sm card rounded-4xl bg-pokedarkred/50 basis-2/3">
                        <div className="flex p-4 py-6 card bg-pokedarkred rounded-3xl">

                            {/* pokemon name & id */}
                            <div className="flex flex-row flex-wrap justify-between w-full">
                                <h3 className="text-4xl font-bold line-clamp-1"> {pokemonDetails?.name.toUpperCase()}</h3>
                                <div className="flex flex-col justify-start">
                                    <p className="text-lg text-end">#{previewedPokemon}</p>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between gap-3 px-2 mt-1">

                                {/* pokemon category */}
                                <p className="text-xl italic text-pokeyellow">{pokemonCategory}</p>
                                {/* pokemon types */}

                                <div className="flex flex-wrap items-start justify-end gap-2 sm:justify-start">
                                    {pokemonDetails?.types.map((type, index) => (
                                        <span key={index} className="px-3 py-1 font-semibold text-white rounded-full text-md"
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
                        <div className="flex flex-col gap-1 p-4 px-6 card bg-pokedarkred rounded-3xl">
                            <h4 className="text-lg font-bold">Weaknesses</h4>
                            <div className="flex flex-row flex-wrap gap-2 px-2">
                                {/* convert the Types[] to array first; also rearrange alphabetically */}
                                {pokemonDetails?.types && getWeakness(pokemonDetails.types.map((t) => t.type.name)).sort().map((weakness) => (

                                    <span className="px-3 py-1 text-sm font-semibold text-white rounded-full"
                                        style={{ backgroundColor: typeColors[weakness] }}>{weakness}</span>
                                ))}
                            </div>
                        </div>

                        {/* stats */}
                        <div className="w-full gap-0 pt-4 text-white card card-body bg-pokedarkred rounded-3xl">
                            <h4 className="text-lg font-bold">Base Stats</h4>
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
                        <div className="gap-1 pt-2 card card-body">
                            <h4 className="text-lg font-bold text-center">Evolution Chain</h4>
                            {evolutionChain.length > 0 ? (
                                <div className={"flex flex-col items-center justify-center mt-2 sm:flex-row flex-wrap"}>
                                    {evolutionChain.map((evolution, index) => (
                                        <>
                                            <div key={index} className="flex flex-row items-center justify-center mb-4">
                                                {/* evolution image */}
                                                <div className="flex flex-col">
                                                    <div className={"rounded-full p-3 drop-shadow-md" + (pokemonDetails?.name === evolution.name ? " bg-pokeyellow" : " bg-pokeblue")}>
                                                        <img
                                                            src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(evolution.id).padStart(3, "0")}.png`}
                                                            alt={evolution.name}
                                                            className="object-contain w-20 h-20 drop-shadow-md"
                                                        />
                                                    </div>
                                                    {/* evolution name */}
                                                    <p className={"capitalize text-sm text-center mt-1 " + (pokemonDetails?.name === evolution.name ? " font-bold drop-shadow-sm" : " ")}>{evolution.name}</p>
                                                </div>
                                                {/* arrow if theres a next evolution */}
                                                {index < evolutionChain.length - 1 && (
                                                    <span className="hidden px-2 text-xl sm:block">
                                                        {/* special case for eevolutions */}
                                                        {["vaporeon", "jolteon", "flareon", "espeon", "umbreon", "leafeon", "glaceon", "sylveon"].includes(evolution.name.toLowerCase()) ? "or" : "→"}
                                                    </span>
                                                )}
                                            </div>
                                            {index < evolutionChain.length - 1 && <span className="px-2 mb-4 text-xl sm:hidden">
                                                {["vaporeon", "jolteon", "flareon", "espeon", "umbreon", "leafeon", "glaceon", "sylveon"].includes(evolution.name.toLowerCase()) ? "or" : "↓"}
                                    
                                                </span>}</>
                                            
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