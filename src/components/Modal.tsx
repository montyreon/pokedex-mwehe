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

    return (
        <dialog id="my_modal_2" className="modal">
            <div className="modal-box rounded-4xl p-10">
                {/* pokemon name & id */}
                <h3 className="font-bold text-2xl">#{selectedPokemon} {pokemonDetails?.name.toUpperCase()}</h3>

                {/* pokemon category */}
                <p className="text-gray-600 italic">{pokemonCategory}</p>

                {/* pokemon description */}
                <p className="py-4">{pokemonDescription}</p>

                {/* pokemon types */}
                <div className="flex gap-2 mb-4">
                    {pokemonDetails?.types.map((type, index) => (
                        <span key={index} className="text-white rounded-full px-3 py-1 text-sm font-semibold"
                            style={{ backgroundColor: typeColors[type.type.name] }}>
                            {type.type.name}
                        </span>
                    ))}
                </div>

                {/* weaknesses */}
                <div className="mt-4">
                    <h4 className="font-bold text-lg">weaknesses</h4>
                    <ul className="list-none mt-2">
                        {/* convert the Types[] to array first; also rearrange alphabetically */}
                        {pokemonDetails?.types && getWeakness(pokemonDetails.types.map((t) => t.type.name)).sort().map((weakness, index) => (
                            <li key={index} className="flex justify-between">
                                <span className="capitalize">{weakness}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* height & weight */}
                <div className="mt-4">
                    <h4 className="font-bold text-lg">physical attributes</h4>
                    <p><strong>height:</strong> {pokemonDetails?.height ? pokemonDetails.height / 10 : "n/a"} m</p>
                    <p><strong>weight:</strong> {pokemonDetails?.weight ? pokemonDetails.weight / 10 : "n/a"} kg</p>
                </div>

                {/* stats */}
                <div className="mt-4">
                    <h4 className="font-bold text-lg">base stats</h4>
                    <ul className="list-none mt-2">
                        {pokemonDetails?.stats.map((stat, index) => (
                            <li key={index} className="flex justify-between">
                                <span className="capitalize">{stat.stat.name.replace("-", " ")}:</span>
                                <span className="font-bold">{stat.base_stat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* evolution chain with images */}
                <div className="mt-4">
                    <h4 className="font-bold text-lg">evolution chain</h4>
                    {evolutionChain.length > 0 ? (
                        <div className="flex flex-row items-center gap-4 mt-2">
                            {evolutionChain.map((evolution, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    {/* evolution image */}
                                    <img
                                        src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(evolution.id).padStart(3, "0")}.png`}
                                        alt={evolution.name}
                                        className="w-20 h-20 object-contain"
                                    />
                                    {/* evolution name */}
                                    <p className="capitalize text-sm">{evolution.name}</p>
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

            {/* close button */}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}