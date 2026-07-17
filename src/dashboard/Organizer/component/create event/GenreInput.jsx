import { FiX } from "react-icons/fi";

const GenreInput = ({
  genres,
  setGenres,
  genreInput,
  setGenreInput,
}) => {

  const addGenre = () => {
    const value = genreInput.trim();

    if (!value) return;

    if (genres.includes(value)) return;

    setGenres([...genres, value]);

    setGenreInput("");
  };

  const removeGenre = (genre) => {
    setGenres(
      genres.filter((item) => item !== genre)
    );
  };

  return (
    <div className="space-y-4">

      <div>

        <label className="font-semibold text-lg">
          What should attendees expect?
        </label>

        <p className="text-xs opacity-70 mt-1">
          Press Enter after each item.
        </p>

      </div>

      <input
        value={genreInput}
        onChange={(e)=>setGenreInput(e.target.value)}
        onKeyDown={(e)=>{
          if(e.key==="Enter"){
            e.preventDefault();
            addGenre();
          }
        }}
        placeholder="Afrobeats"
        className="w-full rounded-xl border border-(--border) p-4"
      />

      <div className="flex flex-wrap gap-2">

        {genres.map((genre)=>(
          <div
            key={genre}
            className="bg-(--primary) text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            {genre}

            <button
              type="button"
              onClick={()=>removeGenre(genre)}
            >
              <FiX/>
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}

export default GenreInput;