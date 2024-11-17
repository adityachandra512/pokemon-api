import React, { useState, useEffect } from 'react';
import './styles.css';
import image from '../public/1_lXH0CroMTAQKIfDzn-brPw-removebg-preview.png';
import { FaSearch } from 'react-icons/fa';
const colors = {
  fire: 'orange',
  grass: 'lightgreen',
  electric: 'yellow',
  water: '#70ffea',
  ground: 'darkgrey',
  rock: 'grey',
  fairy: 'pink',
  poison: 'greenyellow',
  bug: '#94ecbe',
  dragon: 'orange',
  psychic: '#7c7db6',
  flying: '#fcca46',
  fighting: 'darkgrey',
  normal: 'lightgrey',
  ice: '#00f2f2',
  dark: '#4f7ecf',
  ghost: '#7685a7',
  steel: 'steelblue',
};

const mainTypes = Object.keys(colors);

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [cachedPokemons, setCachedPokemons] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const pokemonsPerPage = 10;
  const totalPokemons = 1010;

  useEffect(() => {
    const preLoadPages = async () => {
      setLoading(true);
      const pagesToFetch = [
        currentPage,
        Math.max(1, currentPage - 1),
        Math.min(Math.ceil(totalPokemons / pokemonsPerPage), currentPage + 1),
      ];

      const newCache = { ...cachedPokemons };
      for (const page of pagesToFetch) {
        if (!newCache[page]) {
          const pageData = await fetchPokemonPage(page);
          newCache[page] = pageData;
        }
      }

      setPokemons(newCache[currentPage] || []);
      setCachedPokemons(newCache);
      setLoading(false);
    };

    preLoadPages();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPokemons(pokemons);
    } else {
      const filtered = pokemons.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemons(filtered);
    }
  }, [searchTerm, pokemons]);

  const fetchPokemonPage = async (page) => {
    const start = (page - 1) * pokemonsPerPage + 1;
    const end = Math.min(start + pokemonsPerPage - 1, totalPokemons);

    const fetchPromises = [];
    for (let i = start; i <= end; i++) {
      fetchPromises.push(getPokemon(i));
    }

    try {
      const pokemonArray = await Promise.all(fetchPromises);
      return pokemonArray.filter((pokemon) => pokemon);
    } catch (err) {
      console.error('Error fetching Pokémon page:', err);
      return [];
    }
  };

  const toggleSearchBar = () => {
    setIsSearchBarOpen(!isSearchBarOpen);
  };



  const getPokemon = async (id) => {
    try {
      const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching Pokémon ID ${id}:`, err);
    }
  };

  const getPokemonType = (pokeTypes) => {
    if (pokeTypes.length === 1) {
      return pokeTypes[0][0].toUpperCase() + pokeTypes[0].slice(1);
    } else {
      const pokeType1 = pokeTypes[0][0].toUpperCase() + pokeTypes[0].slice(1);
      const pokeType2 = pokeTypes[1][0].toUpperCase() + pokeTypes[1].slice(1);
      return `${pokeType1} / ${pokeType2}`;
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(totalPokemons / pokemonsPerPage)) {
      setCurrentPage(pageNumber);
      setInputPage(pageNumber);
    }
  };

  const handleInputChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= Math.ceil(totalPokemons / pokemonsPerPage)) {
      setInputPage(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      paginate(inputPage);
    }
  };

  return (
    <div className="App">
      <header
  className="header-container"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
  }}
>
  <img
    src="https://1000logos.net/wp-content/uploads/2017/05/Pokemon-Logo.png"
    alt="Pokemon Logo"
    className="pokemon-logo"
  /><div
  className="search-bar-wrapper"
  style={{
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  }}
>
  {!isSearchBarOpen && (
    <FaSearch
      onClick={toggleSearchBar}
      style={{
        cursor: 'pointer',
        fontSize: '1.5rem',
        color: '#007BFF',
      }}
    />
  )}

  {isSearchBarOpen && (
    <div
      className="search-bar-container"
      style={{
        marginLeft: 'auto',
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <input
        type="text"
        placeholder={loading ? 'Loading Pokémon...' : 'Search Pokémon by name...'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }}
      />
      <button
        onClick={toggleSearchBar}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#007BFF',
        }}
        aria-label="Close Search"
      >
        ✖
      </button>
    </div>
  )}
</div>
</header>

      <div className="poke-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          filteredPokemons.map((pokemon) => {
            const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
            const id = pokemon.id.toString().padStart(3, '0');
            const pokeTypes = pokemon.types.map((typeKind) => typeKind.type.name);
            const image = pokemon.sprites.front_default || '/fallback-image.png';
            const type = mainTypes.find((type) => pokeTypes.indexOf(type) > -1);
            const color = colors[type];

            return (
              <div key={id} className="pokemon" style={{ border: `2px solid ${color}` }}>
                <span className="number">#{id}</span>
                <div className="img-container">
                  <img loading="lazy" src={image} alt={name} />
                </div>
                <div className="info">
                  <h3 className="name">{name}</h3>
                  <div className="type-data">
                    <small>Type:</small>
                    <h5 className="type">{getPokemonType(pokeTypes)}</h5>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div className="pagination">
        <div
          onClick={() => paginate(currentPage - 1)}
          style={{
            cursor: currentPage === 1 || loading ? 'not-allowed' : 'pointer',
            color: currentPage === 1 || loading ? '#ccc' : '#007BFF',
            fontSize: '1.2rem',
            opacity: currentPage === 1 || loading ? 0.6 : 1,
            pointerEvents: currentPage === 1 || loading ? 'none' : 'auto',
          }}
          aria-label="Previous Page"
        >
          ⬅️ Previous
        </div>
        <input
            type="number"
            min="1"
            max={Math.ceil(totalPokemons / pokemonsPerPage)}
            value={inputPage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            aria-label="Page Number Input"
          />
        <div
          onClick={() => paginate(currentPage + 1)}
          style={{
            cursor:
              currentPage === Math.ceil(totalPokemons / pokemonsPerPage) || loading
                ? 'not-allowed'
                : 'pointer',
            color:
              currentPage === Math.ceil(totalPokemons / pokemonsPerPage) || loading
                ? '#ccc'
                : '#007BFF',
            fontSize: '1.2rem',
            opacity:
              currentPage === Math.ceil(totalPokemons / pokemonsPerPage) || loading
                ? 0.6
                : 1,
            pointerEvents:
              currentPage === Math.ceil(totalPokemons / pokemonsPerPage) || loading
                ? 'none'
                : 'auto',
          }}
          aria-label="Next Page"
        >
          Next ➡️
        </div>
          <span>
            Page {currentPage} of {Math.ceil(totalPokemons / pokemonsPerPage)}
          </span>
        </div>
      </div>
      <footer>
        <span>Source: </span>
        <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className=''>
        <img src={image} alt="" height={50} width={200} />
        </a>
      </footer>
    </div>
  );
}

export default App;
